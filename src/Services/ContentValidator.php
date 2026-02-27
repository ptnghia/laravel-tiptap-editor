<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Services;

use Suspended\TiptapEditor\Support\NodeRegistry;

class ContentValidator
{
    /**
     * Validation errors from the last validation.
     *
     * @var array<int, string>
     */
    protected array $errors = [];

    /**
     * Validation warnings (non-fatal).
     *
     * @var array<int, string>
     */
    protected array $warnings = [];

    /**
     * Whether to check node types against registry.
     */
    protected bool $strictMode = false;

    /**
     * Create a new ContentValidator instance.
     */
    public function __construct(
        protected NodeRegistry $nodeRegistry,
    ) {
    }

    /**
     * Enable strict mode – reject unknown node types.
     */
    public function strict(bool $strict = true): static
    {
        $this->strictMode = $strict;

        return $this;
    }

    /**
     * Validate Tiptap JSON content structure.
     *
     * @param  array<string, mixed>|string  $content
     */
    public function validate(array|string $content): bool
    {
        $this->errors = [];
        $this->warnings = [];

        if (is_string($content)) {
            $decoded = json_decode($content, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                $this->errors[] = 'Invalid JSON: ' . json_last_error_msg();

                return false;
            }
            $content = $decoded;
        }

        if (! is_array($content)) {
            $this->errors[] = 'Content must be a JSON object.';

            return false;
        }

        if (($content['type'] ?? null) !== 'doc') {
            $this->errors[] = 'Root node must have type "doc".';

            return false;
        }

        if (! isset($content['content']) || ! is_array($content['content'])) {
            $this->errors[] = 'Root node must contain a "content" array.';

            return false;
        }

        // Content size check
        $jsonSize = strlen(json_encode($content) ?: '');
        $maxSize = 512000; // 500KB
        if ($jsonSize > $maxSize) {
            $this->errors[] = "Content size ({$jsonSize} bytes) exceeds maximum ({$maxSize} bytes).";

            return false;
        }

        $this->validateNodes($content['content'], 'doc', 0);

        return empty($this->errors);
    }

    /**
     * Get validation errors.
     *
     * @return array<int, string>
     */
    public function errors(): array
    {
        return $this->errors;
    }

    /**
     * Get validation warnings.
     *
     * @return array<int, string>
     */
    public function warnings(): array
    {
        return $this->warnings;
    }

    /**
     * Recursively validate child nodes.
     *
     * @param  array<int, array<string, mixed>>  $nodes
     */
    protected function validateNodes(array $nodes, string $parentType, int $depth): void
    {
        if ($depth > 10) {
            $this->errors[] = "Maximum nesting depth exceeded at depth {$depth}.";

            return;
        }

        foreach ($nodes as $index => $node) {
            if (! is_array($node)) {
                $this->errors[] = "Node at index {$index} (depth {$depth}) is not a valid object.";

                continue;
            }

            if (! isset($node['type'])) {
                $this->errors[] = "Node at index {$index} (depth {$depth}) is missing 'type'.";

                continue;
            }

            $type = $node['type'];

            // Strict mode: check if node type is known
            if ($this->strictMode && $type !== 'text' && ! $this->nodeRegistry->isKnownNodeType($type)) {
                $this->errors[] = "Unknown node type '{$type}' at depth {$depth}.";

                continue;
            }

            // Validate text node
            if ($type === 'text') {
                $this->validateTextNode($node, $depth);

                continue;
            }

            // Validate node attributes
            if (isset($node['attrs']) && is_array($node['attrs'])) {
                $this->validateNodeAttributes($type, $node['attrs'], $depth);
            }

            // Validate children
            if (isset($node['content']) && is_array($node['content'])) {
                $this->validateNodes($node['content'], $type, $depth + 1);
            }
        }
    }

    /**
     * Validate a text node.
     *
     * @param  array<string, mixed>  $node
     */
    protected function validateTextNode(array $node, int $depth): void
    {
        if (! isset($node['text']) || ! is_string($node['text'])) {
            $this->errors[] = "Text node at depth {$depth} is missing 'text' string.";
        }

        // Validate marks
        if (isset($node['marks']) && is_array($node['marks'])) {
            $this->validateMarks($node['marks'], $depth);
        }
    }

    /**
     * Validate marks on a text node.
     *
     * @param  array<int, array<string, mixed>>  $marks
     */
    protected function validateMarks(array $marks, int $depth): void
    {
        $allowedMarks = ['bold', 'italic', 'underline', 'strike', 'code', 'link', 'subscript', 'superscript', 'highlight', 'textStyle'];

        foreach ($marks as $mark) {
            if (! isset($mark['type'])) {
                $this->warnings[] = "Mark at depth {$depth} is missing 'type'.";

                continue;
            }

            if (! in_array($mark['type'], $allowedMarks, true)) {
                $this->warnings[] = "Unknown mark type '{$mark['type']}' at depth {$depth}.";
            }

            // Validate link mark URLs
            if ($mark['type'] === 'link') {
                $href = $mark['attrs']['href'] ?? null;
                if ($href !== null && ! $this->isValidUrl($href)) {
                    $this->errors[] = "Link mark at depth {$depth} contains unsafe URL.";
                }
            }
        }
    }

    /**
     * Validate node attributes against schema.
     *
     * @param  array<string, mixed>  $attrs
     */
    protected function validateNodeAttributes(string $type, array $attrs, int $depth): void
    {
        $allowed = $this->nodeRegistry->getAllowedAttributes($type);

        if ($allowed === null) {
            return; // Unknown type, skip in non-strict mode
        }

        foreach ($attrs as $key => $value) {
            if (! in_array($key, $allowed, true)) {
                $this->warnings[] = "Unknown attribute '{$key}' on '{$type}' at depth {$depth}.";
            }
        }

        // Validate URL-type attributes
        $urlAttrs = ['src', 'url', 'href'];
        foreach ($urlAttrs as $urlAttr) {
            if (isset($attrs[$urlAttr]) && is_string($attrs[$urlAttr]) && ! $this->isValidUrl($attrs[$urlAttr])) {
                $this->errors[] = "Attribute '{$urlAttr}' on '{$type}' at depth {$depth} contains unsafe URL.";
            }
        }

        // Validate heading level
        if ($type === 'heading' && isset($attrs['level'])) {
            $level = (int) $attrs['level'];
            if ($level < 1 || $level > 6) {
                $this->errors[] = "Invalid heading level {$level} at depth {$depth}.";
            }
        }

        // Validate alert type
        if ($type === 'bootstrapAlert' && isset($attrs['type'])) {
            $allowedTypes = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];
            if (! in_array($attrs['type'], $allowedTypes, true)) {
                $this->warnings[] = "Unknown alert type '{$attrs['type']}' at depth {$depth}.";
            }
        }

        // Validate button variant
        if ($type === 'bootstrapButton' && isset($attrs['variant'])) {
            $allowedVariants = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'link'];
            if (! in_array($attrs['variant'], $allowedVariants, true)) {
                $this->warnings[] = "Unknown button variant '{$attrs['variant']}' at depth {$depth}.";
            }
        }
    }

    /**
     * Check if a URL is safe (no javascript:, data:, etc.).
     */
    protected function isValidUrl(string $url): bool
    {
        $url = trim($url);

        if ($url === '' || $url === '#') {
            return true;
        }

        // Block dangerous schemes
        $dangerousSchemes = ['javascript:', 'data:', 'vbscript:', 'file:'];
        $urlLower = strtolower($url);

        foreach ($dangerousSchemes as $scheme) {
            if (str_starts_with($urlLower, $scheme)) {
                return false;
            }
        }

        // Check for event handler injection
        if (preg_match('/on\w+\s*=/i', $url)) {
            return false;
        }

        return true;
    }
}
