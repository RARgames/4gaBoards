import path from 'node:path';
import { fileURLToPath } from 'node:url';

import createSnapshot from './lib/snapshot.mjs';

const version = process.argv[2];
if (!version || process.argv.length !== 3) {
  throw new Error('Usage: snapshot.mjs <major.minor.patch>');
}

const openapiDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'openapi');
const output = createSnapshot(openapiDir, version);
console.log(`Created ${path.relative(process.cwd(), output)}`);
