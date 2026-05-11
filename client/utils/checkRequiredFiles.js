/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const chalk = require('chalk').default;
const fs = require('fs');
const path = require('path');

function checkRequiredFiles(files) {
  let currentFilePath;
  try {
    files.forEach((filePath) => {
      currentFilePath = filePath;
      fs.accessSync(filePath, fs.constants.F_OK);
    });
    return true;
  } catch {
    const dirName = path.dirname(currentFilePath);
    const fileName = path.basename(currentFilePath);
    /* eslint-disable no-console */
    console.log(chalk.red('Could not find a required file.'));
    console.log(chalk.red('  Name: ') + chalk.cyan(fileName));
    console.log(chalk.red('  Searched in: ') + chalk.cyan(dirName));
    /* eslint-enable no-console */
    return false;
  }
}

module.exports = checkRequiredFiles;
