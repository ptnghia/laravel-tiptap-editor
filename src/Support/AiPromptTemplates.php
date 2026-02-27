<?php

declare(strict_types=1);

namespace Suspended\TiptapEditor\Support;

/**
 * Pre-built prompt templates for common content generation tasks.
 *
 * Each method returns a formatted prompt string ready to send to
 * the AiContentService. Users can also add custom templates via config.
 */
class AiPromptTemplates
{
    /**
     * Generate a blog post prompt.
     *
     * @param  string  $topic  The topic of the blog post
     * @param  string  $tone  Writing tone (e.g., 'professional', 'casual', 'friendly')
     * @param  int  $wordCount  Approximate target word count
     * @return string
     */
    public static function blogPost(string $topic, string $tone = 'professional', int $wordCount = 800): string
    {
        return "Write a blog post about \"{$topic}\".\n\n"
            . "Requirements:\n"
            . "- Tone: {$tone}\n"
            . "- Approximate length: {$wordCount} words\n"
            . "- Use an engaging title wrapped in <h1>\n"
            . "- Include 3-5 subheadings wrapped in <h2> or <h3>\n"
            . "- Use paragraphs, lists, and emphasis where appropriate\n"
            . "- Include a brief introduction and conclusion\n"
            . "- Output clean HTML format";
    }

    /**
     * Generate a product description prompt.
     *
     * @param  string  $product  The product name
     * @param  array<string>  $features  Key features to highlight
     * @param  string  $audience  Target audience description
     * @return string
     */
    public static function productDescription(string $product, array $features = [], string $audience = 'general'): string
    {
        $featureList = ! empty($features) ? implode(', ', $features) : 'key benefits and features';

        return "Write a compelling product description for \"{$product}\".\n\n"
            . "Requirements:\n"
            . "- Target audience: {$audience}\n"
            . "- Highlight these features: {$featureList}\n"
            . "- Include a catchy headline in <h2>\n"
            . "- Write 2-3 paragraphs of engaging description\n"
            . "- Include a bullet list of key features/benefits\n"
            . "- End with a call-to-action\n"
            . "- Output clean HTML format";
    }

    /**
     * Generate a FAQ section prompt.
     *
     * @param  string  $topic  The topic for FAQ
     * @param  int  $questionCount  Number of Q&A pairs to generate
     * @return string
     */
    public static function faq(string $topic, int $questionCount = 5): string
    {
        return "Create a FAQ section about \"{$topic}\".\n\n"
            . "Requirements:\n"
            . "- Generate {$questionCount} frequently asked questions and answers\n"
            . "- Each question should be wrapped in <h3>\n"
            . "- Each answer should be a clear, concise paragraph\n"
            . "- Cover common concerns and important details\n"
            . "- Output clean HTML format";
    }

    /**
     * Generate SEO meta content prompt.
     *
     * @param  string  $content  The page content to create meta for
     * @return string
     */
    public static function seoMeta(string $content): string
    {
        return "Based on the following content, generate SEO-optimized metadata:\n\n"
            . "{$content}\n\n"
            . "Generate:\n"
            . "1. A compelling meta title (50-60 characters) wrapped in <h2>\n"
            . "2. A meta description (150-160 characters) in a <p> tag\n"
            . "3. 5-8 relevant keywords in a comma-separated list inside a <p> tag\n"
            . "- Output clean HTML format";
    }

    /**
     * Generate a content outline prompt.
     *
     * @param  string  $topic  The topic to outline
     * @param  int  $sections  Number of main sections
     * @return string
     */
    public static function outline(string $topic, int $sections = 5): string
    {
        return "Create a detailed content outline for an article about \"{$topic}\".\n\n"
            . "Requirements:\n"
            . "- Generate {$sections} main sections with subpoints\n"
            . "- Use <h2> for main sections\n"
            . "- Use nested ordered or unordered lists for subpoints\n"
            . "- Include brief notes on what to cover in each section\n"
            . "- Output clean HTML format";
    }

    /**
     * Generate a rewrite prompt with a specific tone.
     *
     * @param  string  $content  The content to rewrite
     * @param  string  $tone  Target tone (e.g., 'formal', 'casual', 'persuasive')
     * @return string
     */
    public static function rewriteWithTone(string $content, string $tone = 'professional'): string
    {
        return "Rewrite the following content in a {$tone} tone:\n\n"
            . "{$content}\n\n"
            . "Requirements:\n"
            . "- Maintain the same meaning and key information\n"
            . "- Adjust the writing style to be {$tone}\n"
            . "- Preserve HTML structure and formatting\n"
            . "- Output clean HTML format";
    }

    /**
     * Generate a grammar and spelling fix prompt.
     *
     * @param  string  $content  The content to fix
     * @return string
     */
    public static function grammarFix(string $content): string
    {
        return "Fix all grammar, spelling, and punctuation errors in the following content:\n\n"
            . "{$content}\n\n"
            . "Requirements:\n"
            . "- Only fix errors, do not change the meaning or style\n"
            . "- Preserve all HTML tags and formatting\n"
            . "- Output the corrected HTML";
    }

    /**
     * Generate an expand content prompt.
     *
     * @param  string  $content  The content to expand
     * @param  int  $targetWords  Approximate target word count after expansion
     * @return string
     */
    public static function expand(string $content, int $targetWords = 500): string
    {
        return "Expand the following content to approximately {$targetWords} words:\n\n"
            . "{$content}\n\n"
            . "Requirements:\n"
            . "- Add more detail, examples, and explanation\n"
            . "- Maintain the original voice and style\n"
            . "- Use proper headings, paragraphs, and lists\n"
            . "- Preserve existing HTML formatting\n"
            . "- Output clean HTML format";
    }

    /**
     * Generate a shorten/condense content prompt.
     *
     * @param  string  $content  The content to condense
     * @return string
     */
    public static function shorten(string $content): string
    {
        return "Condense and shorten the following content while keeping the key points:\n\n"
            . "{$content}\n\n"
            . "Requirements:\n"
            . "- Reduce the length by approximately 50%\n"
            . "- Keep the most important information\n"
            . "- Maintain clarity and readability\n"
            . "- Preserve HTML formatting\n"
            . "- Output clean HTML format";
    }

    /**
     * Resolve a custom template from config by name.
     *
     * Replaces :placeholders with provided values.
     *
     * @param  string  $templateName  Template key from config
     * @param  array<string, string>  $variables  Placeholder values
     * @return string|null  The resolved prompt, or null if template not found
     */
    public static function fromConfig(string $templateName, array $variables = []): ?string
    {
        $templates = config('tiptap-editor.ai.prompt_templates', []);
        $template = $templates[$templateName] ?? null;

        if ($template === null) {
            return null;
        }

        foreach ($variables as $key => $value) {
            $template = str_replace(":{$key}", $value, $template);
        }

        return $template;
    }

    /**
     * Get all available built-in template names.
     *
     * @return array<string>
     */
    public static function availableTemplates(): array
    {
        return [
            'blog_post',
            'product_description',
            'faq',
            'seo_meta',
            'outline',
            'rewrite_with_tone',
            'grammar_fix',
            'expand',
            'shorten',
        ];
    }
}
