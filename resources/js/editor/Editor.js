/**
 * Tiptap Editor – Main Editor Class
 *
 * Wraps the Tiptap Editor instance with a clean API for Laravel Blade integration.
 * Provides methods for content management, event handling, and form synchronization.
 */

import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import CustomTable from './extensions/CustomTable';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import BootstrapRow from './extensions/BootstrapRow';
import BootstrapCol from './extensions/BootstrapCol';
import BootstrapAlert from './extensions/BootstrapAlert';
import BootstrapCard from './extensions/BootstrapCard';
import BootstrapButton from './extensions/BootstrapButton';
import CustomImage from './extensions/CustomImage';
import CustomVideo from './extensions/CustomVideo';
import { Gallery, GalleryImage } from './extensions/Gallery';
import TrailingNode from './extensions/TrailingNode';
import SlashCommands from './extensions/SlashCommands';
import Toolbar from './Toolbar';
import AiPanel from './AiPanel';
import BlockMenu from './BlockMenu';
import KeyboardShortcuts from './KeyboardShortcuts';
import AccessibilityManager from './AccessibilityManager';
import ResponsivePreview from './ResponsivePreview';

/**
 * @typedef {Object} TiptapEditorConfig
 * @property {string[]} extensions - Enabled extension names
 * @property {Object} toolbar - Toolbar configuration with groups
 * @property {string} placeholder - Placeholder text
 * @property {Object} ai - AI configuration
 */

export default class TiptapEditor {
  /**
   * @param {HTMLElement} wrapperElement - The .tiptap-editor-wrapper element
   * @param {TiptapEditorConfig} config - Editor configuration from data-config
   */
  constructor(wrapperElement, config = {}) {
    this.wrapper = wrapperElement;
    this.config = config;

    /** @type {HTMLElement} */
    this.contentElement = wrapperElement.querySelector('[data-tiptap-content]');

    /** @type {HTMLInputElement} */
    this.inputElement = wrapperElement.querySelector('[data-tiptap-input]');

    /** @type {HTMLElement} */
    this.toolbarElement = wrapperElement.querySelector('[data-tiptap-toolbar]');

    /** @type {Editor|null} */
    this.editor = null;

    /** @type {Toolbar|null} */
    this.toolbar = null;

    /** @type {boolean} */
    this.isDisabled = wrapperElement.hasAttribute('data-disabled');

    /** @type {AiPanel|null} */
    this.aiPanel = null;

    /** @type {import('./BlockMenu').default|null} */
    this.blockMenu = null;

    /** @type {import('./KeyboardShortcuts').default|null} */
    this.shortcuts = null;

    /** @type {import('./AccessibilityManager').default|null} */
    this.a11y = null;

    /** @type {import('./ResponsivePreview').default|null} */
    this.responsivePreview = null;

    /** @type {Object.<string, Function[]>} */
    this._listeners = {};

    this._init();
  }

  /**
   * Initialize the Tiptap editor instance with configured extensions.
   * @private
   */
  _init() {
    const extensions = this._buildExtensions();
    const initialContent = this._getInitialContent();

    this.editor = new Editor({
      element: this.contentElement,
      extensions,
      content: initialContent,
      editable: !this.isDisabled,
      autofocus: false,
      editorProps: {
        attributes: {
          class: 'ProseMirror',
        },
      },
      onUpdate: ({ editor }) => {
        this._syncToInput();
        this._emit('change', { json: editor.getJSON(), html: editor.getHTML() });
      },
      onFocus: ({ editor, event }) => {
        this.wrapper.classList.add('tiptap-editor--focused');
        this._emit('focus', { editor, event });
      },
      onBlur: ({ editor, event }) => {
        this.wrapper.classList.remove('tiptap-editor--focused');
        this._emit('blur', { editor, event });
      },
      onSelectionUpdate: ({ editor }) => {
        this._emit('selectionUpdate', { editor });
        if (this.toolbar) {
          this.toolbar.updateActiveStates(editor);
        }
      },
      onTransaction: ({ editor }) => {
        if (this.toolbar) {
          this.toolbar.updateActiveStates(editor);
        }
      },
    });

    // Initialize toolbar
    if (this.toolbarElement) {
      this.toolbar = new Toolbar(this.toolbarElement, this.editor, this.config.toolbar || {});
    }

    // Initialize AI Panel (if enabled)
    if (this.config.ai?.enabled) {
      this.aiPanel = new AiPanel(this, this.config.ai);

      // Listen for toolbar AI toggle event
      this.wrapper.addEventListener('tiptap:toggle-ai-panel', () => {
        this.openAiPanel();
      });
    }

    // Initialize Block Menu
    this.blockMenu = new BlockMenu(this);

    // Initialize Accessibility Manager
    this.a11y = new AccessibilityManager(this);

    // Initialize Keyboard Shortcuts Help
    this.shortcuts = new KeyboardShortcuts(this);

    // Initialize Responsive Preview
    this.responsivePreview = new ResponsivePreview(this);

    // Apply dark mode from config or data attribute
    this._initTheme();

    // Listen for insert-image event from slash commands
    this.wrapper.addEventListener('tiptap:insert-image', () => {
      if (this.toolbar) {
        this.toolbar._handleImage();
      }
    });

    // Listen for dark mode toggle from toolbar
    this.wrapper.addEventListener('tiptap:toggle-dark-mode', () => {
      const current = this.getTheme();
      const next = current === 'auto' ? 'dark' : current === 'dark' ? 'light' : 'auto';
      this.setTheme(next);
    });

    // Listen for shortcuts display from toolbar
    this.wrapper.addEventListener('tiptap:show-shortcuts', () => {
      this.openShortcuts();
    });

    // Apply editor height/resize settings
    this._applyEditorDimensions();

    // Sync initial content to hidden input
    this._syncToInput();
  }

  /**
   * Build the list of Tiptap extensions based on configuration.
   * @private
   * @returns {Array} Array of Tiptap extensions
   */
  _buildExtensions() {
    const enabledExtensions = this.config.extensions || [];
    const extensions = [];

    // StarterKit – includes Paragraph, Heading, Bold, Italic, Strike, Code,
    //              BulletList, OrderedList, ListItem, Blockquote, CodeBlock,
    //              HorizontalRule, HardBreak, History
    extensions.push(
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      })
    );

    // Underline
    if (enabledExtensions.includes('underline')) {
      extensions.push(Underline);
    }

    // Link
    if (enabledExtensions.includes('link')) {
      extensions.push(
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            rel: null,
          },
        })
      );
    }

    // Text Align
    if (enabledExtensions.includes('textAlign')) {
      extensions.push(
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        })
      );
    }

    // Placeholder
    extensions.push(
      Placeholder.configure({
        placeholder: this.config.placeholder || 'Start writing...',
      })
    );

    // Character Count
    if (enabledExtensions.includes('characterCount')) {
      extensions.push(CharacterCount);
    }

    // Subscript / Superscript
    if (enabledExtensions.includes('subscript')) {
      extensions.push(Subscript);
    }
    if (enabledExtensions.includes('superscript')) {
      extensions.push(Superscript);
    }

    // Color + TextStyle
    if (enabledExtensions.includes('color')) {
      extensions.push(TextStyle);
      extensions.push(Color);
    }

    // Highlight
    if (enabledExtensions.includes('highlight')) {
      extensions.push(
        Highlight.configure({
          multicolor: true,
        })
      );
    }

    // Custom Image (replaces basic Image extension)
    if (enabledExtensions.includes('customImage')) {
      extensions.push(CustomImage);
    }

    // Custom Video
    if (enabledExtensions.includes('customVideo')) {
      extensions.push(CustomVideo);
    }

    // Table
    if (enabledExtensions.includes('table')) {
      extensions.push(
        CustomTable.configure({
          resizable: true,
        })
      );
      extensions.push(TableRow);
      extensions.push(TableCell);
      extensions.push(TableHeader);
    }

    // Bootstrap Layout
    if (enabledExtensions.includes('bootstrapRow')) {
      extensions.push(BootstrapRow);
    }
    if (enabledExtensions.includes('bootstrapCol') || enabledExtensions.includes('bootstrapRow')) {
      // Col is always needed if Row is present
      if (!extensions.some((e) => e.name === 'bootstrapCol')) {
        extensions.push(BootstrapCol);
      }
    }

    // Bootstrap Alert
    if (enabledExtensions.includes('bootstrapAlert')) {
      extensions.push(BootstrapAlert);
    }

    // Bootstrap Card
    if (enabledExtensions.includes('bootstrapCard')) {
      extensions.push(BootstrapCard);
    }

    // Bootstrap Button
    if (enabledExtensions.includes('bootstrapButton')) {
      extensions.push(BootstrapButton);
    }

    // Gallery
    if (enabledExtensions.includes('gallery')) {
      extensions.push(Gallery);
      extensions.push(GalleryImage);
    }

    // Slash Commands
    if (enabledExtensions.includes('slashCommands')) {
      extensions.push(SlashCommands.configure({
        commands: this.config.slashCommands?.commands || null,
      }));
    }

    // TrailingNode – always enabled to ensure users can click below the last block node
    extensions.push(TrailingNode);

    return extensions;
  }

  /**
   * Parse the initial content from the hidden input.
   * @private
   * @returns {Object|string|null}
   */
  _getInitialContent() {
    if (!this.inputElement) return null;

    const value = this.inputElement.value;
    if (!value) return null;

    try {
      const parsed = JSON.parse(value);
      // Tiptap JSON has { type: 'doc', content: [...] }
      if (parsed && parsed.type === 'doc') {
        return parsed;
      }
      return parsed;
    } catch {
      // If it's plain HTML string, let Tiptap parse it
      return value;
    }
  }

  /**
   * Sync editor JSON content to the hidden input element.
   * @private
   */
  _syncToInput() {
    if (!this.inputElement || !this.editor) return;

    const json = this.editor.getJSON();
    this.inputElement.value = JSON.stringify(json);
  }

  // ─── Public API ────────────────────────────────────────────────

  /**
   * Get editor content as Tiptap JSON.
   * @returns {Object}
   */
  getJSON() {
    return this.editor?.getJSON() ?? {};
  }

  /**
   * Get editor content as HTML string.
   * @returns {string}
   */
  getHTML() {
    return this.editor?.getHTML() ?? '';
  }

  /**
   * Get plain text content.
   * @returns {string}
   */
  getText() {
    return this.editor?.getText() ?? '';
  }

  /**
   * Set editor content.
   * @param {Object|string} content - Tiptap JSON object or HTML string
   * @param {boolean} emitUpdate - Whether to trigger update events
   */
  setContent(content, emitUpdate = true) {
    if (!this.editor) return;
    this.editor.commands.setContent(content, emitUpdate);
    this._syncToInput();
  }

  /**
   * Clear all editor content.
   */
  clearContent() {
    if (!this.editor) return;
    this.editor.commands.clearContent();
    this._syncToInput();
  }

  /**
   * Check if the editor content is empty.
   * @returns {boolean}
   */
  isEmpty() {
    return this.editor?.isEmpty ?? true;
  }

  /**
   * Get the character count.
   * @returns {number}
   */
  getCharacterCount() {
    return this.editor?.storage.characterCount?.characters() ?? 0;
  }

  /**
   * Enable or disable the editor.
   * @param {boolean} editable
   */
  setEditable(editable) {
    if (!this.editor) return;
    this.editor.setEditable(editable);
    this.isDisabled = !editable;

    if (editable) {
      this.wrapper.removeAttribute('data-disabled');
    } else {
      this.wrapper.setAttribute('data-disabled', '');
    }
  }

  /**
   * Focus the editor.
   * @param {string} position - 'start', 'end', or 'all'
   */
  focus(position = 'end') {
    this.editor?.commands.focus(position);
  }

  /**
   * Open/toggle the AI panel.
   */
  openAiPanel() {
    if (this.aiPanel) {
      this.aiPanel.toggle();
    }
  }

  /**
   * Toggle dark mode on the editor.
   * @param {'light'|'dark'|'auto'} theme
   */
  setTheme(theme = 'auto') {
    if (theme === 'auto') {
      this.wrapper.removeAttribute('data-theme');
    } else {
      this.wrapper.setAttribute('data-theme', theme);
    }
    this._emit('themeChange', { theme });
  }

  /**
   * Get current theme setting.
   * @returns {string} 'light', 'dark', or 'auto'
   */
  getTheme() {
    return this.wrapper.getAttribute('data-theme') || 'auto';
  }

  /**
   * Initialize theme from config or data attribute.
   * @private
   */
  _initTheme() {
    const configTheme = this.config.theme;
    if (configTheme && configTheme !== 'auto') {
      this.wrapper.setAttribute('data-theme', configTheme);
    }
  }

  /**
   * Apply editor height, max-height, and resize settings from config.
   *
   * Config options:
   *  - minHeight: CSS value (e.g. '200px', '10rem') – minimum editor height
   *  - maxHeight: CSS value (e.g. '500px', '60vh') – enables scrollbar when exceeded
   *  - height: CSS value (e.g. '400px') – fixed default height
   *  - resizable: boolean – allows user to drag-resize the editor vertically
   *
   * @private
   */
  _applyEditorDimensions() {
    const { minHeight, maxHeight, height, resizable } = this.config;

    if (minHeight) {
      this.wrapper.style.setProperty('--tiptap-min-height', minHeight);
    }

    if (maxHeight) {
      this.contentElement.style.maxHeight = maxHeight;
      this.contentElement.style.overflowY = 'auto';
    }

    if (height) {
      this.contentElement.style.height = height;
      this.contentElement.style.overflowY = 'auto';
    }

    if (resizable) {
      this._addResizeHandle();
    }
  }

  /**
   * Add a drag handle at the bottom of the editor for vertical resizing.
   * @private
   */
  _addResizeHandle() {
    const handle = document.createElement('div');
    handle.className = 'tiptap-editor__resize-handle';
    handle.title = 'Drag to resize';
    this.wrapper.appendChild(handle);

    let startY = 0;
    let startHeight = 0;

    const onMouseMove = (e) => {
      const newHeight = startHeight + (e.clientY - startY);
      const minH = parseInt(getComputedStyle(this.wrapper).getPropertyValue('--tiptap-min-height')) || 100;
      if (newHeight >= minH) {
        this.contentElement.style.height = newHeight + 'px';
        this.contentElement.style.overflowY = 'auto';
      }
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      this.wrapper.classList.remove('tiptap-editor--resizing');
      document.body.style.userSelect = '';
    };

    handle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      startY = e.clientY;
      startHeight = this.contentElement.offsetHeight;
      this.wrapper.classList.add('tiptap-editor--resizing');
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  }

  /**
   * Open keyboard shortcuts help modal.
   */
  openShortcuts() {
    if (this.shortcuts) {
      this.shortcuts.open();
    }
  }

  /**
   * Destroy the editor instance and clean up.
   */
  destroy() {
    if (this.responsivePreview) {
      this.responsivePreview.destroy();
      this.responsivePreview = null;
    }
    if (this.shortcuts) {
      this.shortcuts.destroy();
      this.shortcuts = null;
    }
    if (this.a11y) {
      this.a11y.destroy();
      this.a11y = null;
    }
    if (this.blockMenu) {
      this.blockMenu.destroy();
      this.blockMenu = null;
    }
    if (this.aiPanel) {
      this.aiPanel.destroy();
      this.aiPanel = null;
    }
    if (this.toolbar) {
      this.toolbar.destroy();
      this.toolbar = null;
    }
    if (this.editor) {
      this.editor.destroy();
      this.editor = null;
    }
    this._listeners = {};
    this.wrapper.removeAttribute('data-initialized');
  }

  // ─── Event System ──────────────────────────────────────────────

  /**
   * Register an event listener.
   * @param {string} event - Event name: 'change', 'focus', 'blur', 'selectionUpdate'
   * @param {Function} callback
   * @returns {TiptapEditor} For chaining
   */
  on(event, callback) {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    this._listeners[event].push(callback);
    return this;
  }

  /**
   * Remove an event listener.
   * @param {string} event
   * @param {Function} callback
   * @returns {TiptapEditor}
   */
  off(event, callback) {
    if (!this._listeners[event]) return this;
    this._listeners[event] = this._listeners[event].filter((cb) => cb !== callback);
    return this;
  }

  /**
   * Emit an event to all registered listeners.
   * @private
   * @param {string} event
   * @param {*} data
   */
  _emit(event, data) {
    if (!this._listeners[event]) return;
    this._listeners[event].forEach((cb) => cb(data));
  }
}
