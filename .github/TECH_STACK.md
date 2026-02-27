# TECH STACK & DEPENDENCIES

## Backend (PHP)

### Core
| Package | Version | Mục đích |
|---------|---------|----------|
| `php` | ^8.2 | Runtime |
| `laravel/framework` | ^11.0 | Framework host app requirement |
| `illuminate/support` | ^11.0 | Laravel collections, helpers |
| `illuminate/http` | ^11.0 | Request handling |
| `illuminate/routing` | ^11.0 | Route registration |
| `illuminate/view` | ^11.0 | Blade rendering |

### Suggested (Optional)
| Package | Mục đích |
|---------|----------|
| `intervention/image` | Image processing (resize, crop, WebP) |
| `league/flysystem` | File storage abstraction |
| `mews/purifier` | HTML purification (additional layer) |
| `openai-php/client` | OpenAI API client (for AI content generation) |
| `openai-php/laravel` | Laravel integration for OpenAI |
| `guzzlehttp/guzzle` | HTTP client (for Claude API calls) |

### Dev
| Package | Mục đích |
|---------|----------|
| `phpunit/phpunit` | Testing |
| `orchestra/testbench` | Laravel package testing |
| `phpstan/phpstan` | Static analysis |
| `laravel/pint` | Code style (PSR-12) |

---

## Frontend (JavaScript)

### Tiptap Core
| Package | Version | Mục đích |
|---------|---------|----------|
| `@tiptap/core` | ^2.x | Core editor engine |
| `@tiptap/pm` | ^2.x | ProseMirror dependencies |
| `@tiptap/starter-kit` | ^2.x | Basic extensions bundle |

### Tiptap Extensions
| Package | Mục đích |
|---------|----------|
| `@tiptap/extension-image` | Base image support |
| `@tiptap/extension-link` | Link management |
| `@tiptap/extension-placeholder` | Placeholder text |
| `@tiptap/extension-text-align` | Text alignment |
| `@tiptap/extension-underline` | Underline formatting |
| `@tiptap/extension-table` | Table support |
| `@tiptap/extension-table-row` | Table rows |
| `@tiptap/extension-table-cell` | Table cells |
| `@tiptap/extension-table-header` | Table headers |
| `@tiptap/extension-dropcursor` | Drop cursor indicator |
| `@tiptap/extension-gapcursor` | Gap cursor for navigation |
| `@tiptap/extension-hard-break` | Hard line breaks |
| `@tiptap/extension-horizontal-rule` | Horizontal rules |
| `@tiptap/extension-code-block-lowlight` | Code blocks (optional) |
| `@tiptap/extension-character-count` | Character counting |
| `@tiptap/extension-color` | Text color |
| `@tiptap/extension-highlight` | Text highlight |
| `@tiptap/extension-subscript` | Subscript text |
| `@tiptap/extension-superscript` | Superscript text |

### UI & Styling
| Package | Mục đích |
|---------|----------|
| `bootstrap` | ^5.3 – CSS framework (classes only, no JS needed) |
| `bootstrap-icons` | Icon font cho toolbar |

### Build Tools
| Package | Mục đích |
|---------|----------|
| `vite` | Build tool |
| `laravel-vite-plugin` | Laravel Vite integration |
| `eslint` | JS linting |

---

## Cấu hình Vite

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    build: {
        outDir: 'dist',
        lib: {
            entry: path.resolve(__dirname, 'resources/js/editor/index.js'),
            name: 'TiptapEditor',
            fileName: (format) => `tiptap-editor.${format}.js`,
            formats: ['es', 'umd'],
        },
        rollupOptions: {
            output: {
                assetFileNames: 'tiptap-editor.[ext]',
            },
        },
    },
    css: {
        preprocessorOptions: {},
    },
});
```

---

## PHP Version Requirements

| Feature | PHP Version |
|---------|-------------|
| Named arguments | 8.0+ |
| Enums | 8.1+ |
| Readonly properties | 8.1+ |
| Fibers | 8.1+ |
| Intersection types | 8.1+ |
| `readonly` classes | 8.2+ |
| DNF types | 8.2+ |

**Target: PHP 8.2+** để sử dụng đầy đủ modern PHP features.

---

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome | Last 2 versions |
| Firefox | Last 2 versions |
| Safari | Last 2 versions |
| Edge | Last 2 versions |

**Note:** ProseMirror (engine của Tiptap) yêu cầu modern browsers. IE11 không được hỗ trợ.
