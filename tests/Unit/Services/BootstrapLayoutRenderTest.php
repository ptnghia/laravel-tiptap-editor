<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Tests\Unit\Services;

use Suspended\TiptapEditor\Services\HtmlRenderer;
use Suspended\TiptapEditor\Support\NodeRegistry;
use Suspended\TiptapEditor\Tests\TestCase;

class BootstrapLayoutRenderTest extends TestCase
{
    protected HtmlRenderer $renderer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->renderer = new HtmlRenderer(new NodeRegistry());
    }

    public function test_renders_bootstrap_row_with_gutter(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'bootstrapRow',
                    'attrs' => ['gutter' => 4],
                    'content' => [
                        [
                            'type' => 'bootstrapCol',
                            'attrs' => ['colClass' => 'col-md-6'],
                            'content' => [
                                [
                                    'type' => 'paragraph',
                                    'content' => [
                                        ['type' => 'text', 'text' => 'Left column'],
                                    ],
                                ],
                            ],
                        ],
                        [
                            'type' => 'bootstrapCol',
                            'attrs' => ['colClass' => 'col-md-6'],
                            'content' => [
                                [
                                    'type' => 'paragraph',
                                    'content' => [
                                        ['type' => 'text', 'text' => 'Right column'],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);

        $this->assertStringContainsString('class="row g-4"', $html);
        $this->assertStringContainsString('class="col-md-6"', $html);
        $this->assertStringContainsString('Left column', $html);
        $this->assertStringContainsString('Right column', $html);
    }

    public function test_renders_three_column_layout(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'bootstrapRow',
                    'attrs' => ['gutter' => 3],
                    'content' => [
                        [
                            'type' => 'bootstrapCol',
                            'attrs' => ['colClass' => 'col-md-4'],
                            'content' => [['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'A']]]],
                        ],
                        [
                            'type' => 'bootstrapCol',
                            'attrs' => ['colClass' => 'col-md-4'],
                            'content' => [['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'B']]]],
                        ],
                        [
                            'type' => 'bootstrapCol',
                            'attrs' => ['colClass' => 'col-md-4'],
                            'content' => [['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'C']]]],
                        ],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);

        $this->assertStringContainsString('class="row g-3"', $html);
        $this->assertSame(3, substr_count($html, 'col-md-4'));
    }

    public function test_renders_default_gutter_when_missing(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'bootstrapRow',
                    'content' => [
                        [
                            'type' => 'bootstrapCol',
                            'attrs' => ['colClass' => 'col'],
                            'content' => [['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'Single']]]],
                        ],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);
        $this->assertStringContainsString('class="row g-3"', $html);
    }

    public function test_clamps_gutter_to_valid_range(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'bootstrapRow',
                    'attrs' => ['gutter' => 99],
                    'content' => [
                        [
                            'type' => 'bootstrapCol',
                            'attrs' => ['colClass' => 'col'],
                            'content' => [['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'X']]]],
                        ],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);
        $this->assertStringContainsString('g-5', $html);
    }

    public function test_sanitizes_invalid_column_classes(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'bootstrapRow',
                    'attrs' => ['gutter' => 3],
                    'content' => [
                        [
                            'type' => 'bootstrapCol',
                            'attrs' => ['colClass' => 'col-md-6 evil-class <script>'],
                            'content' => [['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'Safe']]]],
                        ],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);
        $this->assertStringContainsString('class="col-md-6"', $html);
        $this->assertStringNotContainsString('evil-class', $html);
        $this->assertStringNotContainsString('<script>', $html);
    }

    public function test_renders_default_col_when_class_empty(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'bootstrapRow',
                    'attrs' => ['gutter' => 0],
                    'content' => [
                        [
                            'type' => 'bootstrapCol',
                            'attrs' => ['colClass' => ''],
                            'content' => [['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'OK']]]],
                        ],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);
        $this->assertStringContainsString('class="col"', $html);
    }

    public function test_renders_responsive_column_classes(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'bootstrapRow',
                    'attrs' => ['gutter' => 3],
                    'content' => [
                        [
                            'type' => 'bootstrapCol',
                            'attrs' => ['colClass' => 'col-sm-12 col-md-8 col-lg-6'],
                            'content' => [['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'Responsive']]]],
                        ],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);
        $this->assertStringContainsString('col-sm-12 col-md-8 col-lg-6', $html);
    }

    public function test_renders_sidebar_layout(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'bootstrapRow',
                    'attrs' => ['gutter' => 3],
                    'content' => [
                        [
                            'type' => 'bootstrapCol',
                            'attrs' => ['colClass' => 'col-md-4'],
                            'content' => [['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'Sidebar']]]],
                        ],
                        [
                            'type' => 'bootstrapCol',
                            'attrs' => ['colClass' => 'col-md-8'],
                            'content' => [['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'Main']]]],
                        ],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);
        $expected = '<div class="row g-3"><div class="col-md-4"><p>Sidebar</p></div><div class="col-md-8"><p>Main</p></div></div>';
        $this->assertSame($expected, $html);
    }

    public function test_renders_nested_content_in_columns(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'bootstrapRow',
                    'attrs' => ['gutter' => 3],
                    'content' => [
                        [
                            'type' => 'bootstrapCol',
                            'attrs' => ['colClass' => 'col-md-6'],
                            'content' => [
                                [
                                    'type' => 'heading',
                                    'attrs' => ['level' => 3],
                                    'content' => [['type' => 'text', 'text' => 'Title']],
                                ],
                                [
                                    'type' => 'paragraph',
                                    'content' => [
                                        ['type' => 'text', 'text' => 'With '],
                                        ['type' => 'text', 'text' => 'bold', 'marks' => [['type' => 'bold']]],
                                        ['type' => 'text', 'text' => ' text.'],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);
        $this->assertStringContainsString('<h3>Title</h3>', $html);
        $this->assertStringContainsString('<strong>bold</strong>', $html);
        $this->assertStringContainsString('class="col-md-6"', $html);
    }
}
