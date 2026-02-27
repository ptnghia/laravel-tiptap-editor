/**
 * BootstrapCol – Tiptap Extension
 *
 * Represents a single Bootstrap 5 column inside a `.row`.
 * Allows any block content (paragraphs, headings, images, etc.).
 */

import { Node, mergeAttributes } from '@tiptap/core';

const BootstrapCol = Node.create({
  name: 'bootstrapCol',

  // Not in standard group – only allowed as direct child of bootstrapRow
  group: '',

  content: 'block+',

  defining: true,

  isolating: true,

  addAttributes() {
    return {
      colClass: {
        default: 'col',
        parseHTML: (element) => {
          const classes = element.className || '';
          // Extract Bootstrap column classes (col, col-*, col-md-*, etc.)
          const colMatches = classes.match(/col(?:-(?:sm|md|lg|xl|xxl))?(?:-\d{1,2})?/g);
          return colMatches ? colMatches.join(' ') : 'col';
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
        tag: 'div',
        getAttrs: (element) => {
          const classes = element.className || '';
          // Must have at least one col-* class
          if (/\bcol\b|\bcol-/.test(classes)) {
            return {};
          }
          return false;
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const colClass = node.attrs.colClass || 'col';
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'bootstrap-col',
        class: colClass,
      }),
      0,
    ];
  },
});

export default BootstrapCol;
export { BootstrapCol };
