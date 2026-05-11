const fs = require('fs');
const path = require('path');
const tar = require('tar');

const ensureSafeArchiveEntry = (entry) => {
  const normalizedPath = path.posix.normalize(entry.path || '');
  const parts = normalizedPath.split('/').filter(Boolean);

  if (!normalizedPath || normalizedPath === '.' || path.posix.isAbsolute(normalizedPath) || parts.includes('..') || entry.type === 'SymbolicLink' || entry.type === 'Link') {
    throw 'invalidFile';
  }
};

const validateArchive = async (filePath) => {
  await tar.t({
    file: filePath,
    onentry: ensureSafeArchiveEntry,
  });
};

module.exports = {
  inputs: {
    file: {
      type: 'json',
      required: true,
    },
  },

  exits: {
    invalidFile: {},
  },

  async fn(inputs) {
    const importfileDir = path.dirname(inputs.file.fd);
    const importFileName = path.basename(inputs.file.fd);
    const importTempDir = path.join(importfileDir, `temp-${importFileName}`);
    try {
      fs.mkdirSync(importTempDir, { recursive: true });
      await validateArchive(inputs.file.fd);

      await tar.extract({
        file: inputs.file.fd,
        cwd: importTempDir,
      });
    } catch (error) {
      sails.log.error(error);
      fs.rmSync(importTempDir, { recursive: true, force: true });
      fs.rmSync(inputs.file.fd, { force: true });
      throw 'invalidFile';
    }

    return { importTempDir };
  },
};
