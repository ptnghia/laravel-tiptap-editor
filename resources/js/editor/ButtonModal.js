/**
 * ButtonModal – Bootstrap 5 Modal for inserting & editing Bootstrap buttons.
 *
 * Features:
 *  - Button text input
 *  - URL input
 *  - Variant selector with color swatches (primary, secondary, success, danger, etc.)
 *  - Size selector (default, sm, lg)
 *  - Outline toggle
 *  - Target (_self, _blank)
 *  - Live preview
 *  - Edit mode via double-click on existing buttons
 */

import { BUTTON_VARIANTS, BUTTON_SIZES } from './extensions/BootstrapButton.js';

export class ButtonModal {
  /**
   * @param {import('./Toolbar').default} toolbar
   */
  constructor(toolbar) {
    this.toolbar = toolbar;
    this.editor = toolbar.editor;
    this._modal = null;
    this._bs = null;
    this._editMode = false;
    this._editPos = null;
    this._build();
  }

  /* ───────────────────────────────────── public ── */

  /**
   * Open the modal.
   * @param {Object|null} existingAttrs  – if set, enters edit mode.
   * @param {number|null} pos            – node position for edit mode.
   */
  open(existingAttrs = null, pos = null) {
    this._reset();
    this._editMode = !!existingAttrs;
    this._editPos = pos;

    if (existingAttrs) {
      this._populate(existingAttrs);
      this._el('titleText').textContent = 'Edit Button';
      this._el('insertBtn').innerHTML = '<i class="bi bi-check-lg me-1"></i>Update';
      this._el('deleteBtn').classList.remove('d-none');
    } else {
      this._el('titleText').textContent = 'Insert Button';
      this._el('insertBtn').innerHTML = '<i class="bi bi-hand-index me-1"></i>Insert Button';
      this._el('deleteBtn').classList.add('d-none');
    }
    this._updatePreview();
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
    this._editMode = false;
    this._editPos = null;
    this._el('text').value = 'Click me';
    this._el('url').value = '#';
    this._setVariant('primary');
    this._el('sizeDefault').checked = true;
    this._el('outline').checked = false;
    this._el('targetSelf').checked = true;
    this._el('deleteBtn').classList.add('d-none');
    this._updatePreview();
  }

  _populate(attrs) {
    this._el('text').value = attrs.text || 'Button';
    this._el('url').value = attrs.url || '#';
    this._setVariant(attrs.variant || 'primary');

    // Size
    if (attrs.size === 'sm') this._el('sizeSm').checked = true;
    else if (attrs.size === 'lg') this._el('sizeLg').checked = true;
    else this._el('sizeDefault').checked = true;

    this._el('outline').checked = !!attrs.outline;

    // Target
    if (attrs.target === '_blank') this._el('targetBlank').checked = true;
    else this._el('targetSelf').checked = true;

    this._updatePreview();
  }

  _setVariant(variant) {
    this._modal.querySelectorAll('[data-btn-variant]').forEach(el => {
      el.classList.toggle('active', el.dataset.btnVariant === variant);
    });
  }

  _getVariant() {
    const active = this._modal.querySelector('[data-btn-variant].active');
    return active?.dataset.btnVariant || 'primary';
  }

  _el(name) {
    return this._modal.querySelector(`[data-btnm="${name}"]`);
  }

  _bindEvents() {
    // Variant selector
    this._modal.querySelectorAll('[data-btn-variant]').forEach(el => {
      el.addEventListener('click', () => {
        this._setVariant(el.dataset.btnVariant);
        this._updatePreview();
      });
    });

    // Live preview on input changes
    ['text', 'url'].forEach(f => {
      this._el(f).addEventListener('input', () => this._updatePreview());
    });
    this._el('outline').addEventListener('change', () => this._updatePreview());
    this._modal.querySelectorAll('[name="btnSize"]').forEach(r => {
      r.addEventListener('change', () => this._updatePreview());
    });

    // Insert / Update
    this._el('insertBtn').addEventListener('click', () => this._submit());

    // Delete
    this._el('deleteBtn').addEventListener('click', () => {
      if (this._editMode && this._editPos !== null) {
        this.editor.chain().focus().deleteBootstrapButton().run();
      }
      this._bs.hide();
    });
  }

  _submit() {
    const attrs = {
      text: this._el('text').value || 'Button',
      url: this._el('url').value || '#',
      variant: this._getVariant(),
      size: this._modal.querySelector('[name="btnSize"]:checked')?.value || null,
      outline: this._el('outline').checked,
      target: this._modal.querySelector('[name="btnTarget"]:checked')?.value || '_self',
    };

    if (attrs.size === '') attrs.size = null;

    if (this._editMode && this._editPos !== null) {
      this.editor.chain().focus()
        .command(({ tr }) => {
          tr.setNodeMarkup(this._editPos, undefined, attrs);
          return true;
        })
        .run();
    } else {
      this.editor.chain().focus().insertBootstrapButton(attrs).run();
    }

    this._bs.hide();
  }

  _updatePreview() {
    const preview = this._el('preview');
    const text = this._el('text').value || 'Button';
    const variant = this._getVariant();
    const outline = this._el('outline').checked;
    const sizeVal = this._modal.querySelector('[name="btnSize"]:checked')?.value || '';

    const btnClass = outline ? `btn-outline-${variant}` : `btn-${variant}`;
    let classes = `btn ${btnClass}`;
    if (sizeVal) classes += ` btn-${sizeVal}`;

    preview.innerHTML = `<span class="${classes}">${this._escHtml(text)}</span>`;
  }

  _escHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ─── Color map for variant swatches ── */
  static VARIANT_COLORS = {
    primary: '#0d6efd', secondary: '#6c757d', success: '#198754', danger: '#dc3545',
    warning: '#ffc107', info: '#0dcaf0', light: '#f8f9fa', dark: '#212529', link: '#6610f2',
  };

  _template() {
    const variantSwatches = BUTTON_VARIANTS.map(v => {
      const color = ButtonModal.VARIANT_COLORS[v] || '#6c757d';
      const border = v === 'light' ? '1px solid #dee2e6' : 'none';
      const textColor = ['light', 'warning'].includes(v) ? '#000' : '#fff';
      return `<button type="button" class="tiptap-btn-variant-swatch" data-btn-variant="${v}"
                style="background:${color}; border:${border}; color:${textColor}" title="${v}">
                ${v.charAt(0).toUpperCase()}
              </button>`;
    }).join('');

    return `
<div class="modal fade tiptap-button-modal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header py-2 px-3">
        <h6 class="modal-title fw-semibold">
          <i class="bi bi-hand-index me-2 text-primary"></i>
          <span data-btnm="titleText">Insert Button</span>
        </h6>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">

        <!-- Preview -->
        <div class="text-center mb-3 p-3 bg-light rounded" data-btnm="preview">
          <span class="btn btn-primary">Click me</span>
        </div>

        <div class="row g-3">
          <!-- Text -->
          <div class="col-6">
            <label class="form-label small fw-medium">Button Text</label>
            <input type="text" class="form-control form-control-sm" data-btnm="text"
                   value="Click me" placeholder="Button text">
          </div>
          <!-- URL -->
          <div class="col-6">
            <label class="form-label small fw-medium">URL</label>
            <input type="text" class="form-control form-control-sm" data-btnm="url"
                   value="#" placeholder="https://...">
          </div>
        </div>

        <!-- Variant -->
        <div class="mt-3">
          <label class="form-label small fw-medium">Style</label>
          <div class="d-flex flex-wrap gap-1">
            ${variantSwatches}
          </div>
        </div>

        <div class="row g-3 mt-1">
          <!-- Size -->
          <div class="col-6">
            <label class="form-label small fw-medium">Size</label>
            <div class="d-flex gap-2">
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" name="btnSize" value="sm" id="btnSizeSm" data-btnm="sizeSm">
                <label class="form-check-label small" for="btnSizeSm">Small</label>
              </div>
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" name="btnSize" value="" id="btnSizeDefault" data-btnm="sizeDefault" checked>
                <label class="form-check-label small" for="btnSizeDefault">Default</label>
              </div>
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" name="btnSize" value="lg" id="btnSizeLg" data-btnm="sizeLg">
                <label class="form-check-label small" for="btnSizeLg">Large</label>
              </div>
            </div>
          </div>

          <!-- Target -->
          <div class="col-6">
            <label class="form-label small fw-medium">Open in</label>
            <div class="d-flex gap-2">
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" name="btnTarget" value="_self" id="btnTargetSelf" data-btnm="targetSelf" checked>
                <label class="form-check-label small" for="btnTargetSelf">Same tab</label>
              </div>
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" name="btnTarget" value="_blank" id="btnTargetBlank" data-btnm="targetBlank">
                <label class="form-check-label small" for="btnTargetBlank">New tab</label>
              </div>
            </div>
          </div>
        </div>

        <!-- Outline -->
        <div class="mt-3">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" data-btnm="outline" id="btnOutline">
            <label class="form-check-label small" for="btnOutline">Outline style</label>
          </div>
        </div>

      </div>
      <div class="modal-footer py-2 px-3">
        <button type="button" class="btn btn-sm btn-outline-danger rounded-pill px-3 d-none" data-btnm="deleteBtn">
          <i class="bi bi-trash me-1"></i>Delete
        </button>
        <button type="button" class="btn btn-sm btn-secondary rounded-pill px-3" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-sm btn-primary rounded-pill px-3" data-btnm="insertBtn">
          <i class="bi bi-hand-index me-1"></i>Insert Button
        </button>
      </div>
    </div>
  </div>
</div>`;
  }
}
