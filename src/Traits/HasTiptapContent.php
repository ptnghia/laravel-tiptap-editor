<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Traits;

use Illuminate\Support\Facades\Cache;
use Suspended\TiptapEditor\Services\HtmlRenderer;

/**
 * Trait for Eloquent models that store Tiptap editor content.
 *
 * Provides methods to render JSON content to HTML, generate excerpts,
 * and optionally cache rendered output.
 *
 * Usage:
 *   class Post extends Model {
 *       use HasTiptapContent;
 *       // Assumes 'content_json' column exists (configurable via $tiptapContentColumn)
 *   }
 *
 *   $post->renderContent();  // Returns rendered HTML
 *   $post->getExcerpt(160);  // Returns plain text excerpt
 */
trait HasTiptapContent
{
    /**
     * Boot the trait – auto-invalidate cache on save.
     */
    public static function bootHasTiptapContent(): void
    {
        static::saving(function ($model) {
            $model->clearRenderedContentCache();
        });
    }

    /**
     * Get the column name that stores Tiptap JSON content.
     */
    public function getTiptapContentColumn(): string
    {
        return $this->tiptapContentColumn ?? 'content_json';
    }

    /**
     * Get the column name that stores cached rendered HTML.
     * Return null to use cache store instead of database column.
     */
    public function getTiptapHtmlColumn(): ?string
    {
        return $this->tiptapHtmlColumn ?? null;
    }

    /**
     * Get the raw Tiptap JSON content as array.
     *
     * @return array<string, mixed>
     */
    public function getTiptapContent(): array
    {
        $column = $this->getTiptapContentColumn();
        $content = $this->getAttribute($column);

        if (is_string($content)) {
            return json_decode($content, true) ?? [];
        }

        return is_array($content) ? $content : [];
    }

    /**
     * Set the Tiptap JSON content.
     *
     * @param  array<string, mixed>|string  $content
     * @return static
     */
    public function setTiptapContent(array|string $content): static
    {
        $column = $this->getTiptapContentColumn();

        if (is_string($content)) {
            $decoded = json_decode($content, true);
            $content = $decoded ?? [];
        }

        $this->setAttribute($column, $content);

        return $this;
    }

    /**
     * Render the Tiptap JSON content to safe HTML.
     *
     * Uses caching if enabled in config.
     */
    public function renderContent(): string
    {
        // Check database column cache first
        $htmlColumn = $this->getTiptapHtmlColumn();
        if ($htmlColumn !== null && ! empty($this->getAttribute($htmlColumn))) {
            return (string) $this->getAttribute($htmlColumn);
        }

        // Check cache store
        $cacheEnabled = config('tiptap-editor.rendering.cache', false);
        if ($cacheEnabled) {
            $cacheKey = $this->getContentCacheKey();
            $cacheTtl = (int) config('tiptap-editor.rendering.cache_ttl', 3600);

            return Cache::remember($cacheKey, $cacheTtl, function () {
                return $this->renderContentFresh();
            });
        }

        return $this->renderContentFresh();
    }

    /**
     * Render content without any caching.
     */
    public function renderContentFresh(): string
    {
        $content = $this->getTiptapContent();

        if (empty($content)) {
            return '';
        }

        /** @var HtmlRenderer $renderer */
        $renderer = app(HtmlRenderer::class);

        return $renderer->render($content);
    }

    /**
     * Generate a plain text excerpt from the content.
     */
    public function getExcerpt(int $maxLength = 160): string
    {
        $html = $this->renderContent();

        if ($html === '') {
            return '';
        }

        // Strip HTML tags
        $text = strip_tags($html);
        // Normalize whitespace
        $text = preg_replace('/\s+/', ' ', $text) ?? $text;
        $text = trim($text);

        if (mb_strlen($text) <= $maxLength) {
            return $text;
        }

        // Cut at word boundary
        $excerpt = mb_substr($text, 0, $maxLength);
        $lastSpace = mb_strrpos($excerpt, ' ');

        if ($lastSpace !== false && $lastSpace > $maxLength * 0.8) {
            $excerpt = mb_substr($excerpt, 0, $lastSpace);
        }

        return $excerpt . '…';
    }

    /**
     * Get the plain text content (all tags stripped).
     */
    public function getPlainTextContent(): string
    {
        $html = $this->renderContent();
        $text = strip_tags($html);
        $text = preg_replace('/\s+/', ' ', $text) ?? $text;

        return trim($text);
    }

    /**
     * Get a list of all headings in the content (for TOC generation).
     *
     * @return array<int, array{level: int, text: string}>
     */
    public function getHeadings(): array
    {
        $content = $this->getTiptapContent();
        $headings = [];

        $this->extractHeadings($content, $headings);

        return $headings;
    }

    /**
     * Recursively extract heading nodes from content.
     *
     * @param  array<string, mixed>  $node
     * @param  array<int, array{level: int, text: string}>  &$headings
     */
    protected function extractHeadings(array $node, array &$headings): void
    {
        if (($node['type'] ?? '') === 'heading') {
            $level = (int) ($node['attrs']['level'] ?? 2);
            $text = $this->extractTextFromNode($node);
            if ($text !== '') {
                $headings[] = ['level' => $level, 'text' => $text];
            }
        }

        foreach ($node['content'] ?? [] as $child) {
            $this->extractHeadings($child, $headings);
        }
    }

    /**
     * Recursively extract plain text from a node.
     *
     * @param  array<string, mixed>  $node
     */
    protected function extractTextFromNode(array $node): string
    {
        if (($node['type'] ?? '') === 'text') {
            return $node['text'] ?? '';
        }

        $text = '';
        foreach ($node['content'] ?? [] as $child) {
            $text .= $this->extractTextFromNode($child);
        }

        return $text;
    }

    /**
     * Save rendered HTML to database column (if configured).
     */
    public function saveRenderedHtml(): static
    {
        $htmlColumn = $this->getTiptapHtmlColumn();

        if ($htmlColumn !== null) {
            $html = $this->renderContentFresh();
            $this->setAttribute($htmlColumn, $html);
        }

        return $this;
    }

    /**
     * Clear the rendered content cache.
     */
    public function clearRenderedContentCache(): void
    {
        // Clear cache store
        if (config('tiptap-editor.rendering.cache', false)) {
            Cache::forget($this->getContentCacheKey());
        }

        // Clear HTML column
        $htmlColumn = $this->getTiptapHtmlColumn();
        if ($htmlColumn !== null) {
            $this->setAttribute($htmlColumn, null);
        }
    }

    /**
     * Check if the content is empty.
     */
    public function hasContent(): bool
    {
        $content = $this->getTiptapContent();

        if (empty($content) || ! isset($content['content'])) {
            return false;
        }

        // Check if there's any meaningful content (not just empty paragraphs)
        foreach ($content['content'] as $node) {
            if ($this->nodeHasContent($node)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if a node has meaningful content.
     *
     * @param  array<string, mixed>  $node
     */
    protected function nodeHasContent(array $node): bool
    {
        if (($node['type'] ?? '') === 'text' && ! empty($node['text'])) {
            return true;
        }

        if (in_array($node['type'] ?? '', ['horizontalRule', 'hardBreak', 'customImage', 'customVideo'], true)) {
            return true;
        }

        foreach ($node['content'] ?? [] as $child) {
            if ($this->nodeHasContent($child)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get cache key for this model's rendered content.
     */
    protected function getContentCacheKey(): string
    {
        $column = $this->getTiptapContentColumn();
        $contentHash = md5(json_encode($this->getAttribute($column)) ?: '');

        return 'tiptap_render_' . static::class . '_' . ($this->getKey() ?? 'new') . '_' . $contentHash;
    }
}
