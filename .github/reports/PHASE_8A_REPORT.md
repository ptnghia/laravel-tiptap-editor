# Phase 8A Report – Slash Commands, Block Menu & Gallery

**Date**: 2025-07-15  
**Status**: ✅ Complete  
**Tests**: 190 tests, 398 assertions (all passing)  
**Build**: 77 modules (Vite)

---

## Overview

Phase 8A adds three major UX features to the editor:

1. **Slash Commands** – Type `/` to open an inline command palette for quick block insertion
2. **Block Menu** – Floating drag handle with context menu for block manipulation (duplicate, move, delete, transform)
3. **Gallery** – Multi-image gallery node with responsive grid layout and optional lightbox

All features are implemented in vanilla JavaScript (no React/Vue), following the project's architecture constraints.

---

## Files Created

### JavaScript
| File | Description |
|------|-------------|
| `resources/js/editor/extensions/Gallery.js` | Gallery + GalleryImage Tiptap nodes |
| `resources/js/editor/extensions/SlashCommands.js` | Slash commands extension using `@tiptap/suggestion` |
| `resources/js/editor/BlockMenu.js` | Block-level context menu with drag handle |

### Blade Templates
| File | Description |
|------|-------------|
| `resources/views/renders/gallery.blade.php` | Gallery HTML render template |
| `resources/views/renders/gallery-image.blade.php` | Gallery image item render template |

### Tests
| File | Tests |
|------|-------|
| `tests/Unit/Services/GalleryRenderTest.php` | 14 tests (rendering, sanitization, NodeRegistry) |

---

## Files Modified

### JavaScript
| File | Changes |
|------|---------|
| `resources/js/editor/Editor.js` | Added Gallery, SlashCommands, BlockMenu imports + integration |
| `resources/js/editor/Toolbar.js` | Added gallery button + `_handleGallery()` multi-upload handler |
| `resources/js/editor/index.js` | Added BlockMenu to exports |

### PHP
| File | Changes |
|------|---------|
| `src/Services/HtmlRenderer.php` | Added `renderGallery()` and `renderGalleryImage()` methods |
| `src/Support/NodeRegistry.php` | Added gallery/galleryImage schemas; updated doc + bootstrapCol children |

### CSS
| File | Changes |
|------|---------|
| `resources/css/editor.css` | ~200 lines: slash menu, block handle, gallery editor styles |

### Config
| File | Changes |
|------|---------|
| `config/tiptap-editor.php` | Uncommented `gallery`, added `slashCommands` |

---

## Architecture Decisions

### 1. Slash Commands – `@tiptap/suggestion` Plugin
- Uses `@tiptap/suggestion@^2.11.0` (v2 compatible) with custom `PluginKey`
- Trigger character: `/`
- 18 default commands across 7 groups: Text, Lists, Blocks, Media, Insert, Layout, Components
- Pure vanilla JS popup renderer with keyboard nav (ArrowUp/Down/Enter/Escape) and mouse support
- Auto-positioning: flips above cursor near viewport bottom, adjusts horizontal overflow
- Configurable: custom commands via `options.commands`, custom filter via `options.filterFn`

### 2. Block Menu – DOM-based Floating Handle
- Grip handle (`bi-grip-vertical`) appears on hover over any top-level block
- Context menu actions: Duplicate, Move Up, Move Down, Delete
- "Turn Into" section: Paragraph, H1-H3, BulletList, OrderedList, Blockquote, CodeBlock
- Position resolution: `editor.view.posAtDOM()` + `doc.resolve(pos).before(1)`
- Handles edge cases: scroll hiding, click-outside closing, Escape key

### 3. Gallery – Nested Node Structure
- `Gallery` node contains `GalleryImage` children (1+)
- Attributes: columns (2/3/4/6), gap (0-5), lightbox (boolean)
- `GalleryImage` is atom node: src, alt, colClass
- Toolbar handler: multi-file upload with auto column detection
- Slash commands → image insertion uses CustomEvent `tiptap:insert-image` delegation

### 4. Image Upload via Slash Commands
- Slash command "Image" dispatches `tiptap:insert-image` CustomEvent
- Editor.js listens for this event and delegates to `toolbar._handleImage()`
- Clean separation: slash commands don't need to know toolbar internals

---

## npm Packages Added

| Package | Version | Purpose |
|---------|---------|---------|
| `@tiptap/suggestion` | ^2.11.0 | Slash commands suggestion engine |
| `@tiptap/extension-bubble-menu` | ^2.11.0 | Future use (bubble menu) |
| `@tiptap/extension-floating-menu` | ^2.11.0 | Future use (floating menu) |

> Note: Explicit `@^2.11.0` version constraint required – `@latest` resolves to v3 which has peer dependency conflict with `@tiptap/core@^2.x`.

---

## Test Results

```
PHPUnit 11.5.55
OK (190 tests, 398 assertions)
```

### New Tests (GalleryRenderTest)
- ✅ Renders basic gallery with images
- ✅ Renders gallery with lightbox
- ✅ Renders gallery with 2 columns
- ✅ Gallery defaults invalid columns to 3
- ✅ Gallery clamps gap to valid range
- ✅ Renders gallery image with all attrs
- ✅ Gallery image skips empty src
- ✅ Gallery image sanitizes invalid col class
- ✅ Gallery image defaults col class
- ✅ Node registry knows gallery types
- ✅ Node registry gallery allowed attributes
- ✅ Node registry gallery allowed children
- ✅ Doc allows gallery as child
- ✅ Bootstrap col allows gallery as child

---

## Cumulative Progress

| Phase | Status | Tests |
|-------|--------|-------|
| Phase 0 – Project Setup | ✅ | 2 |
| Phase 1 – Core Editor MVP | ✅ | 22 |
| Phase 2 – Bootstrap Layout | ✅ | 9 |
| Phase 3 – Bootstrap Components | ✅ | 15 |
| Phase 4 – Media Management | ✅ | 10 |
| Phase 5 – HTML Rendering | ✅ | 28 |
| Phase 6 – Content Safety | ✅ | 39 |
| Phase 9 – AI Content | ✅ | 52 |
| **Phase 8A – Slash/Block/Gallery** | **✅** | **14** |
| **Total** | | **190** |
