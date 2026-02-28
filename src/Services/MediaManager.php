<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Suspended\TiptapEditor\Models\Media;

class MediaManager
{
    /**
     * Media configuration.
     *
     * @var array<string, mixed>
     */
    protected array $config;

    /**
     * Create a new MediaManager instance.
     *
     * @param  array<string, mixed>  $config
     */
    public function __construct(array $config = [])
    {
        $this->config = $config;
    }

    /**
     * Get the configured storage disk name.
     */
    public function disk(): string
    {
        return $this->config['disk'] ?? 'public';
    }

    /**
     * Get the configured upload path.
     */
    public function path(): string
    {
        return $this->config['path'] ?? 'tiptap-media';
    }

    /**
     * Get maximum file size in KB.
     */
    public function maxFileSize(): int
    {
        return (int) ($this->config['max_file_size'] ?? 5120);
    }

    /**
     * Get allowed MIME types.
     *
     * @return array<int, string>
     */
    public function allowedTypes(): array
    {
        return $this->config['allowed_types'] ?? [];
    }

    /**
     * Check if a MIME type is allowed.
     */
    public function isAllowedType(string $mimeType): bool
    {
        return in_array($mimeType, $this->allowedTypes(), true);
    }

    /**
     * Get the storage instance for the configured disk.
     */
    public function storage(): \Illuminate\Contracts\Filesystem\Filesystem
    {
        return Storage::disk($this->disk());
    }

    /**
     * Upload a file and create a Media record.
     */
    public function upload(UploadedFile $file): Media
    {
        // Block dangerous extensions
        $this->validateExtension($file);

        // Scan file content for embedded code
        $this->scanFileContent($file);

        $originalFilename = $file->getClientOriginalName();
        $extension = strtolower($file->getClientOriginalExtension());
        $filename = Str::uuid()->toString() . '.' . $extension;
        $datePath = date('Y/m');
        $relativePath = $this->resolveUploadDirectory($datePath);

        // Store the file
        $storedPath = $file->storeAs($relativePath, $filename, $this->disk());

        // Get image dimensions if applicable
        $width = null;
        $height = null;
        $mimeType = $file->getMimeType() ?? 'application/octet-stream';

        if (str_starts_with($mimeType, 'image/') && $mimeType !== 'image/svg+xml') {
            $dimensions = $this->getImageDimensions($file);
            $width = $dimensions['width'];
            $height = $dimensions['height'];
        }

        // Sanitize SVG files
        if ($mimeType === 'image/svg+xml') {
            $this->sanitizeSvg($storedPath ?: ($relativePath . '/' . $filename));
        }

        // Create media record
        $media = Media::create([
            'filename' => $filename,
            'original_filename' => $this->sanitizeFilename($originalFilename),
            'path' => $storedPath ?: ($relativePath . '/' . $filename),
            'disk' => $this->disk(),
            'mime_type' => $mimeType,
            'size' => $file->getSize(),
            'width' => $width,
            'height' => $height,
        ]);

        return $media;
    }

    /**
     * Resolve the upload directory based on the configured strategy.
     */
    protected function resolveUploadDirectory(string $datePath): string
    {
        $strategy = $this->config['directory_strategy'] ?? 'default';
        $basePath = $this->path();

        return match ($strategy) {
            'user' => $this->resolveUserDirectory($basePath, $datePath),
            'custom' => $this->resolveCustomDirectory($basePath, $datePath),
            default => $basePath . '/' . $datePath,
        };
    }

    /**
     * Resolve user-based upload directory.
     */
    protected function resolveUserDirectory(string $basePath, string $datePath): string
    {
        $userId = auth()->id() ?? 'anonymous';

        return $basePath . '/user-' . $userId . '/' . $datePath;
    }

    /**
     * Resolve custom upload directory via configured resolver.
     */
    protected function resolveCustomDirectory(string $basePath, string $datePath): string
    {
        $resolver = $this->config['directory_resolver'] ?? null;

        if (is_callable($resolver)) {
            $result = call_user_func($resolver, $basePath, $datePath, auth()->user());

            // Prevent path traversal in custom resolver output
            $result = str_replace(['../', '..\\'], '', $result);

            return $result;
        }

        // Fallback to default if no resolver configured
        return $basePath . '/' . $datePath;
    }

    /**
     * Validate file extension against blocked list.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    protected function validateExtension(UploadedFile $file): void
    {
        $extension = strtolower($file->getClientOriginalExtension());
        $blockedExtensions = $this->config['blocked_extensions'] ?? [];

        if (in_array($extension, $blockedExtensions, true)) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'file' => ['File type ".' . $extension . '" is not allowed.'],
            ]);
        }

        // Detect double extensions (e.g., file.php.jpg)
        $originalName = $file->getClientOriginalName();
        $parts = explode('.', $originalName);
        if (count($parts) > 2) {
            foreach (array_slice($parts, 0, -1) as $part) {
                if (in_array(strtolower($part), $blockedExtensions, true)) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'file' => ['File contains a blocked extension in its name.'],
                    ]);
                }
            }
        }
    }

    /**
     * Scan file content for embedded malicious code.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    protected function scanFileContent(UploadedFile $file): void
    {
        $content = file_get_contents($file->getPathname());

        if ($content === false) {
            return;
        }

        // Read only first 8KB for scanning (performance)
        $header = substr($content, 0, 8192);

        // Check for PHP tags
        if (preg_match('/<\?(php|=)/i', $header)) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'file' => ['File contains potentially malicious code.'],
            ]);
        }

        // Check for short open tags in non-XML files
        $mimeType = $file->getMimeType() ?? '';
        if (! str_contains($mimeType, 'xml') && str_contains($header, '<?')) {
            // Allow XML declarations
            $stripped = preg_replace('/<\?xml[^?]*\?>/', '', $header);
            if ($stripped !== null && str_contains($stripped, '<?')) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'file' => ['File contains potentially malicious code.'],
                ]);
            }
        }

        // Check for polyglot attack patterns
        $dangerousPatterns = [
            '/__HALT_COMPILER/i',
            '/eval\s*\(/i',
            '/exec\s*\(/i',
            '/system\s*\(/i',
            '/passthru\s*\(/i',
            '/shell_exec\s*\(/i',
            '/base64_decode\s*\(/i',
        ];

        foreach ($dangerousPatterns as $pattern) {
            if (preg_match($pattern, $header)) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'file' => ['File contains potentially malicious code.'],
                ]);
            }
        }
    }

    /**
     * Sanitize an SVG file to remove dangerous elements and attributes.
     */
    protected function sanitizeSvg(string $path): void
    {
        $storage = $this->storage();
        $content = $storage->get($path);

        if ($content === null) {
            return;
        }

        // Remove script tags
        $content = preg_replace('/<script\b[^>]*>.*?<\/script>/is', '', $content) ?? $content;

        // Remove on* event attributes (onclick, onload, onerror, etc.)
        $content = preg_replace('/\s+on\w+\s*=\s*["\'][^"\']*["\']/i', '', $content) ?? $content;
        $content = preg_replace('/\s+on\w+\s*=\s*\S+/i', '', $content) ?? $content;

        // Remove javascript: and data: URIs in attributes
        $content = preg_replace('/\b(href|xlink:href|src)\s*=\s*["\']?\s*javascript:[^"\'>\s]*/i', '', $content) ?? $content;
        $content = preg_replace('/\b(href|xlink:href|src)\s*=\s*["\']?\s*data:[^"\'>\s]*/i', '', $content) ?? $content;

        // Remove <use> tags that could reference external resources
        $content = preg_replace('/<use\b[^>]*xlink:href\s*=\s*["\']https?:\/\/[^"\']*["\'][^>]*\/?>/i', '', $content) ?? $content;

        // Remove <foreignObject> (can contain HTML/JS)
        $content = preg_replace('/<foreignObject\b[^>]*>.*?<\/foreignObject>/is', '', $content) ?? $content;

        // Remove set and animate elements that could execute JS
        $content = preg_replace('/<set\b[^>]*\bto\s*=\s*["\']javascript:[^"\']*["\'][^>]*\/?>/i', '', $content) ?? $content;

        $storage->put($path, $content);
    }

    /**
     * Sanitize a filename to prevent path traversal and special characters.
     */
    protected function sanitizeFilename(string $filename): string
    {
        // Remove path traversal
        $filename = str_replace(['../', '..\\', '/', '\\'], '', $filename);

        // Remove null bytes
        $filename = str_replace("\0", '', $filename);

        // Limit length
        if (mb_strlen($filename) > 255) {
            $ext = pathinfo($filename, PATHINFO_EXTENSION);
            $name = mb_substr(pathinfo($filename, PATHINFO_FILENAME), 0, 245);
            $filename = $name . '.' . $ext;
        }

        return $filename;
    }

    /**
     * Delete a media record and its files.
     */
    public function delete(Media $media): bool
    {
        return $media->delete() ?? false;
    }

    /**
     * Get the public URL for a media item.
     */
    public function getUrl(Media $media, ?string $size = null): string
    {
        return $media->getUrl($size);
    }

    /**
     * Get image dimensions from an uploaded file.
     *
     * @return array{width: int|null, height: int|null}
     */
    protected function getImageDimensions(UploadedFile $file): array
    {
        $path = $file->getPathname();
        $info = @getimagesize($path);

        if ($info === false) {
            return ['width' => null, 'height' => null];
        }

        return [
            'width' => $info[0],
            'height' => $info[1],
        ];
    }

    /**
     * Get the configured image sizes for thumbnails.
     *
     * @return array<string, array<int, int|null>>
     */
    public function imageSizes(): array
    {
        return $this->config['image_sizes'] ?? [];
    }

    /**
     * Check if WebP conversion is enabled.
     */
    public function webpConversionEnabled(): bool
    {
        return (bool) ($this->config['webp_conversion'] ?? false);
    }

    /**
     * Get max allowed dimensions.
     *
     * @return array{width: int, height: int}
     */
    public function maxDimensions(): array
    {
        return [
            'width' => (int) ($this->config['max_dimensions']['width'] ?? 2560),
            'height' => (int) ($this->config['max_dimensions']['height'] ?? 2560),
        ];
    }
}
