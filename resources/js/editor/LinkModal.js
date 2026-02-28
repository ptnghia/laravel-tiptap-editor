/**
 * LinkModal – Bootstrap 5 Modal for inserting & editing links.
 *
 * Features:
 *  - Link type tabs: URL, Anchor (#id), Email (mailto:), Phone (tel:)
 *  - Title attribute
 *  - Open in new tab checkbox (target="_blank")
 *  - Rel options: nofollow, ugc, sponsored (multi-select)
 *  - CSS class field
 *  - Edit mode: pre-populate from existing link mark
 *  - Unlink button in edit mode
 */
export class LinkModal {
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

  /* ─────────────────────────────────────────────────── public ── */

  /**
   * Open the modal.
   * @param {Object|null} existingAttrs – if set, enters edit mode
   */
  open(existingAttrs = null) {
    this._reset();
    this._editMode = !!existingAttrs;

    // Update title
    const titleEl = this._modal.querySelector('.tiptap-link-modal-title-text');
    if (titleEl) titleEl.textContent = this._editMode ? 'Edit Link' : 'Insert Link';

    // Show/hide unlink button
    const unlinkBtn = this._modal.querySelector('.tiptap-link-unlink-btn');
    if (unlinkBtn) unlinkBtn.style.display = this._editMode ? '' : 'none';

    if (existingAttrs) {
      this._populate(existingAttrs);
    }

    // Show selected text as context
    this._showSelectedText();

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
      console.warn('[TiptapEditor] Bootstrap Modal not found. Link modal may not work.');
    }
    this._bs = BSModal
      ? new BSModal(this._modal)
      : { show() {}, hide() {}, dispose() {} };

    this._bindEvents();
  }

  _template() {
    const uid = `tiptap-link-modal-${Date.now()}`;
    return `
<div class="modal fade tiptap-link-modal" id="${uid}"
     tabindex="-1" aria-labelledby="${uid}-title" aria-hidden="true"
     data-bs-backdrop="static">
  <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content">

      <!-- Header -->
      <div class="modal-header py-2 px-3">
        <h6 class="modal-title fw-semibold" id="${uid}-title">
          <i class="bi bi-link-45deg me-2 text-primary"></i>
          <span class="tiptap-link-modal-title-text">Insert Link</span>
        </h6>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

      <!-- Body -->
      <div class="modal-body p-3">

        <!-- Selected text context -->
        <div class="tiptap-link-selected-text mb-3 d-none">
          <small class="text-muted">Selected text:</small>
          <span class="fw-medium tiptap-link-selected-text-label"></span>
        </div>

        <!-- Link type tabs -->
        <ul class="nav nav-pills nav-sm mb-3 gap-1" role="tablist">
          <li class="nav-item" role="presentation">
            <button type="button" class="nav-link py-1 px-3 active tiptap-link-type-btn fs-sm"
                    data-type="url" role="tab">
              <i class="bi bi-globe me-1"></i>URL
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button type="button" class="nav-link py-1 px-3 tiptap-link-type-btn fs-sm"
                    data-type="anchor" role="tab">
              <i class="bi bi-hash me-1"></i>Anchor
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button type="button" class="nav-link py-1 px-3 tiptap-link-type-btn fs-sm"
                    data-type="email" role="tab">
              <i class="bi bi-envelope me-1"></i>Email
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button type="button" class="nav-link py-1 px-3 tiptap-link-type-btn fs-sm"
                    data-type="tel" role="tab">
              <i class="bi bi-phone me-1"></i>Phone
            </button>
          </li>
        </ul>

        <!-- URL panel -->
        <div class="tiptap-link-panel" data-panel="url">
          <label class="form-label small fw-medium mb-1">URL</label>
          <input type="url" class="form-control form-control-sm tiptap-link-href-input"
                 placeholder="https://example.com">
        </div>

        <!-- Anchor panel -->
        <div class="tiptap-link-panel d-none" data-panel="anchor">
          <label class="form-label small fw-medium mb-1">Anchor ID</label>
          <div class="input-group input-group-sm">
            <span class="input-group-text">#</span>
            <input type="text" class="form-control tiptap-link-anchor-input"
                   placeholder="section-name">
          </div>
          <div class="form-text">Link to an element with this ID on the same page.</div>
        </div>

        <!-- Email panel -->
        <div class="tiptap-link-panel d-none" data-panel="email">
          <label class="form-label small fw-medium mb-1">Email Address</label>
          <div class="input-group input-group-sm">
            <span class="input-group-text"><i class="bi bi-envelope"></i></span>
            <input type="email" class="form-control tiptap-link-email-input"
                   placeholder="user@example.com">
          </div>
        </div>

        <!-- Phone panel -->
        <div class="tiptap-link-panel d-none" data-panel="tel">
          <label class="form-label small fw-medium mb-1">Phone Number</label>
          <div class="input-group input-group-sm">
            <span class="input-group-text"><i class="bi bi-phone"></i></span>
            <input type="tel" class="form-control tiptap-link-tel-input"
                   placeholder="+1 234 567 8900">
          </div>
        </div>

        <hr class="my-3">

        <!-- Title -->
        <div class="mb-3">
          <label class="form-label small fw-medium mb-1">
            Title <span class="text-muted fw-normal">(tooltip on hover)</span>
          </label>
          <input type="text" class="form-control form-control-sm tiptap-link-title-input"
                 placeholder="Link title…">
        </div>

        <!-- Target & rel row -->
        <div class="row g-3 mb-3">
          <div class="col-sm-6">
            <div class="form-check">
              <input class="form-check-input tiptap-link-blank-check" type="checkbox"
                     id="${uid}-blank">
              <label class="form-check-label small" for="${uid}-blank">
                Open in new tab <code class="small">_blank</code>
              </label>
            </div>
          </div>
        </div>

        <!-- Rel options -->
        <div class="mb-3">
          <label class="form-label small fw-medium mb-1">
            Rel attributes <span class="text-muted fw-normal">(SEO)</span>
          </label>
          <div class="d-flex flex-wrap gap-3">
            <div class="form-check">
              <input class="form-check-input tiptap-link-rel-check" type="checkbox"
                     value="nofollow" id="${uid}-nofollow">
              <label class="form-check-label small" for="${uid}-nofollow">nofollow</label>
            </div>
            <div class="form-check">
              <input class="form-check-input tiptap-link-rel-check" type="checkbox"
                     value="ugc" id="${uid}-ugc">
              <label class="form-check-label small" for="${uid}-ugc">ugc</label>
            </div>
            <div class="form-check">
              <input class="form-check-input tiptap-link-rel-check" type="checkbox"
                     value="sponsored" id="${uid}-sponsored">
              <label class="form-check-label small" for="${uid}-sponsored">sponsored</label>
            </div>
          </div>
        </div>

        <!-- CSS class -->
        <div class="mb-1">
          <label class="form-label small fw-medium mb-1">
            CSS Class <span class="text-muted fw-normal">(optional)</span>
          </label>
          <input type="text" class="form-control form-control-sm tiptap-link-class-input"
                 placeholder="e.g. btn btn-primary">
        </div>

      </div><!-- /body -->

      <!-- Footer -->
      <div class="modal-footer py-2 px-3">
        <button type="button" class="btn btn-sm btn-outline-danger tiptap-link-unlink-btn"
                style="display:none">
          <i class="bi bi-link-45deg me-1"></i>Unlink
        </button>
        <div class="flex-grow-1"></div>
        <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-sm btn-primary tiptap-link-insert-btn">
          <i class="bi bi-check2 me-1"></i><span class="tiptap-link-insert-btn-text">Insert Link</span>
        </button>
      </div>

    </div>
  </div>
</div>`;
  }

  _bindEvents() {
    // Type tabs
    this._modal.querySelectorAll('.tiptap-link-type-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._switchType(btn.dataset.type);
      });
    });

    // Insert / Update
    this._modal.querySelector('.tiptap-link-insert-btn')
      .addEventListener('click', () => this._submit());

    // Unlink
    this._modal.querySelector('.tiptap-link-unlink-btn')
      .addEventListener('click', () => this._unlink());

    // Enter key on inputs submits
    this._modal.querySelectorAll('input').forEach((input) => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this._submit();
        }
      });
    });
  }

  _switchType(type) {
    // Update tabs
    this._modal.querySelectorAll('.tiptap-link-type-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.type === type);
    });

    // Update panels
    this._modal.querySelectorAll('.tiptap-link-panel').forEach((panel) => {
      panel.classList.toggle('d-none', panel.dataset.panel !== type);
    });
  }

  _reset() {
    this._editMode = false;

    // Reset all inputs
    this._modal.querySelector('.tiptap-link-href-input').value = '';
    this._modal.querySelector('.tiptap-link-anchor-input').value = '';
    this._modal.querySelector('.tiptap-link-email-input').value = '';
    this._modal.querySelector('.tiptap-link-tel-input').value = '';
    this._modal.querySelector('.tiptap-link-title-input').value = '';
    this._modal.querySelector('.tiptap-link-class-input').value = '';
    this._modal.querySelector('.tiptap-link-blank-check').checked = false;

    // Reset rel checkboxes
    this._modal.querySelectorAll('.tiptap-link-rel-check').forEach((chk) => {
      chk.checked = false;
    });

    // Reset to URL tab
    this._switchType('url');

    // Reset button text
    const btnText = this._modal.querySelector('.tiptap-link-insert-btn-text');
    if (btnText) btnText.textContent = 'Insert Link';

    // Hide selected text
    const ctx = this._modal.querySelector('.tiptap-link-selected-text');
    if (ctx) ctx.classList.add('d-none');
  }

  _showSelectedText() {
    const { from, to } = this.editor.state.selection;
    const text = this.editor.state.doc.textBetween(from, to, ' ');
    const ctx = this._modal.querySelector('.tiptap-link-selected-text');
    const label = this._modal.querySelector('.tiptap-link-selected-text-label');

    if (text && text.trim()) {
      if (ctx) ctx.classList.remove('d-none');
      if (label) label.textContent = text.length > 60 ? text.substring(0, 60) + '…' : text;
    }
  }

  _populate(attrs) {
    const href = attrs.href || '';
    const target = attrs.target || '';
    const rel = attrs.rel || '';
    const title = attrs.title || '';
    const cssClass = attrs.class || '';

    // Detect link type from href
    if (href.startsWith('mailto:')) {
      this._switchType('email');
      this._modal.querySelector('.tiptap-link-email-input').value = href.replace('mailto:', '');
    } else if (href.startsWith('tel:')) {
      this._switchType('tel');
      this._modal.querySelector('.tiptap-link-tel-input').value = href.replace('tel:', '');
    } else if (href.startsWith('#')) {
      this._switchType('anchor');
      this._modal.querySelector('.tiptap-link-anchor-input').value = href.replace('#', '');
    } else {
      this._switchType('url');
      this._modal.querySelector('.tiptap-link-href-input').value = href;
    }

    // Title
    this._modal.querySelector('.tiptap-link-title-input').value = title;

    // CSS class
    this._modal.querySelector('.tiptap-link-class-input').value = cssClass;

    // Target
    this._modal.querySelector('.tiptap-link-blank-check').checked = target === '_blank';

    // Rel
    const relParts = rel.split(/\s+/).filter(Boolean);
    this._modal.querySelectorAll('.tiptap-link-rel-check').forEach((chk) => {
      chk.checked = relParts.includes(chk.value);
    });

    // Button text
    const btnText = this._modal.querySelector('.tiptap-link-insert-btn-text');
    if (btnText) btnText.textContent = 'Update Link';
  }

  /**
   * Build the href from current active type & input.
   * @returns {string|null}
   */
  _getHref() {
    const activeType = this._modal.querySelector('.tiptap-link-type-btn.active')?.dataset.type || 'url';

    switch (activeType) {
      case 'url':
        return this._modal.querySelector('.tiptap-link-href-input').value.trim();
      case 'anchor': {
        const anchor = this._modal.querySelector('.tiptap-link-anchor-input').value.trim();
        return anchor ? `#${anchor}` : null;
      }
      case 'email': {
        const email = this._modal.querySelector('.tiptap-link-email-input').value.trim();
        return email ? `mailto:${email}` : null;
      }
      case 'tel': {
        const phone = this._modal.querySelector('.tiptap-link-tel-input').value.trim();
        return phone ? `tel:${phone}` : null;
      }
      default:
        return null;
    }
  }

  /**
   * Build rel string from checked checkboxes.
   * @returns {string}
   */
  _getRel() {
    const parts = [];
    const isBlank = this._modal.querySelector('.tiptap-link-blank-check').checked;

    // Always add noopener when _blank
    if (isBlank) {
      parts.push('noopener');
    }

    this._modal.querySelectorAll('.tiptap-link-rel-check:checked').forEach((chk) => {
      if (!parts.includes(chk.value)) {
        parts.push(chk.value);
      }
    });

    return parts.join(' ');
  }

  _submit() {
    const href = this._getHref();
    if (!href) {
      // Highlight the active input
      const activeType = this._modal.querySelector('.tiptap-link-type-btn.active')?.dataset.type || 'url';
      const inputMap = {
        url: '.tiptap-link-href-input',
        anchor: '.tiptap-link-anchor-input',
        email: '.tiptap-link-email-input',
        tel: '.tiptap-link-tel-input',
      };
      const input = this._modal.querySelector(inputMap[activeType]);
      if (input) {
        input.classList.add('is-invalid');
        input.focus();
        setTimeout(() => input.classList.remove('is-invalid'), 2000);
      }
      return;
    }

    const target = this._modal.querySelector('.tiptap-link-blank-check').checked ? '_blank' : null;
    const rel = this._getRel() || null;
    const title = this._modal.querySelector('.tiptap-link-title-input').value.trim() || null;
    const cssClass = this._modal.querySelector('.tiptap-link-class-input').value.trim() || null;

    const linkAttrs = { href };
    if (target) linkAttrs.target = target;
    if (rel) linkAttrs.rel = rel;
    if (title) linkAttrs.title = title;
    if (cssClass) linkAttrs.class = cssClass;

    this.editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink(linkAttrs)
      .run();

    this._bs.hide();
  }

  _unlink() {
    this.editor.chain().focus().unsetLink().run();
    this._bs.hide();
  }
}
