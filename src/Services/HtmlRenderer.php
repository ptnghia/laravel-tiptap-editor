<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Services;

use Suspended\TiptapEditor\Services\ClassMap\ClassMapInterface;
use Suspended\TiptapEditor\Support\NodeRegistry;

class HtmlRenderer
{
    /**
     * Create a new HtmlRenderer instance.
     */
    public function __construct(
        protected NodeRegistry $nodeRegistry,
        protected ClassMapInterface $classMap,
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
            'table' => $this->renderTable($attrs, $childrenHtml),
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
     * Render a Bootstrap/grid row node.
     *
     * @param  array<string, mixed>  $attrs
     */
    protected function renderBootstrapRow(array $attrs, string $childrenHtml): string
    {
        $gutter = max(0, min(5, (int) ($attrs['gutter'] ?? 3)));

        $allowedJustify = ['center', 'end', 'between', 'around', 'evenly'];
        $allowedAlign   = ['start', 'center', 'end'];

        $justify = isset($attrs['justifyContent']) && in_array($attrs['justifyContent'], $allowedJustify, true)
            ? $attrs['justifyContent']
            : null;

        $align = isset($attrs['alignItems']) && in_array($attrs['alignItems'], $allowedAlign, true)
            ? $attrs['alignItems']
            : null;

        $modifiers = array_filter([
            'gutter'  => $gutter,
            'justify' => $justify,
            'align'   => $align,
        ], fn ($v) => $v !== null);

        $classes = $this->classMap->get('row', $modifiers);

        $dataAttrs = $this->classMap->isTailwind()
            ? ' data-tiptap-type="row"'
            : '';

        return "<div class=\"{$classes}\"{$dataAttrs}>{$childrenHtml}</div>";
    }

    /**
     * Render a Bootstrap/grid column node.
     *
     * @param  array<string, mixed>  $attrs
     */
    protected function renderBootstrapCol(array $attrs, string $childrenHtml): string
    {
        $colClass = (string) ($attrs['colClass'] ?? 'col');
        $classes  = $this->classMap->get('col', ['colClass' => $colClass]);

        $dataAttrs = $this->classMap->isTailwind()
            ? ' data-tiptap-type="col"'
            : '';

        return "<div class=\"{$classes}\"{$dataAttrs}>{$childrenHtml}</div>";
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

        $classes = $this->classMap->get('alert', ['type' => $type]);

        $dataAttrs = $this->classMap->isTailwind()
            ? " data-tiptap-type=\"alert\" data-tiptap-variant=\"{$type}\""
            : '';

        return "<div class=\"{$classes}\"{$dataAttrs} role=\"alert\">{$childrenHtml}</div>";
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

        $modifiers    = $borderColor !== null ? ['borderColor' => $borderColor] : [];
        $cardClass    = $this->classMap->get('card', $modifiers);
        $headerClass  = $this->classMap->get('card.header');
        $bodyClass    = $this->classMap->get('card.body');
        $footerClass  = $this->classMap->get('card.footer');

        $dataAttrs = $this->classMap->isTailwind()
            ? ' data-tiptap-type="card"'
            : '';

        $header = '';
        if (! empty($attrs['headerText'])) {
            $headerText = e($attrs['headerText']);
            $header = "<div class=\"{$headerClass}\">{$headerText}</div>";
        }

        $footer = '';
        if (! empty($attrs['footerText'])) {
            $footerText = e($attrs['footerText']);
            $footer = "<div class=\"{$footerClass}\">{$footerText}</div>";
        }

        return "<div class=\"{$cardClass}\"{$dataAttrs}>{$header}<div class=\"{$bodyClass}\">{$childrenHtml}</div>{$footer}</div>";
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

        $allowedSizes = ['sm', 'lg'];
        $size = isset($attrs['size']) && in_array($attrs['size'], $allowedSizes, true) ? $attrs['size'] : null;

        $modifiers = array_filter([
            'variant' => $variant,
            'outline' => $outline ?: null,
            'size'    => $size,
        ], fn ($v) => $v !== null);

        $classes = $this->classMap->get('button', $modifiers);

        $href   = e($attrs['url'] ?? '#');
        $text   = e($attrs['text'] ?? 'Button');
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

        // Image class from ClassMap
        $imgClass = $this->classMap->get('image');

        // Build <img>
        $img = "<img src=\"{$src}\" alt=\"{$alt}\"{$title}{$width}{$height}{$loading} class=\"{$imgClass}\">";

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
            $captionText  = e($attrs['caption']);
            $captionClass = $this->classMap->get('image.caption');
            $caption = "<figcaption class=\"{$captionClass}\">{$captionText}</figcaption>";
        }

        $dataAttrs = $this->classMap->isTailwind()
            ? ' data-tiptap-type="image"'
            : '';

        return "<figure class=\"{$alignClass}{$extraClass}\"{$widthStyle}{$dataAttrs}>{$img}{$caption}</figure>";
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
        $rawRatio      = $attrs['aspectRatio'] ?? '16x9';
        $aspectRatio   = in_array($rawRatio, $allowedRatios, true) ? $rawRatio : '16x9';

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
        // Ratio wrapper class from ClassMap
        $ratioWrapperClass = $this->classMap->get('video.ratio', ['ratio' => $aspectRatio]);

        $mediaHtml = '';
        if ($provider === 'mp4') {
            $url = e($attrs['url'] ?? $videoId);
            $mediaHtml = "<div class=\"{$ratioWrapperClass}\">"
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
            $embedUrl  = e($embedUrl);
            $mediaHtml = "<div class=\"{$ratioWrapperClass}\">"
                . "<iframe src=\"{$embedUrl}\" title=\"{$title}\""
                . ' allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"'
                . ' allowfullscreen loading="lazy"></iframe></div>';
        }

        $captionHtml = $caption !== '' ? "<figcaption>{$caption}</figcaption>" : '';

        $dataAttrs = $this->classMap->isTailwind()
            ? ' data-tiptap-type="video"'
            : '';

        return "<figure class=\"tiptap-video-figure {$alignClass}\"{$figureStyle}{$dataAttrs}>{$mediaHtml}{$captionHtml}</figure>";
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

        $classes = $this->classMap->get('gallery', ['gap' => $gap, 'columns' => $columns]);

        $lightboxAttr = ! empty($attrs['lightbox']) ? ' data-lightbox="true"' : '';

        $dataAttrs = $this->classMap->isTailwind()
            ? ' data-tiptap-type="gallery"'
            : '';

        return "<div class=\"{$classes}\"{$lightboxAttr}{$dataAttrs}>{$childrenHtml}</div>";
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

        $colClass  = (string) ($attrs['colClass'] ?? 'col-4');
        $itemClass = $this->classMap->get('gallery.item', ['colClass' => $colClass]);
        $imgClass  = $this->classMap->get('gallery.image');

        return "<div class=\"{$itemClass}\"><img src=\"{$src}\" alt=\"{$alt}\" class=\"{$imgClass}\" loading=\"lazy\"></div>";
    }

    /**
     * Render a table node with appropriate classes and responsive wrapper.
     *
     * @param  array<string, mixed>  $attrs
     */
    protected function renderTable(array $attrs, string $childrenHtml): string
    {
        $modifiers = [
            'bordered'    => ! empty($attrs['bordered']),
            'striped'     => ! empty($attrs['striped']),
            'hover'       => ! empty($attrs['hover']),
            'small'       => ! empty($attrs['small']),
            'alignMiddle' => ! empty($attrs['alignMiddle']),
        ];

        $tableClass   = $this->classMap->get('table', $modifiers);
        $wrapperClass = $this->classMap->get('table.wrapper');

        $dataAttrs = $this->classMap->isTailwind()
            ? ' data-tiptap-type="table"'
            : '';

        return "<div class=\"{$wrapperClass}\"{$dataAttrs}><table class=\"{$tableClass}\">{$childrenHtml}</table></div>";
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
        $color = '';
        if (isset($attrs['color']) && $this->isValidCssColor($attrs['color'])) {
            $color = ' style="background-color: ' . e($attrs['color']) . '"';
        }

        return "<mark{$color}>{$html}</mark>";
    }

    /**
     * Render a text style mark (color).
     *
     * @param  array<string, mixed>  $attrs
     */
    protected function renderTextStyle(string $html, array $attrs): string
    {
        $color = '';
        if (isset($attrs['color']) && $this->isValidCssColor($attrs['color'])) {
            $color = ' style="color: ' . e($attrs['color']) . '"';
        }

        return "<span{$color}>{$html}</span>";
    }

    /**
     * Validate a CSS color value to prevent CSS injection.
     *
     * Allows: hex (#fff, #ffffff, #ffffffff), rgb/rgba/hsl/hsla functions, named colors.
     */
    protected function isValidCssColor(string $value): bool
    {
        $value = trim($value);

        // Hex colors: #RGB, #RRGGBB, #RRGGBBAA
        if (preg_match('/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/', $value)) {
            return true;
        }

        // rgb/rgba/hsl/hsla functions (only digits, commas, dots, spaces, %)
        if (preg_match('/^(rgb|rgba|hsl|hsla)\(\s*[\d\s,%.\/]+\s*\)$/', $value)) {
            return true;
        }

        // Named CSS colors (only alphabetic characters, max 30 chars)
        if (preg_match('/^[a-zA-Z]{1,30}$/', $value)) {
            return true;
        }

        return false;
    }
}
