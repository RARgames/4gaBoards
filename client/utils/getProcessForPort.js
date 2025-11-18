/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const chalk = require('chalk').default;
const { execSync } = require('child_process');
const { execFileSync } = require('child_process');
const path = require('path');

const execOptions = {
  encoding: 'utf8',
  stdio: [
    'pipe', // stdin (default)
    'pipe', // stdout (default)
    'ignore', // stderr
  ],
};

function isProcessAReactApp(processCommand) {
  return /^node .*react-scripts\/scripts\/start\.js\s?$/.test(processCommand);
}

function getProcessIdOnPort(port) {
  return execFileSync('lsof', [`-i:${port}`, '-P', '-t', '-sTCP:LISTEN'], execOptions)
    .split('\n')[0]
    .trim();
}

function getPackageNameInDirectory(directory) {
  const packagePath = path.join(directory.trim(), 'package.json');

  try {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    return require(packagePath).name;
  } catch {
    return null;
  }
}

function getProcessCommand(processId, processDirectory) {
  let command = execSync(`ps -o command -p ${processId} | sed -n 2p`, execOptions);

  command = command.replace(/\n$/, '');

  if (isProcessAReactApp(command)) {
    const packageName = getPackageNameInDirectory(processDirectory);
    return packageName || command;
  }
  return command;
}

function getDirectoryOfProcessById(processId) {
  return execSync(`lsof -p ${processId} | awk '$4=="cwd" {for (i=9; i<=NF; i++) printf "%s ", $i}'`, execOptions).trim();
}

function getProcessForPort(port) {
  try {
    const processId = getProcessIdOnPort(port);
    const directory = getDirectoryOfProcessById(processId);
    const command = getProcessCommand(processId, directory);
    return chalk.cyan(command) + chalk.grey(` (pid ${processId})\n`) + chalk.blue('  in ') + chalk.cyan(directory);
  } catch {
    return null;
  }
}

module.exports = getProcessForPort;
