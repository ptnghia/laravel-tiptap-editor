@php
    $allowedColors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];
    $borderColor = isset($attrs['borderColor']) && in_array($attrs['borderColor'], $allowedColors, true)
        ? $attrs['borderColor'] : null;
    $classes = 'card' . ($borderColor ? " border-{$borderColor}" : '');
@endphp
<div class="{{ $classes }}">
    @if (!empty($attrs['headerText']))
        <div class="card-header">{{ e($attrs['headerText']) }}</div>
    @endif
    <div class="card-body">{!! $childrenHtml !!}</div>
    @if (!empty($attrs['footerText']))
        <div class="card-footer">{{ e($attrs['footerText']) }}</div>
    @endif
</div>
