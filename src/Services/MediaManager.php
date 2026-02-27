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
        $originalFilename = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension();
        $filename = Str::uuid()->toString() . '.' . $extension;
        $datePath = date('Y/m');
        $relativePath = $this->path() . '/' . $datePath;

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

        // Create media record
        $media = Media::create([
            'filename' => $filename,
            'original_filename' => $originalFilename,
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
