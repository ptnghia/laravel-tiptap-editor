/**
 * Tiptap Editor – Toolbar Manager
 *
 * Renders toolbar buttons based on configuration,
 * manages active states, and dispatches editor commands.
 */

import { ImageModal } from './ImageModal.js';
import { LinkModal } from './LinkModal.js';
import { VideoModal } from './VideoModal.js';
import { TableModal } from './TableModal.js';
import { ButtonModal } from './ButtonModal.js';
import { CardModal } from './CardModal.js';
import { GalleryModal } from './GalleryModal.js';
import { LayoutModal } from './LayoutModal.js';

/**
 * Button definition: maps a toolbar button ID to its editor command, icon, and label.
 * @typedef {Object} ButtonDef
 * @property {string} icon - Bootstrap Icons class name (without 'bi-' prefix)
 * @property {string} label - Accessible label / tooltip
 * @property {string} command - Editor command to execute
 * @property {Object} [commandArgs] - Arguments for the command
 * @property {Function} [isActive] - Custom function to check active state
 * @property {string} [type] - 'button' (default), 'dropdown', 'separator'
 */

/** @type {Object.<string, ButtonDef>} */
const BUTTON_DEFINITIONS = {
  // ── Text Formatting ──────────────────
  bold: {
    icon: 'type-bold',
    label: 'Bold',
    command: 'toggleBold',
    isActive: (editor) => editor.isActive('bold'),
  },
  italic: {
    icon: 'type-italic',
    label: 'Italic',
    command: 'toggleItalic',
    isActive: (editor) => editor.isActive('italic'),
  },
  underline: {
    icon: 'type-underline',
    label: 'Underline',
    command: 'toggleUnderline',
    isActive: (editor) => editor.isActive('underline'),
  },
  strike: {
    icon: 'type-strikethrough',
    label: 'Strikethrough',
    command: 'toggleStrike',
    isActive: (editor) => editor.isActive('strike'),
  },
  subscript: {
    icon: 'subscript',
    label: 'Subscript',
    command: 'toggleSubscript',
    isActive: (editor) => editor.isActive('subscript'),
  },
  superscript: {
    icon: 'superscript',
    label: 'Superscript',
    command: 'toggleSuperscript',
    isActive: (editor) => editor.isActive('superscript'),
  },

  // ── Headings ─────────────────────────
  h1: {
    icon: 'type-h1',
    label: 'Heading 1',
    command: 'toggleHeading',
    commandArgs: { level: 1 },
    isActive: (editor) => editor.isActive('heading', { level: 1 }),
  },
  h2: {
    icon: 'type-h2',
    label: 'Heading 2',
    command: 'toggleHeading',
    commandArgs: { level: 2 },
    isActive: (editor) => editor.isActive('heading', { level: 2 }),
  },
  h3: {
    icon: 'type-h3',
    label: 'Heading 3',
    command: 'toggleHeading',
    commandArgs: { level: 3 },
    isActive: (editor) => editor.isActive('heading', { level: 3 }),
  },
  h4: {
    icon: 'type-h4',
    label: 'Heading 4',
    command: 'toggleHeading',
    commandArgs: { level: 4 },
    isActive: (editor) => editor.isActive('heading', { level: 4 }),
  },

  // ── Text Alignment ──────────────────
  alignLeft: {
    icon: 'text-left',
    label: 'Align Left',
    command: 'setTextAlign',
    commandArgs: 'left',
    isActive: (editor) => editor.isActive({ textAlign: 'left' }),
  },
  alignCenter: {
    icon: 'text-center',
    label: 'Align Center',
    command: 'setTextAlign',
    commandArgs: 'center',
    isActive: (editor) => editor.isActive({ textAlign: 'center' }),
  },
  alignRight: {
    icon: 'text-right',
    label: 'Align Right',
    command: 'setTextAlign',
    commandArgs: 'right',
    isActive: (editor) => editor.isActive({ textAlign: 'right' }),
  },
  alignJustify: {
    icon: 'justify',
    label: 'Justify',
    command: 'setTextAlign',
    commandArgs: 'justify',
    isActive: (editor) => editor.isActive({ textAlign: 'justify' }),
  },

  // ── Lists ────────────────────────────
  bulletList: {
    icon: 'list-ul',
    label: 'Bullet List',
    command: 'toggleBulletList',
    isActive: (editor) => editor.isActive('bulletList'),
  },
  orderedList: {
    icon: 'list-ol',
    label: 'Ordered List',
    command: 'toggleOrderedList',
    isActive: (editor) => editor.isActive('orderedList'),
  },

  // ── Block Elements ───────────────────
  blockquote: {
    icon: 'blockquote-left',
    label: 'Blockquote',
    command: 'toggleBlockquote',
    isActive: (editor) => editor.isActive('blockquote'),
  },
  codeBlock: {
    icon: 'code-square',
    label: 'Code Block',
    command: 'toggleCodeBlock',
    isActive: (editor) => editor.isActive('codeBlock'),
  },
  horizontalRule: {
    icon: 'hr',
    label: 'Horizontal Rule',
    command: 'setHorizontalRule',
  },

  // ── Insert ───────────────────────────
  link: {
    icon: 'link-45deg',
    label: 'Link',
    command: '_promptLink',
    isActive: (editor) => editor.isActive('link'),
  },
  image: {
    icon: 'image',
    label: 'Image',
    command: '_promptImage',
  },
  table: {
    icon: 'table',
    label: 'Table',
    command: '_promptTable',
  },

  // ── History ──────────────────────────
  undo: {
    icon: 'arrow-counterclockwise',
    label: 'Undo',
    command: 'undo',
  },
  redo: {
    icon: 'arrow-clockwise',
    label: 'Redo',
    command: 'redo',
  },

  // ── Format ───────────────────────────
  color: {
    icon: 'palette',
    label: 'Text Color',
    command: '_promptColor',
    type: 'color',
  },
  highlight: {
    icon: 'highlighter',
    label: 'Highlight',
    command: 'toggleHighlight',
    isActive: (editor) => editor.isActive('highlight'),
  },

  // ── Layout ───────────────────────────
  row: {
    icon: 'layout-split',
    label: 'Insert Layout',
    command: '_showLayoutDropdown',
    type: 'dropdown',
    isActive: (editor) => editor.isActive('bootstrapRow'),
  },
  addColumn: {
    icon: 'plus-square',
    label: 'Add Column',
    command: 'addColumnToRow',
  },
  removeColumn: {
    icon: 'dash-square',
    label: 'Remove Column',
    command: 'removeColumn',
  },
  deleteRow: {
    icon: 'trash',
    label: 'Delete Row',
    command: 'deleteBootstrapRow',
  },

  // ── Components ───────────────────────
  alert: {
    icon: 'exclamation-triangle',
    label: 'Insert Alert',
    command: '_showAlertDropdown',
    type: 'dropdown',
    isActive: (editor) => editor.isActive('bootstrapAlert'),
  },
  card: {
    icon: 'card-heading',
    label: 'Insert Card',
    command: '_insertCard',
    isActive: (editor) => editor.isActive('bootstrapCard'),
  },
  button: {
    icon: 'hand-index',
    label: 'Insert Button',
    command: '_insertButton',
  },

  // ── Media ────────────────────────────
  video: {
    icon: 'play-btn',
    label: 'Video',
    command: '_promptVideo',
  },
  gallery: {
    icon: 'images',
    label: 'Gallery',
    command: '_promptGallery',
  },

  // ── AI ───────────────────────────────
  ai: {
    icon: 'stars',
    label: 'AI Assistant',
    command: '_toggleAiPanel',
    type: 'button',
  },

  // ── Utilities ────────────────────────
  darkMode: {
    icon: 'moon-fill',
    label: 'Toggle Dark Mode',
    command: '_toggleDarkMode',
  },
  shortcuts: {
    icon: 'keyboard',
    label: 'Keyboard Shortcuts',
    command: '_showShortcuts',
  },
};

/**
 * Layout presets for the dropdown menu.
 */
const LAYOUT_PRESET_OPTIONS = [
  { id: '1-col',  label: '1 Column',         icon: '[ 12 ]' },
  { id: '2-col',  label: '2 Columns',        icon: '[ 6 | 6 ]' },
  { id: '3-col',  label: '3 Columns',        icon: '[ 4 | 4 | 4 ]' },
  { id: '4-col',  label: '4 Columns',        icon: '[ 3 | 3 | 3 | 3 ]' },
  { id: '1-2',    label: 'Sidebar Left',     icon: '[ 4 | 8 ]' },
  { id: '2-1',    label: 'Sidebar Right',    icon: '[ 8 | 4 ]' },
  { id: '1-1-2',  label: '2 Narrow + Wide',  icon: '[ 3 | 3 | 6 ]' },
  { id: '2-1-1',  label: 'Wide + 2 Narrow',  icon: '[ 6 | 3 | 3 ]' },
];

/**
 * Alert type options for the dropdown menu.
 */
const ALERT_TYPE_OPTIONS = [
  { id: 'primary',   label: 'Primary',   color: '#0d6efd' },
  { id: 'secondary', label: 'Secondary', color: '#6c757d' },
  { id: 'success',   label: 'Success',   color: '#198754' },
  { id: 'danger',    label: 'Danger',    color: '#dc3545' },
  { id: 'warning',   label: 'Warning',   color: '#ffc107' },
  { id: 'info',      label: 'Info',      color: '#0dcaf0' },
  { id: 'light',     label: 'Light',     color: '#f8f9fa' },
  { id: 'dark',      label: 'Dark',      color: '#212529' },
];

export default class Toolbar {
  /**
   * @param {HTMLElement} toolbarElement - The [data-tiptap-toolbar] element
   * @param {import('@tiptap/core').Editor} editor - Tiptap editor instance
   * @param {Object} config - Toolbar config with groups
   */
  constructor(toolbarElement, editor, config = {}) {
    this.element = toolbarElement;
    this.editor = editor;
    this.config = config;

    /** @type {Map<string, HTMLButtonElement>} */
    this.buttons = new Map();

    // Expose toolbar ref on editor so nodeViews (e.g. CustomImage) can access it
    this.editor._tiptapToolbar = this;

    // Modals
    this.imageModal = new ImageModal(this);
    this.linkModal = new LinkModal(this);
    this.videoModal = new VideoModal(this);
    this.tableModal = new TableModal(this);
    this.buttonModal = new ButtonModal(this);
    this.cardModal = new CardModal(this);
    this.galleryModal = new GalleryModal(this);
    this.layoutModal = new LayoutModal(this);

    this._render();
    this._bindEvents();
  }

  /**
   * Render toolbar buttons into the toolbar element.
   * @private
   */
  _render() {
    const groups = this.config.groups || {};
    const container = this.element.querySelector('.tiptap-toolbar') || this.element;

    // Clear existing content
    container.innerHTML = '';

    const groupNames = Object.keys(groups);

    groupNames.forEach((groupName, groupIndex) => {
      const buttonIds = groups[groupName];
      if (!buttonIds || buttonIds.length === 0) return;

      const groupEl = document.createElement('div');
      groupEl.className = 'tiptap-toolbar__group';
      groupEl.setAttribute('role', 'group');
      groupEl.setAttribute('aria-label', groupName);

      buttonIds.forEach((btnId) => {
        const def = BUTTON_DEFINITIONS[btnId];
        if (!def) return;

        if (def.type === 'color') {
          groupEl.appendChild(this._createColorButton(btnId, def));
        } else if (def.type === 'dropdown') {
          groupEl.appendChild(this._createDropdownButton(btnId, def));
        } else {
          groupEl.appendChild(this._createButton(btnId, def));
        }
      });

      container.appendChild(groupEl);

      // Add separator between groups (except last)
      if (groupIndex < groupNames.length - 1) {
        const sep = document.createElement('div');
        sep.className = 'tiptap-toolbar__separator';
        sep.setAttribute('role', 'separator');
        container.appendChild(sep);
      }
    });
  }

  /**
   * Create a single toolbar button element.
   * @private
   * @param {string} id
   * @param {ButtonDef} def
   * @returns {HTMLButtonElement}
   */
  _createButton(id, def) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tiptap-toolbar__button';
    btn.setAttribute('data-action', id);
    btn.setAttribute('aria-label', def.label);
    btn.setAttribute('title', def.label);
    btn.innerHTML = `<i class="bi bi-${def.icon}"></i>`;

    this.buttons.set(id, btn);

    return btn;
  }

  /**
   * Create a color picker toolbar button.
   * @private
   * @param {string} id
   * @param {ButtonDef} def
   * @returns {HTMLElement}
   */
  _createColorButton(id, def) {
    const wrapper = document.createElement('span');
    wrapper.className = 'tiptap-toolbar__color-wrapper';
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-flex';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tiptap-toolbar__button';
    btn.setAttribute('data-action', id);
    btn.setAttribute('aria-label', def.label);
    btn.setAttribute('title', def.label);
    btn.innerHTML = `<i class="bi bi-${def.icon}"></i>`;

    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.className = 'tiptap-toolbar__color-input';
    colorInput.style.cssText =
      'position: absolute; bottom: 0; left: 0; width: 100%; height: 4px; padding: 0; border: 0; cursor: pointer; opacity: 0.7;';
    colorInput.value = '#000000';

    colorInput.addEventListener('input', (e) => {
      this.editor.chain().focus().setColor(e.target.value).run();
    });

    btn.addEventListener('click', () => {
      colorInput.click();
    });

    wrapper.appendChild(btn);
    wrapper.appendChild(colorInput);

    this.buttons.set(id, btn);

    return wrapper;
  }

  /**
   * Create a dropdown toolbar button (e.g., layout presets).
   * @private
   * @param {string} id
   * @param {ButtonDef} def
   * @returns {HTMLElement}
   */
  _createDropdownButton(id, def) {
    const wrapper = document.createElement('div');
    wrapper.className = 'tiptap-toolbar__dropdown';
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-flex';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tiptap-toolbar__button';
    btn.setAttribute('data-action', id);
    btn.setAttribute('aria-label', def.label);
    btn.setAttribute('title', def.label);
    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = `<i class="bi bi-${def.icon}"></i>`;

    // Dropdown menu
    const menu = document.createElement('div');
    menu.className = 'tiptap-toolbar__dropdown-menu';
    menu.setAttribute('role', 'menu');
    menu.style.display = 'none';

    if (id === 'row') {
      LAYOUT_PRESET_OPTIONS.forEach((preset) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'tiptap-toolbar__dropdown-item';
        item.setAttribute('data-layout-preset', preset.id);
        item.setAttribute('role', 'menuitem');
        item.innerHTML = `<span class="tiptap-toolbar__preset-icon">${preset.icon}</span> <span>${preset.label}</span>`;
        menu.appendChild(item);
      });

      // Separator + Advanced option
      const sep = document.createElement('div');
      sep.className = 'tiptap-toolbar__dropdown-separator';
      menu.appendChild(sep);

      const advItem = document.createElement('button');
      advItem.type = 'button';
      advItem.className = 'tiptap-toolbar__dropdown-item tiptap-toolbar__dropdown-item--accent';
      advItem.setAttribute('data-layout-advanced', 'true');
      advItem.setAttribute('role', 'menuitem');
      advItem.innerHTML = '<i class="bi bi-gear me-2"></i><span>Advanced Layout...</span>';
      menu.appendChild(advItem);
    }

    if (id === 'alert') {
      ALERT_TYPE_OPTIONS.forEach((alertOpt) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'tiptap-toolbar__dropdown-item';
        item.setAttribute('data-alert-type', alertOpt.id);
        item.setAttribute('role', 'menuitem');
        item.innerHTML = `<span class="tiptap-toolbar__alert-swatch" style="background:${alertOpt.color}"></span> <span>${alertOpt.label}</span>`;
        menu.appendChild(item);
      });
    }

    // Toggle dropdown
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = menu.style.display !== 'none';
      this._closeAllDropdowns();
      if (!isOpen) {
        menu.style.display = 'block';
        btn.setAttribute('aria-expanded', 'true');
      }
    });

    // Handle preset/alert/layout-advanced selection
    menu.addEventListener('click', (e) => {
      const layoutAdvanced = e.target.closest('[data-layout-advanced]');
      if (layoutAdvanced) {
        e.stopPropagation();
        menu.style.display = 'none';
        btn.setAttribute('aria-expanded', 'false');
        this.layoutModal.open();
        return;
      }

      const layoutItem = e.target.closest('[data-layout-preset]');
      if (layoutItem) {
        e.stopPropagation();
        const preset = layoutItem.getAttribute('data-layout-preset');
        this.editor.chain().focus().insertBootstrapRow(preset).run();
        menu.style.display = 'none';
        btn.setAttribute('aria-expanded', 'false');
        return;
      }

      const alertItem = e.target.closest('[data-alert-type]');
      if (alertItem) {
        e.stopPropagation();
        const alertType = alertItem.getAttribute('data-alert-type');
        // If cursor is inside an existing alert, change its type; otherwise insert new
        if (this.editor.isActive('bootstrapAlert')) {
          this.editor.chain().focus().setAlertType(alertType).run();
        } else {
          this.editor.chain().focus().insertBootstrapAlert(alertType).run();
        }
        menu.style.display = 'none';
        btn.setAttribute('aria-expanded', 'false');
      }
    });

    wrapper.appendChild(btn);
    wrapper.appendChild(menu);

    this.buttons.set(id, btn);

    return wrapper;
  }

  /**
   * Close all open dropdowns in the toolbar.
   * @private
   */
  _closeAllDropdowns() {
    this.element.querySelectorAll('.tiptap-toolbar__dropdown-menu').forEach((m) => {
      m.style.display = 'none';
    });
    this.element.querySelectorAll('[aria-expanded]').forEach((b) => {
      b.setAttribute('aria-expanded', 'false');
    });
  }

  /**
   * Bind click events to toolbar buttons.
   * @private
   */
  _bindEvents() {
    this.element.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;

      e.preventDefault();
      const action = btn.getAttribute('data-action');
      this._executeAction(action);
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.element.contains(e.target)) {
        this._closeAllDropdowns();
      }
    });
  }

  /**
   * Execute a toolbar button action.
   * @private
   * @param {string} actionId
   */
  _executeAction(actionId) {
    const def = BUTTON_DEFINITIONS[actionId];
    if (!def || !this.editor) return;

    const command = def.command;

    // Handle special commands that need prompts
    if (command === '_promptLink') {
      this._handleLink();
      return;
    }
    if (command === '_promptImage') {
      this._handleImage();
      return;
    }
    if (command === '_promptTable') {
      // If cursor is inside a table, open in edit mode with current styles
      if (this.editor.isActive('table')) {
        const { $from } = this.editor.state.selection;
        let styles = null;
        for (let d = $from.depth; d > 0; d--) {
          const node = $from.node(d);
          if (node.type.name === 'table') {
            styles = {
              bordered: !!node.attrs.bordered,
              striped: !!node.attrs.striped,
              hover: !!node.attrs.hover,
              small: !!node.attrs.small,
              alignMiddle: !!node.attrs.alignMiddle,
            };
            break;
          }
        }
        this.tableModal.open(styles);
      } else {
        this.tableModal.open();
      }
      return;
    }
    if (command === '_promptColor') {
      // Color is handled by the color input, skip
      return;
    }
    if (command === '_showLayoutDropdown') {
      // If cursor is inside a row, open edit modal
      if (this.editor.isActive('bootstrapRow')) {
        this._handleEditLayout();
      }
      // Layout dropdown is handled by the dropdown button itself
      return;
    }
    if (command === '_showAlertDropdown') {
      // Alert dropdown is handled by the dropdown button itself
      return;
    }
    if (command === '_insertCard') {
      this._handleInsertCard();
      return;
    }
    if (command === '_insertButton') {
      this._handleInsertButton();
      return;
    }
    if (command === '_promptVideo') {
      this._handleVideo();
      return;
    }
    if (command === '_promptGallery') {
      this._handleGallery();
      return;
    }
    if (command === '_toggleAiPanel') {
      this._handleToggleAiPanel();
      return;
    }
    if (command === '_toggleDarkMode') {
      this._handleToggleDarkMode();
      return;
    }
    if (command === '_showShortcuts') {
      this._handleShowShortcuts();
      return;
    }

    // Execute the editor command
    const chain = this.editor.chain().focus();

    if (def.commandArgs !== undefined) {
      chain[command](def.commandArgs).run();
    } else {
      chain[command]().run();
    }
  }

  /**
   * Handle link insertion/removal with a prompt.
   * @private
   */
  _handleLink() {
    if (this.editor.isActive('link')) {
      // Edit mode — open pre-populated modal
      this.linkModal.open(this.editor.getAttributes('link'));
    } else {
      this.linkModal.open();
    }
  }

  /**
   * Handle image insertion – opens the ImageModal.
   * @private
   */
  _handleImage() {
    this.imageModal.open();
  }

  /**
   * Get the media upload URL from config or CSRF meta.
   * @private
   * @returns {string|null}
   */
  _getUploadUrl() {
    // Check if the editor wrapper has a data attribute
    const wrapper = this.element.closest('[data-tiptap-editor]');
    const configUrl = wrapper?.getAttribute('data-upload-url');
    if (configUrl) return configUrl;

    // Try default route
    const prefix = document.querySelector('meta[name="tiptap-upload-url"]')?.content;
    return prefix || null;
  }

  /**
   * Get the media browse URL from config or meta tag.
   * @private
   * @returns {string|null}
   */
  _getBrowseUrl() {
    const wrapper = this.element.closest('[data-tiptap-editor]');
    const configUrl = wrapper?.getAttribute('data-browse-url');
    if (configUrl) return configUrl;

    const meta = document.querySelector('meta[name="tiptap-browse-url"]')?.content;
    return meta || null;
  }

  /**
   * Upload a file to the server.
   * @private
   * @param {File} file
   * @param {string} url
   * @returns {Promise<Object>}
   */
  async _uploadFile(file, url) {
    const formData = new FormData();
    formData.append('file', file);

    const csrfToken =
      document.querySelector('meta[name="csrf-token"]')?.content || '';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-CSRF-TOKEN': csrfToken,
        Accept: 'application/json',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.media || data;
  }

  /**
   * Handle card insertion – opens the CardModal.
   * @private
   */
  _handleInsertCard() {
    this.cardModal.open();
  }

  /**
   * Handle button insertion – opens the ButtonModal.
   * @private
   */
  _handleInsertButton() {
    this.buttonModal.open();
  }

  /**
   * Handle video insertion with URL prompt.
   * @private
   */
  _handleVideo() {
    this.videoModal.open();
  }

  /**
   * Handle gallery insertion – opens the GalleryModal.
   * @private
   */
  _handleGallery() {
    this.galleryModal.open();
  }

  /**
   * Handle editing current layout row – opens LayoutModal with existing attrs.
   * @private
   */
  _handleEditLayout() {
    const { $from } = this.editor.state.selection;
    for (let depth = $from.depth; depth > 0; depth--) {
      const node = $from.node(depth);
      if (node.type.name === 'bootstrapRow') {
        const columns = [];
        node.forEach((child) => {
          if (child.type.name === 'bootstrapCol') {
            columns.push({ colClass: child.attrs.colClass || 'col' });
          }
        });
        this.layoutModal.open({ ...node.attrs, columns });
        return;
      }
    }
  }

  /**
   * Update active states of all toolbar buttons based on current editor state.
   * @param {import('@tiptap/core').Editor} editor
   */
  updateActiveStates(editor) {
    this.buttons.forEach((btn, id) => {
      const def = BUTTON_DEFINITIONS[id];
      if (!def || !def.isActive) {
        btn.classList.remove('tiptap-toolbar__button--active');
        return;
      }

      try {
        const active = def.isActive(editor);
        btn.classList.toggle('tiptap-toolbar__button--active', active);
      } catch {
        btn.classList.remove('tiptap-toolbar__button--active');
      }
    });
  }

  /**
   * Toggle the AI Assistant panel.
   * Relies on the editor wrapper having an AiPanel instance.
   * @private
   */
  _handleToggleAiPanel() {
    // Dispatch a custom event that the Editor class listens for
    const event = new CustomEvent('tiptap:toggle-ai-panel', { bubbles: true });
    this.element.dispatchEvent(event);
  }

  /**
   * Toggle dark mode on the editor.
   * Cycles: auto → dark → light → auto
   * @private
   */
  _handleToggleDarkMode() {
    const event = new CustomEvent('tiptap:toggle-dark-mode', { bubbles: true });
    this.element.dispatchEvent(event);
  }

  /**
   * Show keyboard shortcuts help modal.
   * @private
   */
  _handleShowShortcuts() {
    const event = new CustomEvent('tiptap:show-shortcuts', { bubbles: true });
    this.element.dispatchEvent(event);
  }

  /**
   * Destroy the toolbar and clean up.
   */
  destroy() {
    this.imageModal?.destroy();
    this.imageModal = null;
    this.linkModal?.destroy();
    this.linkModal = null;
    this.videoModal?.destroy();
    this.videoModal = null;
    this.tableModal?.destroy();
    this.tableModal = null;
    this.buttonModal?.destroy();
    this.buttonModal = null;
    this.cardModal?.destroy();
    this.cardModal = null;
    this.galleryModal?.destroy();
    this.galleryModal = null;
    this.layoutModal?.destroy();
    this.layoutModal = null;
    this.buttons.clear();
    this.element.innerHTML = '';
    if (this.editor) this.editor._tiptapToolbar = null;
    this.editor = null;
  }
}
