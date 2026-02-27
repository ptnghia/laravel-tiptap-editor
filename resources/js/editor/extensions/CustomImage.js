/**
 * CustomImage – Tiptap Extension
 *
 * Enhanced image extension with upload support, caption, alignment,
 * widthStyle (px / %), extra CSS class, link wrapping, and modal editing.
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
      // ── New in v1.1 ──
      widthStyle: {
        default: null,
        parseHTML: (el) => el.style?.width || el.getAttribute('data-width-style') || null,
      },
      extraClass: {
        default: null,
        parseHTML: (el) => el.getAttribute('data-extra-class') || null,
      },
      linkUrl: {
        default: null,
        parseHTML: (el) => el.querySelector('a')?.getAttribute('href') || el.getAttribute('data-link-url') || null,
      },
      linkTarget: {
        default: null,
        parseHTML: (el) => el.querySelector('a')?.getAttribute('target') || null,
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
    const {
      src, alt, title, caption, width, height,
      alignment, mediaId, loading,
      widthStyle, extraClass, linkUrl, linkTarget,
    } = node.attrs;

    const alignClass = alignment === 'left' ? 'text-start'
      : alignment === 'right' ? 'text-end' : 'text-center';

    let figClass = `tiptap-image ${alignClass}`;
    if (extraClass) figClass += ' ' + extraClass;

    const figureAttrs = mergeAttributes(HTMLAttributes, {
      'data-type': 'custom-image',
      class: figClass,
    });

    if (mediaId)    figureAttrs['data-media-id']    = mediaId;
    if (widthStyle) figureAttrs['data-width-style']  = widthStyle;
    if (extraClass) figureAttrs['data-extra-class']  = extraClass;
    if (linkUrl)    figureAttrs['data-link-url']     = linkUrl;
    if (widthStyle) figureAttrs.style               = `width:${widthStyle}`;

    const imgAttrs = {
      src: src || '',
      alt: alt || '',
      class: 'img-fluid',
      loading: loading || 'lazy',
    };
    if (title)  imgAttrs.title  = title;
    if (width)  imgAttrs.width  = String(width);
    if (height) imgAttrs.height = String(height);

    const imgEl = ['img', imgAttrs];

    // Wrap in <a> if linkUrl is set
    const imageContent = linkUrl
      ? ['a', { href: linkUrl, target: linkTarget || null, rel: linkTarget === '_blank' ? 'noopener noreferrer' : null }, imgEl]
      : imgEl;

    const children = [imageContent];
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
              src:        attrs.src        || '',
              alt:        attrs.alt        || '',
              title:      attrs.title      || null,
              caption:    attrs.caption    || null,
              width:      attrs.width      || null,
              height:     attrs.height     || null,
              alignment:  ALIGNMENTS.includes(attrs.alignment) ? attrs.alignment : 'center',
              mediaId:    attrs.mediaId    || null,
              loading:    attrs.loading    || 'lazy',
              widthStyle: attrs.widthStyle || null,
              extraClass: attrs.extraClass || null,
              linkUrl:    attrs.linkUrl    || null,
              linkTarget: attrs.linkTarget || null,
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

      // Helper: rebuild the full figure DOM from node attrs
      const applyAttrs = (attrs) => {
        const {
          src, alt, title, caption,
          width, height, alignment, mediaId,
          widthStyle, extraClass, linkUrl, linkTarget,
        } = attrs;

        // Clean previous content
        dom.innerHTML = '';

        // Alignment
        dom.classList.remove('text-start', 'text-center', 'text-end');
        dom.classList.add(
          alignment === 'left' ? 'text-start'
            : alignment === 'right' ? 'text-end'
              : 'text-center',
        );

        // Extra class on figure
        if (extraClass) dom.setAttribute('data-extra-class', extraClass);

        // Width style on figure
        if (widthStyle) {
          dom.style.width = widthStyle;
          dom.style.display = 'inline-block'; // so width applies correctly
        } else {
          dom.style.width  = '';
          dom.style.display = '';
        }

        if (mediaId) dom.setAttribute('data-media-id', mediaId);

        // Build img
        const img = document.createElement('img');
        img.src        = src || '';
        img.alt        = alt || '';
        img.className  = 'img-fluid';
        img.loading    = 'lazy';
        if (title)  img.title  = title;
        if (width)  img.width  = width;
        if (height) img.height = height;

        // Wrap in <a> if needed
        if (linkUrl) {
          const a = document.createElement('a');
          a.href = linkUrl;
          if (linkTarget) a.target = linkTarget;
          if (linkTarget === '_blank') a.rel = 'noopener noreferrer';
          a.appendChild(img);
          dom.appendChild(a);
        } else {
          dom.appendChild(img);
        }

        // Caption
        if (caption) {
          const cap = document.createElement('figcaption');
          cap.className   = 'figure-caption';
          cap.textContent = caption;
          dom.appendChild(cap);
        }

        // Edit overlay button (shown on hover)
        const editBtn = document.createElement('button');
        editBtn.type      = 'button';
        editBtn.className = 'tiptap-image-edit-btn';
        editBtn.title     = 'Edit image (double-click)';
        editBtn.innerHTML = '<i class="bi bi-pencil-square"></i>';
        editBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          openModal();
        });
        dom.appendChild(editBtn);
      };

      // Open the ImageModal for this image
      const openModal = () => {
        // Access ImageModal via the toolbar stored on the editor instance
        const toolbar = editor._tiptapToolbar;
        if (toolbar?.imageModal) {
          const pos = typeof getPos === 'function' ? getPos() : null;
          if (pos !== null) {
            // Select the node so updateCustomImage targets it
            editor.chain().focus().setNodeSelection(pos).run();
          }
          toolbar.imageModal.open(node.attrs);
        }
      };

      // Double-click: open modal
      dom.addEventListener('dblclick', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openModal();
      });

      // Initial render
      applyAttrs(node.attrs);

      return {
        dom,
        update(updatedNode) {
          if (updatedNode.type.name !== 'customImage') return false;
          applyAttrs(updatedNode.attrs);
          return true;
        },
        destroy() {},
      };
    };
  },
});

export default CustomImage;
