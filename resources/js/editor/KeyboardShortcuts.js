/**
 * Tiptap Editor – Keyboard Shortcuts Help Modal
 *
 * Shows an overlay modal listing all available keyboard shortcuts.
 * Triggered by Ctrl+/ (Cmd+/ on Mac) or via toolbar button.
 */

import { formatShortcut, detectOS, createElement } from './utils/helpers';

/**
 * Shortcut definitions grouped by category.
 * Each shortcut: { label, keys } where keys is a generic notation (Mod = Ctrl/Cmd).
 */
const SHORTCUT_GROUPS = [
  {
    title: 'Text Formatting',
    shortcuts: [
      { label: 'Bold', keys: 'Mod+B' },
      { label: 'Italic', keys: 'Mod+I' },
      { label: 'Underline', keys: 'Mod+U' },
      { label: 'Strikethrough', keys: 'Mod+Shift+X' },
      { label: 'Code', keys: 'Mod+E' },
      { label: 'Highlight', keys: 'Mod+Shift+H' },
    ],
  },
  {
    title: 'Paragraphs & Headings',
    shortcuts: [
      { label: 'Normal text', keys: 'Mod+Alt+0' },
      { label: 'Heading 1', keys: 'Mod+Alt+1' },
      { label: 'Heading 2', keys: 'Mod+Alt+2' },
      { label: 'Heading 3', keys: 'Mod+Alt+3' },
      { label: 'Heading 4', keys: 'Mod+Alt+4' },
    ],
  },
  {
    title: 'Lists & Blocks',
    shortcuts: [
      { label: 'Bullet List', keys: 'Mod+Shift+8' },
      { label: 'Ordered List', keys: 'Mod+Shift+7' },
      { label: 'Blockquote', keys: 'Mod+Shift+B' },
      { label: 'Code Block', keys: 'Mod+Alt+C' },
      { label: 'Horizontal Rule', keys: 'Mod+Alt+R' },
    ],
  },
  {
    title: 'Editing',
    shortcuts: [
      { label: 'Undo', keys: 'Mod+Z' },
      { label: 'Redo', keys: 'Mod+Shift+Z' },
      { label: 'Select All', keys: 'Mod+A' },
      { label: 'Copy', keys: 'Mod+C' },
      { label: 'Paste', keys: 'Mod+V' },
      { label: 'Cut', keys: 'Mod+X' },
    ],
  },
  {
    title: 'Navigation',
    shortcuts: [
      { label: 'Slash Commands', keys: '/' },
      { label: 'Keyboard Shortcuts', keys: 'Mod+/' },
    ],
  },
];

export default class KeyboardShortcuts {
  /**
   * @param {import('./Editor').default} editorInstance
   */
  constructor(editorInstance) {
    /** @type {import('./Editor').default} */
    this.editorInstance = editorInstance;

    /** @type {HTMLElement|null} */
    this._overlay = null;

    /** @type {boolean} */
    this._visible = false;

    this._handleKeyDown = this._handleKeyDown.bind(this);
    document.addEventListener('keydown', this._handleKeyDown);
  }

  /**
   * Handle global keydown for Ctrl+/ (Cmd+/) shortcut.
   * @private
   * @param {KeyboardEvent} e
   */
  _handleKeyDown(e) {
    const isMod = detectOS() === 'mac' ? e.metaKey : e.ctrlKey;
    if (isMod && e.key === '/') {
      e.preventDefault();
      this.toggle();
    }
    if (e.key === 'Escape' && this._visible) {
      this.close();
    }
  }

  /**
   * Toggle the shortcuts modal.
   */
  toggle() {
    if (this._visible) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Open the shortcuts modal.
   */
  open() {
    if (this._visible) return;

    if (!this._overlay) {
      this._build();
    }

    this._visible = true;
    // Force reflow before adding class for CSS transition
    this._overlay.offsetHeight; // eslint-disable-line no-unused-expressions
    this._overlay.classList.add('tiptap-shortcuts-overlay--visible');
    this._overlay.setAttribute('aria-hidden', 'false');

    // Focus close button for accessibility
    const closeBtn = this._overlay.querySelector('.tiptap-shortcuts-modal__close');
    if (closeBtn) closeBtn.focus();
  }

  /**
   * Close the shortcuts modal.
   */
  close() {
    if (!this._visible || !this._overlay) return;
    this._visible = false;
    this._overlay.classList.remove('tiptap-shortcuts-overlay--visible');
    this._overlay.setAttribute('aria-hidden', 'true');

    // Return focus to editor
    this.editorInstance.editor?.commands.focus();
  }

  /**
   * Build the modal DOM structure.
   * @private
   */
  _build() {
    // Overlay
    this._overlay = createElement('div', {
      className: 'tiptap-shortcuts-overlay',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': 'Keyboard Shortcuts',
      'aria-hidden': 'true',
    });

    // Click overlay backdrop to close
    this._overlay.addEventListener('click', (e) => {
      if (e.target === this._overlay) this.close();
    });

    // Modal container
    const modal = createElement('div', { className: 'tiptap-shortcuts-modal' });

    // Header
    const header = createElement('div', { className: 'tiptap-shortcuts-modal__header' }, [
      createElement('h3', { className: 'tiptap-shortcuts-modal__title' }, ['Keyboard Shortcuts']),
      createElement('button', {
        className: 'tiptap-shortcuts-modal__close',
        'aria-label': 'Close',
        type: 'button',
        onClick: () => this.close(),
      }, ['×']),
    ]);

    // Body with shortcut list
    const body = createElement('div', { className: 'tiptap-shortcuts-modal__body' });

    SHORTCUT_GROUPS.forEach((group) => {
      body.appendChild(
        createElement('div', { className: 'tiptap-shortcuts__group-title' }, [group.title])
      );

      group.shortcuts.forEach((shortcut) => {
        const formatted = formatShortcut(shortcut.keys);
        const keyParts = this._splitKeys(formatted);

        const keysContainer = createElement('span', { className: 'tiptap-shortcuts__keys' });
        keyParts.forEach((part) => {
          keysContainer.appendChild(
            createElement('kbd', { className: 'tiptap-shortcuts__key' }, [part])
          );
        });

        body.appendChild(
          createElement('div', { className: 'tiptap-shortcuts__item' }, [
            createElement('span', { className: 'tiptap-shortcuts__label' }, [shortcut.label]),
            keysContainer,
          ])
        );
      });
    });

    modal.appendChild(header);
    modal.appendChild(body);
    this._overlay.appendChild(modal);
    document.body.appendChild(this._overlay);
  }

  /**
   * Split a formatted shortcut into individual key parts.
   * For Mac: '⌘B' → ['⌘', 'B'], '⌘⇧H' → ['⌘', '⇧', 'H']
   * For Win: 'Ctrl+Shift+H' → ['Ctrl', 'Shift', 'H']
   * @private
   * @param {string} formatted
   * @returns {string[]}
   */
  _splitKeys(formatted) {
    if (detectOS() === 'mac') {
      // Mac symbols are single chars: ⌘, ⇧, ⌥
      const parts = [];
      let current = '';
      for (const char of formatted) {
        if ('⌘⇧⌥'.includes(char)) {
          if (current) parts.push(current);
          parts.push(char);
          current = '';
        } else {
          current += char;
        }
      }
      if (current) parts.push(current);
      return parts.length ? parts : [formatted];
    }
    // Windows/Linux: split on '+'
    return formatted.split('+').map((s) => s.trim()).filter(Boolean);
  }

  /**
   * Clean up DOM and event listeners.
   */
  destroy() {
    document.removeEventListener('keydown', this._handleKeyDown);
    if (this._overlay) {
      this._overlay.remove();
      this._overlay = null;
    }
    this._visible = false;
  }
}
