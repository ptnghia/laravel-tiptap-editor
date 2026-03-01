<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Services\ClassMap;

interface ClassMapInterface
{
    /**
     * Get CSS class string for a component.
     *
     * @param  string  $component  Component key (e.g. 'alert', 'card.header', 'table')
     * @param  array<string, mixed>  $modifiers  Context modifiers (e.g. ['type' => 'danger', 'size' => 'sm'])
     * @return string  CSS class string
     */
    public function get(string $component, array $modifiers = []): string;

    /**
     * Get the theme name ('bootstrap' or 'tailwind').
     */
    public function theme(): string;

    /**
     * Whether this is a Tailwind-based theme.
     * Used to decide whether to add data-tiptap-* attributes for fallback CSS.
     */
    public function isTailwind(): bool;
}
