<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Contracts;

use Suspended\TiptapEditor\Services\Ai\AiResponse;

/**
 * Contract for AI content generation providers.
 *
 * Each provider (OpenAI, Claude, etc.) must implement this interface
 * to integrate with the AiContentService.
 */
interface AiProviderInterface
{
    /**
     * Generate content from a prompt.
     *
     * @param  string  $prompt  The user prompt
     * @param  array<string, mixed>  $options  Provider-specific options (model, temperature, max_tokens, etc.)
     * @return AiResponse
     */
    public function generate(string $prompt, array $options = []): AiResponse;

    /**
     * Check if this provider supports a specific capability.
     *
     * Capabilities: generate, refine, summarize, translate
     *
     * @param  string  $capability
     * @return bool
     */
    public function supports(string $capability): bool;

    /**
     * Get the provider's display name.
     *
     * @return string
     */
    public function getName(): string;

    /**
     * Get the provider's identifier key used in config.
     *
     * @return string
     */
    public function getKey(): string;
}
