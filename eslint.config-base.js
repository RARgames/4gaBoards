const importPlugin = require('eslint-plugin-import');
const js = require('@eslint/js');

module.exports = [js.configs.recommended, importPlugin.flatConfigs.recommended];
