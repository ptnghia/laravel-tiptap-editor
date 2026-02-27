/**
 * BootstrapAlert – Tiptap Extension
 *
 * Represents a Bootstrap 5 Alert component.
 * Supports all Bootstrap contextual types (primary, secondary, success, etc.).
 */

import { Node, mergeAttributes } from '@tiptap/core';

/**
 * Allowed alert types (Bootstrap contextual classes).
 * @type {string[]}
 */
export const ALERT_TYPES = [
  'primary',
  'secondary',
  'success',
  'danger',
  'warning',
  'info',
  'light',
  'dark',
];

const BootstrapAlert = Node.create({
  name: 'bootstrapAlert',

  group: 'block',

  content: 'inline*',

  defining: true,

  addAttributes() {
    return {
      type: {
        default: 'info',
        parseHTML: (element) => {
          const classes = element.className || '';
          for (const alertType of ALERT_TYPES) {
            if (classes.includes(`alert-${alertType}`)) {
              return alertType;
            }
          }
          return 'info';
        },
        renderHTML: () => ({}), // handled in renderHTML
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div.alert',
        getAttrs: (element) => {
          const classes = element.className || '';
          if (!classes.includes('alert')) return false;
          return {};
        },
      },
      {
        tag: 'div[data-type="bootstrap-alert"]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const alertType = ALERT_TYPES.includes(node.attrs.type) ? node.attrs.type : 'info';

    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'bootstrap-alert',
        'data-alert-type': alertType,
        class: `alert alert-${alertType}`,
        role: 'alert',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      /**
       * Insert a new Bootstrap Alert at the current position.
       * @param {string} type - Alert type (primary, secondary, success, etc.)
       */
      insertBootstrapAlert:
        (type = 'info') =>
        ({ commands }) => {
          const alertType = ALERT_TYPES.includes(type) ? type : 'info';
          return commands.insertContent({
            type: this.name,
            attrs: { type: alertType },
            content: [{ type: 'text', text: 'Alert message...' }],
          });
        },

      /**
       * Set the type of the current Bootstrap Alert.
       * @param {string} type - Alert type
       */
      setAlertType:
        (type) =>
        ({ commands }) => {
          const alertType = ALERT_TYPES.includes(type) ? type : 'info';
          return commands.updateAttributes(this.name, { type: alertType });
        },

      /**
       * Delete the current Bootstrap Alert.
       */
      deleteBootstrapAlert:
        () =>
        ({ commands }) => {
          return commands.deleteNode(this.name);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      // Delete empty alert on Backspace
      Backspace: ({ editor }) => {
        const { $anchor } = editor.state.selection;
        const node = $anchor.node($anchor.depth);

        if (
          node.type.name === this.name &&
          node.textContent.length === 0
        ) {
          return editor.commands.deleteBootstrapAlert();
        }

        return false;
      },
    };
  },
});

export default BootstrapAlert;
