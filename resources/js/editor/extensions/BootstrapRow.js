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

/**
 * Horizontal alignment options for Bootstrap rows.
 * @type {Object.<string, string>}
 */
export const ROW_JUSTIFY_OPTIONS = {
  start: 'justify-content-start',
  center: 'justify-content-center',
  end: 'justify-content-end',
  between: 'justify-content-between',
  around: 'justify-content-around',
  evenly: 'justify-content-evenly',
};

/**
 * Vertical alignment options for Bootstrap rows.
 * @type {Object.<string, string>}
 */
export const ROW_ALIGN_OPTIONS = {
  start: 'align-items-start',
  center: 'align-items-center',
  end: 'align-items-end',
  stretch: 'align-items-stretch',
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
        renderHTML: () => ({}),
      },
      justifyContent: {
        default: null,
        parseHTML: (element) => {
          const classes = element.className || '';
          const match = classes.match(/justify-content-(\w+)/);
          return match ? match[1] : null;
        },
        renderHTML: () => ({}),
      },
      alignItems: {
        default: null,
        parseHTML: (element) => {
          const classes = element.className || '';
          const match = classes.match(/align-items-(\w+)/);
          return match ? match[1] : null;
        },
        renderHTML: () => ({}),
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
    const justify = node.attrs.justifyContent;
    const align = node.attrs.alignItems;

    let cls = `row g-${gutter}`;
    if (justify && ROW_JUSTIFY_OPTIONS[justify]) {
      cls += ` ${ROW_JUSTIFY_OPTIONS[justify]}`;
    }
    if (align && ROW_ALIGN_OPTIONS[align]) {
      cls += ` ${ROW_ALIGN_OPTIONS[align]}`;
    }

    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'bootstrap-row',
        class: cls,
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
       * Insert a Bootstrap row with full advanced configuration.
       * @param {Object} config - { columns: [{colClass}], gutter, justifyContent, alignItems }
       */
      insertBootstrapRowAdvanced:
        (config) =>
        ({ commands }) => {
          const { columns = [], gutter = 3, justifyContent = null, alignItems = null } = config;

          const cols = columns.map((col) => ({
            type: 'bootstrapCol',
            attrs: { colClass: col.colClass || 'col' },
            content: [{ type: 'paragraph' }],
          }));

          if (cols.length === 0) {
            cols.push({
              type: 'bootstrapCol',
              attrs: { colClass: 'col' },
              content: [{ type: 'paragraph' }],
            });
          }

          return commands.insertContent({
            type: 'bootstrapRow',
            attrs: { gutter, justifyContent, alignItems },
            content: cols,
          });
        },

      /**
       * Update the current row's attributes and optionally reconfigure columns.
       * @param {Object} config - { columns: [{colClass}], gutter, justifyContent, alignItems }
       */
      updateBootstrapRow:
        (config) =>
        ({ state, dispatch, tr }) => {
          const { $from } = state.selection;
          const { columns, gutter, justifyContent, alignItems } = config;

          // Find the parent bootstrapRow
          let rowDepth = null;
          for (let depth = $from.depth; depth > 0; depth--) {
            if ($from.node(depth).type.name === 'bootstrapRow') {
              rowDepth = depth;
              break;
            }
          }
          if (rowDepth === null) return false;

          if (dispatch) {
            const rowPos = $from.before(rowDepth);
            const rowNode = state.doc.nodeAt(rowPos);
            if (!rowNode) return false;

            // Update row attributes
            tr.setNodeMarkup(rowPos, undefined, {
              ...rowNode.attrs,
              gutter: gutter ?? rowNode.attrs.gutter,
              justifyContent: justifyContent !== undefined ? justifyContent : rowNode.attrs.justifyContent,
              alignItems: alignItems !== undefined ? alignItems : rowNode.attrs.alignItems,
            });

            // Update column classes if provided
            if (columns && columns.length > 0) {
              let offset = 1; // skip row opening
              const existingCount = rowNode.childCount;
              const newCount = columns.length;

              // Update existing columns' classes
              for (let i = 0; i < Math.min(existingCount, newCount); i++) {
                const child = rowNode.child(i);
                const childPos = rowPos + offset;
                tr.setNodeMarkup(childPos, undefined, {
                  ...child.attrs,
                  colClass: columns[i].colClass || 'col',
                });
                offset += child.nodeSize;
              }

              // Add new columns if needed
              if (newCount > existingCount) {
                const insertAt = rowPos + rowNode.nodeSize - 1;
                for (let i = existingCount; i < newCount; i++) {
                  const colNode = state.schema.nodes.bootstrapCol.create(
                    { colClass: columns[i].colClass || 'col' },
                    state.schema.nodes.paragraph.create()
                  );
                  tr.insert(insertAt, colNode);
                }
              }

              // Remove extra columns if needed
              if (newCount < existingCount) {
                // Remove from end to avoid position shifts
                let removeOffset = 1;
                const positions = [];
                for (let i = 0; i < existingCount; i++) {
                  const child = rowNode.child(i);
                  if (i >= newCount) {
                    positions.push({ from: rowPos + removeOffset, to: rowPos + removeOffset + child.nodeSize });
                  }
                  removeOffset += child.nodeSize;
                }
                // Delete in reverse order
                for (let i = positions.length - 1; i >= 0; i--) {
                  tr.delete(positions[i].from, positions[i].to);
                }
              }
            }

            dispatch(tr);
          }

          return true;
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

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const dom = document.createElement('div');
      dom.setAttribute('data-type', 'bootstrap-row');
      dom.style.position = 'relative';

      const applyClasses = (attrs) => {
        const g = attrs.gutter ?? 3;
        const j = attrs.justifyContent;
        const a = attrs.alignItems;
        let cls = `row g-${g}`;
        if (j && ROW_JUSTIFY_OPTIONS[j]) cls += ` ${ROW_JUSTIFY_OPTIONS[j]}`;
        if (a && ROW_ALIGN_OPTIONS[a]) cls += ` ${ROW_ALIGN_OPTIONS[a]}`;
        dom.className = cls;
      };
      applyClasses(node.attrs);

      // Edit button
      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'tiptap-node-edit-btn';
      editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
      editBtn.contentEditable = 'false';
      editBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const pos = getPos();
        const rowNode = editor.state.doc.nodeAt(pos);
        if (!rowNode) return;

        // Collect column info
        const columns = [];
        rowNode.forEach((child) => {
          if (child.type.name === 'bootstrapCol') {
            columns.push({ colClass: child.attrs.colClass || 'col' });
          }
        });

        const attrs = {
          ...rowNode.attrs,
          columns,
        };

        const toolbar = editor._tiptapToolbar;
        if (toolbar && toolbar.layoutModal) {
          toolbar.layoutModal.open(attrs);
        }
      });
      dom.appendChild(editBtn);

      // Content container
      const contentDOM = document.createElement('div');
      contentDOM.style.display = 'contents';
      dom.appendChild(contentDOM);

      return {
        dom,
        contentDOM,
        update: (updatedNode) => {
          if (updatedNode.type.name !== 'bootstrapRow') return false;
          applyClasses(updatedNode.attrs);
          return true;
        },
      };
    };
  },
});

export default BootstrapRow;
export { BootstrapRow };
