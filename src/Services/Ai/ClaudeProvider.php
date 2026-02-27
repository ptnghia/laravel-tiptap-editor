<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Services\Ai;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Suspended\TiptapEditor\Contracts\AiProviderInterface;

/**
 * Anthropic Claude provider for AI content generation.
 *
 * Supports Claude 4 Sonnet, Claude 3.5 Sonnet, Claude 3 Haiku, and compatible models
 * via the Anthropic Messages API.
 */
class ClaudeProvider implements AiProviderInterface
{
    /**
     * Anthropic Messages API endpoint.
     */
    protected const API_URL = 'https://api.anthropic.com/v1/messages';

    /**
     * Anthropic API version header.
     */
    protected const API_VERSION = '2023-06-01';

    /**
     * Supported capabilities for this provider.
     *
     * @var array<string>
     */
    protected const CAPABILITIES = ['generate', 'refine', 'summarize', 'translate'];

    /**
     * Provider configuration.
     *
     * @var array<string, mixed>
     */
    protected array $config;

    /**
     * Create a new ClaudeProvider instance.
     *
     * @param  array<string, mixed>  $config  Provider-specific config from tiptap-editor.ai.providers.claude
     */
    public function __construct(array $config = [])
    {
        $this->config = $config;
    }

    /**
     * Generate content using Anthropic Messages API.
     *
     * @param  string  $prompt  The user message / prompt
     * @param  array<string, mixed>  $options  Override options (model, max_tokens, system_prompt)
     * @return AiResponse
     *
     * @throws \RuntimeException When API key is missing or request fails
     */
    public function generate(string $prompt, array $options = []): AiResponse
    {
        $apiKey = $this->config['api_key'] ?? null;

        if (empty($apiKey)) {
            throw new \RuntimeException('Anthropic API key is not configured. Set ANTHROPIC_API_KEY in your .env file.');
        }

        $model = $options['model'] ?? $this->config['model'] ?? 'claude-sonnet-4-20250514';
        $maxTokens = (int) ($options['max_tokens'] ?? $this->config['max_tokens'] ?? 4096);
        $systemPrompt = $options['system_prompt'] ?? config('tiptap-editor.ai.system_prompt', 'You are a professional content writer.');

        $payload = [
            'model' => $model,
            'max_tokens' => $maxTokens,
            'system' => $systemPrompt,
            'messages' => [
                ['role' => 'user', 'content' => $prompt],
            ],
        ];

        try {
            $response = Http::withHeaders([
                'x-api-key' => $apiKey,
                'anthropic-version' => self::API_VERSION,
                'Content-Type' => 'application/json',
            ])
                ->timeout(60)
                ->post(self::API_URL, $payload);

            if ($response->failed()) {
                $errorBody = $response->json('error.message', 'Unknown Anthropic API error');
                $statusCode = $response->status();

                Log::error('Anthropic API error', [
                    'status' => $statusCode,
                    'error' => $errorBody,
                    'model' => $model,
                ]);

                throw new \RuntimeException("Anthropic API error ({$statusCode}): {$errorBody}");
            }

            $data = $response->json();
            $contentBlocks = $data['content'] ?? [];
            $textContent = '';

            foreach ($contentBlocks as $block) {
                if (($block['type'] ?? '') === 'text') {
                    $textContent .= $block['text'];
                }
            }

            $stopReason = $data['stop_reason'] ?? null;
            $usage = $data['usage'] ?? [];
            $tokensUsed = ($usage['input_tokens'] ?? 0) + ($usage['output_tokens'] ?? 0);

            // Map Anthropic stop_reason to common format
            $finishReason = match ($stopReason) {
                'end_turn' => 'stop',
                'max_tokens' => 'length',
                'stop_sequence' => 'stop',
                default => $stopReason,
            };

            return new AiResponse(
                content: trim($textContent),
                tokensUsed: $tokensUsed,
                provider: $this->getKey(),
                model: $model,
                finishReason: $finishReason,
            );
        } catch (ConnectionException $e) {
            Log::error('Anthropic connection error', ['message' => $e->getMessage()]);
            throw new \RuntimeException('Failed to connect to Anthropic API: ' . $e->getMessage(), 0, $e);
        } catch (RequestException $e) {
            Log::error('Anthropic request error', ['message' => $e->getMessage()]);
            throw new \RuntimeException('Anthropic API request failed: ' . $e->getMessage(), 0, $e);
        }
    }

    /**
     * {@inheritDoc}
     */
    public function supports(string $capability): bool
    {
        return in_array($capability, self::CAPABILITIES, true);
    }

    /**
     * {@inheritDoc}
     */
    public function getName(): string
    {
        return 'Anthropic Claude';
    }

    /**
     * {@inheritDoc}
     */
    public function getKey(): string
    {
        return 'claude';
    }
}
