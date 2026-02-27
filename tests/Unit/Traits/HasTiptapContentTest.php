<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Tests\Unit\Traits;

use Illuminate\Database\Eloquent\Model;
use Suspended\TiptapEditor\Tests\TestCase;
use Suspended\TiptapEditor\Traits\HasTiptapContent;

/**
 * Test model using the HasTiptapContent trait.
 */
class FakePost extends Model
{
    use HasTiptapContent;

    protected $table = 'fake_posts';

    protected $guarded = [];

    protected $casts = [
        'content_json' => 'array',
    ];
}

class HasTiptapContentTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Create fake table for testing
        $this->app['db']->connection()->getSchemaBuilder()->create('fake_posts', function ($table) {
            $table->id();
            $table->json('content_json')->nullable();
            $table->text('content_html')->nullable();
            $table->timestamps();
        });
    }

    protected function tearDown(): void
    {
        $this->app['db']->connection()->getSchemaBuilder()->dropIfExists('fake_posts');
        parent::tearDown();
    }

    protected function sampleContent(): array
    {
        return [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'heading',
                    'attrs' => ['level' => 1],
                    'content' => [
                        ['type' => 'text', 'text' => 'Hello World'],
                    ],
                ],
                [
                    'type' => 'paragraph',
                    'content' => [
                        ['type' => 'text', 'text' => 'This is a sample paragraph with some text content for testing purposes to verify the excerpt generation works properly.'],
                    ],
                ],
                [
                    'type' => 'heading',
                    'attrs' => ['level' => 2],
                    'content' => [
                        ['type' => 'text', 'text' => 'Section Two'],
                    ],
                ],
                [
                    'type' => 'paragraph',
                    'content' => [
                        ['type' => 'text', 'text' => 'Another paragraph here.'],
                    ],
                ],
            ],
        ];
    }

    public function test_get_tiptap_content_from_array(): void
    {
        $post = new FakePost();
        $post->content_json = $this->sampleContent();

        $content = $post->getTiptapContent();
        $this->assertIsArray($content);
        $this->assertSame('doc', $content['type']);
    }

    public function test_get_tiptap_content_from_string(): void
    {
        $post = new FakePost();
        $post->setRawAttributes(['content_json' => json_encode($this->sampleContent())]);

        $content = $post->getTiptapContent();
        $this->assertIsArray($content);
        $this->assertSame('doc', $content['type']);
    }

    public function test_get_tiptap_content_empty(): void
    {
        $post = new FakePost();
        $post->content_json = null;

        $content = $post->getTiptapContent();
        $this->assertIsArray($content);
        $this->assertEmpty($content);
    }

    public function test_set_tiptap_content_array(): void
    {
        $post = new FakePost();
        $post->setTiptapContent($this->sampleContent());

        $content = $post->getTiptapContent();
        $this->assertSame('doc', $content['type']);
    }

    public function test_set_tiptap_content_string(): void
    {
        $post = new FakePost();
        $post->setTiptapContent(json_encode($this->sampleContent()));

        $content = $post->getTiptapContent();
        $this->assertSame('doc', $content['type']);
    }

    public function test_render_content(): void
    {
        $post = new FakePost();
        $post->content_json = $this->sampleContent();

        $html = $post->renderContent();
        $this->assertStringContainsString('<h1>Hello World</h1>', $html);
        $this->assertStringContainsString('<p>', $html);
        $this->assertStringContainsString('sample paragraph', $html);
    }

    public function test_render_content_empty(): void
    {
        $post = new FakePost();
        $post->content_json = null;

        $this->assertSame('', $post->renderContent());
    }

    public function test_get_excerpt(): void
    {
        $post = new FakePost();
        $post->content_json = $this->sampleContent();

        $excerpt = $post->getExcerpt(50);
        $this->assertLessThanOrEqual(52, mb_strlen($excerpt)); // 50 + ellipsis
        $this->assertStringContainsString('Hello World', $excerpt);
    }

    public function test_get_excerpt_short_content(): void
    {
        $post = new FakePost();
        $post->content_json = [
            'type' => 'doc',
            'content' => [
                [
                    'type' => 'paragraph',
                    'content' => [
                        ['type' => 'text', 'text' => 'Short'],
                    ],
                ],
            ],
        ];

        $excerpt = $post->getExcerpt(160);
        $this->assertSame('Short', $excerpt);
    }

    public function test_get_plain_text_content(): void
    {
        $post = new FakePost();
        $post->content_json = $this->sampleContent();

        $text = $post->getPlainTextContent();
        $this->assertStringContainsString('Hello World', $text);
        $this->assertStringContainsString('sample paragraph', $text);
        $this->assertStringNotContainsString('<h1>', $text);
        $this->assertStringNotContainsString('<p>', $text);
    }

    public function test_get_headings(): void
    {
        $post = new FakePost();
        $post->content_json = $this->sampleContent();

        $headings = $post->getHeadings();
        $this->assertCount(2, $headings);
        $this->assertSame(1, $headings[0]['level']);
        $this->assertSame('Hello World', $headings[0]['text']);
        $this->assertSame(2, $headings[1]['level']);
        $this->assertSame('Section Two', $headings[1]['text']);
    }

    public function test_has_content_true(): void
    {
        $post = new FakePost();
        $post->content_json = $this->sampleContent();

        $this->assertTrue($post->hasContent());
    }

    public function test_has_content_false_null(): void
    {
        $post = new FakePost();
        $post->content_json = null;

        $this->assertFalse($post->hasContent());
    }

    public function test_has_content_false_empty_paragraphs(): void
    {
        $post = new FakePost();
        $post->content_json = [
            'type' => 'doc',
            'content' => [
                ['type' => 'paragraph', 'content' => []],
            ],
        ];

        $this->assertFalse($post->hasContent());
    }

    public function test_get_tiptap_content_column_default(): void
    {
        $post = new FakePost();
        $this->assertSame('content_json', $post->getTiptapContentColumn());
    }

    public function test_render_content_fresh(): void
    {
        $post = new FakePost();
        $post->content_json = $this->sampleContent();

        $html = $post->renderContentFresh();
        $this->assertStringContainsString('<h1>Hello World</h1>', $html);
    }
}
