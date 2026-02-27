<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Enabled Extensions
    |--------------------------------------------------------------------------
    |
    | List of Tiptap extensions that are enabled in the editor.
    | Each extension corresponds to a JS file in resources/js/editor/extensions/
    | and a PHP renderer in the HtmlRenderer service.
    |
    */

    'extensions' => [
        // Text
        'paragraph',
        'heading',
        'bold',
        'italic',
        'underline',
        'strike',
        'subscript',
        'superscript',
        'bulletList',
        'orderedList',
        'blockquote',
        'codeBlock',
        'horizontalRule',
        'hardBreak',
        'link',
        'textAlign',
        'color',
        'highlight',
        'characterCount',

        // Layout
        'bootstrapRow',
        'bootstrapCol',

        // Components
        'bootstrapAlert',
        'bootstrapCard',
        'bootstrapButton',
        // 'bootstrapBadge',
        // 'callout',

        // Media
        'customImage',
        'customVideo',
        'gallery',

        // Table
        'table',
        'tableRow',
        'tableCell',
        'tableHeader',

        // Features
        'slashCommands',

        // Embed
        // 'controlledEmbed',
    ],

    /*
    |--------------------------------------------------------------------------
    | Theme
    |--------------------------------------------------------------------------
    |
    | Default theme for the editor. Options: 'auto', 'light', 'dark'.
    | 'auto' follows the system preference via prefers-color-scheme.
    |
    */

    'theme' => 'auto',

    /*
    |--------------------------------------------------------------------------
    | Toolbar Configuration
    |--------------------------------------------------------------------------
    |
    | Define which buttons appear in the toolbar and how they are grouped.
    | Each group is an array of button identifiers.
    |
    */

    'toolbar' => [
        'groups' => [
            'text' => ['bold', 'italic', 'underline', 'strike'],
            'heading' => ['h1', 'h2', 'h3', 'h4'],
            'alignment' => ['alignLeft', 'alignCenter', 'alignRight', 'alignJustify'],
            'list' => ['bulletList', 'orderedList'],
            'insert' => ['link', 'image', 'video', 'table', 'horizontalRule'],
            'block' => ['blockquote', 'codeBlock'],
            'layout' => ['row'],
            'component' => ['alert', 'card', 'button'],
            'format' => ['color', 'highlight', 'subscript', 'superscript'],
            'history' => ['undo', 'redo'],
            'utils' => ['gallery', 'darkMode', 'shortcuts'],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Media Settings
    |--------------------------------------------------------------------------
    |
    | Configuration for media uploads: storage disk, file limits,
    | allowed types, and image processing options.
    |
    */

    'media' => [
        'disk' => env('TIPTAP_MEDIA_DISK', 'public'),
        'path' => 'tiptap-media',
        'max_file_size' => 5120, // KB (5MB)
        'allowed_types' => [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
            'video/mp4',
            'video/webm',
        ],
        'image_sizes' => [
            'thumbnail' => [150, 150],
            'medium' => [600, null],   // null = auto height
            'large' => [1200, null],
        ],
        'webp_conversion' => true,
        'webp_quality' => 85,
        'max_dimensions' => [
            'width' => 2560,
            'height' => 2560,
        ],
        'strip_exif' => true,

        'rate_limit' => [
            'max_uploads' => 30,   // max uploads per window
            'per_minutes' => 1,    // window in minutes
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Sanitization Settings
    |--------------------------------------------------------------------------
    |
    | Whitelist configuration for content sanitization.
    | Only listed tags, attributes, and node types are allowed.
    |
    */

    'sanitization' => [
        'allowed_tags' => [
            'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'strong', 'em', 'u', 's', 'sub', 'sup',
            'a', 'img', 'figure', 'figcaption',
            'ul', 'ol', 'li',
            'blockquote', 'pre', 'code',
            'div', 'span',
            'table', 'thead', 'tbody', 'tr', 'th', 'td',
            'br', 'hr',
            'mark',
        ],
        'allowed_attributes' => [
            'class', 'href', 'target', 'rel',
            'src', 'alt', 'title', 'width', 'height', 'loading',
            'data-type', 'data-alert-type', 'data-col-class',
            'role', 'colspan', 'rowspan',
            'style', // limited to color/background-color via sanitizer
        ],
        'max_nesting_depth' => 10,
        'max_content_size' => 512000, // bytes (500KB)
    ],

    /*
    |--------------------------------------------------------------------------
    | Rendering Settings
    |--------------------------------------------------------------------------
    |
    | Configuration for server-side HTML rendering from JSON.
    |
    */

    'rendering' => [
        'cache' => env('TIPTAP_RENDER_CACHE', true),
        'cache_ttl' => 3600, // seconds
        'minify' => false,
    ],

    /*
    |--------------------------------------------------------------------------
    | Route Settings
    |--------------------------------------------------------------------------
    |
    | Prefix and middleware for package routes.
    |
    */

    'routes' => [
        'prefix' => 'tiptap-editor',
        'middleware' => ['web', 'auth'],
    ],

    /*
    |--------------------------------------------------------------------------
    | Video Providers
    |--------------------------------------------------------------------------
    |
    | Whitelisted video providers for controlled embeds.
    |
    */

    'video_providers' => [
        'youtube' => [
            'regex' => '/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/',
            'embed_url' => 'https://www.youtube-nocookie.com/embed/{id}',
        ],
        'vimeo' => [
            'regex' => '/vimeo\.com\/(\d+)/',
            'embed_url' => 'https://player.vimeo.com/video/{id}',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | AI Content Generation (Optional)
    |--------------------------------------------------------------------------
    |
    | Configuration for AI-powered content generation.
    | Set 'enabled' to true and configure your preferred provider.
    |
    */

    'ai' => [
        'enabled' => env('TIPTAP_AI_ENABLED', false),

        'default_provider' => env('TIPTAP_AI_PROVIDER', 'openai'),

        'providers' => [
            'openai' => [
                'api_key' => env('OPENAI_API_KEY'),
                'model' => env('TIPTAP_AI_OPENAI_MODEL', 'gpt-4o-mini'),
                'max_tokens' => 4096,
                'temperature' => 0.7,
                'organization' => env('OPENAI_ORGANIZATION'),
            ],
            'claude' => [
                'api_key' => env('ANTHROPIC_API_KEY'),
                'model' => env('TIPTAP_AI_CLAUDE_MODEL', 'claude-sonnet-4-20250514'),
                'max_tokens' => 4096,
            ],
        ],

        'rate_limit' => [
            'max_requests' => 20,
            'per_minutes' => 60,
        ],

        'system_prompt' => 'You are a professional content writer for a CMS. Generate well-structured content using headings, paragraphs, lists, and other formatting. Output clean HTML suitable for a rich text editor.',

        'output_format' => 'html', // html | tiptap_json

        'capabilities' => [
            'generate' => true,
            'refine' => true,
            'summarize' => true,
            'translate' => true,
        ],

        'prompt_templates' => [
            // Custom templates can be added here
            // 'blog_post' => 'Write a blog post about :topic with :tone tone...',
        ],
    ],

];
