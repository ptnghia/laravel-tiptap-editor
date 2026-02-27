# PHÂN TÍCH YÊU CẦU & ĐỀ XUẤT BỔ SUNG

## 1. Tóm tắt yêu cầu gốc

Xây dựng **Laravel Package** cung cấp trình soạn thảo CMS dựa trên:
- **Tiptap v2** – Headless rich text editor
- **Bootstrap 5** – Layout & UI components
- **Media Management** – Upload, quản lý hình ảnh, video

### Yêu cầu chức năng chính
1. Rich text editing (bold, italic, heading, list, blockquote, code)
2. Bootstrap Grid layout (row/column chia cột responsive)
3. Bootstrap Components (Alert, Card, Button, Badge, Callout)
4. Media management (Image upload, Video embed, Gallery)
5. JSON storage (source of truth) + HTML rendering (display/SEO)
6. Blade component integration (`<x-tiptap-editor>`)
7. Package distribution (Composer install, config publish)

### Yêu cầu kỹ thuật
- PHP 8.2+, Laravel 11+
- Vanilla JS (không SPA)
- XSS prevention, content sanitization
- SEO-friendly HTML output

---

## 2. Phân tích điểm mạnh của kế hoạch gốc

| Điểm mạnh | Chi tiết |
|-----------|---------|
| ✅ Kiến trúc rõ ràng | Tách biệt rõ ràng giữa editor (JS), backend (PHP), rendering |
| ✅ JSON-first approach | JSON là source of truth, HTML là derived output |
| ✅ Package-oriented | Thiết kế ngay từ đầu để đóng gói thành package |
| ✅ Security conscious | Đề cập XSS, sanitization, controlled embeds |
| ✅ Bootstrap integration | Sử dụng Bootstrap classes chuẩn, không custom CSS framework |
| ✅ Phased development | Chia rõ phases, rollout từng bước |

---

## 3. Phân tích gaps & đề xuất bổ sung

### 3.1 🔴 Critical Gaps (Cần bổ sung ngay)

#### A. Content Sanitization Strategy
**Gap:** Kế hoạch gốc chỉ nói "chống XSS" nhưng chưa chi tiết chiến lược sanitization.

**Đề xuất:**
- Tạo `JsonSanitizer` service với whitelist-based approach
- Tạo `ContentValidator` để validate JSON schema
- Tạo `NodeRegistry` quản lý allowed node types
- Sanitize ở cả client-side (JS) và server-side (PHP)
- Server-side sanitization là bắt buộc, client-side là defense-in-depth

#### B. Testing Strategy
**Gap:** Không có kế hoạch testing cụ thể.

**Đề xuất:**
- PHPUnit cho unit tests (Services) + feature tests (Controllers, Components)
- Orchestra Testbench cho package testing trong Laravel context
- Target coverage: 80%+ cho Services
- Test cases quan trọng: sanitization, rendering, media validation

#### C. Link Management
**Gap:** Không đề cập quản lý links.

**Đề xuất:**
- Tiptap Link extension với custom attributes
- Support: href, target (_blank/_self), rel (nofollow, noopener), class
- URL validation (chặn javascript:, data:)
- Optional: Internal link picker (chọn từ danh sách pages)

#### D. Code Block Support
**Gap:** Không có code block trong danh sách extensions.

**Đề xuất:**
- Sử dụng `@tiptap/extension-code-block-lowlight`
- Syntax highlighting cho các ngôn ngữ phổ biến
- Clean `<pre><code>` HTML output

---

### 3.2 🟡 Important Gaps (Nên bổ sung)

#### E. Table Support
**Gap:** Tables là feature rất phổ biến trong CMS nhưng không có trong kế hoạch.

**Đề xuất:**
- Integrate `@tiptap/extension-table` + related extensions
- Add/remove rows & columns
- Cell merging (colspan, rowspan)
- Bootstrap table classes: `table`, `table-striped`, `table-bordered`
- Responsive wrapper: `table-responsive`

#### F. Slash Commands (Notion-style)
**Gap:** Không có mechanism cho user khám phá features.

**Đề xuất:**
- Type `/` để mở command menu
- Search/filter: heading, image, row, alert, table, etc.
- Keyboard navigation (↑/↓ to select, Enter to insert)
- Giúp user không cần nhớ toolbar buttons

#### G. Block Menu (Floating)
**Gap:** Thiếu UX cho thao tác với block nodes.

**Đề xuất:**
- Hover block → hiện menu icon bên trái
- Actions: Duplicate, Delete, Move Up, Move Down
- Drag handle cho drag & drop reorder
- Change block type (paragraph → heading, etc.)

#### H. Internationalization (i18n)
**Gap:** Không đề cập multi-language support cho UI.

**Đề xuất:**
- Laravel translation files: `lang/en/tiptap-editor.php`, `lang/vi/tiptap-editor.php`
- Toolbar button labels, modal titles, error messages
- Default: Vietnamese + English
- Extensible: user có thể publish và thêm ngôn ngữ

#### I. Accessibility (a11y)
**Gap:** Không đề cập accessibility.

**Đề xuất:**
- ARIA labels cho tất cả toolbar buttons
- Keyboard navigation: Tab through toolbar, Enter to activate
- Screen reader announcements cho content changes
- Focus management trong modals
- WCAG 2.1 AA compliance target
- High contrast mode support

#### J. Image Optimization
**Gap:** Kế hoạch gốc có đề cập upload nhưng chưa chi tiết optimization.

**Đề xuất:**
- Auto-resize images vượt max dimensions
- WebP conversion (configurable)
- Generate multiple sizes: thumbnail (150px), medium (600px), large (1200px)
- Lazy loading attribute: `loading="lazy"`
- `srcset` support cho responsive images
- EXIF data stripping (privacy)

---

### 3.3 🟢 Nice-to-have Gaps

#### K. Content Import/Export
**Đề xuất:**
- Paste from Word: Clean HTML → JSON conversion
- Paste from web: Sanitize & convert
- Export: JSON → Markdown, JSON → HTML file

#### L. Version History
**Đề xuất:**
- Save content versions on update (configurable: last N versions)
- Diff comparison UI
- Restore previous version
- Implementation: separate `tiptap_content_versions` table

#### M. Responsive Preview
**Đề xuất:**
- Preview content at different breakpoints
- Desktop (1200px), Tablet (768px), Mobile (375px)
- Quan trọng cho Bootstrap layout verification

#### N. Dark Mode
**Đề xuất:**
- CSS custom properties cho theming
- Auto-detect system preference: `prefers-color-scheme`
- Manual toggle option
- Không ảnh hưởng rendered output (chỉ editor UI)

#### O. Media Browser
**Đề xuất:**
- Browse existing uploaded media (không chỉ upload mới)
- Grid/list view toggle
- Filter by type (image, video)
- Search by filename, alt text
- Pagination

#### P. AI Content Generation 🤖
**Yêu cầu mới:** Sinh nội dung bằng AI (OpenAI / Claude) trực tiếp trong editor.

**Phân tích:**
- Đây là tính năng **nâng cao, configurable** (bật/tắt qua config)
- Package không bắt buộc cài SDK AI – chỉ khi enabled mới cần API key
- Hỗ trợ nhiều provider qua strategy pattern (dễ mở rộng)
- Cần xử lý: rate limiting, cost control, prompt injection prevention

**Kiến trúc đề xuất:**
```
[Editor UI] → AI Panel (textarea + options)
    ↓
[AJAX POST] → /tiptap-editor/ai/generate
    ↓
[AiContentController] → validate + rate limit
    ↓
[AiContentService] → chọn provider (OpenAI/Claude)
    ↓
[AiProvider] → gọi API + parse response
    ↓
[Response] → HTML/JSON content
    ↓
[Editor] → preview → chèn vào editor
```

**Các actions AI hỗ trợ:**
1. **Generate** – Sinh nội dung mới từ prompt mô tả
2. **Refine** – Viết lại, mở rộng, rút gọn nội dung đã có
3. **Summarize** – Tóm tắt nội dung
4. **Translate** – Dịch thuật nội dung
5. **Grammar Fix** – Sửa lỗi ngữ pháp

**Rủi ro & giải pháp:**
- **Prompt injection** → Sanitize prompts, hardcode system prompt
- **Chi phí API** → Rate limiting, token limits, usage tracking
- **Nội dung không phù hợp** → Content moderation layer
- **API downtime** → Graceful error handling, retry logic
- **Latency** → Streaming (SSE) cho UX tốt hơn

---

## 4. Rủi ro và giải pháp

| Rủi ro | Mức độ | Giải pháp |
|--------|--------|-----------|
| **XSS qua editor content** | 🔴 Cao | Server-side sanitization bắt buộc, whitelist approach |
| **File upload abuse** | 🔴 Cao | File type whitelist, size limits, rate limiting |
| **AI prompt injection** | 🔴 Cao | Sanitize prompts, hardcode system prompt, không cho user override |
| **AI API cost overrun** | 🟡 Trung bình | Rate limiting per user, token limits, daily caps |
| **Large JSON content** | 🟡 Trung bình | Max content size limit, database LONGTEXT |
| **Browser compatibility** | 🟡 Trung bình | Target modern browsers only, polyfill nếu cần |
| **Tiptap breaking changes** | 🟡 Trung bình | Pin version, thorough testing trước upgrade |
| **Performance với complex layouts** | 🟡 Trung bình | Lazy rendering, virtualization cho large docs |
| **Bootstrap version upgrade** | 🟢 Thấp | CSS class-based, dễ adapt |

---

## 5. Kiến nghị ưu tiên triển khai

### Batch 1 – Foundation (Must Have)
1. Project Setup (Phase 0)
2. Core Editor MVP (Phase 1)
3. Content Safety – Sanitizer & Validator (Phase 6)

### Batch 2 – Layout & Components
4. Bootstrap Layout (Phase 2)
5. Bootstrap Components (Phase 3)

### Batch 3 – Media & Rendering
6. Media Management (Phase 4)
7. HTML Rendering (Phase 5)

### Batch 4 – Polish & Ship
8. Table support, Link management, Code blocks
9. i18n & Accessibility
10. Package Distribution (Phase 7)
11. Documentation

### Batch 5 – Enhancement
12. Slash Commands & Block Menu
13. Responsive Preview
14. Version History
15. Dark Mode

### Batch 6 – AI Integration
16. AI Content Generation (sinh nội dung từ prompt)
17. AI Refinement (rewrite, expand, shorten, grammar fix)
18. AI Streaming (SSE real-time output)

---

## 6. Kết luận

Kế hoạch gốc có nền tảng tốt. Các đề xuất bổ sung tập trung vào:
1. **An toàn hơn**: Sanitization strategy chi tiết, content validation
2. **Đầy đủ hơn**: Table, Code block, Link management
3. **UX tốt hơn**: Slash commands, Block menu, Accessibility
4. **Chuyên nghiệp hơn**: Testing, i18n, Dark mode
5. **Thực tế hơn**: Image optimization, Version history
6. **Thông minh hơn**: AI Content Generation tích hợp trực tiếp, hỗ trợ nhiều provider

Ưu tiên cao nhất: **Security (sanitization) > Core features > UX enhancements > AI features > Nice-to-haves**
