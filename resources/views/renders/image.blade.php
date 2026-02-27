@php
    $src = e($attrs['src'] ?? '');
    if ($src === '') return;

    $alt      = e($attrs['alt'] ?? '');
    $title    = isset($attrs['title'])  ? ' title="' . e($attrs['title'])  . '"' : '';
    $loading  = ' loading="' . e($attrs['loading'] ?? 'lazy') . '"';

    // Integer pixel dimensions from upload
    $width  = isset($attrs['width'])  && is_numeric($attrs['width'])  ? ' width="'  . (int)$attrs['width']  . '"' : '';
    $height = isset($attrs['height']) && is_numeric($attrs['height']) ? ' height="' . (int)$attrs['height'] . '"' : '';

    // Alignment class on <figure>
    $alignment = in_array($attrs['alignment'] ?? '', ['left', 'center', 'right'], true)
        ? $attrs['alignment'] : 'center';
    $alignClass = match($alignment) {
        'left'  => 'text-start',
        'right' => 'text-end',
        default => 'text-center',
    };

    // Extra CSS class on figure
    $extraClass = isset($attrs['extraClass']) ? ' ' . e($attrs['extraClass']) : '';

    // Width style on figure (e.g. "50%" / "400px")
    $widthStyle = !empty($attrs['widthStyle']) ? ' style="width:' . e($attrs['widthStyle']) . '"' : '';

    // Link wrapping
    $linkUrl    = $attrs['linkUrl']    ?? null;
    $linkTarget = $attrs['linkTarget'] ?? null;
    $linkRel    = ($linkTarget === '_blank') ? ' rel="noopener noreferrer"' : '';
    $linkTargetAttr = $linkTarget ? ' target="' . e($linkTarget) . '"' : '';
@endphp
<figure class="{{ $alignClass }}{{ $extraClass }}"{!! $widthStyle !!}>
    @if ($linkUrl)
        <a href="{{ e($linkUrl) }}"{!! $linkTargetAttr !!}{!! $linkRel !!}>
    @endif
    <img src="{{ $src }}" alt="{{ $alt }}"{!! $title !!}{!! $width !!}{!! $height !!}{!! $loading !!} class="img-fluid">
    @if ($linkUrl)
        </a>
    @endif
    @if (!empty($attrs['caption']))
        <figcaption class="figure-caption">{{ e($attrs['caption']) }}</figcaption>
    @endif
</figure>
