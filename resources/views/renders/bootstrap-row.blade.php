@php
    $gutter = max(0, min(5, (int) ($attrs['gutter'] ?? 3)));
@endphp
<div class="row g-{{ $gutter }}">{!! $childrenHtml !!}</div>
