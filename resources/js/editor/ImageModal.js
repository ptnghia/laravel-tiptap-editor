/**
 * ImageModal – Bootstrap 5 Modal for inserting & editing images.
 *
 * Features:
 *  - Upload tab: drag & drop / file picker with live preview
 *  - URL tab: enter remote image URL
 *  - Alt text, caption, link URL fields
 *  - Alignment (left / center / right) with visual radios
 *  - Width presets (auto, 25%, 50%, 75%, 100%) + free-form input (px or %)
 *  - Extra CSS class field
 *  - Edit-mode: populate fields from existing node attrs on double-click
 */
export class ImageModal {
  /**
   * @param {import('./Toolbar').Toolbar} toolbar
   */
  constructor(toolbar) {
    this.toolbar = toolbar;
    this.editor = toolbar.editor;
    this._modal = null;     // DOM element
    this._bs = null;        // Bootstrap Modal instance
    this._pendingFile = null;
    this._editMode = false;
    this._libraryLoaded = false;
    this._libraryPage = 1;
    this._libraryHasMore = false;
    this._selectedLibraryItem = null;
    this._build();
  }

  /* ─────────────────────────────────────────────────────────── public ── */

  /**
   * Open the modal.
   * @param {Object|null} existingAttrs  – if set, enters edit mode.
   */
  open(existingAttrs = null) {
    this._reset();
    this._editMode = !!existingAttrs;
    if (existingAttrs) {
      this._populate(existingAttrs);
    }
    this._bs.show();
  }

  destroy() {
    if (this._bs) this._bs.dispose();
    this._modal?.remove();
  }

  /* ─────────────────────────────────────────────────────────── private ── */

  _build() {
    const wrap = document.createElement('div');
    wrap.innerHTML = this._template();
    this._modal = wrap.firstElementChild;
    document.body.appendChild(this._modal);

    // Bootstrap 5 Modal
    const BSModal = window.bootstrap?.Modal;
    if (!BSModal) {
      console.warn('[TiptapEditor] Bootstrap Modal not found. Image modal may not work.');
    }
    this._bs = BSModal ? new BSModal(this._modal) : { show: () => {}, hide: () => {}, dispose: () => {} };

    this._bindEvents();
  }

  _template() {
    return `
<div class="modal fade tiptap-image-modal" id="tiptap-image-modal-${Date.now()}"
     tabindex="-1" aria-labelledby="tiptap-img-modal-title" aria-hidden="true"
     data-bs-backdrop="static">
  <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content">

      <!-- Header -->
      <div class="modal-header py-2 px-3">
        <h6 class="modal-title fw-semibold" id="tiptap-img-modal-title">
          <i class="bi bi-image me-2 text-primary"></i>
          <span class="tiptap-img-modal-title-text">Insert Image</span>
        </h6>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

      <!-- Body -->
      <div class="modal-body p-3">
        <div class="row g-3">

          <!-- ── Left column: source ── -->
          <div class="col-lg-7">

            <!-- Source tabs -->
            <ul class="nav nav-tabs nav-sm mb-3 border-bottom" role="tablist">
              <li class="nav-item" role="presentation">
                <button type="button" class="nav-link py-1 px-3 active tiptap-img-tab-btn fs-sm"
                        data-tab="upload" role="tab">
                  <i class="bi bi-upload me-1"></i>Upload
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button type="button" class="nav-link py-1 px-3 tiptap-img-tab-btn fs-sm"
                        data-tab="url" role="tab">
                  <i class="bi bi-link-45deg me-1"></i>URL
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button type="button" class="nav-link py-1 px-3 tiptap-img-tab-btn fs-sm"
                        data-tab="library" role="tab">
                  <i class="bi bi-images me-1"></i>Library
                </button>
              </li>
            </ul>

            <!-- Upload panel -->
            <div class="tiptap-img-panel" data-panel="upload">
              <div class="tiptap-img-dropzone rounded-2 border-2 border-dashed
                          d-flex flex-column align-items-center justify-content-center
                          py-4 px-3 gap-2 text-center position-relative"
                   id="tiptap-img-dropzone-el" style="cursor:pointer;min-height:130px">
                <i class="bi bi-cloud-upload fs-3 text-secondary"></i>
                <p class="mb-0 small text-secondary tiptap-img-dropzone-label">
                  Drag & drop image here, or click to browse
                </p>
                <span class="badge bg-light text-secondary border tiptap-img-file-name d-none"></span>
                <input type="file" accept="image/*" class="tiptap-img-file-input"
                       style="position:absolute;inset:0;opacity:0;cursor:pointer">
              </div>
            </div>

            <!-- URL panel -->
            <div class="tiptap-img-panel d-none" data-panel="url">
              <label class="form-label small fw-medium mb-1">Image URL</label>
              <input type="url" class="form-control form-control-sm tiptap-img-url-input"
                     placeholder="https://example.com/image.jpg">
              <div class="form-text">Enter a direct link to an image file.</div>
            </div>

            <!-- Library panel -->
            <div class="tiptap-img-panel d-none" data-panel="library">
              <div class="d-flex align-items-center gap-2 mb-2">
                <div class="input-group input-group-sm flex-grow-1">
                  <span class="input-group-text"><i class="bi bi-search"></i></span>
                  <input type="text" class="form-control tiptap-img-library-search"
                         placeholder="Search images...">
                </div>
                <button type="button" class="btn btn-sm btn-outline-secondary tiptap-img-library-refresh"
                        title="Refresh"><i class="bi bi-arrow-clockwise"></i></button>
              </div>
              <div class="tiptap-img-library-grid" style="max-height:220px;overflow-y:auto;"></div>
              <div class="tiptap-img-library-status text-center py-2 small text-muted d-none"></div>
              <div class="text-center mt-2">
                <button type="button" class="btn btn-sm btn-outline-secondary tiptap-img-library-more d-none">
                  Load more
                </button>
              </div>
            </div>

            <!-- ─── Common fields ─── -->
            <div class="mt-3 d-flex flex-column gap-2">

              <!-- Alt -->
              <div>
                <label class="form-label small fw-medium mb-1">
                  Alt Text
                  <span class="text-muted fw-normal">(recommended for accessibility & SEO)</span>
                </label>
                <input type="text" class="form-control form-control-sm tiptap-img-alt-input"
                       placeholder="Describe the image…">
              </div>

              <!-- Caption -->
              <div>
                <label class="form-label small fw-medium mb-1">
                  Caption <span class="text-muted fw-normal">(optional)</span>
                </label>
                <input type="text" class="form-control form-control-sm tiptap-img-caption-input"
                       placeholder="Shown below the image">
              </div>

              <!-- Link -->
              <div>
                <label class="form-label small fw-medium mb-1">
                  Link URL <span class="text-muted fw-normal">(wrap image in &lt;a&gt;)</span>
                </label>
                <div class="input-group input-group-sm">
                  <span class="input-group-text"><i class="bi bi-link-45deg"></i></span>
                  <input type="url" class="form-control tiptap-img-link-input"
                         placeholder="https://…">
                  <div class="input-group-text p-0 border-0 bg-transparent">
                    <div class="form-check form-check-sm ms-2 mb-0">
                      <input class="form-check-input tiptap-img-link-blank" type="checkbox"
                             id="tiptap-img-link-blank-chk">
                      <label class="form-check-label small" for="tiptap-img-link-blank-chk">
                        _blank
                      </label>
                    </div>
                  </div>
                </div>
              </div>

            </div><!-- /common fields -->
          </div><!-- /left col -->

          <!-- ── Right column: options + preview ── -->
          <div class="col-lg-5">

            <!-- Preview -->
            <div class="mb-3">
              <label class="form-label small fw-medium mb-1">Preview</label>
              <div class="tiptap-img-preview-wrap rounded-2 bg-body-secondary
                          d-flex align-items-center justify-content-center"
                   style="min-height:120px;overflow:hidden">
                <img class="tiptap-img-preview img-fluid rounded"
                     alt="" style="max-height:160px;display:none">
                <span class="tiptap-img-preview-placeholder text-secondary">
                  <i class="bi bi-image fs-2 d-block"></i>
                  <span class="small">No image</span>
                </span>
              </div>
            </div>

            <!-- Alignment -->
            <div class="mb-3">
              <label class="form-label small fw-medium mb-1">Alignment</label>
              <div class="d-flex gap-2">
                <label class="tiptap-align-btn flex-fill text-center border rounded-2 py-2 px-1"
                       title="Align left" style="cursor:pointer">
                  <input type="radio" name="tiptap-img-align-radio" value="left"
                         class="d-none tiptap-img-align-radio">
                  <i class="bi bi-align-start d-block fs-5"></i>
                  <span style="font-size:10px">Left</span>
                </label>
                <label class="tiptap-align-btn flex-fill text-center border rounded-2 py-2 px-1 tiptap-align-active"
                       title="Align center" style="cursor:pointer">
                  <input type="radio" name="tiptap-img-align-radio" value="center"
                         class="d-none tiptap-img-align-radio" checked>
                  <i class="bi bi-align-center d-block fs-5"></i>
                  <span style="font-size:10px">Center</span>
                </label>
                <label class="tiptap-align-btn flex-fill text-center border rounded-2 py-2 px-1"
                       title="Align right" style="cursor:pointer">
                  <input type="radio" name="tiptap-img-align-radio" value="right"
                         class="d-none tiptap-img-align-radio">
                  <i class="bi bi-align-end d-block fs-5"></i>
                  <span style="font-size:10px">Right</span>
                </label>
              </div>
            </div>

            <!-- Width -->
            <div class="mb-3">
              <label class="form-label small fw-medium mb-1">Width</label>
              <div class="d-flex gap-1 flex-wrap mb-2">
                <button type="button"
                        class="btn btn-sm btn-outline-secondary tiptap-width-btn py-0 active"
                        data-width="">Auto</button>
                <button type="button"
                        class="btn btn-sm btn-outline-secondary tiptap-width-btn py-0"
                        data-width="25%">25%</button>
                <button type="button"
                        class="btn btn-sm btn-outline-secondary tiptap-width-btn py-0"
                        data-width="50%">50%</button>
                <button type="button"
                        class="btn btn-sm btn-outline-secondary tiptap-width-btn py-0"
                        data-width="75%">75%</button>
                <button type="button"
                        class="btn btn-sm btn-outline-secondary tiptap-width-btn py-0"
                        data-width="100%">100%</button>
              </div>
              <div class="input-group input-group-sm">
                <input type="text" class="form-control tiptap-img-width-input"
                       placeholder="e.g. 480px or 60%">
                <span class="input-group-text text-muted">px / %</span>
              </div>
              <div class="form-text">Leave blank to use natural image size.</div>
            </div>

            <!-- Extra class -->
            <div class="mb-1">
              <label class="form-label small fw-medium mb-1">
                Extra CSS Class
                <span class="text-muted fw-normal">(optional)</span>
              </label>
              <input type="text" class="form-control form-control-sm tiptap-img-class-input"
                     placeholder="rounded-circle shadow-sm border …">
            </div>

          </div><!-- /right col -->
        </div><!-- /row -->
      </div><!-- /modal-body -->

      <!-- Footer -->
      <div class="modal-footer py-2 px-3">
        <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">
          Cancel
        </button>
        <button type="button" class="btn btn-sm btn-primary tiptap-img-insert-btn">
          <i class="bi bi-check2 me-1"></i>
          <span class="tiptap-img-insert-btn-label">Insert Image</span>
        </button>
      </div>

    </div><!-- /modal-content -->
  </div><!-- /modal-dialog -->
</div>`;
  }

  _bindEvents() {
    const $ = (sel) => this._modal.querySelector(sel);
    const $$ = (sel) => this._modal.querySelectorAll(sel);

    /* ── Tabs ── */
    $$('.tiptap-img-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        $$('.tiptap-img-tab-btn').forEach((b) => b.classList.remove('active'));
        $$('.tiptap-img-panel').forEach((p) => p.classList.add('d-none'));
        btn.classList.add('active');
        $(`[data-panel="${btn.dataset.tab}"]`).classList.remove('d-none');

        // Auto-load library on first switch
        if (btn.dataset.tab === 'library' && !this._libraryLoaded) {
          this._loadLibrary();
        }
      });
    });

    /* ── Library ── */
    this._bindLibraryEvents();

    /* ── File input (the hidden overlay on the dropzone) ── */
    const fileInput = $('.tiptap-img-file-input');
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) this._handleFileSelected(file);
    });

    /* ── Drag & drop ── */
    const dz = $('#tiptap-img-dropzone-el');
    dz.addEventListener('dragover', (e) => {
      e.preventDefault();
      dz.classList.add('tiptap-img-dragover');
    });
    dz.addEventListener('dragleave', () => dz.classList.remove('tiptap-img-dragover'));
    dz.addEventListener('drop', (e) => {
      e.preventDefault();
      dz.classList.remove('tiptap-img-dragover');
      const file = e.dataTransfer.files?.[0];
      if (file?.type.startsWith('image/')) this._handleFileSelected(file);
    });

    /* ── URL live preview ── */
    $('.tiptap-img-url-input').addEventListener('input', (e) => {
      this._updatePreview(e.target.value.trim());
    });

    /* ── Alignment radios ── */
    $$('.tiptap-img-align-radio').forEach((radio) => {
      radio.addEventListener('change', () => {
        $$('.tiptap-align-btn').forEach((el) => el.classList.remove('tiptap-align-active'));
        radio.closest('.tiptap-align-btn')?.classList.add('tiptap-align-active');
      });
    });

    /* ── Width presets ── */
    $$('.tiptap-width-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        $$('.tiptap-width-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        $('.tiptap-img-width-input').value = btn.dataset.width;
      });
    });

    /* ── Custom width: deselect preset ── */
    $('.tiptap-img-width-input').addEventListener('input', () => {
      $$('.tiptap-width-btn').forEach((b) => b.classList.remove('active'));
    });

    /* ── Insert / Update ── */
    $('.tiptap-img-insert-btn').addEventListener('click', () => this._insert());

    /* ── Reset on close ── */
    this._modal.addEventListener('hidden.bs.modal', () => this._reset());
  }

  _handleFileSelected(file) {
    this._pendingFile = file;

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => this._updatePreview(e.target.result);
    reader.readAsDataURL(file);

    // Dropzone label
    const label = this._modal.querySelector('.tiptap-img-dropzone-label');
    if (label) label.textContent = '📎 ' + file.name;

    const badge = this._modal.querySelector('.tiptap-img-file-name');
    if (badge) {
      badge.textContent = file.name;
      badge.classList.remove('d-none');
    }

    // Pre-fill alt from filename
    const altInput = this._modal.querySelector('.tiptap-img-alt-input');
    if (altInput && !altInput.value) {
      altInput.value = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
    }
  }

  _updatePreview(src) {
    const img = this._modal.querySelector('.tiptap-img-preview');
    const ph = this._modal.querySelector('.tiptap-img-preview-placeholder');
    if (src) {
      img.src = src;
      img.style.display = '';
      if (ph) ph.style.display = 'none';
    } else {
      img.src = '';
      img.style.display = 'none';
      if (ph) ph.style.display = '';
    }
  }

  _populate(attrs) {
    const $ = (sel) => this._modal.querySelector(sel);
    const $$ = (sel) => this._modal.querySelectorAll(sel);

    // Switch to URL tab (edit mode always uses src URL)
    $('[data-tab="url"]').click();

    $('.tiptap-img-url-input').value = attrs.src || '';
    $('.tiptap-img-alt-input').value = attrs.alt || '';
    $('.tiptap-img-caption-input').value = attrs.caption || '';
    $('.tiptap-img-link-input').value = attrs.linkUrl || '';
    $('.tiptap-img-link-blank').checked = attrs.linkTarget === '_blank';
    $('.tiptap-img-width-input').value = attrs.widthStyle || '';
    $('.tiptap-img-class-input').value = attrs.extraClass || '';

    if (attrs.src) this._updatePreview(attrs.src);

    // Alignment
    const alignVal = attrs.alignment || 'center';
    const radio = $(`[name="tiptap-img-align-radio"][value="${alignVal}"]`);
    if (radio) {
      radio.checked = true;
      $$('.tiptap-align-btn').forEach((el) => el.classList.remove('tiptap-align-active'));
      radio.closest('.tiptap-align-btn')?.classList.add('tiptap-align-active');
    }

    // Width preset highlight
    const wval = attrs.widthStyle || '';
    $$('.tiptap-width-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.width === wval);
    });

    // Update UI for edit mode
    $('.tiptap-img-modal-title-text').textContent = 'Edit Image';
    $('.tiptap-img-insert-btn-label').textContent = 'Update Image';
  }

  async _insert() {
    const $ = (sel) => this._modal.querySelector(sel);
    const $$ = (sel) => this._modal.querySelectorAll(sel);

    const activeTab = this._modal.querySelector('.tiptap-img-tab-btn.active')?.dataset.tab;
    const alt       = $('.tiptap-img-alt-input').value.trim();
    const caption   = $('.tiptap-img-caption-input').value.trim();
    const linkUrl   = $('.tiptap-img-link-input').value.trim();
    const linkBlank = $('.tiptap-img-link-blank').checked;
    const widthRaw  = $('.tiptap-img-width-input').value.trim();
    const extraClass = $('.tiptap-img-class-input').value.trim();
    const alignment = $('[name="tiptap-img-align-radio"]:checked')?.value || 'center';

    // Normalize widthStyle to "Npx" or "N%" or null
    let widthStyle = null;
    if (widthRaw) {
      if (widthRaw.endsWith('%') || widthRaw.endsWith('px')) {
        widthStyle = widthRaw;
      } else if (!isNaN(parseFloat(widthRaw))) {
        widthStyle = parseFloat(widthRaw) + 'px';
      }
    }

    const btn = $('.tiptap-img-insert-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Processing…';

    let src      = null;
    let mediaId  = null;
    let imgW     = null;
    let imgH     = null;

    try {
      if (activeTab === 'upload' && this._pendingFile) {
        const uploadUrl = this.toolbar._getUploadUrl();
        if (uploadUrl) {
          const media = await this.toolbar._uploadFile(this._pendingFile, uploadUrl);
          src    = media.url;
          mediaId = media.id || null;
          imgW   = media.width || null;
          imgH   = media.height || null;
        } else {
          // Fallback: base64
          src = await this._toBase64(this._pendingFile);
        }
      } else if (activeTab === 'library' && this._selectedLibraryItem) {
        src     = this._selectedLibraryItem.url;
        mediaId = this._selectedLibraryItem.id || null;
        imgW    = this._selectedLibraryItem.width || null;
        imgH    = this._selectedLibraryItem.height || null;
      } else {
        src = $('.tiptap-img-url-input').value.trim();
      }

      if (!src) {
        this._showError('Please provide an image file or URL.');
        return;
      }

      const attrs = {
        src,
        alt:        alt || '',
        caption:    caption  || null,
        linkUrl:    linkUrl  || null,
        linkTarget: linkUrl && linkBlank ? '_blank' : null,
        widthStyle: widthStyle || null,
        extraClass: extraClass || null,
        alignment,
        mediaId:    mediaId || null,
        // Keep pixel dimensions from upload for img width/height attributes
        width:  imgW  || null,
        height: imgH  || null,
      };

      if (this._editMode) {
        this.editor.chain().focus().updateCustomImage(attrs).run();
      } else {
        this.editor.chain().focus().insertCustomImage(attrs).run();
      }

      this._bs.hide();
    } catch (err) {
      console.error('[TiptapEditor] Image modal error:', err);
      this._showError(err.message || 'Image operation failed.');
    } finally {
      btn.disabled = false;
      btn.innerHTML =
        '<i class="bi bi-check2 me-1"></i>' +
        '<span class="tiptap-img-insert-btn-label">' +
        (this._editMode ? 'Update Image' : 'Insert Image') +
        '</span>';
    }
  }

  _showError(msg) {
    let err = this._modal.querySelector('.tiptap-img-error');
    if (!err) {
      err = document.createElement('div');
      err.className = 'alert alert-danger alert-sm py-1 px-2 mt-2 small tiptap-img-error';
      this._modal.querySelector('.modal-body').prepend(err);
    }
    err.textContent = msg;
    err.style.display = '';
    setTimeout(() => { err.style.display = 'none'; }, 4000);
  }

  _toBase64(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload  = (e) => resolve(e.target.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  /* ──────────────── Media Library ──────────────── */

  _bindLibraryEvents() {
    const $ = (sel) => this._modal.querySelector(sel);

    // Search
    let searchTimer = null;
    $('.tiptap-img-library-search')?.addEventListener('input', (e) => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        this._libraryPage = 1;
        this._loadLibrary(e.target.value.trim());
      }, 300);
    });

    // Refresh
    $('.tiptap-img-library-refresh')?.addEventListener('click', () => {
      this._libraryPage = 1;
      this._libraryLoaded = false;
      const search = $('.tiptap-img-library-search')?.value?.trim() || '';
      this._loadLibrary(search);
    });

    // Load more
    $('.tiptap-img-library-more')?.addEventListener('click', () => {
      this._libraryPage++;
      const search = $('.tiptap-img-library-search')?.value?.trim() || '';
      this._loadLibrary(search, true);
    });
  }

  async _loadLibrary(search = '', append = false) {
    const browseUrl = this.toolbar._getBrowseUrl();
    if (!browseUrl) {
      this._showLibraryStatus('Media library not available');
      return;
    }

    const grid = this._modal.querySelector('.tiptap-img-library-grid');
    const moreBtn = this._modal.querySelector('.tiptap-img-library-more');
    const status = this._modal.querySelector('.tiptap-img-library-status');

    if (!append) {
      grid.innerHTML = '<div class="text-center py-3"><span class="spinner-border spinner-border-sm"></span></div>';
    }

    try {
      const params = new URLSearchParams({ type: 'image', page: this._libraryPage });
      if (search) params.set('search', search);

      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';
      const response = await fetch(`${browseUrl}?${params}`, {
        headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': csrfToken },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();

      const items = json.data || [];
      const pagination = json.pagination || {};

      if (!append) grid.innerHTML = '';

      if (items.length === 0 && !append) {
        this._showLibraryStatus('No images found');
        moreBtn?.classList.add('d-none');
        return;
      }

      status?.classList.add('d-none');

      items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'tiptap-img-library-item';
        card.dataset.url = item.url;
        card.dataset.alt = item.alt || '';
        card.dataset.title = item.title || '';
        card.title = item.filename || '';

        const img = document.createElement('img');
        img.src = item.thumbnail || item.url;
        img.alt = item.alt || item.filename || '';
        img.loading = 'lazy';
        card.appendChild(img);

        const name = document.createElement('span');
        name.className = 'tiptap-img-library-name';
        name.textContent = item.filename || '';
        card.appendChild(name);

        card.addEventListener('click', () => {
          grid.querySelectorAll('.tiptap-img-library-item').forEach(el =>
            el.classList.remove('selected'));
          card.classList.add('selected');
          this._selectedLibraryItem = item;
          this._updatePreview(item.url);

          // Auto-fill alt/title
          const altInput = this._modal.querySelector('.tiptap-img-alt-input');
          if (altInput && !altInput.value && item.alt) altInput.value = item.alt;
        });

        grid.appendChild(card);
      });

      this._libraryHasMore = pagination.current_page < pagination.last_page;
      moreBtn?.classList.toggle('d-none', !this._libraryHasMore);
      this._libraryLoaded = true;
    } catch (err) {
      console.error('[TiptapEditor] Library load error:', err);
      if (!append) grid.innerHTML = '';
      this._showLibraryStatus('Failed to load media library');
    }
  }

  _showLibraryStatus(msg) {
    const status = this._modal.querySelector('.tiptap-img-library-status');
    if (status) {
      status.textContent = msg;
      status.classList.remove('d-none');
    }
  }

  _reset() {
    const $ = (sel) => this._modal.querySelector(sel);
    const $$ = (sel) => this._modal.querySelectorAll(sel);

    this._pendingFile = null;
    this._editMode    = false;
    this._selectedLibraryItem = null;

    // Clear file input
    const fi = $('.tiptap-img-file-input');
    if (fi) fi.value = '';

    $('.tiptap-img-url-input').value      = '';
    $('.tiptap-img-alt-input').value      = '';
    $('.tiptap-img-caption-input').value  = '';
    $('.tiptap-img-link-input').value     = '';
    $('.tiptap-img-link-blank').checked   = false;
    $('.tiptap-img-width-input').value    = '';
    $('.tiptap-img-class-input').value    = '';

    this._updatePreview('');

    // Dropzone label
    const lbl = $('.tiptap-img-dropzone-label');
    if (lbl) lbl.textContent = 'Drag & drop image here, or click to browse';
    const badge = $('.tiptap-img-file-name');
    if (badge) badge.classList.add('d-none');

    // Reset alignment to center
    const center = $('[name="tiptap-img-align-radio"][value="center"]');
    if (center) {
      center.checked = true;
      $$('.tiptap-align-btn').forEach((el) => el.classList.remove('tiptap-align-active'));
      center.closest('.tiptap-align-btn')?.classList.add('tiptap-align-active');
    }

    // Reset width preset
    $$('.tiptap-width-btn').forEach((b) => b.classList.remove('active'));
    $('[data-width=""]')?.classList.add('active');

    // Switch back to upload tab
    $('[data-tab="upload"]')?.click();

    // Reset title / button label
    $('.tiptap-img-modal-title-text').textContent = 'Insert Image';
    $('.tiptap-img-insert-btn-label').textContent  = 'Insert Image';
  }
}
