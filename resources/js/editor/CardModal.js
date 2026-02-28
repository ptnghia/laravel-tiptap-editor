/**
 * CardModal – Bootstrap 5 Modal for inserting & editing Bootstrap cards.
 *
 * Features:
 *  - Header text (optional)
 *  - Footer text (optional)
 *  - Border color selector (contextual colors)
 *  - Live preview
 *  - Edit mode via double-click on existing cards
 */

import { CARD_BORDER_COLORS } from './extensions/BootstrapCard.js';

export class CardModal {
  /**
   * @param {import('./Toolbar').default} toolbar
   */
  constructor(toolbar) {
    this.toolbar = toolbar;
    this.editor = toolbar.editor;
    this._modal = null;
    this._bs = null;
    this._editMode = false;
    this._build();
  }

  /* ───────────────────────────────────── public ── */

  /**
   * Open the modal.
   * @param {Object|null} existingAttrs  – if set, enters edit mode.
   */
  open(existingAttrs = null) {
    this._reset();
    this._editMode = !!existingAttrs;

    if (existingAttrs) {
      this._populate(existingAttrs);
      this._el('titleText').textContent = 'Edit Card';
      this._el('insertBtn').innerHTML = '<i class="bi bi-check-lg me-1"></i>Update';
      this._el('deleteBtn').classList.remove('d-none');
    } else {
      this._el('titleText').textContent = 'Insert Card';
      this._el('insertBtn').innerHTML = '<i class="bi bi-card-heading me-1"></i>Insert Card';
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
    this._el('headerText').value = '';
    this._el('footerText').value = '';
    this._setBorderColor('');
    this._el('deleteBtn').classList.add('d-none');
    this._updatePreview();
  }

  _populate(attrs) {
    this._el('headerText').value = attrs.headerText || '';
    this._el('footerText').value = attrs.footerText || '';
    this._setBorderColor(attrs.borderColor || '');
    this._updatePreview();
  }

  _el(name) {
    return this._modal.querySelector(`[data-cardm="${name}"]`);
  }

  _setBorderColor(color) {
    this._modal.querySelectorAll('[data-card-border]').forEach(el => {
      el.classList.toggle('active', el.dataset.cardBorder === color);
    });
  }

  _getBorderColor() {
    const active = this._modal.querySelector('[data-card-border].active');
    return active?.dataset.cardBorder || null;
  }

  _bindEvents() {
    // Border color selector
    this._modal.querySelectorAll('[data-card-border]').forEach(el => {
      el.addEventListener('click', () => {
        const current = this._getBorderColor();
        // Toggle: click active to deselect
        if (current === el.dataset.cardBorder) {
          this._setBorderColor('');
        } else {
          this._setBorderColor(el.dataset.cardBorder);
        }
        this._updatePreview();
      });
    });

    // Live preview
    ['headerText', 'footerText'].forEach(f => {
      this._el(f).addEventListener('input', () => this._updatePreview());
    });

    // Insert / Update
    this._el('insertBtn').addEventListener('click', () => this._submit());

    // Delete
    this._el('deleteBtn').addEventListener('click', () => {
      if (this._editMode) {
        this.editor.chain().focus().deleteNode('bootstrapCard').run();
      }
      this._bs.hide();
    });
  }

  _submit() {
    const attrs = {
      headerText: this._el('headerText').value || null,
      footerText: this._el('footerText').value || null,
      borderColor: this._getBorderColor(),
    };

    if (this._editMode) {
      this.editor.chain().focus().updateAttributes('bootstrapCard', attrs).run();
    } else {
      this.editor.chain().focus().insertBootstrapCard(attrs).run();
    }

    this._bs.hide();
  }

  _updatePreview() {
    const preview = this._el('preview');
    const header = this._el('headerText').value;
    const footer = this._el('footerText').value;
    const border = this._getBorderColor();

    let classes = 'card';
    if (border) classes += ` border-${border}`;

    let html = `<div class="${classes}" style="max-width: 100%;">`;
    if (header) {
      html += `<div class="card-header">${this._escHtml(header)}</div>`;
    }
    html += `<div class="card-body"><p class="card-text text-muted small">Card content goes here...</p></div>`;
    if (footer) {
      html += `<div class="card-footer text-muted">${this._escHtml(footer)}</div>`;
    }
    html += '</div>';

    preview.innerHTML = html;
  }

  _escHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  static BORDER_COLOR_MAP = {
    primary: '#0d6efd', secondary: '#6c757d', success: '#198754', danger: '#dc3545',
    warning: '#ffc107', info: '#0dcaf0', light: '#f8f9fa', dark: '#212529',
  };

  _template() {
    const colorSwatches = CARD_BORDER_COLORS.map(c => {
      const bg = CardModal.BORDER_COLOR_MAP[c] || '#6c757d';
      const border = c === 'light' ? '1px solid #dee2e6' : 'none';
      const tc = ['light', 'warning'].includes(c) ? '#000' : '#fff';
      return `<button type="button" class="tiptap-btn-variant-swatch" data-card-border="${c}"
                style="background:${bg}; border:${border}; color:${tc}" title="${c}">
                ${c.charAt(0).toUpperCase()}
              </button>`;
    }).join('');

    return `
<div class="modal fade tiptap-card-modal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header py-2 px-3">
        <h6 class="modal-title fw-semibold">
          <i class="bi bi-card-heading me-2 text-primary"></i>
          <span data-cardm="titleText">Insert Card</span>
        </h6>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">

        <!-- Preview -->
        <div class="mb-3 p-3 bg-light rounded" data-cardm="preview"></div>

        <!-- Header text -->
        <div class="mb-3">
          <label class="form-label small fw-medium">Header Text <span class="text-muted fw-normal">(optional)</span></label>
          <input type="text" class="form-control form-control-sm" data-cardm="headerText"
                 placeholder="e.g. Card Title">
        </div>

        <!-- Footer text -->
        <div class="mb-3">
          <label class="form-label small fw-medium">Footer Text <span class="text-muted fw-normal">(optional)</span></label>
          <input type="text" class="form-control form-control-sm" data-cardm="footerText"
                 placeholder="e.g. Last updated 3 mins ago">
        </div>

        <!-- Border color -->
        <div>
          <label class="form-label small fw-medium">Border Color <span class="text-muted fw-normal">(optional)</span></label>
          <div class="d-flex flex-wrap gap-1">
            ${colorSwatches}
          </div>
        </div>

      </div>
      <div class="modal-footer py-2 px-3">
        <button type="button" class="btn btn-sm btn-outline-danger rounded-pill px-3 d-none" data-cardm="deleteBtn">
          <i class="bi bi-trash me-1"></i>Delete
        </button>
        <button type="button" class="btn btn-sm btn-secondary rounded-pill px-3" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-sm btn-primary rounded-pill px-3" data-cardm="insertBtn">
          <i class="bi bi-card-heading me-1"></i>Insert Card
        </button>
      </div>
    </div>
  </div>
</div>`;
  }
}
