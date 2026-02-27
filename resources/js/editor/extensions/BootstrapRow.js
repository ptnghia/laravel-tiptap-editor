/**
 * BootstrapRow – Tiptap Extension
 *
 * Represents a Bootstrap 5 `.row` container.
 * Only allows `bootstrapCol` children.
 */

import { Node, mergeAttributes } from '@tiptap/core';

/**
 * Layout presets for quick insertion.
 * Each preset defines column classes for the grid.
 * @type {Object.<string, string[]>}
 */
export const LAYOUT_PRESETS = {
  '1-col':  ['col-12'],
  '2-col':  ['col-md-6', 'col-md-6'],
  '3-col':  ['col-md-4', 'col-md-4', 'col-md-4'],
  '4-col':  ['col-md-3', 'col-md-3', 'col-md-3', 'col-md-3'],
  '1-2':    ['col-md-4', 'col-md-8'],
  '2-1':    ['col-md-8', 'col-md-4'],
  '1-1-2':  ['col-md-3', 'col-md-3', 'col-md-6'],
  '2-1-1':  ['col-md-6', 'col-md-3', 'col-md-3'],
};

const BootstrapRow = Node.create({
  name: 'bootstrapRow',

  group: 'block',

  content: 'bootstrapCol+',

  defining: true,

  isolating: true,

  addAttributes() {
    return {
      gutter: {
        default: 3,
        parseHTML: (element) => {
          const classes = element.className || '';
          const match = classes.match(/g-(\d)/);
          return match ? parseInt(match[1], 10) : 3;
        },
        renderHTML: (attributes) => {
          return {}; // handled in renderHTML
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div.row',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const gutter = node.attrs.gutter ?? 3;
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'bootstrap-row',
        class: `row g-${gutter}`,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      /**
       * Insert a Bootstrap row with a given layout preset.
       * @param {string} preset - One of LAYOUT_PRESETS keys
       * @param {number} [gutter=3] - Bootstrap gutter class (0-5)
       */
      insertBootstrapRow:
        (preset = '2-col', gutter = 3) =>
        ({ commands, editor }) => {
          const colClasses = LAYOUT_PRESETS[preset] || LAYOUT_PRESETS['2-col'];

          const columns = colClasses.map((colClass) => ({
            type: 'bootstrapCol',
            attrs: { colClass },
            content: [
              {
                type: 'paragraph',
              },
            ],
          }));

          return commands.insertContent({
            type: 'bootstrapRow',
            attrs: { gutter },
            content: columns,
          });
        },

      /**
       * Add a column to the current row.
       * @param {string} [colClass='col'] - Bootstrap column class
       */
      addColumnToRow:
        (colClass = 'col') =>
        ({ state, commands, editor }) => {
          const { $from } = state.selection;

          // Find the parent bootstrapRow node
          let rowPos = null;
          for (let depth = $from.depth; depth > 0; depth--) {
            if ($from.node(depth).type.name === 'bootstrapRow') {
              rowPos = $from.before(depth);
              break;
            }
          }

          if (rowPos === null) return false;

          const rowNode = state.doc.nodeAt(rowPos);
          if (!rowNode) return false;

          // Insert a new column at the end of the row
          const insertPos = rowPos + rowNode.nodeSize - 1;

          return commands.insertContentAt(insertPos, {
            type: 'bootstrapCol',
            attrs: { colClass },
            content: [{ type: 'paragraph' }],
          });
        },

      /**
       * Remove the current column from its parent row.
       * Won't remove if it's the last column.
       */
      removeColumn:
        () =>
        ({ state, dispatch, tr }) => {
          const { $from } = state.selection;

          // Find the parent bootstrapCol
          let colDepth = null;
          for (let depth = $from.depth; depth > 0; depth--) {
            if ($from.node(depth).type.name === 'bootstrapCol') {
              colDepth = depth;
              break;
            }
          }

          if (colDepth === null) return false;

          // Find the parent row
          const rowDepth = colDepth - 1;
          if ($from.node(rowDepth).type.name !== 'bootstrapRow') return false;

          const rowNode = $from.node(rowDepth);

          // Don't remove the last column
          if (rowNode.childCount <= 1) return false;

          if (dispatch) {
            const colStart = $from.before(colDepth);
            const colEnd = $from.after(colDepth);
            tr.delete(colStart, colEnd);
            dispatch(tr);
          }

          return true;
        },

      /**
       * Change the column class of the current column.
       * @param {string} colClass - New Bootstrap column class
       */
      setColumnClass:
        (colClass) =>
        ({ state, dispatch, tr }) => {
          const { $from } = state.selection;

          for (let depth = $from.depth; depth > 0; depth--) {
            if ($from.node(depth).type.name === 'bootstrapCol') {
              if (dispatch) {
                tr.setNodeMarkup($from.before(depth), undefined, {
                  ...$from.node(depth).attrs,
                  colClass,
                });
                dispatch(tr);
              }
              return true;
            }
          }

          return false;
        },

      /**
       * Change the gutter of the current row.
       * @param {number} gutter - Bootstrap gutter value (0-5)
       */
      setRowGutter:
        (gutter) =>
        ({ state, dispatch, tr }) => {
          const { $from } = state.selection;

          for (let depth = $from.depth; depth > 0; depth--) {
            if ($from.node(depth).type.name === 'bootstrapRow') {
              if (dispatch) {
                tr.setNodeMarkup($from.before(depth), undefined, {
                  ...$from.node(depth).attrs,
                  gutter: Math.max(0, Math.min(5, gutter)),
                });
                dispatch(tr);
              }
              return true;
            }
          }

          return false;
        },

      /**
       * Delete the entire row.
       */
      deleteBootstrapRow:
        () =>
        ({ state, dispatch, tr }) => {
          const { $from } = state.selection;

          for (let depth = $from.depth; depth > 0; depth--) {
            if ($from.node(depth).type.name === 'bootstrapRow') {
              if (dispatch) {
                const rowStart = $from.before(depth);
                const rowEnd = $from.after(depth);
                tr.delete(rowStart, rowEnd);
                dispatch(tr);
              }
              return true;
            }
          }

          return false;
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      // Backspace on empty column in row with single column: delete entire row
      Backspace: ({ editor }) => {
        const { state } = editor;
        const { $from } = state.selection;

        for (let depth = $from.depth; depth > 0; depth--) {
          if ($from.node(depth).type.name === 'bootstrapCol') {
            const colNode = $from.node(depth);
            const rowNode = $from.node(depth - 1);

            // Check if col is empty (only has an empty paragraph)
            const isEmpty =
              colNode.childCount === 1 &&
              colNode.firstChild?.type.name === 'paragraph' &&
              colNode.firstChild?.content.size === 0;

            if (isEmpty && rowNode.type.name === 'bootstrapRow' && rowNode.childCount === 1) {
              return editor.commands.deleteBootstrapRow();
            }

            break;
          }
        }

        return false;
      },
    };
  },
});

export default BootstrapRow;
export { BootstrapRow };
