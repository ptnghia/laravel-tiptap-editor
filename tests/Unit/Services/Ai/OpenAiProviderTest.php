<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Tests\Unit\Services\Ai;

use Suspended\TiptapEditor\Services\Ai\OpenAiProvider;
use Suspended\TiptapEditor\Tests\TestCase;

/**
 * Tests for OpenAiProvider (unit-level, no real API calls).
 */
class OpenAiProviderTest extends TestCase
{
    public function test_name_and_key(): void
    {
        $provider = new OpenAiProvider([]);
        $this->assertSame('OpenAI', $provider->getName());
        $this->assertSame('openai', $provider->getKey());
    }

    public function test_supports_all_capabilities(): void
    {
        $provider = new OpenAiProvider([]);
        $this->assertTrue($provider->supports('generate'));
        $this->assertTrue($provider->supports('refine'));
        $this->assertTrue($provider->supports('summarize'));
        $this->assertTrue($provider->supports('translate'));
        $this->assertFalse($provider->supports('imagegen'));
    }

    public function test_generate_throws_without_api_key(): void
    {
        $provider = new OpenAiProvider([]);
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('OpenAI API key is not configured');
        $provider->generate('test prompt');
    }

    public function test_generate_throws_with_empty_api_key(): void
    {
        $provider = new OpenAiProvider(['api_key' => '']);
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('OpenAI API key is not configured');
        $provider->generate('test prompt');
    }
}
