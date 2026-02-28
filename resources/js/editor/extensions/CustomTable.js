/**
 * CustomTable – Extended Tiptap Table with Bootstrap 5 style attributes.
 *
 * Extends the standard @tiptap/extension-table to support:
 *  - bordered (table-bordered)
 *  - striped (table-striped)
 *  - hover (table-hover)
 *  - small (table-sm)
 *  - alignMiddle (align-middle)
 *
 * Also adds updateTableStyles command for editing styles after insertion.
 * Wraps table in .table-responsive for proper Bootstrap rendering.
 */

import Table from '@tiptap/extension-table';
import { TableView } from '@tiptap/extension-table';
import { mergeAttributes } from '@tiptap/core';

/**
 * Build Bootstrap classes string from table attrs.
 */
function buildTableClasses(attrs) {
  const classes = ['table'];
  if (attrs.bordered) classes.push('table-bordered');
  if (attrs.striped) classes.push('table-striped');
  if (attrs.hover) classes.push('table-hover');
  if (attrs.small) classes.push('table-sm');
  if (attrs.alignMiddle) classes.push('align-middle');
  return classes.join(' ');
}

/**
 * Extended TableView that adds an edit button and applies Bootstrap table classes.
 */
class CustomTableView extends TableView {
  constructor(node, cellMinWidth, editor) {
    super(node, cellMinWidth);
    this.editor = editor;

    // Apply responsive wrapper
    this.dom.className = 'tableWrapper table-responsive';
    this.dom.style.position = 'relative';

    // Apply Bootstrap classes to <table>
    this.table.className = buildTableClasses(node.attrs);

    // Edit button
    this.editBtn = document.createElement('button');
    this.editBtn.type = 'button';
    this.editBtn.className = 'tiptap-node-edit-btn';
    this.editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
    this.editBtn.contentEditable = 'false';
    this.editBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const toolbar = this.editor._tiptapToolbar;
      if (toolbar && toolbar.tableModal) {
        const styles = {
          bordered: !!this.node.attrs.bordered,
          striped: !!this.node.attrs.striped,
          hover: !!this.node.attrs.hover,
          small: !!this.node.attrs.small,
          alignMiddle: !!this.node.attrs.alignMiddle,
        };
        toolbar.tableModal.open(styles);
      }
    });
    this.dom.appendChild(this.editBtn);
  }

  update(node) {
    const result = super.update(node);
    if (result) {
      // Re-apply Bootstrap classes
      this.table.className = buildTableClasses(node.attrs);
    }
    return result;
  }
}

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
      alignMiddle: {
        default: false,
        parseHTML: (el) => el.classList.contains('align-middle'),
      },
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const classes = ['table'];
    if (node.attrs.bordered) classes.push('table-bordered');
    if (node.attrs.striped) classes.push('table-striped');
    if (node.attrs.hover) classes.push('table-hover');
    if (node.attrs.small) classes.push('table-sm');
    if (node.attrs.alignMiddle) classes.push('align-middle');

    const attrs = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
      class: classes.join(' '),
    });

    return ['div', { class: 'table-responsive' }, ['table', attrs, ['tbody', 0]]];
  },

  addNodeView() {
    const editor = this.editor;
    return ({ node }) => {
      return new CustomTableView(node, this.options.cellMinWidth, editor);
    };
  },

  addCommands() {
    return {
      ...this.parent?.(),

      /**
       * Update style attributes of the table containing the cursor.
       * @param {Object} styles - { bordered, striped, hover, small, alignMiddle }
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
                alignMiddle: !!node.attrs.alignMiddle,
              };
            }
          }
          return null;
        },
    };
  },
});

export default CustomTable;
