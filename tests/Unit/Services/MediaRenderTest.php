<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Tests\Unit\Services;

use Suspended\TiptapEditor\Services\ClassMap\BootstrapClassMap;
use Suspended\TiptapEditor\Services\HtmlRenderer;
use Suspended\TiptapEditor\Support\NodeRegistry;
use Suspended\TiptapEditor\Tests\TestCase;

/**
 * Tests for Custom Image and Custom Video rendering.
 */
class MediaRenderTest extends TestCase
{
    private HtmlRenderer $renderer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->renderer = new HtmlRenderer(new NodeRegistry(), new BootstrapClassMap());
    }

    // ── Custom Image Tests ──────────────────────────────────────

    public function test_renders_basic_image(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'customImage',
                    'attrs' => [
                        'src' => '/storage/media/photo.webp',
                        'alt' => 'A photo',
                        'alignment' => 'center',
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);

        $this->assertStringContainsString('src="/storage/media/photo.webp"', $html);
        $this->assertStringContainsString('alt="A photo"', $html);
        $this->assertStringContainsString('class="img-fluid"', $html);
        $this->assertStringContainsString('loading="lazy"', $html);
        $this->assertStringContainsString('text-center', $html);
    }

    public function test_renders_image_with_caption(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'customImage',
                    'attrs' => [
                        'src' => '/storage/media/photo.webp',
                        'alt' => 'Photo',
                        'caption' => 'A beautiful sunset',
                        'alignment' => 'center',
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);

        $this->assertStringContainsString('<figcaption class="figure-caption">', $html);
        $this->assertStringContainsString('A beautiful sunset', $html);
    }

    public function test_renders_image_left_alignment(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'customImage',
                    'attrs' => [
                        'src' => '/storage/media/photo.webp',
                        'alt' => '',
                        'alignment' => 'left',
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);

        $this->assertStringContainsString('text-start', $html);
    }

    public function test_renders_image_with_dimensions(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'customImage',
                    'attrs' => [
                        'src' => '/storage/media/photo.webp',
                        'alt' => '',
                        'width' => 800,
                        'height' => 600,
                        'alignment' => 'center',
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);

        $this->assertStringContainsString('width="800"', $html);
        $this->assertStringContainsString('height="600"', $html);
    }

    public function test_renders_empty_for_missing_src(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'customImage',
                    'attrs' => [
                        'src' => '',
                        'alt' => '',
                        'alignment' => 'center',
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);

        $this->assertEmpty(trim($html));
    }

    public function test_image_escapes_xss_in_alt(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'customImage',
                    'attrs' => [
                        'src' => '/storage/media/photo.webp',
                        'alt' => '"><script>alert("xss")</script>',
                        'alignment' => 'center',
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);

        $this->assertStringNotContainsString('<script>', $html);
    }

    // ── Custom Video Tests ──────────────────────────────────────

    public function test_renders_youtube_video(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'customVideo',
                    'attrs' => [
                        'provider' => 'youtube',
                        'videoId' => 'dQw4w9WgXcQ',
                        'url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                        'title' => 'A video',
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);

        $this->assertStringContainsString('ratio ratio-16x9', $html);
        $this->assertStringContainsString('youtube-nocookie.com/embed/dQw4w9WgXcQ', $html);
        $this->assertStringContainsString('allowfullscreen', $html);
        $this->assertStringContainsString('loading="lazy"', $html);
    }

    public function test_renders_vimeo_video(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'customVideo',
                    'attrs' => [
                        'provider' => 'vimeo',
                        'videoId' => '123456789',
                        'url' => 'https://vimeo.com/123456789',
                        'title' => 'Vimeo video',
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);

        $this->assertStringContainsString('player.vimeo.com/video/123456789', $html);
    }

    public function test_renders_mp4_video(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'customVideo',
                    'attrs' => [
                        'provider' => 'mp4',
                        'videoId' => '/storage/media/video.mp4',
                        'url' => '/storage/media/video.mp4',
                        'title' => 'MP4 video',
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);

        $this->assertStringContainsString('<video controls', $html);
        $this->assertStringContainsString('type="video/mp4"', $html);
        $this->assertStringContainsString('/storage/media/video.mp4', $html);
    }

    public function test_renders_empty_for_unknown_provider(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'customVideo',
                    'attrs' => [
                        'provider' => 'unknown-provider',
                        'videoId' => '123',
                        'url' => 'https://unknown.com/123',
                        'title' => '',
                    ],
                ],
            ],
        ];

        $html = $this->renderer->render($json);

        $this->assertEmpty(trim($html));
    }
}
