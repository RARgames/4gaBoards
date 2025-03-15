const prettierPlugin = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier/flat');

module.exports = [
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...prettierPlugin.configs.recommended.rules,
      ...prettierConfig.rules,
      'prettier/prettier': 'error',
      //region custom - for eslint config files
      'no-dupe-keys': 'error',
      //endregion
    },
  },
];
