/**
 * SlashCommands – Tiptap Extension
 *
 * Notion-style slash commands menu. Type "/" to trigger a command palette
 * that allows quick insertion of headings, lists, images, layouts,
 * components, and other block types.
 *
 * Built on @tiptap/suggestion. Pure vanilla JS – no React/Vue.
 */

import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { PluginKey } from '@tiptap/pm/state';

/**
 * Plugin key for the slash commands suggestion.
 */
const SlashCommandsPluginKey = new PluginKey('slashCommands');

/**
 * Default slash command items grouped by category.
 * Each item has: id, label, description, icon (Bootstrap Icons class), group, command.
 *
 * @type {Array<Object>}
 */
const DEFAULT_COMMAND_ITEMS = [
  // ── Text ──────────────────────────────
  {
    id: 'paragraph',
    label: 'Paragraph',
    description: 'Plain text block',
    icon: 'text-paragraph',
    group: 'Text',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setParagraph().run();
    },
  },
  {
    id: 'heading1',
    label: 'Heading 1',
    description: 'Big section heading',
    icon: 'type-h1',
    group: 'Text',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleHeading({ level: 1 }).run();
    },
  },
  {
    id: 'heading2',
    label: 'Heading 2',
    description: 'Medium section heading',
    icon: 'type-h2',
    group: 'Text',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleHeading({ level: 2 }).run();
    },
  },
  {
    id: 'heading3',
    label: 'Heading 3',
    description: 'Small section heading',
    icon: 'type-h3',
    group: 'Text',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleHeading({ level: 3 }).run();
    },
  },

  // ── Lists ─────────────────────────────
  {
    id: 'bulletList',
    label: 'Bullet List',
    description: 'Unordered list',
    icon: 'list-ul',
    group: 'Lists',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    id: 'orderedList',
    label: 'Ordered List',
    description: 'Numbered list',
    icon: 'list-ol',
    group: 'Lists',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },

  // ── Blocks ────────────────────────────
  {
    id: 'blockquote',
    label: 'Blockquote',
    description: 'Quotation block',
    icon: 'blockquote-left',
    group: 'Blocks',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    id: 'codeBlock',
    label: 'Code Block',
    description: 'Syntax-highlighted code',
    icon: 'code-square',
    group: 'Blocks',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
  {
    id: 'horizontalRule',
    label: 'Divider',
    description: 'Horizontal separator line',
    icon: 'hr',
    group: 'Blocks',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },

  // ── Media ─────────────────────────────
  {
    id: 'image',
    label: 'Image',
    description: 'Upload or embed an image',
    icon: 'image',
    group: 'Media',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      // Trigger the toolbar image handler via custom event
      const event = new CustomEvent('tiptap:insert-image', { bubbles: true });
      editor.view.dom.dispatchEvent(event);
    },
  },
  {
    id: 'video',
    label: 'Video',
    description: 'YouTube, Vimeo, or MP4',
    icon: 'play-btn',
    group: 'Media',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      const url = prompt('Enter video URL (YouTube, Vimeo, or MP4):');
      if (url) {
        editor.chain().focus().insertCustomVideo({ url }).run();
      }
    },
  },

  // ── Table ─────────────────────────────
  {
    id: 'table',
    label: 'Table',
    description: '3×3 table with header',
    icon: 'table',
    group: 'Insert',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    },
  },

  // ── Layout ────────────────────────────
  {
    id: 'row2col',
    label: '2 Columns',
    description: 'Two equal columns',
    icon: 'layout-split',
    group: 'Layout',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertBootstrapRow('2-col').run();
    },
  },
  {
    id: 'row3col',
    label: '3 Columns',
    description: 'Three equal columns',
    icon: 'grid-3x3',
    group: 'Layout',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertBootstrapRow('3-col').run();
    },
  },
  {
    id: 'rowSidebarLeft',
    label: 'Sidebar Left',
    description: 'Narrow + wide column',
    icon: 'layout-sidebar',
    group: 'Layout',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertBootstrapRow('1-2').run();
    },
  },

  // ── Components ────────────────────────
  {
    id: 'alert',
    label: 'Alert',
    description: 'Bootstrap alert box',
    icon: 'exclamation-triangle',
    group: 'Components',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertBootstrapAlert('info').run();
    },
  },
  {
    id: 'card',
    label: 'Card',
    description: 'Bootstrap card with header',
    icon: 'card-heading',
    group: 'Components',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertBootstrapCard({ headerText: null }).run();
    },
  },
];

/**
 * Filter command items by query string.
 * Matches against label, description, and group (case-insensitive).
 *
 * @param {Array} items
 * @param {string} query
 * @returns {Array}
 */
function filterItems(items, query) {
  if (!query) return items;
  const q = query.toLowerCase();
  return items.filter(
    (item) =>
      item.label.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.group.toLowerCase().includes(q)
  );
}

/**
 * Group items by their `group` property.
 *
 * @param {Array} items
 * @returns {Object.<string, Array>}
 */
function groupItems(items) {
  const groups = {};
  items.forEach((item) => {
    const g = item.group || 'Other';
    if (!groups[g]) groups[g] = [];
    groups[g].push(item);
  });
  return groups;
}

/**
 * Create the slash commands popup renderer (vanilla JS).
 * Returns an object with onStart, onUpdate, onKeyDown, onExit methods.
 */
function createSlashCommandsRenderer() {
  let popup = null;
  let selectedIndex = 0;
  let currentItems = [];
  let commandCallback = null;

  function createPopupElement() {
    const el = document.createElement('div');
    el.className = 'tiptap-slash-menu';
    el.setAttribute('role', 'listbox');
    el.style.display = 'none';
    document.body.appendChild(el);
    return el;
  }

  function renderItems(items) {
    if (!popup) return;

    currentItems = items;
    const grouped = groupItems(items);

    let html = '';
    let globalIndex = 0;

    if (items.length === 0) {
      html = '<div class="tiptap-slash-menu__empty">No matching commands</div>';
    } else {
      for (const [groupName, groupItemsArr] of Object.entries(grouped)) {
        html += `<div class="tiptap-slash-menu__group-label">${groupName}</div>`;

        groupItemsArr.forEach((item) => {
          const isSelected = globalIndex === selectedIndex;
          html += `
            <button
              type="button"
              class="tiptap-slash-menu__item${isSelected ? ' tiptap-slash-menu__item--selected' : ''}"
              data-index="${globalIndex}"
              role="option"
              aria-selected="${isSelected}"
            >
              <span class="tiptap-slash-menu__icon"><i class="bi bi-${item.icon}"></i></span>
              <span class="tiptap-slash-menu__text">
                <span class="tiptap-slash-menu__label">${item.label}</span>
                <span class="tiptap-slash-menu__description">${item.description}</span>
              </span>
            </button>
          `;
          globalIndex++;
        });
      }
    }

    popup.innerHTML = html;

    // Bind click handlers
    popup.querySelectorAll('.tiptap-slash-menu__item').forEach((btn) => {
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        selectItem(idx);
      });

      btn.addEventListener('mouseenter', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        selectedIndex = idx;
        renderItems(currentItems);
      });
    });

    // Scroll selected item into view
    const selectedEl = popup.querySelector('.tiptap-slash-menu__item--selected');
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }

  function selectItem(index) {
    const item = currentItems[index];
    if (item && commandCallback) {
      commandCallback(item);
    }
  }

  function positionPopup(clientRect) {
    if (!popup || !clientRect) return;

    const rect = typeof clientRect === 'function' ? clientRect() : clientRect;
    if (!rect) return;

    popup.style.position = 'fixed';
    popup.style.left = `${rect.left}px`;
    popup.style.top = `${rect.bottom + 4}px`;
    popup.style.display = 'block';

    // Ensure popup doesn't go off-screen (right)
    const popupRect = popup.getBoundingClientRect();
    if (popupRect.right > window.innerWidth - 8) {
      popup.style.left = `${window.innerWidth - popupRect.width - 8}px`;
    }

    // If popup goes below viewport, show above cursor
    if (popupRect.bottom > window.innerHeight - 8) {
      popup.style.top = `${rect.top - popupRect.height - 4}px`;
    }
  }

  return {
    onStart(props) {
      if (!popup) {
        popup = createPopupElement();
      }

      selectedIndex = 0;
      commandCallback = (item) => {
        item.command({
          editor: props.editor,
          range: props.range,
        });
      };

      renderItems(props.items);
      positionPopup(props.clientRect);
    },

    onUpdate(props) {
      selectedIndex = 0;
      commandCallback = (item) => {
        item.command({
          editor: props.editor,
          range: props.range,
        });
      };

      renderItems(props.items);
      positionPopup(props.clientRect);
    },

    onKeyDown(props) {
      const { event } = props;

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        selectedIndex = (selectedIndex - 1 + currentItems.length) % currentItems.length;
        renderItems(currentItems);
        return true;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        selectedIndex = (selectedIndex + 1) % currentItems.length;
        renderItems(currentItems);
        return true;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        selectItem(selectedIndex);
        return true;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        if (popup) popup.style.display = 'none';
        return true;
      }

      return false;
    },

    onExit() {
      if (popup) {
        popup.style.display = 'none';
      }
      currentItems = [];
      commandCallback = null;
    },
  };
}

/**
 * SlashCommands Tiptap Extension.
 *
 * Usage:
 *   import SlashCommands from './extensions/SlashCommands';
 *   extensions: [SlashCommands]
 *
 * Type "/" in the editor to trigger the command menu.
 *
 * @param {Object} options
 * @param {Array} [options.commands] - Custom command items (overrides defaults)
 * @param {Function} [options.filterFn] - Custom filter function
 */
const SlashCommands = Extension.create({
  name: 'slashCommands',

  addOptions() {
    return {
      commands: null,
      filterFn: null,
    };
  },

  addProseMirrorPlugins() {
    const commandItems = this.options.commands || DEFAULT_COMMAND_ITEMS;
    const filterFn = this.options.filterFn || filterItems;

    return [
      Suggestion({
        editor: this.editor,
        char: '/',
        pluginKey: SlashCommandsPluginKey,
        startOfLine: false,
        items: ({ query }) => filterFn(commandItems, query),
        render: createSlashCommandsRenderer,
      }),
    ];
  },
});

export { DEFAULT_COMMAND_ITEMS, filterItems, groupItems };
export default SlashCommands;
