# PHASE 0 – PROJECT SETUP CHECKLIST
## Hướng dẫn khởi tạo dự án chi tiết

Đây là checklist chi tiết để Copilot triển khai Phase 0 – thiết lập toàn bộ cấu trúc dự án.

---

## Step 1: Composer Package

### 1.1 composer.json
```json
{
    "name": "suspended/laravel-tiptap-editor",
    "description": "A Laravel package providing a Tiptap-based rich text editor with Bootstrap 5 layout and media management",
    "type": "library",
    "license": "MIT",
    "authors": [
        {
            "name": "Suspended",
            "email": "your-email@example.com"
        }
    ],
    "require": {
        "php": "^8.2",
        "illuminate/support": "^11.0|^12.0",
        "illuminate/http": "^11.0|^12.0",
        "illuminate/routing": "^11.0|^12.0",
        "illuminate/view": "^11.0|^12.0",
        "illuminate/database": "^11.0|^12.0"
    },
    "require-dev": {
        "phpunit/phpunit": "^11.0",
        "orchestra/testbench": "^9.0",
        "laravel/pint": "^1.0",
        "phpstan/phpstan": "^1.0"
    },
    "suggest": {
        "intervention/image": "Required for image processing (resize, WebP conversion)"
    },
    "autoload": {
        "psr-4": {
            "Suspended\\TiptapEditor\\": "src/"
        }
    },
    "autoload-dev": {
        "psr-4": {
            "Suspended\\TiptapEditor\\Tests\\": "tests/"
        }
    },
    "extra": {
        "laravel": {
            "providers": [
                "Suspended\\TiptapEditor\\EditorServiceProvider"
            ],
            "aliases": {
                "TiptapEditor": "Suspended\\TiptapEditor\\Facades\\TiptapEditor"
            }
        }
    },
    "minimum-stability": "stable",
    "prefer-stable": true,
    "config": {
        "sort-packages": true
    }
}
```

### 1.2 Tạo thư mục
```
src/
├── Facades/
├── Http/
│   ├── Controllers/
│   ├── Middleware/
│   └── Requests/
├── Services/
├── Models/
├── View/
│   └── Components/
├── Traits/
└── Support/

config/
database/
└── migrations/
resources/
├── js/
│   └── editor/
│       ├── extensions/
│       └── utils/
├── css/
└── views/
    ├── components/
    ├── toolbar/
    └── renders/
routes/
tests/
├── Unit/
│   └── Services/
├── Feature/
└── TestCase.php
stubs/
dist/
```

---

## Step 2: Service Provider

### EditorServiceProvider.php
- Boot: load routes, views, migrations, translations
- Register: bind services to container
- Publish groups:
  - `tiptap-editor-config` → config file
  - `tiptap-editor-views` → Blade views
  - `tiptap-editor-assets` → JS/CSS from dist/
  - `tiptap-editor-migrations` → Database migrations

---

## Step 3: Config File

### config/tiptap-editor.php
Sections:
- `extensions` – Array of enabled extensions
- `toolbar` – Toolbar groups and buttons
- `media` – Upload settings (disk, max_size, allowed_types, image_sizes)
- `sanitization` – Allowed tags, attributes, node types
- `rendering` – Cache settings, minify option
- `routes` – Route prefix, middleware

---

## Step 4: NPM Package

### package.json
Dependencies:
- `@tiptap/core`, `@tiptap/pm`, `@tiptap/starter-kit`
- `@tiptap/extension-image`, `@tiptap/extension-link`, `@tiptap/extension-placeholder`
- `@tiptap/extension-table`, `@tiptap/extension-text-align`
- `@tiptap/extension-underline`, `@tiptap/extension-color`, `@tiptap/extension-highlight`
- `@tiptap/extension-code-block-lowlight`
- `@tiptap/extension-character-count`
- `@tiptap/extension-dropcursor`, `@tiptap/extension-gapcursor`
- `@tiptap/extension-subscript`, `@tiptap/extension-superscript`
- `bootstrap-icons`

DevDependencies:
- `vite`
- `eslint`

---

## Step 5: Vite Config

### vite.config.js
- Entry: `resources/js/editor/index.js`
- Output: `dist/` (ES + UMD formats)
- CSS output: `dist/tiptap-editor.css`

---

## Step 6: Development Files

### .gitignore
```
/node_modules
/vendor
/dist
.phpunit.cache
.phpunit.result.cache
*.log
.DS_Store
```

### .editorconfig
```
root = true

[*]
charset = utf-8
end_of_line = lf
indent_size = 4
indent_style = space
insert_final_newline = true
trim_trailing_whitespace = true

[*.{js,json,yml,yaml}]
indent_size = 2

[*.md]
trim_trailing_whitespace = false
```

### phpunit.xml
- Test suites: Unit, Feature
- Coverage config targeting src/

---

## Step 7: Test Base

### tests/TestCase.php
- Extend Orchestra\Testbench\TestCase
- Load EditorServiceProvider
- Setup helpers

---

## Step 8: README.md
- Package name & description
- Requirements
- Installation (Composer + npm)
- Basic usage example
- Configuration
- Available extensions
- License

---

## Verification Checklist

Sau khi hoàn thành Phase 0, verify:

- [ ] `composer validate` passes
- [ ] Package can be required in a Laravel app
- [ ] Service Provider auto-discovered
- [ ] Config publishable: `artisan vendor:publish --tag=tiptap-editor-config`
- [ ] Views publishable: `artisan vendor:publish --tag=tiptap-editor-views`
- [ ] `npm install` succeeds
- [ ] `npm run build` succeeds (even if minimal output)
- [ ] PHPUnit runs (even with 0 tests)
- [ ] Blade component `<x-tiptap-editor>` renders (even if empty)
