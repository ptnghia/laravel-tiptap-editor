# CODING CONVENTIONS

## PHP Conventions

### General
- **Standard**: PSR-12
- **Strict types**: Bắt buộc `declare(strict_types=1);` ở mọi file
- **Namespace root**: `Suspended\TiptapEditor\`
- **PHP version**: 8.2+ (sử dụng readonly, enums, DNF types khi phù hợp)

### Naming

| Element | Convention | Ví dụ |
|---------|-----------|-------|
| Class | PascalCase | `HtmlRenderer`, `MediaManager` |
| Method | camelCase | `renderNode()`, `uploadMedia()` |
| Property | camelCase | `$nodeRegistry`, `$allowedTypes` |
| Constant | UPPER_SNAKE | `MAX_UPLOAD_SIZE`, `DEFAULT_QUALITY` |
| Config key | snake_case | `allowed_media_types`, `max_file_size` |
| Route name | kebab-case, dot notation | `tiptap-editor.media.upload` |
| Database column | snake_case | `content_json`, `created_at` |
| Migration | snake_case | `create_tiptap_media_table` |

### DocBlocks
```php
/**
 * Render a JSON document node to HTML.
 *
 * @param  array<string, mixed>  $node  The node data from Tiptap JSON
 * @param  int  $depth  Current nesting depth
 * @return string  Rendered HTML string
 *
 * @throws \InvalidArgumentException  When node type is not registered
 */
public function renderNode(array $node, int $depth = 0): string
```

### Method Length
- Target: ≤ 20 lines per method
- Nếu dài hơn → extract helper methods
- Single Responsibility cho mỗi method

### Return Types
```php
// ✅ DO: Always specify return type
public function render(array $json): string
public function upload(UploadedFile $file): Media
public function validate(array $content): bool
public function findById(int $id): ?Media

// ❌ DON'T: Missing return type
public function render($json)
```

### Error Handling
```php
// ✅ DO: Specific exceptions
throw new InvalidNodeTypeException("Unknown node type: {$type}");
throw new MediaUploadException("File exceeds maximum size");

// ❌ DON'T: Generic exceptions
throw new \Exception("Something went wrong");
```

---

## JavaScript Conventions

### General
- **Modules**: ES6 `import`/`export`
- **No jQuery**: Vanilla JS only
- **No TypeScript**: Plain JS (giữ đơn giản cho package)
- **Semicolons**: Required
- **Quotes**: Single quotes `'`
- **Indentation**: 2 spaces

### Naming

| Element | Convention | Ví dụ |
|---------|-----------|-------|
| Class | PascalCase | `Editor`, `Toolbar` |
| File (class) | PascalCase | `Editor.js`, `BootstrapRow.js` |
| File (util) | camelCase | `helpers.js`, `sanitizer.js` |
| Function | camelCase | `insertRow()`, `getJSON()` |
| Variable | camelCase | `editorInstance`, `toolbarConfig` |
| Constant | UPPER_SNAKE | `MAX_COLUMNS`, `DEFAULT_GUTTER` |
| CSS class | kebab-case | `tiptap-editor`, `toolbar-group` |
| Data attribute | kebab-case | `data-editor-config`, `data-node-type` |

### Tiptap Extension Pattern
```javascript
import { Node } from '@tiptap/core';

export const BootstrapAlert = Node.create({
  name: 'bootstrapAlert',

  group: 'block',

  content: 'inline*',

  addAttributes() {
    return {
      type: {
        default: 'info',
        parseHTML: (element) => element.getAttribute('data-alert-type'),
        renderHTML: (attributes) => ({
          'data-alert-type': attributes.type,
          class: `alert alert-${attributes.type}`,
        }),
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'div[data-type="bootstrap-alert"]' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-type': 'bootstrap-alert', ...HTMLAttributes }, 0];
  },

  addCommands() {
    return {
      setAlert: (attributes) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: attributes,
        });
      },
    };
  },
});
```

### Event Naming
```javascript
// Custom events: 'tiptap-editor:' prefix
document.dispatchEvent(new CustomEvent('tiptap-editor:change', { detail: { json } }));
document.dispatchEvent(new CustomEvent('tiptap-editor:media-upload', { detail: { file } }));
document.dispatchEvent(new CustomEvent('tiptap-editor:ready', { detail: { editor } }));
```

---

## Blade Conventions

### Naming
| Element | Convention | Ví dụ |
|---------|-----------|-------|
| View file | kebab-case | `bootstrap-row.blade.php` |
| Component | kebab-case prefix | `<x-tiptap-editor>` |
| Variable | camelCase | `$nodeContent`, `$alertType` |

### Render Template Pattern
```blade
{{-- resources/views/renders/alert.blade.php --}}
@props(['type' => 'info', 'content' => ''])

<div class="alert alert-{{ $type }}" role="alert">
    {!! $content !!}
</div>
```

### Component Pattern
```blade
{{-- resources/views/components/tiptap-editor.blade.php --}}
@props([
    'name' => 'content',
    'value' => null,
    'config' => [],
    'placeholder' => '',
    'disabled' => false,
])

<div 
    class="tiptap-editor-wrapper"
    data-tiptap-editor
    data-config="{{ json_encode($config) }}"
    @if($disabled) data-disabled @endif
>
    @include('tiptap-editor::toolbar.toolbar')
    
    <div class="tiptap-editor-content" data-tiptap-content>
        {{-- Editor mounts here --}}
    </div>
    
    <input 
        type="hidden" 
        name="{{ $name }}" 
        value="{{ old($name, is_array($value) ? json_encode($value) : $value) }}"
        data-tiptap-input
    >
</div>
```

---

## CSS Conventions

### Naming: BEM-like with prefix
```css
/* Block */
.tiptap-editor { }

/* Element */
.tiptap-editor__toolbar { }
.tiptap-editor__content { }
.tiptap-editor__status { }

/* Modifier */
.tiptap-editor--focused { }
.tiptap-editor--disabled { }
.tiptap-editor--fullscreen { }

/* Toolbar elements */
.tiptap-toolbar { }
.tiptap-toolbar__group { }
.tiptap-toolbar__button { }
.tiptap-toolbar__button--active { }
.tiptap-toolbar__separator { }
```

### CSS Variables (Theming)
```css
:root {
    --tiptap-border-color: #dee2e6;
    --tiptap-border-radius: 0.375rem;
    --tiptap-bg-color: #ffffff;
    --tiptap-text-color: #212529;
    --tiptap-toolbar-bg: #f8f9fa;
    --tiptap-focus-color: #0d6efd;
    --tiptap-placeholder-color: #6c757d;
    --tiptap-font-family: system-ui, -apple-system, sans-serif;
    --tiptap-font-size: 1rem;
    --tiptap-line-height: 1.6;
}
```

---

## Testing Conventions

### PHP Tests
```php
// Naming: test_{method}_{scenario}_{expected_result}
public function test_renderNode_withParagraph_returnsHtmlParagraph(): void
public function test_sanitize_withScriptTag_removesScript(): void
public function test_upload_withOversizedFile_throwsException(): void

// Use data providers for multiple cases
#[DataProvider('validNodeTypes')]
public function test_renderNode_withValidType_rendersCorrectly(
    string $type, 
    array $attrs, 
    string $expectedHtml
): void {
    // ...
}
```

### Directory Structure
```
tests/
├── Unit/
│   ├── Services/
│   │   ├── HtmlRendererTest.php
│   │   ├── JsonSanitizerTest.php
│   │   ├── ContentValidatorTest.php
│   │   └── MediaManagerTest.php
│   └── Support/
│       └── NodeRegistryTest.php
├── Feature/
│   ├── MediaUploadTest.php
│   ├── EditorComponentTest.php
│   └── RenderingTest.php
└── TestCase.php
```

---

## Git Conventions

### Commit Messages
```
feat: add BootstrapAlert extension
fix: resolve XSS vulnerability in HTML renderer
docs: update installation guide
refactor: extract node rendering logic
test: add JsonSanitizer unit tests
chore: update Tiptap dependencies
style: fix PSR-12 violations
```

### Branch Naming
```
feature/bootstrap-layout
feature/media-upload
fix/xss-sanitizer
docs/api-reference
refactor/html-renderer
```
