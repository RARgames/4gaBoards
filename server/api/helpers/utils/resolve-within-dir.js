const path = require('path');

module.exports = {
  sync: true,

  inputs: {
    baseDir: {
      type: 'string',
      required: true,
    },
    parts: {
      type: 'json',
      required: true,
    },
  },

  exits: {
    invalidFile: {},
  },

  fn(inputs) {
    const baseDir = path.resolve(inputs.baseDir);
    const resolvedPath = path.resolve(baseDir, ...inputs.parts.filter((v) => typeof v === 'string' && v));
    const relativePath = path.relative(baseDir, resolvedPath);

    if (relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath))) {
      return resolvedPath;
    }

    throw 'invalidFile';
  },
};
