/**
 * CustomImage – Tiptap Extension
 *
 * Enhanced image extension with upload support, caption, alignment,
 * mediaId reference, and lazy loading.
 */

import { Node, mergeAttributes } from '@tiptap/core';

/**
 * Allowed alignment values.
 * @type {string[]}
 */
const ALIGNMENTS = ['left', 'center', 'right'];

const CustomImage = Node.create({
  name: 'customImage',

  group: 'block',

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (el) => el.querySelector('img')?.getAttribute('src') || el.getAttribute('src'),
      },
      alt: {
        default: '',
        parseHTML: (el) => el.querySelector('img')?.getAttribute('alt') || el.getAttribute('alt') || '',
      },
      title: {
        default: null,
        parseHTML: (el) => el.querySelector('img')?.getAttribute('title') || el.getAttribute('title'),
      },
      caption: {
        default: null,
        parseHTML: (el) => {
          const figcaption = el.querySelector('figcaption');
          return figcaption ? figcaption.textContent : null;
        },
      },
      width: {
        default: null,
        parseHTML: (el) => {
          const img = el.querySelector('img') || el;
          const w = img.getAttribute('width');
          return w ? parseInt(w, 10) : null;
        },
      },
      height: {
        default: null,
        parseHTML: (el) => {
          const img = el.querySelector('img') || el;
          const h = img.getAttribute('height');
          return h ? parseInt(h, 10) : null;
        },
      },
      alignment: {
        default: 'center',
        parseHTML: (el) => {
          if (el.classList.contains('text-start') || el.classList.contains('text-left')) return 'left';
          if (el.classList.contains('text-end') || el.classList.contains('text-right')) return 'right';
          return 'center';
        },
      },
      mediaId: {
        default: null,
        parseHTML: (el) => el.getAttribute('data-media-id') || null,
      },
      loading: {
        default: 'lazy',
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'figure[data-type="custom-image"]' },
      { tag: 'figure.tiptap-image' },
      {
        tag: 'img[src]',
        getAttrs: (el) => {
          // Don't match images inside figures (handled above)
          if (el.closest('figure')) return false;
          return { src: el.getAttribute('src') };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const { src, alt, title, caption, width, height, alignment, mediaId, loading } = node.attrs;

    const alignClass = alignment === 'left' ? 'text-start' : alignment === 'right' ? 'text-end' : 'text-center';

    const figureAttrs = mergeAttributes(HTMLAttributes, {
      'data-type': 'custom-image',
      class: `tiptap-image ${alignClass}`,
    });

    if (mediaId) {
      figureAttrs['data-media-id'] = mediaId;
    }

    const imgAttrs = {
      src: src || '',
      alt: alt || '',
      class: 'img-fluid',
      loading: loading || 'lazy',
    };
    if (title) imgAttrs.title = title;
    if (width) imgAttrs.width = String(width);
    if (height) imgAttrs.height = String(height);

    const children = [['img', imgAttrs]];

    if (caption) {
      children.push(['figcaption', { class: 'figure-caption' }, caption]);
    }

    return ['figure', figureAttrs, ...children];
  },

  addCommands() {
    return {
      /**
       * Insert a custom image.
       * @param {Object} attrs - Image attributes (src, alt, etc.)
       */
      insertCustomImage:
        (attrs = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              src: attrs.src || '',
              alt: attrs.alt || '',
              title: attrs.title || null,
              caption: attrs.caption || null,
              width: attrs.width || null,
              height: attrs.height || null,
              alignment: ALIGNMENTS.includes(attrs.alignment) ? attrs.alignment : 'center',
              mediaId: attrs.mediaId || null,
              loading: attrs.loading || 'lazy',
            },
          });
        },

      /**
       * Update attributes of the current custom image.
       */
      updateCustomImage:
        (attrs) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, attrs);
        },

      /**
       * Delete the current custom image.
       */
      deleteCustomImage:
        () =>
        ({ commands }) => {
          return commands.deleteNode(this.name);
        },
    };
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const dom = document.createElement('figure');
      dom.classList.add('tiptap-image');
      dom.setAttribute('data-type', 'custom-image');
      dom.contentEditable = 'false';

      const { src, alt, title, caption, width, height, alignment, mediaId } = node.attrs;

      // Alignment
      const alignClass = alignment === 'left' ? 'text-start' : alignment === 'right' ? 'text-end' : 'text-center';
      dom.classList.add(alignClass);

      if (mediaId) {
        dom.setAttribute('data-media-id', mediaId);
      }

      // Image element
      const img = document.createElement('img');
      img.src = src || '';
      img.alt = alt || '';
      img.className = 'img-fluid';
      img.loading = 'lazy';
      if (title) img.title = title;
      if (width) img.width = width;
      if (height) img.height = height;
      dom.appendChild(img);

      // Caption
      if (caption) {
        const cap = document.createElement('figcaption');
        cap.className = 'figure-caption';
        cap.textContent = caption;
        dom.appendChild(cap);
      }

      // Double-click to edit
      dom.addEventListener('dblclick', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const newAlt = prompt('Alt text:', node.attrs.alt || '');
        if (newAlt === null) return;

        const newCaption = prompt('Caption (optional):', node.attrs.caption || '');

        const pos = getPos();
        if (typeof pos !== 'number') return;

        editor
          .chain()
          .focus()
          .command(({ tr }) => {
            tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              alt: newAlt,
              caption: newCaption || null,
            });
            return true;
          })
          .run();
      });

      return {
        dom,
        update(updatedNode) {
          if (updatedNode.type.name !== 'customImage') return false;

          img.src = updatedNode.attrs.src || '';
          img.alt = updatedNode.attrs.alt || '';
          if (updatedNode.attrs.title) img.title = updatedNode.attrs.title;
          if (updatedNode.attrs.width) img.width = updatedNode.attrs.width;
          if (updatedNode.attrs.height) img.height = updatedNode.attrs.height;

          // Update alignment
          dom.classList.remove('text-start', 'text-center', 'text-end');
          const newAlignClass = updatedNode.attrs.alignment === 'left'
            ? 'text-start'
            : updatedNode.attrs.alignment === 'right'
              ? 'text-end'
              : 'text-center';
          dom.classList.add(newAlignClass);

          // Update caption
          let figcaption = dom.querySelector('figcaption');
          if (updatedNode.attrs.caption) {
            if (!figcaption) {
              figcaption = document.createElement('figcaption');
              figcaption.className = 'figure-caption';
              dom.appendChild(figcaption);
            }
            figcaption.textContent = updatedNode.attrs.caption;
          } else if (figcaption) {
            figcaption.remove();
          }

          return true;
        },
        destroy() {},
      };
    };
  },
});

export default CustomImage;
