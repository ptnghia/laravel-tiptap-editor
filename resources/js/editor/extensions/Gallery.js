/**
 * Gallery – Tiptap Extension
 *
 * Block node that renders a grid of images using Bootstrap grid.
 * Supports configurable columns (2-6), gap, and lightbox attribute.
 */

import { Node, mergeAttributes } from '@tiptap/core';

/**
 * Default gallery column count.
 * @type {number}
 */
const DEFAULT_COLUMNS = 3;

/**
 * Valid column counts.
 * @type {number[]}
 */
const VALID_COLUMNS = [2, 3, 4, 6];

const Gallery = Node.create({
  name: 'gallery',

  group: 'block',

  draggable: true,

  /**
   * A gallery contains galleryImage nodes.
   */
  content: 'galleryImage+',

  addAttributes() {
    return {
      columns: {
        default: DEFAULT_COLUMNS,
        parseHTML: (el) => {
          const val = parseInt(el.getAttribute('data-columns'), 10);
          return VALID_COLUMNS.includes(val) ? val : DEFAULT_COLUMNS;
        },
        renderHTML: (attrs) => ({ 'data-columns': attrs.columns }),
      },
      gap: {
        default: 2,
        parseHTML: (el) => {
          const val = parseInt(el.getAttribute('data-gap'), 10);
          return val >= 0 && val <= 5 ? val : 2;
        },
        renderHTML: (attrs) => ({ 'data-gap': attrs.gap }),
      },
      lightbox: {
        default: false,
        parseHTML: (el) => el.getAttribute('data-lightbox') === 'true',
        renderHTML: (attrs) => (attrs.lightbox ? { 'data-lightbox': 'true' } : {}),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="gallery"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const cols = HTMLAttributes['data-columns'] || DEFAULT_COLUMNS;
    const gap = HTMLAttributes['data-gap'] ?? 2;

    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'gallery',
        class: `row g-${gap} tiptap-gallery`,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      /**
       * Insert a gallery with image sources.
       * @param {Object} options
       * @param {Array<{src: string, alt?: string}>} options.images - Array of image objects
       * @param {number} [options.columns=3] - Number of columns
       * @param {number} [options.gap=2] - Gap between images (0-5)
       * @param {boolean} [options.lightbox=false] - Enable lightbox
       */
      insertGallery:
        (options = {}) =>
        ({ commands }) => {
          const { images = [], columns = DEFAULT_COLUMNS, gap = 2, lightbox = false } = options;

          // Need at least one image
          if (images.length === 0) return false;

          const colSize = Math.floor(12 / columns);

          const galleryContent = images.map((img) => ({
            type: 'galleryImage',
            attrs: {
              src: img.src || '',
              alt: img.alt || '',
              colClass: `col-${colSize}`,
            },
          }));

          return commands.insertContent({
            type: this.name,
            attrs: { columns, gap, lightbox },
            content: galleryContent,
          });
        },

      /**
       * Change the number of columns in the current gallery.
       * @param {number} columns
       */
      setGalleryColumns:
        (columns) =>
        ({ commands }) => {
          if (!VALID_COLUMNS.includes(columns)) return false;
          return commands.updateAttributes(this.name, { columns });
        },

      /**
       * Toggle lightbox on the current gallery.
       */
      toggleGalleryLightbox:
        () =>
        ({ commands, editor }) => {
          const attrs = editor.getAttributes(this.name);
          return commands.updateAttributes(this.name, { lightbox: !attrs.lightbox });
        },
    };
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const dom = document.createElement('div');
      dom.setAttribute('data-type', 'gallery');
      dom.style.position = 'relative';

      const contentDOM = document.createElement('div');
      contentDOM.className = 'row tiptap-gallery';

      const applyAttrs = (attrs) => {
        const { columns, gap, lightbox } = attrs;
        const g = gap ?? 2;

        contentDOM.className = `row g-${g} tiptap-gallery`;
        if (lightbox) contentDOM.setAttribute('data-lightbox', 'true');
        else contentDOM.removeAttribute('data-lightbox');
        contentDOM.setAttribute('data-columns', columns || DEFAULT_COLUMNS);
        contentDOM.setAttribute('data-gap', g);

        // Remove old edit button if any
        const oldBtn = dom.querySelector('.tiptap-node-edit-btn');
        if (oldBtn) oldBtn.remove();

        // Edit overlay button
        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'tiptap-node-edit-btn';
        editBtn.title = 'Edit gallery (double-click)';
        editBtn.innerHTML = '<i class="bi bi-pencil-square"></i>';
        editBtn.contentEditable = 'false';
        editBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          openModal();
        });
        dom.appendChild(editBtn);
      };

      const openModal = () => {
        const toolbar = editor._tiptapToolbar;
        if (toolbar?.galleryModal) {
          // Extract images from child nodes
          const images = [];
          node.content.forEach(child => {
            if (child.type.name === 'galleryImage') {
              images.push({ src: child.attrs.src, alt: child.attrs.alt || '' });
            }
          });

          toolbar.galleryModal.open({
            columns: node.attrs.columns,
            gap: node.attrs.gap,
            lightbox: node.attrs.lightbox,
            images,
          });
        }
      };

      dom.addEventListener('dblclick', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openModal();
      });

      dom.appendChild(contentDOM);
      applyAttrs(node.attrs);

      return {
        dom,
        contentDOM,
        update(updatedNode) {
          if (updatedNode.type.name !== 'gallery') return false;
          applyAttrs(updatedNode.attrs);
          return true;
        },
        destroy() {},
      };
    };
  },
});

/**
 * GalleryImage – child node of Gallery.
 * Represents a single image within the gallery grid.
 */
const GalleryImage = Node.create({
  name: 'galleryImage',

  /**
   * Only valid inside a gallery.
   */
  group: '',

  draggable: true,

  /**
   * Leaf node – no nested content.
   */
  content: '',

  /**
   * Inline: false (block-level within gallery).
   */
  inline: false,

  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (el) => {
          const img = el.querySelector('img');
          return img ? img.getAttribute('src') : null;
        },
      },
      alt: {
        default: '',
        parseHTML: (el) => {
          const img = el.querySelector('img');
          return img ? img.getAttribute('alt') || '' : '';
        },
      },
      colClass: {
        default: 'col-4',
        parseHTML: (el) => {
          const classes = el.className.split(' ');
          const colClass = classes.find((c) => c.startsWith('col-'));
          return colClass || 'col-4';
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="gallery-image"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, alt, colClass } = HTMLAttributes;

    return [
      'div',
      {
        'data-type': 'gallery-image',
        class: `${colClass || 'col-4'} tiptap-gallery__item`,
      },
      [
        'img',
        {
          src: src || '',
          alt: alt || '',
          class: 'img-fluid rounded',
          loading: 'lazy',
        },
      ],
    ];
  },
});

export { Gallery, GalleryImage };
export default Gallery;
