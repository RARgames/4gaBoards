const reactHooks = require('eslint-plugin-react-hooks');
const reactPlugin = require('eslint-plugin-react');
const jsxPlugin = require('eslint-plugin-jsx-a11y');
const babelEslintParser = require('@babel/eslint-parser');
const baseConfig = require('../eslint.config-base');
const airbnbConfig = require('../eslint-config-airbnb/index');
const clientAirbnbConfig = require('../eslint-config-airbnb/client');
const mainConfig = require('../eslint.config');

module.exports = [
  ...baseConfig,
  reactPlugin.configs.flat.recommended,
  jsxPlugin.flatConfigs.recommended,
  ...airbnbConfig,
  ...clientAirbnbConfig,
  ...mainConfig,
  {
    ignores: ['node_modules', 'public', 'build'],
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      parser: babelEslintParser,
      parserOptions: {
        babelOptions: {
          presets: ['@babel/preset-react', ['babel-preset-react-app', false]],
        },
        ecmaFeatures: {
          jsx: true,
          // TODO add version 2018
          ecmaVersion: 2018,
          sourceType: 'module',
        },
        requireConfigFile: false,
      },
      // Using only limited globals to avoid long import/no-cycle times - should be using full sets
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
        // From ...globals.jest
        describe: false,
        test: false,
        expect: false,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      react: reactPlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'no-unused-vars': 'warn',
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: ['src/setupTests.js', '**/*.test.js', '**/eslint.config.js'],
        },
      ],
      // Validate JSX has key prop when in array or iterator
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-key.md
      'react/jsx-key': [
        'error',
        {
          checkFragmentShorthand: true,
          warnOnDuplicates: true,
        },
      ],
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
  },
];
