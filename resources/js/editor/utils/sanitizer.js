/**
 * Tiptap Editor – Client-side Content Sanitizer
 *
 * Provides lightweight sanitization for content displayed in the editor.
 * Server-side sanitization (JsonSanitizer.php) is the primary defense;
 * this module handles real-time client-side safety checks.
 */

/**
 * Dangerous URL schemes that should be blocked.
 * @type {RegExp[]}
 */
const DANGEROUS_PATTERNS = [
  /^javascript:/i,
  /^data:/i,
  /^vbscript:/i,
  /^file:/i,
];

/**
 * Allowed URL schemes.
 * @type {string[]}
 */
const SAFE_SCHEMES = ['http:', 'https:', 'mailto:', 'tel:'];

/**
 * Check if a URL is safe (not JavaScript/data/vbscript).
 * @param {string} url
 * @returns {boolean}
 */
export function isSafeUrl(url) {
  if (!url || typeof url !== 'string') return false;

  const trimmed = url.trim();

  // Allow relative URLs, hash links, and protocol-relative
  if (trimmed.startsWith('/') || trimmed.startsWith('#') || trimmed.startsWith('?')) {
    return true;
  }

  // Check against dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(trimmed)) return false;
  }

  // Check scheme whitelist
  try {
    const parsed = new URL(trimmed, window.location.origin);
    return SAFE_SCHEMES.includes(parsed.protocol);
  } catch {
    // If URL parsing fails, it's likely a relative path
    return !trimmed.includes(':');
  }
}

/**
 * Sanitize a URL by returning it if safe, or '#' if not.
 * @param {string} url
 * @returns {string}
 */
export function sanitizeUrl(url) {
  return isSafeUrl(url) ? url : '#';
}

/**
 * Strip all HTML tags from a string, keeping only text content.
 * @param {string} html
 * @returns {string}
 */
export function stripHtml(html) {
  if (!html || typeof html !== 'string') return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

/**
 * Sanitize an HTML attribute value, removing event handlers and scripts.
 * @param {string} value
 * @returns {string}
 */
export function sanitizeAttribute(value) {
  if (!value || typeof value !== 'string') return '';
  // Remove any event handler patterns
  return value.replace(/on\w+\s*=/gi, '').replace(/javascript:/gi, '');
}

/**
 * Validate that a CSS class name is safe (only alphanumeric, hyphens, underscores).
 * @param {string} className
 * @returns {boolean}
 */
export function isSafeClassName(className) {
  if (!className || typeof className !== 'string') return false;
  return /^[a-zA-Z_-][a-zA-Z0-9_ -]*$/.test(className);
}

/**
 * Sanitize a CSS class string, keeping only safe class names.
 * @param {string} classString
 * @returns {string}
 */
export function sanitizeClassNames(classString) {
  if (!classString || typeof classString !== 'string') return '';
  return classString
    .split(/\s+/)
    .filter(isSafeClassName)
    .join(' ');
}

/**
 * Validate file type against an allowed list.
 * @param {File} file
 * @param {string[]} allowedTypes - e.g. ['image/jpeg', 'image/png', 'image/webp']
 * @returns {boolean}
 */
export function isAllowedFileType(file, allowedTypes) {
  if (!file || !allowedTypes) return false;
  return allowedTypes.some((type) => {
    if (type.endsWith('/*')) {
      // Wildcard: 'image/*'
      return file.type.startsWith(type.replace('/*', '/'));
    }
    return file.type === type;
  });
}

/**
 * Check file size against a maximum (in bytes).
 * @param {File} file
 * @param {number} maxBytes
 * @returns {boolean}
 */
export function isWithinFileSize(file, maxBytes) {
  if (!file) return false;
  return file.size <= maxBytes;
}
