const airbnbBestPracticesConfig = require('./best-practices');
const airbnbErrorsConfig = require('./errors');
const airbnbES6Config = require('./es6');
const airbnbImportsConfig = require('./imports');
const airbnbNodeConfig = require('./node');
const airbnbStrictConfig = require('./strict');
const airbnbStyleConfig = require('./style');
const airbnbVariablesConfig = require('./variables');

module.exports = [
  ...airbnbBestPracticesConfig,
  ...airbnbErrorsConfig,
  ...airbnbES6Config,
  ...airbnbImportsConfig,
  ...airbnbNodeConfig,
  ...airbnbStrictConfig,
  ...airbnbStyleConfig,
  ...airbnbVariablesConfig,
];
// TODO customize airbnb configs
