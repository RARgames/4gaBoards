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
  },

  exits: {
    invalidFile: {},
  },

  async fn(inputs) {
    const loadCSV = (filename) =>
      new Promise((resolve, reject) => {
        try {
          const results = [];
          fs.createReadStream(path.join(inputs.loadDir, `${filename}.csv`))
            .pipe(fastcsv.parse({ headers: true }))
            .on('data', (row) => results.push(row))
            .on('end', () => resolve(results))
            .on('error', reject);
        } catch (error) {
          sails.log.error(error);
          throw 'invalidFile';
        }
      });

    const data = Promise.all(inputs.filesToLoad.map((file) => loadCSV(file).then((fileData) => ({ [file]: fileData })))).then((results) => results.reduce((acc, result) => Object.assign(acc, result), {}));

    return data;
  },
};
