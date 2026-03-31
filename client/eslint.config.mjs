/* eslint-disable import-x/no-relative-packages, import-x/extensions, no-underscore-dangle */
import path from 'path';

import baseConfig from '../eslint-configs/base.mjs';
import clientConfig from '../eslint-configs/client.mjs';
import { clientPlugins, clientParser } from '../eslint-configs/plugins.mjs';
import rootConfig from '../eslint.config.mjs';

const __dirname = import.meta.dirname;

export default [
  {
    ignores: ['node_modules', 'public', 'build'],
  },
  ...baseConfig({
    packageDir: [__dirname, path.resolve(__dirname, '..')],
  }),
  ...clientConfig,
  ...rootConfig,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: clientParser,
      parserOptions: {
        babelOptions: {
          presets: ['@babel/preset-react', ['babel-preset-react-app', false]],
        },
        ecmaFeatures: {
          jsx: true,
          generators: false,
          objectLiteralDuplicateProperties: false,
        },
        requireConfigFile: false,
      },
      // Using only limited globals to avoid long import-x/no-cycle times - should be using full sets
      globals: {
        // From ...globals.node, ...globals.es6, _: true, sails: true
        require: false,
        module: false,
        process: false,
        Buffer: false,
        __filename: false,
        console: false,
        FormData: false,
        setTimeout: false,
        clearTimeout: false,
        File: false,
        URLSearchParams: false,
        fetch: false,
        setInterval: false,
        clearInterval: false,
        // From ...globals.browser
        window: false,
        document: false,
        getComputedStyle: false,
        localStorage: false,
        IntersectionObserver: false,
        URL: false,
        navigator: false,
        requestAnimationFrame: false,
        cancelAnimationFrame: false,
        // From ...globals.jest
        describe: false,
        test: false,
        expect: false,
      },
    },
    plugins: clientPlugins,
    rules: {
      'jsx-a11y/anchor-ambiguous-text': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'no-unused-vars': 'warn',
      'react/jsx-key': [
        'error',
        {
          checkFragmentShorthand: true,
          warnOnDuplicates: true,
        },
      ],
    },
  },
];
