<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\View\Components;

use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class TiptapEditor extends Component
{
    /**
     * Create a new component instance.
     */
    public function __construct(
        public string $name = 'content',
        public string|array|null $value = null,
        public array $config = [],
        public string $placeholder = '',
        public bool $disabled = false,
        public ?string $id = null,
    ) {
        $this->id = $id ?? 'tiptap-editor-' . uniqid();

        if ($this->placeholder === '') {
            $this->placeholder = __('tiptap-editor::editor.placeholder');
        }
    }

    /**
     * Get the merged editor configuration.
     *
     * @return array<string, mixed>
     */
    public function editorConfig(): array
    {
        $defaults = [
            'extensions' => config('tiptap-editor.extensions', []),
            'toolbar' => config('tiptap-editor.toolbar', []),
            'placeholder' => $this->placeholder,
            'theme' => config('tiptap-editor.theme', 'auto'),
            'ai' => [
                'enabled' => config('tiptap-editor.ai.enabled', false),
            ],
        ];

        return array_merge($defaults, $this->config);
    }

    /**
     * Get the content value for the editor.
     */
    public function contentValue(): string
    {
        $value = old($this->name, $this->value);

        if (is_array($value)) {
            return json_encode($value, JSON_UNESCAPED_UNICODE);
        }

        return $value ?? '';
    }

    /**
     * Get the view that represents the component.
     */
    public function render(): View
    {
        return view('tiptap-editor::components.tiptap-editor');
    }
}
