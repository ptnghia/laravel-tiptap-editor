<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Services\ClassMap;

class TailwindClassMap implements ClassMapInterface
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
        return 'tailwind';
    }

    public function isTailwind(): bool
    {
        return true;
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
            'card.header'    => 'px-6 py-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-900',
            'card.body'      => 'p-6',
            'card.footer'    => 'px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600',
            'button'         => $this->buttonClasses($modifiers),
            'row'            => $this->rowClasses($modifiers),
            'col'            => $this->colClass($modifiers),
            'table'          => $this->tableClasses($modifiers),
            'table.wrapper'  => 'overflow-x-auto',
            'image'          => 'max-w-full h-auto',
            'image.caption'  => 'text-sm text-gray-500 mt-2 text-center',
            'video.ratio'    => $this->videoRatioClass($modifiers),
            'gallery'        => $this->galleryClasses($modifiers),
            'gallery.item'   => $this->galleryItemClass($modifiers),
            'gallery.image'  => 'max-w-full h-auto rounded-md',
            default          => '',
        };
    }

    /**
     * @param  array<string, mixed>  $modifiers
     */
    protected function alertClasses(array $modifiers): string
    {
        $type = $modifiers['type'] ?? 'info';

        $map = [
            'primary'   => 'flex p-4 rounded-lg bg-blue-50 text-blue-800 border border-blue-200',
            'secondary' => 'flex p-4 rounded-lg bg-gray-50 text-gray-800 border border-gray-200',
            'success'   => 'flex p-4 rounded-lg bg-green-50 text-green-800 border border-green-200',
            'danger'    => 'flex p-4 rounded-lg bg-red-50 text-red-800 border border-red-200',
            'warning'   => 'flex p-4 rounded-lg bg-yellow-50 text-yellow-800 border border-yellow-200',
            'info'      => 'flex p-4 rounded-lg bg-sky-50 text-sky-800 border border-sky-200',
            'light'     => 'flex p-4 rounded-lg bg-white text-gray-800 border border-gray-200',
            'dark'      => 'flex p-4 rounded-lg bg-gray-800 text-white border border-gray-900',
        ];

        return $map[$type] ?? $map['info'];
    }

    /**
     * @param  array<string, mixed>  $modifiers
     */
    protected function cardClasses(array $modifiers): string
    {
        $base = 'rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden';

        // Add colored border when borderColor is set
        if (isset($modifiers['borderColor'])) {
            $colorMap = [
                'primary'   => 'border-blue-500',
                'secondary' => 'border-gray-500',
                'success'   => 'border-green-500',
                'danger'    => 'border-red-500',
                'warning'   => 'border-yellow-500',
                'info'      => 'border-sky-500',
                'light'     => 'border-gray-200',
                'dark'      => 'border-gray-800',
            ];

            $borderClass = $colorMap[$modifiers['borderColor']] ?? '';
            if ($borderClass !== '') {
                // Replace default border with the colored one
                $base = str_replace('border-gray-200', $borderClass, $base);
            }
        }

        return $base;
    }

    /**
     * @param  array<string, mixed>  $modifiers
     */
    protected function buttonClasses(array $modifiers): string
    {
        $variant = $modifiers['variant'] ?? 'primary';
        $outline = ! empty($modifiers['outline']);

        $solidMap = [
            'primary'   => 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
            'secondary' => 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
            'success'   => 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
            'danger'    => 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
            'warning'   => 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400',
            'info'      => 'bg-sky-500 text-white hover:bg-sky-600 focus:ring-sky-400',
            'light'     => 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-300',
            'dark'      => 'bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-700',
            'link'      => 'bg-transparent text-blue-600 hover:text-blue-800 hover:underline focus:ring-blue-500',
        ];

        $outlineMap = [
            'primary'   => 'border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
            'secondary' => 'border border-gray-600 text-gray-600 hover:bg-gray-50 focus:ring-gray-500',
            'success'   => 'border border-green-600 text-green-600 hover:bg-green-50 focus:ring-green-500',
            'danger'    => 'border border-red-600 text-red-600 hover:bg-red-50 focus:ring-red-500',
            'warning'   => 'border border-yellow-500 text-yellow-600 hover:bg-yellow-50 focus:ring-yellow-400',
            'info'      => 'border border-sky-500 text-sky-600 hover:bg-sky-50 focus:ring-sky-400',
            'light'     => 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-300',
            'dark'      => 'border border-gray-800 text-gray-800 hover:bg-gray-100 focus:ring-gray-700',
        ];

        $variantClasses = $outline
            ? ($outlineMap[$variant] ?? $outlineMap['primary'])
            : ($solidMap[$variant] ?? $solidMap['primary']);

        $base = 'inline-flex items-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

        // Size
        $sizeClasses = match ($modifiers['size'] ?? '') {
            'sm'    => 'px-2.5 py-1.5 text-xs',
            'lg'    => 'px-6 py-3 text-base',
            default => 'px-4 py-2 text-sm',
        };

        return "{$base} {$sizeClasses} {$variantClasses}";
    }

    /**
     * @param  array<string, mixed>  $modifiers
     */
    protected function rowClasses(array $modifiers): string
    {
        $gutter = max(0, min(5, (int) ($modifiers['gutter'] ?? 3)));
        $classes = "grid grid-cols-12 gap-{$gutter}";

        $justifyMap = [
            'center'  => 'justify-items-center',
            'end'     => 'justify-items-end',
            'between' => 'justify-between',
            'around'  => 'justify-around',
            'evenly'  => 'justify-evenly',
        ];

        $alignMap = [
            'start'  => 'items-start',
            'center' => 'items-center',
            'end'    => 'items-end',
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
     * Convert Bootstrap col class to Tailwind col-span equivalent.
     *
     * e.g. "col-6 col-md-4 col-lg-3" → "col-span-6 md:col-span-4 lg:col-span-3"
     *
     * @param  array<string, mixed>  $modifiers
     */
    protected function colClass(array $modifiers): string
    {
        $colClass = (string) ($modifiers['colClass'] ?? 'col');

        return $this->convertBootstrapColToTailwind($colClass);
    }

    /**
     * Convert a Bootstrap column class string to Tailwind col-span classes.
     */
    protected function convertBootstrapColToTailwind(string $colClass): string
    {
        $breakpointMap = [
            'sm'  => 'sm',
            'md'  => 'md',
            'lg'  => 'lg',
            'xl'  => 'xl',
            'xxl' => '2xl',
        ];

        $parts = array_filter(explode(' ', trim($colClass)));
        $tailwindParts = [];

        foreach ($parts as $part) {
            // Standalone "col" → full width
            if ($part === 'col') {
                $tailwindParts[] = 'col-span-12';
                continue;
            }

            // col[-{bp}][-{size}]
            if (preg_match('/^col(?:-(sm|md|lg|xl|xxl))?(?:-(auto|\d{1,2}))?$/', $part, $m)) {
                $bp   = $m[1] ?? null;
                $size = $m[2] ?? null;

                $prefix = $bp ? ($breakpointMap[$bp] ?? $bp) . ':' : '';

                if ($size === 'auto') {
                    $tailwindParts[] = $prefix . 'w-auto';
                } elseif ($size !== null && $size !== '') {
                    $tailwindParts[] = $prefix . 'col-span-' . $size;
                } else {
                    // col-{bp} without size → full width at that breakpoint
                    $tailwindParts[] = $prefix . 'col-span-12';
                }
            }
            // Skip invalid patterns
        }

        return implode(' ', $tailwindParts) ?: 'col-span-12';
    }

    /**
     * @param  array<string, mixed>  $modifiers
     */
    protected function tableClasses(array $modifiers): string
    {
        $classes = 'w-full text-sm text-left text-gray-700';

        if (! empty($modifiers['bordered'])) {
            $classes .= ' border border-gray-200 [&_td]:border [&_td]:border-gray-200 [&_th]:border [&_th]:border-gray-200';
        }
        if (! empty($modifiers['striped'])) {
            $classes .= ' [&_tbody_tr:nth-child(even)]:bg-gray-50';
        }
        if (! empty($modifiers['hover'])) {
            $classes .= ' [&_tbody_tr:hover]:bg-gray-100';
        }
        if (! empty($modifiers['small'])) {
            $classes .= ' [&_td]:py-1 [&_td]:px-2 [&_th]:py-1 [&_th]:px-2';
        }
        if (! empty($modifiers['alignMiddle'])) {
            $classes .= ' [&_td]:align-middle [&_th]:align-middle';
        }

        return $classes;
    }

    /**
     * @param  array<string, mixed>  $modifiers
     */
    protected function videoRatioClass(array $modifiers): string
    {
        $ratio = $modifiers['ratio'] ?? '16x9';

        $map = [
            '16x9' => 'aspect-video',
            '4x3'  => 'aspect-[4/3]',
            '1x1'  => 'aspect-square',
            '21x9' => 'aspect-[21/9]',
            '9x16' => 'aspect-[9/16]',
        ];

        return $map[$ratio] ?? 'aspect-video';
    }

    /**
     * @param  array<string, mixed>  $modifiers
     */
    protected function galleryClasses(array $modifiers): string
    {
        $gap = max(0, min(5, (int) ($modifiers['gap'] ?? 2)));
        $columns = (int) ($modifiers['columns'] ?? 3);

        $colsMap = [
            2 => 'grid-cols-2',
            3 => 'grid-cols-3',
            4 => 'grid-cols-4',
            6 => 'grid-cols-6',
        ];

        $colsClass = $colsMap[$columns] ?? 'grid-cols-3';

        return "grid {$colsClass} gap-{$gap}";
    }

    /**
     * Convert gallery item col class to Tailwind.
     *
     * @param  array<string, mixed>  $modifiers
     */
    protected function galleryItemClass(array $modifiers): string
    {
        $colClass = (string) ($modifiers['colClass'] ?? 'col-4');

        return $this->convertBootstrapColToTailwind($colClass);
    }
}
