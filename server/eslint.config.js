const baseConfig = require('../eslint.config-base');
const airbnbConfig = require('../eslint-config-airbnb/index');
const mainConfig = require('../eslint.config');

module.exports = [
  ...baseConfig,
  ...airbnbConfig,
  ...mainConfig,
  {
    ignores: ['node_modules', 'public', 'private', 'views/**/*.ejs'],
  },
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
