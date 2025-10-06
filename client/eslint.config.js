const babelEslintParser = require('@babel/eslint-parser');
const prettierConfig = require('eslint-config-prettier/flat');
const jsxPlugin = require('eslint-plugin-jsx-a11y');
const perfectionistPlugin = require('eslint-plugin-perfectionist');
const prettierPlugin = require('eslint-plugin-prettier');
const reactPlugin = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');

const baseConfig = require('../eslint-configs/base');
const clientConfig = require('../eslint-configs/client');

module.exports = [
  ...baseConfig,
  ...clientConfig,
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
    plugins: {
      'react-hooks': reactHooks,
      react: reactPlugin,
      prettier: prettierPlugin,
      'jsx-a11y': jsxPlugin,
      perfectionist: perfectionistPlugin,
    },
    rules: {
      // region react reactPlugin.configs.flat.recommended
      // endregion
      // region jsx-a11y jsxPlugin.flatConfigs.recommended
      'jsx-a11y/anchor-ambiguous-text': 'off',
      // endregion
      // region react-hooks reactHooks.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      // endregion
      // region prettier
      ...prettierPlugin.configs.recommended.rules,
      ...prettierConfig.rules,
      'prettier/prettier': 'error',
      // endregion
      // region custom
      'no-unused-vars': 'warn',
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-key.md
      'react/jsx-key': [
        'error',
        {
          checkFragmentShorthand: true,
          warnOnDuplicates: true,
        },
      ],
      'perfectionist/sort-imports': [
        'warn',
        {
          newlinesBetween: 'always',
          groups: ['react', { newlinesBetween: 'never' }, ['builtin', 'external', 'internal'], ['parent', 'sibling', 'index'], 'unknown', 'css', { newlinesBetween: 'never' }, 'moduleCss'],
          customGroups: {
            value: {
              react: ['^react$', '^react-.+'],
              css: ['^.*(?<!\\.module)\\.(css|scss)$'],
              moduleCss: ['^.*\\.module\\.scss$'],
            },
          },
          type: 'natural',
          order: 'asc',
          ignoreCase: true,
          partitionByNewLine: false,
          specialCharacters: 'keep',
        },
      ],
      // endregion
    },
  },
];
