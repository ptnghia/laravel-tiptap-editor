<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Tests\Unit;

use Suspended\TiptapEditor\Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * Verify that the package config is loaded.
     */
    public function test_config_is_loaded(): void
    {
        $this->assertNotNull(config('tiptap-editor'));
        $this->assertIsArray(config('tiptap-editor.extensions'));
    }

    /**
     * Verify that AI is disabled by default.
     */
    public function test_ai_is_disabled_by_default(): void
    {
        $this->assertFalse(config('tiptap-editor.ai.enabled'));
    }
}
