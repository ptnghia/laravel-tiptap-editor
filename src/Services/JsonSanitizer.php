<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Services;

use Suspended\TiptapEditor\Support\NodeRegistry;

class JsonSanitizer
{
    /**
     * Allowed URL schemes for links and media.
     *
     * @var array<int, string>
     */
    protected const SAFE_URL_SCHEMES = ['http', 'https', 'mailto', 'tel'];

    /**
     * Dangerous URL patterns that should be blocked.
     *
     * @var array<int, string>
     */
    protected const DANGEROUS_URL_PATTERNS = [
        '/^javascript:/i',
        '/^data:/i',
        '/^vbscript:/i',
        '/^file:/i',
        '/on\w+\s*=/i',
    ];

    /**
     * Create a new JsonSanitizer instance.
     *
     * @param  array<string, mixed>  $sanitizationConfig
     */
    public function __construct(
        protected NodeRegistry $nodeRegistry,
        protected array $sanitizationConfig = [],
    ) {
    }

    /**
     * Sanitize Tiptap JSON content.
     *
     * Removes disallowed node types, strips dangerous attributes,
     * and enforces size/depth limits.
     *
     * @param  array<string, mixed>|string  $content
     * @return array<string, mixed>
     */
    public function sanitize(array|string $content): array
    {
        if (is_string($content)) {
            $content = json_decode($content, true) ?? [];
        }

        // Check max size
        $maxSize = $this->sanitizationConfig['max_content_size'] ?? 512000;
        if (strlen(json_encode($content) ?: '') > $maxSize) {
            throw new \InvalidArgumentException("Content exceeds maximum allowed size of {$maxSize} bytes.");
        }

        return $this->sanitizeNode($content, 0);
    }

    /**
     * Sanitize a single node recursively.
     *
     * @param  array<string, mixed>  $node
     * @return array<string, mixed>
     */
    protected function sanitizeNode(array $node, int $depth): array
    {
        $maxDepth = $this->sanitizationConfig['max_nesting_depth'] ?? 10;
        if ($depth > $maxDepth) {
            return [];
        }

        $type = $node['type'] ?? '';

        // Filter unknown node types (keep doc and text always)
        if ($type !== '' && $type !== 'doc' && $type !== 'text') {
            if (! $this->nodeRegistry->isKnownNodeType($type)) {
                return [];
            }
        }

        // Sanitize attributes
        if (isset($node['attrs']) && is_array($node['attrs'])) {
            $node['attrs'] = $this->sanitizeAttributes($type, $node['attrs']);
        }

        // Sanitize children – filter out empty results
        if (isset($node['content']) && is_array($node['content'])) {
            $node['content'] = array_values(array_filter(
                array_map(fn (array $child) => $this->sanitizeNode($child, $depth + 1), $node['content']),
                fn (array $child) => ! empty($child)
            ));
        }

        // Sanitize marks
        if (isset($node['marks']) && is_array($node['marks'])) {
            $node['marks'] = $this->sanitizeMarks($node['marks']);
            if (empty($node['marks'])) {
                unset($node['marks']);
            }
        }

        // Sanitize text
        if (isset($node['text'])) {
            $node['text'] = $this->sanitizeText((string) $node['text']);
        }

        return $node;
    }

    /**
     * Sanitize node attributes – strip unknown and dangerous attributes.
     *
     * @param  array<string, mixed>  $attrs
     * @return array<string, mixed>
     */
    protected function sanitizeAttributes(string $nodeType, array $attrs): array
    {
        $allowed = $this->nodeRegistry->getAllowedAttributes($nodeType);

        // If no schema defined, strip all attributes
        if ($allowed === null) {
            return [];
        }

        // Filter to only allowed attribute names
        $filtered = [];
        foreach ($attrs as $key => $value) {
            if (in_array($key, $allowed, true)) {
                $filtered[$key] = $this->sanitizeAttributeValue($key, $value);
            }
        }

        return $filtered;
    }

    /**
     * Sanitize a single attribute value based on its name.
     */
    protected function sanitizeAttributeValue(string $attrName, mixed $value): mixed
    {
        // URLs need special sanitization
        $urlAttributes = ['href', 'src', 'url', 'linkUrl'];
        if (in_array($attrName, $urlAttributes, true) && is_string($value)) {
            return $this->sanitizeUrl($value);
        }

        // Integer attributes
        $intAttributes = ['level', 'start', 'colspan', 'rowspan', 'width', 'height', 'gutter', 'mediaId'];
        if (in_array($attrName, $intAttributes, true)) {
            return is_numeric($value) ? (int) $value : null;
        }

        // Constrained string attributes
        if ($attrName === 'linkTarget') {
            return in_array($value, ['_blank', '_self', '_parent', '_top'], true) ? $value : null;
        }

        // aspectRatio: only specific values
        if ($attrName === 'aspectRatio') {
            return in_array($value, ['16x9', '4x3', '1x1', '21x9', '9x16'], true) ? $value : '16x9';
        }

        // alignment: limited values
        if ($attrName === 'alignment') {
            return in_array($value, ['left', 'center', 'right'], true) ? $value : 'center';
        }

        // widthStyle: only allow "NNpx" or "NN%" patterns
        if ($attrName === 'widthStyle') {
            if (is_string($value) && preg_match('/^\d+(\.\d+)?(px|%)$/', trim($value))) {
                return trim($value);
            }
            return null;
        }

        // Boolean attributes
        $boolAttributes = ['outline', 'lightbox'];
        if (in_array($attrName, $boolAttributes, true)) {
            return (bool) $value;
        }

        // String attributes – strip control characters
        if (is_string($value)) {
            return $this->sanitizeText($value);
        }

        return $value;
    }

    /**
     * Sanitize a URL – block dangerous schemes and patterns.
     */
    public function sanitizeUrl(string $url): string
    {
        $url = trim($url);

        // Empty or hash-only URLs are safe
        if ($url === '' || $url === '#') {
            return $url;
        }

        // Check for dangerous patterns
        foreach (self::DANGEROUS_URL_PATTERNS as $pattern) {
            if (preg_match($pattern, $url)) {
                return '#';
            }
        }

        // Parse and validate scheme
        $parsed = parse_url($url);
        if ($parsed !== false && isset($parsed['scheme'])) {
            if (! in_array(strtolower($parsed['scheme']), self::SAFE_URL_SCHEMES, true)) {
                return '#';
            }
        }

        return $url;
    }

    /**
     * Sanitize marks array.
     *
     * @param  array<int, array<string, mixed>>  $marks
     * @return array<int, array<string, mixed>>
     */
    protected function sanitizeMarks(array $marks): array
    {
        $allowedMarks = ['bold', 'italic', 'underline', 'strike', 'code', 'link', 'subscript', 'superscript', 'highlight', 'textStyle'];

        return array_values(array_filter($marks, function (array $mark) use ($allowedMarks) {
            $type = $mark['type'] ?? '';

            if (! in_array($type, $allowedMarks, true)) {
                return false;
            }

            // Sanitize link mark URLs
            if ($type === 'link' && isset($mark['attrs']['href'])) {
                $mark['attrs']['href'] = $this->sanitizeUrl($mark['attrs']['href']);
            }

            // Sanitize link mark rel attribute
            if ($type === 'link' && isset($mark['attrs']['rel'])) {
                $allowedRelValues = ['noopener', 'noreferrer', 'nofollow', 'ugc', 'sponsored'];
                $relParts = preg_split('/\s+/', $mark['attrs']['rel']);
                $mark['attrs']['rel'] = implode(' ', array_intersect($relParts, $allowedRelValues));
                if ($mark['attrs']['rel'] === '') {
                    unset($mark['attrs']['rel']);
                }
            }

            // Sanitize link mark target
            if ($type === 'link' && isset($mark['attrs']['target'])) {
                if (! in_array($mark['attrs']['target'], ['_blank', '_self', '_parent', '_top'], true)) {
                    unset($mark['attrs']['target']);
                }
            }

            return true;
        }));
    }

    /**
     * Sanitize text content.
     */
    protected function sanitizeText(string $text): string
    {
        // Strip null bytes and control characters (except newlines, tabs)
        return preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $text) ?? $text;
    }

    /**
     * Strip all HTML tags from text (for extra safety on user-provided strings).
     */
    public function stripHtml(string $text): string
    {
        return strip_tags($text);
    }
}
