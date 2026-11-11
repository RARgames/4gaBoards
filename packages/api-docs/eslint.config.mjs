/* eslint-disable import-x/no-relative-packages, import-x/extensions, no-underscore-dangle */
import path from 'path';

import baseConfig from '../../eslint-configs/base.mjs';
import rootConfig from '../../eslint.config.mjs';

const __dirname = import.meta.dirname;

export default [
  {
    ignores: ['node_modules'],
  },
  ...baseConfig({
    packageDir: [__dirname, path.resolve(__dirname, '..')],
  }),
  ...rootConfig,
  {
    // Node CLI scripts: console output and dynamic requires of the server config are intended
    files: ['scripts/**/*.mjs'],
    rules: {
      'no-console': 'off',
      'no-undef': 'off',
      'import-x/extensions': 'off',
      'import-x/no-dynamic-require': 'off',
      'import-x/no-extraneous-dependencies': ['error', { devDependencies: true }],
    },
  },
];
