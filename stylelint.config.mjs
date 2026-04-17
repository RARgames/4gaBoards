/** @type {import("stylelint").Config} */
export default {
  extends: ['stylelint-config-recommended-scss'],
  ignoreFiles: ['**/client/build/**', '**/server/public/**'],
  overrides: [
    {
      files: ['**/*.{css,scss}'],
      customSyntax: 'postcss-scss',
      rules: {
        'font-family-no-duplicate-names': null,
        'font-family-no-missing-generic-family-keyword': null,
        'no-empty-source': null,
        'property-no-deprecated': null,
        'scss/at-extend-no-missing-placeholder': null,
        'selector-class-pattern': null,
        // 'declaration-no-important': true,
        'selector-pseudo-class-no-unknown': [
          true,
          {
            ignorePseudoClasses: ['global', 'local'],
          },
        ],
      },
    },
  ],
};
