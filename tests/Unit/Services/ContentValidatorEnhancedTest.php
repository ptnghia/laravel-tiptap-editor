<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Tests\Unit\Services;

use Suspended\TiptapEditor\Services\ContentValidator;
use Suspended\TiptapEditor\Support\NodeRegistry;
use Suspended\TiptapEditor\Tests\TestCase;

/**
 * Enhanced tests for ContentValidator with strict mode, URL validation, etc.
 */
class ContentValidatorEnhancedTest extends TestCase
{
    protected ContentValidator $validator;

    protected function setUp(): void
    {
        parent::setUp();
        $this->validator = new ContentValidator(new NodeRegistry());
    }

    public function test_valid_document_passes(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'paragraph',
                    'content' => [
                        ['type' => 'text', 'text' => 'Hello'],
                    ],
                ],
            ],
        ];

        $this->assertTrue($this->validator->validate($json));
        $this->assertEmpty($this->validator->errors());
    }

    public function test_strict_mode_rejects_unknown_node_types(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'fakeNodeType',
                    'content' => [],
                ],
            ],
        ];

        $this->assertFalse($this->validator->strict()->validate($json));
        $this->assertStringContainsString('Unknown node type', $this->validator->errors()[0]);
    }

    public function test_strict_mode_accepts_known_types(): void
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
                [
                    'type' => 'paragraph',
                    'content' => [
                        ['type' => 'text', 'text' => 'Content'],
                    ],
                ],
            ],
        ];

        $this->assertTrue($this->validator->strict()->validate($json));
    }

    public function test_validates_heading_level_range(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'heading',
                    'attrs' => ['level' => 99],
                    'content' => [
                        ['type' => 'text', 'text' => 'Bad'],
                    ],
                ],
            ],
        ];

        $this->assertFalse($this->validator->validate($json));
        $this->assertStringContainsString('Invalid heading level', $this->validator->errors()[0]);
    }

    public function test_validates_link_url_blocks_javascript(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'paragraph',
                    'content' => [
                        [
                            'type' => 'text',
                            'text' => 'click me',
                            'marks' => [
                                [
                                    'type' => 'link',
                                    'attrs' => ['href' => 'javascript:alert(1)'],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $this->assertFalse($this->validator->validate($json));
        $this->assertStringContainsString('unsafe URL', $this->validator->errors()[0]);
    }

    public function test_validates_image_src_blocks_data_url(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'customImage',
                    'attrs' => ['src' => 'data:text/html,<script>alert(1)</script>'],
                ],
            ],
        ];

        $this->assertFalse($this->validator->validate($json));
        $this->assertStringContainsString('unsafe URL', $this->validator->errors()[0]);
    }

    public function test_validates_button_url_blocks_javascript(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'bootstrapButton',
                    'attrs' => [
                        'text' => 'Click',
                        'url' => 'javascript:void(0)',
                        'variant' => 'primary',
                    ],
                ],
            ],
        ];

        $this->assertFalse($this->validator->validate($json));
        $this->assertStringContainsString('unsafe URL', $this->validator->errors()[0]);
    }

    public function test_warnings_for_unknown_attributes(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'paragraph',
                    'attrs' => ['unknownAttr' => 'value'],
                    'content' => [
                        ['type' => 'text', 'text' => 'ok'],
                    ],
                ],
            ],
        ];

        $this->assertTrue($this->validator->validate($json)); // passes but with warnings
        $this->assertNotEmpty($this->validator->warnings());
        $this->assertStringContainsString('Unknown attribute', $this->validator->warnings()[0]);
    }

    public function test_warnings_for_unknown_alert_type(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'bootstrapAlert',
                    'attrs' => ['type' => 'nonexistent'],
                    'content' => [
                        ['type' => 'text', 'text' => 'Alert'],
                    ],
                ],
            ],
        ];

        $this->assertTrue($this->validator->validate($json));
        $this->assertNotEmpty($this->validator->warnings());
        $this->assertStringContainsString('Unknown alert type', $this->validator->warnings()[0]);
    }

    public function test_rejects_missing_text_on_text_node(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'paragraph',
                    'content' => [
                        ['type' => 'text'], // missing 'text' key
                    ],
                ],
            ],
        ];

        $this->assertFalse($this->validator->validate($json));
        $this->assertStringContainsString("missing 'text' string", $this->validator->errors()[0]);
    }

    public function test_rejects_oversized_content(): void
    {
        $hugeText = str_repeat('A', 600000);
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'paragraph',
                    'content' => [
                        ['type' => 'text', 'text' => $hugeText],
                    ],
                ],
            ],
        ];

        $this->assertFalse($this->validator->validate($json));
        $this->assertStringContainsString('exceeds maximum', $this->validator->errors()[0]);
    }

    public function test_valid_https_url_passes(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'paragraph',
                    'content' => [
                        [
                            'type' => 'text',
                            'text' => 'link',
                            'marks' => [
                                ['type' => 'link', 'attrs' => ['href' => 'https://example.com']],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $this->assertTrue($this->validator->validate($json));
        $this->assertEmpty($this->validator->errors());
    }

    public function test_warnings_for_unknown_mark(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'paragraph',
                    'content' => [
                        [
                            'type' => 'text',
                            'text' => 'text',
                            'marks' => [['type' => 'fakeMark']],
                        ],
                    ],
                ],
            ],
        ];

        $this->assertTrue($this->validator->validate($json));
        $this->assertStringContainsString('Unknown mark type', $this->validator->warnings()[0]);
    }

    public function test_non_array_node_is_rejected(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                'not_an_array',
            ],
        ];

        $this->assertFalse($this->validator->validate($json));
        $this->assertStringContainsString('not a valid object', $this->validator->errors()[0]);
    }
}
