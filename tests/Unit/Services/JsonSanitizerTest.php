<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Tests\Unit\Services;

use Suspended\TiptapEditor\Services\JsonSanitizer;
use Suspended\TiptapEditor\Support\NodeRegistry;
use Suspended\TiptapEditor\Tests\TestCase;

/**
 * Tests for the enhanced JsonSanitizer.
 */
class JsonSanitizerTest extends TestCase
{
    protected JsonSanitizer $sanitizer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->sanitizer = new JsonSanitizer(
            new NodeRegistry(),
            config('tiptap-editor.sanitization', [])
        );
    }

    public function test_sanitize_preserves_valid_document(): void
    {
        $content = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'paragraph',
                    'content' => [
                        ['type' => 'text', 'text' => 'Hello world'],
                    ],
                ],
            ],
        ];

        $result = $this->sanitizer->sanitize($content);
        $this->assertSame('doc', $result['type']);
        $this->assertSame('Hello world', $result['content'][0]['content'][0]['text']);
    }

    public function test_sanitize_json_string_input(): void
    {
        $json = json_encode([
            'type' => 'doc',
            'content' => [
                ['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'ok']]],
            ],
        ]);

        $result = $this->sanitizer->sanitize($json);
        $this->assertSame('doc', $result['type']);
    }

    public function test_sanitize_strips_unknown_node_types(): void
    {
        $content = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'unknownBlockType',
                    'content' => [
                        ['type' => 'text', 'text' => 'Should be removed'],
                    ],
                ],
                [
                    'type' => 'paragraph',
                    'content' => [
                        ['type' => 'text', 'text' => 'Should remain'],
                    ],
                ],
            ],
        ];

        $result = $this->sanitizer->sanitize($content);
        $this->assertCount(1, $result['content']);
        $this->assertSame('paragraph', $result['content'][0]['type']);
    }

    public function test_sanitize_strips_unknown_attributes(): void
    {
        $content = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'paragraph',
                    'attrs' => [
                        'textAlign' => 'center',
                        'dangerousAttr' => 'evil',
                        'onclick' => 'alert(1)',
                    ],
                    'content' => [
                        ['type' => 'text', 'text' => 'Test'],
                    ],
                ],
            ],
        ];

        $result = $this->sanitizer->sanitize($content);
        $this->assertArrayHasKey('textAlign', $result['content'][0]['attrs']);
        $this->assertArrayNotHasKey('dangerousAttr', $result['content'][0]['attrs']);
        $this->assertArrayNotHasKey('onclick', $result['content'][0]['attrs']);
    }

    public function test_sanitize_strips_unknown_marks(): void
    {
        $content = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'paragraph',
                    'content' => [
                        [
                            'type' => 'text',
                            'text' => 'Marked text',
                            'marks' => [
                                ['type' => 'bold'],
                                ['type' => 'unknownMark'],
                                ['type' => 'italic'],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $result = $this->sanitizer->sanitize($content);
        $marks = $result['content'][0]['content'][0]['marks'];
        $this->assertCount(2, $marks);
        $types = array_column($marks, 'type');
        $this->assertContains('bold', $types);
        $this->assertContains('italic', $types);
        $this->assertNotContains('unknownMark', $types);
    }

    public function test_sanitize_url_blocks_javascript(): void
    {
        $this->assertSame('#', $this->sanitizer->sanitizeUrl('javascript:alert(1)'));
        $this->assertSame('#', $this->sanitizer->sanitizeUrl('JAVASCRIPT:alert(1)'));
    }

    public function test_sanitize_url_blocks_data(): void
    {
        $this->assertSame('#', $this->sanitizer->sanitizeUrl('data:text/html,<script>alert(1)</script>'));
    }

    public function test_sanitize_url_blocks_vbscript(): void
    {
        $this->assertSame('#', $this->sanitizer->sanitizeUrl('vbscript:MsgBox("XSS")'));
    }

    public function test_sanitize_url_allows_http(): void
    {
        $this->assertSame('https://example.com', $this->sanitizer->sanitizeUrl('https://example.com'));
        $this->assertSame('http://example.com', $this->sanitizer->sanitizeUrl('http://example.com'));
    }

    public function test_sanitize_url_allows_mailto(): void
    {
        $this->assertSame('mailto:test@example.com', $this->sanitizer->sanitizeUrl('mailto:test@example.com'));
    }

    public function test_sanitize_url_allows_relative(): void
    {
        $this->assertSame('/path/to/page', $this->sanitizer->sanitizeUrl('/path/to/page'));
    }

    public function test_sanitize_url_allows_hash(): void
    {
        $this->assertSame('#', $this->sanitizer->sanitizeUrl('#'));
        $this->assertSame('', $this->sanitizer->sanitizeUrl(''));
    }

    public function test_sanitize_strips_control_characters(): void
    {
        $content = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'paragraph',
                    'content' => [
                        ['type' => 'text', 'text' => "Hello\x00\x01\x02World"],
                    ],
                ],
            ],
        ];

        $result = $this->sanitizer->sanitize($content);
        $this->assertSame('HelloWorld', $result['content'][0]['content'][0]['text']);
    }

    public function test_sanitize_enforces_max_depth(): void
    {
        // Build deeply nested content (15 levels)
        $content = ['type' => 'doc', 'content' => []];
        $current = &$content;
        for ($i = 0; $i < 15; $i++) {
            $current['content'] = [['type' => 'blockquote', 'content' => []]];
            $current = &$current['content'][0];
        }
        $current['content'] = [['type' => 'text', 'text' => 'deep']];

        $sanitizer = new JsonSanitizer(new NodeRegistry(), ['max_nesting_depth' => 5]);
        $result = $sanitizer->sanitize($content);

        // The very deep nodes should have been stripped
        $this->assertNotEmpty($result);
    }

    public function test_sanitize_throws_on_oversized_content(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('exceeds maximum allowed size');

        $sanitizer = new JsonSanitizer(new NodeRegistry(), ['max_content_size' => 50]);
        $sanitizer->sanitize([
            'type' => 'doc',
            'content' => [
                ['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => str_repeat('A', 100)]]],
            ],
        ]);
    }

    public function test_strip_html(): void
    {
        $result = $this->sanitizer->stripHtml('<p>Hello <strong>world</strong></p>');
        $this->assertSame('Hello world', $result);
    }

    public function test_preserves_valid_heading_attrs(): void
    {
        $content = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'heading',
                    'attrs' => ['level' => 2, 'textAlign' => 'center', 'evil' => 'bad'],
                    'content' => [
                        ['type' => 'text', 'text' => 'Title'],
                    ],
                ],
            ],
        ];

        $result = $this->sanitizer->sanitize($content);
        $attrs = $result['content'][0]['attrs'];
        $this->assertSame(2, $attrs['level']);
        $this->assertSame('center', $attrs['textAlign']);
        $this->assertArrayNotHasKey('evil', $attrs);
    }

    public function test_sanitize_removes_empty_marks(): void
    {
        $content = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'paragraph',
                    'content' => [
                        [
                            'type' => 'text',
                            'text' => 'clean',
                            'marks' => [
                                ['type' => 'fakeMarkOnly'],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $result = $this->sanitizer->sanitize($content);
        // marks should be unset when all are removed
        $this->assertArrayNotHasKey('marks', $result['content'][0]['content'][0]);
    }
}
