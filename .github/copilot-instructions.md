# Copilot Instructions – Laravel Tiptap Editor Package

## 📋 Tổng quan dự án

Đây là **Laravel Package** cung cấp trình soạn thảo nội dung CMS dựa trên **Tiptap Editor**, **Bootstrap 5**, và hệ thống **Media Management**. Package hoạt động với **Laravel + Blade** (không SPA).

## 🎯 Nguyên tắc cốt lõi

### Kiến trúc
- Đây là **Laravel Package** (không phải Laravel app), tuân thủ chuẩn package development
- Service Provider là entry point chính: `EditorServiceProvider.php`
- Mọi asset frontend được build qua Vite và publish vào Laravel host app
- Không phụ thuộc SPA framework (React, Vue) – chỉ dùng vanilla JS + Tiptap

### Ngôn ngữ & Framework
- **Backend**: PHP 8.2+, Laravel 11+
- **Frontend**: JavaScript ES6+ (vanilla), Tiptap v2, Bootstrap 5.3
- **Build tool**: Vite
- **Package manager**: Composer (PHP), npm (JS)

### Quy tắc code PHP
- Tuân thủ PSR-12 coding standard
- Sử dụng strict types: `declare(strict_types=1);`
- Type hints cho tất cả parameters và return types
- Namespace: `Suspended\TiptapEditor\`
- Sử dụng Laravel conventions (naming, structure)
- DocBlock cho tất cả public methods
- Không hardcode strings – dùng config hoặc constants

### Quy tắc code JavaScript
- ES6 modules (import/export)
- Không dùng jQuery
- Tiptap extensions viết theo pattern chuẩn của Tiptap v2
- Mỗi extension một file riêng trong `resources/js/editor/extensions/`
- Event-driven communication giữa editor và Laravel form

### Quy tắc HTML Output
- HTML output phải semantic, clean, SEO-friendly
- Sử dụng Bootstrap 5 classes chuẩn
- Không inline styles trong output (trừ trường hợp đặc biệt)
- Tất cả output phải escape XSS – không cho raw HTML tự do
- Mỗi node type có template render riêng (Blade partial)

### Bảo mật
- Sanitize tất cả input từ editor trước khi lưu
- Whitelist các HTML tags/attributes được phép
- Media upload: validate file type, size, dimensions
- CSRF protection cho tất cả routes
- Content Security Policy friendly (không inline scripts)

## 📁 Cấu trúc thư mục

```
laravel-tiptap-editor/
├── .github/                          # GitHub configs & docs
├── src/
│   ├── EditorServiceProvider.php     # Service Provider chính
│   ├── Facades/
│   │   └── TiptapEditor.php          # Facade
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── MediaUploadController.php
│   │   ├── Middleware/
│   │   │   └── ValidateMediaUpload.php
│   │   └── Requests/
│   │       └── MediaUploadRequest.php
│   ├── Services/
│   │   ├── HtmlRenderer.php          # JSON → HTML renderer
│   │   ├── JsonSanitizer.php         # Sanitize editor JSON
│   │   ├── MediaManager.php          # Quản lý media files
│   │   ├── ContentValidator.php      # Validate content schema
│   │   └── AiContentService.php      # AI content generation (optional)
│   ├── Contracts/
│   │   └── AiProviderInterface.php   # Contract for AI providers
│   ├── Services/Ai/
│   │   ├── OpenAiProvider.php        # OpenAI GPT implementation
│   │   ├── ClaudeProvider.php        # Anthropic Claude implementation
│   │   └── AiResponse.php            # AI response value object
│   ├── Models/
│   │   └── Media.php                 # Eloquent model cho media
│   ├── View/
│   │   └── Components/
│   │       └── TiptapEditor.php      # Blade component class
│   ├── Traits/
│   │   └── HasTiptapContent.php      # Trait cho Eloquent models
│   └── Support/
│       ├── NodeRegistry.php          # Registry các node types
│       └── ExtensionManager.php      # Quản lý extensions
├── config/
│   └── tiptap-editor.php             # Config file
├── database/
│   └── migrations/
│       └── create_media_table.php    # Migration cho media
├── resources/
│   ├── js/
│   │   └── editor/
│   │       ├── index.js              # Entry point
│   │       ├── Editor.js             # Editor class chính
│   │       ├── Toolbar.js            # Toolbar manager
│   │       ├── extensions/           # Tiptap extensions
│   │       │   ├── BootstrapRow.js
│   │       │   ├── BootstrapCol.js
│   │       │   ├── BootstrapAlert.js
│   │       │   ├── BootstrapCard.js
│   │       │   ├── BootstrapButton.js
│   │       │   ├── CustomImage.js
│   │       │   ├── CustomVideo.js
│   │       │   ├── Gallery.js
│   │       │   └── ControlledEmbed.js
│   │       ├── AiPanel.js                # AI content generation panel
│   │       └── utils/
│   │           ├── sanitizer.js
│   │           └── helpers.js
│   ├── css/
│   │   └── editor.css                # Editor styles
│   └── views/
│       ├── components/
│       │   └── tiptap-editor.blade.php
│       ├── toolbar/
│       │   └── toolbar.blade.php
│       └── renders/                  # HTML render templates
│           ├── paragraph.blade.php
│           ├── heading.blade.php
│           ├── image.blade.php
│           ├── video.blade.php
│           ├── bootstrap-row.blade.php
│           ├── bootstrap-col.blade.php
│           ├── alert.blade.php
│           └── card.blade.php
├── routes/
│   └── editor.php                    # Package routes
├── tests/
│   ├── Unit/
│   │   ├── HtmlRendererTest.php
│   │   ├── JsonSanitizerTest.php
│   │   └── ContentValidatorTest.php
│   ├── Feature/
│   │   ├── MediaUploadTest.php
│   │   └── EditorComponentTest.php
│   └── TestCase.php
├── stubs/                            # Publishable stubs
├── composer.json
├── package.json
├── vite.config.js
├── phpunit.xml
└── README.md
```

## 🔧 Conventions quan trọng

### Naming
- **PHP classes**: PascalCase (`HtmlRenderer`, `MediaManager`)
- **PHP methods**: camelCase (`renderNode()`, `uploadMedia()`)
- **JS files**: PascalCase cho classes (`Editor.js`), camelCase cho utils (`helpers.js`)
- **Blade views**: kebab-case (`bootstrap-row.blade.php`)
- **Config keys**: snake_case (`allowed_media_types`)
- **Routes**: kebab-case prefix `tiptap-editor` (`tiptap-editor.media.upload`)
- **Database**: snake_case (`content_json`, `created_at`)

### Tiptap Extension Pattern
```javascript
import { Node } from '@tiptap/core';

export const CustomNode = Node.create({
  name: 'customNode',
  group: 'block',
  content: 'block+',
  
  addAttributes() {
    return {
      // attributes here
    };
  },
  
  parseHTML() {
    return [{ tag: 'div[data-type="custom-node"]' }];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-type': 'custom-node', ...HTMLAttributes }, 0];
  },
});
```

### Blade Component Usage
```blade
<x-tiptap-editor 
    name="content" 
    :value="$post->content_json"
    :config="['toolbar' => ['bold', 'italic', 'heading', 'image']]"
/>
```

### HTML Renderer Pattern
```php
// Render JSON to HTML
$html = TiptapEditor::render($jsonContent);

// Hoặc dùng trait trong Model
$post->renderContent(); // returns safe HTML
```

## ⚠️ Lưu ý đặc biệt

1. **Không tạo SPA** – Editor là JS component mount vào DOM element trong Blade
2. **JSON là source of truth** – HTML chỉ là rendered output, có thể re-generate
3. **Mỗi node = 1 extension file** – Không gộp nhiều nodes vào 1 file
4. **Test coverage** – Mọi Service class phải có unit test
5. **Config driven** – Tính năng bật/tắt qua config, không hardcode
6. **Backward compatible** – Khi thay đổi JSON schema, phải có migration strategy
7. **Media**: Luôn validate và xử lý ảnh (resize, WebP) trước khi lưu
8. **i18n ready**: Toolbar labels và messages hỗ trợ đa ngôn ngữ qua Laravel trans()
9. **AI Content Generation** – Tính năng optional, bật/tắt qua config `ai.enabled`
10. **AI Providers** – Strategy pattern: OpenAI và Claude, dễ thêm provider mới
11. **AI Safety** – Sanitize prompts, rate limiting, token limits, content moderation

## 📚 Tài liệu tham khảo

- [Tiptap v2 Documentation](https://tiptap.dev/docs)
- [Laravel Package Development](https://laravel.com/docs/packages)
- [Bootstrap 5 Documentation](https://getbootstrap.com/docs/5.3)
- [Laravel Blade Components](https://laravel.com/docs/blade#components)
