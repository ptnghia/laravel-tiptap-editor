/**
 * Tiptap Editor – Responsive Preview
 *
 * Adds a preview bar below the editor content area that allows switching
 * between Desktop, Tablet (768px), and Mobile (375px) viewport widths.
 * This helps verify Bootstrap layout rendering at different breakpoints.
 */

import { createElement } from './utils/helpers';

/**
 * Preview mode definitions.
 * @type {Array<{id: string, label: string, icon: string, width: number|null}>}
 */
const PREVIEW_MODES = [
  { id: 'desktop', label: 'Desktop', icon: 'bi-display', width: null },
  { id: 'tablet',  label: 'Tablet (768px)',  icon: 'bi-tablet', width: 768 },
  { id: 'mobile',  label: 'Mobile (375px)',  icon: 'bi-phone', width: 375 },
];

export default class ResponsivePreview {
  /**
   * @param {import('./Editor').default} editorInstance
   */
  constructor(editorInstance) {
    /** @type {import('./Editor').default} */
    this.editorInstance = editorInstance;

    /** @type {HTMLElement} */
    this.wrapper = editorInstance.wrapper;

    /** @type {HTMLElement|null} */
    this.contentEl = this.wrapper.querySelector('[data-tiptap-content]');

    /** @type {string} */
    this.currentMode = 'desktop';

    /** @type {HTMLElement|null} */
    this._bar = null;

    /** @type {Map<string, HTMLButtonElement>} */
    this._buttons = new Map();

    /** @type {HTMLElement|null} */
    this._sizeLabel = null;

    this._build();
  }

  /**
   * Build the preview bar and insert it into the editor wrapper.
   * @private
   */
  _build() {
    this._bar = createElement('div', {
      className: 'tiptap-preview-bar',
      role: 'toolbar',
      'aria-label': 'Responsive preview',
    });

    // Label
    this._bar.appendChild(
      createElement('span', { className: 'tiptap-preview-bar__label' }, ['Preview:'])
    );

    // Mode buttons
    PREVIEW_MODES.forEach((mode) => {
      const btn = createElement('button', {
        className: `tiptap-preview-bar__btn${mode.id === 'desktop' ? ' tiptap-preview-bar__btn--active' : ''}`,
        type: 'button',
        'aria-label': mode.label,
        title: mode.label,
        'aria-pressed': mode.id === 'desktop' ? 'true' : 'false',
        dataset: { previewMode: mode.id },
      }, [
        createElement('i', { className: `bi ${mode.icon}` }),
      ]);

      btn.addEventListener('click', () => this.setMode(mode.id));
      this._buttons.set(mode.id, btn);
      this._bar.appendChild(btn);
    });

    // Size label
    this._sizeLabel = createElement('span', { className: 'tiptap-preview-bar__size' }, ['100%']);
    this._bar.appendChild(this._sizeLabel);

    // Insert bar after content area (before footer/hidden input)
    const footer = this.wrapper.querySelector('.tiptap-editor__footer');
    if (footer) {
      this.wrapper.insertBefore(this._bar, footer);
    } else {
      // Insert before hidden input
      const hiddenInput = this.wrapper.querySelector('[data-tiptap-input]');
      if (hiddenInput) {
        this.wrapper.insertBefore(this._bar, hiddenInput);
      } else {
        this.wrapper.appendChild(this._bar);
      }
    }
  }

  /**
   * Set the preview mode.
   * @param {string} modeId - 'desktop', 'tablet', or 'mobile'
   */
  setMode(modeId) {
    const mode = PREVIEW_MODES.find((m) => m.id === modeId);
    if (!mode || modeId === this.currentMode) return;

    this.currentMode = modeId;

    // Update button states
    this._buttons.forEach((btn, id) => {
      const isActive = id === modeId;
      btn.classList.toggle('tiptap-preview-bar__btn--active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    // Update content width
    if (this.contentEl) {
      // Remove all preview classes
      this.contentEl.classList.remove(
        'tiptap-editor__content--preview-tablet',
        'tiptap-editor__content--preview-mobile'
      );

      if (modeId === 'tablet') {
        this.contentEl.classList.add('tiptap-editor__content--preview-tablet');
      } else if (modeId === 'mobile') {
        this.contentEl.classList.add('tiptap-editor__content--preview-mobile');
      }
    }

    // Update size label
    if (this._sizeLabel) {
      this._sizeLabel.textContent = mode.width ? `${mode.width}px` : '100%';
    }

    // Announce for accessibility
    if (this.editorInstance.a11y) {
      this.editorInstance.a11y.announce(`Preview mode: ${mode.label}`);
    }
  }

  /**
   * Get current preview mode.
   * @returns {string}
   */
  getMode() {
    return this.currentMode;
  }

  /**
   * Reset to desktop mode.
   */
  reset() {
    this.setMode('desktop');
  }

  /**
   * Clean up DOM.
   */
  destroy() {
    if (this._bar) {
      this._bar.remove();
      this._bar = null;
    }
    if (this.contentEl) {
      this.contentEl.classList.remove(
        'tiptap-editor__content--preview-tablet',
        'tiptap-editor__content--preview-mobile'
      );
    }
    this._buttons.clear();
    this._sizeLabel = null;
  }
}
