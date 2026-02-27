# KIẾN TRÚC DỰ ÁN – Laravel Tiptap Editor Package

## 1. Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────────────┐
│                    Laravel Host App                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Blade Template                        │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │     <x-tiptap-editor> Component             │  │  │
│  │  │  ┌──────────┐  ┌──────────────────────┐    │  │  │
│  │  │  │ Toolbar   │  │  Tiptap Editor (JS)  │    │  │  │
│  │  │  │ (Blade)   │  │  ┌────────────────┐  │    │  │  │
│  │  │  │           │  │  │  Extensions     │  │    │  │  │
│  │  │  │ Bold      │  │  │  ├── Text       │  │    │  │  │
│  │  │  │ Italic    │  │  │  ├── Layout     │  │    │  │  │
│  │  │  │ Heading   │  │  │  ├── Components │  │    │  │  │
│  │  │  │ Layout    │  │  │  ├── Media      │  │    │  │  │
│  │  │  │ Media     │  │  │  └── Embed      │  │    │  │  │
│  │  │  │ ...       │  │  └────────────────┘  │    │  │  │
│  │  │  └──────────┘  └──────────────────────┘    │  │  │
│  │  │                                             │  │  │
│  │  │  ┌─────────────────────────────────────┐   │  │  │
│  │  │  │  Hidden Input (JSON content)         │   │  │  │
│  │  │  └─────────────────────────────────────┘   │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Backend (PHP)                         │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │  │
│  │  │ Service   │  │ Media    │  │ Content      │   │  │
│  │  │ Provider  │  │ Manager  │  │ Validator    │   │  │
│  │  └──────────┘  └──────────┘  └──────────────┘   │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │  │
│  │  │ HTML      │  │ JSON     │  │ Node         │   │  │
│  │  │ Renderer  │  │ Sanitizer│  │ Registry     │   │  │
│  │  └──────────┘  └──────────┘  └──────────────┘   │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 2. Data Flow

### 2.1 Editing Flow (Input)
```
User types in Editor
    → Tiptap generates JSON (ProseMirror document)
    → JSON stored in hidden <input> field
    → Form submit → Laravel Controller
    → JsonSanitizer validates & cleans JSON
    → ContentValidator checks schema
    → Save to database (content_json column)
    → HtmlRenderer generates HTML (content_html column)
```

### 2.2 Rendering Flow (Output)
```
Laravel Controller loads model
    → content_json available for re-editing
    → content_html available for display
    → OR: HtmlRenderer::render($json) on-the-fly
    → Blade partials render each node type
    → Clean, semantic HTML output
```

### 2.3 Media Upload Flow
```
User clicks upload in Editor
    → AJAX POST to /tiptap-editor/media/upload
    → ValidateMediaUpload middleware
    → MediaUploadController validates file
    → MediaManager processes file:
        ├── Validate type, size, dimensions
        ├── Generate thumbnails
        ├── Convert to WebP (optional)
        ├── Store in configured disk
        └── Create Media model record
    → Return JSON { url, thumb, id, alt }
    → Editor inserts node with media data
```

## 3. Component Architecture

### 3.1 PHP Components

| Component | Responsibility |
|-----------|---------------|
| `EditorServiceProvider` | Register bindings, publish assets, load routes/views |
| `TiptapEditor` (Facade) | Static API: `render()`, `sanitize()`, `validate()` |
| `HtmlRenderer` | Convert JSON document → HTML using Blade partials |
| `JsonSanitizer` | Whitelist-based sanitization of editor JSON |
| `ContentValidator` | Validate JSON against allowed node schema |
| `MediaManager` | File upload, processing, storage, URL generation |
| `NodeRegistry` | Registry of allowed node types and their configs |
| `ExtensionManager` | Manage which extensions are active |
| `HasTiptapContent` (Trait) | Eloquent model integration |
| `MediaUploadController` | Handle media upload HTTP requests |
| `AiContentController` | Handle AI content generation requests |
| `AiContentService` | AI provider orchestration, prompt management |
| `AiProviderInterface` | Contract for AI providers (OpenAI, Claude) |
| `TiptapEditor` (Blade Component) | Render editor UI in Blade |

### 3.2 JavaScript Components

| Component | Responsibility |
|-----------|---------------|
| `Editor.js` | Main editor class, Tiptap initialization |
| `Toolbar.js` | Toolbar rendering and button state management |
| `index.js` | Entry point, auto-init editors on page |
| Extensions | Each node/mark = 1 file in `extensions/` |
| `sanitizer.js` | Client-side content sanitization |
| `helpers.js` | Utility functions |
| `AiPanel.js` | AI content generation panel UI |

## 4. Extension System

```
Extension Registration:
    1. JS: Extension file → imported in Editor.js → passed to Tiptap
    2. PHP: Node config → registered in NodeRegistry → used by HtmlRenderer
    3. Blade: Render template → placed in renders/ → matched by node type
```

Mỗi extension cần 3 thành phần:
1. **JS Extension** (`resources/js/editor/extensions/MyNode.js`) – Tiptap node definition
2. **PHP Renderer** (method trong `HtmlRenderer` hoặc Blade partial) – Server-side HTML
3. **Toolbar Button** (optional, trong `toolbar.blade.php`) – UI control

## 5. Configuration Architecture

```php
// config/tiptap-editor.php
return [
    'extensions' => [...],          // Enabled extensions
    'toolbar' => [...],             // Toolbar buttons & groups
    'media' => [
        'disk' => 'public',
        'max_size' => 5120,         // KB
        'allowed_types' => [...],
        'image_sizes' => [...],
        'webp_conversion' => true,
    ],
    'sanitization' => [
        'allowed_tags' => [...],
        'allowed_attributes' => [...],
    ],
    'rendering' => [
        'cache' => true,
        'minify' => false,
    ],
    'ai' => [
        'enabled' => false,
        'default_provider' => 'openai',
        'providers' => [
            'openai' => ['api_key' => '', 'model' => 'gpt-4o-mini'],
            'claude' => ['api_key' => '', 'model' => 'claude-3-5-sonnet-20241022'],
        ],
        'rate_limit' => ['max_requests' => 20, 'per_minutes' => 60],
    ],
];
```

## 6. Database Schema

```sql
-- Media table (package migration)
CREATE TABLE tiptap_media (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    disk VARCHAR(50) NOT NULL DEFAULT 'public',
    path VARCHAR(500) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size INT UNSIGNED NOT NULL,
    width INT UNSIGNED NULL,
    height INT UNSIGNED NULL,
    alt VARCHAR(500) NULL,
    caption TEXT NULL,
    metadata JSON NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_mime_type (mime_type),
    INDEX idx_created_at (created_at)
);

-- Host app model (via trait)
-- content_json LONGTEXT    -- Tiptap JSON document
-- content_html LONGTEXT    -- Pre-rendered HTML
-- excerpt TEXT              -- Auto-generated excerpt
```

## 7. Security Architecture

```
Input Flow:
    Raw JSON → JsonSanitizer (whitelist nodes/attrs)
            → ContentValidator (schema check)
            → Database (safe JSON)

Output Flow:
    JSON → HtmlRenderer → Blade partials (auto-escaped)
                        → Clean HTML (no raw user HTML)

Media Flow:
    Upload → CSRF check → Middleware validation
          → File type whitelist → Size limit
          → Virus scan (optional) → Storage

AI Flow:
    User prompt → AiContentController
              → Rate limit check → Prompt sanitization
              → AiContentService → Select provider (OpenAI/Claude)
              → API call → Parse response
              → Content moderation check
              → Return HTML/JSON to editor
              → User preview → Insert into editor
```
