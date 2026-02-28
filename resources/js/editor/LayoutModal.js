/**
 * LayoutModal – Bootstrap 5 Modal for configuring Bootstrap Grid layouts.
 *
 * Features:
 *  - Add / remove columns with per-breakpoint width (lg, md, sm, mobile)
 *  - Gutter (spacing) control (0-5)
 *  - Horizontal alignment: justify-content-* (start, center, end, between, around, evenly)
 *  - Vertical alignment: align-items-* (start, center, end, stretch)
 *  - Preset quick-select
 *  - Live preview
 *  - Edit mode via edit button on existing rows
 */

import { LAYOUT_PRESETS, ROW_JUSTIFY_OPTIONS, ROW_ALIGN_OPTIONS } from './extensions/BootstrapRow.js';

/** Bootstrap grid total = 12 */
const GRID_TOTAL = 12;

/** Breakpoint labels */
const BREAKPOINTS = [
  { key: 'lg', label: 'Desktop (lg)', prefix: 'col-lg' },
  { key: 'md', label: 'Tablet (md)', prefix: 'col-md' },
  { key: 'sm', label: 'Mobile L (sm)', prefix: 'col-sm' },
  { key: 'xs', label: 'Mobile (xs)', prefix: 'col' },
];

/** Column width options (auto, 1-12) */
const COL_WIDTHS = [
  { value: 'auto', label: 'Auto' },
  ...Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) })),
];

export class LayoutModal {
  /**
   * @param {import('./Toolbar').default} toolbar
   */
  constructor(toolbar) {
    this.toolbar = toolbar;
    this.editor = toolbar.editor;
    this._modal = null;
    this._bs = null;
    this._editMode = false;
    this._columns = [];
    this._build();
  }

  /* ───────────────────────────────────── public ── */

  /**
   * Open the modal.
   * @param {Object|null} existingAttrs – if set, enters edit mode.
   */
  open(existingAttrs = null) {
    this._editMode = !!existingAttrs;

    if (existingAttrs) {
      this._el('titleText').textContent = 'Edit Layout';
      this._el('insertBtn').innerHTML = '<i class="bi bi-check-lg me-1"></i>Update';
      this._el('deleteBtn').classList.remove('d-none');
      this._populate(existingAttrs);
    } else {
      this._el('titleText').textContent = 'Insert Layout';
      this._el('insertBtn').innerHTML = '<i class="bi bi-layout-split me-1"></i>Insert Layout';
      this._el('deleteBtn').classList.add('d-none');
      this._resetDefaults();
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

  _el(name) {
    return this._modal.querySelector(`[data-layoutm="${name}"]`);
  }

  _resetDefaults() {
    // Default: 2 columns, col-md-6 each
    this._columns = [
      { lg: 'auto', md: '6', sm: 'auto', xs: 'auto' },
      { lg: 'auto', md: '6', sm: 'auto', xs: 'auto' },
    ];
    this._el('gutter').value = '3';
    this._setJustify('start');
    this._setAlign('stretch');
    this._renderColumnsConfig();
  }

  _populate(attrs) {
    // Parse existing columns
    this._columns = [];
    if (attrs.columns && attrs.columns.length > 0) {
      attrs.columns.forEach((col) => {
        this._columns.push(this._parseColClass(col.colClass || 'col'));
      });
    } else {
      this._columns = [
        { lg: 'auto', md: '6', sm: 'auto', xs: 'auto' },
        { lg: 'auto', md: '6', sm: 'auto', xs: 'auto' },
      ];
    }

    this._el('gutter').value = String(attrs.gutter ?? 3);
    this._setJustify(attrs.justifyContent || 'start');
    this._setAlign(attrs.alignItems || 'stretch');
    this._renderColumnsConfig();
  }

  /**
   * Parse a colClass string like "col-md-6 col-lg-4" into breakpoint map.
   */
  _parseColClass(colClass) {
    const result = { lg: 'auto', md: 'auto', sm: 'auto', xs: 'auto' };
    const parts = colClass.split(/\s+/);

    parts.forEach((part) => {
      const m = part.match(/^col(?:-(sm|md|lg|xl|xxl))?(?:-(\d{1,2}))?$/);
      if (!m) return;

      const bp = m[1] || null;
      const size = m[2] || 'auto';

      if (!bp) {
        // "col" or "col-6" → affects xs
        result.xs = size === 'auto' ? 'auto' : size;
      } else if (bp === 'sm') {
        result.sm = size === 'auto' ? 'auto' : size;
      } else if (bp === 'md') {
        result.md = size === 'auto' ? 'auto' : size;
      } else if (bp === 'lg' || bp === 'xl' || bp === 'xxl') {
        result.lg = size === 'auto' ? 'auto' : size;
      }
    });

    return result;
  }

  /**
   * Build colClass from breakpoint map.
   */
  _buildColClass(col) {
    const parts = [];

    if (col.lg !== 'auto') parts.push(`col-lg-${col.lg}`);
    if (col.md !== 'auto') parts.push(`col-md-${col.md}`);
    if (col.sm !== 'auto') parts.push(`col-sm-${col.sm}`);

    if (col.xs !== 'auto') {
      parts.push(`col-${col.xs}`);
    } else if (parts.length === 0) {
      parts.push('col');
    }

    return parts.join(' ');
  }

  _renderColumnsConfig() {
    const container = this._el('columnsContainer');
    container.innerHTML = '';

    this._columns.forEach((col, index) => {
      const colEl = document.createElement('div');
      colEl.className = 'tiptap-layout-column-config';
      colEl.innerHTML = `
        <div class="d-flex align-items-center justify-content-between mb-2">
          <span class="badge bg-primary-subtle text-primary-emphasis rounded-pill">
            Column ${index + 1}
          </span>
          <button type="button" class="btn btn-sm btn-outline-danger rounded-circle p-0"
                  style="width:22px;height:22px;line-height:1;font-size:11px"
                  data-remove-col="${index}" title="Remove column"
                  ${this._columns.length <= 1 ? 'disabled' : ''}>
            <i class="bi bi-x"></i>
          </button>
        </div>
        <div class="row g-2">
          ${BREAKPOINTS.map((bp) => `
            <div class="col-3">
              <label class="form-label" style="font-size:10px;margin-bottom:2px">${bp.label}</label>
              <select class="form-select form-select-sm"
                      data-col-bp="${index}-${bp.key}" style="font-size:12px">
                ${COL_WIDTHS.map((w) => `<option value="${w.value}" ${col[bp.key] === w.value ? 'selected' : ''}>${w.label}</option>`).join('')}
              </select>
            </div>
          `).join('')}
        </div>
      `;
      container.appendChild(colEl);
    });

    // Update total indicator
    this._updateColumnTotal();
  }

  _updateColumnTotal() {
    const totalEl = this._el('colTotal');
    if (!totalEl) return;

    // Calculate approximate total for md breakpoint
    let total = 0;
    let allAuto = true;
    this._columns.forEach((col) => {
      const mdVal = col.md !== 'auto' ? parseInt(col.md, 10) : 0;
      if (col.md !== 'auto') {
        total += mdVal;
        allAuto = false;
      }
    });

    if (allAuto) {
      totalEl.textContent = `${this._columns.length} auto columns`;
      totalEl.className = 'badge bg-secondary-subtle text-secondary-emphasis';
    } else if (total === GRID_TOTAL) {
      totalEl.textContent = `Total: ${total}/12`;
      totalEl.className = 'badge bg-success-subtle text-success-emphasis';
    } else if (total > GRID_TOTAL) {
      totalEl.textContent = `Total: ${total}/12 (overflow!)`;
      totalEl.className = 'badge bg-danger-subtle text-danger-emphasis';
    } else {
      totalEl.textContent = `Total: ${total}/12`;
      totalEl.className = 'badge bg-warning-subtle text-warning-emphasis';
    }
  }

  _setJustify(value) {
    this._modal.querySelectorAll('[data-layout-justify]').forEach((el) => {
      el.classList.toggle('active', el.dataset.layoutJustify === value);
    });
  }

  _getJustify() {
    const active = this._modal.querySelector('[data-layout-justify].active');
    return active?.dataset.layoutJustify || 'start';
  }

  _setAlign(value) {
    this._modal.querySelectorAll('[data-layout-align]').forEach((el) => {
      el.classList.toggle('active', el.dataset.layoutAlign === value);
    });
  }

  _getAlign() {
    const active = this._modal.querySelector('[data-layout-align].active');
    return active?.dataset.layoutAlign || 'stretch';
  }

  _bindEvents() {
    // Gutter change
    this._el('gutter').addEventListener('input', () => this._updatePreview());

    // Justify buttons
    this._modal.querySelectorAll('[data-layout-justify]').forEach((el) => {
      el.addEventListener('click', () => {
        this._setJustify(el.dataset.layoutJustify);
        this._updatePreview();
      });
    });

    // Align buttons
    this._modal.querySelectorAll('[data-layout-align]').forEach((el) => {
      el.addEventListener('click', () => {
        this._setAlign(el.dataset.layoutAlign);
        this._updatePreview();
      });
    });

    // Preset buttons
    this._modal.querySelectorAll('[data-layout-preset]').forEach((el) => {
      el.addEventListener('click', () => {
        const presetKey = el.dataset.layoutPreset;
        const colClasses = LAYOUT_PRESETS[presetKey];
        if (!colClasses) return;

        this._columns = colClasses.map((cls) => this._parseColClass(cls));
        this._renderColumnsConfig();
        this._rebindColumnEvents();
        this._updatePreview();
      });
    });

    // Add column
    this._el('addColBtn').addEventListener('click', () => {
      if (this._columns.length >= 6) return; // max 6 columns
      this._columns.push({ lg: 'auto', md: 'auto', sm: 'auto', xs: 'auto' });
      this._renderColumnsConfig();
      this._rebindColumnEvents();
      this._updatePreview();
    });

    // Column events (delegated for dynamic content)
    this._el('columnsContainer').addEventListener('click', (e) => {
      const removeBtn = e.target.closest('[data-remove-col]');
      if (removeBtn && this._columns.length > 1) {
        const idx = parseInt(removeBtn.dataset.removeCol, 10);
        this._columns.splice(idx, 1);
        this._renderColumnsConfig();
        this._rebindColumnEvents();
        this._updatePreview();
      }
    });

    this._el('columnsContainer').addEventListener('change', (e) => {
      const sel = e.target.closest('[data-col-bp]');
      if (sel) {
        const [idx, bp] = sel.dataset.colBp.split('-');
        this._columns[parseInt(idx, 10)][bp] = sel.value;
        this._updateColumnTotal();
        this._updatePreview();
      }
    });

    // Insert / Update
    this._el('insertBtn').addEventListener('click', () => this._submit());

    // Delete
    this._el('deleteBtn').addEventListener('click', () => {
      if (this._editMode) {
        this.editor.chain().focus().deleteBootstrapRow().run();
      }
      this._bs.hide();
    });
  }

  _rebindColumnEvents() {
    // Events are delegated, no rebinding needed
  }

  _submit() {
    const columns = this._columns.map((col) => ({
      colClass: this._buildColClass(col),
    }));

    const gutter = parseInt(this._el('gutter').value, 10) || 3;
    const justify = this._getJustify();
    const align = this._getAlign();

    const config = {
      columns,
      gutter,
      justifyContent: justify === 'start' ? null : justify,
      alignItems: align === 'stretch' ? null : align,
    };

    if (this._editMode) {
      this.editor.chain().focus().updateBootstrapRow(config).run();
    } else {
      this.editor.chain().focus().insertBootstrapRowAdvanced(config).run();
    }

    this._bs.hide();
  }

  _updatePreview() {
    const preview = this._el('preview');
    if (!preview) return;

    const gutter = this._el('gutter').value || '3';
    const justify = this._getJustify();
    const align = this._getAlign();

    let rowClass = `row g-${gutter}`;
    if (justify !== 'start') rowClass += ` justify-content-${justify}`;
    if (align !== 'stretch') rowClass += ` align-items-${align}`;

    const colsHtml = this._columns.map((col, i) => {
      const cls = this._buildColClass(col);
      const mdVal = col.md !== 'auto' ? col.md : 'auto';
      const widthPercent = mdVal !== 'auto' ? (parseInt(mdVal, 10) / 12 * 100) : (100 / this._columns.length);

      return `<div style="flex:${mdVal === 'auto' ? '1' : `0 0 ${widthPercent}%`};
                          max-width:${mdVal === 'auto' ? '100%' : `${widthPercent}%`};
                          padding:0 ${parseInt(gutter, 10) * 2}px">
        <div class="tiptap-layout-preview-col"
             style="background:rgba(13,110,253,${0.08 + i * 0.04});
                    border:1px solid rgba(13,110,253,0.2);
                    border-radius:4px;padding:8px 6px;text-align:center;
                    font-size:11px;color:#555;min-height:${align === 'stretch' ? '50px' : 'auto'}">
          <div style="font-weight:600;margin-bottom:2px">${cls}</div>
          <div style="font-size:10px;color:#888">${mdVal === 'auto' ? 'auto' : `${mdVal}/12`}</div>
        </div>
      </div>`;
    }).join('');

    preview.innerHTML = `
      <div style="display:flex;flex-wrap:wrap;
                  ${justify === 'center' ? 'justify-content:center;' : ''}
                  ${justify === 'end' ? 'justify-content:flex-end;' : ''}
                  ${justify === 'between' ? 'justify-content:space-between;' : ''}
                  ${justify === 'around' ? 'justify-content:space-around;' : ''}
                  ${justify === 'evenly' ? 'justify-content:space-evenly;' : ''}
                  ${align === 'center' ? 'align-items:center;' : ''}
                  ${align === 'end' ? 'align-items:flex-end;' : ''}
                  ${align === 'start' ? 'align-items:flex-start;' : ''}
                  ${align === 'stretch' ? 'align-items:stretch;' : ''}
                  margin:-${parseInt(gutter, 10) * 2}px">
        ${colsHtml}
      </div>
      <div class="text-center mt-2" style="font-size:10px;color:#888">
        <code style="font-size:10px">${rowClass}</code>
      </div>
    `;
  }

  _escHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  _template() {
    // Preset buttons
    const presets = [
      { id: '1-col',  icon: '▰▰▰▰▰▰▰▰▰▰▰▰', label: '1 Col' },
      { id: '2-col',  icon: '▰▰▰▰▰▰ ▰▰▰▰▰▰', label: '2 Col' },
      { id: '3-col',  icon: '▰▰▰▰ ▰▰▰▰ ▰▰▰▰', label: '3 Col' },
      { id: '4-col',  icon: '▰▰▰ ▰▰▰ ▰▰▰ ▰▰▰', label: '4 Col' },
      { id: '1-2',    icon: '▰▰▰▰ ▰▰▰▰▰▰▰▰', label: '1/3 + 2/3' },
      { id: '2-1',    icon: '▰▰▰▰▰▰▰▰ ▰▰▰▰', label: '2/3 + 1/3' },
    ];

    const presetBtns = presets.map((p) =>
      `<button type="button" class="btn btn-sm btn-outline-primary rounded-pill px-2 py-0"
              data-layout-preset="${p.id}" title="${p.label}" style="font-size:11px;line-height:1.8">
        ${p.label}
      </button>`
    ).join('\n        ');

    // Justify buttons
    const justifyOpts = [
      { key: 'start',   icon: 'text-left',      label: 'Start' },
      { key: 'center',  icon: 'text-center',     label: 'Center' },
      { key: 'end',     icon: 'text-right',      label: 'End' },
      { key: 'between', icon: 'distribute-horizontal', label: 'Between' },
      { key: 'around',  icon: 'arrows',          label: 'Around' },
      { key: 'evenly',  icon: 'arrows-expand',   label: 'Evenly' },
    ];

    const justifyBtns = justifyOpts.map((j) =>
      `<button type="button" class="tiptap-layout-option-btn" data-layout-justify="${j.key}" title="${j.label}">
        <i class="bi bi-${j.icon}"></i>
        <span>${j.label}</span>
      </button>`
    ).join('\n          ');

    // Align buttons
    const alignOpts = [
      { key: 'start',   icon: 'align-top',      label: 'Top' },
      { key: 'center',  icon: 'align-middle',    label: 'Center' },
      { key: 'end',     icon: 'align-bottom',    label: 'Bottom' },
      { key: 'stretch', icon: 'arrows-expand',   label: 'Stretch' },
    ];

    const alignBtns = alignOpts.map((a) =>
      `<button type="button" class="tiptap-layout-option-btn" data-layout-align="${a.key}" title="${a.label}">
        <i class="bi bi-${a.icon}"></i>
        <span>${a.label}</span>
      </button>`
    ).join('\n          ');

    return `
<div class="modal fade tiptap-layout-modal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
  <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header py-2 px-3">
        <h6 class="modal-title fw-semibold">
          <i class="bi bi-layout-split me-2 text-primary"></i>
          <span data-layoutm="titleText">Insert Layout</span>
        </h6>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">

        <!-- Preview -->
        <div class="p-3 bg-light rounded mb-3" data-layoutm="preview" style="min-height:60px"></div>

        <!-- Presets -->
        <div class="mb-3">
          <label class="form-label small fw-medium">Quick Presets</label>
          <div class="d-flex flex-wrap gap-1">
            ${presetBtns}
          </div>
        </div>

        <!-- Columns Configuration -->
        <div class="mb-3">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <label class="form-label small fw-medium mb-0">
              Columns
              <span data-layoutm="colTotal" class="badge bg-secondary-subtle text-secondary-emphasis ms-2" style="font-size:10px">2 auto columns</span>
            </label>
            <button type="button" class="btn btn-sm btn-outline-primary rounded-pill px-2 py-0"
                    data-layoutm="addColBtn" style="font-size:11px">
              <i class="bi bi-plus me-1"></i>Add Column
            </button>
          </div>
          <div data-layoutm="columnsContainer" class="tiptap-layout-columns-container"></div>
        </div>

        <div class="row g-3">
          <!-- Gutter -->
          <div class="col-md-4">
            <label class="form-label small fw-medium">
              Gutter (Spacing)
              <span class="text-muted fw-normal ms-1" data-layoutm="gutterValue"></span>
            </label>
            <input type="range" class="form-range" min="0" max="5" step="1" value="3"
                   data-layoutm="gutter">
            <div class="d-flex justify-content-between" style="font-size:10px;color:#888;margin-top:-4px">
              <span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
            </div>
          </div>

          <!-- Horizontal Alignment -->
          <div class="col-md-4">
            <label class="form-label small fw-medium">Horizontal Align</label>
            <div class="d-flex flex-wrap gap-1">
              ${justifyBtns}
            </div>
          </div>

          <!-- Vertical Alignment -->
          <div class="col-md-4">
            <label class="form-label small fw-medium">Vertical Align</label>
            <div class="d-flex flex-wrap gap-1">
              ${alignBtns}
            </div>
          </div>
        </div>

      </div>
      <div class="modal-footer py-2 px-3">
        <button type="button" class="btn btn-sm btn-outline-danger rounded-pill px-3 d-none" data-layoutm="deleteBtn">
          <i class="bi bi-trash me-1"></i>Delete
        </button>
        <button type="button" class="btn btn-sm btn-secondary rounded-pill px-3" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-sm btn-primary rounded-pill px-3" data-layoutm="insertBtn">
          <i class="bi bi-layout-split me-1"></i>Insert Layout
        </button>
      </div>
    </div>
  </div>
</div>`;
  }
}
