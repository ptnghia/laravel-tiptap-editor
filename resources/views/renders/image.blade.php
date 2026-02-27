@php
    $src = e($attrs['src'] ?? '');
    if ($src === '') return;

    $alt = e($attrs['alt'] ?? '');
    $title = isset($attrs['title']) ? ' title="' . e($attrs['title']) . '"' : '';
    $width = isset($attrs['width']) ? ' width="' . (int) $attrs['width'] . '"' : '';
    $height = isset($attrs['height']) ? ' height="' . (int) $attrs['height'] . '"' : '';
    $loading = ' loading="' . e($attrs['loading'] ?? 'lazy') . '"';

    $alignment = in_array($attrs['alignment'] ?? '', ['left', 'center', 'right'], true)
        ? $attrs['alignment'] : 'center';
    $alignClass = match ($alignment) {
        'left' => 'text-start',
        'right' => 'text-end',
        default => 'text-center',
    };
@endphp
<figure class="{{ $alignClass }}">
    <img src="{{ $src }}" alt="{{ $alt }}"{!! $title !!}{!! $width !!}{!! $height !!}{!! $loading !!} class="img-fluid">
    @if (!empty($attrs['caption']))
        <figcaption class="figure-caption">{{ e($attrs['caption']) }}</figcaption>
    @endif
</figure>
