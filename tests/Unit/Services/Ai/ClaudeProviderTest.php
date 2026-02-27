<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Tests\Unit\Services\Ai;

use Suspended\TiptapEditor\Services\Ai\ClaudeProvider;
use Suspended\TiptapEditor\Tests\TestCase;

/**
 * Tests for ClaudeProvider (unit-level, no real API calls).
 */
class ClaudeProviderTest extends TestCase
{
    public function test_name_and_key(): void
    {
        $provider = new ClaudeProvider([]);
        $this->assertSame('Anthropic Claude', $provider->getName());
        $this->assertSame('claude', $provider->getKey());
    }

    public function test_supports_all_capabilities(): void
    {
        $provider = new ClaudeProvider([]);
        $this->assertTrue($provider->supports('generate'));
        $this->assertTrue($provider->supports('refine'));
        $this->assertTrue($provider->supports('summarize'));
        $this->assertTrue($provider->supports('translate'));
        $this->assertFalse($provider->supports('imagegen'));
    }

    public function test_generate_throws_without_api_key(): void
    {
        $provider = new ClaudeProvider([]);
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Anthropic API key is not configured');
        $provider->generate('test prompt');
    }

    public function test_generate_throws_with_empty_api_key(): void
    {
        $provider = new ClaudeProvider(['api_key' => '']);
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Anthropic API key is not configured');
        $provider->generate('test prompt');
    }
}
