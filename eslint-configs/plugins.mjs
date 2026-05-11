import babelEslintParser from '@babel/eslint-parser';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import perfectionistPlugin from 'eslint-plugin-perfectionist';
import prettierPlugin from 'eslint-plugin-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export const rootPlugins = {
  perfectionist: perfectionistPlugin,
  prettier: prettierPlugin,
};

export const rootPrettierRules = {
  ...prettierPlugin.configs.recommended.rules,
  ...eslintConfigPrettier.rules,
};

export const clientPlugins = {
  'jsx-a11y': jsxA11yPlugin,
  react: reactPlugin,
  'react-hooks': reactHooksPlugin,
};

export const clientParser = babelEslintParser;
