import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const createSnapshot = (openapiDir, version) => {
  if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)) {
    throw new Error('Expected a stable version in the form major.minor.patch.');
  }

  const document = YAML.parseDocument(readFileSync(path.join(openapiDir, 'openapi.yaml'), 'utf8'));
  if (document.errors.length > 0) throw document.errors[0];
  if (document.getIn(['info', 'version']) !== 'latest') {
    throw new Error('The working OpenAPI specification must have info.version set to latest.');
  }

  document.setIn(['info', 'version'], version);
  const directory = path.join(openapiDir, version);
  mkdirSync(directory, { recursive: true });
  const output = path.join(directory, 'openapi.yaml');
  writeFileSync(output, document.toString({ lineWidth: 0 }), { flag: 'wx' });
  return output;
};

export default createSnapshot;
