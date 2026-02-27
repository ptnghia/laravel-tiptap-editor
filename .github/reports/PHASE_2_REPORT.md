# Phase 2 Report – Bootstrap Layout (Row / Column)

**Trạng thái:** ✅ Hoàn thành  
**Ngày:** 2025-07-16

---

## Mục tiêu

Cho phép user tạo layout chia cột Bootstrap 5 trong editor: insert row, chọn preset (2 cột, 3 cột, sidebar…), thêm/xoá cột, đổi kích thước cột.

---

## Những gì đã làm

### 1. BootstrapRow Extension

**File:** `resources/js/editor/extensions/BootstrapRow.js`

- Node type: `bootstrapRow`, group: `block`, content: `bootstrapCol+`
- Attribute: `gutter` (0-5 → Bootstrap `g-*` class)
- parseHTML: `<div class="row">`
- renderHTML: `<div data-type="bootstrap-row" class="row g-{gutter}">`
- 8 layout presets: 1-col, 2-col, 3-col, 4-col, 1-2, 2-1, 1-1-2, 2-1-1
- 6 commands:
  - `insertBootstrapRow(preset, gutter)` – chèn row với preset columns
  - `addColumnToRow(colClass)` – thêm cột vào row hiện tại
  - `removeColumn()` – xoá cột (không cho xoá cột cuối)
  - `setColumnClass(colClass)` – đổi class cột
  - `setRowGutter(gutter)` – đổi gutter
  - `deleteBootstrapRow()` – xoá toàn bộ row
- Keyboard shortcut: Backspace trên empty single-column → xoá cả row

### 2. BootstrapCol Extension

**File:** `resources/js/editor/extensions/BootstrapCol.js`

- Node type: `bootstrapCol`, content: `block+` (cho phép nest mọi block)
- Attribute: `colClass` – hỗ trợ đầy đủ responsive classes (col, col-sm-*, col-md-*, col-lg-*, col-xl-*, col-xxl-*)
- parseHTML: `<div>` with Bootstrap col-* classes
- renderHTML: `<div data-type="bootstrap-col" class="{colClass}">`
- `defining: true`, `isolating: true` – content stays within column boundary

### 3. Toolbar Layout Dropdown

- Nút "Insert Layout" với dropdown menu 8 presets
- Mỗi preset hiển thị: icon monospace (`[ 6 | 6 ]`), label (2 Columns)
- Dropdown accessible: `role="menu"`, `aria-haspopup`, `aria-expanded`
- Tự đóng khi click bên ngoài
- Thêm buttons: Add Column, Remove Column, Delete Row

### 4. Editor.js Integration

- Import BootstrapRow + BootstrapCol
- Config-driven: chỉ load khi `bootstrapRow` có trong extensions list
- BootstrapCol tự động load khi BootstrapRow enabled

### 5. CSS Layout Preview

- Row: dashed blue border, "Row" label (::before)
- Col: dashed border nhẹ, show colClass (::before), highlight on focus-within
- Dropdown menu: box-shadow, hover effects, preset icon monospace
- Empty column placeholder text

### 6. HtmlRenderer (PHP)

- `renderBootstrapRow()`: output `<div class="row g-{n}">`, gutter clamped 0-5
- `renderBootstrapCol()`: output `<div class="{colClass}">`, **sanitize class names** với regex whitelist
- Thêm `renderParagraph()` với textAlign support
- Thêm `renderOrderedList()` với start attribute
- Thêm `renderCodeBlock()` với language class

---

## Verification Results

| Check | Kết quả |
|-------|---------|
| `vendor/bin/phpunit` | ✅ 31 tests, 55 assertions |
| `npm run build` | ✅ 67 modules, 1.59s |
| IDE errors | ✅ 0 errors |

### New Tests (9 tests)

| Test | Mô tả |
|------|--------|
| renders_bootstrap_row_with_gutter | 2-col layout, correct gutter |
| renders_three_column_layout | 3 columns, class count |
| renders_default_gutter_when_missing | Fallback gutter=3 |
| clamps_gutter_to_valid_range | gutter=99 → g-5 |
| sanitizes_invalid_column_classes | XSS protection |
| renders_default_col_when_class_empty | Empty → "col" |
| renders_responsive_column_classes | col-sm/md/lg combo |
| renders_sidebar_layout | Exact HTML output match |
| renders_nested_content_in_columns | h3 + bold text in col |

### Build Output

```
dist/css/tiptap-editor.css     6.88 kB │ gzip:   1.74 kB
dist/js/tiptap-editor.es.js  586.48 kB │ gzip: 158.18 kB
dist/js/tiptap-editor.umd.js 383.25 kB │ gzip: 119.94 kB
```

---

## Checklist Phase 2

- [x] BootstrapRow.js – Node extension
- [x] BootstrapCol.js – Node extension
- [x] 8 layout presets (1-col to 2-1-1)
- [x] 6 editor commands (insert, add/remove col, resize, gutter, delete)
- [x] Toolbar layout dropdown with visual presets
- [x] CSS preview (dashed borders, labels, focus highlight)
- [x] HtmlRenderer – Row/Col rendering with sanitization
- [x] Backspace keyboard shortcut for empty rows
- [x] Column class sanitization (regex whitelist)
- [x] 9 new unit tests
- [x] Vite build successful

---

## Ghi chú cho Phase 3

- **Phase 3 (Bootstrap Components)**: Alert, Card, Button extensions
- Alert: dropdown chọn type (info, warning, danger…)
- Card: structure với header/body/footer
- Button: inline node với variant, size, URL
- Sẽ dùng pattern tương tự dropdown toolbar cho component insert
