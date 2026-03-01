<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Tests\Unit\Services;

use Suspended\TiptapEditor\Services\ClassMap\BootstrapClassMap;
use Suspended\TiptapEditor\Services\HtmlRenderer;
use Suspended\TiptapEditor\Support\NodeRegistry;
use Suspended\TiptapEditor\Tests\TestCase;

/**
 * Tests for Gallery and GalleryImage rendering.
 */
class GalleryRenderTest extends TestCase
{
    private HtmlRenderer $renderer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->renderer = new HtmlRenderer(new NodeRegistry(), new BootstrapClassMap());
    }

    // ── Gallery Node Tests ──────────────────────────────────────

    public function test_renders_basic_gallery_with_images(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'gallery',
                    'attrs' => [
                        'columns' => 3,
                        'gap' => 2,
                        'lightbox' => false,
                    ],
                    'content' => [
                        [
                            'type' => 'galleryImage',
                            'attrs' => [
                                'src' => '/storage/media/photo1.webp',
                                'alt' => 'Photo 1',
                                'colClass' => 'col-4',
                            ],
                        ],
                        [
                            'type' => 'galleryImage',
                            'attrs' => [
                                'src' => '/storage/media/photo2.webp',
                                'alt' => 'Photo 2',
                                'colClass' => 'col-4',
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);

        $this->assertStringContainsString('<div class="row g-2">', $html);
        $this->assertStringContainsString('src="/storage/media/photo1.webp"', $html);
        $this->assertStringContainsString('src="/storage/media/photo2.webp"', $html);
        $this->assertStringContainsString('alt="Photo 1"', $html);
        $this->assertStringContainsString('alt="Photo 2"', $html);
        $this->assertStringContainsString('class="col-4"', $html);
        $this->assertStringNotContainsString('data-lightbox', $html);
    }

    public function test_renders_gallery_with_lightbox(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'gallery',
                    'attrs' => [
                        'columns' => 4,
                        'gap' => 3,
                        'lightbox' => true,
                    ],
                    'content' => [
                        [
                            'type' => 'galleryImage',
                            'attrs' => [
                                'src' => '/storage/media/photo.webp',
                                'alt' => 'Test',
                                'colClass' => 'col-3',
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);

        $this->assertStringContainsString('data-lightbox="true"', $html);
        $this->assertStringContainsString('g-3', $html);
    }

    public function test_renders_gallery_with_2_columns(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'gallery',
                    'attrs' => ['columns' => 2, 'gap' => 0],
                    'content' => [
                        [
                            'type' => 'galleryImage',
                            'attrs' => ['src' => '/img/a.jpg', 'alt' => '', 'colClass' => 'col-6'],
                        ],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);

        $this->assertStringContainsString('g-0', $html);
        $this->assertStringContainsString('col-6', $html);
    }

    public function test_gallery_defaults_invalid_columns_to_3(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'gallery',
                    'attrs' => ['columns' => 5, 'gap' => 2],
                    'content' => [
                        [
                            'type' => 'galleryImage',
                            'attrs' => ['src' => '/img/a.jpg', 'alt' => '', 'colClass' => 'col-4'],
                        ],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);

        // 5 is not in [2,3,4,6], should default to 3 → g-2 row
        $this->assertStringContainsString('g-2', $html);
    }

    public function test_gallery_clamps_gap_to_valid_range(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'gallery',
                    'attrs' => ['columns' => 3, 'gap' => 99],
                    'content' => [
                        [
                            'type' => 'galleryImage',
                            'attrs' => ['src' => '/img/a.jpg', 'alt' => '', 'colClass' => 'col-4'],
                        ],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);

        $this->assertStringContainsString('g-5', $html); // clamped to max 5
    }

    // ── GalleryImage Node Tests ─────────────────────────────────

    public function test_renders_gallery_image_with_all_attrs(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'gallery',
                    'attrs' => ['columns' => 3, 'gap' => 2],
                    'content' => [
                        [
                            'type' => 'galleryImage',
                            'attrs' => [
                                'src' => '/storage/media/sunset.webp',
                                'alt' => 'Beautiful sunset',
                                'colClass' => 'col-md-4',
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);

        $this->assertStringContainsString('src="/storage/media/sunset.webp"', $html);
        $this->assertStringContainsString('alt="Beautiful sunset"', $html);
        $this->assertStringContainsString('class="col-md-4"', $html);
        $this->assertStringContainsString('class="img-fluid rounded"', $html);
        $this->assertStringContainsString('loading="lazy"', $html);
    }

    public function test_gallery_image_skips_empty_src(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'gallery',
                    'attrs' => ['columns' => 3, 'gap' => 2],
                    'content' => [
                        [
                            'type' => 'galleryImage',
                            'attrs' => ['src' => '', 'alt' => 'No image'],
                        ],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);

        $this->assertStringNotContainsString('<img', $html);
    }

    public function test_gallery_image_sanitizes_invalid_col_class(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'gallery',
                    'attrs' => ['columns' => 3, 'gap' => 2],
                    'content' => [
                        [
                            'type' => 'galleryImage',
                            'attrs' => [
                                'src' => '/img/a.jpg',
                                'alt' => '',
                                'colClass' => 'col-4" onclick="alert(1)',
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);

        // Invalid colClass should fallback to col-4
        $this->assertStringContainsString('class="col-4"', $html);
        $this->assertStringNotContainsString('onclick', $html);
    }

    public function test_gallery_image_defaults_col_class(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'gallery',
                    'attrs' => ['columns' => 3, 'gap' => 2],
                    'content' => [
                        [
                            'type' => 'galleryImage',
                            'attrs' => [
                                'src' => '/img/a.jpg',
                                'alt' => 'test',
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);

        $this->assertStringContainsString('class="col-4"', $html);
    }

    // ── NodeRegistry Tests ──────────────────────────────────────

    public function test_node_registry_knows_gallery_types(): void
    {
        $registry = new NodeRegistry();

        $this->assertTrue($registry->isKnownNodeType('gallery'));
        $this->assertTrue($registry->isKnownNodeType('galleryImage'));
    }

    public function test_node_registry_gallery_allowed_attributes(): void
    {
        $registry = new NodeRegistry();

        $galleryAttrs = $registry->getAllowedAttributes('gallery');
        $this->assertContains('columns', $galleryAttrs);
        $this->assertContains('gap', $galleryAttrs);
        $this->assertContains('lightbox', $galleryAttrs);

        $imageAttrs = $registry->getAllowedAttributes('galleryImage');
        $this->assertContains('src', $imageAttrs);
        $this->assertContains('alt', $imageAttrs);
        $this->assertContains('colClass', $imageAttrs);
    }

    public function test_node_registry_gallery_allowed_children(): void
    {
        $registry = new NodeRegistry();

        $galleryChildren = $registry->getAllowedChildren('gallery');
        $this->assertContains('galleryImage', $galleryChildren);

        $imageChildren = $registry->getAllowedChildren('galleryImage');
        $this->assertEmpty($imageChildren);
    }

    public function test_doc_allows_gallery_as_child(): void
    {
        $registry = new NodeRegistry();

        $docChildren = $registry->getAllowedChildren('doc');
        $this->assertContains('gallery', $docChildren);
    }

    public function test_bootstrap_col_allows_gallery_as_child(): void
    {
        $registry = new NodeRegistry();

        $colChildren = $registry->getAllowedChildren('bootstrapCol');
        $this->assertContains('gallery', $colChildren);
    }
}
