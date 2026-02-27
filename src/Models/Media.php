<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Storage;

/**
 * Media model for storing uploaded files metadata.
 *
 * @property int $id
 * @property string $filename
 * @property string $original_filename
 * @property string $path
 * @property string $disk
 * @property string $mime_type
 * @property int $size
 * @property string|null $alt
 * @property string|null $title
 * @property string|null $caption
 * @property int|null $width
 * @property int|null $height
 * @property array|null $thumbnails
 * @property string|null $mediable_type
 * @property int|null $mediable_id
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class Media extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'tiptap_media';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'filename',
        'original_filename',
        'path',
        'disk',
        'mime_type',
        'size',
        'alt',
        'title',
        'caption',
        'width',
        'height',
        'thumbnails',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'size' => 'integer',
            'width' => 'integer',
            'height' => 'integer',
            'thumbnails' => 'array',
        ];
    }

    /**
     * Get the parent mediable model (polymorphic).
     */
    public function mediable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the full URL for this media file.
     */
    public function getUrl(?string $size = null): string
    {
        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk($this->disk);

        if ($size !== null && ! empty($this->thumbnails[$size])) {
            return $disk->url($this->thumbnails[$size]);
        }

        return $disk->url($this->path);
    }

    /**
     * Get the URL attribute.
     */
    public function getUrlAttribute(): string
    {
        return $this->getUrl();
    }

    /**
     * Check if this media is an image.
     */
    public function isImage(): bool
    {
        return str_starts_with($this->mime_type, 'image/');
    }

    /**
     * Check if this media is a video.
     */
    public function isVideo(): bool
    {
        return str_starts_with($this->mime_type, 'video/');
    }

    /**
     * Delete the media file(s) from storage.
     */
    public function deleteFiles(): bool
    {
        $storage = Storage::disk($this->disk);
        $deleted = $storage->delete($this->path);

        // Delete thumbnails
        if (! empty($this->thumbnails)) {
            foreach ($this->thumbnails as $thumbPath) {
                $storage->delete($thumbPath);
            }
        }

        return $deleted;
    }

    /**
     * Boot the model – delete files when model is deleted.
     */
    protected static function booted(): void
    {
        static::deleting(function (Media $media) {
            $media->deleteFiles();
        });
    }

    /**
     * Scope to filter only images.
     *
     * @param  \Illuminate\Database\Eloquent\Builder<static>  $query
     * @return \Illuminate\Database\Eloquent\Builder<static>
     */
    public function scopeImages(\Illuminate\Database\Eloquent\Builder $query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('mime_type', 'like', 'image/%');
    }

    /**
     * Scope to filter only videos.
     *
     * @param  \Illuminate\Database\Eloquent\Builder<static>  $query
     * @return \Illuminate\Database\Eloquent\Builder<static>
     */
    public function scopeVideos(\Illuminate\Database\Eloquent\Builder $query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('mime_type', 'like', 'video/%');
    }
}
