const reactHooks = require('eslint-plugin-react-hooks');
const reactPlugin = require('eslint-plugin-react');
const jsxPlugin = require('eslint-plugin-jsx-a11y');
const babelEslintParser = require('@babel/eslint-parser');
const prettierPlugin = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');
const combinedAirbnbConfig = require('../eslint-config-airbnb/combined');
const clientAirbnbConfig = require('../eslint-config-airbnb/client');

module.exports = [
  reactPlugin.configs.flat.recommended,
  jsxPlugin.flatConfigs.recommended,
  ...combinedAirbnbConfig,
  ...clientAirbnbConfig,
  {
    ignores: ['node_modules', 'public', 'build'],
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: babelEslintParser,
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
      prettier: prettierPlugin,
      // 'jsx-a11y': jsxPlugin,
    },
    rules: {
      // ...reactHooks.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      ...prettierPlugin.configs.recommended.rules,
      ...prettierConfig.rules,
      'prettier/prettier': 'error',
      'no-unused-vars': 'warn',
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
  },
];
