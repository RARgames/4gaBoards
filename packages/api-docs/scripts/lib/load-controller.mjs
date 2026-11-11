/**
 * Loads Sails actions controller file just to read its `inputs`/`exits`.
 *
 * Controllers reference Sails globals (models, `sails`, etc.) and project modules at the top level, which would fail outside a running app. The file is evaluated with stubbed globals and requires, so only the static `inputs` and `exits` definitions are meaningful in the result.
 */
import { readFileSync } from 'node:fs';

const createStub = () => {
  const target = function stub() {};
  const proxy = new Proxy(target, {
    get: (_, key) => (typeof key === 'symbol' ? undefined : proxy),
    apply: () => proxy,
    construct: () => proxy,
  });

  return proxy;
};

export default (file) => {
  const source = readFileSync(file, 'utf8');
  const stub = createStub();
  const module = { exports: {} };

  const scope = new Proxy(
    {},
    {
      has: (_, key) => typeof key === 'string' && !['module', 'exports', 'require'].includes(key) && !(key in globalThis),
      get: (_, key) => (key === Symbol.unscopables ? undefined : stub),
    },
  );

  // eslint-disable-next-line no-new-func
  const run = new Function('__scope', 'module', 'exports', 'require', `with (__scope) {\n${source}\n}`);
  run(scope, module, module.exports, () => stub);

  return {
    inputs: module.exports.inputs || {},
    exits: module.exports.exits || {},
    usesFileUpload: /\.file\(\s*['"]/.test(source),
  };
};
