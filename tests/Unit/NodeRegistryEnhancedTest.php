<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Tests\Unit;

use Suspended\TiptapEditor\Support\NodeRegistry;
use Suspended\TiptapEditor\Tests\TestCase;

/**
 * Enhanced tests for NodeRegistry with schema support.
 */
class NodeRegistryEnhancedTest extends TestCase
{
    public function test_knows_default_node_types(): void
    {
        $registry = new NodeRegistry();

        $this->assertTrue($registry->isKnownNodeType('doc'));
        $this->assertTrue($registry->isKnownNodeType('paragraph'));
        $this->assertTrue($registry->isKnownNodeType('heading'));
        $this->assertTrue($registry->isKnownNodeType('text'));
        $this->assertTrue($registry->isKnownNodeType('bootstrapRow'));
        $this->assertTrue($registry->isKnownNodeType('customImage'));
    }

    public function test_unknown_types_return_false(): void
    {
        $registry = new NodeRegistry();

        $this->assertFalse($registry->isKnownNodeType('fakeNode'));
        $this->assertFalse($registry->isKnownNodeType(''));
    }

    public function test_allowed_attributes_for_heading(): void
    {
        $registry = new NodeRegistry();

        $attrs = $registry->getAllowedAttributes('heading');
        $this->assertContains('level', $attrs);
        $this->assertContains('textAlign', $attrs);
    }

    public function test_allowed_attributes_for_custom_image(): void
    {
        $registry = new NodeRegistry();

        $attrs = $registry->getAllowedAttributes('customImage');
        $this->assertContains('src', $attrs);
        $this->assertContains('alt', $attrs);
        $this->assertContains('alignment', $attrs);
        $this->assertContains('mediaId', $attrs);
    }

    public function test_allowed_children_for_doc(): void
    {
        $registry = new NodeRegistry();

        $children = $registry->getAllowedChildren('doc');
        $this->assertContains('paragraph', $children);
        $this->assertContains('heading', $children);
        $this->assertContains('bootstrapRow', $children);
    }

    public function test_register_custom_schema(): void
    {
        $registry = new NodeRegistry();

        $registry->registerNodeSchema('myCustomBlock', ['color', 'size'], ['paragraph']);

        $this->assertTrue($registry->isKnownNodeType('myCustomBlock'));
        $this->assertContains('color', $registry->getAllowedAttributes('myCustomBlock'));
        $this->assertContains('paragraph', $registry->getAllowedChildren('myCustomBlock'));
    }

    public function test_get_known_node_types(): void
    {
        $registry = new NodeRegistry();

        $types = $registry->getKnownNodeTypes();
        $this->assertContains('doc', $types);
        $this->assertContains('paragraph', $types);
        $this->assertContains('bootstrapAlert', $types);
        $this->assertContains('customVideo', $types);
    }

    public function test_unknown_type_returns_null_for_attrs(): void
    {
        $registry = new NodeRegistry();

        $this->assertNull($registry->getAllowedAttributes('nonexistent'));
        $this->assertNull($registry->getAllowedChildren('nonexistent'));
    }
}
