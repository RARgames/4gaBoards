// eslint-disable-next-line import-x/no-extraneous-dependencies
const babelJest = require('babel-jest').default;

module.exports = babelJest.createTransformer({
  targets: { node: 'current' },
  presets: [[require.resolve('@babel/preset-env')], [require.resolve('@babel/preset-react'), { runtime: 'automatic' }]],
  babelrc: false,
  configFile: false,
});
