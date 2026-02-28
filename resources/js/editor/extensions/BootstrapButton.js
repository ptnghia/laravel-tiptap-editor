/**
 * BootstrapButton – Tiptap Extension
 *
 * Represents a Bootstrap 5 Button (rendered as an <a> tag).
 * Inline node – can be placed within paragraphs.
 * Supports variant, size, outline, and target attributes.
 */

import { Node, mergeAttributes } from '@tiptap/core';

/**
 * Allowed button variants (Bootstrap contextual classes).
 * @type {string[]}
 */
export const BUTTON_VARIANTS = [
  'primary',
  'secondary',
  'success',
  'danger',
  'warning',
  'info',
  'light',
  'dark',
  'link',
];

/**
 * Allowed button sizes.
 * @type {string[]}
 */
export const BUTTON_SIZES = ['sm', 'lg'];

const BootstrapButton = Node.create({
  name: 'bootstrapButton',

  group: 'inline',

  inline: true,

  atom: true, // not editable from inside – click to configure

  addAttributes() {
    return {
      text: {
        default: 'Button',
        parseHTML: (element) => element.textContent || 'Button',
        renderHTML: () => ({}),
      },
      url: {
        default: '#',
        parseHTML: (element) => element.getAttribute('href') || '#',
        renderHTML: () => ({}),
      },
      variant: {
        default: 'primary',
        parseHTML: (element) => {
          const classes = element.className || '';
          // Check outline first
          for (const v of BUTTON_VARIANTS) {
            if (classes.includes(`btn-outline-${v}`)) return v;
          }
          for (const v of BUTTON_VARIANTS) {
            if (classes.includes(`btn-${v}`)) return v;
          }
          return 'primary';
        },
        renderHTML: () => ({}),
      },
      size: {
        default: null,
        parseHTML: (element) => {
          const classes = element.className || '';
          if (classes.includes('btn-sm')) return 'sm';
          if (classes.includes('btn-lg')) return 'lg';
          return null;
        },
        renderHTML: () => ({}),
      },
      outline: {
        default: false,
        parseHTML: (element) => {
          const classes = element.className || '';
          return classes.includes('btn-outline-');
        },
        renderHTML: () => ({}),
      },
      target: {
        default: '_self',
        parseHTML: (element) => element.getAttribute('target') || '_self',
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'a.btn',
        getAttrs: (element) => {
          const classes = element.className || '';
          if (!classes.includes('btn')) return false;
          return {};
        },
      },
      {
        tag: 'span[data-type="bootstrap-button"]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const { text, url, variant, size, outline, target } = node.attrs;

    const safeVariant = BUTTON_VARIANTS.includes(variant) ? variant : 'primary';
    const btnClass = outline ? `btn-outline-${safeVariant}` : `btn-${safeVariant}`;

    const classes = ['btn', btnClass];
    if (size && BUTTON_SIZES.includes(size)) {
      classes.push(`btn-${size}`);
    }

    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'bootstrap-button',
        'data-url': url || '#',
        'data-variant': safeVariant,
        'data-size': size || '',
        'data-outline': outline ? 'true' : 'false',
        'data-target': target || '_self',
        class: classes.join(' '),
        role: 'button',
        contenteditable: 'false',
      }),
      text || 'Button',
    ];
  },

  addCommands() {
    return {
      /**
       * Insert a Bootstrap Button at the current cursor position.
       * @param {Object} attrs - Button attributes
       */
      insertBootstrapButton:
        (attrs = {}) =>
        ({ commands }) => {
          const {
            text = 'Button',
            url = '#',
            variant = 'primary',
            size = null,
            outline = false,
            target = '_self',
          } = attrs;

          return commands.insertContent({
            type: this.name,
            attrs: { text, url, variant, size, outline, target },
          });
        },

      /**
       * Update the current Bootstrap Button's attributes.
       * @param {Object} attrs - Partial attributes to update
       */
      updateBootstrapButton:
        (attrs) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, attrs);
        },

      /**
       * Delete the current Bootstrap Button.
       */
      deleteBootstrapButton:
        () =>
        ({ commands }) => {
          return commands.deleteNode(this.name);
        },
    };
  },

  /**
   * NodeView is needed for proper inline atom click handling.
   * This allows opening a config modal when the button is clicked.
   */
  addNodeView() {
    return ({ node, getPos, editor }) => {
      // Wrap in a container for edit button positioning
      const wrapper = document.createElement('span');
      wrapper.setAttribute('data-type', 'bootstrap-button');
      wrapper.style.position = 'relative';
      wrapper.style.display = 'inline-block';
      wrapper.contentEditable = 'false';

      const dom = document.createElement('span');
      const { text, variant, size, outline, target } = node.attrs;

      const safeVariant = BUTTON_VARIANTS.includes(variant) ? variant : 'primary';
      const btnClass = outline ? `btn-outline-${safeVariant}` : `btn-${safeVariant}`;

      dom.className = `btn ${btnClass}`;
      if (size && BUTTON_SIZES.includes(size)) {
        dom.classList.add(`btn-${size}`);
      }
      dom.setAttribute('role', 'button');
      dom.textContent = text || 'Button';
      dom.style.cursor = 'pointer';
      dom.contentEditable = 'false';

      wrapper.appendChild(dom);

      const openModal = () => {
        const pos = getPos();
        if (typeof pos !== 'number') return;
        const toolbar = editor._tiptapToolbar;
        if (toolbar?.buttonModal) {
          toolbar.buttonModal.open(node.attrs, pos);
        }
      };

      // Edit overlay button
      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'tiptap-node-edit-btn';
      editBtn.title = 'Edit button (double-click)';
      editBtn.innerHTML = '<i class="bi bi-pencil-square"></i>';
      editBtn.contentEditable = 'false';
      editBtn.style.top = '-8px';
      editBtn.style.right = '-8px';
      editBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openModal();
      });
      wrapper.appendChild(editBtn);

      // Double-click to edit button properties via modal
      dom.addEventListener('dblclick', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openModal();
      });

      return {
        dom: wrapper,
        update(updatedNode) {
          if (updatedNode.type.name !== 'bootstrapButton') return false;

          const uVariant = BUTTON_VARIANTS.includes(updatedNode.attrs.variant)
            ? updatedNode.attrs.variant
            : 'primary';
          const uBtnClass = updatedNode.attrs.outline
            ? `btn-outline-${uVariant}`
            : `btn-${uVariant}`;

          dom.className = `btn ${uBtnClass}`;
          if (updatedNode.attrs.size && BUTTON_SIZES.includes(updatedNode.attrs.size)) {
            dom.classList.add(`btn-${updatedNode.attrs.size}`);
          }
          dom.textContent = updatedNode.attrs.text || 'Button';
          return true;
        },
        destroy() {
          // cleanup listeners if needed
        },
      };
    };
  },
});

export default BootstrapButton;
