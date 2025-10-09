const fs = require('fs');
const tar = require('tar');
const path = require('path');

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
