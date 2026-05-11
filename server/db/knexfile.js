const dotenv = require('dotenv');
const _ = require('lodash');
const path = require('path');

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
  quiet: true,
});

module.exports = {
  client: 'pg',
  connection: process.env.DATABASE_URL,
  migrations: {
    tableName: 'migration',
    directory: path.join(__dirname, 'migrations'),
  },
  seeds: {
    directory: path.join(__dirname, 'seeds'),
  },
  wrapIdentifier: (value, origImpl) => origImpl(_.snakeCase(value)),
};
