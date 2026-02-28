/**
 * VideoModal – Bootstrap 5 Modal for inserting & editing videos.
 *
 * Features:
 *  - URL tab: auto-detect YouTube / Vimeo / MP4
 *  - Upload tab: drag & drop / file picker for MP4/WebM
 *  - Title, caption fields
 *  - Aspect ratio picker (16:9, 4:3, 1:1, 21:9)
 *  - Alignment (left / center / right)
 *  - Width presets + custom width
 *  - Edit mode: populate from existing node attrs on double-click
 */

import { detectProvider, PROVIDERS } from './extensions/CustomVideo.js';

export class VideoModal {
  /**
   * @param {import('./Toolbar').default} toolbar
   */
  constructor(toolbar) {
    this.toolbar = toolbar;
    this.editor = toolbar.editor;
    this._modal = null;
    this._bs = null;
    this._editMode = false;
    this._pendingFile = null;
    this._build();
  }

  /* ─────────────────────────────────────────────────── public ── */

  /**
   * Open the modal.
   * @param {Object|null} existingAttrs – if set, enters edit mode
   */
  open(existingAttrs = null) {
    this._reset();
    this._editMode = !!existingAttrs;

    const titleEl = this._modal.querySelector('.tiptap-video-modal-title-text');
    if (titleEl) titleEl.textContent = this._editMode ? 'Edit Video' : 'Insert Video';

    const btnText = this._modal.querySelector('.tiptap-video-insert-btn-text');
    if (btnText) btnText.textContent = this._editMode ? 'Update Video' : 'Insert Video';

    if (existingAttrs) {
      this._populate(existingAttrs);
    }

    this._bs.show();
  }

  destroy() {
    if (this._bs) this._bs.dispose();
    this._modal?.remove();
  }

  /* ─────────────────────────────────────────────────── private ── */

  _build() {
    const wrap = document.createElement('div');
    wrap.innerHTML = this._template();
    this._modal = wrap.firstElementChild;
    document.body.appendChild(this._modal);

    const BSModal = window.bootstrap?.Modal;
    if (!BSModal) {
      console.warn('[TiptapEditor] Bootstrap Modal not found. Video modal may not work.');
    }
    this._bs = BSModal
      ? new BSModal(this._modal)
      : { show() {}, hide() {}, dispose() {} };

    this._bindEvents();
  }

  _template() {
    const uid = `tiptap-video-modal-${Date.now()}`;
    return `
<div class="modal fade tiptap-video-modal" id="${uid}"
     tabindex="-1" aria-labelledby="${uid}-title" aria-hidden="true"
     data-bs-backdrop="static">
  <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content">

      <!-- Header -->
      <div class="modal-header py-2 px-3">
        <h6 class="modal-title fw-semibold" id="${uid}-title">
          <i class="bi bi-play-btn me-2 text-primary"></i>
          <span class="tiptap-video-modal-title-text">Insert Video</span>
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
                <button type="button" class="nav-link py-1 px-3 active tiptap-video-tab-btn fs-sm"
                        data-tab="url" role="tab">
                  <i class="bi bi-link-45deg me-1"></i>URL
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button type="button" class="nav-link py-1 px-3 tiptap-video-tab-btn fs-sm"
                        data-tab="upload" role="tab">
                  <i class="bi bi-upload me-1"></i>Upload
                </button>
              </li>
            </ul>

            <!-- URL panel -->
            <div class="tiptap-video-panel" data-panel="url">
              <label class="form-label small fw-medium mb-1">Video URL</label>
              <input type="url" class="form-control form-control-sm tiptap-video-url-input"
                     placeholder="https://www.youtube.com/watch?v=...">
              <div class="form-text">Supports YouTube, Vimeo, or direct MP4/WebM links.</div>
              <div class="tiptap-video-provider-badge mt-2 d-none">
                <span class="badge bg-secondary tiptap-video-provider-name"></span>
              </div>
            </div>

            <!-- Upload panel -->
            <div class="tiptap-video-panel d-none" data-panel="upload">
              <div class="tiptap-video-dropzone rounded-2 border-2 border-dashed
                          d-flex flex-column align-items-center justify-content-center
                          py-4 px-3 gap-2 text-center position-relative"
                   style="cursor:pointer;min-height:130px">
                <i class="bi bi-cloud-upload fs-3 text-secondary"></i>
                <p class="mb-0 small text-secondary tiptap-video-dropzone-label">
                  Drag & drop video here, or click to browse
                </p>
                <span class="badge bg-light text-secondary border tiptap-video-file-name d-none"></span>
                <input type="file" accept="video/mp4,video/webm" class="tiptap-video-file-input"
                       style="position:absolute;inset:0;opacity:0;cursor:pointer">
              </div>
              <div class="form-text mt-1">Accepted formats: MP4, WebM</div>
            </div>

            <!-- ─── Common fields ─── -->
            <div class="mt-3 d-flex flex-column gap-2">

              <!-- Title -->
              <div>
                <label class="form-label small fw-medium mb-1">Title</label>
                <input type="text" class="form-control form-control-sm tiptap-video-title-input"
                       placeholder="Video title (accessibility)">
              </div>

              <!-- Caption -->
              <div>
                <label class="form-label small fw-medium mb-1">
                  Caption <span class="text-muted fw-normal">(optional)</span>
                </label>
                <input type="text" class="form-control form-control-sm tiptap-video-caption-input"
                       placeholder="Shown below the video">
              </div>

            </div>
          </div><!-- /left col -->

          <!-- ── Right column: options + preview ── -->
          <div class="col-lg-5">

            <!-- Preview -->
            <div class="mb-3">
              <label class="form-label small fw-medium mb-1">Preview</label>
              <div class="tiptap-video-preview-wrap rounded-2 bg-body-secondary
                          d-flex align-items-center justify-content-center"
                   style="min-height:120px;overflow:hidden">
                <div class="tiptap-video-preview w-100" style="display:none"></div>
                <span class="tiptap-video-preview-placeholder text-secondary">
                  <i class="bi bi-play-btn fs-2 d-block"></i>
                  <span class="small">No video</span>
                </span>
              </div>
            </div>

            <!-- Aspect ratio -->
            <div class="mb-3">
              <label class="form-label small fw-medium mb-1">Aspect Ratio</label>
              <div class="d-flex gap-1 flex-wrap">
                <button type="button"
                        class="btn btn-sm btn-outline-secondary tiptap-video-ratio-btn py-0 active"
                        data-ratio="16x9">16:9</button>
                <button type="button"
                        class="btn btn-sm btn-outline-secondary tiptap-video-ratio-btn py-0"
                        data-ratio="4x3">4:3</button>
                <button type="button"
                        class="btn btn-sm btn-outline-secondary tiptap-video-ratio-btn py-0"
                        data-ratio="1x1">1:1</button>
                <button type="button"
                        class="btn btn-sm btn-outline-secondary tiptap-video-ratio-btn py-0"
                        data-ratio="21x9">21:9</button>
              </div>
            </div>

            <!-- Alignment -->
            <div class="mb-3">
              <label class="form-label small fw-medium mb-1">Alignment</label>
              <div class="d-flex gap-2">
                <label class="tiptap-align-btn flex-fill text-center border rounded-2 py-2 px-1"
                       title="Align left" style="cursor:pointer">
                  <input type="radio" name="${uid}-align" value="left"
                         class="d-none tiptap-video-align-radio">
                  <i class="bi bi-align-start d-block fs-5"></i>
                  <span style="font-size:10px">Left</span>
                </label>
                <label class="tiptap-align-btn flex-fill text-center border rounded-2 py-2 px-1 tiptap-align-active"
                       title="Align center" style="cursor:pointer">
                  <input type="radio" name="${uid}-align" value="center"
                         class="d-none tiptap-video-align-radio" checked>
                  <i class="bi bi-align-center d-block fs-5"></i>
                  <span style="font-size:10px">Center</span>
                </label>
                <label class="tiptap-align-btn flex-fill text-center border rounded-2 py-2 px-1"
                       title="Align right" style="cursor:pointer">
                  <input type="radio" name="${uid}-align" value="right"
                         class="d-none tiptap-video-align-radio">
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
                        class="btn btn-sm btn-outline-secondary tiptap-video-width-btn py-0 active"
                        data-width="">Auto</button>
                <button type="button"
                        class="btn btn-sm btn-outline-secondary tiptap-video-width-btn py-0"
                        data-width="50%">50%</button>
                <button type="button"
                        class="btn btn-sm btn-outline-secondary tiptap-video-width-btn py-0"
                        data-width="75%">75%</button>
                <button type="button"
                        class="btn btn-sm btn-outline-secondary tiptap-video-width-btn py-0"
                        data-width="100%">100%</button>
              </div>
              <div class="input-group input-group-sm">
                <input type="text" class="form-control tiptap-video-width-input"
                       placeholder="e.g. 640px or 80%">
                <span class="input-group-text text-muted">px / %</span>
              </div>
            </div>

          </div><!-- /right col -->
        </div><!-- /row -->
      </div><!-- /body -->

      <!-- Footer -->
      <div class="modal-footer py-2 px-3">
        <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-sm btn-primary tiptap-video-insert-btn">
          <i class="bi bi-check2 me-1"></i><span class="tiptap-video-insert-btn-text">Insert Video</span>
        </button>
      </div>

    </div>
  </div>
</div>`;
  }

  _bindEvents() {
    // Tabs
    this._modal.querySelectorAll('.tiptap-video-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => this._switchTab(btn.dataset.tab));
    });

    // URL input — detect provider on blur/input
    const urlInput = this._modal.querySelector('.tiptap-video-url-input');
    urlInput.addEventListener('input', () => this._detectProvider());
    urlInput.addEventListener('blur', () => this._detectProvider());

    // File input & dropzone
    const fileInput = this._modal.querySelector('.tiptap-video-file-input');
    const dropzone = this._modal.querySelector('.tiptap-video-dropzone');

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) this._handleFileSelect(file);
    });

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('tiptap-dropzone-active');
    });
    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('tiptap-dropzone-active');
    });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('tiptap-dropzone-active');
      const file = e.dataTransfer?.files?.[0];
      if (file && (file.type === 'video/mp4' || file.type === 'video/webm')) {
        this._handleFileSelect(file);
      }
    });

    // Ratio buttons
    this._modal.querySelectorAll('.tiptap-video-ratio-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._modal.querySelectorAll('.tiptap-video-ratio-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Alignment radios
    this._modal.querySelectorAll('.tiptap-video-align-radio').forEach((radio) => {
      radio.addEventListener('change', () => {
        this._modal.querySelectorAll('.tiptap-video-align-radio').forEach((r) => {
          r.closest('.tiptap-align-btn').classList.toggle('tiptap-align-active', r.checked);
        });
      });
    });

    // Width buttons
    this._modal.querySelectorAll('.tiptap-video-width-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._modal.querySelectorAll('.tiptap-video-width-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this._modal.querySelector('.tiptap-video-width-input').value = btn.dataset.width || '';
      });
    });

    // Width input clears buttons
    this._modal.querySelector('.tiptap-video-width-input').addEventListener('input', () => {
      this._modal.querySelectorAll('.tiptap-video-width-btn').forEach((b) => b.classList.remove('active'));
    });

    // Insert button
    this._modal.querySelector('.tiptap-video-insert-btn')
      .addEventListener('click', () => this._submit());
  }

  _switchTab(tab) {
    this._modal.querySelectorAll('.tiptap-video-tab-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    this._modal.querySelectorAll('.tiptap-video-panel').forEach((panel) => {
      panel.classList.toggle('d-none', panel.dataset.panel !== tab);
    });
  }

  _reset() {
    this._editMode = false;
    this._pendingFile = null;

    this._modal.querySelector('.tiptap-video-url-input').value = '';
    this._modal.querySelector('.tiptap-video-title-input').value = '';
    this._modal.querySelector('.tiptap-video-caption-input').value = '';
    this._modal.querySelector('.tiptap-video-width-input').value = '';

    // Reset file input
    const fileInput = this._modal.querySelector('.tiptap-video-file-input');
    if (fileInput) fileInput.value = '';

    // Reset file name badge
    const fn = this._modal.querySelector('.tiptap-video-file-name');
    if (fn) { fn.textContent = ''; fn.classList.add('d-none'); }

    // Reset dropzone label
    const dzLabel = this._modal.querySelector('.tiptap-video-dropzone-label');
    if (dzLabel) dzLabel.textContent = 'Drag & drop video here, or click to browse';

    // Reset provider badge
    const provBadge = this._modal.querySelector('.tiptap-video-provider-badge');
    if (provBadge) provBadge.classList.add('d-none');

    // Reset ratio
    this._modal.querySelectorAll('.tiptap-video-ratio-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.ratio === '16x9');
    });

    // Reset alignment
    this._modal.querySelectorAll('.tiptap-video-align-radio').forEach((r) => {
      const isCenter = r.value === 'center';
      r.checked = isCenter;
      r.closest('.tiptap-align-btn').classList.toggle('tiptap-align-active', isCenter);
    });

    // Reset width
    this._modal.querySelectorAll('.tiptap-video-width-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.width === '');
    });

    // Reset preview
    this._hidePreview();

    // Reset to URL tab
    this._switchTab('url');
  }

  _populate(attrs) {
    const url = attrs.url || '';
    const title = attrs.title || '';
    const caption = attrs.caption || '';
    const aspectRatio = attrs.aspectRatio || '16x9';
    const alignment = attrs.alignment || 'center';
    const widthStyle = attrs.widthStyle || '';

    // URL
    this._modal.querySelector('.tiptap-video-url-input').value = url;
    this._detectProvider();

    // Title & caption
    this._modal.querySelector('.tiptap-video-title-input').value = title;
    this._modal.querySelector('.tiptap-video-caption-input').value = caption;

    // Aspect ratio
    this._modal.querySelectorAll('.tiptap-video-ratio-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.ratio === aspectRatio);
    });

    // Alignment
    this._modal.querySelectorAll('.tiptap-video-align-radio').forEach((r) => {
      r.checked = r.value === alignment;
      r.closest('.tiptap-align-btn').classList.toggle('tiptap-align-active', r.value === alignment);
    });

    // Width
    if (widthStyle) {
      this._modal.querySelector('.tiptap-video-width-input').value = widthStyle;
      this._modal.querySelectorAll('.tiptap-video-width-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.width === widthStyle);
      });
    }

    // Show preview
    this._showPreview(url, attrs.provider);
  }

  _detectProvider() {
    const url = this._modal.querySelector('.tiptap-video-url-input').value.trim();
    const badge = this._modal.querySelector('.tiptap-video-provider-badge');
    const badgeName = this._modal.querySelector('.tiptap-video-provider-name');

    if (!url) {
      badge.classList.add('d-none');
      this._hidePreview();
      return;
    }

    const detected = detectProvider(url);
    if (detected) {
      const providerLabels = { youtube: 'YouTube', vimeo: 'Vimeo', mp4: 'MP4/WebM' };
      badgeName.textContent = providerLabels[detected.provider] || detected.provider;
      badge.classList.remove('d-none');
      this._showPreview(url, detected.provider, detected.videoId);
    } else {
      badge.classList.add('d-none');
      this._hidePreview();
    }
  }

  _handleFileSelect(file) {
    this._pendingFile = file;

    const fn = this._modal.querySelector('.tiptap-video-file-name');
    if (fn) {
      fn.textContent = file.name;
      fn.classList.remove('d-none');
    }

    const dzLabel = this._modal.querySelector('.tiptap-video-dropzone-label');
    if (dzLabel) dzLabel.textContent = 'File selected';

    // Show preview using object URL
    const objUrl = URL.createObjectURL(file);
    this._showPreview(objUrl, 'mp4');
  }

  _showPreview(url, provider, videoId = null) {
    const previewWrap = this._modal.querySelector('.tiptap-video-preview');
    const placeholder = this._modal.querySelector('.tiptap-video-preview-placeholder');

    previewWrap.innerHTML = '';

    if (provider === 'mp4') {
      const video = document.createElement('video');
      video.controls = true;
      video.className = 'w-100';
      video.style.maxHeight = '160px';
      const source = document.createElement('source');
      source.src = url;
      source.type = 'video/mp4';
      video.appendChild(source);
      previewWrap.appendChild(video);
    } else {
      const providerConfig = PROVIDERS[provider];
      if (providerConfig && videoId) {
        const iframe = document.createElement('iframe');
        iframe.src = providerConfig.embedUrl(videoId);
        iframe.className = 'w-100';
        iframe.style.height = '160px';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        iframe.loading = 'lazy';
        iframe.frameBorder = '0';
        previewWrap.appendChild(iframe);
      }
    }

    if (previewWrap.childElementCount > 0) {
      previewWrap.style.display = '';
      if (placeholder) placeholder.style.display = 'none';
    }
  }

  _hidePreview() {
    const previewWrap = this._modal.querySelector('.tiptap-video-preview');
    const placeholder = this._modal.querySelector('.tiptap-video-preview-placeholder');
    if (previewWrap) { previewWrap.innerHTML = ''; previewWrap.style.display = 'none'; }
    if (placeholder) placeholder.style.display = '';
  }

  async _submit() {
    let url = null;
    let provider = null;
    let videoId = null;

    const activeTab = this._modal.querySelector('.tiptap-video-tab-btn.active')?.dataset.tab || 'url';

    if (activeTab === 'upload' && this._pendingFile) {
      // Upload file to server
      try {
        const uploadUrl = this.toolbar._getUploadUrl();
        if (!uploadUrl) {
          alert('No upload URL configured. Please set data-upload-url on the editor wrapper or add a tiptap-upload-url meta tag.');
          return;
        }

        const insertBtn = this._modal.querySelector('.tiptap-video-insert-btn');
        insertBtn.disabled = true;
        insertBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Uploading…';

        const media = await this.toolbar._uploadFile(this._pendingFile, uploadUrl);
        url = media.url;
        provider = 'mp4';
        videoId = url;

        insertBtn.disabled = false;
        insertBtn.innerHTML = '<i class="bi bi-check2 me-1"></i><span class="tiptap-video-insert-btn-text">Insert Video</span>';
      } catch (err) {
        console.error('[TiptapEditor] Video upload failed:', err);
        alert('Video upload failed. Please try again.');
        const insertBtn = this._modal.querySelector('.tiptap-video-insert-btn');
        insertBtn.disabled = false;
        insertBtn.innerHTML = '<i class="bi bi-check2 me-1"></i><span class="tiptap-video-insert-btn-text">Insert Video</span>';
        return;
      }
    } else {
      // URL mode
      url = this._modal.querySelector('.tiptap-video-url-input').value.trim();
      if (!url) {
        const input = this._modal.querySelector('.tiptap-video-url-input');
        input.classList.add('is-invalid');
        input.focus();
        setTimeout(() => input.classList.remove('is-invalid'), 2000);
        return;
      }

      const detected = detectProvider(url);
      if (!detected) {
        const input = this._modal.querySelector('.tiptap-video-url-input');
        input.classList.add('is-invalid');
        input.focus();
        alert('Unsupported video URL. Supported: YouTube, Vimeo, MP4/WebM.');
        setTimeout(() => input.classList.remove('is-invalid'), 2000);
        return;
      }

      provider = detected.provider;
      videoId = detected.videoId;
    }

    // Gather attributes
    const title = this._modal.querySelector('.tiptap-video-title-input').value.trim();
    const caption = this._modal.querySelector('.tiptap-video-caption-input').value.trim();
    const aspectRatio = this._modal.querySelector('.tiptap-video-ratio-btn.active')?.dataset.ratio || '16x9';
    const alignment = this._modal.querySelector('.tiptap-video-align-radio:checked')?.value || 'center';

    // Width
    let widthStyle = this._modal.querySelector('.tiptap-video-width-input').value.trim();
    const widthBtn = this._modal.querySelector('.tiptap-video-width-btn.active');
    if (widthBtn && widthBtn.dataset.width) {
      widthStyle = widthBtn.dataset.width;
    }
    // Validate
    if (widthStyle && !/^\d+(\.\d+)?(px|%)$/.test(widthStyle)) {
      widthStyle = '';
    }

    const attrs = {
      url,
      provider,
      videoId,
      title: title || '',
      caption: caption || '',
      aspectRatio,
      alignment,
      widthStyle: widthStyle || null,
    };

    if (this._editMode) {
      this.editor.chain().focus().updateCustomVideo(attrs).run();
    } else {
      this.editor.chain().focus().insertCustomVideo(attrs).run();
    }

    this._bs.hide();
  }
}
