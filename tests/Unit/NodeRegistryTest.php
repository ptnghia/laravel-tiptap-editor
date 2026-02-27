<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Tests\Unit;

use Suspended\TiptapEditor\Support\NodeRegistry;
use Suspended\TiptapEditor\Tests\TestCase;

class NodeRegistryTest extends TestCase
{
    public function test_stores_extensions(): void
    {
        $registry = new NodeRegistry(['bold', 'italic', 'heading']);

        $this->assertTrue($registry->has('bold'));
        $this->assertTrue($registry->has('italic'));
        $this->assertFalse($registry->has('underline'));
        $this->assertCount(3, $registry->all());
    }

    public function test_registers_custom_renderer(): void
    {
        $registry = new NodeRegistry();

        $registry->registerRenderer('customNode', function ($node, $children) {
            return "<div class=\"custom\">{$children}</div>";
        });

        $renderer = $registry->getRenderer('customNode');
        $this->assertNotNull($renderer);
        $this->assertNull($registry->getRenderer('nonExistent'));
    }

    public function test_registers_blade_view_renderer(): void
    {
        $registry = new NodeRegistry();
        $registry->registerRenderer('alert', 'tiptap-editor::renders.alert');

        $this->assertSame('tiptap-editor::renders.alert', $registry->getRenderer('alert'));
    }

    public function test_returns_all_renderers(): void
    {
        $registry = new NodeRegistry();
        $registry->registerRenderer('a', 'view-a');
        $registry->registerRenderer('b', 'view-b');

        $this->assertCount(2, $registry->getRenderers());
    }
}
