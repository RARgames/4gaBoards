/**
 * Generates or synchronizes openapi/openapi.yaml from server/config/routes.js, server/config/policies.js and the `inputs`/`exits` of every actions controller
 *
 * Modes:
 *   (default)  Generate the initial specification. Refuses to overwrite an existing file.
 *   --force    Completely regenerate the specification.
 *   --sync     Add missing paths and HTTP methods without modifying existing operations.
 *   --update   Update existing operations marked with x-needs-review: true.
 */
import chalk from 'chalk';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

import loadController from './lib/load-controller.mjs';
import { getPolicies, getRoutes, isPublicAction } from './lib/server.mjs';

const outFile = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'openapi', 'openapi.yaml');

const args = process.argv.slice(2);
const modes = ['--force', '--sync', '--update'];
const selectedModes = args.filter((arg) => modes.includes(arg));
const unknownArgs = args.filter((arg) => !modes.includes(arg));

if (unknownArgs.length > 0 || selectedModes.length > 1) {
  console.error(chalk.red('Usage: generate-openapi.mjs [--force | --sync | --update]'));
  process.exit(1);
}

const mode = selectedModes[0] ?? 'generate';
const fileExists = existsSync(outFile);

if (mode === 'generate' && fileExists) {
  console.error(
    chalk.red(
      `${path.relative(process.cwd(), outFile)} already exists and is maintained by hand. Pass --force to overwrite it, --sync to add missing operations, or --update to refresh operations marked for review.`,
    ),
  );
  process.exit(1);
}

if (mode === '--update' && !fileExists) {
  console.error(chalk.red('Cannot update: openapi.yaml does not exist. Run the generator first.'));
  process.exit(1);
}

const RESPONSE_TYPES = {
  badRequest: [400, 'BadRequest'],
  unauthorized: [401, 'Unauthorized'],
  forbidden: [403, 'Forbidden'],
  notFound: [404, 'NotFound'],
  conflict: [409, 'Conflict'],
  unprocessableEntity: [422, 'UnprocessableEntity'],
  tooManyRequests: [429, 'TooManyRequests'],
  serverError: [500, 'ServerError'],
};

const camel = (text) => text.replace(/[-/](\w)/g, (_, char) => char.toUpperCase()).replace(/^\w/, (char) => char.toLowerCase());

const words = (text) => text.replace(/-/g, ' ');

const inputToSchema = (input = {}) => {
  const schema = {};
  const type = { number: 'number', boolean: 'boolean', string: 'string', json: null, ref: null }[input.type];

  if (type) schema.type = type;
  if (input.description) schema.description = input.description;
  if (input.regex instanceof RegExp) schema.pattern = input.regex.source;
  if (Array.isArray(input.isIn) && input.isIn.length > 0) schema.enum = input.isIn;
  if (input.isEmail) schema.format = 'email';
  if (input.isURL) schema.format = 'uri';
  if (input.isNotEmptyString) schema.minLength = 1;
  if (typeof input.maxLength === 'number') schema.maxLength = input.maxLength;
  if (typeof input.min === 'number') schema.minimum = input.min;
  if (typeof input.max === 'number') schema.maximum = input.max;
  if (['string', 'number', 'boolean'].includes(typeof input.defaultsTo)) schema.default = input.defaultsTo;
  if (input.allowNull && schema.type) schema.type = [schema.type, 'null'];

  return schema;
};

const policies = getPolicies();
const paths = {};
const tags = new Set();
const skipped = [];

getRoutes().forEach((route) => {
  const isPublic = route.urlPath.startsWith('/auth/') || (route.isActions2 && isPublicAction(route.action, policies));
  const [resource, ...rest] = route.action.split('/');
  const tag = route.isActions2 ? resource : 'auth';
  tags.add(tag);

  let inputs = {};
  let exits = {};
  let usesFileUpload = false;

  if (route.isActions2) {
    try {
      ({ inputs, exits, usesFileUpload } = loadController(route.file));
    } catch (error) {
      skipped.push(`${route.method.toUpperCase()} ${route.urlPath} (${error.message})`);
    }
  }

  const bodyMethods = ['post', 'patch', 'put'];
  const hasBody = bodyMethods.includes(route.method);

  const parameters = route.pathParams.map((name) => ({
    name,
    in: 'path',
    required: true,
    schema: { type: 'string', ...inputToSchema(inputs[name]) },
  }));

  const otherInputs = Object.entries(inputs).filter(([name]) => !route.pathParams.includes(name));

  if (!hasBody) {
    otherInputs.forEach(([name, input]) => {
      parameters.push({
        name,
        in: 'query',
        required: Boolean(input.required),
        schema: inputToSchema(input),
      });
    });
  }

  const operation = {
    tags: [tag],
    summary: route.isActions2 ? `${words(resource)}: ${words(rest.join(' ') || resource)}` : `OAuth: ${route.action.replace('AuthController.', '')}`,
    operationId: camel(route.action.replace('Controller.', '/')),
    'x-needs-review': true,
  };

  if (parameters.length > 0) operation.parameters = parameters;

  if (hasBody && (otherInputs.length > 0 || usesFileUpload)) {
    const properties = Object.fromEntries(otherInputs.map(([name, input]) => [name, inputToSchema(input)]));

    const required = otherInputs.filter(([, input]) => input.required).map(([name]) => name);
    const schema = { type: 'object', properties };

    if (usesFileUpload) schema.properties.file = { type: 'string', format: 'binary' };
    if (required.length > 0) schema.required = required;

    operation.requestBody = {
      content: {
        [usesFileUpload ? 'multipart/form-data' : 'application/json']: { schema },
      },
    };
  }

  const responses = route.isActions2
    ? { 200: { description: 'Success', content: { 'application/json': { schema: { type: 'object' } } } } }
    : { 302: { description: 'Redirect to the OAuth provider or back to the app' } };

  if (otherInputs.length > 0 || parameters.length > 0) {
    responses[400] = { $ref: '#/components/responses/BadRequest' };
  }

  if (!isPublic) {
    responses[401] = { $ref: '#/components/responses/Unauthorized' };
  }

  Object.values(exits).forEach((exit) => {
    const mapped = RESPONSE_TYPES[exit?.responseType];
    if (mapped) responses[mapped[0]] = { $ref: `#/components/responses/${mapped[1]}` };
  });

  operation.responses = Object.fromEntries(Object.entries(responses).sort(([a], [b]) => Number(a) - Number(b)));

  operation.security = isPublic ? [] : [{ bearerAuth: [] }, { clientId: [], clientSecret: [] }];

  paths[route.openapiPath] = {
    ...paths[route.openapiPath],
    [route.method]: operation,
  };
});

const errorResponse = (description) => ({
  description,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
});

const spec = {
  openapi: '3.1.0',
  info: {
    title: '4ga Boards API',
    version: 'latest',
    description: [
      '4ga Boards API',
      '',
      'Authenticate either with an access token (`Authorization: Bearer <token>`, obtained from `POST /api/access-tokens`)',
      'or with API client credentials (`X-Client-Id` and `X-Client-Secret` headers) generated in Settings/Authentication.',
      '',
      'Successful responses wrap data in `item` / `items` (and sometimes `included`). Operations marked `x-needs-review` were generated from the server source and still need their response schemas filled in.',
    ].join('\n'),
    license: { name: 'MIT', url: 'https://github.com/RARgames/4gaBoards/blob/main/LICENSE' },
  },
  servers: [
    {
      url: '{baseUrl}',
      description: 'Your 4ga Boards instance (set baseUrl to its address, without a trailing slash)',
      variables: { baseUrl: { default: 'https://demo.4gaboards.com' } },
    },
  ],
  tags: [...tags].sort().map((name) => ({ name })),
  paths,
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        description: 'Access token from `POST /api/access-tokens`.',
      },
      clientId: {
        type: 'apiKey',
        in: 'header',
        name: 'X-Client-Id',
        description: 'API client id. Use together with `X-Client-Secret`.',
      },
      clientSecret: {
        type: 'apiKey',
        in: 'header',
        name: 'X-Client-Secret',
        description: 'API client secret. Use together with `X-Client-Id`.',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          code: { type: 'string', examples: ['E_NOT_FOUND'] },
          message: { type: 'string' },
        },
      },
    },
    responses: {
      BadRequest: errorResponse('Invalid or missing input'),
      Unauthorized: errorResponse('Access token or API client credentials are missing or invalid'),
      Forbidden: errorResponse('Not enough rights'),
      NotFound: errorResponse('Resource not found'),
      Conflict: errorResponse('Conflict with the current state'),
      UnprocessableEntity: errorResponse('Request could not be processed'),
      TooManyRequests: errorResponse('Rate limit exceeded'),
      ServerError: errorResponse('Internal server error'),
    },
  },
};

/**
 * Merges generated operations into existing paths
 *
 * sync:   Adds only missing operations
 * update: Replaces only existing operations marked for review
 */
const mergePaths = (existingPaths, generatedPaths, mergeMode) => {
  const result = structuredClone(existingPaths);
  const stats = { added: 0, updated: 0, unchanged: 0 };

  Object.entries(generatedPaths).forEach(([pathName, methods]) => {
    result[pathName] ??= {};

    Object.entries(methods).forEach(([method, operation]) => {
      const existingOperation = result[pathName][method];

      if (!existingOperation) {
        if (mergeMode === '--sync') {
          result[pathName][method] = operation;
          stats.added += 1;
        } else {
          stats.unchanged += 1;
        }

        return;
      }

      if (mergeMode === '--update' && existingOperation['x-needs-review'] === true) {
        result[pathName][method] = operation;
        stats.updated += 1;
        return;
      }

      stats.unchanged += 1;
    });
  });

  return { paths: result, stats };
};

/**
 * Merges generated components with existing components
 * Existing definitions always take precedence
 */
const mergeComponents = (generated = {}, existing = {}) => {
  const result = {
    ...generated,
    ...existing,
  };

  ['schemas', 'responses', 'securitySchemes', 'parameters', 'requestBodies', 'headers'].forEach((section) => {
    result[section] = {
      ...(generated[section] ?? {}),
      ...(existing[section] ?? {}),
    };
  });

  return result;
};

/**
 * Merges tags by name, preserving existing tag definitions
 */
const mergeTags = (generated = [], existing = []) => {
  const result = new Map();

  [...generated, ...existing].forEach((tag) => {
    result.set(tag.name, tag);
  });

  return [...result.values()];
};

mkdirSync(path.dirname(outFile), { recursive: true });

let output = spec;
let stats = null;

if ((mode === '--sync' || mode === '--update') && fileExists) {
  const existing = YAML.parse(readFileSync(outFile, 'utf8'));

  if (!existing || typeof existing !== 'object') {
    console.error(chalk.red('Cannot merge: existing openapi.yaml is invalid.'));
    process.exit(1);
  }

  const merged = mergePaths(existing.paths ?? {}, spec.paths, mode);
  stats = merged.stats;

  output = {
    ...spec,
    ...existing,
    info: { ...existing.info, version: spec.info.version },
    tags: mergeTags(spec.tags, existing.tags),
    paths: merged.paths,
    components: mergeComponents(spec.components, existing.components),
  };
}

writeFileSync(outFile, YAML.stringify(output, { lineWidth: 0 }));

const relativePath = path.relative(process.cwd(), outFile);
const total = Object.values(output.paths).reduce((sum, item) => sum + Object.keys(item).length, 0);

if (stats) {
  console.log(`Updated ${relativePath}: ${stats.added} added, ${stats.updated} updated, ${stats.unchanged} unchanged (${total} total operations).`);
} else {
  console.log(`Wrote ${total} operations to ${relativePath}`);
}

if (skipped.length > 0) {
  console.warn(chalk.yellow(`Could not read inputs for:\n  ${skipped.join('\n  ')}`));
}
