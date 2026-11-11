/**
 * Helpers for reading the Sails server's routing configuration without booting it
 */
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
export const serverDir = path.join(repoRoot, 'server');

export const getPolicies = () => require(path.join(serverDir, 'config', 'policies.js')).policies;

/**
 * Returns the documentable HTTP routes from server/config/routes.js
 * The SPA catch-all, well-known files and view routes are left out
 */
export const getRoutes = () => {
  const { routes } = require(path.join(serverDir, 'config', 'routes.js'));

  return Object.entries(routes).flatMap(([key, target]) => {
    const [method, urlPath] = key.split(/\s+/);
    const action = typeof target === 'string' ? target : target.action;

    if (!action || urlPath.includes('*') || urlPath.startsWith('/.well-known')) {
      return [];
    }

    return [
      {
        method: method.toLowerCase(),
        action,
        urlPath,
        openapiPath: urlPath.replace(/:(\w+)/g, '{$1}'),
        pathParams: [...urlPath.matchAll(/:(\w+)/g)].map((match) => match[1]),
        isActions2: !action.includes('Controller.'),
        file: path.join(serverDir, 'api', 'controllers', `${action}.js`),
      },
    ];
  });
};

/**
 * Policy lookup for an action: explicit entry wins, then "dir/*", then the default "*"
 * Returns true when the action is publicly accessible
 */
export const isPublicAction = (action, policies) => {
  const dir = action.split('/')[0];
  const policy = policies[action] ?? policies[`${dir}/*`] ?? policies['*'];

  return policy === true;
};
