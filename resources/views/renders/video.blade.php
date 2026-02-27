@php
    $provider = $attrs['provider'] ?? 'youtube';
    $videoId = e($attrs['videoId'] ?? '');
    $title = e($attrs['title'] ?? '');
@endphp
@if ($provider === 'mp4')
    @php $url = e($attrs['url'] ?? $videoId); @endphp
    <div class="ratio ratio-16x9">
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
        <div class="ratio ratio-16x9">
            <iframe src="{{ e($embedUrl) }}" title="{{ $title }}"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen loading="lazy"></iframe>
        </div>
    @endif
@endif
