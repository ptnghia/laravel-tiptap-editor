<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Suspended\TiptapEditor\Http\Requests\MediaUploadRequest;
use Suspended\TiptapEditor\Models\Media;
use Suspended\TiptapEditor\Services\MediaManager;

class MediaUploadController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct(
        protected MediaManager $mediaManager,
    ) {
    }

    /**
     * Upload a single media file.
     */
    public function upload(MediaUploadRequest $request): JsonResponse
    {
        $file = $request->file('file');

        if ($file === null) {
            return response()->json(['error' => 'No file provided.'], 422);
        }

        $media = $this->mediaManager->upload($file);

        // Update optional metadata
        if ($request->filled('alt')) {
            $media->alt = $request->input('alt');
        }
        if ($request->filled('title')) {
            $media->title = $request->input('title');
        }
        if ($request->filled('caption')) {
            $media->caption = $request->input('caption');
        }
        if ($request->filled('alt') || $request->filled('title') || $request->filled('caption')) {
            $media->save();
        }

        return response()->json([
            'success' => true,
            'media' => [
                'id' => $media->id,
                'url' => $media->getUrl(),
                'filename' => $media->original_filename,
                'mime_type' => $media->mime_type,
                'size' => $media->size,
                'width' => $media->width,
                'height' => $media->height,
                'alt' => $media->alt,
                'title' => $media->title,
            ],
        ], 201);
    }

    /**
     * Browse existing media files.
     */
    public function browse(Request $request): JsonResponse
    {
        $query = Media::query()->orderBy('created_at', 'desc');

        // Filter by type
        if ($request->has('type')) {
            $type = $request->input('type');
            if ($type === 'image') {
                $query->images();
            } elseif ($type === 'video') {
                $query->videos();
            }
        }

        // Search by filename
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('original_filename', 'like', "%{$search}%");
        }

        $media = $query->paginate(24);

        return response()->json([
            'success' => true,
            'data' => $media->map(fn (Media $m) => [
                'id' => $m->id,
                'url' => $m->getUrl(),
                'thumbnail' => $m->getUrl('thumbnail'),
                'filename' => $m->original_filename,
                'mime_type' => $m->mime_type,
                'size' => $m->size,
                'width' => $m->width,
                'height' => $m->height,
                'alt' => $m->alt,
                'title' => $m->title,
                'created_at' => $m->created_at?->toIso8601String(),
            ]),
            'pagination' => [
                'current_page' => $media->currentPage(),
                'last_page' => $media->lastPage(),
                'per_page' => $media->perPage(),
                'total' => $media->total(),
            ],
        ]);
    }

    /**
     * Delete a media file.
     */
    public function delete(int $id): JsonResponse
    {
        $media = Media::findOrFail($id);

        $this->mediaManager->delete($media);

        return response()->json([
            'success' => true,
            'message' => 'Media deleted successfully.',
        ]);
    }
}
