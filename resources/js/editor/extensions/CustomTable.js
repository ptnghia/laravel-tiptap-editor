/**
 * CustomTable – Extended Tiptap Table with Bootstrap 5 style attributes.
 *
 * Extends the standard @tiptap/extension-table to support:
 *  - bordered (table-bordered)
 *  - striped (table-striped)
 *  - hover (table-hover)
 *  - small (table-sm)
 *
 * Also adds updateTableStyles command for editing styles after insertion.
 */

import Table from '@tiptap/extension-table';
import { mergeAttributes } from '@tiptap/core';

const CustomTable = Table.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      bordered: {
        default: false,
        parseHTML: (el) => el.classList.contains('table-bordered'),
      },
      striped: {
        default: false,
        parseHTML: (el) => el.classList.contains('table-striped'),
      },
      hover: {
        default: false,
        parseHTML: (el) => el.classList.contains('table-hover'),
      },
      small: {
        default: false,
        parseHTML: (el) => el.classList.contains('table-sm'),
      },
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const classes = [];
    if (node.attrs.bordered) classes.push('table-bordered');
    if (node.attrs.striped) classes.push('table-striped');
    if (node.attrs.hover) classes.push('table-hover');
    if (node.attrs.small) classes.push('table-sm');

    const attrs = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
      class: classes.length ? classes.join(' ') : undefined,
    });

    return ['table', attrs, ['tbody', 0]];
  },

  addCommands() {
    return {
      ...this.parent?.(),

      /**
       * Update style attributes of the table containing the cursor.
       * @param {Object} styles - { bordered, striped, hover, small }
       */
      updateTableStyles:
        (styles) =>
        ({ tr, state, dispatch }) => {
          const { $from } = state.selection;
          for (let d = $from.depth; d > 0; d--) {
            const node = $from.node(d);
            if (node.type.name === 'table') {
              if (dispatch) {
                const pos = $from.before(d);
                tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...styles });
              }
              return true;
            }
          }
          return false;
        },

      /**
       * Get current table style attributes (for edit modal).
       */
      getTableStyles:
        () =>
        ({ state }) => {
          const { $from } = state.selection;
          for (let d = $from.depth; d > 0; d--) {
            const node = $from.node(d);
            if (node.type.name === 'table') {
              return {
                bordered: !!node.attrs.bordered,
                striped: !!node.attrs.striped,
                hover: !!node.attrs.hover,
                small: !!node.attrs.small,
              };
            }
          }
          return null;
        },
    };
  },
});

export default CustomTable;
