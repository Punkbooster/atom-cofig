'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getHackExecOptions = exports.HACK_FILE_EXTENSIONS = exports.logger = exports.HACK_LOGGER_CATEGORY = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

// Returns the empty string on failure
let findHackCommand = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* () {
    try {
      return (yield (0, (_process || _load_process()).runCommand)('which', [PATH_TO_HH_CLIENT]).toPromise()).trim();
    } catch (err) {
      return '';
    }
  });

  return function findHackCommand() {
    return _ref.apply(this, arguments);
  };
})();

let getHackExecOptions = exports.getHackExecOptions = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (localFile) {
    const [currentHackCommand, hackRoot] = yield Promise.all([hackCommand, findHackConfigDir(localFile)]);
    if (hackRoot && currentHackCommand) {
      return { hackRoot, hackCommand: currentHackCommand };
    } else {
      return null;
    }
  });

  return function getHackExecOptions(_x) {
    return _ref2.apply(this, arguments);
  };
})();

exports.findHackConfigDir = findHackConfigDir;
exports.setHackCommand = setHackCommand;
exports.getHackCommand = getHackCommand;

var _ConfigCache;

function _load_ConfigCache() {
  return _ConfigCache = require('nuclide-commons/ConfigCache');
}

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const HACK_LOGGER_CATEGORY = exports.HACK_LOGGER_CATEGORY = 'nuclide-hack'; /**
                                                                             * Copyright (c) 2015-present, Facebook, Inc.
                                                                             * All rights reserved.
                                                                             *
                                                                             * This source code is licensed under the license found in the LICENSE file in
                                                                             * the root directory of this source tree.
                                                                             *
                                                                             * 
                                                                             * @format
                                                                             */

const logger = exports.logger = (0, (_log4js || _load_log4js()).getLogger)(HACK_LOGGER_CATEGORY);

const HACK_CONFIG_FILE_NAME = '.hhconfig';
const PATH_TO_HH_CLIENT = 'hh_client';

// From hack/src/utils/findUtils.ml
const HACK_FILE_EXTENSIONS = exports.HACK_FILE_EXTENSIONS = ['.php', // normal php file
'.hh', // Hack extension some open source code is starting to use
'.phpt', // our php template files
'.hhi', // interface files only visible to the type checker
'.xhp'];

// Kick this off early, so we don't need to repeat this on every call.
// We don't have a way of changing the path on the dev server after a
// connection is made so this shouldn't change over time.
// Worst case scenario is requiring restarting Nuclide after changing the hh_client path.
const DEFAULT_HACK_COMMAND = findHackCommand();
let hackCommand = DEFAULT_HACK_COMMAND;

const configCache = new (_ConfigCache || _load_ConfigCache()).ConfigCache([HACK_CONFIG_FILE_NAME]);

/**
* If this returns null, then it is not safe to run hack.
*/
function findHackConfigDir(localFile) {
  return configCache.getConfigDir(localFile);
}function setHackCommand(newHackCommand) {
  if (newHackCommand === '') {
    hackCommand = DEFAULT_HACK_COMMAND;
  } else {
    logger.debug(`Using custom hh_client: ${newHackCommand}`);
    hackCommand = Promise.resolve(newHackCommand);
  }
}

function getHackCommand() {
  return hackCommand;
}