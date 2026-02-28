# V2 Insert Tools — Analysis & Implementation Plan

> **Package**: `ptnghia/laravel-tiptap-editor`  
> **Current Version**: v1.0.0 (202 tests, 422 assertions)  
> **Goal**: Replace all `prompt()` dialogs and limited insert flows with full-featured Bootstrap 5 modals, matching the quality of `ImageModal.js` built in V1.1.

---

## 1. Current State Audit

### 1.1 Summary Table

| Tool | Current UX | Missing Features |
|------|-----------|-----------------|
| **Link** | Single `prompt('Enter URL')` | Type selector, `_blank`, nofollow/sponsored/ugc, title, anchor/mailto/tel |
| **Video** | Single `prompt('Enter video URL')` | Upload tab, aspect-ratio picker, custom width/height, caption, title |
| **Table** | Hard-coded `{rows:3, cols:3, withHeaderRow:true}` | Row/col count UI, Bootstrap table variants, `<caption>`, responsive wrapper |
| **Row/Col** | Preset dropdown (2-col, 3-col, etc.) | Per-column breakpoint config (sm/md/lg/xl), gutter selector, equal-height |
| **Gallery** | File-picker only, auto-column (auto = `images >= 4 ? 4 : …`) | Column config, gap, lightbox toggle, order management, per-image alt/caption |
| **Button** | Two `prompt()` calls (text + URL) | Variant picker, size, outline toggle, target, icon prefix |
| **Card** | One `prompt()` (header text) | Footer text, body class, header/footer toggle, border variant |

### 1.2 Link — Detailed Gap Analysis

**Existing code (`Toolbar.js` line 644):**
```js
const url = prompt('Enter URL:');
this.editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
```

**Current Tiptap link attrs**: only `href` is used. The `@tiptap/extension-link` supports `rel`, `target`, `class` natively.

**Missing**:
- Link type: `url` | `anchor` (same-page `#id`) | `mailto:` | `tel:`
- `target="_blank"` checkbox
- `rel` options: `nofollow`, `ugc`, `sponsored` (multi-select)
- `title` attribute
- Edit mode: when cursor is inside existing link, pre-populate fields
- Unlink button inside modal (instead of needing to click toolbar again)

---

### 1.3 Video — Detailed Gap Analysis

**Existing attrs** (`CustomVideo.js`): `provider`, `videoId`, `url`, `title`, `width` (560), `height` (315)

**Missing**:
- `width`/`height` are stored but never exposed in any UI
- No aspect-ratio picker (currently always `ratio-16x9`)
- No `caption` attr
- No `poster` attr (thumbnail for MP4)
- No upload tab (only remote URL, no file upload to server)
- `dblclick` edit uses `prompt()` — inconsistent with Image
- No alignment support (currently always full-width)

---

### 1.4 Table — Detailed Gap Analysis

**Existing code**:
```js
table: { command: 'insertTable', commandArgs: { rows: 3, cols: 3, withHeaderRow: true } }
```

The Tiptap `@tiptap/extension-table` `insertTable` command accepts `rows`, `cols`, `withHeaderRow`.

**Missing**:
- Row/col count UI (sliders or number inputs)
- `withHeaderRow` checkbox
- Bootstrap table class variants: `table-striped`, `table-bordered`, `table-hover`, `table-sm`, `table-dark`
- `<caption>` text input
- Responsive wrapper: `<div class="table-responsive">` checkbox
- First-column header (`<th scope="row">`) option
- Border variant: `table-bordered` vs `table-borderless`

---

### 1.5 Bootstrap Row/Col — Detailed Gap Analysis

**Existing UX**: Preset dropdown with fixed presets (`2-col: col-md-6 col-md-6`, etc.).

**`LAYOUT_PRESETS` in `BootstrapRow.js`**:
```
'1-col', '2-col', '3-col', '4-col', '1-2', '2-1', '1-1-2', '2-1-1'
```

**`BootstrapRow` attrs**: only `gutter` (default 3).  
**`BootstrapCol` attrs**: only `colClass` (string like `col-md-6`).

**Missing**:
- Custom breakpoint configuration per column — currently all use `col-md-*`, cannot set `col-sm-*`, `col-lg-*`, etc.
- Gutter picker: `g-0` through `g-5`; currently hard-coded to default 3 with no UI
- Vertical alignment: `align-items-start/center/end` on row
- Row justify: `justify-content-start/center/end/between/around`
- Equal-height toggle: adds `h-100` to inner cards/divs
- Column offset support: `offset-md-*`
- Column-count config at insert time (currently must pick preset)

---

### 1.6 Gallery — Detailed Gap Analysis

**Existing attrs** (`Gallery.js`): `columns` (2|3|4|6), `gap` (0–5), `lightbox` (bool).  
**`GalleryImage` attrs**: `src`, `alt`, `colClass`.

`_handleGallery()` in Toolbar.js: opens hidden file input, uploads, auto-picks columns based on image count (`images >= 4 ? 4 : images >= 3 ? 3 : 2`), then inserts.

**Missing**:
- Column count choice at insert time (user picks 2/3/4/6)
- Gap picker before insert
- Lightbox toggle before insert
- Per-image: alt text, caption, link URL
- Image order drag-and-drop before insert
- URL tab: add images by URL (no upload)
- Edit mode: double-click to open reconfigure modal for an existing gallery

---

## 2. V2 Architecture Decisions

### 2.1 Modal Pattern (established in V1.1)

All modals follow the `ImageModal.js` pattern:
- Single class per modal: `LinkModal`, `VideoModal`, `TableModal`, `RowColModal`, `GalleryModal`, `ButtonModal`, `CardModal`
- Located in `resources/js/editor/`
- Constructor takes `toolbar` reference (for access to `editor` and `_uploadFile()`)
- `open(existingAttrs?)` — creates/shows Bootstrap 5 modal, pre-populates if editing
- `destroy()` — called from `Toolbar.destroy()`
- Toolbar holds `this.xxxModal = new XxxModal(this)` and calls `this.xxxModal.open()`

### 2.2 Backend Changes Required

| Modal | PHP Changes |
|-------|------------|
| Link | `NodeRegistry` whitelist `rel`, `target`, `title` on `link` mark; `JsonSanitizer` validate rel whitelist |
| Video | `NodeRegistry` add `caption`, `poster`, `aspectRatio`, `alignment`; `HtmlRenderer::renderCustomVideo()` update; `renders/video.blade.php` update |
| Table | `NodeRegistry` add `caption`, `tableClass`, `responsive`; `HtmlRenderer::renderTable()` wraps in `.table-responsive`; new `renders/table.blade.php` |
| Row/Col | `NodeRegistry` update `bootstrapRow` attrs: `gutter`, `align`, `justify`; `bootstrapCol` attrs: `colClass` (already exists) |
| Gallery | `NodeRegistry` update `galleryImage` add `caption`, `linkUrl`; `HtmlRenderer::renderGallery()` update; `renders/gallery.blade.php` update |

---

## 3. Per-Modal Specification

### 3.1 LinkModal

**File**: `resources/js/editor/LinkModal.js`

**Tabs**: `URL` | `Anchor` | `Email` | `Phone`

**Fields**:

| Field | Type | Options |
|-------|------|---------|
| Link type | Radio/Pills | URL, Anchor (`#`), Email (`mailto:`), Phone (`tel:`) |
| URL / href | Text input | — |
| Text label | Text input | (read-only if selection exists, shows selected text) |
| Title | Text input | — |
| Open in new tab | Checkbox | adds `target="_blank"` + `rel="noopener"` |
| rel | Multi-checkbox | `nofollow`, `ugc`, `sponsored` |
| CSS class | Text input | — |

**Edit mode**: When `editor.isActive('link')`, open modal pre-populated with existing `href`, `rel`, `target`, `title`.  
**Unlink button**: visible in edit mode.

**Toolbar.js change**:
```js
_handleLink() {
  if (this.editor.isActive('link')) {
    // Edit mode — open pre-populated modal
    this.linkModal.open(this.editor.getAttributes('link'));
  } else {
    this.linkModal.open();
  }
}
```

---

### 3.2 VideoModal

**File**: `resources/js/editor/VideoModal.js`

**Tabs**: `URL` | `Upload`

**Fields**:

| Field | Type | Notes |
|-------|------|-------|
| Provider URL | URL input | Auto-detects YouTube / Vimeo / MP4 on blur |
| Upload | File input + drag-drop | Accepts `.mp4`, `.webm` |
| Title / alt | Text | |
| Caption | Text | Optional below-video caption |
| Poster image | URL input | Thumbnail for MP4 only |
| Aspect ratio | Radio | 16:9, 4:3, 1:1, 9:16 (vertical) |
| Alignment | Radio | Left, Center, Right, None |
| Width % | Radio | 25%, 50%, 75%, 100% (auto) |
| Custom width | px input | Free text |

**New `CustomVideo.js` attrs to add**: `caption`, `poster`, `aspectRatio`, `alignment`, `widthStyle`

**Existing `dblclick` handler** in `CustomVideo.js` NodeView: replace `prompt()` with `editor._tiptapToolbar.videoModal.open(node.attrs)`.

**HTML output change** (`renders/video.blade.php`):
```blade
<figure class="tiptap-video {{ $alignClass }} {{ $extraClass }}" style="{{ $widthStyle ? 'width:'.$widthStyle : '' }}">
    <div class="ratio ratio-{{ $ratioClass }}">
        {{-- iframe or video --}}
    </div>
    @if($caption)
        <figcaption>{{ $caption }}</figcaption>
    @endif
</figure>
```

---

### 3.3 TableModal

**File**: `resources/js/editor/TableModal.js`

**Fields**:

| Field | Type | Default |
|-------|------|---------|
| Rows | Number input (1–20) | 3 |
| Columns | Number input (1–10) | 3 |
| Header row | Checkbox | ✓ |
| First column header | Checkbox | ✗ |
| Caption | Text input | — |
| Striped | Checkbox | ✗ |
| Bordered | Checkbox | ✗ |
| Borderless | Checkbox | ✗ |
| Hover | Checkbox | ✗ |
| Small (table-sm) | Checkbox | ✗ |
| Dark | Checkbox | ✗ |
| Responsive wrapper | Checkbox | ✓ |

**Live preview**: Small visual grid showing rows × cols with header highlight.

**Backend changes needed**:

`HtmlRenderer.php` — wrap `<table>` output with Bootstrap classes and optional `.table-responsive`:
```php
$tableClass = 'table ' . implode(' ', $variants);
$html = "<table class=\"{$tableClass}\">";
if ($responsive) {
    $html = '<div class="table-responsive">' . $html . '</div>';
}
```

Because Tiptap's `insertTable` does not preserve custom `tableClass` in the JSON schema, a new `TableWrapper` node or a custom `Table` extension wrapping the default one is needed for persistent styling.

**Option A (simpler)**: Add a `customTable` wrapper node that stores class/caption/responsive and nests the Tiptap `table` node.

**Option B**: Override the default `Table` extension to add custom attrs.

> **Recommendation**: Option B — extend `Table` extension with additional attrs: `tableClass`, `caption`, `responsive`. Lower overhead than a new wrapper node.

---

### 3.4 RowColModal

**File**: `resources/js/editor/RowColModal.js`

**UX**: A visual column builder where user drags column widths or picks breakpoint classes per column.

**Step 1 — Structure**:

| Field | Type | Notes |
|-------|------|-------|
| Number of columns | Number input (1–6) | Generates N column config rows |
| Gutter | Select (g-0 to g-5) | Default g-3 |
| Vertical align | Select | Top, Middle, Bottom |
| Justify | Select | Start, Center, End, Between, Around, Evenly |

**Step 2 — Per-column config** (shown as a table with N rows, one per column):

| # | xs (col-) | sm (col-sm-) | md (col-md-) | lg (col-lg-) | xl (col-xl-) | Offset md |
|---|-----------|-------------|-------------|-------------|-------------|-----------|
| 1 | auto | – | 6 | 4 | – | – |
| 2 | auto | – | 6 | 4 | – | – |

Each cell is a select: `auto`, `1`–`12`, `–` (not set).

**Output colClass** example: `col col-md-6 col-lg-4`

**`BootstrapRow` changes**:
- Add attrs: `align` (`align-items-*`), `justify` (`justify-content-*`)

**`BootstrapCol` changes**:
- `colClass` already stores the full class string — no schema change needed, just better UI to generate it.

**Backend** (`NodeRegistry`, `JsonSanitizer`): allow `align` and `justify` on `bootstrapRow`.

---

### 3.5 GalleryModal

**File**: `resources/js/editor/GalleryModal.js`

**Tabs**: `Upload` | `URLs`

**Gallery Settings panel** (always visible):

| Field | Type | Default |
|-------|------|---------|
| Columns | Radio (2, 3, 4, 6) | 3 |
| Gap | Range (0–5) | 2 |
| Lightbox | Checkbox | ✗ |
| Responsive breakpoint | Select (xs/sm/md/lg) | default (xs) |

**Image list** (below settings):
- Drag-and-drop sortable list of image previews
- Per-image: alt text input, caption input, link URL input
- Remove button per image
- Add more button (opens file picker)

**URL tab**: text area or multi-line input; one URL per line; all added to the list.

**Edit mode**: Double-click existing gallery node → re-open modal with current images and settings pre-loaded.

**`GalleryImage` new attrs**: `caption`, `linkUrl`

**Backend** (`renders/gallery.blade.php`):
```blade
<div class="col-{{ $colSize }} tiptap-gallery__item">
  @if($linkUrl)
    <a href="{{ $linkUrl }}" @if($lightbox) data-bs-toggle="lightbox" @endif>
  @endif
  <img src="{{ $src }}" alt="{{ $alt }}" class="img-fluid rounded" loading="lazy">
  @if($linkUrl) </a> @endif
  @if($caption) <p class="small text-center mt-1">{{ $caption }}</p> @endif
</div>
```

---

### 3.6 ButtonModal (Bonus)

**File**: `resources/js/editor/ButtonModal.js`

**Fields**:

| Field | Notes |
|-------|-------|
| Button text | |
| URL | |
| Variant | Dropdown: `primary`, `secondary`, `success`, `danger`, `warning`, `info`, `light`, `dark` |
| Size | `btn-sm`, default, `btn-lg` |
| Outline | Checkbox — uses `btn-outline-*` |
| Target | `_self`, `_blank` |
| Full width | Checkbox — adds `w-100` |
| Icon | Bootstrap icon name prefix (optional) |

---

### 3.7 CardModal (Bonus)

**File**: `resources/js/editor/CardModal.js`

**Fields**:

| Field | Notes |
|-------|-------|
| Header text | (empty = no header) |
| Footer text | (empty = no footer) |
| Border variant | Dropdown: default, `border-primary`, `border-success`, etc. |
| Text color | `text-*` or inherit |
| Background | `bg-body`, `bg-light`, `bg-dark`, etc. |

---

## 4. Implementation Phases

### Phase 1 — Link & Video (High Priority)
These are the most-used tools with the worst UX (`prompt()`).

| Task | Effort | Files Changed |
|------|--------|--------------|
| Create `LinkModal.js` | M | `LinkModal.js` (new), `Toolbar.js` |
| Update Link extension attrs | S | `NodeRegistry.php`, `JsonSanitizer.php` |
| Create `VideoModal.js` | L | `VideoModal.js` (new), `Toolbar.js` |
| Update `CustomVideo.js` — new attrs + dblclick | M | `CustomVideo.js` |
| Update `HtmlRenderer::renderCustomVideo()` | M | `HtmlRenderer.php` |
| Update `renders/video.blade.php` | S | `video.blade.php` |
| Update `NodeRegistry` / `JsonSanitizer` for video | S | `NodeRegistry.php`, `JsonSanitizer.php` |

### Phase 2 — Table & Gallery (Medium Priority)

| Task | Effort | Files Changed |
|------|--------|--------------|
| Extend Table extension | M | New `extensions/CustomTable.js`, `Toolbar.js` |
| Create `TableModal.js` | M | `TableModal.js` (new) |
| Update table rendering backend | M | `HtmlRenderer.php`, `NodeRegistry.php` |
| Create `renders/table.blade.php` | S | `table.blade.php` (new) |
| Create `GalleryModal.js` | L | `GalleryModal.js` (new), `Toolbar.js` |
| Update `Gallery.js` / `GalleryImage.js` | M | `Gallery.js` |
| Update gallery rendering backend | M | `HtmlRenderer.php`, `renders/gallery.blade.php` |

### Phase 3 — Row/Col & Bonus Tools (Low Priority / Polish)

| Task | Effort | Files Changed |
|------|--------|--------------|
| Create `RowColModal.js` | L | `RowColModal.js` (new), `Toolbar.js` |
| Update `BootstrapRow.js` attrs | S | `BootstrapRow.js` |
| Update `HtmlRenderer::renderBootstrapRow()` | S | `HtmlRenderer.php` |
| Create `ButtonModal.js` | M | `ButtonModal.js` (new), `Toolbar.js` |
| Create `CardModal.js` | M | `CardModal.js` (new), `Toolbar.js` |

### Effort Scale: S = 1–2h, M = 2–4h, L = 4–8h

---

## 5. File Checklist

### New JS files to create
- [ ] `resources/js/editor/LinkModal.js`
- [ ] `resources/js/editor/VideoModal.js`
- [ ] `resources/js/editor/TableModal.js`
- [ ] `resources/js/editor/RowColModal.js`
- [ ] `resources/js/editor/GalleryModal.js`
- [ ] `resources/js/editor/ButtonModal.js` (bonus)
- [ ] `resources/js/editor/CardModal.js` (bonus)

### JS files to modify
- [ ] `resources/js/editor/Toolbar.js` — import + instantiate each modal, replace handlers
- [ ] `resources/js/editor/extensions/CustomVideo.js` — add attrs, replace dblclick
- [ ] `resources/js/editor/extensions/Gallery.js` — add `GalleryImage` caption/linkUrl attrs
- [ ] `resources/js/editor/extensions/BootstrapRow.js` — add align/justify attrs
- [ ] `resources/js/editor/extensions/CustomTable.js` — new or extend existing Table (Phase 2)
- [ ] `resources/css/editor.css` — add any new modal/UI styles

### PHP files to modify
- [ ] `src/Services/HtmlRenderer.php` — update renderCustomVideo, renderGallery, renderBootstrapRow; add Table rendering
- [ ] `src/Support/NodeRegistry.php` — whitelist new attrs for each node
- [ ] `src/Services/JsonSanitizer.php` — validate/sanitize new attrs

### Blade files to modify / create
- [ ] `resources/views/renders/video.blade.php` — caption, aspect ratio, alignment, width
- [ ] `resources/views/renders/gallery.blade.php` — per-image caption, lightbox
- [ ] `resources/views/renders/table.blade.php` — new file for custom table rendering
- [ ] (Optional) `resources/views/renders/bootstrap-row.blade.php` — align/justify classes

---

## 6. Testing Strategy

Each phase should update/add test coverage:

| Test File | Coverage |
|-----------|----------|
| `tests/Unit/HtmlRendererTest.php` | New render methods per node |
| `tests/Unit/JsonSanitizerTest.php` | New attr validation |
| `tests/Unit/ContentValidatorTest.php` | Valid JSON schema with new attrs |
| `tests/Feature/EditorComponentTest.php` | Blade component renders new attrs |

Target: maintain ≥ 202 tests, add ≥ 30 new assertions per phase.

---

## 7. Backward Compatibility

- All new attrs have **default values** matching current behavior — existing saved JSON will render identically.
- `widthStyle: null`, `aspectRatio: '16x9'`, `responsive: true`, `tableClass: 'table'`, `lightbox: false` are all safe defaults.
- No migration needed — JSON schema is additive.

---

*Last updated: V1.1 (ImageModal complete). V2 planning phase.*
