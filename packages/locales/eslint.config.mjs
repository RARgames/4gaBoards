import rootConfig from '../../eslint.config.mjs';

export default [
  ...rootConfig,
  {
    ignores: ['node_modules', 'dist'],
  },
  {
    files: ['**/*.js'],
    ignores: ['**/index.js'],
    rules: {
      'perfectionist/sort-objects': [
        'warn',
        {
          order: 'asc',
          ignoreCase: false,
          type: 'natural',
          sortBy: 'name',
          partitionByNewLine: true,
        },
      ],
    },
  },
];
