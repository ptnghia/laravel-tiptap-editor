/**
 * BlockMenu – Tiptap Floating Block Actions
 *
 * Shows a floating action button (⠿ drag handle) on the left side of blocks.
 * On click, displays a context menu with: Duplicate, Delete, Move Up, Move Down,
 * and Change block type.
 *
 * Pure vanilla JS implementation – no React/Vue dependency.
 */

/**
 * Block action definitions.
 * @type {Array<Object>}
 */
const BLOCK_ACTIONS = [
  {
    id: 'duplicate',
    label: 'Duplicate',
    icon: 'copy',
    separator: false,
  },
  {
    id: 'moveUp',
    label: 'Move Up',
    icon: 'arrow-up',
    separator: false,
  },
  {
    id: 'moveDown',
    label: 'Move Down',
    icon: 'arrow-down',
    separator: false,
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: 'trash',
    separator: true,
    danger: true,
  },
];

/**
 * Block type change options.
 * @type {Array<Object>}
 */
const BLOCK_TYPE_OPTIONS = [
  { id: 'paragraph', label: 'Paragraph', icon: 'text-paragraph' },
  { id: 'heading1', label: 'Heading 1', icon: 'type-h1' },
  { id: 'heading2', label: 'Heading 2', icon: 'type-h2' },
  { id: 'heading3', label: 'Heading 3', icon: 'type-h3' },
  { id: 'bulletList', label: 'Bullet List', icon: 'list-ul' },
  { id: 'orderedList', label: 'Ordered List', icon: 'list-ol' },
  { id: 'blockquote', label: 'Blockquote', icon: 'blockquote-left' },
  { id: 'codeBlock', label: 'Code Block', icon: 'code-square' },
];

export default class BlockMenu {
  /**
   * @param {import('./Editor').default} editorInstance - The TiptapEditor instance
   */
  constructor(editorInstance) {
    this.editorInstance = editorInstance;
    this.editor = editorInstance.editor;
    this.wrapper = editorInstance.wrapper;

    /** @type {HTMLElement|null} */
    this.handleEl = null;

    /** @type {HTMLElement|null} */
    this.menuEl = null;

    /** @type {HTMLElement|null} */
    this.currentBlock = null;

    /** @type {number|null} */
    this.currentNodePos = null;

    this._isMenuOpen = false;
    this._hideTimeout = null;

    this._build();
    this._bindEvents();
  }

  /**
   * Build the drag handle + context menu DOM.
   * @private
   */
  _build() {
    // ── Drag Handle ──────────────────────
    this.handleEl = document.createElement('button');
    this.handleEl.type = 'button';
    this.handleEl.className = 'tiptap-block-handle';
    this.handleEl.innerHTML = '<i class="bi bi-grip-vertical"></i>';
    this.handleEl.setAttribute('aria-label', 'Block actions');
    this.handleEl.setAttribute('title', 'Block actions');
    this.handleEl.style.display = 'none';

    // ── Context Menu ─────────────────────
    this.menuEl = document.createElement('div');
    this.menuEl.className = 'tiptap-block-menu';
    this.menuEl.setAttribute('role', 'menu');
    this.menuEl.style.display = 'none';

    // Actions section
    BLOCK_ACTIONS.forEach((action) => {
      if (action.separator) {
        const sep = document.createElement('div');
        sep.className = 'tiptap-block-menu__separator';
        this.menuEl.appendChild(sep);
      }

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `tiptap-block-menu__item${action.danger ? ' tiptap-block-menu__item--danger' : ''}`;
      btn.setAttribute('data-action', action.id);
      btn.setAttribute('role', 'menuitem');
      btn.innerHTML = `<i class="bi bi-${action.icon}"></i> <span>${action.label}</span>`;
      this.menuEl.appendChild(btn);
    });

    // Turn Into section
    const turnIntoSep = document.createElement('div');
    turnIntoSep.className = 'tiptap-block-menu__separator';
    this.menuEl.appendChild(turnIntoSep);

    const turnIntoLabel = document.createElement('div');
    turnIntoLabel.className = 'tiptap-block-menu__group-label';
    turnIntoLabel.textContent = 'Turn into';
    this.menuEl.appendChild(turnIntoLabel);

    BLOCK_TYPE_OPTIONS.forEach((opt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tiptap-block-menu__item';
      btn.setAttribute('data-turn-into', opt.id);
      btn.setAttribute('role', 'menuitem');
      btn.innerHTML = `<i class="bi bi-${opt.icon}"></i> <span>${opt.label}</span>`;
      this.menuEl.appendChild(btn);
    });

    this.wrapper.appendChild(this.handleEl);
    this.wrapper.appendChild(this.menuEl);
  }

  /**
   * Bind event listeners.
   * @private
   */
  _bindEvents() {
    // Show handle on mousemove over editor content
    const contentEl = this.editorInstance.contentElement;
    if (contentEl) {
      contentEl.addEventListener('mousemove', (e) => this._onMouseMove(e));
      contentEl.addEventListener('mouseleave', () => this._onMouseLeave());
    }

    // Handle click → show menu
    this.handleEl.addEventListener('click', (e) => {
      e.stopPropagation();
      this._toggleMenu();
    });

    // Prevent handle from stealing focus
    this.handleEl.addEventListener('mousedown', (e) => {
      e.preventDefault();
    });

    // Menu item clicks
    this.menuEl.addEventListener('click', (e) => {
      e.stopPropagation();

      const actionBtn = e.target.closest('[data-action]');
      if (actionBtn) {
        this._executeAction(actionBtn.getAttribute('data-action'));
        return;
      }

      const turnIntoBtn = e.target.closest('[data-turn-into]');
      if (turnIntoBtn) {
        this._executeTurnInto(turnIntoBtn.getAttribute('data-turn-into'));
      }
    });

    // Close menu when clicking elsewhere
    document.addEventListener('click', (e) => {
      if (!this.menuEl.contains(e.target) && !this.handleEl.contains(e.target)) {
        this._closeMenu();
      }
    });

    // Close menu on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this._isMenuOpen) {
        this._closeMenu();
      }
    });

    // Hide handle on editor scroll
    const editorScroll = contentEl?.closest('.ProseMirror') || contentEl;
    if (editorScroll) {
      editorScroll.addEventListener('scroll', () => {
        this._hideHandle();
        this._closeMenu();
      });
    }
  }

  /**
   * Handle mousemove over editor content to position the block handle.
   * @private
   * @param {MouseEvent} e
   */
  _onMouseMove(e) {
    if (this._isMenuOpen) return;

    const el = this._findTopLevelBlock(e.target);
    if (!el || el === this.currentBlock) return;

    this.currentBlock = el;
    this._positionHandle(el);
  }

  /**
   * Handle mouse leaving the editor content area.
   * @private
   */
  _onMouseLeave() {
    if (this._isMenuOpen) return;

    this._hideTimeout = setTimeout(() => {
      if (!this._isMenuOpen) {
        this._hideHandle();
        this.currentBlock = null;
      }
    }, 300);
  }

  /**
   * Find the top-level ProseMirror node element from a target element.
   * @private
   * @param {HTMLElement} target
   * @returns {HTMLElement|null}
   */
  _findTopLevelBlock(target) {
    if (!target || !target.closest) return null;

    const proseMirror = this.editorInstance.contentElement?.querySelector('.ProseMirror');
    if (!proseMirror) return null;

    let node = target;

    // Walk up to find direct child of .ProseMirror
    while (node && node.parentElement !== proseMirror) {
      node = node.parentElement;
    }

    if (!node || node === proseMirror) return null;

    return node;
  }

  /**
   * Position the block handle to the left of a block element.
   * @private
   * @param {HTMLElement} blockEl
   */
  _positionHandle(blockEl) {
    if (!this.handleEl) return;

    clearTimeout(this._hideTimeout);

    const wrapperRect = this.wrapper.getBoundingClientRect();
    const blockRect = blockEl.getBoundingClientRect();

    this.handleEl.style.display = 'flex';
    this.handleEl.style.position = 'absolute';
    this.handleEl.style.left = '-2px';
    this.handleEl.style.top = `${blockRect.top - wrapperRect.top}px`;

    // Resolve the ProseMirror position of this block
    this._resolveNodePos(blockEl);
  }

  /**
   * Resolve the ProseMirror document position of a DOM element.
   * @private
   * @param {HTMLElement} blockEl
   */
  _resolveNodePos(blockEl) {
    try {
      const pos = this.editor.view.posAtDOM(blockEl, 0);
      if (pos != null) {
        // Get the resolved position and find the parent node start
        const resolved = this.editor.state.doc.resolve(pos);
        this.currentNodePos = resolved.before(1);
      }
    } catch {
      this.currentNodePos = null;
    }
  }

  /**
   * Hide the block handle.
   * @private
   */
  _hideHandle() {
    if (this.handleEl) {
      this.handleEl.style.display = 'none';
    }
  }

  /**
   * Toggle the context menu.
   * @private
   */
  _toggleMenu() {
    if (this._isMenuOpen) {
      this._closeMenu();
    } else {
      this._openMenu();
    }
  }

  /**
   * Open the context menu next to the handle.
   * @private
   */
  _openMenu() {
    if (!this.menuEl || !this.handleEl) return;

    this._isMenuOpen = true;

    const handleRect = this.handleEl.getBoundingClientRect();

    this.menuEl.style.display = 'block';
    this.menuEl.style.position = 'fixed';
    this.menuEl.style.left = `${handleRect.right + 4}px`;
    this.menuEl.style.top = `${handleRect.top}px`;

    // Ensure menu doesn't go off-screen
    requestAnimationFrame(() => {
      const menuRect = this.menuEl.getBoundingClientRect();

      if (menuRect.right > window.innerWidth - 8) {
        this.menuEl.style.left = `${handleRect.left - menuRect.width - 4}px`;
      }
      if (menuRect.bottom > window.innerHeight - 8) {
        this.menuEl.style.top = `${window.innerHeight - menuRect.height - 8}px`;
      }
    });
  }

  /**
   * Close the context menu.
   * @private
   */
  _closeMenu() {
    if (this.menuEl) {
      this.menuEl.style.display = 'none';
    }
    this._isMenuOpen = false;
  }

  /**
   * Execute a block action.
   * @private
   * @param {string} actionId
   */
  _executeAction(actionId) {
    if (this.currentNodePos == null) {
      this._closeMenu();
      return;
    }

    const { state } = this.editor;
    const node = state.doc.nodeAt(this.currentNodePos);
    if (!node) {
      this._closeMenu();
      return;
    }

    switch (actionId) {
      case 'duplicate':
        this._duplicateBlock(node);
        break;
      case 'moveUp':
        this._moveBlock(-1);
        break;
      case 'moveDown':
        this._moveBlock(1);
        break;
      case 'delete':
        this._deleteBlock(node);
        break;
    }

    this._closeMenu();
    this._hideHandle();
    this.currentBlock = null;
  }

  /**
   * Duplicate the current block node.
   * @private
   * @param {Object} node - ProseMirror Node
   */
  _duplicateBlock(node) {
    const endPos = this.currentNodePos + node.nodeSize;
    const copy = node.toJSON();

    this.editor
      .chain()
      .focus()
      .insertContentAt(endPos, copy)
      .run();
  }

  /**
   * Move the current block up or down.
   * @private
   * @param {number} direction - -1 for up, 1 for down
   */
  _moveBlock(direction) {
    const { state } = this.editor;
    const { doc } = state;
    const pos = this.currentNodePos;
    const node = doc.nodeAt(pos);
    if (!node) return;

    const nodeEnd = pos + node.nodeSize;

    if (direction === -1) {
      // Move up: find previous sibling
      const resolved = doc.resolve(pos);
      if (resolved.index(0) === 0) return; // Already first

      const prevPos = resolved.before(1) - 1;
      const resolvedPrev = doc.resolve(prevPos);
      const prevNodePos = resolvedPrev.before(1);

      // Delete current, insert before previous
      const nodeJson = node.toJSON();
      this.editor
        .chain()
        .focus()
        .deleteRange({ from: pos, to: nodeEnd })
        .insertContentAt(prevNodePos, nodeJson)
        .run();
    } else {
      // Move down: find next sibling
      if (nodeEnd >= doc.content.size) return; // Already last

      const nextNode = doc.nodeAt(nodeEnd);
      if (!nextNode) return;

      const nextEnd = nodeEnd + nextNode.nodeSize;
      const nodeJson = node.toJSON();

      // Delete current, insert after next
      this.editor
        .chain()
        .focus()
        .deleteRange({ from: pos, to: nodeEnd })
        .insertContentAt(nextEnd - node.nodeSize, nodeJson)
        .run();
    }
  }

  /**
   * Delete the current block node.
   * @private
   * @param {Object} node - ProseMirror Node
   */
  _deleteBlock(node) {
    const endPos = this.currentNodePos + node.nodeSize;
    this.editor
      .chain()
      .focus()
      .deleteRange({ from: this.currentNodePos, to: endPos })
      .run();
  }

  /**
   * Turn the current block into a different type.
   * @private
   * @param {string} typeId
   */
  _executeTurnInto(typeId) {
    if (this.currentNodePos == null) {
      this._closeMenu();
      return;
    }

    // First, select the block so commands apply to it
    this.editor.commands.setTextSelection(this.currentNodePos + 1);

    switch (typeId) {
      case 'paragraph':
        this.editor.chain().focus().setParagraph().run();
        break;
      case 'heading1':
        this.editor.chain().focus().toggleHeading({ level: 1 }).run();
        break;
      case 'heading2':
        this.editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case 'heading3':
        this.editor.chain().focus().toggleHeading({ level: 3 }).run();
        break;
      case 'bulletList':
        this.editor.chain().focus().toggleBulletList().run();
        break;
      case 'orderedList':
        this.editor.chain().focus().toggleOrderedList().run();
        break;
      case 'blockquote':
        this.editor.chain().focus().toggleBlockquote().run();
        break;
      case 'codeBlock':
        this.editor.chain().focus().toggleCodeBlock().run();
        break;
    }

    this._closeMenu();
    this._hideHandle();
    this.currentBlock = null;
  }

  /**
   * Destroy the block menu and clean up.
   */
  destroy() {
    if (this.handleEl) {
      this.handleEl.remove();
      this.handleEl = null;
    }
    if (this.menuEl) {
      this.menuEl.remove();
      this.menuEl = null;
    }
    this.currentBlock = null;
    this.currentNodePos = null;
    this.editor = null;
    this.editorInstance = null;
  }
}
