<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class MediaUploadRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * Checks gate and role-based permissions from config.
     */
    public function authorize(): bool
    {
        $permissions = config('tiptap-editor.media.permissions', []);

        // Gate check
        $gate = $permissions['gate'] ?? null;
        if ($gate && ! Gate::allows($gate)) {
            return false;
        }

        // Role check (compatible with Spatie/Permission or any hasRole method)
        $roles = $permissions['roles'] ?? [];
        if (! empty($roles) && $this->user()) {
            if (method_exists($this->user(), 'hasAnyRole')) {
                return $this->user()->hasAnyRole($roles);
            }
            if (method_exists($this->user(), 'hasRole')) {
                foreach ($roles as $role) {
                    if ($this->user()->hasRole($role)) {
                        return true;
                    }
                }

                return false;
            }
            // Fallback: check a 'role' attribute on the user model
            if (isset($this->user()->role)) {
                return in_array($this->user()->role, $roles, true);
            }
        }

        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $maxSize = config('tiptap-editor.media.max_file_size', 5120);
        $allowedTypes = config('tiptap-editor.media.allowed_types', []);
        $mimes = $this->mimeTypesToExtensions($allowedTypes);

        return [
            'file' => [
                'required',
                'file',
                "max:{$maxSize}",
                "mimes:{$mimes}",
            ],
            'alt' => ['nullable', 'string', 'max:255'],
            'title' => ['nullable', 'string', 'max:255'],
            'caption' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Convert MIME types to file extension list for the mimes rule.
     *
     * @param  array<int, string>  $mimeTypes
     */
    protected function mimeTypesToExtensions(array $mimeTypes): string
    {
        $map = [
            'image/jpeg' => 'jpg,jpeg',
            'image/png' => 'png',
            'image/gif' => 'gif',
            'image/webp' => 'webp',
            'image/svg+xml' => 'svg',
            'video/mp4' => 'mp4',
            'video/webm' => 'webm',
        ];

        $extensions = [];
        foreach ($mimeTypes as $mime) {
            if (isset($map[$mime])) {
                $extensions[] = $map[$mime];
            }
        }

        return implode(',', $extensions);
    }

    /**
     * Get custom error messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'file.required' => 'A file is required.',
            'file.max' => 'The file size exceeds the maximum allowed size.',
            'file.mimes' => 'The file type is not allowed.',
        ];
    }
}
