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

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const dom = document.createElement('div');
      dom.setAttribute('data-type', 'bootstrap-alert');
      dom.style.position = 'relative';

      const contentDOM = document.createElement('div');
      contentDOM.style.minHeight = '1.5em';

      const applyAttrs = (attrs) => {
        const alertType = ALERT_TYPES.includes(attrs.type) ? attrs.type : 'info';
        dom.className = `alert alert-${alertType}`;
        dom.setAttribute('data-alert-type', alertType);
        dom.setAttribute('role', 'alert');
        dom.style.position = 'relative';

        // Remove old edit button & dropdown
        dom.querySelectorAll('.tiptap-node-edit-btn, .tiptap-alert-type-picker').forEach(el => el.remove());

        // Ensure contentDOM is in the dom
        if (!dom.contains(contentDOM)) {
          dom.appendChild(contentDOM);
        }

        // Edit button
        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'tiptap-node-edit-btn';
        editBtn.title = 'Change alert type';
        editBtn.innerHTML = '<i class="bi bi-pencil-square"></i>';
        editBtn.contentEditable = 'false';
        editBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          togglePicker();
        });
        dom.appendChild(editBtn);
      };

      // Type picker dropdown
      const createPicker = () => {
        const picker = document.createElement('div');
        picker.className = 'tiptap-alert-type-picker';
        picker.contentEditable = 'false';
        picker.style.cssText = 'position:absolute;top:6px;right:36px;display:flex;gap:3px;z-index:6;background:rgba(255,255,255,.95);border:1px solid rgba(0,0,0,.15);border-radius:6px;padding:4px 6px;box-shadow:0 2px 8px rgba(0,0,0,.12);flex-wrap:wrap;max-width:200px;';

        ALERT_TYPES.forEach(type => {
          const swatch = document.createElement('button');
          swatch.type = 'button';
          swatch.className = `btn btn-${type} btn-sm`;
          swatch.style.cssText = 'width:24px;height:24px;padding:0;border-radius:4px;font-size:0;';
          swatch.title = type.charAt(0).toUpperCase() + type.slice(1);
          swatch.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            editor.chain().focus().setAlertType(type).run();
            picker.remove();
          });
          picker.appendChild(swatch);
        });

        return picker;
      };

      const togglePicker = () => {
        const existing = dom.querySelector('.tiptap-alert-type-picker');
        if (existing) {
          existing.remove();
        } else {
          dom.appendChild(createPicker());
        }
      };

      applyAttrs(node.attrs);

      return {
        dom,
        contentDOM,
        update(updatedNode) {
          if (updatedNode.type.name !== 'bootstrapAlert') return false;
          applyAttrs(updatedNode.attrs);
          return true;
        },
        destroy() {},
      };
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
