@php
    $provider = $attrs['provider'] ?? 'youtube';
    $videoId = e($attrs['videoId'] ?? '');
    $title = e($attrs['title'] ?? '');
    $caption = e($attrs['caption'] ?? '');

    // Aspect ratio
    $allowedRatios = ['16x9', '4x3', '1x1', '21x9', '9x16'];
    $aspectRatio = in_array($attrs['aspectRatio'] ?? '16x9', $allowedRatios, true)
        ? $attrs['aspectRatio']
        : '16x9';
    $ratioClass = "ratio-{$aspectRatio}";

    // Alignment
    $alignment = $attrs['alignment'] ?? 'center';
    $alignClass = match ($alignment) {
        'left' => 'text-start',
        'right' => 'text-end',
        default => 'text-center',
    };

    // Width
    $widthStyle = '';
    if (! empty($attrs['widthStyle']) && preg_match('/^\d+(\.\d+)?(px|%)$/', $attrs['widthStyle'])) {
        $widthStyle = 'width:' . e($attrs['widthStyle']);
    }
@endphp
<figure class="tiptap-video-figure {{ $alignClass }}" @if($widthStyle) style="{{ $widthStyle }}" @endif>
@if ($provider === 'mp4')
    @php $url = e($attrs['url'] ?? $videoId); @endphp
    <div class="ratio {{ $ratioClass }}">
        <video controls title="{{ $title }}">
            <source src="{{ $url }}" type="video/mp4">
        </video>
    </div>
@else
    @php
        $videoProviders = config('tiptap-editor.video_providers', []);
        $embedUrl = '';
        if (isset($videoProviders[$provider]['embed_url']) && $videoId !== '') {
            $embedUrl = str_replace('{id}', $videoId, $videoProviders[$provider]['embed_url']);
        }
    @endphp
    @if ($embedUrl !== '')
        <div class="ratio {{ $ratioClass }}">
            <iframe src="{{ e($embedUrl) }}" title="{{ $title }}"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen loading="lazy"></iframe>
        </div>
    @endif
@endif
@if ($caption !== '')
    <figcaption>{{ $caption }}</figcaption>
@endif
</figure>
