/**
 * TableModal – Bootstrap 5 Modal for configuring table insertion.
 *
 * Features:
 *  - Rows & columns input with visual grid preview
 *  - Header row toggle
 *  - Table style options: bordered, striped, hover, small
 *  - Visual grid selector for quick row/col picking
 */
export class TableModal {
  /**
   * @param {import('./Toolbar').default} toolbar
   */
  constructor(toolbar) {
    this.toolbar = toolbar;
    this.editor = toolbar.editor;
    this._modal = null;
    this._bs = null;
    this._gridRows = 3;
    this._gridCols = 3;
    this._isEditMode = false;
    this._build();
  }

  /* ───────────────────────────────────── public ── */

  /**
   * Open the table modal.
   * @param {Object|null} existingStyles - If provided, opens in edit mode with { bordered, striped, hover, small }
   */
  open(existingStyles = null) {
    this._isEditMode = !!existingStyles;
    if (this._isEditMode) {
      this._loadEditValues(existingStyles);
    } else {
      this._reset();
    }
    this._updateModalUI();
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
    this._renderGrid();
  }

  _reset() {
    this._gridRows = 3;
    this._gridCols = 3;
    this._el('rows').value = '3';
    this._el('cols').value = '3';
    this._el('headerRow').checked = true;
    this._el('bordered').checked = false;
    this._el('striped').checked = false;
    this._el('hover').checked = false;
    this._el('small').checked = false;
    this._el('alignMiddle').checked = false;
    this._renderGrid();
    this._updateGridLabel();
  }

  _el(name) {
    return this._modal.querySelector(`[data-tbl="${name}"]`);
  }

  _bindEvents() {
    // Insert button
    this._modal.querySelector('[data-tbl="insertBtn"]').addEventListener('click', () => {
      this._insert();
    });

    // Grid selector hover/click
    const grid = this._el('grid');
    grid.addEventListener('mouseover', (e) => {
      const cell = e.target.closest('[data-r]');
      if (!cell) return;
      const r = parseInt(cell.dataset.r);
      const c = parseInt(cell.dataset.c);
      this._highlightGrid(r, c);
      this._updateGridLabel(r, c);
    });

    grid.addEventListener('mouseleave', () => {
      this._highlightGrid(0, 0);
      this._updateGridLabel();
    });

    grid.addEventListener('click', (e) => {
      const cell = e.target.closest('[data-r]');
      if (!cell) return;
      this._gridRows = parseInt(cell.dataset.r);
      this._gridCols = parseInt(cell.dataset.c);
      this._el('rows').value = this._gridRows;
      this._el('cols').value = this._gridCols;
      this._updateGridLabel();
    });

    // Number inputs sync
    this._el('rows').addEventListener('input', (e) => {
      this._gridRows = Math.min(20, Math.max(1, parseInt(e.target.value) || 1));
    });
    this._el('cols').addEventListener('input', (e) => {
      this._gridCols = Math.min(10, Math.max(1, parseInt(e.target.value) || 1));
    });
  }

  _insert() {
    if (this._isEditMode) {
      // Update existing table styles
      const styles = {
        bordered: this._el('bordered').checked,
        striped: this._el('striped').checked,
        hover: this._el('hover').checked,
        small: this._el('small').checked,
        alignMiddle: this._el('alignMiddle').checked,
      };
      this.editor.chain().focus().updateTableStyles(styles).run();
    } else {
      // Insert new table
      const rows = Math.min(20, Math.max(1, parseInt(this._el('rows').value) || 3));
      const cols = Math.min(10, Math.max(1, parseInt(this._el('cols').value) || 3));
      const withHeaderRow = this._el('headerRow').checked;
      const styles = {
        bordered: this._el('bordered').checked,
        striped: this._el('striped').checked,
        hover: this._el('hover').checked,
        small: this._el('small').checked,
        alignMiddle: this._el('alignMiddle').checked,
      };

      this.editor.chain().focus().insertTable({ rows, cols, withHeaderRow }).run();

      // Apply styles after insertion (cursor is now inside the table)
      this.editor.chain().focus().updateTableStyles(styles).run();
    }
    this._bs.hide();
  }

  _loadEditValues(styles) {
    this._el('bordered').checked = !!styles.bordered;
    this._el('striped').checked = !!styles.striped;
    this._el('hover').checked = !!styles.hover;
    this._el('small').checked = !!styles.small;
    this._el('alignMiddle').checked = !!styles.alignMiddle;
  }

  _updateModalUI() {
    const title = this._modal.querySelector('.modal-title');
    const submitBtn = this._modal.querySelector('[data-tbl="insertBtn"]');
    const gridSection = this._el('grid').closest('.text-center');
    const rowsCol = this._el('rows').closest('.col-6');
    const colsCol = this._el('cols').closest('.col-6');
    const headerCheck = this._el('headerRow').closest('.form-check');

    if (this._isEditMode) {
      title.innerHTML = '<i class="bi bi-table me-2 text-primary"></i>Edit Table Styles';
      submitBtn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Update Styles';
      // Hide grid, rows/cols, and header row in edit mode
      if (gridSection) gridSection.style.display = 'none';
      if (rowsCol) rowsCol.style.display = 'none';
      if (colsCol) colsCol.style.display = 'none';
      if (headerCheck) headerCheck.style.display = 'none';
    } else {
      title.innerHTML = '<i class="bi bi-table me-2 text-primary"></i>Insert Table';
      submitBtn.innerHTML = '<i class="bi bi-table me-1"></i>Insert Table';
      if (gridSection) gridSection.style.display = '';
      if (rowsCol) rowsCol.style.display = '';
      if (colsCol) colsCol.style.display = '';
      if (headerCheck) headerCheck.style.display = '';
    }
  }

  _renderGrid() {
    const grid = this._el('grid');
    grid.innerHTML = '';
    const maxR = 8, maxC = 8;
    for (let r = 1; r <= maxR; r++) {
      const row = document.createElement('div');
      row.className = 'tiptap-table-grid-row';
      for (let c = 1; c <= maxC; c++) {
        const cell = document.createElement('div');
        cell.className = 'tiptap-table-grid-cell';
        cell.dataset.r = r;
        cell.dataset.c = c;
        row.appendChild(cell);
      }
      grid.appendChild(row);
    }
  }

  _highlightGrid(r, c) {
    this._el('grid').querySelectorAll('.tiptap-table-grid-cell').forEach(cell => {
      const cr = parseInt(cell.dataset.r);
      const cc = parseInt(cell.dataset.c);
      cell.classList.toggle('highlighted', cr <= r && cc <= c);
    });
  }

  _updateGridLabel(r, c) {
    const label = this._el('gridLabel');
    if (r && c) {
      label.textContent = `${r} × ${c}`;
    } else {
      label.textContent = `${this._gridRows} × ${this._gridCols}`;
    }
  }

  _template() {
    return `
<div class="modal fade tiptap-table-modal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header py-2 px-3">
        <h6 class="modal-title fw-semibold">
          <i class="bi bi-table me-2 text-primary"></i>Insert Table
        </h6>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">

        <!-- Grid Selector -->
        <div class="text-center mb-3">
          <div class="tiptap-table-grid" data-tbl="grid"></div>
          <small class="text-muted mt-1 d-block" data-tbl="gridLabel">3 × 3</small>
        </div>

        <div class="row g-3">
          <!-- Rows -->
          <div class="col-6">
            <label class="form-label small fw-medium">Rows</label>
            <input type="number" class="form-control form-control-sm" data-tbl="rows"
                   value="3" min="1" max="20">
          </div>
          <!-- Columns -->
          <div class="col-6">
            <label class="form-label small fw-medium">Columns</label>
            <input type="number" class="form-control form-control-sm" data-tbl="cols"
                   value="3" min="1" max="10">
          </div>
        </div>

        <!-- Options -->
        <div class="mt-3">
          <label class="form-label small fw-medium">Options</label>
          <div class="d-flex flex-wrap gap-3">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" data-tbl="headerRow" id="tbl-header" checked>
              <label class="form-check-label small" for="tbl-header">Header row</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" data-tbl="bordered" id="tbl-bordered">
              <label class="form-check-label small" for="tbl-bordered">Bordered</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" data-tbl="striped" id="tbl-striped">
              <label class="form-check-label small" for="tbl-striped">Striped</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" data-tbl="hover" id="tbl-hover">
              <label class="form-check-label small" for="tbl-hover">Hover</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" data-tbl="small" id="tbl-small">
              <label class="form-check-label small" for="tbl-small">Small</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" data-tbl="alignMiddle" id="tbl-alignMiddle">
              <label class="form-check-label small" for="tbl-alignMiddle">Align Middle</label>
            </div>
          </div>
        </div>

      </div>
      <div class="modal-footer py-2 px-3">
        <button type="button" class="btn btn-sm btn-secondary rounded-pill px-3" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-sm btn-primary rounded-pill px-3" data-tbl="insertBtn">
          <i class="bi bi-table me-1"></i>Insert Table
        </button>
      </div>
    </div>
  </div>
</div>`;
  }
}
