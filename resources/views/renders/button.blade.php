@php
    $allowedVariants = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'link'];
    $variant = in_array($attrs['variant'] ?? '', $allowedVariants, true) ? $attrs['variant'] : 'primary';
    $outline = !empty($attrs['outline']);
    $btnClass = $outline ? "btn-outline-{$variant}" : "btn-{$variant}";
    $classes = "btn {$btnClass}";

    $allowedSizes = ['sm', 'lg'];
    if (isset($attrs['size']) && in_array($attrs['size'], $allowedSizes, true)) {
        $classes .= " btn-{$attrs['size']}";
    }

    $href = e($attrs['url'] ?? '#');
    $text = e($attrs['text'] ?? 'Button');
    $target = isset($attrs['target']) && $attrs['target'] === '_blank'
        ? ' target="_blank" rel="noopener noreferrer"' : '';
@endphp
<a href="{{ $href }}" class="{{ $classes }}" role="button"{!! $target !!}>{{ $text }}</a>
