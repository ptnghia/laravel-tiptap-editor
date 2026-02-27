@php
    $src = e($attrs['src'] ?? '');
    if ($src === '') return;

    $alt = e($attrs['alt'] ?? '');

    $colClass = $attrs['colClass'] ?? 'col-4';
    // Sanitize colClass – only allow col-* pattern
    if (!preg_match('/^col(-\w+)*$/', $colClass)) {
        $colClass = 'col-4';
    }
@endphp
<div class="{{ $colClass }}">
    <img src="{{ $src }}" alt="{{ $alt }}" class="img-fluid rounded" loading="lazy">
</div>
