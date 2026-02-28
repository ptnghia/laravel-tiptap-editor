<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Services;

use Suspended\TiptapEditor\Support\NodeRegistry;

class HtmlRenderer
{
    /**
     * Create a new HtmlRenderer instance.
     */
    public function __construct(
        protected NodeRegistry $nodeRegistry,
    ) {
    }

    /**
     * Render Tiptap JSON content to safe HTML.
     *
     * @param  array<string, mixed>|string  $content  Tiptap JSON (array or JSON string)
     * @return string  Rendered HTML
     */
    public function render(array|string $content): string
    {
        if (is_string($content)) {
            $content = json_decode($content, true) ?? [];
        }

        if (empty($content) || ! isset($content['type'])) {
            return '';
        }

        return $this->renderNode($content);
    }

    /**
     * Render a single node and its children recursively.
     *
     * @param  array<string, mixed>  $node
     */
    protected function renderNode(array $node): string
    {
        $type = $node['type'] ?? '';
        $content = $node['content'] ?? [];
        $attrs = $node['attrs'] ?? [];
        $marks = $node['marks'] ?? [];
        $text = $node['text'] ?? null;

        // Text node
        if ($type === 'text') {
            $html = e($text ?? '');

            return $this->applyMarks($html, $marks);
        }

        // Render children
        $childrenHtml = '';
        foreach ($content as $child) {
            $childrenHtml .= $this->renderNode($child);
        }

        // Check for custom renderer
        $customRenderer = $this->nodeRegistry->getRenderer($type);
        if ($customRenderer !== null) {
            if (is_callable($customRenderer)) {
                return $customRenderer($node, $childrenHtml);
            }
            // String: blade view name
            /** @var \Illuminate\View\View $view */
            $view = view($customRenderer, compact('node', 'childrenHtml', 'attrs'));

            return $view->render();
        }

        // Default node rendering – will be extended in Phase 5
        return $this->renderDefaultNode($type, $attrs, $childrenHtml);
    }

    /**
     * Default node type → HTML mapping.
     *
     * @param  array<string, mixed>  $attrs
     */
    protected function renderDefaultNode(string $type, array $attrs, string $childrenHtml): string
    {
        return match ($type) {
            'doc' => $childrenHtml,
            'paragraph' => $this->renderParagraph($attrs, $childrenHtml),
            'heading' => $this->renderHeading($attrs, $childrenHtml),
            'bulletList' => "<ul>{$childrenHtml}</ul>",
            'orderedList' => $this->renderOrderedList($attrs, $childrenHtml),
            'listItem' => "<li>{$childrenHtml}</li>",
            'blockquote' => "<blockquote>{$childrenHtml}</blockquote>",
            'codeBlock' => $this->renderCodeBlock($attrs, $childrenHtml),
            'horizontalRule' => '<hr>',
            'hardBreak' => '<br>',
            'bootstrapRow' => $this->renderBootstrapRow($attrs, $childrenHtml),
            'bootstrapCol' => $this->renderBootstrapCol($attrs, $childrenHtml),
            'bootstrapAlert' => $this->renderBootstrapAlert($attrs, $childrenHtml),
            'bootstrapCard' => $this->renderBootstrapCard($attrs, $childrenHtml),
            'bootstrapButton' => $this->renderBootstrapButton($attrs),
            'customImage' => $this->renderCustomImage($attrs),
            'customVideo' => $this->renderCustomVideo($attrs),
            'gallery' => $this->renderGallery($attrs, $childrenHtml),
            'galleryImage' => $this->renderGalleryImage($attrs),
            'table' => "<table class=\"table\">{$childrenHtml}</table>",
            'tableRow' => "<tr>{$childrenHtml}</tr>",
            'tableHeader' => $this->renderTableCell($attrs, $childrenHtml, 'th'),
            'tableCell' => $this->renderTableCell($attrs, $childrenHtml, 'td'),
            default => $childrenHtml,
        };
    }

    /**
     * Render a paragraph node with optional text alignment.
     *
     * @param  array<string, mixed>  $attrs
     */
    protected function renderParagraph(array $attrs, string $childrenHtml): string
    {
        $style = '';
        if (isset($attrs['textAlign']) && $attrs['textAlign'] !== 'left') {
            $style = ' style="text-align: ' . e($attrs['textAlign']) . '"';
        }

        return "<p{$style}>{$childrenHtml}</p>";
    }

    /**
     * Render a heading node.
     *
     * @param  array<string, mixed>  $attrs
     */
    protected function renderHeading(array $attrs, string $childrenHtml): string
    {
        $level = (int) ($attrs['level'] ?? 2);
        $level = max(1, min(6, $level));
        $style = '';
        if (isset($attrs['textAlign']) && $attrs['textAlign'] !== 'left') {
            $style = ' style="text-align: ' . e($attrs['textAlign']) . '"';
        }

        return "<h{$level}{$style}>{$childrenHtml}</h{$level}>";
    }

    /**
     * Render an ordered list node.
     *
     * @param  array<string, mixed>  $attrs
     */
    protected function renderOrderedList(array $attrs, string $childrenHtml): string
    {
        $start = isset($attrs['start']) && (int) $attrs['start'] !== 1
            ? ' start="' . (int) $attrs['start'] . '"'
            : '';

        return "<ol{$start}>{$childrenHtml}</ol>";
    }

    /**
     * Render a code block node with optional language.
     *
     * @param  array<string, mixed>  $attrs
     */
    protected function renderCodeBlock(array $attrs, string $childrenHtml): string
    {
        $lang = isset($attrs['language']) ? ' class="language-' . e($attrs['language']) . '"' : '';

        return "<pre><code{$lang}>{$childrenHtml}</code></pre>";
    }

    /**
     * Render a Bootstrap row node.
     *
     * @param  array<string, mixed>  $attrs
     */
    protected function renderBootstrapRow(array $attrs, string $childrenHtml): string
    {
        $gutter = (int) ($attrs['gutter'] ?? 3);
        $gutter = max(0, min(5, $gutter));

        return "<div class=\"row g-{$gutter}\">{$childrenHtml}</div>";
    }

    /**
     * Render a Bootstrap column node.
     *
     * @param  array<string, mixed>  $attrs
     */
    protected function renderBootstrapCol(array $attrs, string $childrenHtml): string
    {
        $colClass = e($attrs['colClass'] ?? 'col');

        // Validate class names – only allow Bootstrap column patterns
        $sanitized = implode(' ', array_filter(
            explode(' ', $colClass),
            fn (string $cls) => (bool) preg_match('/^col(-(?:sm|md|lg|xl|xxl))?(-(?:auto|\d{1,2}))?$/', $cls)
        ));

        if ($sanitized === '') {
            $sanitized = 'col';
        }

        return "<div class=\"{$sanitized}\">{$childrenHtml}</div>";
    }

    /**
     * Render a Bootstrap Alert node.
     *
     * @param  array<string, mixed>  $attrs
     */
    protected function renderBootstrapAlert(array $attrs, string $childrenHtml): string
    {
        $allowedTypes = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];
        $type = in_array($attrs['type'] ?? '', $allowedTypes, true) ? $attrs['type'] : 'info';

        return "<div class=\"alert alert-{$type}\" role=\"alert\">{$childrenHtml}</div>";
    }

    /**
     * Render a Bootstrap Card node.
     *
     * @param  array<string, mixed>  $attrs
     */
    protected function renderBootstrapCard(array $attrs, string $childrenHtml): string
    {
        $allowedColors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];
        $borderColor = isset($attrs['borderColor']) && in_array($attrs['borderColor'], $allowedColors, true)
            ? $attrs['borderColor']
            : null;

        $classes = 'card';
        if ($borderColor !== null) {
            $classes .= " border-{$borderColor}";
        }

        $header = '';
        if (! empty($attrs['headerText'])) {
            $headerText = e($attrs['headerText']);
            $header = "<div class=\"card-header\">{$headerText}</div>";
        }

        $footer = '';
        if (! empty($attrs['footerText'])) {
            $footerText = e($attrs['footerText']);
            $footer = "<div class=\"card-footer\">{$footerText}</div>";
        }

        return "<div class=\"{$classes}\">{$header}<div class=\"card-body\">{$childrenHtml}</div>{$footer}</div>";
    }

    /**
     * Render a Bootstrap Button node.
     *
     * @param  array<string, mixed>  $attrs
     */
    protected function renderBootstrapButton(array $attrs): string
    {
        $allowedVariants = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'link'];
        $variant = in_array($attrs['variant'] ?? '', $allowedVariants, true) ? $attrs['variant'] : 'primary';
        $outline = ! empty($attrs['outline']);
        $btnClass = $outline ? "btn-outline-{$variant}" : "btn-{$variant}";

        $classes = "btn {$btnClass}";

        $allowedSizes = ['sm', 'lg'];
        if (isset($attrs['size']) && in_array($attrs['size'], $allowedSizes, true)) {
            $classes .= " btn-{$attrs['size']}";
        }

        $href = e($attrs['url'] ?? '#');
        $text = e($attrs['text'] ?? 'Button');
        $target = isset($attrs['target']) && $attrs['target'] === '_blank'
            ? ' target="_blank" rel="noopener noreferrer"'
            : '';

        return "<a href=\"{$href}\" class=\"{$classes}\" role=\"button\"{$target}>{$text}</a>";
    }

    /**
     * Render a custom image node.
     *
     * @param  array<string, mixed>  $attrs
     */
    protected function renderCustomImage(array $attrs): string
    {
        $src = e($attrs['src'] ?? '');
        if ($src === '') {
            return '';
        }

        $alt     = e($attrs['alt'] ?? '');
        $title   = isset($attrs['title']) ? ' title="' . e($attrs['title'])  . '"' : '';
        $loading = ' loading="' . e($attrs['loading'] ?? 'lazy') . '"';

        // Integer pixel dimensions (from upload)
        $width  = isset($attrs['width'])  && is_numeric($attrs['width']) ? ' width="'  . (int) $attrs['width']  . '"' : '';
        $height = isset($attrs['height']) && is_numeric($attrs['height']) ? ' height="' . (int) $attrs['height'] . '"' : '';

        // Alignment
        $allowedAlignments = ['left', 'center', 'right'];
        $alignment  = in_array($attrs['alignment'] ?? '', $allowedAlignments, true)
            ? $attrs['alignment'] : 'center';
        $alignClass = match ($alignment) {
            'left'  => 'text-start',
            'right' => 'text-end',
            default => 'text-center',
        };

        // Extra CSS class on figure
        $extraClass = ! empty($attrs['extraClass']) ? ' ' . e($attrs['extraClass']) : '';

        // Width style (e.g. "50%" / "400px")
        $widthStyle = ! empty($attrs['widthStyle']) ? ' style="width:' . e($attrs['widthStyle']) . '"' : '';

        // Build <img>
        $img = "<img src=\"{$src}\" alt=\"{$alt}\"{$title}{$width}{$height}{$loading} class=\"img-fluid\">";

        // Wrap in <a> if linkUrl is set
        $linkUrl    = $attrs['linkUrl']    ?? null;
        $linkTarget = $attrs['linkTarget'] ?? null;
        if ($linkUrl) {
            $href  = e($linkUrl);
            $tgt   = $linkTarget ? ' target="' . e($linkTarget) . '"' : '';
            $rel   = $linkTarget === '_blank' ? ' rel="noopener noreferrer"' : '';
            $img   = "<a href=\"{$href}\"{$tgt}{$rel}>{$img}</a>";
        }

        // Caption
        $caption = '';
        if (! empty($attrs['caption'])) {
            $captionText = e($attrs['caption']);
            $caption = "<figcaption class=\"figure-caption\">{$captionText}</figcaption>";
        }

        return "<figure class=\"{$alignClass}{$extraClass}\"{$widthStyle}>{$img}{$caption}</figure>";
    }

    /**
     * Render a custom video node.
     *
     * @param  array<string, mixed>  $attrs
     */
    protected function renderCustomVideo(array $attrs): string
    {
        $provider = $attrs['provider'] ?? 'youtube';
        $videoId = e($attrs['videoId'] ?? '');
        $title = e($attrs['title'] ?? '');
        $caption = e($attrs['caption'] ?? '');

        // Aspect ratio
        $allowedRatios = ['16x9', '4x3', '1x1', '21x9', '9x16'];
        $rawRatio = $attrs['aspectRatio'] ?? '16x9';
        $aspectRatio = in_array($rawRatio, $allowedRatios, true) ? $rawRatio : '16x9';
        $ratioClass = "ratio-{$aspectRatio}";

        // Alignment
        $alignment = $attrs['alignment'] ?? 'center';
        $alignClass = match ($alignment) {
            'left' => 'text-start',
            'right' => 'text-end',
            default => 'text-center',
        };

        // Width style
        $widthStyle = '';
        if (! empty($attrs['widthStyle']) && preg_match('/^\d+(\.\d+)?(px|%)$/', $attrs['widthStyle'])) {
            $widthStyle = 'width:' . e($attrs['widthStyle']);
        }

        $figureStyle = $widthStyle !== '' ? " style=\"{$widthStyle}\"" : '';

        // Build inner media
        $mediaHtml = '';
        if ($provider === 'mp4') {
            $url = e($attrs['url'] ?? $videoId);
            $mediaHtml = '<div class="ratio ' . $ratioClass . '">'
                . "<video controls title=\"{$title}\">"
                . "<source src=\"{$url}\" type=\"video/mp4\">"
                . '</video></div>';
        } else {
            $videoProviders = config('tiptap-editor.video_providers', []);
            $embedUrl = '';
            if (isset($videoProviders[$provider]['embed_url']) && $videoId !== '') {
                $embedUrl = str_replace('{id}', $videoId, $videoProviders[$provider]['embed_url']);
            }
            if ($embedUrl === '') {
                return '';
            }
            $embedUrl = e($embedUrl);
            $mediaHtml = '<div class="ratio ' . $ratioClass . '">'
                . "<iframe src=\"{$embedUrl}\" title=\"{$title}\""
                . ' allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"'
                . ' allowfullscreen loading="lazy"></iframe></div>';
        }

        $captionHtml = $caption !== '' ? "<figcaption>{$caption}</figcaption>" : '';

        return "<figure class=\"tiptap-video-figure {$alignClass}\"{$figureStyle}>{$mediaHtml}{$captionHtml}</figure>";
    }

    /**
     * Render a gallery node.
     *
     * @param  array<string, mixed>  $attrs
     */
    protected function renderGallery(array $attrs, string $childrenHtml): string
    {
        $allowedColumns = [2, 3, 4, 6];
        $columns = in_array((int) ($attrs['columns'] ?? 3), $allowedColumns, true)
            ? (int) $attrs['columns']
            : 3;

        $gap = max(0, min(5, (int) ($attrs['gap'] ?? 2)));

        $lightboxAttr = ! empty($attrs['lightbox']) ? ' data-lightbox="true"' : '';

        return "<div class=\"row g-{$gap}\"{$lightboxAttr}>{$childrenHtml}</div>";
    }

    /**
     * Render a gallery image node.
     *
     * @param  array<string, mixed>  $attrs
     */
    protected function renderGalleryImage(array $attrs): string
    {
        $src = e($attrs['src'] ?? '');
        if ($src === '') {
            return '';
        }

        $alt = e($attrs['alt'] ?? '');

        // Validate colClass format (e.g. col-4, col-md-6)
        $colClass = ($attrs['colClass'] ?? 'col-4');
        if (! preg_match('/^col(-\w+)*$/', $colClass)) {
            $colClass = 'col-4';
        }

        return "<div class=\"{$colClass}\"><img src=\"{$src}\" alt=\"{$alt}\" class=\"img-fluid rounded\" loading=\"lazy\"></div>";
    }

    /**
     * Render a table cell (td or th) node.
     *
     * @param  array<string, mixed>  $attrs
     */
    protected function renderTableCell(array $attrs, string $childrenHtml, string $tag = 'td'): string
    {
        $tag = $tag === 'th' ? 'th' : 'td';
        $attributes = '';

        if (isset($attrs['colspan']) && (int) $attrs['colspan'] > 1) {
            $attributes .= ' colspan="' . (int) $attrs['colspan'] . '"';
        }

        if (isset($attrs['rowspan']) && (int) $attrs['rowspan'] > 1) {
            $attributes .= ' rowspan="' . (int) $attrs['rowspan'] . '"';
        }

        return "<{$tag}{$attributes}>{$childrenHtml}</{$tag}>";
    }

    /**
     * Apply marks (bold, italic, etc.) to text content.
     *
     * @param  array<int, array<string, mixed>>  $marks
     */
    protected function applyMarks(string $html, array $marks): string
    {
        foreach ($marks as $mark) {
            $type = $mark['type'] ?? '';
            $attrs = $mark['attrs'] ?? [];

            $html = match ($type) {
                'bold' => "<strong>{$html}</strong>",
                'italic' => "<em>{$html}</em>",
                'underline' => "<u>{$html}</u>",
                'strike' => "<s>{$html}</s>",
                'code' => "<code>{$html}</code>",
                'subscript' => "<sub>{$html}</sub>",
                'superscript' => "<sup>{$html}</sup>",
                'link' => $this->renderLink($html, $attrs),
                'highlight' => $this->renderHighlight($html, $attrs),
                'textStyle' => $this->renderTextStyle($html, $attrs),
                default => $html,
            };
        }

        return $html;
    }

    /**
     * Render a link mark.
     *
     * @param  array<string, mixed>  $attrs
     */
    protected function renderLink(string $html, array $attrs): string
    {
        $href = e($attrs['href'] ?? '#');
        $target = isset($attrs['target']) && $attrs['target'] !== '' ? ' target="' . e($attrs['target']) . '"' : '';

        // Build rel: always add noopener if _blank
        $relParts = [];
        if ($target !== '') {
            $relParts[] = 'noopener';
        }
        if (isset($attrs['rel']) && $attrs['rel'] !== '') {
            $allowedRel = ['noopener', 'noreferrer', 'nofollow', 'ugc', 'sponsored'];
            foreach (preg_split('/\s+/', $attrs['rel']) as $r) {
                if (in_array($r, $allowedRel, true) && ! in_array($r, $relParts, true)) {
                    $relParts[] = $r;
                }
            }
        }
        $rel = ! empty($relParts) ? ' rel="' . e(implode(' ', $relParts)) . '"' : '';

        $title = isset($attrs['title']) && $attrs['title'] !== '' ? ' title="' . e($attrs['title']) . '"' : '';
        $class = isset($attrs['class']) && $attrs['class'] !== '' ? ' class="' . e($attrs['class']) . '"' : '';

        return "<a href=\"{$href}\"{$target}{$rel}{$title}{$class}>{$html}</a>";
    }

    /**
     * Render a highlight mark.
     *
     * @param  array<string, mixed>  $attrs
     */
    protected function renderHighlight(string $html, array $attrs): string
    {
        $color = isset($attrs['color']) ? ' style="background-color: ' . e($attrs['color']) . '"' : '';

        return "<mark{$color}>{$html}</mark>";
    }

    /**
     * Render a text style mark (color).
     *
     * @param  array<string, mixed>  $attrs
     */
    protected function renderTextStyle(string $html, array $attrs): string
    {
        $color = isset($attrs['color']) ? ' style="color: ' . e($attrs['color']) . '"' : '';

        return "<span{$color}>{$html}</span>";
    }
}
