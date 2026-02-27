<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Tests\Unit;

use Suspended\TiptapEditor\Tests\TestCase;
use Suspended\TiptapEditor\View\Components\TiptapEditor;

class Phase8BConfigTest extends TestCase
{
    /**
     * Theme config defaults to 'auto'.
     */
    public function test_theme_defaults_to_auto(): void
    {
        $this->assertSame('auto', config('tiptap-editor.theme'));
    }

    /**
     * Theme config accepts valid values.
     */
    public function test_theme_accepts_dark_value(): void
    {
        config()->set('tiptap-editor.theme', 'dark');
        $this->assertSame('dark', config('tiptap-editor.theme'));
    }

    /**
     * Theme config accepts light value.
     */
    public function test_theme_accepts_light_value(): void
    {
        config()->set('tiptap-editor.theme', 'light');
        $this->assertSame('light', config('tiptap-editor.theme'));
    }

    /**
     * Toolbar utils group contains expected buttons.
     */
    public function test_toolbar_utils_group_exists(): void
    {
        $toolbar = config('tiptap-editor.toolbar.groups');
        $this->assertArrayHasKey('utils', $toolbar);
        $this->assertContains('gallery', $toolbar['utils']);
        $this->assertContains('darkMode', $toolbar['utils']);
        $this->assertContains('shortcuts', $toolbar['utils']);
    }

    /**
     * TiptapEditor component includes theme in config.
     */
    public function test_editor_component_includes_theme(): void
    {
        $component = new TiptapEditor();
        $config = $component->editorConfig();

        $this->assertArrayHasKey('theme', $config);
        $this->assertSame('auto', $config['theme']);
    }

    /**
     * TiptapEditor component respects custom theme config.
     */
    public function test_editor_component_respects_custom_theme(): void
    {
        config()->set('tiptap-editor.theme', 'dark');
        $component = new TiptapEditor();
        $config = $component->editorConfig();

        $this->assertSame('dark', $config['theme']);
    }

    /**
     * TiptapEditor component allows theme override via config prop.
     */
    public function test_editor_component_allows_theme_override(): void
    {
        $component = new TiptapEditor(config: ['theme' => 'light']);
        $config = $component->editorConfig();

        $this->assertSame('light', $config['theme']);
    }

    /**
     * Gallery extension is in default extensions list.
     */
    public function test_gallery_in_default_extensions(): void
    {
        $extensions = config('tiptap-editor.extensions');
        $this->assertContains('gallery', $extensions);
    }

    /**
     * English translations contain shortcuts section.
     */
    public function test_en_translations_have_shortcuts(): void
    {
        $this->assertNotEmpty(__('tiptap-editor::editor.shortcuts.title'));
        $this->assertNotEmpty(__('tiptap-editor::editor.shortcuts.close'));
    }

    /**
     * English translations contain theme section.
     */
    public function test_en_translations_have_theme(): void
    {
        $this->assertNotEmpty(__('tiptap-editor::editor.theme.toggle'));
        $this->assertNotEmpty(__('tiptap-editor::editor.theme.light'));
        $this->assertNotEmpty(__('tiptap-editor::editor.theme.dark'));
        $this->assertNotEmpty(__('tiptap-editor::editor.theme.auto'));
    }

    /**
     * English translations contain preview section.
     */
    public function test_en_translations_have_preview(): void
    {
        $this->assertNotEmpty(__('tiptap-editor::editor.preview.label'));
        $this->assertNotEmpty(__('tiptap-editor::editor.preview.desktop'));
        $this->assertNotEmpty(__('tiptap-editor::editor.preview.tablet'));
        $this->assertNotEmpty(__('tiptap-editor::editor.preview.mobile'));
    }

    /**
     * English translations contain gallery section.
     */
    public function test_en_translations_have_gallery(): void
    {
        $this->assertNotEmpty(__('tiptap-editor::editor.gallery.label'));
        $this->assertNotEmpty(__('tiptap-editor::editor.gallery.insert'));
    }
}
