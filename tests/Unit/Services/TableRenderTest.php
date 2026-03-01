<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Tests\Unit\Services;

use Suspended\TiptapEditor\Services\ClassMap\BootstrapClassMap;
use Suspended\TiptapEditor\Services\HtmlRenderer;
use Suspended\TiptapEditor\Support\NodeRegistry;
use Suspended\TiptapEditor\Tests\TestCase;

/**
 * Tests for table rendering and extended node rendering in HtmlRenderer.
 */
class TableRenderTest extends TestCase
{
    protected HtmlRenderer $renderer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->renderer = new HtmlRenderer(new NodeRegistry(), new BootstrapClassMap());
    }

    public function test_renders_simple_table(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'table',
                    'content' => [
                        [
                            'type' => 'tableRow',
                            'content' => [
                                [
                                    'type' => 'tableHeader',
                                    'content' => [
                                        ['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'Name']]],
                                    ],
                                ],
                                [
                                    'type' => 'tableHeader',
                                    'content' => [
                                        ['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'Value']]],
                                    ],
                                ],
                            ],
                        ],
                        [
                            'type' => 'tableRow',
                            'content' => [
                                [
                                    'type' => 'tableCell',
                                    'content' => [
                                        ['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'Foo']]],
                                    ],
                                ],
                                [
                                    'type' => 'tableCell',
                                    'content' => [
                                        ['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'Bar']]],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);
        $this->assertStringContainsString('<table class="table">', $html);
        $this->assertStringContainsString('<th><p>Name</p></th>', $html);
        $this->assertStringContainsString('<th><p>Value</p></th>', $html);
        $this->assertStringContainsString('<td><p>Foo</p></td>', $html);
        $this->assertStringContainsString('<td><p>Bar</p></td>', $html);
        $this->assertStringContainsString('<tr>', $html);
    }

    public function test_renders_table_cell_with_colspan(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'table',
                    'content' => [
                        [
                            'type' => 'tableRow',
                            'content' => [
                                [
                                    'type' => 'tableCell',
                                    'attrs' => ['colspan' => 2],
                                    'content' => [
                                        ['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'Spanning']]],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);
        $this->assertStringContainsString('colspan="2"', $html);
    }

    public function test_renders_table_cell_with_rowspan(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'table',
                    'content' => [
                        [
                            'type' => 'tableRow',
                            'content' => [
                                [
                                    'type' => 'tableCell',
                                    'attrs' => ['rowspan' => 3],
                                    'content' => [
                                        ['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'Tall cell']]],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);
        $this->assertStringContainsString('rowspan="3"', $html);
    }

    public function test_renders_paragraph_with_text_align(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'paragraph',
                    'attrs' => ['textAlign' => 'center'],
                    'content' => [
                        ['type' => 'text', 'text' => 'Centered'],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);
        $this->assertStringContainsString('style="text-align: center"', $html);
        $this->assertStringContainsString('Centered', $html);
    }

    public function test_renders_heading_with_text_align(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'heading',
                    'attrs' => ['level' => 3, 'textAlign' => 'right'],
                    'content' => [
                        ['type' => 'text', 'text' => 'Right heading'],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);
        $this->assertStringContainsString('<h3', $html);
        $this->assertStringContainsString('style="text-align: right"', $html);
    }

    public function test_renders_code_block_with_language(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'codeBlock',
                    'attrs' => ['language' => 'php'],
                    'content' => [
                        ['type' => 'text', 'text' => 'echo "hello";'],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);
        $this->assertStringContainsString('<pre><code class="language-php">', $html);
        $this->assertStringContainsString('echo &quot;hello&quot;;', $html);
    }

    public function test_renders_ordered_list_with_start(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'orderedList',
                    'attrs' => ['start' => 5],
                    'content' => [
                        [
                            'type' => 'listItem',
                            'content' => [
                                ['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'Fifth']]],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);
        $this->assertStringContainsString('start="5"', $html);
        $this->assertStringContainsString('<ol', $html);
    }

    public function test_renders_subscript_and_superscript_marks(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'paragraph',
                    'content' => [
                        [
                            'type' => 'text',
                            'text' => '2',
                            'marks' => [['type' => 'superscript']],
                        ],
                        [
                            'type' => 'text',
                            'text' => 'n',
                            'marks' => [['type' => 'subscript']],
                        ],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);
        $this->assertStringContainsString('<sup>2</sup>', $html);
        $this->assertStringContainsString('<sub>n</sub>', $html);
    }

    public function test_renders_highlight_mark_with_color(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'paragraph',
                    'content' => [
                        [
                            'type' => 'text',
                            'text' => 'highlighted',
                            'marks' => [['type' => 'highlight', 'attrs' => ['color' => '#ffff00']]],
                        ],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);
        $this->assertStringContainsString('<mark style="background-color: #ffff00">highlighted</mark>', $html);
    }

    public function test_renders_text_style_color(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'paragraph',
                    'content' => [
                        [
                            'type' => 'text',
                            'text' => 'red text',
                            'marks' => [['type' => 'textStyle', 'attrs' => ['color' => '#ff0000']]],
                        ],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);
        $this->assertStringContainsString('<span style="color: #ff0000">red text</span>', $html);
    }

    public function test_renders_blockquote(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'blockquote',
                    'content' => [
                        ['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'A quote']]],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);
        $this->assertStringContainsString('<blockquote><p>A quote</p></blockquote>', $html);
    }

    public function test_renders_hard_break(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'paragraph',
                    'content' => [
                        ['type' => 'text', 'text' => 'Line 1'],
                        ['type' => 'hardBreak'],
                        ['type' => 'text', 'text' => 'Line 2'],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);
        $this->assertStringContainsString('Line 1<br>Line 2', $html);
    }

    // ── Table Bootstrap style tests ───────────────────────────────

    /**
     * Helper to build a minimal table JSON with given attrs.
     *
     * @param  array<string, mixed>  $tableAttrs
     * @return array<string, mixed>
     */
    private function makeStyledTableJson(array $tableAttrs = []): array
    {
        return [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'table',
                    'attrs' => $tableAttrs,
                    'content' => [
                        [
                            'type' => 'tableRow',
                            'content' => [
                                [
                                    'type' => 'tableCell',
                                    'content' => [
                                        ['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'Cell']]],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }

    public function test_table_wrapped_in_responsive_div(): void
    {
        $html = $this->renderer->render($this->makeStyledTableJson());

        $this->assertStringContainsString('<div class="table-responsive">', $html);
        $this->assertStringContainsString('</table></div>', $html);
    }

    public function test_table_bordered_style(): void
    {
        $html = $this->renderer->render($this->makeStyledTableJson(['bordered' => true]));

        $this->assertStringContainsString('table-bordered', $html);
    }

    public function test_table_striped_style(): void
    {
        $html = $this->renderer->render($this->makeStyledTableJson(['striped' => true]));

        $this->assertStringContainsString('table-striped', $html);
    }

    public function test_table_hover_style(): void
    {
        $html = $this->renderer->render($this->makeStyledTableJson(['hover' => true]));

        $this->assertStringContainsString('table-hover', $html);
    }

    public function test_table_small_style(): void
    {
        $html = $this->renderer->render($this->makeStyledTableJson(['small' => true]));

        $this->assertStringContainsString('table-sm', $html);
    }

    public function test_table_align_middle_style(): void
    {
        $html = $this->renderer->render($this->makeStyledTableJson(['alignMiddle' => true]));

        $this->assertStringContainsString('align-middle', $html);
    }

    public function test_table_all_styles_combined(): void
    {
        $html = $this->renderer->render($this->makeStyledTableJson([
            'bordered' => true,
            'striped' => true,
            'hover' => true,
            'small' => true,
            'alignMiddle' => true,
        ]));

        $this->assertStringContainsString(
            'class="table table-bordered table-striped table-hover table-sm align-middle"',
            $html
        );
        $this->assertStringContainsString('<div class="table-responsive">', $html);
    }

    public function test_table_false_styles_not_rendered(): void
    {
        $html = $this->renderer->render($this->makeStyledTableJson([
            'bordered' => false,
            'striped' => false,
        ]));

        $this->assertStringContainsString('<table class="table">', $html);
        $this->assertStringNotContainsString('table-bordered', $html);
        $this->assertStringNotContainsString('table-striped', $html);
    }
}
