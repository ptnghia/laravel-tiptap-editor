/**
 * CustomVideo – Tiptap Extension
 *
 * Controlled video embed extension with provider whitelist.
 * Supports YouTube, Vimeo, and direct MP4 URLs.
 */

import { Node, mergeAttributes } from '@tiptap/core';

/**
 * Video provider configurations.
 * @type {Object.<string, Object>}
 */
const PROVIDERS = {
  youtube: {
    regex: /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/,
    embedUrl: (id) => `https://www.youtube-nocookie.com/embed/${id}`,
    name: 'YouTube',
  },
  vimeo: {
    regex: /vimeo\.com\/(\d+)/,
    embedUrl: (id) => `https://player.vimeo.com/video/${id}`,
    name: 'Vimeo',
  },
};

/**
 * Detect the provider and video ID from a URL.
 * @param {string} url
 * @returns {{ provider: string, videoId: string } | null}
 */
function detectProvider(url) {
  for (const [name, config] of Object.entries(PROVIDERS)) {
    const match = url.match(config.regex);
    if (match && match[1]) {
      return { provider: name, videoId: match[1] };
    }
  }
  // Check if it's a direct MP4 link
  if (/\.(mp4|webm)(\?|$)/i.test(url)) {
    return { provider: 'mp4', videoId: url };
  }
  return null;
}

const CustomVideo = Node.create({
  name: 'customVideo',

  group: 'block',

  atom: true,

  draggable: true,

  addAttributes() {
    return {
      provider: {
        default: 'youtube',
        parseHTML: (el) => el.getAttribute('data-provider') || 'youtube',
      },
      videoId: {
        default: null,
        parseHTML: (el) => el.getAttribute('data-video-id') || null,
      },
      url: {
        default: null,
        parseHTML: (el) => {
          const iframe = el.querySelector('iframe');
          if (iframe) return iframe.getAttribute('src');
          const video = el.querySelector('video source');
          if (video) return video.getAttribute('src');
          return el.getAttribute('data-url') || null;
        },
      },
      title: {
        default: '',
        parseHTML: (el) => {
          const iframe = el.querySelector('iframe');
          return iframe?.getAttribute('title') || '';
        },
      },
      width: {
        default: 560,
      },
      height: {
        default: 315,
      },
      caption: {
        default: '',
        parseHTML: (el) => {
          const fig = el.querySelector('figcaption');
          return fig?.textContent || '';
        },
      },
      aspectRatio: {
        default: '16x9',
        parseHTML: (el) => {
          const cls = el.className || '';
          const match = cls.match(/ratio-(\d+x\d+)/);
          return match ? match[1] : '16x9';
        },
      },
      alignment: {
        default: 'center',
        parseHTML: (el) => el.getAttribute('data-alignment') || 'center',
      },
      widthStyle: {
        default: null,
        parseHTML: (el) => {
          const style = el.getAttribute('style') || '';
          const match = style.match(/width:\s*(\d+(?:\.\d+)?(?:px|%))/);
          return match ? match[1] : null;
        },
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'div[data-type="custom-video"]' },
      { tag: 'figure[data-type="custom-video"]' },
      { tag: 'div.ratio.ratio-16x9' },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const { provider, videoId, url, title, aspectRatio, alignment, widthStyle, caption } = node.attrs;

    const ratio = aspectRatio || '16x9';
    const alignClass = alignment === 'left' ? 'text-start' : alignment === 'right' ? 'text-end' : 'text-center';
    const styleAttr = widthStyle ? `width:${widthStyle}` : '';
    const figureClass = `tiptap-video-figure ${alignClass}`;

    const wrapperAttrs = mergeAttributes(HTMLAttributes, {
      'data-type': 'custom-video',
      'data-provider': provider,
      'data-video-id': videoId || '',
      'data-url': url || '',
      'data-alignment': alignment || 'center',
      class: `ratio ratio-${ratio}`,
    });

    // Build inner media element
    let mediaEl;
    if (provider === 'mp4') {
      mediaEl = [
        'div',
        wrapperAttrs,
        [
          'video',
          { controls: 'true', class: 'w-100', title: title || '' },
          ['source', { src: url || videoId || '', type: 'video/mp4' }],
        ],
      ];
    } else {
      const providerConfig = PROVIDERS[provider];
      const embedSrc = providerConfig ? providerConfig.embedUrl(videoId) : '';
      mediaEl = [
        'div',
        wrapperAttrs,
        [
          'iframe',
          {
            src: embedSrc,
            title: title || '',
            allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
            allowfullscreen: 'true',
            loading: 'lazy',
            frameborder: '0',
          },
        ],
      ];
    }

    // Wrap in figure with alignment/width
    const figureAttrs = { class: figureClass };
    if (styleAttr) figureAttrs.style = styleAttr;

    if (caption) {
      return ['figure', figureAttrs, mediaEl, ['figcaption', {}, caption]];
    }
    return ['figure', figureAttrs, mediaEl];
  },

  addCommands() {
    return {
      /**
       * Insert a custom video from a URL.
       * Auto-detects provider (YouTube, Vimeo, MP4).
       * @param {Object} attrs - { url, title? }
       */
      insertCustomVideo:
        (attrs = {}) =>
        ({ commands }) => {
          const detected = detectProvider(attrs.url || '');
          if (!detected) {
            // Could not detect provider
            console.warn('[CustomVideo] Unsupported video URL:', attrs.url);
            return false;
          }

          return commands.insertContent({
            type: this.name,
            attrs: {
              provider: attrs.provider || detected.provider,
              videoId: attrs.videoId || detected.videoId,
              url: attrs.url,
              title: attrs.title || '',
              caption: attrs.caption || '',
              aspectRatio: attrs.aspectRatio || '16x9',
              alignment: attrs.alignment || 'center',
              widthStyle: attrs.widthStyle || null,
            },
          });
        },

      /**
       * Update the current video attributes.
       */
      updateCustomVideo:
        (attrs) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, attrs);
        },

      /**
       * Delete the current custom video.
       */
      deleteCustomVideo:
        () =>
        ({ commands }) => {
          return commands.deleteNode(this.name);
        },
    };
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const dom = document.createElement('div');
      dom.setAttribute('data-type', 'custom-video');
      dom.contentEditable = 'false';

      const { provider, videoId, url, title, aspectRatio, alignment, widthStyle, caption } = node.attrs;
      const ratio = aspectRatio || '16x9';

      // Outer figure with alignment + width
      const figure = document.createElement('figure');
      figure.className = `tiptap-video-figure ${alignment === 'left' ? 'text-start' : alignment === 'right' ? 'text-end' : 'text-center'}`;
      if (widthStyle) figure.style.width = widthStyle;

      // Ratio wrapper
      const ratioDiv = document.createElement('div');
      ratioDiv.className = `ratio ratio-${ratio} tiptap-video-wrapper`;
      ratioDiv.setAttribute('data-type', 'custom-video');
      ratioDiv.setAttribute('data-provider', provider);

      if (provider === 'mp4') {
        const video = document.createElement('video');
        video.controls = true;
        video.className = 'w-100';
        video.title = title || '';
        const source = document.createElement('source');
        source.src = url || videoId || '';
        source.type = 'video/mp4';
        video.appendChild(source);
        ratioDiv.appendChild(video);
      } else {
        const iframe = document.createElement('iframe');
        const providerConfig = PROVIDERS[provider];
        iframe.src = providerConfig ? providerConfig.embedUrl(videoId) : '';
        iframe.title = title || '';
        iframe.allow =
          'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        iframe.loading = 'lazy';
        iframe.frameBorder = '0';
        ratioDiv.appendChild(iframe);
      }

      figure.appendChild(ratioDiv);

      // Caption
      if (caption) {
        const figcap = document.createElement('figcaption');
        figcap.textContent = caption;
        figure.appendChild(figcap);
      }

      dom.appendChild(figure);

      // Double click to edit via modal
      dom.addEventListener('dblclick', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (editor._tiptapToolbar?.videoModal) {
          editor._tiptapToolbar.videoModal.open(node.attrs);
        }
      });

      return {
        dom,
        update(updatedNode) {
          if (updatedNode.type.name !== 'customVideo') return false;

          const p = updatedNode.attrs.provider;
          const vid = updatedNode.attrs.videoId;
          const r = updatedNode.attrs.aspectRatio || '16x9';
          const al = updatedNode.attrs.alignment || 'center';
          const ws = updatedNode.attrs.widthStyle;
          const cap = updatedNode.attrs.caption || '';

          // Rebuild content
          dom.innerHTML = '';

          const newFigure = document.createElement('figure');
          newFigure.className = `tiptap-video-figure ${al === 'left' ? 'text-start' : al === 'right' ? 'text-end' : 'text-center'}`;
          if (ws) newFigure.style.width = ws;

          const newRatio = document.createElement('div');
          newRatio.className = `ratio ratio-${r} tiptap-video-wrapper`;
          newRatio.setAttribute('data-provider', p);

          if (p === 'mp4') {
            const video = document.createElement('video');
            video.controls = true;
            video.className = 'w-100';
            const source = document.createElement('source');
            source.src = updatedNode.attrs.url || vid || '';
            source.type = 'video/mp4';
            video.appendChild(source);
            newRatio.appendChild(video);
          } else {
            const iframe = document.createElement('iframe');
            const config = PROVIDERS[p];
            iframe.src = config ? config.embedUrl(vid) : '';
            iframe.title = updatedNode.attrs.title || '';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;
            iframe.loading = 'lazy';
            iframe.frameBorder = '0';
            newRatio.appendChild(iframe);
          }

          newFigure.appendChild(newRatio);

          if (cap) {
            const figcap = document.createElement('figcaption');
            figcap.textContent = cap;
            newFigure.appendChild(figcap);
          }

          dom.appendChild(newFigure);

          return true;
        },
        destroy() {},
      };
    };
  },
});

export { detectProvider, PROVIDERS };
export default CustomVideo;
