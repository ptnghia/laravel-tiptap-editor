# Laravel Tiptap Editor

[![PHP](https://img.shields.io/badge/PHP-8.2%2B-blue)](https://php.net)
[![Laravel](https://img.shields.io/badge/Laravel-11%20|%2012-red)](https://laravel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-202%20passing-brightgreen)](tests/)

A full-featured **Laravel package** providing a rich text editor built on **[Tiptap v2](https://tiptap.dev)**, **Bootstrap 5**, with media management, server-side rendering, and optional AI content generation. Works with standard Laravel + Blade — no SPA required.

---

## ✨ Features

- **Rich Text** — Bold, italic, underline, strikethrough, subscript, superscript, text color, highlight
- **Headings & Structure** — H1–H4, paragraph, horizontal rule, hard break
- **Lists** — Bullet list, ordered list (with start offset)
- **Bootstrap 5 Layout** — Row/column grid with responsive breakpoints (`col-md-6`, `col-lg-4`, etc.)
- **Bootstrap Components** — Alert (8 types), Card (header/body/footer), Button (inline atom)
- **Media** — Image upload with thumbnail generation, Video embed (YouTube, Vimeo, MP4)
- **Gallery** — Multi-image gallery with responsive grid and lightbox
- **Table** — Full table editing, cell merge (colspan/rowspan), Bootstrap-styled
- **Code Block** — Syntax highlighting via lowlight
- **Links** — Internal/external links with `rel`/`target` configuration
- **Slash Commands** — Notion-style `/` command palette for quick block insertion
- **Block Menu** — Floating action menu: duplicate, move up/down, delete, transform block
- **Content Safety** — JSON sanitization, URL whitelist, XSS prevention, depth/size limits
- **Server-side Rendering** — JSON → clean HTML via Blade partials
- **Dark Mode** — Auto (system), light, dark via CSS variables
- **Keyboard Shortcuts** — Built-in `Ctrl+/` help modal with all shortcuts listed
- **Accessibility** — WCAG 2.1 AA: ARIA roles, roving tabindex, live region announcements
- **Responsive Preview** — Desktop / Tablet (768px) / Mobile (375px) preview inside editor
- **AI Content Generation** _(optional)_ — OpenAI & Claude: generate, refine, summarize, translate
- **i18n** — English & Vietnamese included; fully translatable

---

## Requirements

| Dependency | Version |
|-----------|---------|
| PHP | 8.2+ |
| Laravel | 11.x or 12.x |

> Pre-built JS/CSS assets are included in `dist/` — no Node.js required for production use.

---

## Installation

### 1. Install via Composer

```bash
composer require ptnghia/laravel-tiptap-editor
```

The service provider and facade are auto-discovered.

### 2. Publish Assets

```bash
# JS + CSS assets → public/vendor/tiptap-editor/
php artisan vendor:publish --tag=tiptap-editor-assets

# Config file → config/tiptap-editor.php
php artisan vendor:publish --tag=tiptap-editor-config

# Database migrations (tiptap_media table)
php artisan vendor:publish --tag=tiptap-editor-migrations
php artisan migrate
```

Optional:

```bash
# Blade views (for customizing rendered HTML)
php artisan vendor:publish --tag=tiptap-editor-views

# Language files
php artisan vendor:publish --tag=tiptap-editor-lang
```

### 3. Include Assets in Your Layout

```blade
<head>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <!-- Tiptap Editor CSS -->
    <link href="{{ asset('vendor/tiptap-editor/css/tiptap-editor.css') }}" rel="stylesheet">
</head>
<body>
    ...
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <!-- Tiptap Editor JS -->
    <script src="{{ asset('vendor/tiptap-editor/js/tiptap-editor.umd.js') }}"></script>
</body>
```

---

## Basic Usage

### Blade Component

```blade
<form method="POST" action="/posts">
    @csrf

    <x-tiptap-editor
        name="content"
        :value="$post->content_json ?? null"
        placeholder="Start writing..."
    />

    <button type="submit" class="btn btn-primary">Save</button>
</form>
```

### Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | `'content'` | Hidden input field name |
| `value` | `string\|array\|null` | `null` | Initial content (Tiptap JSON array or JSON string) |
| `config` | `array` | `[]` | Override editor configuration |
| `placeholder` | `string` | From lang file | Editor placeholder text |
| `disabled` | `bool` | `false` | Render editor as read-only |
| `id` | `string\|null` | Auto-generated | HTML `id` for the wrapper element |

### Read Submitted Content

The editor submits a JSON string via the named hidden input:

```php
public function store(Request $request)
{
    $request->validate(['content' => 'required|string']);

    $post = Post::create([
        'content_json' => $request->input('content'),
    ]);
}
```

---

## Server-side Rendering

### Via Facade

```php
use Suspended\TiptapEditor\Facades\TiptapEditor;

$html = TiptapEditor::render($post->content_json);
// or pass an array directly
$html = TiptapEditor::render($post->content_array);
```

```blade
{!! $html !!}
```

### Via Eloquent Trait

```php
use Suspended\TiptapEditor\Traits\HasTiptapContent;

class Post extends Model
{
    use HasTiptapContent;

    // Expects a 'content_json' column (override with $tiptapColumn)
}
```

Available methods:

```php
$post->renderContent();          // JSON → safe HTML string
$post->getExcerpt(200);          // Plain-text excerpt, 200 chars
$post->getPlainText();           // All text, no markup
$post->getHeadings();            // [['level' => 1, 'text' => '...']]
$post->hasContent();             // bool
$post->getTiptapContent();       // Raw content as array
$post->setTiptapContent($json);  // Set from array or JSON string
```

---

## Configuration

Publish and edit `config/tiptap-editor.php`:

### Extensions

Enable or disable individual features:

```php
'extensions' => [
    // Text formatting
    'paragraph', 'heading', 'bold', 'italic', 'underline', 'strike',
    'subscript', 'superscript', 'blockquote', 'codeBlock', 'horizontalRule',
    'hardBreak', 'link', 'textAlign', 'color', 'highlight', 'characterCount',

    // Bootstrap layout & components
    'bootstrapRow', 'bootstrapCol',
    'bootstrapAlert', 'bootstrapCard', 'bootstrapButton',

    // Media
    'customImage', 'customVideo', 'gallery',

    // Table
    'table', 'tableRow', 'tableCell', 'tableHeader',

    // UX features
    'slashCommands',
],
```

### Toolbar Groups

```php
'toolbar' => [
    'groups' => [
        'text'      => ['bold', 'italic', 'underline', 'strike'],
        'heading'   => ['h1', 'h2', 'h3', 'h4'],
        'alignment' => ['alignLeft', 'alignCenter', 'alignRight', 'alignJustify'],
        'list'      => ['bulletList', 'orderedList'],
        'insert'    => ['link', 'image', 'video', 'table', 'horizontalRule'],
        'block'     => ['blockquote', 'codeBlock'],
        'layout'    => ['row'],
        'component' => ['alert', 'card', 'button'],
        'format'    => ['color', 'highlight', 'subscript', 'superscript'],
        'history'   => ['undo', 'redo'],
        'utils'     => ['gallery', 'darkMode', 'shortcuts'],
    ],
],
```

Override per-instance in Blade:

```blade
<x-tiptap-editor
    name="excerpt"
    :config="[
        'toolbar' => [
            'groups' => [
                'text'    => ['bold', 'italic'],
                'heading' => ['h1', 'h2'],
                'insert'  => ['link'],
                'history' => ['undo', 'redo'],
            ],
        ],
    ]"
/>
```

### Theme

```php
'theme' => 'auto',  // 'auto' | 'light' | 'dark'
```

### Media Settings

```php
'media' => [
    'disk'          => env('TIPTAP_MEDIA_DISK', 'public'),
    'path'          => 'tiptap-media',
    'max_file_size' => 5120,  // KB (5 MB)

    'allowed_types' => [
        'image/jpeg', 'image/png', 'image/gif',
        'image/webp', 'image/svg+xml',
        'video/mp4', 'video/webm',
    ],

    // Requires: composer require intervention/image
    'image_sizes' => [
        'thumbnail' => [150, 150],
        'medium'    => [600, null],   // null = auto height
        'large'     => [1200, null],
    ],

    'webp_conversion' => true,
    'webp_quality'    => 85,
    'strip_exif'      => true,

    'rate_limit' => [
        'max_uploads' => 30,
        'per_minutes' => 1,
    ],
],
```

### Link & Sanitization Settings

Control which HTML attributes are allowed in the rendered output:

```php
'sanitization' => [
    'allowed_attributes' => [
        // Link attributes
        'href', 'target', 'rel', 'title',

        // Image attributes
        'src', 'alt', 'width', 'height', 'loading',

        // Layout & component attributes
        'class', 'data-type', 'data-alert-type', 'data-col-class',

        // Table attributes
        'role', 'colspan', 'rowspan',

        // Style (limited to color/background-color via the sanitizer)
        'style',
    ],
    'max_nesting_depth' => 10,
    'max_content_size'  => 512000,  // bytes (500 KB)
],
```

URL safety is always enforced:

```
✅ Allowed: http://, https://, mailto:, tel:, /relative, #anchor
❌ Blocked:  javascript:, data:, vbscript:, file:
```

External links (`target="_blank"`) automatically receive `rel="noopener noreferrer"`.

### Table Rendered Output

By default tables render as `<table class="table table-bordered">`. After publishing views you can customise [resources/views/vendor/tiptap-editor/renders/table.blade.php](resources/views/renders/table.blade.php) to add `table-striped`, `table-hover`, etc.

### Video Providers

```php
'video_providers' => [
    'youtube' => [
        'regex'     => '/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/',
        'embed_url' => 'https://www.youtube-nocookie.com/embed/{id}',
    ],
    'vimeo' => [
        'regex'     => '/vimeo\.com\/(\d+)/',
        'embed_url' => 'https://player.vimeo.com/video/{id}',
    ],
],
```

### Route Settings

```php
'routes' => [
    'prefix'     => 'tiptap-editor',
    'middleware' => ['web', 'auth'],
],
```

**Package routes:**

| Method | URL | Name |
|--------|-----|------|
| `POST` | `/tiptap-editor/media/upload` | `tiptap-editor.media.upload` |
| `GET` | `/tiptap-editor/media/browse` | `tiptap-editor.media.browse` |
| `DELETE` | `/tiptap-editor/media/{id}` | `tiptap-editor.media.delete` |
| `POST` | `/tiptap-editor/ai/generate` | `tiptap-editor.ai.generate` |
| `POST` | `/tiptap-editor/ai/refine` | `tiptap-editor.ai.refine` |
| `POST` | `/tiptap-editor/ai/summarize` | `tiptap-editor.ai.summarize` |
| `POST` | `/tiptap-editor/ai/translate` | `tiptap-editor.ai.translate` |

> AI routes are only registered when `ai.enabled = true`.

---

## AI Content Generation (Optional)

### Setup

```bash
# For OpenAI
composer require openai-php/laravel

# For Claude (uses Guzzle HTTP)
composer require guzzlehttp/guzzle
```

```env
TIPTAP_AI_ENABLED=true
TIPTAP_AI_PROVIDER=openai        # openai | claude

OPENAI_API_KEY=sk-...
TIPTAP_AI_OPENAI_MODEL=gpt-4o-mini

ANTHROPIC_API_KEY=sk-ant-...
TIPTAP_AI_CLAUDE_MODEL=claude-sonnet-4-20250514
```

### Configuration

```php
'ai' => [
    'enabled'          => env('TIPTAP_AI_ENABLED', false),
    'default_provider' => env('TIPTAP_AI_PROVIDER', 'openai'),

    'providers' => [
        'openai' => [
            'api_key'     => env('OPENAI_API_KEY'),
            'model'       => env('TIPTAP_AI_OPENAI_MODEL', 'gpt-4o-mini'),
            'max_tokens'  => 4096,
            'temperature' => 0.7,
        ],
        'claude' => [
            'api_key'    => env('ANTHROPIC_API_KEY'),
            'model'      => env('TIPTAP_AI_CLAUDE_MODEL', 'claude-sonnet-4-20250514'),
            'max_tokens' => 4096,
        ],
    ],

    'rate_limit' => [
        'max_requests' => 20,
        'per_minutes'  => 60,
    ],

    'capabilities' => [
        'generate'  => true,
        'refine'    => true,
        'summarize' => true,
        'translate' => true,
    ],
],
```

### Use in PHP

```php
use Suspended\TiptapEditor\Services\AiContentService;

$ai = app(AiContentService::class);

$response = $ai->generate('Write a blog post about Laravel packages');
echo $response->content;     // HTML string
echo $response->tokensUsed;  // int

$refined   = $ai->refine($existingHtml, 'Make it more concise');
$summary   = $ai->summarize($longContent, maxLength: 300);
$translated = $ai->translate($content, 'vi');
```

---

## Content Sanitization

```php
use Suspended\TiptapEditor\Facades\TiptapEditor;

// Sanitize before storing
$cleanJson = TiptapEditor::sanitize($request->input('content'));
$post->content_json = $cleanJson;
```

The sanitizer:
- Whitelists node types, attributes, and URL schemes
- Removes `javascript:`, `data:`, `vbscript:` URLs
- Strips control characters and empty marks
- Enforces max nesting depth and total content size

---

## Keyboard Shortcuts

Press **Ctrl+/** (**⌘/** on Mac) to open the shortcuts help modal.

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` | Bold |
| `Ctrl+I` | Italic |
| `Ctrl+U` | Underline |
| `Ctrl+Shift+X` | Strikethrough |
| `Ctrl+Alt+0` | Paragraph |
| `Ctrl+Alt+1` – `4` | Heading 1–4 |
| `Ctrl+Shift+8` | Bullet list |
| `Ctrl+Shift+7` | Ordered list |
| `Ctrl+Shift+B` | Blockquote |
| `Ctrl+Alt+C` | Code block |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `/` | Slash command menu |
| `Ctrl+/` | Shortcuts help |

---

## Customizing Rendered HTML

After publishing views, edit the Blade partials in `resources/views/vendor/tiptap-editor/renders/`:

| File | Renders |
|------|---------|
| `paragraph.blade.php` | `<p>` |
| `heading.blade.php` | `<h1>` – `<h4>` |
| `image.blade.php` | `<figure><img>` with optional caption |
| `video.blade.php` | `<iframe>` (YouTube / Vimeo) or `<video>` (MP4) |
| `bootstrap-row.blade.php` | `<div class="row">` |
| `bootstrap-col.blade.php` | `<div class="col-*">` |
| `alert.blade.php` | `<div class="alert alert-*">` |
| `card.blade.php` | Bootstrap card (header / body / footer) |
| `button.blade.php` | `<a class="btn btn-*">` |
| `gallery.blade.php` | Responsive image grid |
| `gallery-image.blade.php` | Single gallery image |
| `table.blade.php` | `<table class="table">` |
| `list.blade.php` | `<ul>` / `<ol>` |
| `blockquote.blade.php` | `<blockquote>` |
| `code-block.blade.php` | `<pre><code>` |
| `horizontal-rule.blade.php` | `<hr>` |

---

## Extending

### Custom Node Renderer

```php
use Suspended\TiptapEditor\Support\NodeRegistry;
use Suspended\TiptapEditor\Services\HtmlRenderer;

// In a ServiceProvider boot()
$registry = app(NodeRegistry::class);

$registry->registerSchema('myBlock', [
    'allowed_attributes' => ['class', 'data-type'],
    'allowed_children'   => ['paragraph'],
]);

$registry->register('myBlock', function (array $node, HtmlRenderer $renderer): string {
    $content = $renderer->renderChildren($node);
    return "<div class=\"my-block\">{$content}</div>";
});
```

### Custom AI Provider

```php
use Suspended\TiptapEditor\Contracts\AiProviderInterface;
use Suspended\TiptapEditor\Services\Ai\AiResponse;

class MyProvider implements AiProviderInterface
{
    public function generate(string $prompt, array $options = []): AiResponse
    {
        $content = '...'; // call your API
        return new AiResponse(
            content: $content,
            tiptapJson: null,
            tokensUsed: 0,
            provider: 'my-provider',
            model: 'my-model',
        );
    }

    public function supports(string $capability): bool
    {
        return in_array($capability, ['generate', 'refine']);
    }

    public function getName(): string { return 'my-provider'; }
}
```

```php
app(AiContentService::class)->registerProvider('my-provider', new MyProvider());
```

---

## Internationalization

Includes `en` and `vi` translations. Publish to customise or add new locales:

```bash
php artisan vendor:publish --tag=tiptap-editor-lang
# lang/vendor/tiptap-editor/{locale}/editor.php
```

---

## Testing

```bash
./vendor/bin/phpunit
```

**202 tests, 422 assertions** covering HTML rendering, sanitization, content validation, media, tables, AI providers, gallery, traits, config, and translations.

---

## Directory Structure

```
src/
├── EditorServiceProvider.php
├── Facades/TiptapEditor.php
├── Contracts/AiProviderInterface.php
├── Http/Controllers/  (MediaUploadController, AiContentController)
├── Http/Middleware/   (ValidateMediaUpload, AiRateLimiter)
├── Http/Requests/     (MediaUploadRequest, AiContentRequest)
├── Models/Media.php
├── Services/
│   ├── HtmlRenderer.php
│   ├── JsonSanitizer.php
│   ├── ContentValidator.php
│   ├── MediaManager.php
│   ├── AiContentService.php
│   └── Ai/ (OpenAiProvider, ClaudeProvider, AiResponse)
├── Support/ (NodeRegistry, AiPromptTemplates)
├── Traits/HasTiptapContent.php
└── View/Components/TiptapEditor.php

resources/js/editor/
├── index.js            Editor.js            Toolbar.js
├── extensions/         (9 Tiptap extensions)
├── MediaBrowser.js     AiPanel.js           BlockMenu.js
├── KeyboardShortcuts.js AccessibilityManager.js ResponsivePreview.js
└── utils/              (helpers.js, sanitizer.js)

dist/
├── js/tiptap-editor.es.js   (685 KB / 180 KB gzipped)
├── js/tiptap-editor.umd.js  (449 KB / 136 KB gzipped)
└── css/tiptap-editor.css    (27 KB / 5 KB gzipped)
```

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

## Changelog

### v1.0.0 – 2026-02-27

Initial release.

**Core**
- Rich text editing with 20+ formatting options
- Bootstrap 5 grid layout (Row/Column, 8 responsive presets)
- Bootstrap components: Alert, Card, Button
- Table editing (merge cells, Bootstrap styled)
- Media: image upload + thumbnail generation, video embed (YouTube/Vimeo/MP4)
- Gallery: responsive grid, lightbox
- Server-side JSON→HTML rendering via Blade partials
- Content sanitization & validation (whitelist-based, XSS-safe)
- `HasTiptapContent` Eloquent trait

**UX**
- Slash commands (`/` palette, 18 commands)
- Block menu (drag handle, duplicate, delete, transform)
- Dark mode (auto/light/dark, CSS variables)
- Keyboard shortcuts help modal (`Ctrl+/`)
- WCAG 2.1 AA accessibility (ARIA, roving tabindex, live regions)
- Responsive preview (desktop / tablet / mobile)

**AI** _(optional)_
- OpenAI & Claude providers (strategy pattern)
- Actions: generate, refine, summarize, translate
- Configurable rate limiting
- Built-in prompt templates

**Other**
- i18n: English & Vietnamese
- 202 tests, 422 assertions
