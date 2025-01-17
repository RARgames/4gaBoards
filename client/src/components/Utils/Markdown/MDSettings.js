import rehypeExternalLinks from 'rehype-external-links';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { visit } from 'unist-util-visit';

const colorNames = ['black', 'grey', 'white', 'brown', 'red', 'purple', 'pink', 'green', 'lime', 'yellow', 'blue', 'cyan', 'orange'];

function recolorPlugin() {
  function transformer(tree) {
    const currentColorClass = [];
    visit(tree, (node, index, parent) => {
      if (node.type === 'comment') {
        const commentContent = node.value.trim().split('-');
        const colorIndex = colorNames.indexOf(commentContent[0]);
        if (colorIndex !== -1) {
          if (commentContent[1] === 'end') {
            const cIndex = currentColorClass.indexOf(colorNames[colorIndex]);
            if (cIndex !== -1) {
              currentColorClass.splice(cIndex, 1);
            }
          } else {
            currentColorClass.unshift(colorNames[colorIndex]);
          }
        }
      }

      if (currentColorClass.length > 0) {
        if (node.type === 'text' && node.value !== '\n') {
          // eslint-disable-next-line no-param-reassign
          parent.children[index] = {
            type: 'element',
            tagName: 'span',
            properties: { className: currentColorClass[0] },
            children: [{ type: 'text', value: node.value }],
          };
        }
      }
    });
    return tree;
  }
  return transformer;
}

function readdCopyButtonPlugin() {
  function transformer(tree) {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'div' && node.properties && node.properties.class && node.properties.class.includes('copied')) {
        // eslint-disable-next-line no-param-reassign
        node.children = [
          {
            type: 'element',
            tagName: 'svg',
            properties: { className: 'octicon-copy', ariaHidden: 'true', viewBox: '0 0 16 16', fill: 'currentColor', height: 12, width: 12 },
            children: [
              {
                type: 'element',
                tagName: 'path',
                properties: {
                  fillRule: 'evenodd',
                  d: 'M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z',
                },
                children: [],
              },
              {
                type: 'element',
                tagName: 'path',
                properties: {
                  fillRule: 'evenodd',
                  d: 'M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z',
                },
                children: [],
              },
            ],
          },
          {
            type: 'element',
            tagName: 'svg',
            properties: { className: 'octicon-check', ariaHidden: 'true', viewBox: '0 0 16 16', fill: 'currentColor', height: 12, width: 12 },
            children: [
              {
                type: 'element',
                tagName: 'path',
                properties: {
                  fillRule: 'evenodd',
                  d: 'M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z',
                },
                children: [],
              },
            ],
          },
        ];
      }
    });
    return tree;
  }
  return transformer;
}

const rehypePlugins = [
  [rehypeExternalLinks, { target: ['_blank'], rel: ['noreferrer', 'noopener'] }],
  [recolorPlugin],
  [
    rehypeSanitize,
    {
      ...defaultSchema,
      attributes: {
        ...defaultSchema.attributes,
        a: [...(defaultSchema.attributes.a || []), ['rel'], ['target']],
        pre: [...(defaultSchema.attributes.pre || []), ['className', /^language-./]],
        code: [...(defaultSchema.attributes.code || []), ['className', 'code-highlight', /^language-./]],
        div: [...(defaultSchema.attributes.div || []), ['class', 'copied'], ['data-code']], // for copy button
        ul: [...(defaultSchema.attributes.ul || []), ['className', 'contains-task-list']],
        span: [
          ...(defaultSchema.attributes.span || []),
          [
            'className',
            ...colorNames,
            // classNames from @uiw/react-markdown-preview/core/markdown.css
            // eslint-disable-next-line prettier/prettier
            'highlight-line', 'line-number', 'code-line', 'token', 'comment', 'prolog', 'doctype', 'cdata', 'namespace', 'property', 'tag', 'selector', 'constant', 'symbol', 'maybe-class-name', 'property-access', 'operator', 'boolean', 'number', 'class', 'attr-name', 'string', 'char', 'builtin', 'deleted', 'inserted', 'variable', 'entity', 'url', 'color', 'atrule', 'attr-value', 'function', 'class-name', 'rule', 'regex', 'important', 'keyword', 'coord', 'bold', 'italic',
            // other classNames from Prism
            // eslint-disable-next-line prettier/prettier
            'punctuation', 'parameter', 'arrow','control-flow', 'null', 'nil', 'method', 'console',
          ],
          ['line'],
        ],
      },
    },
  ],
  [readdCopyButtonPlugin],
];

const MDSettings = {
  colorNames,
  rehypePlugins,
};

export default MDSettings;
