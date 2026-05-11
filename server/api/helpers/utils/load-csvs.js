const fastcsv = require('fast-csv');
const fs = require('fs');
const path = require('path');

module.exports = {
  inputs: {
    loadDir: {
      type: 'string',
      required: true,
    },
    filesToLoad: {
      type: 'ref',
      required: true,
    },
    optionalFiles: {
      type: 'ref',
      defaultsTo: [],
    },
  },

  exits: {
    invalidFile: {},
  },

  async fn(inputs) {
    const optional = new Set(inputs.optionalFiles);

    const loadCSV = (filename) =>
      new Promise((resolve, reject) => {
        const results = [];

        const filePath = path.join(inputs.loadDir, `${filename}.csv`);
        if (!fs.existsSync(filePath)) {
          if (optional.has(filename)) {
            resolve([]);
          }
        }
        fs.createReadStream(filePath)
          .on('error', reject)
          .pipe(fastcsv.parse({ headers: true }))
          .on('data', (row) => results.push(row))
          .on('end', () => resolve(results));
      });

    try {
      const data = await Promise.all(inputs.filesToLoad.map((file) => loadCSV(file).then((fileData) => ({ [file]: fileData }))));

      return data.reduce((acc, result) => Object.assign(acc, result), {});
    } catch (err) {
      sails.log.error(err);
      throw 'invalidFile';
    }
  },
};
