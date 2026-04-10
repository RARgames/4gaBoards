/* eslint-disable import-x/no-relative-packages, import-x/extensions, no-underscore-dangle */
import path from 'path';

import baseConfig from '../../eslint-configs/base.mjs';
import rootConfig from '../../eslint.config.mjs';

const __dirname = import.meta.dirname;

export default [
  {
    ignores: ['node_modules', 'dist'],
  },
  ...baseConfig({
    packageDir: [__dirname, path.resolve(__dirname, '..')],
  }),
  ...rootConfig,
  {
    files: ['src/*/**/*.js'],
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
