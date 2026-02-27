<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Facades;

use Illuminate\Support\Facades\Facade;
use Suspended\TiptapEditor\Services\HtmlRenderer;

/**
 * @method static string render(array|string $json)
 * @method static array sanitize(array|string $json)
 * @method static bool validate(array|string $json)
 *
 * @see \Suspended\TiptapEditor\Services\HtmlRenderer
 */
class TiptapEditor extends Facade
{
    /**
     * Get the registered name of the component.
     */
    protected static function getFacadeAccessor(): string
    {
        return HtmlRenderer::class;
    }
}
