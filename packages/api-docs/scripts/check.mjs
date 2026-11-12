/**
 * Validates openapi/openapi.yaml and checks that it is in sync with server/config/routes.js:
 * every route must be documented and every documented operation must still exist
 * Exits non-zero on problems, so it can run in CI.
 */
import SwaggerParser from '@apidevtools/swagger-parser';
import chalk from 'chalk';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getRoutes } from './lib/server.mjs';

const specFile = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'openapi', 'openapi.yaml');
const methods = ['get', 'post', 'put', 'patch', 'delete'];

const spec = await SwaggerParser.validate(specFile);

if (spec.info.version !== 'beta-latest') {
  console.error(chalk.red('The working openapi.yaml must have info.version set to beta-latest.'));
  process.exit(1);
}

const documented = new Set(Object.entries(spec.paths).flatMap(([urlPath, item]) => methods.filter((method) => item[method]).map((method) => `${method.toUpperCase()} ${urlPath}`)));
const actual = new Set(getRoutes().map((route) => `${route.method.toUpperCase()} ${route.openapiPath}`));

const missing = [...actual].filter((key) => !documented.has(key));
const stale = [...documented].filter((key) => !actual.has(key));
const needsReview = Object.values(spec.paths).flatMap((item) => methods.filter((method) => item[method]?.['x-needs-review'])).length;

if (needsReview > 0) console.warn(chalk.yellow(`${needsReview} operation(s) still marked x-needs-review`));
if (missing.length > 0) console.error(chalk.red(`Routes missing from the spec:\n  ${missing.join('\n  ')}`));
if (stale.length > 0) console.error(chalk.red(`Operations in the spec without a route:\n  ${stale.join('\n  ')}`));
if (missing.length > 0 || stale.length > 0) process.exit(1);

console.log(`openapi.yaml is valid and covers all ${actual.size} routes`);
