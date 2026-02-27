/**
 * MediaBrowser – Simple modal for browsing and selecting uploaded media.
 *
 * Creates a Bootstrap-styled modal overlay to browse, search, and select
 * media files for insertion into the editor.
 */

export default class MediaBrowser {
  /**
   * @param {Object} options
   * @param {string} options.browseUrl - API endpoint for browsing media
   * @param {string} options.uploadUrl - API endpoint for uploading media
   * @param {Function} options.onSelect - Callback when media is selected
   * @param {string} [options.type] - Filter type: 'image' | 'video' | null (all)
   */
  constructor(options = {}) {
    this.browseUrl = options.browseUrl || null;
    this.uploadUrl = options.uploadUrl || null;
    this.onSelect = options.onSelect || (() => {});
    this.type = options.type || null;

    /** @type {HTMLElement|null} */
    this.modal = null;

    /** @type {number} */
    this.currentPage = 1;

    /** @type {string} */
    this.searchQuery = '';
  }

  /**
   * Open the media browser modal.
   */
  open() {
    if (this.modal) {
      this.modal.remove();
    }

    this.modal = this._createModal();
    document.body.appendChild(this.modal);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Load media
    this._loadMedia();

    // Focus search after animation
    setTimeout(() => {
      const searchInput = this.modal.querySelector('[data-media-search]');
      if (searchInput) searchInput.focus();
    }, 100);
  }

  /**
   * Close the media browser modal.
   */
  close() {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
    document.body.style.overflow = '';
  }

  /**
   * Create the modal DOM structure.
   * @private
   * @returns {HTMLElement}
   */
  _createModal() {
    const overlay = document.createElement('div');
    overlay.className = 'tiptap-media-browser__overlay';
    overlay.innerHTML = `
      <div class="tiptap-media-browser__dialog">
        <div class="tiptap-media-browser__header">
          <h5 class="tiptap-media-browser__title">Media Browser</h5>
          <button type="button" class="tiptap-media-browser__close" data-media-close aria-label="Close">&times;</button>
        </div>
        <div class="tiptap-media-browser__toolbar">
          <input type="text" data-media-search placeholder="Search files..." class="tiptap-media-browser__search">
          <div class="tiptap-media-browser__filters">
            <button type="button" data-media-filter="" class="tiptap-media-browser__filter-btn active">All</button>
            <button type="button" data-media-filter="image" class="tiptap-media-browser__filter-btn">Images</button>
            <button type="button" data-media-filter="video" class="tiptap-media-browser__filter-btn">Videos</button>
          </div>
          <label class="tiptap-media-browser__upload-btn">
            <input type="file" data-media-upload accept="image/*,video/*" style="display:none">
            <span>Upload</span>
          </label>
        </div>
        <div class="tiptap-media-browser__body" data-media-grid>
          <div class="tiptap-media-browser__loading">Loading...</div>
        </div>
        <div class="tiptap-media-browser__footer" data-media-pagination></div>
      </div>
    `;

    // Bind events
    overlay.querySelector('[data-media-close]').addEventListener('click', () => this.close());

    // Click overlay backdrop to close
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });

    // Escape to close
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        this.close();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    // Search
    const searchInput = overlay.querySelector('[data-media-search]');
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      this.searchQuery = e.target.value;
      searchTimeout = setTimeout(() => {
        this.currentPage = 1;
        this._loadMedia();
      }, 300);
    });

    // Filter buttons
    overlay.querySelectorAll('[data-media-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        overlay.querySelectorAll('[data-media-filter]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.type = btn.getAttribute('data-media-filter') || null;
        this.currentPage = 1;
        this._loadMedia();
      });
    });

    // Upload
    const uploadInput = overlay.querySelector('[data-media-upload]');
    if (uploadInput) {
      uploadInput.addEventListener('change', (e) => this._handleUpload(e));
    }

    return overlay;
  }

  /**
   * Load media from the browse API.
   * @private
   */
  async _loadMedia() {
    if (!this.browseUrl || !this.modal) return;

    const grid = this.modal.querySelector('[data-media-grid]');
    grid.innerHTML = '<div class="tiptap-media-browser__loading">Loading...</div>';

    try {
      const params = new URLSearchParams();
      params.set('page', String(this.currentPage));
      if (this.type) params.set('type', this.type);
      if (this.searchQuery) params.set('search', this.searchQuery);

      const response = await fetch(`${this.browseUrl}?${params.toString()}`, {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to load media');

      const result = await response.json();
      this._renderGrid(result.data || []);
      this._renderPagination(result.pagination || {});
    } catch (err) {
      grid.innerHTML = '<div class="tiptap-media-browser__error">Failed to load media.</div>';
      console.error('[MediaBrowser]', err);
    }
  }

  /**
   * Render media items in the grid.
   * @private
   * @param {Array<Object>} items
   */
  _renderGrid(items) {
    const grid = this.modal?.querySelector('[data-media-grid]');
    if (!grid) return;

    if (items.length === 0) {
      grid.innerHTML = '<div class="tiptap-media-browser__empty">No media found.</div>';
      return;
    }

    grid.innerHTML = '';

    items.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'tiptap-media-browser__item';
      card.setAttribute('data-media-id', item.id);

      if (item.mime_type?.startsWith('image/')) {
        card.innerHTML = `<img src="${item.thumbnail || item.url}" alt="${item.alt || item.filename}" loading="lazy">`;
      } else {
        card.innerHTML = `<div class="tiptap-media-browser__video-thumb"><i class="bi bi-play-btn"></i></div>`;
      }
      card.innerHTML += `<div class="tiptap-media-browser__item-name">${item.filename}</div>`;

      card.addEventListener('click', () => {
        this.onSelect(item);
        this.close();
      });

      grid.appendChild(card);
    });
  }

  /**
   * Render pagination controls.
   * @private
   * @param {Object} pagination
   */
  _renderPagination(pagination) {
    const container = this.modal?.querySelector('[data-media-pagination]');
    if (!container) return;

    container.innerHTML = '';

    if (!pagination.last_page || pagination.last_page <= 1) return;

    for (let p = 1; p <= pagination.last_page; p++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tiptap-media-browser__page-btn';
      if (p === pagination.current_page) btn.classList.add('active');
      btn.textContent = String(p);
      btn.addEventListener('click', () => {
        this.currentPage = p;
        this._loadMedia();
      });
      container.appendChild(btn);
    }
  }

  /**
   * Handle file upload from the modal.
   * @private
   */
  async _handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file || !this.uploadUrl) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';

      const response = await fetch(this.uploadUrl, {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          Accept: 'application/json',
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      // Reload the grid to show new upload
      this._loadMedia();
    } catch (err) {
      console.error('[MediaBrowser] Upload failed:', err);
      alert('Upload failed. Please try again.');
    }

    // Reset input
    event.target.value = '';
  }
}
