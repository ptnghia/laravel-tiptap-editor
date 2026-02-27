@php
    $columns = (int) ($attrs['columns'] ?? 3);
    $validColumns = [2, 3, 4, 6];
    if (!in_array($columns, $validColumns, true)) {
        $columns = 3;
    }

    $gap = (int) ($attrs['gap'] ?? 2);
    if ($gap < 0 || $gap > 5) {
        $gap = 2;
    }

    $lightbox = !empty($attrs['lightbox']);
    $colSize = (int) floor(12 / $columns);
@endphp
<div class="row g-{{ $gap }}"@if($lightbox) data-lightbox="true"@endif>
{!! $content !!}
</div>
