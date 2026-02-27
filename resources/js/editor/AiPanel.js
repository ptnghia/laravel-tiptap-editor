/**
 * Tiptap Editor – AI Content Generation Panel
 *
 * Provides a slide-out panel for AI-powered content generation.
 * Supports: generate, refine, summarize, translate actions.
 * Communicates with the Laravel backend via REST API.
 */

/**
 * @typedef {Object} AiPanelConfig
 * @property {boolean} enabled - Whether AI is enabled
 * @property {string} generateUrl - URL for generate endpoint
 * @property {string} refineUrl - URL for refine endpoint
 * @property {string} summarizeUrl - URL for summarize endpoint
 * @property {string} translateUrl - URL for translate endpoint
 * @property {string} csrfToken - CSRF token for requests
 */

/**
 * AI action definitions with labels and descriptions.
 */
const AI_ACTIONS = {
  generate: {
    label: 'Generate',
    icon: 'stars',
    description: 'Generate new content from a prompt',
    placeholder: 'Describe the content you want to generate...',
    requiresContent: false,
  },
  refine: {
    label: 'Refine',
    icon: 'pencil-square',
    description: 'Rewrite or improve existing content',
    placeholder: 'How should the content be improved? (e.g., "make it more formal")',
    requiresContent: true,
  },
  summarize: {
    label: 'Summarize',
    icon: 'list-columns-reverse',
    description: 'Create a concise summary',
    placeholder: 'Any specific instructions for the summary?',
    requiresContent: true,
  },
  translate: {
    label: 'Translate',
    icon: 'translate',
    description: 'Translate content to another language',
    placeholder: 'Enter target language (e.g., Vietnamese, Japanese, French)',
    requiresContent: true,
  },
};

/**
 * Maximum number of recent prompts to store in localStorage.
 */
const MAX_RECENT_PROMPTS = 10;

/**
 * localStorage key for recent prompts.
 */
const STORAGE_KEY = 'tiptap_ai_recent_prompts';

export default class AiPanel {
  /**
   * @param {import('./Editor').default} editorInstance - The parent TiptapEditor instance
   * @param {AiPanelConfig} config - AI configuration
   */
  constructor(editorInstance, config = {}) {
    /** @type {import('./Editor').default} */
    this.editorInstance = editorInstance;

    /** @type {AiPanelConfig} */
    this.config = config;

    /** @type {HTMLElement|null} */
    this.panelElement = null;

    /** @type {string} */
    this.currentAction = 'generate';

    /** @type {boolean} */
    this.isOpen = false;

    /** @type {boolean} */
    this.isLoading = false;

    /** @type {string|null} */
    this.previewContent = null;

    /** @type {AbortController|null} */
    this._abortController = null;

    this._build();
  }

  /**
   * Build the AI panel DOM structure.
   * @private
   */
  _build() {
    this.panelElement = document.createElement('div');
    this.panelElement.className = 'tiptap-ai-panel';
    this.panelElement.setAttribute('role', 'dialog');
    this.panelElement.setAttribute('aria-label', 'AI Content Generation');
    this.panelElement.innerHTML = this._getTemplate();

    // Cache DOM references
    this._els = {
      actionButtons: this.panelElement.querySelectorAll('[data-ai-action]'),
      promptArea: this.panelElement.querySelector('[data-ai-prompt]'),
      submitBtn: this.panelElement.querySelector('[data-ai-submit]'),
      cancelBtn: this.panelElement.querySelector('[data-ai-cancel]'),
      closeBtn: this.panelElement.querySelector('[data-ai-close]'),
      previewArea: this.panelElement.querySelector('[data-ai-preview]'),
      previewContent: this.panelElement.querySelector('[data-ai-preview-content]'),
      insertBtn: this.panelElement.querySelector('[data-ai-insert]'),
      regenerateBtn: this.panelElement.querySelector('[data-ai-regenerate]'),
      discardBtn: this.panelElement.querySelector('[data-ai-discard]'),
      statusArea: this.panelElement.querySelector('[data-ai-status]'),
      statusText: this.panelElement.querySelector('[data-ai-status-text]'),
      inputSection: this.panelElement.querySelector('[data-ai-input-section]'),
      resultSection: this.panelElement.querySelector('[data-ai-result-section]'),
      recentList: this.panelElement.querySelector('[data-ai-recent]'),
      actionDescription: this.panelElement.querySelector('[data-ai-action-desc]'),
    };

    this._bindEvents();

    // Insert panel into the editor wrapper
    this.editorInstance.wrapper.appendChild(this.panelElement);
  }

  /**
   * Get the panel HTML template.
   * @private
   * @returns {string}
   */
  _getTemplate() {
    const actionButtons = Object.entries(AI_ACTIONS)
      .map(
        ([key, action]) =>
          `<button type="button" class="tiptap-ai-panel__action-btn${key === 'generate' ? ' active' : ''}" data-ai-action="${key}" title="${action.description}">
          <i class="bi bi-${action.icon}"></i> ${action.label}
        </button>`
      )
      .join('');

    return `
      <div class="tiptap-ai-panel__header">
        <span class="tiptap-ai-panel__title">
          <i class="bi bi-stars"></i> AI Assistant
        </span>
        <button type="button" class="tiptap-ai-panel__close-btn" data-ai-close aria-label="Close AI Panel">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div class="tiptap-ai-panel__body">
        <div class="tiptap-ai-panel__actions">
          ${actionButtons}
        </div>

        <p class="tiptap-ai-panel__action-desc" data-ai-action-desc>
          ${AI_ACTIONS.generate.description}
        </p>

        <!-- Input Section -->
        <div class="tiptap-ai-panel__input-section" data-ai-input-section>
          <textarea
            class="tiptap-ai-panel__prompt"
            data-ai-prompt
            rows="4"
            placeholder="${AI_ACTIONS.generate.placeholder}"
          ></textarea>

          <div class="tiptap-ai-panel__recent" data-ai-recent></div>

          <div class="tiptap-ai-panel__controls">
            <button type="button" class="btn btn-primary btn-sm" data-ai-submit>
              <i class="bi bi-stars"></i> Generate
            </button>
            <button type="button" class="btn btn-outline-secondary btn-sm" data-ai-cancel style="display:none;">
              Cancel
            </button>
          </div>
        </div>

        <!-- Status -->
        <div class="tiptap-ai-panel__status" data-ai-status style="display:none;">
          <div class="spinner-border spinner-border-sm text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <span data-ai-status-text>Generating content...</span>
        </div>

        <!-- Result Section -->
        <div class="tiptap-ai-panel__result-section" data-ai-result-section style="display:none;">
          <div class="tiptap-ai-panel__preview" data-ai-preview>
            <div class="tiptap-ai-panel__preview-content" data-ai-preview-content></div>
          </div>
          <div class="tiptap-ai-panel__result-controls">
            <button type="button" class="btn btn-success btn-sm" data-ai-insert>
              <i class="bi bi-check-lg"></i> Insert
            </button>
            <button type="button" class="btn btn-outline-primary btn-sm" data-ai-regenerate>
              <i class="bi bi-arrow-clockwise"></i> Regenerate
            </button>
            <button type="button" class="btn btn-outline-danger btn-sm" data-ai-discard>
              <i class="bi bi-trash"></i> Discard
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Bind DOM event listeners.
   * @private
   */
  _bindEvents() {
    // Action buttons
    this._els.actionButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        this._setAction(btn.dataset.aiAction);
      });
    });

    // Submit
    this._els.submitBtn.addEventListener('click', () => this._submit());

    // Cancel
    this._els.cancelBtn.addEventListener('click', () => this._cancelRequest());

    // Close
    this._els.closeBtn.addEventListener('click', () => this.close());

    // Insert result
    this._els.insertBtn.addEventListener('click', () => this._insertResult());

    // Regenerate
    this._els.regenerateBtn.addEventListener('click', () => this._submit());

    // Discard
    this._els.discardBtn.addEventListener('click', () => this._showInput());

    // Keyboard: Ctrl+Enter to submit
    this._els.promptArea.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        this._submit();
      }
      if (e.key === 'Escape') {
        this.close();
      }
    });
  }

  /**
   * Open the AI panel.
   */
  open() {
    this.isOpen = true;
    this.panelElement.classList.add('tiptap-ai-panel--open');
    this._showInput();
    this._loadRecentPrompts();
    this._els.promptArea.focus();
  }

  /**
   * Close the AI panel.
   */
  close() {
    this.isOpen = false;
    this.panelElement.classList.remove('tiptap-ai-panel--open');
    this._cancelRequest();
    this.previewContent = null;
  }

  /**
   * Toggle the AI panel open/close.
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Set the active action.
   * @param {string} action
   * @private
   */
  _setAction(action) {
    this.currentAction = action;
    const actionDef = AI_ACTIONS[action];

    // Update button active states
    this._els.actionButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.aiAction === action);
    });

    // Update placeholder and description
    this._els.promptArea.placeholder = actionDef.placeholder;
    this._els.actionDescription.textContent = actionDef.description;
    this._els.submitBtn.innerHTML = `<i class="bi bi-${actionDef.icon}"></i> ${actionDef.label}`;

    // Show input section
    this._showInput();
  }

  /**
   * Submit the AI request.
   * @private
   */
  async _submit() {
    const prompt = this._els.promptArea.value.trim();
    if (!prompt) {
      this._els.promptArea.classList.add('is-invalid');
      this._els.promptArea.focus();
      return;
    }
    this._els.promptArea.classList.remove('is-invalid');

    const action = this.currentAction;
    const actionDef = AI_ACTIONS[action];

    // For actions that require content, get it from the editor
    let requestBody = { prompt, action };

    if (actionDef.requiresContent) {
      const editor = this.editorInstance.editor;
      const selectedHtml = this._getSelectedHtml();
      const content = selectedHtml || editor.getHTML();

      if (!content || content === '<p></p>') {
        this._showError('No content available. Please write or select some content first.');
        return;
      }

      requestBody.content = content;

      if (action === 'translate') {
        requestBody.target_lang = prompt;
      }
    }

    // Save to recent prompts
    this._saveRecentPrompt(prompt);

    // Show loading state
    this._showLoading();

    try {
      this._abortController = new AbortController();

      const url = this._getEndpointUrl(action);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': this.config.csrfToken || this._getCsrfToken(),
        },
        body: JSON.stringify(requestBody),
        signal: this._abortController.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || errorData.message || `Request failed (${response.status})`;
        throw new Error(errorMsg);
      }

      const data = await response.json();

      if (data.success && data.data?.content) {
        this.previewContent = data.data.content;
        this._showResult(data.data);
      } else {
        throw new Error(data.error || 'No content received from AI.');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        this._showInput();
        return;
      }
      this._showError(error.message);
    } finally {
      this._abortController = null;
    }
  }

  /**
   * Cancel the current request.
   * @private
   */
  _cancelRequest() {
    if (this._abortController) {
      this._abortController.abort();
      this._abortController = null;
    }
    this.isLoading = false;
  }

  /**
   * Insert the AI-generated result into the editor.
   * @private
   */
  _insertResult() {
    if (!this.previewContent) return;

    const editor = this.editorInstance.editor;
    const action = this.currentAction;

    if (action === 'refine' || action === 'translate') {
      // Replace selected content or all content
      const { from, to } = editor.state.selection;
      if (from !== to) {
        // Replace selection
        editor.chain().focus().deleteSelection().insertContent(this.previewContent).run();
      } else {
        // Replace all content
        editor.commands.setContent(this.previewContent);
      }
    } else {
      // Insert at cursor position
      editor.chain().focus().insertContent(this.previewContent).run();
    }

    this.previewContent = null;
    this.close();
  }

  /**
   * Show the input section, hide result.
   * @private
   */
  _showInput() {
    this._els.inputSection.style.display = '';
    this._els.resultSection.style.display = 'none';
    this._els.statusArea.style.display = 'none';
    this._els.submitBtn.style.display = '';
    this._els.cancelBtn.style.display = 'none';
    this._els.submitBtn.disabled = false;
    this.isLoading = false;
  }

  /**
   * Show loading state.
   * @private
   */
  _showLoading() {
    this.isLoading = true;
    this._els.statusArea.style.display = 'flex';
    this._els.statusText.textContent = 'Generating content...';
    this._els.submitBtn.style.display = 'none';
    this._els.cancelBtn.style.display = '';
    this._els.resultSection.style.display = 'none';
  }

  /**
   * Show the result section with preview.
   * @param {Object} data - Response data from AI
   * @private
   */
  _showResult(data) {
    this.isLoading = false;
    this._els.statusArea.style.display = 'none';
    this._els.inputSection.style.display = 'none';
    this._els.resultSection.style.display = '';

    // Render preview (sanitized – the content is HTML from AI)
    this._els.previewContent.innerHTML = data.content;

    // Show tokens used if available
    if (data.tokens_used) {
      const tokenInfo = document.createElement('small');
      tokenInfo.className = 'text-muted d-block mt-1';
      tokenInfo.textContent = `Tokens used: ${data.tokens_used} | Provider: ${data.provider} | Model: ${data.model}`;
      this._els.previewContent.appendChild(tokenInfo);
    }

    if (data.truncated) {
      const warning = document.createElement('div');
      warning.className = 'alert alert-warning alert-sm mt-2 py-1 px-2';
      warning.textContent = 'Content may be incomplete due to token limits.';
      this._els.previewContent.appendChild(warning);
    }
  }

  /**
   * Show an error message.
   * @param {string} message
   * @private
   */
  _showError(message) {
    this.isLoading = false;
    this._els.statusArea.style.display = 'flex';
    this._els.statusArea.querySelector('.spinner-border')?.remove();
    this._els.statusText.textContent = `Error: ${message}`;
    this._els.statusText.classList.add('text-danger');
    this._els.cancelBtn.style.display = 'none';
    this._els.submitBtn.style.display = '';
    this._els.submitBtn.disabled = false;

    // Auto-clear error after 5 seconds
    setTimeout(() => {
      this._els.statusText.classList.remove('text-danger');
      this._showInput();
    }, 5000);
  }

  /**
   * Get the selected HTML from the editor.
   * @returns {string|null}
   * @private
   */
  _getSelectedHtml() {
    const editor = this.editorInstance.editor;
    const { from, to } = editor.state.selection;
    if (from === to) return null;

    // Get selected slice as HTML
    const slice = editor.state.doc.slice(from, to);
    const div = document.createElement('div');
    const fragment = editor.view.domSerializer.serializeFragment(slice.content);
    div.appendChild(fragment);
    return div.innerHTML;
  }

  /**
   * Get the endpoint URL for an action.
   * @param {string} action
   * @returns {string}
   * @private
   */
  _getEndpointUrl(action) {
    const urlMap = {
      generate: this.config.generateUrl,
      refine: this.config.refineUrl,
      summarize: this.config.summarizeUrl,
      translate: this.config.translateUrl,
    };

    return urlMap[action] || this.config.generateUrl;
  }

  /**
   * Get CSRF token from meta tag.
   * @returns {string}
   * @private
   */
  _getCsrfToken() {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute('content') : '';
  }

  /**
   * Save a prompt to recent prompts in localStorage.
   * @param {string} prompt
   * @private
   */
  _saveRecentPrompt(prompt) {
    try {
      let recent = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      recent = recent.filter((p) => p !== prompt);
      recent.unshift(prompt);
      recent = recent.slice(0, MAX_RECENT_PROMPTS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
      this._loadRecentPrompts();
    } catch {
      // localStorage not available
    }
  }

  /**
   * Load and render recent prompts.
   * @private
   */
  _loadRecentPrompts() {
    try {
      const recent = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (recent.length === 0) {
        this._els.recentList.innerHTML = '';
        return;
      }

      const items = recent
        .slice(0, 5)
        .map(
          (p) =>
            `<button type="button" class="tiptap-ai-panel__recent-item" title="${this._escapeAttr(p)}">${this._truncate(p, 50)}</button>`
        )
        .join('');

      this._els.recentList.innerHTML = `
        <div class="tiptap-ai-panel__recent-label">Recent:</div>
        ${items}
      `;

      // Bind click handlers
      this._els.recentList.querySelectorAll('.tiptap-ai-panel__recent-item').forEach((btn, i) => {
        btn.addEventListener('click', () => {
          this._els.promptArea.value = recent[i];
          this._els.promptArea.focus();
        });
      });
    } catch {
      // localStorage not available
    }
  }

  /**
   * Truncate a string.
   * @param {string} str
   * @param {number} max
   * @returns {string}
   * @private
   */
  _truncate(str, max) {
    return str.length > max ? str.substring(0, max) + '...' : str;
  }

  /**
   * Escape a string for use in an HTML attribute.
   * @param {string} str
   * @returns {string}
   * @private
   */
  _escapeAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /**
   * Destroy the AI panel and clean up.
   */
  destroy() {
    this._cancelRequest();
    if (this.panelElement && this.panelElement.parentNode) {
      this.panelElement.parentNode.removeChild(this.panelElement);
    }
    this.panelElement = null;
    this._els = null;
  }
}
