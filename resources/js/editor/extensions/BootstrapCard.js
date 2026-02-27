/**
 * BootstrapCard – Tiptap Extension
 *
 * Represents a Bootstrap 5 Card component.
 * Supports optional header, body (block+ content), optional footer, and border color.
 */

import { Node, mergeAttributes } from '@tiptap/core';

/**
 * Allowed border color variants (Bootstrap contextual colors).
 * @type {string[]}
 */
export const CARD_BORDER_COLORS = [
  'primary',
  'secondary',
  'success',
  'danger',
  'warning',
  'info',
  'light',
  'dark',
];

const BootstrapCard = Node.create({
  name: 'bootstrapCard',

  group: 'block',

  content: 'block+',

  defining: true,

  isolating: true,

  addAttributes() {
    return {
      headerText: {
        default: null,
        parseHTML: (element) => {
          const header = element.querySelector('.card-header');
          return header ? header.textContent : null;
        },
        renderHTML: () => ({}), // handled in renderHTML
      },
      footerText: {
        default: null,
        parseHTML: (element) => {
          const footer = element.querySelector('.card-footer');
          return footer ? footer.textContent : null;
        },
        renderHTML: () => ({}),
      },
      borderColor: {
        default: null,
        parseHTML: (element) => {
          const classes = element.className || '';
          for (const color of CARD_BORDER_COLORS) {
            if (classes.includes(`border-${color}`)) {
              return color;
            }
          }
          return null;
        },
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div.card',
        getAttrs: (element) => {
          const classes = element.className || '';
          if (!classes.includes('card')) return false;
          return {};
        },
      },
      {
        tag: 'div[data-type="bootstrap-card"]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const { headerText, footerText, borderColor } = node.attrs;

    const classes = ['card'];
    if (borderColor && CARD_BORDER_COLORS.includes(borderColor)) {
      classes.push(`border-${borderColor}`);
    }

    // Build the card structure:
    // <div class="card" data-type="bootstrap-card">
    //   [optional: <div class="card-header">...</div>]
    //   <div class="card-body"> ...content (0 = hole)... </div>
    //   [optional: <div class="card-footer">...</div>]
    // </div>
    const children = [];

    if (headerText) {
      children.push([
        'div',
        { class: 'card-header', contenteditable: 'false' },
        headerText,
      ]);
    }

    // Card body wraps the editable content (0 = ProseMirror content hole)
    children.push(['div', { class: 'card-body' }, 0]);

    if (footerText) {
      children.push([
        'div',
        { class: 'card-footer', contenteditable: 'false' },
        footerText,
      ]);
    }

    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'bootstrap-card',
        class: classes.join(' '),
      }),
      ...children,
    ];
  },

  addCommands() {
    return {
      /**
       * Insert a new Bootstrap Card at the current position.
       * @param {Object} attrs - Card attributes
       * @param {string|null} attrs.headerText
       * @param {string|null} attrs.footerText
       * @param {string|null} attrs.borderColor
       */
      insertBootstrapCard:
        (attrs = {}) =>
        ({ commands }) => {
          const { headerText = null, footerText = null, borderColor = null } = attrs;
          return commands.insertContent({
            type: this.name,
            attrs: { headerText, footerText, borderColor },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Card content...' }],
              },
            ],
          });
        },

      /**
       * Update attributes of the current Bootstrap Card.
       * @param {Object} attrs - Partial card attributes to update
       */
      updateBootstrapCard:
        (attrs) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, attrs);
        },

      /**
       * Delete the current Bootstrap Card.
       */
      deleteBootstrapCard:
        () =>
        ({ commands }) => {
          return commands.deleteNode(this.name);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor }) => {
        const { $anchor } = editor.state.selection;

        // Walk up from cursor to find card node
        for (let d = $anchor.depth; d > 0; d--) {
          const node = $anchor.node(d);
          if (node.type.name === this.name && node.textContent.length === 0) {
            return editor.commands.deleteBootstrapCard();
          }
        }

        return false;
      },
    };
  },
});

export default BootstrapCard;
