<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Tests\Unit\Services;

use Suspended\TiptapEditor\Services\ContentValidator;
use Suspended\TiptapEditor\Support\NodeRegistry;
use Suspended\TiptapEditor\Tests\TestCase;

class ContentValidatorTest extends TestCase
{
    protected ContentValidator $validator;

    protected function setUp(): void
    {
        parent::setUp();
        $this->validator = new ContentValidator(new NodeRegistry());
    }

    public function test_valid_document(): void
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

    public function test_rejects_invalid_json_string(): void
    {
        $this->assertFalse($this->validator->validate('not valid json{'));
        $this->assertNotEmpty($this->validator->errors());
        $this->assertStringContainsString('Invalid JSON', $this->validator->errors()[0]);
    }

    public function test_rejects_missing_doc_type(): void
    {
        $json = [
            'type' => 'paragraph',
            'content' => [],
        ];

        $this->assertFalse($this->validator->validate($json));
        $this->assertStringContainsString('Root node must have type "doc"', $this->validator->errors()[0]);
    }

    public function test_rejects_missing_content(): void
    {
        $json = ['type' => 'doc'];

        $this->assertFalse($this->validator->validate($json));
        $this->assertStringContainsString('content', $this->validator->errors()[0]);
    }

    public function test_validates_json_string_input(): void
    {
        $jsonString = json_encode([
            'type' => 'doc',
            'content' => [
                ['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'ok']]],
            ],
        ]);

        $this->assertTrue($this->validator->validate($jsonString));
    }

    public function test_catches_nodes_without_type(): void
    {
        $json = [
            'type' => 'doc',
            'content' => [
                ['content' => []], // missing 'type'
            ],
        ];

        $this->assertFalse($this->validator->validate($json));
        $this->assertStringContainsString("missing 'type'", $this->validator->errors()[0]);
    }
}
