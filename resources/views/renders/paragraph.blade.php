@php
    $style = '';
    if (isset($attrs['textAlign']) && $attrs['textAlign'] !== 'left') {
        $style = ' style="text-align: ' . e($attrs['textAlign']) . '"';
    }
@endphp
<p{!! $style !!}>{!! $childrenHtml !!}</p>
