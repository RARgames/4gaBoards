/** @type {import("stylelint").Config} */
export default {
  extends: ['stylelint-config-recommended-scss'],
  ignoreFiles: ['**/client/build/**', '**/server/public/**'],
  overrides: [
    {
      files: ['**/*.{css,scss}'],
      customSyntax: 'postcss-scss',
      rules: {
        'selector-pseudo-class-no-unknown': [
          true,
          {
            ignorePseudoClasses: ['global'],
          },
        ],
      },
    },
  ],
};
