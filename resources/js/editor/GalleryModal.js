/**
 * GalleryModal – Bootstrap 5 Modal for inserting & configuring image galleries.
 *
 * Features:
 *  - Multi-image upload via drag & drop or file picker
 *  - Image preview grid with remove capability
 *  - Column count selector (2, 3, 4, 6)
 *  - Gap control (0-5)
 *  - Lightbox toggle
 *  - Edit mode for existing galleries
 */

export class GalleryModal {
  /**
   * @param {import('./Toolbar').default} toolbar
   */
  constructor(toolbar) {
    this.toolbar = toolbar;
    this.editor = toolbar.editor;
    this._modal = null;
    this._bs = null;
    this._images = []; // { src, alt, file? }
    this._editMode = false;
    this._build();
  }

  /* ───────────────────────────────────── public ── */

  /**
   * Open the modal.
   * @param {Object|null} existingAttrs – if set, enters edit mode with gallery attrs + images
   */
  open(existingAttrs = null) {
    this._reset();
    this._editMode = !!existingAttrs;

    if (existingAttrs) {
      this._populate(existingAttrs);
      this._el('titleText').textContent = 'Edit Gallery';
      this._el('insertBtn').innerHTML = '<i class="bi bi-check-lg me-1"></i>Update Gallery';
    } else {
      this._el('titleText').textContent = 'Insert Gallery';
      this._el('insertBtn').innerHTML = '<i class="bi bi-images me-1"></i>Insert Gallery';
    }

    this._updatePreviewGrid();
    this._bs.show();
  }

  destroy() {
    if (this._bs) this._bs.dispose();
    this._modal?.remove();
  }

  /* ───────────────────────────────────── private ── */

  _build() {
    const wrap = document.createElement('div');
    wrap.innerHTML = this._template();
    this._modal = wrap.firstElementChild;
    document.body.appendChild(this._modal);

    const BSModal = window.bootstrap?.Modal;
    this._bs = BSModal
      ? new BSModal(this._modal)
      : { show() {}, hide() {}, dispose() {} };

    this._bindEvents();
  }

  _reset() {
    this._images = [];
    this._editMode = false;

    // Reset file input
    const fi = this._el('fileInput');
    if (fi) fi.value = '';

    // Reset options
    this._setColumns(3);
    this._el('gapRange').value = '2';
    this._el('gapValue').textContent = '2';
    this._el('lightbox').checked = false;

    // Reset dropzone label
    this._el('dropzoneLabel').textContent = 'Drag & drop images here, or click to browse';

    this._updatePreviewGrid();
    this._updateInsertState();
  }

  _populate(attrs) {
    // attrs: { columns, gap, lightbox, images: [{src, alt}] }
    this._setColumns(attrs.columns || 3);
    this._el('gapRange').value = String(attrs.gap ?? 2);
    this._el('gapValue').textContent = String(attrs.gap ?? 2);
    this._el('lightbox').checked = !!attrs.lightbox;

    if (attrs.images && Array.isArray(attrs.images)) {
      this._images = attrs.images.map(img => ({ src: img.src, alt: img.alt || '' }));
    }

    this._updatePreviewGrid();
    this._updateInsertState();
  }

  _el(name) {
    return this._modal.querySelector(`[data-galm="${name}"]`);
  }

  _setColumns(cols) {
    this._modal.querySelectorAll('[data-gal-col]').forEach(el => {
      el.classList.toggle('active', parseInt(el.dataset.galCol, 10) === cols);
    });
  }

  _getColumns() {
    const active = this._modal.querySelector('[data-gal-col].active');
    return active ? parseInt(active.dataset.galCol, 10) : 3;
  }

  _bindEvents() {
    const dropzone = this._el('dropzone');
    const fileInput = this._el('fileInput');

    // Drag-and-drop
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('border-primary', 'bg-primary', 'bg-opacity-10');
    });
    dropzone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('border-primary', 'bg-primary', 'bg-opacity-10');
    });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('border-primary', 'bg-primary', 'bg-opacity-10');
      const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      if (files.length) this._addFiles(files);
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length) this._addFiles(files);
      fileInput.value = '';
    });

    // Column buttons
    this._modal.querySelectorAll('[data-gal-col]').forEach(el => {
      el.addEventListener('click', () => {
        this._setColumns(parseInt(el.dataset.galCol, 10));
        this._updatePreviewGrid();
      });
    });

    // Gap range
    this._el('gapRange').addEventListener('input', (e) => {
      this._el('gapValue').textContent = e.target.value;
    });

    // Insert
    this._el('insertBtn').addEventListener('click', () => this._submit());

    // Clear all
    this._el('clearBtn').addEventListener('click', () => {
      this._images = [];
      this._updatePreviewGrid();
      this._updateInsertState();
    });
  }

  async _addFiles(files) {
    const insertBtn = this._el('insertBtn');
    const label = this._el('dropzoneLabel');
    insertBtn.disabled = true;

    for (const file of files) {
      label.textContent = `Uploading ${file.name}…`;
      try {
        const uploadUrl = this.toolbar._getUploadUrl();
        let src, alt;

        if (uploadUrl) {
          const media = await this.toolbar._uploadFile(file, uploadUrl);
          src = media.url;
          alt = media.alt || file.name;
        } else {
          // Fallback: base64
          src = await this._toBase64(file);
          alt = file.name;
        }

        this._images.push({ src, alt });
      } catch (err) {
        console.error('[TiptapEditor] Gallery image upload failed:', err);
      }
    }

    label.textContent = 'Drag & drop images here, or click to browse';
    insertBtn.disabled = false;
    this._updatePreviewGrid();
    this._updateInsertState();
  }

  _removeImage(index) {
    this._images.splice(index, 1);
    this._updatePreviewGrid();
    this._updateInsertState();
  }

  _updatePreviewGrid() {
    const grid = this._el('previewGrid');
    const placeholder = this._el('placeholder');
    const countBadge = this._el('countBadge');

    if (this._images.length === 0) {
      grid.innerHTML = '';
      grid.classList.add('d-none');
      placeholder.classList.remove('d-none');
      countBadge.textContent = '';
      countBadge.classList.add('d-none');
      return;
    }

    placeholder.classList.add('d-none');
    grid.classList.remove('d-none');
    countBadge.textContent = `${this._images.length} image${this._images.length > 1 ? 's' : ''}`;
    countBadge.classList.remove('d-none');

    const cols = this._getColumns();
    const colClass = `col-${Math.floor(12 / cols)}`;

    grid.innerHTML = this._images.map((img, i) => `
      <div class="${colClass} mb-2">
        <div class="position-relative tiptap-gallery-thumb">
          <img src="${this._escAttr(img.src)}" alt="${this._escAttr(img.alt)}"
               class="img-fluid rounded" style="width:100%;aspect-ratio:1;object-fit:cover;">
          <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 rounded-circle p-0"
                  style="width:20px;height:20px;line-height:1;font-size:11px"
                  data-gal-remove="${i}" title="Remove">
            <i class="bi bi-x"></i>
          </button>
        </div>
      </div>
    `).join('');

    // Bind remove buttons
    grid.querySelectorAll('[data-gal-remove]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this._removeImage(parseInt(btn.dataset.galRemove, 10));
      });
    });
  }

  _updateInsertState() {
    const btn = this._el('insertBtn');
    btn.disabled = this._images.length === 0;
  }

  _submit() {
    if (this._images.length === 0) return;

    const images = this._images.map(img => ({ src: img.src, alt: img.alt }));
    const columns = this._getColumns();
    const gap = parseInt(this._el('gapRange').value, 10);
    const lightbox = this._el('lightbox').checked;

    if (this._editMode) {
      // Update existing gallery attributes (re-insert with new images/options)
      this.editor.chain().focus().deleteNode('gallery').run();
      this.editor.chain().focus().insertGallery({ images, columns, gap, lightbox }).run();
    } else {
      this.editor.chain().focus().insertGallery({ images, columns, gap, lightbox }).run();
    }

    this._bs.hide();
  }

  _toBase64(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = (e) => resolve(e.target.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  _escAttr(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }

  _template() {
    return `
<div class="modal fade tiptap-gallery-modal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
  <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header py-2 px-3">
        <h6 class="modal-title fw-semibold">
          <i class="bi bi-images me-2 text-primary"></i>
          <span data-galm="titleText">Insert Gallery</span>
          <span class="badge bg-secondary ms-2 d-none" data-galm="countBadge"></span>
        </h6>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body p-3">
        <div class="row g-3">

          <!-- Left: upload + preview -->
          <div class="col-lg-7">
            <!-- Dropzone -->
            <div class="rounded-2 border-2 border-dashed d-flex flex-column align-items-center
                        justify-content-center py-4 px-3 gap-2 text-center position-relative"
                 data-galm="dropzone" style="cursor:pointer;min-height:120px">
              <i class="bi bi-cloud-upload fs-3 text-secondary"></i>
              <p class="mb-0 small text-secondary" data-galm="dropzoneLabel">
                Drag & drop images here, or click to browse
              </p>
              <span class="badge bg-light text-muted border">Supports multiple files</span>
              <input type="file" accept="image/*" multiple data-galm="fileInput"
                     style="position:absolute;inset:0;opacity:0;cursor:pointer">
            </div>

            <!-- Image preview grid -->
            <div class="text-center py-4 text-secondary" data-galm="placeholder">
              <i class="bi bi-images fs-2 d-block mb-1"></i>
              <span class="small">No images added yet</span>
            </div>
            <div class="row g-2 mt-2 d-none" data-galm="previewGrid"></div>
          </div>

          <!-- Right: options -->
          <div class="col-lg-5">
            <!-- Columns -->
            <div class="mb-3">
              <label class="form-label small fw-medium">Columns</label>
              <div class="d-flex gap-1">
                <button type="button" class="btn btn-sm btn-outline-secondary" data-gal-col="2">2</button>
                <button type="button" class="btn btn-sm btn-outline-secondary active" data-gal-col="3">3</button>
                <button type="button" class="btn btn-sm btn-outline-secondary" data-gal-col="4">4</button>
                <button type="button" class="btn btn-sm btn-outline-secondary" data-gal-col="6">6</button>
              </div>
            </div>

            <!-- Gap -->
            <div class="mb-3">
              <label class="form-label small fw-medium">
                Gap <span class="badge bg-light text-dark border" data-galm="gapValue">2</span>
              </label>
              <input type="range" class="form-range" min="0" max="5" value="2" data-galm="gapRange">
              <div class="d-flex justify-content-between">
                <small class="text-muted">None</small>
                <small class="text-muted">Max</small>
              </div>
            </div>

            <!-- Lightbox -->
            <div class="mb-3">
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" data-galm="lightbox" id="tiptap-gal-lightbox">
                <label class="form-check-label small fw-medium" for="tiptap-gal-lightbox">
                  Enable Lightbox
                </label>
              </div>
              <div class="form-text">Allow images to open in a fullscreen overlay.</div>
            </div>

            <!-- Clear all -->
            <div>
              <button type="button" class="btn btn-sm btn-outline-secondary w-100" data-galm="clearBtn">
                <i class="bi bi-trash me-1"></i>Clear All Images
              </button>
            </div>
          </div>

        </div>
      </div>
      <div class="modal-footer py-2 px-3">
        <button type="button" class="btn btn-sm btn-secondary rounded-pill px-3" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-sm btn-primary rounded-pill px-3" data-galm="insertBtn" disabled>
          <i class="bi bi-images me-1"></i>Insert Gallery
        </button>
      </div>
    </div>
  </div>
</div>`;
  }
}
