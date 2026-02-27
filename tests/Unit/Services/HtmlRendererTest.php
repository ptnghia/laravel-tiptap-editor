<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Tests\Unit\Services;

use Suspended\TiptapEditor\Services\HtmlRenderer;
use Suspended\TiptapEditor\Support\NodeRegistry;
use Suspended\TiptapEditor\Tests\TestCase;

class HtmlRendererTest extends TestCase
{
    protected HtmlRenderer $renderer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->renderer = new HtmlRenderer(new NodeRegistry());
    }

    public function test_renders_empty_content(): void
    {
        $this->assertSame('', $this->renderer->render([]));
        $this->assertSame('', $this->renderer->render(''));
        $this->assertSame('', $this->renderer->render('{}'));
    }

    public function test_renders_paragraph(): void
    {
        $json = [
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

        $this->assertSame('<p>Hello world</p>', $this->renderer->render($json));
    }

    public function test_renders_heading(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'heading',
                    'attrs' => ['level' => 2],
                    'content' => [
                        ['type' => 'text', 'text' => 'Title'],
                    ],
                ],
            ],
        ];

        $this->assertSame('<h2>Title</h2>', $this->renderer->render($json));
    }

    public function test_renders_bold_mark(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'paragraph',
                    'content' => [
                        [
                            'type' => 'text',
                            'text' => 'bold text',
                            'marks' => [['type' => 'bold']],
                        ],
                    ],
                ],
            ],
        ];

        $this->assertSame('<p><strong>bold text</strong></p>', $this->renderer->render($json));
    }

    public function test_renders_link_mark(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'paragraph',
                    'content' => [
                        [
                            'type' => 'text',
                            'text' => 'click here',
                            'marks' => [
                                [
                                    'type' => 'link',
                                    'attrs' => [
                                        'href' => 'https://example.com',
                                        'target' => '_blank',
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);
        $this->assertStringContainsString('href="https://example.com"', $html);
        $this->assertStringContainsString('target="_blank"', $html);
        $this->assertStringContainsString('rel="noopener noreferrer"', $html);
    }

    public function test_renders_json_string_input(): void
    {
        $jsonString = json_encode([
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'paragraph',
                    'content' => [
                        ['type' => 'text', 'text' => 'From string'],
                    ],
                ],
            ],
        ]);

        $this->assertSame('<p>From string</p>', $this->renderer->render($jsonString));
    }

    public function test_renders_list(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'bulletList',
                    'content' => [
                        [
                            'type' => 'listItem',
                            'content' => [
                                [
                                    'type' => 'paragraph',
                                    'content' => [
                                        ['type' => 'text', 'text' => 'Item 1'],
                                    ],
                                ],
                            ],
                        ],
                        [
                            'type' => 'listItem',
                            'content' => [
                                [
                                    'type' => 'paragraph',
                                    'content' => [
                                        ['type' => 'text', 'text' => 'Item 2'],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);
        $this->assertSame('<ul><li><p>Item 1</p></li><li><p>Item 2</p></li></ul>', $html);
    }

    public function test_escapes_html_in_text(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'paragraph',
                    'content' => [
                        ['type' => 'text', 'text' => '<script>alert("xss")</script>'],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);
        $this->assertStringNotContainsString('<script>', $html);
        $this->assertStringContainsString('&lt;script&gt;', $html);
    }

    public function test_renders_horizontal_rule(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                ['type' => 'horizontalRule'],
            ],
        ];

        $this->assertSame('<hr>', $this->renderer->render($json));
    }

    public function test_renders_multiple_marks(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'paragraph',
                    'content' => [
                        [
                            'type' => 'text',
                            'text' => 'formatted',
                            'marks' => [
                                ['type' => 'bold'],
                                ['type' => 'italic'],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);
        $this->assertSame('<p><em><strong>formatted</strong></em></p>', $html);
    }
}
