<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Tests\Unit\Services\Ai;

use Suspended\TiptapEditor\Services\Ai\AiResponse;
use Suspended\TiptapEditor\Tests\TestCase;

/**
 * Tests for AiResponse value object.
 */
class AiResponseTest extends TestCase
{
    public function test_basic_construction(): void
    {
        $response = new AiResponse(
            content: '<p>Hello world</p>',
            tokensUsed: 100,
            provider: 'openai',
            model: 'gpt-4o-mini',
            finishReason: 'stop',
        );

        $this->assertSame('<p>Hello world</p>', $response->content);
        $this->assertSame(100, $response->tokensUsed);
        $this->assertSame('openai', $response->provider);
        $this->assertSame('gpt-4o-mini', $response->model);
        $this->assertSame('stop', $response->finishReason);
    }

    public function test_has_content_true(): void
    {
        $response = new AiResponse(content: '<p>Content</p>');
        $this->assertTrue($response->hasContent());
    }

    public function test_has_content_false(): void
    {
        $response = new AiResponse(content: '');
        $this->assertFalse($response->hasContent());
    }

    public function test_has_content_whitespace_only(): void
    {
        $response = new AiResponse(content: '   ');
        $this->assertFalse($response->hasContent());
    }

    public function test_has_tiptap_json_true(): void
    {
        $json = ['type' => 'doc', 'content' => []];
        $response = new AiResponse(content: '', tiptapJson: $json);
        $this->assertTrue($response->hasTiptapJson());
    }

    public function test_has_tiptap_json_false_null(): void
    {
        $response = new AiResponse(content: '');
        $this->assertFalse($response->hasTiptapJson());
    }

    public function test_has_tiptap_json_false_empty(): void
    {
        $response = new AiResponse(content: '', tiptapJson: []);
        $this->assertFalse($response->hasTiptapJson());
    }

    public function test_was_truncated_length(): void
    {
        $response = new AiResponse(content: 'text', finishReason: 'length');
        $this->assertTrue($response->wasTruncated());
    }

    public function test_was_truncated_max_tokens(): void
    {
        $response = new AiResponse(content: 'text', finishReason: 'max_tokens');
        $this->assertTrue($response->wasTruncated());
    }

    public function test_was_not_truncated_stop(): void
    {
        $response = new AiResponse(content: 'text', finishReason: 'stop');
        $this->assertFalse($response->wasTruncated());
    }

    public function test_to_array(): void
    {
        $response = new AiResponse(
            content: '<p>Test</p>',
            tokensUsed: 50,
            provider: 'claude',
            model: 'claude-sonnet-4-20250514',
            finishReason: 'stop',
        );

        $array = $response->toArray();

        $this->assertSame('<p>Test</p>', $array['content']);
        $this->assertSame(50, $array['tokens_used']);
        $this->assertSame('claude', $array['provider']);
        $this->assertSame('claude-sonnet-4-20250514', $array['model']);
        $this->assertSame('stop', $array['finish_reason']);
        $this->assertFalse($array['truncated']);
        $this->assertNull($array['tiptap_json']);
    }

    public function test_defaults(): void
    {
        $response = new AiResponse(content: 'text');

        $this->assertNull($response->tiptapJson);
        $this->assertSame(0, $response->tokensUsed);
        $this->assertSame('', $response->provider);
        $this->assertSame('', $response->model);
        $this->assertNull($response->finishReason);
    }
}
