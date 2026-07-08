import { visit } from 'unist-util-visit';

const WIKI_LINK_REGEX = /\[\[([^[\]]+)\]\]/g;

// Resolves [[Page Title]] references against the project's loaded wiki page tree into
// real links. Unresolved references are left as literal text — no interactivity is
// attempted for creating missing pages from within the rendered markdown.
export default function wikiLinkPlugin({ wikiPages, basePath }) {
  const pagesByTitle = new Map((wikiPages || []).map((page) => [page.title.toLowerCase(), page]));

  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || index === null || !node.value.includes('[[')) {
        return;
      }

      WIKI_LINK_REGEX.lastIndex = 0;

      const newNodes = [];
      let lastIndex = 0;
      let match = WIKI_LINK_REGEX.exec(node.value);

      while (match !== null) {
        const title = match[1].trim();
        const page = pagesByTitle.get(title.toLowerCase());

        if (page) {
          if (match.index > lastIndex) {
            newNodes.push({ type: 'text', value: node.value.slice(lastIndex, match.index) });
          }

          newNodes.push({
            type: 'link',
            url: `${basePath}/${page.slug}`,
            children: [{ type: 'text', value: title }],
          });

          lastIndex = match.index + match[0].length;
        }

        match = WIKI_LINK_REGEX.exec(node.value);
      }

      if (newNodes.length === 0) {
        return;
      }

      if (lastIndex < node.value.length) {
        newNodes.push({ type: 'text', value: node.value.slice(lastIndex) });
      }

      parent.children.splice(index, 1, ...newNodes);
    });
  };
}
