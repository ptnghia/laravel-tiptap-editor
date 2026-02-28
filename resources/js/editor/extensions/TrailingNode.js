/**
 * TrailingNode – Tiptap Extension
 *
 * Ensures there is always an empty trailing paragraph at the end of the document.
 * This solves the problem where users cannot click below the last block node
 * (image, video, table, etc.) to continue typing.
 */

import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

const TrailingNode = Extension.create({
  name: 'trailingNode',

  addProseMirrorPlugins() {
    const pluginKey = new PluginKey('trailingNode');

    return [
      new Plugin({
        key: pluginKey,
        appendTransaction: (_, __, state) => {
          const { doc, tr, schema } = state;
          const lastNode = doc.lastChild;

          // If the last node is not an empty paragraph, append one
          if (!lastNode) return null;

          const isLastNodeParagraph = lastNode.type.name === 'paragraph';
          const isLastNodeEmpty =
            isLastNodeParagraph && lastNode.content.size === 0;

          if (isLastNodeEmpty) return null;

          // Only add trailing paragraph after block nodes that are hard to escape
          const nodesThatNeedTrailing = [
            'table',
            'customImage',
            'customVideo',
            'gallery',
            'bootstrapAlert',
            'bootstrapCard',
            'bootstrapRow',
            'codeBlock',
            'blockquote',
            'horizontalRule',
            'bootstrapButton',
          ];

          // If last node is a paragraph (even with content), that's fine—user can press Enter
          if (isLastNodeParagraph) return null;

          // For other block nodes, always ensure trailing paragraph
          const paragraphType = schema.nodes.paragraph;
          if (!paragraphType) return null;

          return tr.insert(doc.content.size, paragraphType.create());
        },
      }),
    ];
  },
});

export default TrailingNode;
