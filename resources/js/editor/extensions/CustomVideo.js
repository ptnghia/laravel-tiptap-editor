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
    };
  },

  parseHTML() {
    return [
      { tag: 'div[data-type="custom-video"]' },
      { tag: 'div.ratio.ratio-16x9' },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const { provider, videoId, url, title } = node.attrs;

    const wrapperAttrs = mergeAttributes(HTMLAttributes, {
      'data-type': 'custom-video',
      'data-provider': provider,
      'data-video-id': videoId || '',
      'data-url': url || '',
      class: 'ratio ratio-16x9',
    });

    if (provider === 'mp4') {
      return [
        'div',
        wrapperAttrs,
        [
          'video',
          {
            controls: 'true',
            class: 'w-100',
            title: title || '',
          },
          ['source', { src: url || videoId || '', type: 'video/mp4' }],
        ],
      ];
    }

    // Embed URL from provider
    const providerConfig = PROVIDERS[provider];
    const embedSrc = providerConfig ? providerConfig.embedUrl(videoId) : '';

    return [
      'div',
      wrapperAttrs,
      [
        'iframe',
        {
          src: embedSrc,
          title: title || '',
          allow:
            'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
          allowfullscreen: 'true',
          loading: 'lazy',
          frameborder: '0',
        },
      ],
    ];
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
              provider: detected.provider,
              videoId: detected.videoId,
              url: attrs.url,
              title: attrs.title || '',
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
      dom.className = 'ratio ratio-16x9 tiptap-video-wrapper';
      dom.contentEditable = 'false';

      const { provider, videoId, url, title } = node.attrs;
      dom.setAttribute('data-provider', provider);

      if (provider === 'mp4') {
        const video = document.createElement('video');
        video.controls = true;
        video.className = 'w-100';
        video.title = title || '';
        const source = document.createElement('source');
        source.src = url || videoId || '';
        source.type = 'video/mp4';
        video.appendChild(source);
        dom.appendChild(video);
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
        dom.appendChild(iframe);
      }

      // Double click to edit
      dom.addEventListener('dblclick', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const newUrl = prompt('Video URL:', node.attrs.url || '');
        if (!newUrl) return;

        const detected = detectProvider(newUrl);
        if (!detected) {
          alert('Unsupported video URL. Supported: YouTube, Vimeo, MP4.');
          return;
        }

        const pos = getPos();
        if (typeof pos !== 'number') return;

        editor
          .chain()
          .focus()
          .command(({ tr }) => {
            tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              provider: detected.provider,
              videoId: detected.videoId,
              url: newUrl,
            });
            return true;
          })
          .run();
      });

      return {
        dom,
        update(updatedNode) {
          if (updatedNode.type.name !== 'customVideo') return false;

          const p = updatedNode.attrs.provider;
          const vid = updatedNode.attrs.videoId;

          // Rebuild content
          dom.innerHTML = '';
          dom.setAttribute('data-provider', p);

          if (p === 'mp4') {
            const video = document.createElement('video');
            video.controls = true;
            video.className = 'w-100';
            const source = document.createElement('source');
            source.src = updatedNode.attrs.url || vid || '';
            source.type = 'video/mp4';
            video.appendChild(source);
            dom.appendChild(video);
          } else {
            const iframe = document.createElement('iframe');
            const config = PROVIDERS[p];
            iframe.src = config ? config.embedUrl(vid) : '';
            iframe.title = updatedNode.attrs.title || '';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;
            iframe.loading = 'lazy';
            iframe.frameBorder = '0';
            dom.appendChild(iframe);
          }

          return true;
        },
        destroy() {},
      };
    };
  },
});

export { detectProvider, PROVIDERS };
export default CustomVideo;
