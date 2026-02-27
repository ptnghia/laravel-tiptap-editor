@php
    $level = max(1, min(6, (int) ($attrs['level'] ?? 2)));
    $style = '';
    if (isset($attrs['textAlign']) && $attrs['textAlign'] !== 'left') {
        $style = ' style="text-align: ' . e($attrs['textAlign']) . '"';
    }
    $id = isset($attrs['id']) ? ' id="' . e($attrs['id']) . '"' : '';
@endphp
<h{{ $level }}{!! $id !!}{!! $style !!}>{!! $childrenHtml !!}</h{{ $level }}>
