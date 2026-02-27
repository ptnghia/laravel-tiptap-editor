/**
 * Tiptap Editor – Utility Helpers
 *
 * Common utility functions used across editor modules.
 * No external dependencies – pure vanilla JS.
 */

/**
 * Debounce a function call.
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function with .cancel() method
 */
export function debounce(fn, delay = 250) {
  let timer = null;
  const debounced = (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };
  return debounced;
}

/**
 * Throttle a function call.
 * @param {Function} fn - Function to throttle
 * @param {number} limit - Minimum interval in milliseconds
 * @returns {Function}
 */
export function throttle(fn, limit = 100) {
  let lastCall = 0;
  let timer = null;
  return (...args) => {
    const now = Date.now();
    const remaining = limit - (now - lastCall);
    if (remaining <= 0) {
      lastCall = now;
      fn(...args);
    } else if (!timer) {
      timer = setTimeout(() => {
        lastCall = Date.now();
        timer = null;
        fn(...args);
      }, remaining);
    }
  };
}

/**
 * Escape HTML special characters to prevent XSS.
 * @param {string} str - Raw string
 * @returns {string} Escaped string
 */
export function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

/**
 * Generate a unique ID with an optional prefix.
 * @param {string} prefix
 * @returns {string}
 */
export function uniqueId(prefix = 'tiptap') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Clamp a number between min and max.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Check if an element is visible in the viewport.
 * @param {HTMLElement} el
 * @returns {boolean}
 */
export function isInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Create a DOM element with attributes and children.
 * @param {string} tag - HTML tag name
 * @param {Object} attrs - Attributes to set
 * @param {Array<HTMLElement|string>} children - Children elements or text
 * @returns {HTMLElement}
 */
export function createElement(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'className') {
      el.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(el.style, value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'dataset' && typeof value === 'object') {
      Object.entries(value).forEach(([k, v]) => {
        el.dataset[k] = v;
      });
    } else {
      el.setAttribute(key, value);
    }
  });
  children.forEach((child) => {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else if (child instanceof HTMLElement) {
      el.appendChild(child);
    }
  });
  return el;
}

/**
 * Detect OS for keyboard shortcut display.
 * @returns {'mac'|'windows'|'linux'}
 */
export function detectOS() {
  const platform = navigator.userAgentData?.platform || navigator.platform || '';
  if (/mac/i.test(platform)) return 'mac';
  if (/linux/i.test(platform)) return 'linux';
  return 'windows';
}

/**
 * Format a keyboard shortcut for display based on OS.
 * Converts generic modifier names to OS-specific symbols.
 * @param {string} shortcut - e.g. 'Mod+B', 'Mod+Shift+I'
 * @returns {string} e.g. '⌘B' (mac) or 'Ctrl+B' (win/linux)
 */
export function formatShortcut(shortcut) {
  const os = detectOS();
  const isMac = os === 'mac';

  return shortcut
    .replace(/Mod/g, isMac ? '⌘' : 'Ctrl')
    .replace(/Alt/g, isMac ? '⌥' : 'Alt')
    .replace(/Shift/g, isMac ? '⇧' : 'Shift')
    .replace(/\+/g, isMac ? '' : '+');
}

/**
 * Simple class-based event emitter mixin.
 * @param {Object} target - Object to add emitter methods to
 * @returns {Object} The target with emitter methods
 */
export function makeEmitter(target) {
  const listeners = {};
  target.on = (event, fn) => {
    (listeners[event] = listeners[event] || []).push(fn);
    return target;
  };
  target.off = (event, fn) => {
    if (listeners[event]) {
      listeners[event] = listeners[event].filter((f) => f !== fn);
    }
    return target;
  };
  target.emit = (event, ...args) => {
    (listeners[event] || []).forEach((fn) => fn(...args));
  };
  return target;
}
