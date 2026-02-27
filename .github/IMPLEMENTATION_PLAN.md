# KẾ HOẠCH TRIỂN KHAI CHI TIẾT
## Laravel Tiptap Editor Package – Implementation Plan

---

## 📊 PROGRESS TRACKING (Updated: 2025-07-15)

| Phase | Tên | Trạng thái | Tests | Ghi chú |
|-------|-----|------------|-------|---------|
| 0 | Project Setup | ✅ Done | 2 | composer, npm, vite, phpunit, service provider |
| 1 | Core Editor (MVP) | ✅ Done | 22 | Editor.js, Toolbar.js, Blade component, CSS, form sync |
| 2 | Bootstrap Layout | ✅ Done | 9 | Row/Col extensions, commands, styles |
| 3 | Bootstrap Components | ✅ Done (core) | 15 | Alert, Card, Button, Table. Badge/Callout/Modal chưa làm |
| 4 | Media Management | ✅ Done (core) | 10 | Upload, Image, Video, MediaBrowser. Gallery ✅ done |
| 5 | HTML Rendering | ✅ Done | 28 | 14 Blade templates, HasTiptapContent trait, caching config |
| 6 | Content Safety | ✅ Done | 39 | JsonSanitizer, ContentValidator, NodeRegistry, middleware |
| 7 | Package Distribution | ❌ Not started | - | Chờ hoàn thiện features + test thực tế |
| 8 | Advanced Features | ✅ Phase 8A+8B Done | 26 | Slash Commands, Block Menu, Gallery, Dark Mode, Shortcuts, A11y, Preview, Utils |
| 9 | AI Content Generation | ✅ Done | 52 | OpenAI, Claude, AiPanel, prompt templates, rate limiting |

**Tổng:** 202 tests, 422 assertions | 81 Vite modules | 24 PHP src files | 19 JS files

### Remaining Features (chưa triển khai)

| # | Feature | Phase | Ưu tiên | Lý do |
|---|---------|-------|---------|-------|
| 1 | ~~Gallery Extension~~ | 4.6 | ✅ Done | Phase 8A |
| 2 | **Badge Extension** (JS + Blade) | 3.4 | 🟢 Optional | Inline component nhỏ |
| 3 | **Callout Extension** (JS + Blade) | 3.5 | 🟢 Optional | Custom block ngoài Bootstrap |
| 4 | **ControlledEmbed** (JS + Blade) | - | 🟢 Optional | Iframe embed an toàn |
| 5 | **Component Insert Modal** | 3.7 | 🟡 Medium | UI chọn component (hiện dùng toolbar) |
| 6 | **SEO Helpers** | 5.5 | ⭐ High | Heading validation, alt check, meta |
| 7 | ~~Slash Commands~~ | 8.2 | ✅ Done | Phase 8A |
| 8 | ~~Block Menu~~ | 8.3 | ✅ Done | Phase 8A |
| 9 | ~~Dark Mode~~ | 8.10 | ✅ Done | Phase 8B |
| 10 | ~~Keyboard Shortcuts help~~ | 8.7 | ✅ Done | Phase 8B |
| 11 | ~~Accessibility (ARIA)~~ | 8.9 | ✅ Done | Phase 8B |
| 12 | ~~Responsive Preview~~ | 8.4 | ✅ Done | Phase 8B |
| 13 | **AI Streaming (SSE)** | 9.7 | 🟡 Medium | ChatGPT-style realtime output |
| 14 | **Feature Tests** | 7.5 | ⭐ High | MediaUpload, EditorComponent, AI endpoints |
| 15 | ~~JS Utils~~ | 1 | ✅ Done | Phase 8B |

---

## Tổng quan Phases

| Phase | Tên | Mô tả | Ưu tiên |
|-------|-----|--------|---------|
| 0 | Project Setup | Khởi tạo package structure, tooling | 🔴 Critical |
| 1 | Core Editor (MVP) | Tiptap cơ bản + Blade component | 🔴 Critical |
| 2 | Bootstrap Layout | Row/Column grid system | 🔴 Critical |
| 3 | Bootstrap Components | Alert, Card, Button, Badge, Callout | 🟡 High |
| 4 | Media Management | Image upload, Video, Gallery | 🟡 High |
| 5 | HTML Rendering | Server-side JSON → HTML | 🔴 Critical |
| 6 | Content Safety | Sanitizer, Validator, Security | 🔴 Critical |
| 7 | Package Distribution | Composer, publish, docs | 🟡 High |
| 8 | Advanced Features | DnD, history, preview, a11y | 🟢 Nice-to-have |
| 9 | AI Content Generation | OpenAI/Claude API sinh nội dung, configurable | 🟡 High |

---

## Phase 0 – Project Setup

### 0.1 Khởi tạo Package Structure
- [ ] Tạo `composer.json` với namespace `Suspended\TiptapEditor\`
- [ ] Tạo `package.json` với Tiptap dependencies
- [ ] Tạo `vite.config.js` cho build assets
- [ ] Tạo cấu trúc thư mục theo ARCHITECTURE.md
- [ ] Tạo `.gitignore`, `.editorconfig`
- [ ] Tạo `phpunit.xml`

### 0.2 Service Provider
- [ ] `EditorServiceProvider.php` – register & boot
- [ ] Register config, views, routes, migrations
- [ ] Publish groups: config, views, assets, migrations
- [ ] Facade `TiptapEditor`

### 0.3 Config File
- [ ] `config/tiptap-editor.php` – default configuration
- [ ] Extensions list, toolbar config, media settings
- [ ] Sanitization whitelist, rendering options

### 0.4 Development Tooling
- [ ] Setup PHPUnit + TestCase
- [ ] Setup ESLint cho JS
- [ ] Setup Vite dev/build workflow
- [ ] README.md cơ bản

**Deliverable:** Package có thể require vào Laravel app, Service Provider tự register

---

## Phase 1 – Core Editor (MVP)

### 1.1 JavaScript Editor Core
- [ ] `resources/js/editor/index.js` – Entry point, auto-init
- [ ] `resources/js/editor/Editor.js` – Main class wrapping Tiptap
  - Constructor: nhận element, config, initial content
  - Methods: `getJSON()`, `getHTML()`, `setContent()`, `destroy()`
  - Events: `onChange`, `onFocus`, `onBlur`
- [ ] Install Tiptap core packages:
  - `@tiptap/core`
  - `@tiptap/pm`
  - `@tiptap/starter-kit` (Paragraph, Heading, Bold, Italic, List, etc.)

### 1.2 Toolbar
- [ ] `resources/js/editor/Toolbar.js` – Toolbar manager
  - Render buttons based on config
  - Toggle active state
  - Group buttons (text, insert, layout)
- [ ] `resources/views/toolbar/toolbar.blade.php` – HTML template
  - Bootstrap 5 button groups
  - Icons (Bootstrap Icons hoặc custom SVG)
  - Responsive collapse cho mobile

### 1.3 Blade Component
- [ ] `src/View/Components/TiptapEditor.php` – Component class
  - Props: `name`, `value`, `config`, `placeholder`, `disabled`
  - Pass config to JS via `data-` attributes hoặc inline JSON
- [ ] `resources/views/components/tiptap-editor.blade.php` – Template
  - Toolbar area
  - Editor content area
  - Hidden input for form submission
  - CSS classes cho styling

### 1.4 Styling
- [ ] `resources/css/editor.css`
  - Editor container styles
  - Content area typography
  - Toolbar styles (Bootstrap-based)
  - Focus/active states
  - ProseMirror override styles

### 1.5 Form Integration
- [ ] Hidden `<input>` chứa JSON, sync onChange
- [ ] Support Laravel old() value
- [ ] Support validation errors display
- [ ] Multiple editors trên cùng 1 page

### 1.6 Vite Build
- [ ] Build JS → `dist/js/tiptap-editor.js`
- [ ] Build CSS → `dist/css/tiptap-editor.css`
- [ ] Asset publishing vào Laravel public/

**Deliverable:** Editor cơ bản hoạt động trong Blade form, có thể type/submit content

---

## Phase 2 – Bootstrap Layout (Row / Column)

### 2.1 BootstrapRow Extension
- [ ] `resources/js/editor/extensions/BootstrapRow.js`
  - Node type: `bootstrapRow`
  - Group: `block`
  - Content: `bootstrapCol+`
  - Attributes: `gutter` (g-0 đến g-5)
  - parseHTML: `<div class="row">`
  - renderHTML: `<div class="row g-{gutter}">`

### 2.2 BootstrapCol Extension
- [ ] `resources/js/editor/extensions/BootstrapCol.js`
  - Node type: `bootstrapCol`
  - Group: _(chỉ nằm trong bootstrapRow)_
  - Content: `block+` (cho phép nest các block khác)
  - Attributes: `colClass` (col-md-6, col-lg-4, etc.)
  - parseHTML: `<div class="col-*">`
  - renderHTML: `<div class="{colClass}">`

### 2.3 Layout Commands
- [ ] Command: `insertRow` – Chèn row với preset columns
  - 1 column: `col-12`
  - 2 columns: `col-md-6 | col-md-6`
  - 3 columns: `col-md-4 | col-md-4 | col-md-4`
  - 1+2: `col-md-4 | col-md-8`
  - 2+1: `col-md-8 | col-md-4`
- [ ] Command: `addColumn` – Thêm cột vào row hiện tại
- [ ] Command: `removeColumn` – Xoá cột
- [ ] Command: `changeColumnSize` – Đổi kích thước cột

### 2.4 Layout Toolbar UI
- [ ] Dropdown chọn layout preset
- [ ] Visual preview cho mỗi preset (icon/thumbnail)
- [ ] Column resize handles (drag hoặc dropdown)

### 2.5 Editor Styles cho Layout
- [ ] CSS hiển thị grid trong editor (dashed borders, labels)
- [ ] Visual indicator cho empty columns
- [ ] Highlight active column

**Deliverable:** User có thể tạo layout chia cột Bootstrap trong editor

---

## Phase 3 – Bootstrap Components

### 3.1 BootstrapAlert Extension
- [ ] `resources/js/editor/extensions/BootstrapAlert.js`
  - Attributes: `type` (primary, secondary, success, danger, warning, info)
  - Content: `inline*` (text content)
  - renderHTML: `<div class="alert alert-{type}">`
  - Toolbar: dropdown chọn alert type

### 3.2 BootstrapCard Extension
- [ ] `resources/js/editor/extensions/BootstrapCard.js`
  - Structure: cardHeader (optional) + cardBody + cardFooter (optional)
  - Content: `block+` trong body
  - Attributes: `headerText`, `footerText`, `borderColor`
  - renderHTML: Bootstrap 5 card markup

### 3.3 BootstrapButton Extension
- [ ] `resources/js/editor/extensions/BootstrapButton.js`
  - Node type: `bootstrapButton` (inline node)
  - Attributes: `text`, `url`, `variant` (primary, secondary, ...), `size` (sm, lg), `outline`
  - renderHTML: `<a class="btn btn-{variant}" href="{url}">{text}</a>`
  - Modal/popup để edit button properties

### 3.4 Badge Extension (Đề xuất thêm)
- [ ] Inline node cho Bootstrap badges
  - Attributes: `text`, `variant`, `pill`
  - renderHTML: `<span class="badge bg-{variant}">`

### 3.5 Callout Extension (Đề xuất thêm)
- [ ] Block node cho callout/tip boxes
  - Attributes: `type` (tip, warning, note, important), `title`
  - Content: `block+`
  - Custom styling ngoài Bootstrap

### 3.6 Table Extension (Đề xuất thêm ⭐)
- [ ] Integrate `@tiptap/extension-table`
  - Bootstrap table classes
  - Add/remove rows & columns
  - Cell merging
  - Striped, bordered, hover variants

### 3.7 Component Insert Modal
- [ ] UI modal/dropdown để chọn component type
- [ ] Preview mỗi component trước khi chèn
- [ ] Attribute editor cho mỗi component

**Deliverable:** User có thể chèn các Bootstrap components vào content

---

## Phase 4 – Media Management

### 4.1 Backend: MediaManager Service
- [ ] `src/Services/MediaManager.php`
  - `upload(UploadedFile $file): Media` – Upload & process file
  - `delete(Media $media): bool` – Xoá file & record
  - `getUrl(Media $media, ?string $size): string` – Generate URL
  - `generateThumbnails(Media $media): void` – Tạo thumbnails
  - `convertToWebP(string $path): string` – Convert ảnh sang WebP
  - Configurable: disk, sizes, max dimensions, quality

### 4.2 Backend: Media Model & Migration
- [ ] `src/Models/Media.php` – Eloquent model
- [ ] Migration: `create_tiptap_media_table`
- [ ] Relationships: morphable (polymorphic)

### 4.3 Backend: Upload Controller & Routes
- [ ] `src/Http/Controllers/MediaUploadController.php`
  - `upload()` – POST single file
  - `uploadMultiple()` – POST multiple files (gallery)
  - `delete()` – DELETE media
  - `browse()` – GET list media (optional media browser)
- [ ] `src/Http/Requests/MediaUploadRequest.php` – Validation
- [ ] `src/Http/Middleware/ValidateMediaUpload.php` – Rate limiting, auth
- [ ] Routes: `routes/editor.php`
  - `POST /tiptap-editor/media/upload`
  - `POST /tiptap-editor/media/upload-multiple`
  - `DELETE /tiptap-editor/media/{id}`
  - `GET /tiptap-editor/media/browse` (optional)

### 4.4 Image Extension
- [ ] `resources/js/editor/extensions/CustomImage.js`
  - Attributes: `src`, `alt`, `caption`, `width`, `height`, `alignment`, `mediaId`
  - Upload integration: drag & drop, paste, button
  - Resize handles trong editor
  - Alt text & caption editor (modal/inline)
  - Lazy loading attribute `loading="lazy"`
  - Responsive: `img-fluid` class

### 4.5 Video Extension
- [ ] `resources/js/editor/extensions/CustomVideo.js`
  - Attributes: `provider` (youtube, vimeo, mp4), `videoId`, `url`, `title`
  - Provider detection from URL
  - Controlled iframe render (no arbitrary iframes)
  - Aspect ratio container (responsive-embed)
  - Configurable allowed providers

### 4.6 Gallery Extension (Đề xuất thêm ⭐)
- [ ] `resources/js/editor/extensions/Gallery.js`
  - Node type: `gallery`
  - Content: collection of image references
  - Attributes: `columns` (2-4), `gap`, `lightbox`
  - renderHTML: Bootstrap grid of images
  - Drag & drop reorder

### 4.7 Media Browser Modal (Đề xuất thêm)
- [ ] Modal UI để browse existing media
- [ ] Search, filter by type
- [ ] Select & insert into editor
- [ ] Grid/list view toggle

**Deliverable:** Full media upload, insert, display cho images & videos

---

## Phase 5 – HTML Rendering Layer

### 5.1 HtmlRenderer Service
- [ ] `src/Services/HtmlRenderer.php`
  - `render(array|string $json): string` – Main render method
  - `renderNode(array $node): string` – Render single node
  - `renderMarks(string $text, array $marks): string` – Apply marks to text
  - Recursive traversal of JSON document tree
  - Blade partial loading for each node type

### 5.2 Blade Render Templates
- [ ] `resources/views/renders/paragraph.blade.php`
- [ ] `resources/views/renders/heading.blade.php` (h1-h6)
- [ ] `resources/views/renders/image.blade.php`
- [ ] `resources/views/renders/video.blade.php`
- [ ] `resources/views/renders/bootstrap-row.blade.php`
- [ ] `resources/views/renders/bootstrap-col.blade.php`
- [ ] `resources/views/renders/alert.blade.php`
- [ ] `resources/views/renders/card.blade.php`
- [ ] `resources/views/renders/button.blade.php`
- [ ] `resources/views/renders/gallery.blade.php`
- [ ] `resources/views/renders/table.blade.php`
- [ ] `resources/views/renders/list.blade.php` (ordered & unordered)
- [ ] `resources/views/renders/blockquote.blade.php`
- [ ] `resources/views/renders/code-block.blade.php`
- [ ] `resources/views/renders/horizontal-rule.blade.php`

### 5.3 HasTiptapContent Trait
- [ ] `src/Traits/HasTiptapContent.php`
  - Auto-render HTML on save (configurable)
  - `renderContent(): string` – Render content_json → HTML
  - `getExcerpt(int $length): string` – Auto-generate excerpt
  - Cast content_json as `array`

### 5.4 Caching
- [ ] Cache rendered HTML (optional, configurable)
- [ ] Invalidate cache on content update
- [ ] Cache key strategy: model + content hash

### 5.5 SEO Helpers (Đề xuất thêm ⭐)
- [ ] Auto-generate meta description from content
- [ ] Heading structure validation (h1 → h2 → h3)
- [ ] Image alt text validation/warnings
- [ ] Schema.org markup support (optional)

**Deliverable:** Server-side rendering từ JSON → clean HTML

---

## Phase 6 – Content Safety & Validation

### 6.1 JsonSanitizer
- [ ] `src/Services/JsonSanitizer.php`
  - Whitelist-based: chỉ cho phép node types đã register
  - Strip unknown attributes
  - Sanitize text content (XSS prevention)
  - Remove empty nodes
  - Configurable whitelist via config

### 6.2 ContentValidator
- [ ] `src/Services/ContentValidator.php`
  - Validate JSON structure (valid ProseMirror document)
  - Check required attributes per node type
  - Validate media references (exists in DB)
  - Validate URLs (no javascript:, data:, etc.)
  - Max content depth/size limits

### 6.3 NodeRegistry
- [ ] `src/Support/NodeRegistry.php`
  - Register all allowed node types
  - Define allowed attributes per node
  - Define allowed children per node
  - Used by both Sanitizer and Validator

### 6.4 Middleware & Request Validation
- [ ] Content size limits
- [ ] Rate limiting for media uploads
- [ ] Auth middleware for editor routes

**Deliverable:** Content được sanitize & validate trước khi lưu

---

## Phase 7 – Package Distribution

### 7.1 Composer Package
- [ ] Finalize `composer.json` (autoload, require, suggest)
- [ ] Service Provider auto-discovery
- [ ] Proper version tagging (SemVer)

### 7.2 Asset Publishing
- [ ] `php artisan vendor:publish --tag=tiptap-editor-config`
- [ ] `php artisan vendor:publish --tag=tiptap-editor-views`
- [ ] `php artisan vendor:publish --tag=tiptap-editor-assets`
- [ ] `php artisan vendor:publish --tag=tiptap-editor-migrations`

### 7.3 npm Package
- [ ] `package.json` với tất cả JS dependencies
- [ ] Build script: `npm run build`
- [ ] Pre-built assets included trong package (cho non-Vite projects)

### 7.4 Documentation
- [ ] `README.md` – Installation, basic usage, configuration
- [ ] API documentation
- [ ] Extension development guide
- [ ] Troubleshooting guide
- [ ] Changelog

### 7.5 Testing
- [ ] Unit tests cho HtmlRenderer
- [ ] Unit tests cho JsonSanitizer
- [ ] Unit tests cho ContentValidator
- [ ] Unit tests cho MediaManager
- [ ] Feature tests cho MediaUploadController
- [ ] Feature tests cho Blade component rendering
- [ ] Test coverage target: 80%+

**Deliverable:** Package sẵn sàng install qua Composer

---

## Phase 8 – Advanced Features (Optional)

### 8.1 Drag & Drop Blocks
- [ ] Sử dụng `@tiptap/extension-dropcursor`
- [ ] Block drag handles
- [ ] Visual drop indicators

### 8.2 Slash Commands (Đề xuất thêm ⭐)
- [ ] Type `/` để trigger command menu
- [ ] Search/filter commands
- [ ] Quick insert: heading, image, row, alert, etc.
- [ ] Tham khảo: Notion-style slash commands

### 8.3 Block Menu (Đề xuất thêm ⭐)
- [ ] Floating menu khi hover block
- [ ] Actions: duplicate, delete, move up/down
- [ ] Change block type

### 8.4 Responsive Preview
- [ ] Preview content ở Desktop / Tablet / Mobile widths
- [ ] Quan trọng cho Bootstrap layout verification

### 8.5 Version History (Đề xuất thêm)
- [ ] Save content versions on update
- [ ] Compare/diff versions
- [ ] Restore previous version

### 8.6 Read-only / Preview Mode
- [ ] Toggle editor ↔ preview
- [ ] Styled preview matching frontend output

### 8.7 Keyboard Shortcuts (Đề xuất thêm ⭐)
- [ ] Tiptap built-in shortcuts (Ctrl+B, Ctrl+I, etc.)
- [ ] Custom shortcuts table display
- [ ] Help modal `Ctrl+/`

### 8.8 Internationalization (Đề xuất thêm ⭐)
- [ ] Laravel translation files cho toolbar labels
- [ ] Support Vietnamese, English as default
- [ ] Extensible language packs

### 8.9 Accessibility (Đề xuất thêm ⭐)
- [ ] ARIA labels cho toolbar buttons
- [ ] Keyboard navigation trong toolbar
- [ ] Screen reader support
- [ ] WCAG 2.1 AA compliance target

### 8.10 Dark Mode (Đề xuất thêm)
- [ ] CSS variables cho theming
- [ ] Auto-detect `prefers-color-scheme`
- [ ] Manual toggle

**Deliverable:** Editor nâng cao với UX hiện đại

---

## Phase 9 – AI Content Generation (Configurable)

### Tổng quan
Tích hợp AI (OpenAI GPT / Anthropic Claude) để sinh nội dung trực tiếp trong editor.
Tính năng này là **optional**, bật/tắt qua config. Package không bắt buộc cài AI SDK.

### 9.1 Backend: AiContentService
- [ ] `src/Services/AiContentService.php`
  - Interface-based design (strategy pattern) cho nhiều providers
  - `generate(string $prompt, array $options): string` – Gọi API sinh nội dung
  - `generateStructured(string $prompt, array $options): array` – Trả về Tiptap JSON trực tiếp
  - `refine(string $content, string $instruction): string` – Chỉnh sửa nội dung có sẵn
  - `summarize(string $content, int $maxLength): string` – Tóm tắt nội dung
  - `translate(string $content, string $targetLang): string` – Dịch nội dung
  - Rate limiting & token usage tracking
  - Error handling: API timeout, quota exceeded, invalid response

### 9.2 AI Provider Contracts
- [ ] `src/Contracts/AiProviderInterface.php`
  ```php
  interface AiProviderInterface
  {
      public function generate(string $prompt, array $options = []): AiResponse;
      public function supports(string $capability): bool;
      public function getName(): string;
  }
  ```
- [ ] `src/Services/Ai/OpenAiProvider.php` – OpenAI GPT implementation
  - Support GPT-4o, GPT-4o-mini
  - Configurable: model, temperature, max_tokens
  - System prompt tối ưu cho content creation dạng Tiptap JSON
- [ ] `src/Services/Ai/ClaudeProvider.php` – Anthropic Claude implementation
  - Support Claude 3.5 Sonnet, Claude 3 Haiku
  - Configurable: model, max_tokens
  - System prompt + structured output
- [ ] `src/Services/Ai/AiResponse.php` – Value object cho response
  ```php
  class AiResponse
  {
      public function __construct(
          public readonly string $content,
          public readonly ?array $tiptapJson,
          public readonly int $tokensUsed,
          public readonly string $provider,
          public readonly string $model,
      ) {}
  }
  ```

### 9.3 Backend: AI Controller & Routes
- [ ] `src/Http/Controllers/AiContentController.php`
  - `generate(AiContentRequest $request): JsonResponse` – POST sinh nội dung mới
  - `refine(AiRefineRequest $request): JsonResponse` – POST chỉnh sửa nội dung
  - `summarize(Request $request): JsonResponse` – POST tóm tắt
  - `translate(Request $request): JsonResponse` – POST dịch
- [ ] `src/Http/Requests/AiContentRequest.php` – Validate prompt, options
- [ ] Routes:
  - `POST /tiptap-editor/ai/generate` – Sinh nội dung
  - `POST /tiptap-editor/ai/refine` – Chỉnh sửa/cải thiện
  - `POST /tiptap-editor/ai/summarize` – Tóm tắt
  - `POST /tiptap-editor/ai/translate` – Dịch thuật
- [ ] Middleware: Auth required, Rate limiting (configurable: X requests/minute)

### 9.4 Frontend: AI Panel UI
- [ ] `resources/js/editor/AiPanel.js` – AI interaction panel
  - Textarea input để mô tả yêu cầu nội dung
  - Dropdown chọn action: Generate, Refine, Summarize, Translate
  - Loading state với streaming indicator
  - Preview kết quả trước khi chèn
  - Buttons: "Chèn vào editor", "Tạo lại", "Huỷ"
  - History: lưu recent prompts (localStorage)
- [ ] `resources/views/toolbar/ai-panel.blade.php` – Blade template cho panel
- [ ] `resources/css/ai-panel.css` – Styling cho AI panel
- [ ] Toolbar button: Icon AI (✨ hoặc custom SVG) để toggle panel

### 9.5 AI Prompt Templates (Pre-built)
- [ ] `src/Support/AiPromptTemplates.php`
  - `blogPost(string $topic, string $tone, int $wordCount)` – Bài blog
  - `productDescription(string $product, array $features)` – Mô tả sản phẩm
  - `faq(string $topic, int $questionCount)` – FAQ section
  - `seoMeta(string $content)` – Meta title + description
  - `outline(string $topic, int $sections)` – Dàn ý bài viết
  - User có thể thêm custom templates qua config

### 9.6 Configuration
```php
// config/tiptap-editor.php → ai section
'ai' => [
    'enabled' => env('TIPTAP_AI_ENABLED', false),

    'default_provider' => env('TIPTAP_AI_PROVIDER', 'openai'),

    'providers' => [
        'openai' => [
            'api_key' => env('OPENAI_API_KEY'),
            'model' => env('TIPTAP_AI_OPENAI_MODEL', 'gpt-4o-mini'),
            'max_tokens' => 4096,
            'temperature' => 0.7,
            'organization' => env('OPENAI_ORGANIZATION'),
        ],
        'claude' => [
            'api_key' => env('ANTHROPIC_API_KEY'),
            'model' => env('TIPTAP_AI_CLAUDE_MODEL', 'claude-3-5-sonnet-20241022'),
            'max_tokens' => 4096,
        ],
    ],

    'rate_limit' => [
        'max_requests' => 20,       // per user
        'per_minutes' => 60,
    ],

    'prompt_templates' => [
        // Custom templates can be added here
    ],

    'system_prompt' => 'You are a professional content writer for a CMS. Generate well-structured content that will be inserted into a rich text editor. Use headings, paragraphs, lists, and other formatting appropriately.',

    'output_format' => 'html',  // html | tiptap_json

    'capabilities' => [
        'generate' => true,
        'refine' => true,
        'summarize' => true,
        'translate' => true,
    ],
],
```

### 9.7 Streaming Support (Đề xuất thêm ⭐)
- [ ] Server-Sent Events (SSE) cho real-time output
  - Route: `GET /tiptap-editor/ai/stream`
  - Controller trả về `StreamedResponse`
  - JS: `EventSource` API để nhận từng chunk
  - Content xuất hiện dần trong editor (giống ChatGPT UX)
  - Fallback: non-streaming cho browsers/providers không hỗ trợ

### 9.8 Content Refinement Actions
- [ ] Chọn text trong editor → Right-click/toolbar → AI actions:
  - "Viết lại" – Rewrite với tone khác
  - "Mở rộng" – Expand nội dung
  - "Rút gọn" – Shorten content
  - "Sửa ngữ pháp" – Grammar & spelling fix
  - "Dịch" – Translate selected text
  - "Giải thích đơn giản hơn" – Simplify language

### 9.9 Safety & Guardrails
- [ ] Prompt injection prevention
  - Sanitize user prompts trước khi gửi API
  - System prompt hardcoded, không cho user override
- [ ] Content moderation
  - Kiểm tra output từ AI trước khi chèn
  - Filter harmful/inappropriate content
- [ ] Cost control
  - Token usage tracking per user/session
  - Max tokens per request (configurable)
  - Daily/monthly usage limits (optional)
- [ ] Logging
  - Log AI requests cho audit trail (optional)
  - `tiptap_ai_logs` table (optional migration)

### 9.10 Testing
- [ ] Unit tests: `AiContentServiceTest.php`
  - Mock API responses
  - Test prompt building
  - Test rate limiting
  - Test error handling (timeout, invalid response)
- [ ] Feature tests: `AiContentControllerTest.php`
  - Test endpoints with auth
  - Test rate limiting middleware
  - Test config disabled scenario

**Deliverable:** AI sinh nội dung tích hợp trong editor, configurable bật/tắt, hỗ trợ OpenAI & Claude

---

## Đề xuất bổ sung so với kế hoạch gốc

### Bổ sung quan trọng (Nên có)
| # | Tính năng | Lý do |
|---|-----------|-------|
| 1 | **Table Extension** | Bảng là tính năng rất phổ biến trong CMS |
| 2 | **Slash Commands** | UX hiện đại (Notion-style), giúp user khám phá features |
| 3 | **Block Menu** | Floating menu cho thao tác nhanh với blocks |
| 4 | **Keyboard Shortcuts** | Tăng productivity cho power users |
| 5 | **i18n** | Hỗ trợ đa ngôn ngữ, mở rộng user base |
| 6 | **Accessibility** | Tuân thủ chuẩn a11y, requirement cho enterprise |
| 7 | **SEO Helpers** | Giá trị gia tăng cho CMS, heading validation, alt check |
| 8 | **Code Block** | Syntax highlighting cho technical content |
| 9 | **Link Management** | Quản lý link: rel, target, nofollow attributes |
| 10 | **Content Import** | Import từ HTML → JSON (paste from Word/web) |

### Bổ sung nâng cao (Nice-to-have)
| # | Tính năng | Lý do |
|---|-----------|-------|
| 1 | **Media Browser** | Browse existing media thay vì chỉ upload mới |
| 2 | **Gallery** | Nhiều CMS cần gallery display |
| 3 | **Version History** | Rollback content changes |
| 4 | **Dark Mode** | Modern UI requirement |
| 5 | **Export (PDF/DOCX)** | Offline content sử dụng |
| 6 | **AI Content Generation** | Sinh nội dung bằng OpenAI/Claude, tăng productivity |

---

## Dependency Map

```
Phase 0 (Setup) ──→ Phase 1 (Core) ──→ Phase 2 (Layout) ──→ Phase 3 (Components)
                          │                                         │
                          ├──→ Phase 5 (Rendering) ──→ Phase 6 (Safety)
                          │                                │
                          └──→ Phase 4 (Media) ────────────┘
                                                           │
                                                    Phase 7 (Package)
                                                           │
                                                    Phase 8 (Advanced)
                                                           │
                                              Phase 9 (AI Content) ←── requires Phase 1 + Phase 6
```

**Lưu ý:** Phase 5 & 6 có thể phát triển song song với Phase 2-4, nhưng cần Phase 1 hoàn thành trước.

---

## Estimated Timeline

| Phase | Thời gian ước tính | Điều kiện |
|-------|-------------------|-----------|
| Phase 0 | 1-2 ngày | - |
| Phase 1 | 3-5 ngày | Phase 0 done |
| Phase 2 | 2-3 ngày | Phase 1 done |
| Phase 3 | 3-4 ngày | Phase 1 done |
| Phase 4 | 4-5 ngày | Phase 1 done |
| Phase 5 | 3-4 ngày | Phase 1 done |
| Phase 6 | 2-3 ngày | Phase 5 done |
| Phase 7 | 2-3 ngày | All above done |
| Phase 8 | Ongoing | Phase 7 done |
| Phase 9 | 4-5 ngày | Phase 1 + Phase 6 done |

**Tổng ước tính MVP (Phase 0-6):** ~3-4 tuần
**Tổng ước tính Full Package (Phase 0-7):** ~4-5 tuần
**Tổng ước tính Full + AI (Phase 0-9):** ~5-6 tuần
