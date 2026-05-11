/* eslint-disable import-x/no-relative-packages, import-x/extensions, no-underscore-dangle */
import path from 'path';

import baseConfig from '../eslint-configs/base.mjs';
import rootConfig from '../eslint.config.mjs';

const __dirname = import.meta.dirname;

export default [
  {
    ignores: ['node_modules', 'public', 'private', 'views/**/*.ejs'],
  },
  ...baseConfig({
    packageDir: [__dirname, path.resolve(__dirname, '..')],
  }),
  ...rootConfig,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'no-throw-literal': 'off', // TODO fix issues and remove
      'no-undef': 'off',
    },
  },
];
