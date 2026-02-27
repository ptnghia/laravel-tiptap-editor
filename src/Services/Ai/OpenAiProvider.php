<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Services\Ai;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Suspended\TiptapEditor\Contracts\AiProviderInterface;

/**
 * OpenAI GPT provider for AI content generation.
 *
 * Supports GPT-4o, GPT-4o-mini, and compatible models via the Chat Completions API.
 */
class OpenAiProvider implements AiProviderInterface
{
    /**
     * OpenAI Chat Completions API endpoint.
     */
    protected const API_URL = 'https://api.openai.com/v1/chat/completions';

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
     * Create a new OpenAiProvider instance.
     *
     * @param  array<string, mixed>  $config  Provider-specific config from tiptap-editor.ai.providers.openai
     */
    public function __construct(array $config = [])
    {
        $this->config = $config;
    }

    /**
     * Generate content using OpenAI Chat Completions API.
     *
     * @param  string  $prompt  The user message / prompt
     * @param  array<string, mixed>  $options  Override options (model, temperature, max_tokens, system_prompt)
     * @return AiResponse
     *
     * @throws \RuntimeException When API key is missing or request fails
     */
    public function generate(string $prompt, array $options = []): AiResponse
    {
        $apiKey = $this->config['api_key'] ?? null;

        if (empty($apiKey)) {
            throw new \RuntimeException('OpenAI API key is not configured. Set OPENAI_API_KEY in your .env file.');
        }

        $model = $options['model'] ?? $this->config['model'] ?? 'gpt-4o-mini';
        $maxTokens = (int) ($options['max_tokens'] ?? $this->config['max_tokens'] ?? 4096);
        $temperature = (float) ($options['temperature'] ?? $this->config['temperature'] ?? 0.7);
        $systemPrompt = $options['system_prompt'] ?? config('tiptap-editor.ai.system_prompt', 'You are a professional content writer.');

        $payload = [
            'model' => $model,
            'messages' => [
                ['role' => 'system', 'content' => $systemPrompt],
                ['role' => 'user', 'content' => $prompt],
            ],
            'max_tokens' => $maxTokens,
            'temperature' => $temperature,
        ];

        $headers = [
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json',
        ];

        if (! empty($this->config['organization'])) {
            $headers['OpenAI-Organization'] = $this->config['organization'];
        }

        try {
            $response = Http::withHeaders($headers)
                ->timeout(60)
                ->post(self::API_URL, $payload);

            if ($response->failed()) {
                $errorBody = $response->json('error.message', 'Unknown OpenAI API error');
                $statusCode = $response->status();

                Log::error('OpenAI API error', [
                    'status' => $statusCode,
                    'error' => $errorBody,
                    'model' => $model,
                ]);

                throw new \RuntimeException("OpenAI API error ({$statusCode}): {$errorBody}");
            }

            $data = $response->json();
            $choice = $data['choices'][0] ?? [];
            $content = $choice['message']['content'] ?? '';
            $finishReason = $choice['finish_reason'] ?? null;
            $usage = $data['usage'] ?? [];
            $tokensUsed = ($usage['prompt_tokens'] ?? 0) + ($usage['completion_tokens'] ?? 0);

            return new AiResponse(
                content: trim($content),
                tokensUsed: $tokensUsed,
                provider: $this->getKey(),
                model: $model,
                finishReason: $finishReason,
            );
        } catch (ConnectionException $e) {
            Log::error('OpenAI connection error', ['message' => $e->getMessage()]);
            throw new \RuntimeException('Failed to connect to OpenAI API: ' . $e->getMessage(), 0, $e);
        } catch (RequestException $e) {
            Log::error('OpenAI request error', ['message' => $e->getMessage()]);
            throw new \RuntimeException('OpenAI API request failed: ' . $e->getMessage(), 0, $e);
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
        return 'OpenAI';
    }

    /**
     * {@inheritDoc}
     */
    public function getKey(): string
    {
        return 'openai';
    }
}
