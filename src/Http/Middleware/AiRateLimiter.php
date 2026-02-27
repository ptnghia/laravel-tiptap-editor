<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Http\Middleware;

use Closure;
use Illuminate\Cache\RateLimiter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Rate limiting middleware for AI content generation requests.
 *
 * Limits the number of AI requests per user per time window
 * as configured in tiptap-editor.ai.rate_limit.
 */
class AiRateLimiter
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
        // Check if AI is enabled
        if (! config('tiptap-editor.ai.enabled', false)) {
            return new JsonResponse([
                'success' => false,
                'error' => 'AI content generation is not enabled.',
            ], Response::HTTP_FORBIDDEN);
        }

        // Rate limiting
        $key = $this->resolveRateLimitKey($request);
        $maxAttempts = (int) config('tiptap-editor.ai.rate_limit.max_requests', 20);
        $decayMinutes = (int) config('tiptap-editor.ai.rate_limit.per_minutes', 60);

        if ($this->limiter->tooManyAttempts($key, $maxAttempts)) {
            $retryAfter = $this->limiter->availableIn($key);

            return new JsonResponse([
                'success' => false,
                'error' => 'Too many AI requests. Please try again later.',
                'retry_after' => $retryAfter,
            ], Response::HTTP_TOO_MANY_REQUESTS, [
                'Retry-After' => (string) $retryAfter,
                'X-RateLimit-Limit' => (string) $maxAttempts,
                'X-RateLimit-Remaining' => '0',
            ]);
        }

        $this->limiter->hit($key, $decayMinutes * 60);

        $response = $next($request);

        // Add rate limit headers to successful responses
        if ($response instanceof \Illuminate\Http\Response || $response instanceof JsonResponse) {
            $response->headers->set('X-RateLimit-Limit', (string) $maxAttempts);
            $response->headers->set('X-RateLimit-Remaining', (string) $this->limiter->remaining($key, $maxAttempts));
        }

        return $response;
    }

    /**
     * Resolve rate limit key for the current request.
     */
    protected function resolveRateLimitKey(Request $request): string
    {
        $userId = $request->user()?->getAuthIdentifier() ?? 'guest';

        return 'tiptap_ai:' . $userId . ':' . $request->ip();
    }
}
