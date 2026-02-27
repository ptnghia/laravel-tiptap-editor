<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Tests\Unit\Support;

use Suspended\TiptapEditor\Support\AiPromptTemplates;
use Suspended\TiptapEditor\Tests\TestCase;

/**
 * Tests for AiPromptTemplates.
 */
class AiPromptTemplatesTest extends TestCase
{
    public function test_blog_post_prompt(): void
    {
        $prompt = AiPromptTemplates::blogPost('Laravel Tips', 'casual', 500);

        $this->assertStringContainsString('Laravel Tips', $prompt);
        $this->assertStringContainsString('casual', $prompt);
        $this->assertStringContainsString('500', $prompt);
        $this->assertStringContainsString('<h1>', $prompt);
        $this->assertStringContainsString('HTML', $prompt);
    }

    public function test_product_description_prompt(): void
    {
        $prompt = AiPromptTemplates::productDescription(
            'Widget Pro',
            ['Fast', 'Reliable', 'Affordable'],
            'developers'
        );

        $this->assertStringContainsString('Widget Pro', $prompt);
        $this->assertStringContainsString('Fast, Reliable, Affordable', $prompt);
        $this->assertStringContainsString('developers', $prompt);
    }

    public function test_product_description_empty_features(): void
    {
        $prompt = AiPromptTemplates::productDescription('Widget');
        $this->assertStringContainsString('key benefits and features', $prompt);
    }

    public function test_faq_prompt(): void
    {
        $prompt = AiPromptTemplates::faq('E-commerce', 8);
        $this->assertStringContainsString('E-commerce', $prompt);
        $this->assertStringContainsString('8', $prompt);
        $this->assertStringContainsString('<h3>', $prompt);
    }

    public function test_seo_meta_prompt(): void
    {
        $prompt = AiPromptTemplates::seoMeta('<p>About us page content</p>');
        $this->assertStringContainsString('About us page content', $prompt);
        $this->assertStringContainsString('meta title', $prompt);
        $this->assertStringContainsString('meta description', $prompt);
    }

    public function test_outline_prompt(): void
    {
        $prompt = AiPromptTemplates::outline('Machine Learning', 6);
        $this->assertStringContainsString('Machine Learning', $prompt);
        $this->assertStringContainsString('6', $prompt);
        $this->assertStringContainsString('<h2>', $prompt);
    }

    public function test_rewrite_with_tone_prompt(): void
    {
        $prompt = AiPromptTemplates::rewriteWithTone('<p>Draft text</p>', 'formal');
        $this->assertStringContainsString('Draft text', $prompt);
        $this->assertStringContainsString('formal', $prompt);
    }

    public function test_grammar_fix_prompt(): void
    {
        $prompt = AiPromptTemplates::grammarFix('<p>There alot of mistake here</p>');
        $this->assertStringContainsString('There alot of mistake here', $prompt);
        $this->assertStringContainsString('grammar', $prompt);
    }

    public function test_expand_prompt(): void
    {
        $prompt = AiPromptTemplates::expand('<p>Short text</p>', 800);
        $this->assertStringContainsString('Short text', $prompt);
        $this->assertStringContainsString('800', $prompt);
    }

    public function test_shorten_prompt(): void
    {
        $prompt = AiPromptTemplates::shorten('<p>Very long detailed text</p>');
        $this->assertStringContainsString('Very long detailed text', $prompt);
        $this->assertStringContainsString('50%', $prompt);
    }

    public function test_available_templates(): void
    {
        $templates = AiPromptTemplates::availableTemplates();
        $this->assertContains('blog_post', $templates);
        $this->assertContains('product_description', $templates);
        $this->assertContains('faq', $templates);
        $this->assertContains('seo_meta', $templates);
        $this->assertContains('outline', $templates);
        $this->assertContains('grammar_fix', $templates);
        $this->assertContains('expand', $templates);
        $this->assertContains('shorten', $templates);
        $this->assertCount(9, $templates);
    }

    public function test_from_config_returns_null_for_missing(): void
    {
        $this->assertNull(AiPromptTemplates::fromConfig('nonexistent'));
    }

    public function test_from_config_resolves_template(): void
    {
        // Set a custom template in config
        config(['tiptap-editor.ai.prompt_templates.greeting' => 'Hello, :name! Welcome to :place.']);

        $result = AiPromptTemplates::fromConfig('greeting', [
            'name' => 'World',
            'place' => 'Laravel',
        ]);

        $this->assertSame('Hello, World! Welcome to Laravel.', $result);
    }
}
