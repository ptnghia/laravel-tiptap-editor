# JSON SCHEMA – Tiptap Editor Content

## Tổng quan

Content của editor được lưu dạng JSON theo chuẩn ProseMirror document model. Document này mô tả schema chi tiết cho tất cả node types.

## Document Root

```json
{
  "type": "doc",
  "content": [
    // Array of top-level block nodes
  ]
}
```

---

## Text Nodes

### Paragraph
```json
{
  "type": "paragraph",
  "attrs": {
    "textAlign": "left"  // left | center | right | justify
  },
  "content": [
    {
      "type": "text",
      "text": "Hello world",
      "marks": [
        { "type": "bold" },
        { "type": "italic" },
        { "type": "underline" },
        { "type": "strike" },
        { "type": "code" },
        { 
          "type": "link",
          "attrs": {
            "href": "https://example.com",
            "target": "_blank",
            "rel": "noopener noreferrer nofollow",
            "class": null
          }
        },
        {
          "type": "textStyle",
          "attrs": {
            "color": "#ff0000"
          }
        },
        {
          "type": "highlight",
          "attrs": {
            "color": "#ffff00"
          }
        }
      ]
    }
  ]
}
```

### Heading
```json
{
  "type": "heading",
  "attrs": {
    "level": 2,           // 1-6
    "textAlign": "left"   // left | center | right
  },
  "content": [
    { "type": "text", "text": "Section Title" }
  ]
}
```

### Bullet List
```json
{
  "type": "bulletList",
  "content": [
    {
      "type": "listItem",
      "content": [
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "text": "Item 1" }
          ]
        }
      ]
    }
  ]
}
```

### Ordered List
```json
{
  "type": "orderedList",
  "attrs": {
    "start": 1
  },
  "content": [
    {
      "type": "listItem",
      "content": [
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "text": "Step 1" }
          ]
        }
      ]
    }
  ]
}
```

### Blockquote
```json
{
  "type": "blockquote",
  "content": [
    {
      "type": "paragraph",
      "content": [
        { "type": "text", "text": "A wise quote..." }
      ]
    }
  ]
}
```

### Code Block
```json
{
  "type": "codeBlock",
  "attrs": {
    "language": "php"    // php | javascript | html | css | null
  },
  "content": [
    { "type": "text", "text": "echo 'hello';" }
  ]
}
```

### Horizontal Rule
```json
{
  "type": "horizontalRule"
}
```

### Hard Break
```json
{
  "type": "hardBreak"
}
```

---

## Layout Nodes

### Bootstrap Row
```json
{
  "type": "bootstrapRow",
  "attrs": {
    "gutter": 3           // 0-5 (Bootstrap g-* class)
  },
  "content": [
    // Only bootstrapCol nodes
  ]
}
```

### Bootstrap Column
```json
{
  "type": "bootstrapCol",
  "attrs": {
    "colClass": "col-md-6",     // Bootstrap column class
    "colSm": null,               // col-sm-*
    "colMd": 6,                  // col-md-*
    "colLg": null,               // col-lg-*
    "colXl": null                // col-xl-*
  },
  "content": [
    // Any block nodes (paragraph, heading, image, etc.)
  ]
}
```

**Rendered HTML:**
```html
<div class="row g-3">
  <div class="col-md-6">
    <p>Column 1 content</p>
  </div>
  <div class="col-md-6">
    <p>Column 2 content</p>
  </div>
</div>
```

---

## Bootstrap Component Nodes

### Alert
```json
{
  "type": "bootstrapAlert",
  "attrs": {
    "type": "info"        // primary | secondary | success | danger | warning | info | light | dark
  },
  "content": [
    { "type": "text", "text": "This is an alert message." }
  ]
}
```

**Rendered HTML:**
```html
<div class="alert alert-info" role="alert">
  This is an alert message.
</div>
```

### Card
```json
{
  "type": "bootstrapCard",
  "attrs": {
    "headerText": "Card Title",     // null = no header
    "footerText": null,             // null = no footer
    "borderColor": null             // primary | secondary | ... | null
  },
  "content": [
    // Block nodes trong card body
    {
      "type": "paragraph",
      "content": [
        { "type": "text", "text": "Card content here..." }
      ]
    }
  ]
}
```

**Rendered HTML:**
```html
<div class="card">
  <div class="card-header">Card Title</div>
  <div class="card-body">
    <p>Card content here...</p>
  </div>
</div>
```

### Button
```json
{
  "type": "bootstrapButton",
  "attrs": {
    "text": "Click me",
    "url": "https://example.com",
    "variant": "primary",         // primary | secondary | success | danger | warning | info | light | dark
    "size": null,                 // sm | lg | null (default)
    "outline": false,             // true = btn-outline-*
    "target": "_self"             // _self | _blank
  }
}
```

**Rendered HTML:**
```html
<a href="https://example.com" class="btn btn-primary" role="button">Click me</a>
```

### Badge (Inline)
```json
{
  "type": "bootstrapBadge",
  "attrs": {
    "text": "New",
    "variant": "primary",         // primary | secondary | success | ...
    "pill": false                 // true = rounded-pill
  }
}
```

### Callout
```json
{
  "type": "callout",
  "attrs": {
    "type": "tip",               // tip | warning | note | important | danger
    "title": "Pro Tip"           // null = no title
  },
  "content": [
    {
      "type": "paragraph",
      "content": [
        { "type": "text", "text": "Helpful information here." }
      ]
    }
  ]
}
```

---

## Media Nodes

### Image
```json
{
  "type": "customImage",
  "attrs": {
    "src": "/storage/media/2024/photo.webp",
    "alt": "Description of image",
    "title": "Image title",
    "caption": "Photo caption text",
    "width": 800,
    "height": 600,
    "alignment": "center",       // left | center | right
    "mediaId": 42,               // Reference to tiptap_media table
    "loading": "lazy"            // lazy | eager
  }
}
```

**Rendered HTML:**
```html
<figure class="text-center">
  <img 
    src="/storage/media/2024/photo.webp" 
    alt="Description of image" 
    title="Image title"
    width="800" 
    height="600" 
    loading="lazy"
    class="img-fluid"
  >
  <figcaption class="figure-caption">Photo caption text</figcaption>
</figure>
```

### Video
```json
{
  "type": "customVideo",
  "attrs": {
    "provider": "youtube",       // youtube | vimeo | mp4
    "videoId": "dQw4w9WgXcQ",   // Provider-specific ID
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "title": "Video title",
    "width": 560,
    "height": 315
  }
}
```

**Rendered HTML (YouTube):**
```html
<div class="ratio ratio-16x9">
  <iframe 
    src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ" 
    title="Video title"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
    allowfullscreen
    loading="lazy"
  ></iframe>
</div>
```

### Gallery
```json
{
  "type": "gallery",
  "attrs": {
    "columns": 3,               // 2 | 3 | 4
    "gap": 2,                   // Bootstrap gap class (g-*)
    "lightbox": true            // Enable lightbox on click
  },
  "content": [
    {
      "type": "galleryItem",
      "attrs": {
        "src": "/storage/media/2024/img1.webp",
        "alt": "Image 1",
        "mediaId": 43
      }
    },
    {
      "type": "galleryItem",
      "attrs": {
        "src": "/storage/media/2024/img2.webp",
        "alt": "Image 2",
        "mediaId": 44
      }
    }
  ]
}
```

---

## Controlled Embed

```json
{
  "type": "controlledEmbed",
  "attrs": {
    "provider": "twitter",       // twitter | codepen | gist | ...
    "url": "https://twitter.com/user/status/123456",
    "embedId": "123456"
  }
}
```

**Quy tắc bảo mật:** Chỉ cho phép embed từ các provider đã whitelist trong config. Không cho phép arbitrary iframe URLs.

---

## Table

```json
{
  "type": "table",
  "content": [
    {
      "type": "tableRow",
      "content": [
        {
          "type": "tableHeader",
          "attrs": { "colspan": 1, "rowspan": 1 },
          "content": [
            {
              "type": "paragraph",
              "content": [{ "type": "text", "text": "Header 1" }]
            }
          ]
        },
        {
          "type": "tableHeader",
          "attrs": { "colspan": 1, "rowspan": 1 },
          "content": [
            {
              "type": "paragraph",
              "content": [{ "type": "text", "text": "Header 2" }]
            }
          ]
        }
      ]
    },
    {
      "type": "tableRow",
      "content": [
        {
          "type": "tableCell",
          "attrs": { "colspan": 1, "rowspan": 1 },
          "content": [
            {
              "type": "paragraph",
              "content": [{ "type": "text", "text": "Cell 1" }]
            }
          ]
        },
        {
          "type": "tableCell",
          "attrs": { "colspan": 1, "rowspan": 1 },
          "content": [
            {
              "type": "paragraph",
              "content": [{ "type": "text", "text": "Cell 2" }]
            }
          ]
        }
      ]
    }
  ]
}
```

---

## Allowed Marks (Text formatting)

| Mark | Attributes | HTML Output |
|------|-----------|-------------|
| `bold` | - | `<strong>` |
| `italic` | - | `<em>` |
| `underline` | - | `<u>` |
| `strike` | - | `<s>` |
| `code` | - | `<code>` |
| `link` | href, target, rel, class | `<a>` |
| `textStyle` | color | `<span style="color:">` |
| `highlight` | color | `<mark>` |
| `subscript` | - | `<sub>` |
| `superscript` | - | `<sup>` |

---

## Validation Rules

1. **Document root** phải có `type: "doc"` và `content: array`
2. **Text nodes** phải có `text: string` (non-empty)
3. **Heading level** phải trong range 1-6
4. **Bootstrap column** tổng cột trong row ≤ 12
5. **Media src** phải là URL tương đối hoặc từ allowed domains
6. **Link href** không được chứa `javascript:`, `data:`, `vbscript:`
7. **Video provider** phải nằm trong whitelist
8. **Max nesting depth**: 10 levels
9. **Max document size**: configurable (default 500KB)
