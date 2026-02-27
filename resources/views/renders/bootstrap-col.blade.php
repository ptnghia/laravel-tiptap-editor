@php
    $colClass = e($attrs['colClass'] ?? 'col');
    $sanitized = implode(' ', array_filter(
        explode(' ', $colClass),
        fn (string $cls) => (bool) preg_match('/^col(-(?:sm|md|lg|xl|xxl))?(-(?:auto|\d{1,2}))?$/', $cls)
    ));
    if ($sanitized === '') {
        $sanitized = 'col';
    }
@endphp
<div class="{{ $sanitized }}">{!! $childrenHtml !!}</div>
