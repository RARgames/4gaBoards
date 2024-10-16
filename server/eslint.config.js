const prettierPlugin = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');
const combinedAirbnbConfig = require('../eslint-config-airbnb/combined');

module.exports = [
  ...combinedAirbnbConfig,
  {
    ignores: ['node_modules', 'public', 'private', 'views/**/*.ejs'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...prettierPlugin.configs.recommended.rules,
      ...prettierConfig.rules,
      'prettier/prettier': 'error',
      'no-throw-literal': 'off', // TODO fix issues and remove
      'no-undef': 'off',
    },
  },
];
