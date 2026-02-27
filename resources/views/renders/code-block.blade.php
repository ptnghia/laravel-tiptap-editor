@php
    $lang = isset($attrs['language']) ? ' class="language-' . e($attrs['language']) . '"' : '';
@endphp
<pre><code{!! $lang !!}>{!! $childrenHtml !!}</code></pre>
