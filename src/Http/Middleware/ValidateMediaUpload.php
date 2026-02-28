<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Http\Middleware;

use Closure;
use Illuminate\Cache\RateLimiter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware to validate media upload requests.
 *
 * Provides:
 * - Authentication check
 * - Rate limiting (configurable per user)
 * - Request size validation
 */
class ValidateMediaUpload
{
    /**
     * Create a new middleware instance.
     */
    public function __construct(
        protected RateLimiter $limiter,
    ) {
    }

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Rate limiting
        $key = $this->resolveRateLimitKey($request);
        $maxAttempts = (int) config('tiptap-editor.media.rate_limit.max_uploads', 30);
        $decayMinutes = (int) config('tiptap-editor.media.rate_limit.per_minutes', 1);

        if ($this->limiter->tooManyAttempts($key, $maxAttempts)) {
            $retryAfter = $this->limiter->availableIn($key);

            return new JsonResponse([
                'message' => 'Too many upload attempts. Please try again later.',
                'retry_after' => $retryAfter,
            ], Response::HTTP_TOO_MANY_REQUESTS, [
                'Retry-After' => (string) $retryAfter,
                'X-RateLimit-Limit' => (string) $maxAttempts,
                'X-RateLimit-Remaining' => '0',
            ]);
        }

        $this->limiter->hit($key, $decayMinutes * 60);

        // Content length check
        $maxRequestSize = ((int) config('tiptap-editor.media.max_file_size', 5120)) * 1024; // KB to bytes
        $contentLength = (int) $request->header('Content-Length', '0');

        if ($contentLength > 0 && $contentLength > $maxRequestSize) {
            return new JsonResponse([
                'message' => 'Request body too large.',
            ], Response::HTTP_REQUEST_ENTITY_TOO_LARGE);
        }

        // Validate file extension against blocked list
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $extension = strtolower($file->getClientOriginalExtension());
            $blockedExtensions = (array) config('tiptap-editor.media.blocked_extensions', []);

            if (in_array($extension, $blockedExtensions, true)) {
                return new JsonResponse([
                    'message' => 'File type is not allowed.',
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            // MIME type / extension consistency check
            $detectedMime = $file->getMimeType();
            $clientMime = $file->getClientMimeType();

            if ($detectedMime && $clientMime && $this->isMimeMismatch($detectedMime, $clientMime)) {
                return new JsonResponse([
                    'message' => 'File type mismatch detected.',
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            // Null byte in filename check
            $originalName = $file->getClientOriginalName();
            if (str_contains($originalName, "\0")) {
                return new JsonResponse([
                    'message' => 'Invalid filename.',
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        $response = $next($request);

        // Add rate limit headers
        $response->headers->set('X-RateLimit-Limit', (string) $maxAttempts);
        $response->headers->set(
            'X-RateLimit-Remaining',
            (string) $this->limiter->remaining($key, $maxAttempts)
        );

        return $response;
    }

    /**
     * Check if detected MIME type and client MIME type are inconsistent.
     */
    protected function isMimeMismatch(string $detected, string $client): bool
    {
        // Get the general type (image, video, application, etc.)
        $detectedType = explode('/', $detected)[0] ?? '';
        $clientType = explode('/', $client)[0] ?? '';

        // Allow application/octet-stream as it's a fallback
        if ($detected === 'application/octet-stream' || $client === 'application/octet-stream') {
            return false;
        }

        // Flag mismatch if general types differ
        return $detectedType !== $clientType;
    }

    /**
     * Resolve the rate limit key for the request.
     */
    protected function resolveRateLimitKey(Request $request): string
    {
        $userId = $request->user()?->getAuthIdentifier() ?? 'guest';

        return 'tiptap_upload_' . $userId . '_' . $request->ip();
    }
}
