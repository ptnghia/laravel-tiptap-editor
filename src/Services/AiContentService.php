<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Services;

use Suspended\TiptapEditor\Contracts\AiProviderInterface;
use Suspended\TiptapEditor\Services\Ai\AiResponse;
use Suspended\TiptapEditor\Services\Ai\ClaudeProvider;
use Suspended\TiptapEditor\Services\Ai\OpenAiProvider;

/**
 * Orchestrator for AI content generation.
 *
 * Manages multiple AI providers (strategy pattern) and provides
 * high-level content generation methods: generate, refine, summarize, translate.
 *
 * This service is optional – it only registers when ai.enabled = true.
 */
class AiContentService
{
    /**
     * AI configuration.
     *
     * @var array<string, mixed>
     */
    protected array $config;

    /**
     * Registered provider instances keyed by provider name.
     *
     * @var array<string, AiProviderInterface>
     */
    protected array $providers = [];

    /**
     * Built-in provider class map.
     *
     * @var array<string, class-string<AiProviderInterface>>
     */
    protected static array $builtInProviders = [
        'openai' => OpenAiProvider::class,
        'claude' => ClaudeProvider::class,
    ];

    /**
     * Create a new AiContentService instance.
     *
     * @param  array<string, mixed>  $config  The tiptap-editor.ai config section
     */
    public function __construct(array $config = [])
    {
        $this->config = $config;
    }

    /**
     * Check if AI is enabled.
     */
    public function isEnabled(): bool
    {
        return (bool) ($this->config['enabled'] ?? false);
    }

    /**
     * Get the default provider key.
     */
    public function defaultProvider(): string
    {
        return $this->config['default_provider'] ?? 'openai';
    }

    /**
     * Get available capabilities.
     *
     * @return array<string, bool>
     */
    public function capabilities(): array
    {
        return $this->config['capabilities'] ?? [];
    }

    /**
     * Check if a specific capability is enabled.
     */
    public function hasCapability(string $capability): bool
    {
        return (bool) ($this->config['capabilities'][$capability] ?? false);
    }

    /**
     * Resolve (and cache) a provider instance by key.
     *
     * @throws \RuntimeException When provider is not registered or configured.
     */
    public function resolveProvider(?string $providerKey = null): AiProviderInterface
    {
        $key = $providerKey ?? $this->defaultProvider();

        if (isset($this->providers[$key])) {
            return $this->providers[$key];
        }

        $providerConfig = $this->config['providers'][$key] ?? [];

        if (isset(self::$builtInProviders[$key])) {
            $class = self::$builtInProviders[$key];
            $this->providers[$key] = new $class($providerConfig);

            return $this->providers[$key];
        }

        throw new \RuntimeException("AI provider '{$key}' is not registered. Available: " . implode(', ', array_keys(self::$builtInProviders)));
    }

    /**
     * Register a custom AI provider instance.
     *
     * @param  string  $key  Provider key (used in config)
     * @param  AiProviderInterface  $provider  Provider instance
     */
    public function registerProvider(string $key, AiProviderInterface $provider): void
    {
        $this->providers[$key] = $provider;
    }

    /**
     * Register a custom provider class for lazy instantiation.
     *
     * @param  string  $key  Provider key
     * @param  class-string<AiProviderInterface>  $class  Provider class name
     */
    public static function registerProviderClass(string $key, string $class): void
    {
        self::$builtInProviders[$key] = $class;
    }

    /**
     * Generate new content from a prompt.
     *
     * @param  string  $prompt  Content generation prompt
     * @param  array<string, mixed>  $options  Additional options (provider, model, max_tokens, etc.)
     * @return AiResponse
     *
     * @throws \RuntimeException When capability is disabled or provider fails
     */
    public function generate(string $prompt, array $options = []): AiResponse
    {
        $this->assertCapability('generate');
        $this->assertPromptNotEmpty($prompt);

        $provider = $this->resolveProvider($options['provider'] ?? null);
        $systemPrompt = $options['system_prompt'] ?? $this->config['system_prompt'] ?? null;

        if ($systemPrompt !== null) {
            $options['system_prompt'] = $systemPrompt;
        }

        return $provider->generate($prompt, $options);
    }

    /**
     * Refine / rewrite existing content based on an instruction.
     *
     * @param  string  $content  The existing content to refine
     * @param  string  $instruction  What to do with the content (e.g., "make it more formal")
     * @param  array<string, mixed>  $options  Additional options
     * @return AiResponse
     *
     * @throws \RuntimeException When capability is disabled or provider fails
     */
    public function refine(string $content, string $instruction, array $options = []): AiResponse
    {
        $this->assertCapability('refine');
        $this->assertPromptNotEmpty($content);

        $prompt = "Here is the existing content:\n\n{$content}\n\nInstruction: {$instruction}\n\nPlease rewrite the content according to the instruction. Output only the improved content in HTML format.";

        $options['system_prompt'] = $options['system_prompt']
            ?? 'You are a professional content editor. Refine and improve content while preserving the original meaning. Output clean HTML.';

        $provider = $this->resolveProvider($options['provider'] ?? null);

        return $provider->generate($prompt, $options);
    }

    /**
     * Summarize content to a specified length.
     *
     * @param  string  $content  The content to summarize
     * @param  int  $maxLength  Maximum summary length in words (approximate)
     * @param  array<string, mixed>  $options  Additional options
     * @return AiResponse
     *
     * @throws \RuntimeException When capability is disabled or provider fails
     */
    public function summarize(string $content, int $maxLength = 150, array $options = []): AiResponse
    {
        $this->assertCapability('summarize');
        $this->assertPromptNotEmpty($content);

        $prompt = "Summarize the following content in approximately {$maxLength} words or less:\n\n{$content}\n\nProvide a concise summary in HTML format using paragraphs.";

        $options['system_prompt'] = $options['system_prompt']
            ?? 'You are a professional summarizer. Create concise, accurate summaries that capture the key points. Output clean HTML.';

        $provider = $this->resolveProvider($options['provider'] ?? null);

        return $provider->generate($prompt, $options);
    }

    /**
     * Translate content to a target language.
     *
     * @param  string  $content  The content to translate
     * @param  string  $targetLang  Target language name or code (e.g., 'Vietnamese', 'vi', 'Japanese')
     * @param  array<string, mixed>  $options  Additional options
     * @return AiResponse
     *
     * @throws \RuntimeException When capability is disabled or provider fails
     */
    public function translate(string $content, string $targetLang, array $options = []): AiResponse
    {
        $this->assertCapability('translate');
        $this->assertPromptNotEmpty($content);

        $prompt = "Translate the following content to {$targetLang}. Preserve all HTML formatting, structure, and tags exactly. Only translate the text content:\n\n{$content}";

        $options['system_prompt'] = $options['system_prompt']
            ?? 'You are a professional translator. Translate content accurately while preserving HTML structure and formatting. Output the translated HTML.';

        $provider = $this->resolveProvider($options['provider'] ?? null);

        return $provider->generate($prompt, $options);
    }

    /**
     * Get the list of available provider keys.
     *
     * @return array<string>
     */
    public function availableProviders(): array
    {
        return array_unique(array_merge(
            array_keys(self::$builtInProviders),
            array_keys($this->providers),
        ));
    }

    /**
     * Assert that a capability is enabled.
     *
     * @throws \RuntimeException When the capability is not enabled
     */
    protected function assertCapability(string $capability): void
    {
        if (! $this->hasCapability($capability)) {
            throw new \RuntimeException("AI capability '{$capability}' is not enabled. Enable it in config: tiptap-editor.ai.capabilities.{$capability}");
        }
    }

    /**
     * Assert that a prompt/content is not empty.
     *
     * @throws \InvalidArgumentException When the prompt is empty
     */
    protected function assertPromptNotEmpty(string $prompt): void
    {
        if (trim($prompt) === '') {
            throw new \InvalidArgumentException('AI prompt/content cannot be empty.');
        }
    }
}
