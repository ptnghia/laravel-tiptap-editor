<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor;

use Illuminate\Support\ServiceProvider;
use Suspended\TiptapEditor\Services\AiContentService;
use Suspended\TiptapEditor\Services\ClassMap\BootstrapClassMap;
use Suspended\TiptapEditor\Services\ClassMap\ClassMapInterface;
use Suspended\TiptapEditor\Services\ClassMap\TailwindClassMap;
use Suspended\TiptapEditor\Services\ContentValidator;
use Suspended\TiptapEditor\Services\HtmlRenderer;
use Suspended\TiptapEditor\Services\JsonSanitizer;
use Suspended\TiptapEditor\Services\MediaManager;
use Suspended\TiptapEditor\Support\NodeRegistry;
use Suspended\TiptapEditor\View\Components\TiptapEditor;

class EditorServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->mergeConfigFrom(
            __DIR__ . '/../config/tiptap-editor.php',
            'tiptap-editor'
        );

        $this->registerServices();
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../routes/editor.php');
        $this->loadViewsFrom(__DIR__ . '/../resources/views', 'tiptap-editor');
        $this->loadMigrationsFrom(__DIR__ . '/../database/migrations');
        $this->loadTranslationsFrom(__DIR__ . '/../resources/lang', 'tiptap-editor');

        $this->registerBladeComponents();
        $this->registerPublishing();
    }

    /**
     * Register package services into the container.
     */
    protected function registerServices(): void
    {
        $this->app->singleton(NodeRegistry::class, function ($app) {
            return new NodeRegistry(
                config('tiptap-editor.extensions', [])
            );
        });

        // Bind ClassMapInterface based on output_theme config
        $this->app->singleton(ClassMapInterface::class, function ($app) {
            $theme     = config('tiptap-editor.rendering.output_theme', 'bootstrap');
            $overrides = config('tiptap-editor.rendering.class_overrides', []);

            return match ($theme) {
                'tailwind' => new TailwindClassMap($overrides),
                default    => new BootstrapClassMap($overrides),
            };
        });

        $this->app->singleton(HtmlRenderer::class, function ($app) {
            return new HtmlRenderer(
                $app->make(NodeRegistry::class),
                $app->make(ClassMapInterface::class),
            );
        });

        $this->app->singleton(JsonSanitizer::class, function ($app) {
            return new JsonSanitizer(
                $app->make(NodeRegistry::class),
                config('tiptap-editor.sanitization', [])
            );
        });

        $this->app->singleton(ContentValidator::class, function ($app) {
            return new ContentValidator(
                $app->make(NodeRegistry::class)
            );
        });

        $this->app->singleton(MediaManager::class, function ($app) {
            return new MediaManager(
                config('tiptap-editor.media', [])
            );
        });

        // AI Content Service – only register if enabled
        if (config('tiptap-editor.ai.enabled', false)) {
            $this->app->singleton(AiContentService::class, function ($app) {
                $service = new AiContentService(
                    config('tiptap-editor.ai', [])
                );

                return $service;
            });
        }
    }

    /**
     * Register Blade components.
     */
    protected function registerBladeComponents(): void
    {
        \Illuminate\Support\Facades\Blade::component('tiptap-editor', TiptapEditor::class);
    }

    /**
     * Register publishable resources.
     */
    protected function registerPublishing(): void
    {
        if (! $this->app->runningInConsole()) {
            return;
        }

        // Config
        $this->publishes([
            __DIR__ . '/../config/tiptap-editor.php' => config_path('tiptap-editor.php'),
        ], 'tiptap-editor-config');

        // Views
        $this->publishes([
            __DIR__ . '/../resources/views' => resource_path('views/vendor/tiptap-editor'),
        ], 'tiptap-editor-views');

        // Assets (JS/CSS)
        $this->publishes([
            __DIR__ . '/../dist' => public_path('vendor/tiptap-editor'),
            __DIR__ . '/../resources/css/tailwind-fallback.css' => public_path('vendor/tiptap-editor/css/tailwind-fallback.css'),
        ], 'tiptap-editor-assets');

        // Migrations
        $this->publishes([
            __DIR__ . '/../database/migrations' => database_path('migrations'),
        ], 'tiptap-editor-migrations');

        // Translations
        $this->publishes([
            __DIR__ . '/../resources/lang' => $this->app->langPath('vendor/tiptap-editor'),
        ], 'tiptap-editor-lang');
    }
}
