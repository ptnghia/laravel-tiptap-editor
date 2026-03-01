<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Tests\Unit\Services;

use Suspended\TiptapEditor\Services\ClassMap\BootstrapClassMap;
use Suspended\TiptapEditor\Services\HtmlRenderer;
use Suspended\TiptapEditor\Support\NodeRegistry;
use Suspended\TiptapEditor\Tests\TestCase;

/**
 * Tests for Bootstrap Component rendering (Alert, Card, Button).
 */
class BootstrapComponentRenderTest extends TestCase
{
    private HtmlRenderer $renderer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->renderer = new HtmlRenderer(new NodeRegistry(), new BootstrapClassMap());
    }

    // ── Alert tests ─────────────────────────────────────────────

    public function test_renders_bootstrap_alert_info(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'bootstrapAlert',
                    'attrs' => ['type' => 'info'],
                    'content' => [
                        ['type' => 'text', 'text' => 'This is an info alert.'],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);

        $this->assertStringContainsString('class="alert alert-info"', $html);
        $this->assertStringContainsString('role="alert"', $html);
        $this->assertStringContainsString('This is an info alert.', $html);
    }

    public function test_renders_bootstrap_alert_danger(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'bootstrapAlert',
                    'attrs' => ['type' => 'danger'],
                    'content' => [
                        ['type' => 'text', 'text' => 'Danger!'],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);

        $this->assertStringContainsString('alert-danger', $html);
        $this->assertStringContainsString('Danger!', $html);
    }

    public function test_alert_defaults_to_info_for_invalid_type(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'bootstrapAlert',
                    'attrs' => ['type' => 'invalid-type'],
                    'content' => [
                        ['type' => 'text', 'text' => 'Fallback alert.'],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);

        $this->assertStringContainsString('alert-info', $html);
        $this->assertStringNotContainsString('invalid-type', $html);
    }

    public function test_renders_alert_with_bold_text(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'bootstrapAlert',
                    'attrs' => ['type' => 'success'],
                    'content' => [
                        [
                            'type' => 'text',
                            'text' => 'Important',
                            'marks' => [['type' => 'bold']],
                        ],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);

        $this->assertStringContainsString('alert-success', $html);
        $this->assertStringContainsString('<strong>Important</strong>', $html);
    }

    // ── Card tests ──────────────────────────────────────────────

    public function test_renders_bootstrap_card_basic(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'bootstrapCard',
                    'attrs' => ['headerText' => null, 'footerText' => null, 'borderColor' => null],
                    'content' => [
                        [
                            'type' => 'paragraph',
                            'content' => [['type' => 'text', 'text' => 'Card body content.']],
                        ],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);

        $this->assertStringContainsString('class="card"', $html);
        $this->assertStringContainsString('class="card-body"', $html);
        $this->assertStringContainsString('Card body content.', $html);
        $this->assertStringNotContainsString('card-header', $html);
        $this->assertStringNotContainsString('card-footer', $html);
    }

    public function test_renders_card_with_header(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'bootstrapCard',
                    'attrs' => ['headerText' => 'My Card Title', 'footerText' => null, 'borderColor' => null],
                    'content' => [
                        [
                            'type' => 'paragraph',
                            'content' => [['type' => 'text', 'text' => 'Body']],
                        ],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);

        $this->assertStringContainsString('class="card-header"', $html);
        $this->assertStringContainsString('My Card Title', $html);
    }

    public function test_renders_card_with_header_and_footer(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'bootstrapCard',
                    'attrs' => [
                        'headerText' => 'Header',
                        'footerText' => 'Footer text',
                        'borderColor' => null,
                    ],
                    'content' => [
                        [
                            'type' => 'paragraph',
                            'content' => [['type' => 'text', 'text' => 'Content']],
                        ],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);

        $this->assertStringContainsString('class="card-header"', $html);
        $this->assertStringContainsString('Header', $html);
        $this->assertStringContainsString('class="card-footer"', $html);
        $this->assertStringContainsString('Footer text', $html);
    }

    public function test_renders_card_with_border_color(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'bootstrapCard',
                    'attrs' => ['headerText' => null, 'footerText' => null, 'borderColor' => 'primary'],
                    'content' => [
                        [
                            'type' => 'paragraph',
                            'content' => [['type' => 'text', 'text' => 'Blue border']],
                        ],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);

        $this->assertStringContainsString('border-primary', $html);
    }

    public function test_card_escapes_header_text_xss(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'bootstrapCard',
                    'attrs' => [
                        'headerText' => '<script>alert("xss")</script>',
                        'footerText' => null,
                        'borderColor' => null,
                    ],
                    'content' => [
                        [
                            'type' => 'paragraph',
                            'content' => [['type' => 'text', 'text' => 'Safe body']],
                        ],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);

        $this->assertStringNotContainsString('<script>', $html);
        $this->assertStringContainsString('&lt;script&gt;', $html);
    }

    // ── Button tests ────────────────────────────────────────────

    public function test_renders_bootstrap_button_basic(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'paragraph',
                    'content' => [
                        [
                            'type' => 'bootstrapButton',
                            'attrs' => [
                                'text' => 'Click me',
                                'url' => 'https://example.com',
                                'variant' => 'primary',
                                'size' => null,
                                'outline' => false,
                                'target' => '_self',
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);

        $this->assertStringContainsString('btn btn-primary', $html);
        $this->assertStringContainsString('href="https://example.com"', $html);
        $this->assertStringContainsString('role="button"', $html);
        $this->assertStringContainsString('Click me', $html);
    }

    public function test_renders_button_outline_variant(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'paragraph',
                    'content' => [
                        [
                            'type' => 'bootstrapButton',
                            'attrs' => [
                                'text' => 'Outline',
                                'url' => '#',
                                'variant' => 'success',
                                'size' => null,
                                'outline' => true,
                                'target' => '_self',
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);

        $this->assertStringContainsString('btn-outline-success', $html);
    }

    public function test_renders_button_with_size(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'paragraph',
                    'content' => [
                        [
                            'type' => 'bootstrapButton',
                            'attrs' => [
                                'text' => 'Large',
                                'url' => '#',
                                'variant' => 'danger',
                                'size' => 'lg',
                                'outline' => false,
                                'target' => '_self',
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);

        $this->assertStringContainsString('btn-lg', $html);
        $this->assertStringContainsString('btn-danger', $html);
    }

    public function test_renders_button_with_blank_target(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'paragraph',
                    'content' => [
                        [
                            'type' => 'bootstrapButton',
                            'attrs' => [
                                'text' => 'External',
                                'url' => 'https://example.com',
                                'variant' => 'info',
                                'size' => null,
                                'outline' => false,
                                'target' => '_blank',
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);

        $this->assertStringContainsString('target="_blank"', $html);
        $this->assertStringContainsString('rel="noopener noreferrer"', $html);
    }

    public function test_button_escapes_url_xss(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'paragraph',
                    'content' => [
                        [
                            'type' => 'bootstrapButton',
                            'attrs' => [
                                'text' => 'Safe',
                                'url' => 'javascript:alert("xss")',
                                'variant' => 'primary',
                                'size' => null,
                                'outline' => false,
                                'target' => '_self',
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);

        // e() will HTML-encode the quotes etc.
        $this->assertStringNotContainsString('javascript:alert("xss")', $html);
    }

    public function test_button_defaults_invalid_variant(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'paragraph',
                    'content' => [
                        [
                            'type' => 'bootstrapButton',
                            'attrs' => [
                                'text' => 'Fallback',
                                'url' => '#',
                                'variant' => 'notavariant',
                                'size' => null,
                                'outline' => false,
                                'target' => '_self',
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);

        $this->assertStringContainsString('btn-primary', $html);
        $this->assertStringNotContainsString('notavariant', $html);
    }
}
