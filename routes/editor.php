<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Suspended\TiptapEditor\Http\Controllers\AiContentController;
use Suspended\TiptapEditor\Http\Controllers\MediaUploadController;
use Suspended\TiptapEditor\Http\Middleware\AiRateLimiter;
use Suspended\TiptapEditor\Http\Middleware\ValidateMediaUpload;

Route::group([
    'prefix' => config('tiptap-editor.routes.prefix', 'tiptap-editor'),
    'middleware' => config('tiptap-editor.routes.middleware', ['web', 'auth']),
    'as' => 'tiptap-editor.',
], function () {
    // Media routes
    Route::post('/media/upload', [MediaUploadController::class, 'upload'])
        ->middleware(ValidateMediaUpload::class)
        ->name('media.upload');
    Route::get('/media/browse', [MediaUploadController::class, 'browse'])->name('media.browse');
    Route::delete('/media/{id}', [MediaUploadController::class, 'delete'])->name('media.delete');

    // AI routes (only when enabled via config)
    if (config('tiptap-editor.ai.enabled', false)) {
        Route::prefix('ai')->middleware(AiRateLimiter::class)->group(function () {
            Route::post('/generate', [AiContentController::class, 'generate'])->name('ai.generate');
            Route::post('/refine', [AiContentController::class, 'refine'])->name('ai.refine');
            Route::post('/summarize', [AiContentController::class, 'summarize'])->name('ai.summarize');
            Route::post('/translate', [AiContentController::class, 'translate'])->name('ai.translate');
        });
    }
});
