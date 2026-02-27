{{--
    Tiptap Editor Toolbar
    Buttons are rendered by JS (Toolbar.js) based on the config passed via data-config.
    This provides the semantic container; JS fills in the button groups dynamically.
--}}
<div class="tiptap-toolbar" role="toolbar" aria-label="{{ __('tiptap-editor::editor.toolbar_label') }}">
    {{-- JS Toolbar.js will populate button groups here --}}
    <noscript>
        <div class="text-muted small p-2">
            JavaScript is required for the editor toolbar.
        </div>
    </noscript>
</div>
