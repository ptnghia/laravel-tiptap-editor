# Phase 3 & 4 Report – Bootstrap Components & Media Management

**Trạng thái:** ✅ Hoàn thành  
**Ngày:** 2025-07-17

---

## Phase 3 – Bootstrap Components (Alert, Card, Button)

### Mục tiêu

Cho phép user chèn các Bootstrap 5 UI components phổ biến vào editor: Alert box (8 contextual types), Card (header/body/footer), và inline Button (link styled).

---

### Những gì đã làm

#### 1. BootstrapAlert Extension

**File:** `resources/js/editor/extensions/BootstrapAlert.js`

- Node type: `bootstrapAlert`, group: `block`, content: `inline*`
- 8 alert types: primary, secondary, success, danger, warning, info, light, dark
- Attribute: `type` (default: 'info')
- parseHTML: `<div class="alert">` và `<div data-type="bootstrap-alert">`
- renderHTML: `<div data-type="bootstrap-alert" data-alert-type="{type}" class="alert alert-{type}" role="alert">`
- `defining: true` – cursor stays within alert boundary
- 3 commands:
  - `insertBootstrapAlert(type)` – chèn alert mới
  - `setAlertType(type)` – đổi type cho alert hiện tại
  - `deleteBootstrapAlert()` – xoá alert
- Keyboard: Backspace trên empty alert → xoá node

#### 2. BootstrapCard Extension

**File:** `resources/js/editor/extensions/BootstrapCard.js`

- Node type: `bootstrapCard`, group: `block`, content: `block+`
- 8 border colors: primary, secondary, success, danger, warning, info, light, dark
- Attributes: `headerText`, `footerText`, `borderColor`
- parseHTML: `<div class="card">` – parse header/footer from child elements, border color from class
- renderHTML: card wrapper → optional card-header (contenteditable=false) → card-body (content hole) → optional card-footer
- `defining: true`, `isolating: true` – content stays within card boundary
- 3 commands:
  - `insertBootstrapCard({headerText, footerText, borderColor})` – chèn card mới
  - `updateBootstrapCard(attrs)` – cập nhật attributes
  - `deleteBootstrapCard()` – xoá card
- Keyboard: Backspace trên empty card → xoá node (walks up DOM tree to find card wrapper)

#### 3. BootstrapButton Extension

**File:** `resources/js/editor/extensions/BootstrapButton.js`

- Node type: `bootstrapButton`, group: `inline`, **inline atom** (không editable từ bên trong)
- 9 variants: primary, secondary, success, danger, warning, info, light, dark, link
- 2 sizes: sm, lg (+ default)
- Attributes: `text`, `url`, `variant`, `size`, `outline`, `target`
- parseHTML: `<span data-type="bootstrap-button">` và `<a class="btn">`
- renderHTML: `<span>` với data-* attrs, btn classes, role="button", contenteditable=false
- **NodeView**: Custom DOM rendering – dblclick mở prompts để edit text + URL
- 3 commands:
  - `insertBootstrapButton(attrs)` – chèn button mới
  - `updateBootstrapButton(attrs)` – cập nhật attributes
  - `deleteBootstrapButton()` – xoá button
- `addNodeView()`: DOM span tự update classes/text khi attributes thay đổi

#### 4. Toolbar Updates (Phase 3)

- **Alert dropdown**: Nút "Alert" với dropdown menu 8 types, mỗi item có color swatch (14px circle)
- **Card handler**: Prompt nhập headerText → `insertBootstrapCard()`
- **Button handler**: Prompt nhập text + URL → `insertBootstrapButton()`
- `ALERT_TYPE_OPTIONS` constant: label + color mapping cho 8 types
- `_createDropdownButton()` mở rộng: xử lý cả layout presets (row) và alert types (alert) bằng data attributes

#### 5. CSS (Phase 3)

- 8 alert type colors (background, border, text) cho editor preview
- Card preview: header/body/footer với border styling
- Button preview: inline-block với padding, border-radius
- Alert dropdown: color swatch circles

#### 6. HtmlRenderer (Phase 3)

- `renderBootstrapAlert($attrs, $childrenHtml)`: validate type against whitelist, default 'info', output `<div class="alert alert-{type}" role="alert">`
- `renderBootstrapCard($attrs, $childrenHtml)`: optional header/footer (XSS-escaped via `e()`), optional borderColor class, card-header/card-body/card-footer structure
- `renderBootstrapButton($attrs)`: validate variant/size, outline support, XSS-escaped href/text, target="_blank" with `rel="noopener noreferrer"`, output `<a class="btn btn-{variant}" role="button">`

#### 7. Tests (Phase 3) – 15 tests

**File:** `tests/Unit/Services/BootstrapComponentRenderTest.php`

| Test | Mô tả |
|------|--------|
| renders_alert_with_info_type | Alert info mặc định |
| renders_alert_with_danger_type | Alert danger |
| renders_alert_with_invalid_type_defaults_to_info | Invalid → info fallback |
| renders_alert_with_bold_text | Bold content trong alert |
| renders_card_with_body_only | Card chỉ có body |
| renders_card_with_header | Card có header |
| renders_card_with_header_and_footer | Card đầy đủ header + footer |
| renders_card_with_border_color | Card với border-primary class |
| renders_card_escapes_xss_in_header | XSS prevention (headerText) |
| renders_button_with_default_variant | Button primary mặc định |
| renders_button_with_outline | Outline button |
| renders_button_with_size | Button size lg |
| renders_button_with_blank_target | target="_blank" + rel noopener |
| renders_button_escapes_xss_in_url | XSS prevention (URL) |
| renders_button_with_invalid_variant_defaults | Invalid variant → primary |

---

## Phase 4 – Media Management

### Mục tiêu

Xây dựng hệ thống quản lý media hoàn chỉnh: Eloquent model, upload/delete API, CustomImage extension (thay thế basic Image), CustomVideo extension (YouTube/Vimeo/MP4), và MediaBrowser modal UI.

---

### Những gì đã làm

#### 1. Media Model

**File:** `src/Models/Media.php`

- Eloquent model, table: `tiptap_media`
- Fillable: filename, original_filename, path, disk, mime_type, size, alt, title, caption, width, height, thumbnails
- Casts: size→int, width→int, height→int, thumbnails→array
- `morphTo()` mediable relationship – polymorphic, liên kết media với bất kỳ model nào
- Methods: `getUrl($size)`, `isImage()`, `isVideo()`, `deleteFiles()`
- Scopes: `scopeImages()`, `scopeVideos()`
- Auto-deletes files on model deletion via `booted()` static hook

#### 2. Migration

**File:** `database/migrations/2024_01_01_000001_create_tiptap_media_table.php`

- Columns: id, filename, original_filename, path, disk, mime_type, size, alt, title, caption, width, height, thumbnails (JSON), nullableMorphs(mediable), timestamps
- Indexes: mime_type, created_at

#### 3. MediaManager Enhancement

**File:** `src/Services/MediaManager.php` (enhanced)

- **Preserved**: Existing config wrapper methods (disk, path, maxFileSize, allowedTypes, isAllowedType, storage)
- **New** `upload(UploadedFile)`: Stores file with UUID filename, date-based path (`YYYY/MM`), gets image dimensions via `getimagesize()`, creates Media record
- **New** `delete(Media)`: Deletes file from storage + deletes Media record
- **New** `getUrl(Media, $size)`: Returns URL with optional thumbnail size
- **New** `getImageDimensions(string $path)`: Read width/height from stored image
- **New** helpers: `imageSizes()`, `webpConversionEnabled()`, `maxDimensions()`

#### 4. Upload Request

**File:** `src/Http/Requests/MediaUploadRequest.php`

- Validates: `file` required + max size + mimes validation
- Optional: alt, title, caption (string, max:255)
- `mimeTypesToExtensions()`: Converts config MIME types (image/jpeg, video/mp4) to file extensions for Laravel `mimes` rule

#### 5. MediaUploadController

**File:** `src/Http/Controllers/MediaUploadController.php`

- `upload(MediaUploadRequest)`: Upload via MediaManager → 201 JSON response with media details
- `browse(Request)`: Paginated media list (24/page), filterable by type (image/video) and search (filename), returns JSON
- `delete(int $id)`: Find + delete Media via MediaManager → 204 response

#### 6. Routes

**File:** `routes/editor.php` (updated)

- `POST /media/upload` → `MediaUploadController@upload` (name: `tiptap-editor.media.upload`)
- `GET /media/browse` → `MediaUploadController@browse` (name: `tiptap-editor.media.browse`)
- `DELETE /media/{id}` → `MediaUploadController@delete` (name: `tiptap-editor.media.delete`)
- All routes: prefix `tiptap-editor`, middleware `web`

#### 7. CustomImage Extension

**File:** `resources/js/editor/extensions/CustomImage.js`

- **Thay thế** `@tiptap/extension-image` basic extension
- Node type: `customImage`, group: `block`, draggable
- Attributes: src, alt, title, caption, width, height, alignment (left/center/right), mediaId, loading (lazy/eager)
- parseHTML: `figure[data-type="custom-image"]`, `figure.tiptap-image`, `img[src]` (standalone)
- renderHTML: `<figure>` → `<img class="img-fluid">` + optional `<figcaption>`
- 3 commands:
  - `insertCustomImage(attrs)` – chèn image
  - `updateCustomImage(attrs)` – cập nhật attributes
  - `deleteCustomImage()` – xoá image
- **NodeView**: figure/img/figcaption DOM, dblclick → prompts edit alt + caption

#### 8. CustomVideo Extension

**File:** `resources/js/editor/extensions/CustomVideo.js`

- Provider detection: YouTube (regex), Vimeo (regex), MP4 (extension check)
- Node type: `customVideo`, group: `block`, atom, draggable
- Attributes: provider, videoId, url, title, width, height
- parseHTML: `div[data-type="custom-video"]`, `div.ratio.ratio-16x9`
- renderHTML: MP4 → `<video controls>`; YouTube/Vimeo → `<iframe>` in ratio wrapper
- 3 commands:
  - `insertCustomVideo({url, title})` – auto-detect provider + extract videoId
  - `updateCustomVideo(attrs)` – cập nhật
  - `deleteCustomVideo()` – xoá
- **NodeView**: ratio-16x9 wrapper với iframe/video, dblclick → prompt URL, re-detect provider
- Exports: `detectProvider()`, `PROVIDERS`, default `CustomVideo`

#### 9. MediaBrowser

**File:** `resources/js/editor/MediaBrowser.js`

- Modal class cho browsing/selecting uploaded media
- Constructor: `browseUrl`, `uploadUrl`, `onSelect` callback, `type` filter
- `open()`: Create modal DOM, prevent body scroll, load media, focus search
- `close()`: Remove modal, restore scroll
- Features:
  - Search (debounced 300ms)
  - Filter buttons: All / Images / Videos
  - File upload with drag indication
  - Paginated grid display
  - Click thumbnail → `onSelect(media)` → close
  - Close: button, backdrop click, Escape key
  - CSRF token handling from meta tag
- Exported from `index.js` cho external usage

#### 10. Toolbar Updates (Phase 4)

- **Image handler refactored**: File input → server upload via `_uploadFile()`, fallback to FileReader base64 preview, then URL prompt as last resort
- **Video handler**: Prompt URL → `insertCustomVideo()` command
- **New helpers**: `_getUploadUrl()` (checks data-upload-url attr + meta tag), `_uploadFile(file, url)` (FormData + CSRF + fetch)

#### 11. CSS (Phase 4)

- Custom image: margin, max-width, border-radius, caption styling, ProseMirror-selectednode blue outline
- Custom video: wrapper background, border-radius, selectednode outline, responsive iframe/video
- MediaBrowser modal: overlay, dialog, header, toolbar (search input + filter buttons + upload area), grid (auto-fill 120px), items (hover effects), video thumbnail indicator, loading/empty/error states, pagination buttons

#### 12. HtmlRenderer (Phase 4)

- `renderCustomImage($attrs)`: Returns empty if no src. Alignment classes (text-start/center/end). Figure/img/figcaption structure. Lazy loading. Width/height attributes. XSS-escaped alt/title/caption.
- `renderCustomVideo($attrs)`: MP4 → `<video controls>` with `<source>`. YouTube/Vimeo → iframe embed URL from `config('tiptap-editor.video_providers')` whitelist, ratio-16x9 wrapper, allowfullscreen. Unknown provider → empty string for security.

#### 13. Tests (Phase 4) – 10 tests

**File:** `tests/Unit/Services/MediaRenderTest.php`

| Test | Mô tả |
|------|--------|
| renders_custom_image_with_basic_attributes | Image src + alt |
| renders_custom_image_with_caption | Figure + figcaption |
| renders_custom_image_with_left_alignment | text-start class |
| renders_custom_image_with_dimensions | width/height attrs |
| renders_custom_image_returns_empty_without_src | No src → empty |
| renders_custom_image_escapes_xss_in_alt | XSS prevention |
| renders_custom_video_youtube | YouTube iframe embed |
| renders_custom_video_vimeo | Vimeo iframe embed |
| renders_custom_video_mp4 | HTML5 video tag |
| renders_custom_video_unknown_provider_returns_empty | Safety: unknown → empty |

---

## Verification Results

| Check | Kết quả |
|-------|---------|
| `vendor/bin/phpunit` | ✅ 56 tests, 111 assertions |
| `npm run build` | ✅ 72 modules, 1.73s |
| IDE errors | ✅ 0 errors |

### Test Breakdown

| Test Suite | Tests | Assertions |
|------------|-------|------------|
| ExampleTest | 2 | 2 |
| NodeRegistryTest | 4 | 8 |
| HtmlRendererTest | 10 | 26 |
| ContentValidatorTest | 6 | 10 |
| BootstrapLayoutRenderTest | 9 | 20 |
| BootstrapComponentRenderTest (Phase 3) | 15 | 30 |
| MediaRenderTest (Phase 4) | 10 | 15 |
| **Total** | **56** | **111** |

### Build Output

```
dist/css/tiptap-editor.css     12.99 kB │ gzip:   2.79 kB
dist/js/tiptap-editor.es.js   620.37 kB │ gzip: 165.10 kB
dist/js/tiptap-editor.umd.js  405.33 kB │ gzip: 125.37 kB
```

---

## Files Created (Phase 3)

| File | Mô tả |
|------|--------|
| `resources/js/editor/extensions/BootstrapAlert.js` | Alert extension |
| `resources/js/editor/extensions/BootstrapCard.js` | Card extension |
| `resources/js/editor/extensions/BootstrapButton.js` | Button extension |
| `tests/Unit/Services/BootstrapComponentRenderTest.php` | 15 tests |

## Files Created (Phase 4)

| File | Mô tả |
|------|--------|
| `src/Models/Media.php` | Eloquent media model |
| `database/migrations/2024_01_01_000001_create_tiptap_media_table.php` | Migration |
| `src/Http/Requests/MediaUploadRequest.php` | Upload validation |
| `src/Http/Controllers/MediaUploadController.php` | Upload/browse/delete API |
| `resources/js/editor/extensions/CustomImage.js` | Custom image extension |
| `resources/js/editor/extensions/CustomVideo.js` | Custom video extension |
| `resources/js/editor/MediaBrowser.js` | Media browser modal UI |
| `tests/Unit/Services/MediaRenderTest.php` | 10 tests |

## Files Modified (Phase 3 + 4)

| File | Thay đổi |
|------|----------|
| `resources/js/editor/Editor.js` | Import 5 new extensions (Alert, Card, Button, CustomImage, CustomVideo), remove basic Image |
| `resources/js/editor/Toolbar.js` | Alert dropdown, card/button/video handlers, image upload flow, _uploadFile helper |
| `resources/js/editor/index.js` | Export MediaBrowser |
| `resources/css/editor.css` | Alert/card/button/image/video preview + MediaBrowser modal styles |
| `src/Services/HtmlRenderer.php` | 5 new render methods (alert, card, button, image, video) |
| `src/Services/MediaManager.php` | upload(), delete(), getUrl(), dimension helpers |
| `routes/editor.php` | Enable 3 media routes |

---

## Checklist Phase 3

- [x] BootstrapAlert.js – Node extension (8 types)
- [x] BootstrapCard.js – Node extension (header/body/footer)
- [x] BootstrapButton.js – Inline atom extension (NodeView)
- [x] Toolbar: alert dropdown, card/button insert handlers
- [x] CSS: alert colors, card/button preview
- [x] HtmlRenderer: alert, card, button rendering
- [x] XSS prevention: `e()` escaping for all user content
- [x] Input validation: type/variant/size whitelists
- [x] 15 new unit tests
- [x] Vite build successful

## Checklist Phase 4

- [x] Media.php Eloquent model (morphable, scopes, auto-delete)
- [x] Migration with indexes
- [x] MediaManager: upload with UUID filename, date-based path
- [x] MediaUploadRequest validation
- [x] MediaUploadController (upload, browse, delete)
- [x] 3 API routes enabled
- [x] CustomImage.js – thay thế basic Image extension
- [x] CustomVideo.js – YouTube/Vimeo/MP4 detection
- [x] MediaBrowser.js – Modal UI (search, filter, pagination, upload)
- [x] Toolbar image upload flow (server → base64 fallback → URL)
- [x] HtmlRenderer: image + video rendering
- [x] Video provider whitelist from config
- [x] XSS prevention cho alt, caption, URLs
- [x] 10 new unit tests
- [x] MediaBrowser exported from index.js
- [x] Vite build successful

---

## Kiến trúc chính

### Phase 3 – Component Pattern

```
Toolbar dropdown/button → Editor command → Tiptap Node extension
                                              ├── parseHTML (load)
                                              ├── renderHTML (editor view)
                                              ├── addNodeView (interactive: Button)
                                              └── addKeyboardShortcuts (Backspace)

HtmlRenderer (PHP)
  └── renderBootstrap{Alert|Card|Button}() → sanitized HTML output
```

### Phase 4 – Media Flow

```
Toolbar click → File Input → _uploadFile() → MediaUploadController
                                                 ├── MediaUploadRequest (validate)
                                                 ├── MediaManager.upload() → Storage + Media record
                                                 └── JSON response {url, mediaId, ...}
                 ↓
              CustomImage/CustomVideo extension → NodeView (preview + dblclick edit)

MediaBrowser (standalone)
  └── open() → fetch(browseUrl) → grid → click → onSelect(media) → insertCustomImage()
```

### JSON → HTML Pipeline

```
{type: "bootstrapAlert", attrs: {type: "warning"}}
  → HtmlRenderer::renderBootstrapAlert()
    → <div class="alert alert-warning" role="alert">...</div>

{type: "customImage", attrs: {src, alt, caption, alignment}}
  → HtmlRenderer::renderCustomImage()
    → <figure class="text-center"><img ...><figcaption>...</figcaption></figure>

{type: "customVideo", attrs: {provider: "youtube", videoId: "abc123"}}
  → HtmlRenderer::renderCustomVideo()
    → <div class="ratio ratio-16x9"><iframe src="https://youtube.com/embed/abc123" ...></iframe></div>
```

---

## Ghi chú cho Phase 5

- **Phase 5 (HTML Rendering System)**: Hoàn thiện pipeline JSON → HTML
- Blade partial templates cho mỗi node type
- NodeRegistry driven rendering
- HasTiptapContent trait cho Eloquent models
- Frontend rendering helpers
- Gallery extension (multi-image)
- ControlledEmbed extension (safe iframes)

---

## Tổng kết tích luỹ

| Metric | Phase 0 | Phase 1 | Phase 2 | Phase 3+4 |
|--------|---------|---------|---------|-----------|
| Tests | 2 | 22 | 31 | **56** |
| Assertions | 2 | 46 | 55 | **111** |
| JS Modules | 53 | 64 | 67 | **72** |
| CSS Size | 2.71 KB | 4.38 KB | 6.88 KB | **12.99 KB** |
| ES Bundle | 529 KB | 554 KB | 586 KB | **620 KB** |
| UMD Bundle | 341 KB | 360 KB | 383 KB | **405 KB** |
| Extensions | 0 | 12 | 14 | **19** |
