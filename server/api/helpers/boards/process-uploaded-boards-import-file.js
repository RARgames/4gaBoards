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
      console.error(error); // eslint-disable-line no-console
      throw 'invalidFile';
    }

    return { importTempDir };
  },
};
