<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Tests\Unit\Services;

use Suspended\TiptapEditor\Contracts\AiProviderInterface;
use Suspended\TiptapEditor\Services\Ai\AiResponse;
use Suspended\TiptapEditor\Services\AiContentService;
use Suspended\TiptapEditor\Tests\TestCase;

/**
 * Tests for AiContentService orchestrator.
 *
 * Uses a mock provider to avoid real API calls.
 */
class AiContentServiceTest extends TestCase
{
    /**
     * Create a service with full capabilities enabled.
     */
    protected function makeService(array $overrides = []): AiContentService
    {
        $config = array_merge([
            'enabled' => true,
            'default_provider' => 'openai',
            'providers' => [
                'openai' => ['api_key' => 'test-key', 'model' => 'gpt-4o-mini'],
                'claude' => ['api_key' => 'test-key', 'model' => 'claude-sonnet-4-20250514'],
            ],
            'capabilities' => [
                'generate' => true,
                'refine' => true,
                'summarize' => true,
                'translate' => true,
            ],
            'system_prompt' => 'You are a test assistant.',
        ], $overrides);

        return new AiContentService($config);
    }

    /**
     * Create a simple mock provider.
     */
    protected function mockProvider(string $content = '<p>Mocked content</p>'): AiProviderInterface
    {
        return new class ($content) implements AiProviderInterface {
            public function __construct(private string $content)
            {
            }

            public function generate(string $prompt, array $options = []): AiResponse
            {
                return new AiResponse(
                    content: $this->content,
                    tokensUsed: 42,
                    provider: 'mock',
                    model: 'mock-v1',
                    finishReason: 'stop',
                );
            }

            public function supports(string $capability): bool
            {
                return true;
            }

            public function getName(): string
            {
                return 'Mock Provider';
            }

            public function getKey(): string
            {
                return 'mock';
            }
        };
    }

    // ── Basic Tests ───────────────────────────────

    public function test_is_enabled(): void
    {
        $service = $this->makeService();
        $this->assertTrue($service->isEnabled());

        $disabled = $this->makeService(['enabled' => false]);
        $this->assertFalse($disabled->isEnabled());
    }

    public function test_default_provider(): void
    {
        $service = $this->makeService();
        $this->assertSame('openai', $service->defaultProvider());

        $claude = $this->makeService(['default_provider' => 'claude']);
        $this->assertSame('claude', $claude->defaultProvider());
    }

    public function test_capabilities(): void
    {
        $service = $this->makeService();
        $this->assertTrue($service->hasCapability('generate'));
        $this->assertTrue($service->hasCapability('translate'));
        $this->assertFalse($service->hasCapability('nonexistent'));
    }

    public function test_available_providers(): void
    {
        $service = $this->makeService();
        $providers = $service->availableProviders();
        $this->assertContains('openai', $providers);
        $this->assertContains('claude', $providers);
    }

    // ── Provider Resolution ───────────────────────

    public function test_resolve_openai_provider(): void
    {
        $service = $this->makeService();
        $provider = $service->resolveProvider('openai');
        $this->assertSame('openai', $provider->getKey());
        $this->assertSame('OpenAI', $provider->getName());
    }

    public function test_resolve_claude_provider(): void
    {
        $service = $this->makeService();
        $provider = $service->resolveProvider('claude');
        $this->assertSame('claude', $provider->getKey());
        $this->assertSame('Anthropic Claude', $provider->getName());
    }

    public function test_resolve_unknown_provider_throws(): void
    {
        $service = $this->makeService();
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage("AI provider 'unknown' is not registered");
        $service->resolveProvider('unknown');
    }

    public function test_register_custom_provider(): void
    {
        $service = $this->makeService();
        $mock = $this->mockProvider();
        $service->registerProvider('mock', $mock);

        $resolved = $service->resolveProvider('mock');
        $this->assertSame('mock', $resolved->getKey());
    }

    public function test_provider_is_cached(): void
    {
        $service = $this->makeService();
        $first = $service->resolveProvider('openai');
        $second = $service->resolveProvider('openai');
        $this->assertSame($first, $second);
    }

    // ── Generate ──────────────────────────────────

    public function test_generate_with_mock(): void
    {
        $service = $this->makeService();
        $service->registerProvider('openai', $this->mockProvider('<p>Generated</p>'));

        $response = $service->generate('Write about PHP');
        $this->assertSame('<p>Generated</p>', $response->content);
        $this->assertSame(42, $response->tokensUsed);
        $this->assertSame('mock', $response->provider);
    }

    public function test_generate_empty_prompt_throws(): void
    {
        $service = $this->makeService();
        $this->expectException(\InvalidArgumentException::class);
        $service->generate('');
    }

    public function test_generate_whitespace_prompt_throws(): void
    {
        $service = $this->makeService();
        $this->expectException(\InvalidArgumentException::class);
        $service->generate('   ');
    }

    public function test_generate_disabled_capability_throws(): void
    {
        $service = $this->makeService([
            'capabilities' => ['generate' => false, 'refine' => true, 'summarize' => true, 'translate' => true],
        ]);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage("AI capability 'generate' is not enabled");
        $service->generate('Hello');
    }

    // ── Refine ────────────────────────────────────

    public function test_refine_with_mock(): void
    {
        $service = $this->makeService();
        $service->registerProvider('openai', $this->mockProvider('<p>Refined</p>'));

        $response = $service->refine('<p>Draft text</p>', 'Make it formal');
        $this->assertSame('<p>Refined</p>', $response->content);
    }

    public function test_refine_empty_content_throws(): void
    {
        $service = $this->makeService();
        $this->expectException(\InvalidArgumentException::class);
        $service->refine('', 'Make formal');
    }

    // ── Summarize ─────────────────────────────────

    public function test_summarize_with_mock(): void
    {
        $service = $this->makeService();
        $service->registerProvider('openai', $this->mockProvider('<p>Summary</p>'));

        $response = $service->summarize('<p>Long content here...</p>', 100);
        $this->assertSame('<p>Summary</p>', $response->content);
    }

    // ── Translate ─────────────────────────────────

    public function test_translate_with_mock(): void
    {
        $service = $this->makeService();
        $service->registerProvider('openai', $this->mockProvider('<p>Nội dung dịch</p>'));

        $response = $service->translate('<p>Content to translate</p>', 'Vietnamese');
        $this->assertSame('<p>Nội dung dịch</p>', $response->content);
    }

    public function test_translate_disabled_throws(): void
    {
        $service = $this->makeService([
            'capabilities' => ['generate' => true, 'refine' => true, 'summarize' => true, 'translate' => false],
        ]);

        $this->expectException(\RuntimeException::class);
        $service->translate('<p>Text</p>', 'French');
    }

    // ── Provider Selection ────────────────────────

    public function test_generate_with_specific_provider(): void
    {
        $service = $this->makeService();
        $service->registerProvider('claude', $this->mockProvider('<p>Claude output</p>'));

        $response = $service->generate('Test', ['provider' => 'claude']);
        $this->assertSame('<p>Claude output</p>', $response->content);
    }
}
