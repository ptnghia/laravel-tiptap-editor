@props([
    'name' => 'content',
    'id' => null,
    'disabled' => false,
])

{{-- Auto-inject Tailwind fallback CSS once per page if enabled --}}
@once
    @if(config('tiptap-editor.rendering.output_theme') === 'tailwind' && config('tiptap-editor.rendering.tailwind_fallback_css'))
        @push('styles')
            <link rel="stylesheet" href="{{ asset('vendor/tiptap-editor/css/tailwind-fallback.css') }}">
        @endpush
    @endif
@endonce

<div
    id="{{ $id }}"
    class="tiptap-editor-wrapper"
    data-tiptap-editor
    data-config="{{ json_encode($editorConfig()) }}"
    data-upload-url="{{ route('tiptap-editor.media.upload') }}"
    data-browse-url="{{ route('tiptap-editor.media.browse') }}"
    @if($disabled) data-disabled @endif
>
    {{-- Toolbar --}}
    <div class="tiptap-editor__toolbar" data-tiptap-toolbar>
        @include('tiptap-editor::toolbar.toolbar')
    </div>

    {{-- Editor Content Area --}}
    <div
        class="tiptap-editor__content"
        data-tiptap-content
        @if($placeholder) data-placeholder="{{ $placeholder }}" @endif
    >
        {{-- Tiptap mounts here --}}
    </div>

    {{-- Hidden Input for Form Submission --}}
    <input
        type="hidden"
        name="{{ $name }}"
        value="{{ $contentValue() }}"
        data-tiptap-input
    >

    {{-- Character Count --}}
    @if(in_array('characterCount', $editorConfig()['extensions'] ?? []))
    <div class="tiptap-editor__footer">
        <span class="tiptap-editor__char-count text-muted small" data-tiptap-char-count></span>
    </div>
    @endif

    {{-- Validation Error --}}
    @error($name)
        <div class="invalid-feedback d-block">{{ $message }}</div>
    @enderror
</div>
