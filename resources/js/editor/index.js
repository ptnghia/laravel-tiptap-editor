/**
 * Tiptap Editor – Entry Point
 *
 * Auto-initializes all [data-tiptap-editor] elements on the page.
 * Exports the TiptapEditor class for manual initialization.
 */

import '../../css/editor.css';
import TiptapEditor from './Editor';
import MediaBrowser from './MediaBrowser';
import AiPanel from './AiPanel';
import BlockMenu from './BlockMenu';
import KeyboardShortcuts from './KeyboardShortcuts';
import AccessibilityManager from './AccessibilityManager';
import ResponsivePreview from './ResponsivePreview';

/**
 * Map of element ID → TiptapEditor instance for access from outside.
 * @type {Map<string, TiptapEditor>}
 */
const instances = new Map();

/**
 * Initialize all Tiptap editors on the page.
 * Skips elements that are already initialized.
 *
 * @returns {TiptapEditor[]} Array of newly created editor instances
 */
function initEditors() {
  const editorElements = document.querySelectorAll('[data-tiptap-editor]');
  const created = [];

  editorElements.forEach((element) => {
    if (element.dataset.initialized === 'true') return;

    const configAttr = element.dataset.config;
    const config = configAttr ? JSON.parse(configAttr) : {};

    const editorInstance = new TiptapEditor(element, config);
    const id = element.id || `tiptap-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    element.id = id;
    element.dataset.initialized = 'true';

    instances.set(id, editorInstance);
    created.push(editorInstance);
  });

  return created;
}

/**
 * Get an editor instance by its wrapper element ID.
 * @param {string} id
 * @returns {TiptapEditor|undefined}
 */
function getEditor(id) {
  return instances.get(id);
}

/**
 * Get all active editor instances.
 * @returns {Map<string, TiptapEditor>}
 */
function getAllEditors() {
  return instances;
}

/**
 * Destroy an editor instance by its wrapper element ID.
 * @param {string} id
 */
function destroyEditor(id) {
  const instance = instances.get(id);
  if (instance) {
    instance.destroy();
    instances.delete(id);
  }
}

// Auto-init on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEditors);
} else {
  initEditors();
}

// Export public API
export { TiptapEditor, MediaBrowser, AiPanel, BlockMenu, KeyboardShortcuts, AccessibilityManager, ResponsivePreview, initEditors, getEditor, getAllEditors, destroyEditor };
