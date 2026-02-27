<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Form request for AI content generation.
 *
 * Validates the prompt, action type, and optional parameters
 * before passing to the AiContentController.
 */
class AiContentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'prompt' => ['required', 'string', 'min:3', 'max:5000'],
            'action' => ['sometimes', 'string', 'in:generate,refine,summarize,translate'],
            'provider' => ['sometimes', 'string', 'in:openai,claude'],
            'content' => ['required_if:action,refine', 'required_if:action,summarize', 'required_if:action,translate', 'nullable', 'string', 'max:50000'],
            'target_lang' => ['required_if:action,translate', 'nullable', 'string', 'max:50'],
            'max_length' => ['sometimes', 'integer', 'min:10', 'max:5000'],
            'template' => ['sometimes', 'string', 'max:100'],
            'template_vars' => ['sometimes', 'array'],
            'template_vars.*' => ['string', 'max:500'],
            'options' => ['sometimes', 'array'],
            'options.model' => ['sometimes', 'string', 'max:100'],
            'options.max_tokens' => ['sometimes', 'integer', 'min:100', 'max:16384'],
            'options.temperature' => ['sometimes', 'numeric', 'min:0', 'max:2'],
        ];
    }

    /**
     * Get custom messages for validation errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'prompt.required' => 'A prompt is required to generate content.',
            'prompt.min' => 'The prompt must be at least 3 characters.',
            'prompt.max' => 'The prompt must not exceed 5,000 characters.',
            'content.required_if' => 'Content is required for refine, summarize, and translate actions.',
            'target_lang.required_if' => 'Target language is required for translate action.',
        ];
    }
}
