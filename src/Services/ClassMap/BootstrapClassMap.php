<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Services\ClassMap;

class BootstrapClassMap implements ClassMapInterface
{
    /** @var array<string, string> */
    protected array $overrides;

    /**
     * @param  array<string, string>  $overrides  User-defined class overrides keyed by component name.
     */
    public function __construct(array $overrides = [])
    {
        $this->overrides = $overrides;
    }

    public function theme(): string
    {
        return 'bootstrap';
    }

    public function isTailwind(): bool
    {
        return false;
    }

    /**
     * @param  array<string, mixed>  $modifiers
     */
    public function get(string $component, array $modifiers = []): string
    {
        if (isset($this->overrides[$component])) {
            return $this->overrides[$component];
        }

        return match ($component) {
            'alert'          => $this->alertClasses($modifiers),
            'card'           => $this->cardClasses($modifiers),
            'card.header'    => 'card-header',
            'card.body'      => 'card-body',
            'card.footer'    => 'card-footer',
            'button'         => $this->buttonClasses($modifiers),
            'row'            => $this->rowClasses($modifiers),
            'col'            => $this->colClass($modifiers),
            'table'          => $this->tableClasses($modifiers),
            'table.wrapper'  => 'table-responsive',
            'image'          => 'img-fluid',
            'image.caption'  => 'figure-caption',
            'video.ratio'    => $this->videoRatioClass($modifiers),
            'gallery'        => $this->galleryClasses($modifiers),
            'gallery.item'   => $this->galleryItemClass($modifiers),
            'gallery.image'  => 'img-fluid rounded',
            default          => '',
        };
    }

    /**
     * @param  array<string, mixed>  $modifiers
     */
    protected function alertClasses(array $modifiers): string
    {
        $type = $modifiers['type'] ?? 'info';

        return "alert alert-{$type}";
    }

    /**
     * @param  array<string, mixed>  $modifiers
     */
    protected function cardClasses(array $modifiers): string
    {
        $classes = 'card';
        if (isset($modifiers['borderColor'])) {
            $classes .= ' border-' . $modifiers['borderColor'];
        }

        return $classes;
    }

    /**
     * @param  array<string, mixed>  $modifiers
     */
    protected function buttonClasses(array $modifiers): string
    {
        $variant = $modifiers['variant'] ?? 'primary';
        $outline = ! empty($modifiers['outline']);
        $btnClass = $outline ? "btn-outline-{$variant}" : "btn-{$variant}";

        $classes = "btn {$btnClass}";

        if (isset($modifiers['size']) && in_array($modifiers['size'], ['sm', 'lg'], true)) {
            $classes .= " btn-{$modifiers['size']}";
        }

        return $classes;
    }

    /**
     * @param  array<string, mixed>  $modifiers
     */
    protected function rowClasses(array $modifiers): string
    {
        $gutter = max(0, min(5, (int) ($modifiers['gutter'] ?? 3)));
        $classes = "row g-{$gutter}";

        $justifyMap = [
            'center'  => 'justify-content-center',
            'end'     => 'justify-content-end',
            'between' => 'justify-content-between',
            'around'  => 'justify-content-around',
            'evenly'  => 'justify-content-evenly',
        ];

        $alignMap = [
            'start'  => 'align-items-start',
            'center' => 'align-items-center',
            'end'    => 'align-items-end',
        ];

        if (isset($modifiers['justify']) && isset($justifyMap[$modifiers['justify']])) {
            $classes .= ' ' . $justifyMap[$modifiers['justify']];
        }

        if (isset($modifiers['align']) && isset($alignMap[$modifiers['align']])) {
            $classes .= ' ' . $alignMap[$modifiers['align']];
        }

        return $classes;
    }

    /**
     * Sanitize and return Bootstrap col class.
     *
     * @param  array<string, mixed>  $modifiers
     */
    protected function colClass(array $modifiers): string
    {
        $colClass = (string) ($modifiers['colClass'] ?? 'col');

        $sanitized = implode(' ', array_filter(
            explode(' ', $colClass),
            fn (string $cls) => (bool) preg_match('/^col(-(?:sm|md|lg|xl|xxl))?(-(?:auto|\d{1,2}))?$/', $cls)
        ));

        return $sanitized !== '' ? $sanitized : 'col';
    }

    /**
     * @param  array<string, mixed>  $modifiers
     */
    protected function tableClasses(array $modifiers): string
    {
        $classes = 'table';

        if (! empty($modifiers['bordered'])) {
            $classes .= ' table-bordered';
        }
        if (! empty($modifiers['striped'])) {
            $classes .= ' table-striped';
        }
        if (! empty($modifiers['hover'])) {
            $classes .= ' table-hover';
        }
        if (! empty($modifiers['small'])) {
            $classes .= ' table-sm';
        }
        if (! empty($modifiers['alignMiddle'])) {
            $classes .= ' align-middle';
        }

        return $classes;
    }

    /**
     * @param  array<string, mixed>  $modifiers
     */
    protected function videoRatioClass(array $modifiers): string
    {
        $ratio = $modifiers['ratio'] ?? '16x9';

        return "ratio ratio-{$ratio}";
    }

    /**
     * @param  array<string, mixed>  $modifiers
     */
    protected function galleryClasses(array $modifiers): string
    {
        $gap = max(0, min(5, (int) ($modifiers['gap'] ?? 2)));

        return "row g-{$gap}";
    }

    /**
     * @param  array<string, mixed>  $modifiers
     */
    protected function galleryItemClass(array $modifiers): string
    {
        $colClass = (string) ($modifiers['colClass'] ?? 'col-4');

        if (! preg_match('/^col(-\w+)*$/', $colClass)) {
            return 'col-4';
        }

        return $colClass;
    }
}
