<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Support;

class NodeRegistry
{
    /**
     * List of registered extension names.
     *
     * @var array<int, string>
     */
    protected array $extensions = [];

    /**
     * Map of node type → renderer class/callback.
     *
     * @var array<string, callable|string>
     */
    protected array $renderers = [];

    /**
     * Map of node type → allowed attributes.
     *
     * @var array<string, array<int, string>>
     */
    protected array $allowedAttributes = [];

    /**
     * Map of node type → allowed child types.
     *
     * @var array<string, array<int, string>>
     */
    protected array $allowedChildren = [];

    /**
     * Default node schema definitions.
     *
     * @var array<string, array{attrs: array<int, string>, children: array<int, string>}>
     */
    protected static array $defaultSchema = [
        'doc' => [
            'attrs' => [],
            'children' => ['paragraph', 'heading', 'bulletList', 'orderedList', 'blockquote', 'codeBlock', 'horizontalRule', 'hardBreak', 'table', 'bootstrapRow', 'bootstrapAlert', 'bootstrapCard', 'customImage', 'customVideo', 'gallery'],
        ],
        'paragraph' => [
            'attrs' => ['textAlign'],
            'children' => ['text'],
        ],
        'heading' => [
            'attrs' => ['level', 'textAlign', 'id'],
            'children' => ['text'],
        ],
        'text' => [
            'attrs' => [],
            'children' => [],
        ],
        'bulletList' => [
            'attrs' => [],
            'children' => ['listItem'],
        ],
        'orderedList' => [
            'attrs' => ['start'],
            'children' => ['listItem'],
        ],
        'listItem' => [
            'attrs' => [],
            'children' => ['paragraph', 'bulletList', 'orderedList', 'blockquote'],
        ],
        'blockquote' => [
            'attrs' => [],
            'children' => ['paragraph', 'heading', 'bulletList', 'orderedList'],
        ],
        'codeBlock' => [
            'attrs' => ['language'],
            'children' => ['text'],
        ],
        'horizontalRule' => [
            'attrs' => [],
            'children' => [],
        ],
        'hardBreak' => [
            'attrs' => [],
            'children' => [],
        ],
        'table' => [
            'attrs' => [],
            'children' => ['tableRow'],
        ],
        'tableRow' => [
            'attrs' => [],
            'children' => ['tableHeader', 'tableCell'],
        ],
        'tableHeader' => [
            'attrs' => ['colspan', 'rowspan', 'colwidth'],
            'children' => ['paragraph', 'heading', 'bulletList', 'orderedList'],
        ],
        'tableCell' => [
            'attrs' => ['colspan', 'rowspan', 'colwidth'],
            'children' => ['paragraph', 'heading', 'bulletList', 'orderedList'],
        ],
        'bootstrapRow' => [
            'attrs' => ['gutter'],
            'children' => ['bootstrapCol'],
        ],
        'bootstrapCol' => [
            'attrs' => ['colClass'],
            'children' => ['paragraph', 'heading', 'bulletList', 'orderedList', 'blockquote', 'codeBlock', 'horizontalRule', 'customImage', 'customVideo', 'bootstrapAlert', 'bootstrapCard', 'table', 'gallery'],
        ],
        'bootstrapAlert' => [
            'attrs' => ['type'],
            'children' => ['text'],
        ],
        'bootstrapCard' => [
            'attrs' => ['headerText', 'footerText', 'borderColor'],
            'children' => ['paragraph', 'heading', 'bulletList', 'orderedList', 'blockquote', 'customImage'],
        ],
        'bootstrapButton' => [
            'attrs' => ['text', 'url', 'variant', 'size', 'outline', 'target'],
            'children' => [],
        ],
        'customImage' => [
            'attrs' => ['src', 'alt', 'title', 'caption', 'width', 'height', 'alignment', 'mediaId', 'loading',
                        'widthStyle', 'extraClass', 'linkUrl', 'linkTarget'],
            'children' => [],
        ],
        'customVideo' => [
            'attrs' => ['provider', 'videoId', 'url', 'title', 'width', 'height',
                        'caption', 'aspectRatio', 'alignment', 'widthStyle'],
            'children' => [],
        ],
        'gallery' => [
            'attrs' => ['columns', 'gap', 'lightbox'],
            'children' => ['galleryImage'],
        ],
        'galleryImage' => [
            'attrs' => ['src', 'alt', 'colClass'],
            'children' => [],
        ],
    ];

    /**
     * Create a new NodeRegistry instance.
     *
     * @param  array<int, string>  $extensions
     */
    public function __construct(array $extensions = [])
    {
        $this->extensions = $extensions;
        $this->loadDefaultSchema();
    }

    /**
     * Load default schema definitions for all known node types.
     */
    protected function loadDefaultSchema(): void
    {
        foreach (self::$defaultSchema as $type => $schema) {
            $this->allowedAttributes[$type] = $schema['attrs'];
            $this->allowedChildren[$type] = $schema['children'];
        }
    }

    /**
     * Check if an extension is registered.
     */
    public function has(string $name): bool
    {
        return in_array($name, $this->extensions, true);
    }

    /**
     * Get all registered extension names.
     *
     * @return array<int, string>
     */
    public function all(): array
    {
        return $this->extensions;
    }

    /**
     * Check if a node type is known (has a schema definition).
     */
    public function isKnownNodeType(string $type): bool
    {
        return isset($this->allowedAttributes[$type]);
    }

    /**
     * Get allowed attributes for a node type.
     *
     * @return array<int, string>|null  Null if node type is unknown
     */
    public function getAllowedAttributes(string $type): ?array
    {
        return $this->allowedAttributes[$type] ?? null;
    }

    /**
     * Get allowed child node types for a node type.
     *
     * @return array<int, string>|null  Null if node type is unknown
     */
    public function getAllowedChildren(string $type): ?array
    {
        return $this->allowedChildren[$type] ?? null;
    }

    /**
     * Register allowed attributes for a custom node type.
     *
     * @param  array<int, string>  $attributes
     * @param  array<int, string>  $children
     */
    public function registerNodeSchema(string $type, array $attributes = [], array $children = []): void
    {
        $this->allowedAttributes[$type] = $attributes;
        $this->allowedChildren[$type] = $children;
    }

    /**
     * Register a custom renderer for a node type.
     */
    public function registerRenderer(string $nodeType, callable|string $renderer): void
    {
        $this->renderers[$nodeType] = $renderer;
    }

    /**
     * Get the renderer for a node type.
     */
    public function getRenderer(string $nodeType): callable|string|null
    {
        return $this->renderers[$nodeType] ?? null;
    }

    /**
     * Get all registered renderers.
     *
     * @return array<string, callable|string>
     */
    public function getRenderers(): array
    {
        return $this->renderers;
    }

    /**
     * Get all known node types.
     *
     * @return array<int, string>
     */
    public function getKnownNodeTypes(): array
    {
        return array_keys($this->allowedAttributes);
    }
}
