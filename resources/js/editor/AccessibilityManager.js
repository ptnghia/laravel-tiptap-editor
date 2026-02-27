/**
 * Tiptap Editor – Accessibility Manager
 *
 * Enhances the editor with ARIA attributes, roving tabindex for toolbar
 * keyboard navigation, and screen reader live region announcements.
 * Targets WCAG 2.1 AA compliance.
 */

import { createElement } from './utils/helpers';

export default class AccessibilityManager {
  /**
   * @param {import('./Editor').default} editorInstance
   */
  constructor(editorInstance) {
    /** @type {import('./Editor').default} */
    this.editorInstance = editorInstance;

    /** @type {HTMLElement} */
    this.wrapper = editorInstance.wrapper;

    /** @type {HTMLElement|null} */
    this._liveRegion = null;

    /** @type {HTMLElement[]} */
    this._toolbarButtons = [];

    /** @type {number} */
    this._focusedIndex = 0;

    this._handleToolbarKeyDown = this._handleToolbarKeyDown.bind(this);

    this._init();
  }

  /**
   * Initialize all accessibility enhancements.
   * @private
   */
  _init() {
    this._setupWrapperAria();
    this._setupToolbarAria();
    this._setupContentAria();
    this._createLiveRegion();
  }

  /**
   * Set ARIA attributes on the editor wrapper.
   * @private
   */
  _setupWrapperAria() {
    this.wrapper.setAttribute('role', 'application');
    this.wrapper.setAttribute('aria-label', 'Rich text editor');
  }

  /**
   * Set up roving tabindex and ARIA for toolbar buttons.
   * @private
   */
  _setupToolbarAria() {
    const toolbar = this.wrapper.querySelector('[data-tiptap-toolbar]');
    if (!toolbar) return;

    toolbar.setAttribute('role', 'toolbar');
    toolbar.setAttribute('aria-label', 'Text formatting');
    toolbar.setAttribute('aria-orientation', 'horizontal');

    // Gather all focusable buttons
    this._toolbarButtons = Array.from(
      toolbar.querySelectorAll('.tiptap-toolbar__button')
    );

    if (this._toolbarButtons.length === 0) return;

    // Set roving tabindex: first button tabbable, rest -1
    this._toolbarButtons.forEach((btn, index) => {
      btn.setAttribute('tabindex', index === 0 ? '0' : '-1');
    });

    // Listen for arrow keys on toolbar
    toolbar.addEventListener('keydown', this._handleToolbarKeyDown);
  }

  /**
   * Set ARIA attributes on the content/editor area.
   * @private
   */
  _setupContentAria() {
    const content = this.wrapper.querySelector('[data-tiptap-content]');
    if (!content) return;

    content.setAttribute('role', 'textbox');
    content.setAttribute('aria-multiline', 'true');
    content.setAttribute('aria-label', 'Editor content');

    // The ProseMirror element gets contenteditable; enhance it
    const proseMirror = content.querySelector('.ProseMirror');
    if (proseMirror) {
      proseMirror.setAttribute('aria-label', 'Editor content area');
    }
  }

  /**
   * Create an ARIA live region for screen reader announcements.
   * @private
   */
  _createLiveRegion() {
    this._liveRegion = createElement('div', {
      role: 'status',
      'aria-live': 'polite',
      'aria-atomic': 'true',
      className: 'tiptap-sr-only',
    });
    this.wrapper.appendChild(this._liveRegion);
  }

  /**
   * Announce a message to screen readers via the live region.
   * @param {string} message
   */
  announce(message) {
    if (!this._liveRegion) return;
    // Clear and set to trigger announcement
    this._liveRegion.textContent = '';
    requestAnimationFrame(() => {
      this._liveRegion.textContent = message;
    });
  }

  /**
   * Handle arrow key navigation in toolbar (roving tabindex pattern).
   * @private
   * @param {KeyboardEvent} e
   */
  _handleToolbarKeyDown(e) {
    const buttons = this._toolbarButtons;
    if (buttons.length === 0) return;

    let handled = false;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown': {
        this._focusedIndex = (this._focusedIndex + 1) % buttons.length;
        handled = true;
        break;
      }
      case 'ArrowLeft':
      case 'ArrowUp': {
        this._focusedIndex = (this._focusedIndex - 1 + buttons.length) % buttons.length;
        handled = true;
        break;
      }
      case 'Home': {
        this._focusedIndex = 0;
        handled = true;
        break;
      }
      case 'End': {
        this._focusedIndex = buttons.length - 1;
        handled = true;
        break;
      }
      case 'Escape': {
        // Return focus to editor content
        this.editorInstance.editor?.commands.focus();
        handled = true;
        break;
      }
    }

    if (handled) {
      e.preventDefault();
      // Update tabindex
      buttons.forEach((btn, i) => {
        btn.setAttribute('tabindex', i === this._focusedIndex ? '0' : '-1');
      });
      buttons[this._focusedIndex].focus();
    }
  }

  /**
   * Refresh toolbar buttons list (call after toolbar re-render).
   */
  refreshToolbar() {
    const toolbar = this.wrapper.querySelector('[data-tiptap-toolbar]');
    if (!toolbar) return;

    this._toolbarButtons = Array.from(
      toolbar.querySelectorAll('.tiptap-toolbar__button')
    );
    this._focusedIndex = 0;

    this._toolbarButtons.forEach((btn, index) => {
      btn.setAttribute('tabindex', index === 0 ? '0' : '-1');
    });
  }

  /**
   * Clean up event listeners and DOM.
   */
  destroy() {
    const toolbar = this.wrapper.querySelector('[data-tiptap-toolbar]');
    if (toolbar) {
      toolbar.removeEventListener('keydown', this._handleToolbarKeyDown);
    }
    if (this._liveRegion) {
      this._liveRegion.remove();
      this._liveRegion = null;
    }
    this._toolbarButtons = [];
  }
}
