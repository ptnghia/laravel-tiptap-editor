<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Services\Ai;

/**
 * Value object representing an AI provider response.
 *
 * Holds the generated content along with metadata about
 * token usage, provider, and model information.
 */
class AiResponse
{
    /**
     * Create a new AiResponse instance.
     *
     * @param  string  $content  The generated content (HTML or plain text)
     * @param  array<string, mixed>|null  $tiptapJson  Optional Tiptap JSON representation
     * @param  int  $tokensUsed  Total tokens consumed (prompt + completion)
     * @param  string  $provider  Provider key (e.g., 'openai', 'claude')
     * @param  string  $model  Model identifier used
     * @param  string|null  $finishReason  Why the generation stopped (e.g., 'stop', 'length')
     */
    public function __construct(
        public readonly string $content,
        public readonly ?array $tiptapJson = null,
        public readonly int $tokensUsed = 0,
        public readonly string $provider = '',
        public readonly string $model = '',
        public readonly ?string $finishReason = null,
    ) {
    }

    /**
     * Check if the response contains valid content.
     */
    public function hasContent(): bool
    {
        return trim($this->content) !== '';
    }

    /**
     * Check if the response contains Tiptap JSON.
     */
    public function hasTiptapJson(): bool
    {
        return $this->tiptapJson !== null && ! empty($this->tiptapJson);
    }

    /**
     * Check if generation was cut off due to token limits.
     */
    public function wasTruncated(): bool
    {
        return $this->finishReason === 'length' || $this->finishReason === 'max_tokens';
    }

    /**
     * Convert to array representation.
     *
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'content' => $this->content,
            'tiptap_json' => $this->tiptapJson,
            'tokens_used' => $this->tokensUsed,
            'provider' => $this->provider,
            'model' => $this->model,
            'finish_reason' => $this->finishReason,
            'truncated' => $this->wasTruncated(),
        ];
    }
}
