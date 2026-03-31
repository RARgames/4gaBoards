import { rootPlugins, rootPrettierRules } from './eslint-configs/plugins.mjs';

export default [
  {
    ignores: ['node_modules'],
  },
  {
    files: ['**/*.{js,mjs,jsx}'],
    plugins: rootPlugins,
    rules: {
      ...rootPrettierRules,
      'prettier/prettier': 'error',
      'no-dupe-keys': 'error',
      'perfectionist/sort-imports': [
        'warn',
        {
          newlinesBetween: 1,
          groups: ['react', { newlinesBetween: 0 }, ['builtin', 'external', 'internal'], ['parent', 'sibling', 'index'], 'unknown', 'css', { newlinesBetween: 0 }, 'moduleCss'],
          customGroups: [
            {
              groupName: 'react',
              elementNamePattern: ['^react$', '^react-.+'],
            },
            {
              groupName: 'css',
              elementNamePattern: ['^.*(?<!\\.module)\\.(css|scss)$'],
            },
            {
              groupName: 'moduleCss',
              elementNamePattern: ['^.*\\.module\\.scss$'],
            },
          ],
          type: 'natural',
          order: 'asc',
          ignoreCase: true,
          partitionByNewLine: false,
          specialCharacters: 'keep',
        },
      ],
    },
  },
];
