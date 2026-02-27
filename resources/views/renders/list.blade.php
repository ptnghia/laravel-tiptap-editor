@php
    $tag = ($node['type'] ?? '') === 'orderedList' ? 'ol' : 'ul';
    $start = ($tag === 'ol' && isset($attrs['start']) && (int) $attrs['start'] !== 1)
        ? ' start="' . (int) $attrs['start'] . '"' : '';
@endphp
<{{ $tag }}{!! $start !!}>{!! $childrenHtml !!}</{{ $tag }}>
