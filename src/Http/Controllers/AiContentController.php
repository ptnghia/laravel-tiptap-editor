<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Suspended\TiptapEditor\Http\Requests\AiContentRequest;
use Suspended\TiptapEditor\Services\AiContentService;
use Suspended\TiptapEditor\Support\AiPromptTemplates;

/**
 * Controller for AI content generation endpoints.
 *
 * Provides generate, refine, summarize, and translate actions
 * via the AiContentService orchestrator.
 */
class AiContentController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct(
        protected AiContentService $aiService,
    ) {
    }

    /**
     * Generate new content from a prompt.
     *
     * POST /tiptap-editor/ai/generate
     */
    public function generate(AiContentRequest $request): JsonResponse
    {
        try {
            $prompt = $this->resolvePrompt($request);
            $options = $this->resolveOptions($request);

            $response = $this->aiService->generate($prompt, $options);

            return response()->json([
                'success' => true,
                'data' => $response->toArray(),
            ]);
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        } catch (\Throwable $e) {
            return $this->errorResponse('An unexpected error occurred.', 500);
        }
    }

    /**
     * Refine existing content based on an instruction.
     *
     * POST /tiptap-editor/ai/refine
     */
    public function refine(AiContentRequest $request): JsonResponse
    {
        try {
            $content = $request->validated('content', '');
            $instruction = $request->validated('prompt', '');
            $options = $this->resolveOptions($request);

            $response = $this->aiService->refine($content, $instruction, $options);

            return response()->json([
                'success' => true,
                'data' => $response->toArray(),
            ]);
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        } catch (\Throwable $e) {
            return $this->errorResponse('An unexpected error occurred.', 500);
        }
    }

    /**
     * Summarize content.
     *
     * POST /tiptap-editor/ai/summarize
     */
    public function summarize(AiContentRequest $request): JsonResponse
    {
        try {
            $content = $request->validated('content', '');
            $maxLength = (int) $request->validated('max_length', 150);
            $options = $this->resolveOptions($request);

            $response = $this->aiService->summarize($content, $maxLength, $options);

            return response()->json([
                'success' => true,
                'data' => $response->toArray(),
            ]);
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        } catch (\Throwable $e) {
            return $this->errorResponse('An unexpected error occurred.', 500);
        }
    }

    /**
     * Translate content to a target language.
     *
     * POST /tiptap-editor/ai/translate
     */
    public function translate(AiContentRequest $request): JsonResponse
    {
        try {
            $content = $request->validated('content', '');
            $targetLang = $request->validated('target_lang', 'English');
            $options = $this->resolveOptions($request);

            $response = $this->aiService->translate($content, $targetLang, $options);

            return response()->json([
                'success' => true,
                'data' => $response->toArray(),
            ]);
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        } catch (\Throwable $e) {
            return $this->errorResponse('An unexpected error occurred.', 500);
        }
    }

    /**
     * Resolve the prompt from template or direct input.
     */
    protected function resolvePrompt(AiContentRequest $request): string
    {
        $templateName = $request->validated('template');

        if ($templateName !== null) {
            $vars = $request->validated('template_vars', []);
            $resolved = AiPromptTemplates::fromConfig($templateName, $vars);

            if ($resolved !== null) {
                return $resolved;
            }
        }

        return $request->validated('prompt', '');
    }

    /**
     * Resolve provider options from request.
     *
     * @return array<string, mixed>
     */
    protected function resolveOptions(AiContentRequest $request): array
    {
        $options = $request->validated('options', []);

        if ($request->has('provider')) {
            $options['provider'] = $request->validated('provider');
        }

        return $options;
    }

    /**
     * Return a JSON error response.
     */
    protected function errorResponse(string $message, int $status = 422): JsonResponse
    {
        return response()->json([
            'success' => false,
            'error' => $message,
        ], $status);
    }
}
