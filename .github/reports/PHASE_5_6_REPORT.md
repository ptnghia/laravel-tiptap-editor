# Phase 5 & 6 Report – HTML Rendering Layer & Content Safety

**Trạng thái:** ✅ Hoàn thành  
**Ngày:** 2025-07-18

---

## Phase 5 – HTML Rendering Layer

### Mục tiêu

Tạo hệ thống render JSON → HTML hoàn chỉnh: Blade partial templates cho mỗi node type, `HasTiptapContent` trait cho Eloquent models, mở rộng `HtmlRenderer` hỗ trợ table và các node còn thiếu.

---

### Những gì đã làm

#### 1. Blade Render Templates (14 files)

**Thư mục:** `resources/views/renders/`

| File | Mô tả |
|------|--------|
| `paragraph.blade.php` | `<p>` với textAlign support |
| `heading.blade.php` | `<h1>`–`<h6>`, textAlign, optional `id` attribute |
| `image.blade.php` | `<figure>/<img>/<figcaption>`, alignment classes, lazy loading, escaped alt |
| `video.blade.php` | `<video>` cho MP4, `<iframe>` cho YouTube/Vimeo (config-based providers) |
| `bootstrap-row.blade.php` | `<div class="row">` với gutter class |
| `bootstrap-col.blade.php` | `<div class="col-*">` với sanitized colClass (chỉ chấp nhận `col-*` pattern) |
| `alert.blade.php` | `<div class="alert alert-{type}">`, 8 contextual types, `role="alert"` |
| `card.blade.php` | `<div class="card">` với optional header/footer, borderColor |
| `button.blade.php` | `<a class="btn btn-{variant}">` với outline, size, target, escaped URL |
| `table.blade.php` | `<table class="table">` wrapper |
| `list.blade.php` | `<ol>` hoặc `<ul>` với optional `start` attribute |
| `blockquote.blade.php` | `<blockquote class="blockquote">` |
| `code-block.blade.php` | `<pre><code class="language-{lang}">` |
| `horizontal-rule.blade.php` | `<hr>` |

Tất cả templates:
- Escape XSS qua `e()` helper
- Sử dụng `$content` variable cho rendered children
- Hỗ trợ `$attrs` array cho node attributes
- Semantic HTML, Bootstrap 5 classes

#### 2. HasTiptapContent Trait

**File:** `src/Traits/HasTiptapContent.php`

Trait dùng cho Eloquent models chứa Tiptap JSON content:

| Method | Mô tả |
|--------|--------|
| `bootHasTiptapContent()` | Static boot: tự động clear cache khi model save |
| `getTiptapContentColumn()` | Column name (default: `content_json`, override via `$tiptapContentColumn`) |
| `getTiptapHtmlColumn()` | Optional HTML cache column (override via `$tiptapHtmlColumn`) |
| `getTiptapContent(): array` | Lấy JSON content dạng array (hỗ trợ string hoặc array input) |
| `setTiptapContent(array\|string $content)` | Set content (auto-encode nếu array) |
| `renderContent(): string` | Render với cache (Cache store hoặc DB column), auto-cache |
| `renderContentFresh(): string` | Render không cache, luôn generate HTML mới |
| `getExcerpt(int $maxLength = 160): string` | Strip tags, cắt word-boundary, thêm ellipsis |
| `getPlainTextContent(): string` | HTML → plain text |
| `getHeadings(): array` | Extract `[{level, text}]` cho TOC generation |
| `hasContent(): bool` | Kiểm tra có meaningful content (loại bỏ empty paragraphs) |
| `saveRenderedHtml(): void` | Persist rendered HTML vào DB column |
| `clearRenderedContentCache(): void` | Invalidate cache store + HTML column |
| `getContentCacheKey(): string` | Key: `tiptap_rendered_{class}_{id}_{contentHash}` |

**Caching strategy:**
1. DB column cache (`tiptap_html_column`) – nhanh nhất, query trực tiếp
2. Cache store (Laravel Cache) – fallback khi không có DB column
3. Fresh render – luôn generate lại

#### 3. HtmlRenderer Enhancements

**File:** `src/Services/HtmlRenderer.php`

Bổ sung vào `renderDefaultNode()`:

| Node Type | Render Output |
|-----------|---------------|
| `table` | `<table class="table">` |
| `tableRow` | `<tr>` |
| `tableHeader` | `<th>` via `renderTableCell()` |
| `tableCell` | `<td>` via `renderTableCell()` |

**New method:** `renderTableCell(array $attrs, string $childrenHtml, string $tag = 'td')`
- Hỗ trợ `colspan`, `rowspan` attributes
- Chỉ render int values > 1

---

## Phase 6 – Content Safety & Validation

### Mục tiêu

Bảo vệ content khỏi XSS, injection attacks, và invalid data: enhance sanitizer với URL validation, enhance validator với schema-based checks, rate limiting cho media uploads.

---

### Những gì đã làm

#### 1. NodeRegistry Schema System

**File:** `src/Support/NodeRegistry.php`

Thêm hệ thống schema cho 22 node types:

```
doc, paragraph, heading, text, bulletList, orderedList, listItem,
blockquote, codeBlock, horizontalRule, hardBreak, table, tableRow,
tableHeader, tableCell, bootstrapRow, bootstrapCol, bootstrapAlert,
bootstrapCard, bootstrapButton, customImage, customVideo
```

| Property | Mô tả |
|----------|--------|
| `$allowedAttributes` | Map: node type → array of allowed attribute names |
| `$allowedChildren` | Map: node type → array of allowed child node types |
| `$defaultSchema` | Static schema definitions cho tất cả node types |

| New Method | Mô tả |
|------------|--------|
| `loadDefaultSchema()` | Populate maps từ static schema (gọi trong constructor) |
| `isKnownNodeType(string $type): bool` | Kiểm tra node type có trong registry |
| `getAllowedAttributes(string $type): ?array` | Lấy danh sách allowed attributes |
| `getAllowedChildren(string $type): ?array` | Lấy danh sách allowed children |
| `registerNodeSchema(string $type, array $attrs, array $children)` | Đăng ký custom node schema |
| `getKnownNodeTypes(): array` | Lấy tất cả known types |

#### 2. JsonSanitizer Enhanced

**File:** `src/Services/JsonSanitizer.php`

| Constant / Feature | Mô tả |
|---------------------|--------|
| `SAFE_URL_SCHEMES` | `['http', 'https', 'mailto', 'tel']` |
| `DANGEROUS_URL_PATTERNS` | `['javascript:', 'data:', 'vbscript:', 'file:', 'on\\w+=']` |

| New Method | Mô tả |
|------------|--------|
| `sanitizeAttributes(string $nodeType, array $attrs)` | Lọc attributes theo NodeRegistry schema |
| `sanitizeAttributeValue(string $attrName, mixed $value)` | Type-specific: URL sanitize cho href/src/url, int cast cho level/start/colspan, bool cast cho outline |
| `sanitizeUrl(string $url): string` | Block dangerous schemes, validate parsed scheme, return `#` cho dangerous URLs |
| `stripHtml(string $text): string` | Tag stripping utility |

**Enhanced logic trong `sanitizeNode()`:**
- Lọc unknown node types qua `isKnownNodeType()`
- Strip unknown attributes qua `sanitizeAttributes()`
- Remove empty marks arrays
- Sanitize link href URLs trong marks

#### 3. ContentValidator Enhanced

**File:** `src/Services/ContentValidator.php`

| Feature | Mô tả |
|---------|--------|
| `$warnings` array | Collect non-fatal issues (unknown attrs, suspicious values) |
| `strict()` mode | Rejects unknown node types (default: permissive) |
| Content size check | 500KB max |

| New Method | Mô tả |
|------------|--------|
| `warnings(): array` | Lấy danh sách warnings |
| `strict(bool $strict = true): static` | Toggle strict mode |
| `validateTextNode(array $node, int $depth)` | Check text key exists, validate marks |
| `validateMarks(array $marks, int $depth)` | Validate mark types, check link URLs |
| `validateNodeAttributes(string $type, array $attrs, int $depth)` | Schema-based: URL safety (src/url/href), heading level (1-6), alert type, button variant |
| `isValidUrl(string $url): bool` | Block `javascript:`, `data:`, `vbscript:`, `file:` schemes + event handler injection |

**Validation pipeline:**
1. Input parsing (string/array) + max size check
2. Root structure validation (type: doc, content array)
3. Recursive node validation:
   - Type existence check
   - Known type check (strict mode)
   - Text node validation
   - Attribute validation (schema-based)
   - Children recursion with parent type tracking
4. Errors (fatal) + Warnings (non-fatal) output

#### 4. ValidateMediaUpload Middleware

**File:** `src/Http/Middleware/ValidateMediaUpload.php`

| Feature | Mô tả |
|---------|--------|
| Rate limiting | Configurable `max_uploads` / `per_minutes` via config |
| Content-Length check | Reject nếu vượt `max_file_size` config |
| Response headers | `X-RateLimit-Limit`, `X-RateLimit-Remaining` |
| 429 response | `Too Many Requests` với `Retry-After` header |
| 413 response | `File Too Large` |
| Rate limit key | `tiptap_upload:{userId}:{ip}` |

**Config additions** (`config/tiptap-editor.php`):
```php
'media' => [
    'rate_limit' => [
        'max_uploads' => 30,
        'per_minutes' => 1,
    ],
],
```

**Route update** (`routes/editor.php`):
```php
Route::post('/upload', [MediaUploadController::class, 'upload'])
    ->middleware(ValidateMediaUpload::class)
    ->name('upload');
```

---

## Kết quả kiểm thử

### Tests mới tạo

| Test File | Tests | Nội dung |
|-----------|-------|----------|
| `tests/Unit/Services/TableRenderTest.php` | 12 | table, colspan, rowspan, textAlign, codeBlock language, orderedList start, sub/super, highlight, textStyle, blockquote, hardBreak |
| `tests/Unit/Traits/HasTiptapContentTest.php` | 16 | getTiptapContent (array/string/empty), setTiptapContent, renderContent (+cache), getExcerpt, getPlainTextContent, getHeadings, hasContent (true/false/empty), column default, renderContentFresh |
| `tests/Unit/Services/JsonSanitizerTest.php` | 17 | preserve valid doc, string input, strip unknown nodes/attrs/marks, URL blocks (javascript/data/vbscript), allows (http/mailto/relative/hash), control chars, max depth, oversized, stripHtml, heading attrs, empty marks |
| `tests/Unit/Services/ContentValidatorEnhancedTest.php` | 14 | valid doc, strict mode (unknown/known), heading level, link URL javascript, image src data URL, button URL javascript, warnings (unknown attrs/alert type/mark), missing text, oversized, valid https URL, non-array node |
| `tests/Unit/NodeRegistryEnhancedTest.php` | 8 | default types, unknown types, heading attrs, image attrs, doc children, custom schema, known types list, null for unknown |

### Tổng kết

```
PHPUnit 11.5.55
Runtime: PHP 8.3.14

✅ 124 tests, 249 assertions – ALL PASS

Vite Build: ✓ 72 modules
  - dist/css/tiptap-editor.css    12.99 kB (gzip: 2.79 kB)
  - dist/js/tiptap-editor.es.js  620.37 kB (gzip: 165.10 kB)
  - dist/js/tiptap-editor.umd.js 405.33 kB (gzip: 125.37 kB)
```

---

## File Summary

### Files Created (Phase 5)

| # | File | Lines |
|---|------|-------|
| 1 | `resources/views/renders/paragraph.blade.php` | ~8 |
| 2 | `resources/views/renders/heading.blade.php` | ~12 |
| 3 | `resources/views/renders/image.blade.php` | ~22 |
| 4 | `resources/views/renders/video.blade.php` | ~25 |
| 5 | `resources/views/renders/bootstrap-row.blade.php` | ~8 |
| 6 | `resources/views/renders/bootstrap-col.blade.php` | ~10 |
| 7 | `resources/views/renders/alert.blade.php` | ~10 |
| 8 | `resources/views/renders/card.blade.php` | ~18 |
| 9 | `resources/views/renders/button.blade.php` | ~15 |
| 10 | `resources/views/renders/table.blade.php` | ~3 |
| 11 | `resources/views/renders/list.blade.php` | ~8 |
| 12 | `resources/views/renders/blockquote.blade.php` | ~3 |
| 13 | `resources/views/renders/code-block.blade.php` | ~5 |
| 14 | `resources/views/renders/horizontal-rule.blade.php` | ~1 |
| 15 | `src/Traits/HasTiptapContent.php` | ~215 |
| 16 | `tests/Unit/Services/TableRenderTest.php` | ~260 |
| 17 | `tests/Unit/Traits/HasTiptapContentTest.php` | ~260 |

### Files Created (Phase 6)

| # | File | Lines |
|---|------|-------|
| 1 | `src/Http/Middleware/ValidateMediaUpload.php` | ~95 |
| 2 | `tests/Unit/Services/JsonSanitizerTest.php` | ~330 |
| 3 | `tests/Unit/Services/ContentValidatorEnhancedTest.php` | ~280 |
| 4 | `tests/Unit/NodeRegistryEnhancedTest.php` | ~85 |

### Files Modified

| # | File | Thay đổi |
|---|------|----------|
| 1 | `src/Services/HtmlRenderer.php` | +table/tableRow/tableHeader/tableCell rendering, +`renderTableCell()` method |
| 2 | `src/Support/NodeRegistry.php` | +schema system: $allowedAttributes, $allowedChildren, $defaultSchema, 6 new methods |
| 3 | `src/Services/JsonSanitizer.php` | +URL constants, +node type filtering, +attribute filtering, +URL sanitization, 5 new methods |
| 4 | `src/Services/ContentValidator.php` | +$warnings, +strict mode, +text/marks/attribute validation, +URL safety, 6 new methods |
| 5 | `config/tiptap-editor.php` | +`media.rate_limit` config section |
| 6 | `routes/editor.php` | +ValidateMediaUpload middleware on upload route |

---

## Tiến độ tổng thể

| Phase | Trạng thái | Tests |
|-------|------------|-------|
| 0 – Project Setup | ✅ | 2 |
| 1 – Core Editor MVP | ✅ | 22 |
| 2 – Bootstrap Layout | ✅ | 9 |
| 3 – Bootstrap Components | ✅ | 15 |
| 4 – Media Management | ✅ | 10 |
| 5 – HTML Rendering | ✅ | 28 |
| 6 – Content Safety | ✅ | 39 |
| **Tổng** | | **124 tests, 249 assertions** |

**Next:** Phase 7 – AI Content Generation (Optional), Phase 8 – Polish & Documentation, Phase 9 – Publishing
