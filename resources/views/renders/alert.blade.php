@php
    $allowedTypes = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];
    $type = in_array($attrs['type'] ?? '', $allowedTypes, true) ? $attrs['type'] : 'info';
@endphp
<div class="alert alert-{{ $type }}" role="alert">{!! $childrenHtml !!}</div>
