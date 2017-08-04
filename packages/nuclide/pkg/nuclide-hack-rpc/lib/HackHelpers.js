'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HACK_WORD_REGEX = exports.callHHClient = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/**
 * Executes hh_client with proper arguments returning the result string or json object.
 */
let callHHClient = exports.callHHClient = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (args, errorStream, processInput, filePath) {

    if (!hhPromiseQueue) {
      hhPromiseQueue = new (_promiseExecutors || _load_promiseExecutors()).PromiseQueue();
    }

    const hackExecOptions = yield (0, (_hackConfig || _load_hackConfig()).getHackExecOptions)(filePath);
    if (!hackExecOptions) {
      return null;
    }
    const { hackRoot, hackCommand } = hackExecOptions;

    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackOperationTiming)(trackingIdOfHackArgs(args) + ':plus-queue', function () {
      if (!hhPromiseQueue) {
        throw new Error('Invariant violation: "hhPromiseQueue"');
      }

      return hhPromiseQueue.submit((0, _asyncToGenerator.default)(function* () {
        // Append args on the end of our commands.
        const defaults = ['--json', '--retries', '0', '--retry-if-init', 'false', '--from', 'nuclide'];

        const allArgs = defaults.concat(args);
        allArgs.push(hackRoot);

        let execResult = null;

        (_hackConfig || _load_hackConfig()).logger.logTrace(`Calling Hack: ${ hackCommand } with ${ allArgs.toString() }`);
        execResult = yield (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackOperationTiming)(trackingIdOfHackArgs(args), function () {
          return (0, (_process || _load_process()).asyncExecute)(hackCommand, allArgs, { stdin: processInput });
        });

        const { stdout, stderr } = execResult;
        if (stderr.indexOf(HH_SERVER_INIT_MESSAGE) !== -1) {
          throw new Error(`${ HH_SERVER_INIT_MESSAGE }: try: \`arc build\` or try again later!`);
        } else if (stderr.startsWith(HH_SERVER_BUSY_MESSAGE)) {
          throw new Error(`${ HH_SERVER_BUSY_MESSAGE }: try: \`arc build\` or try again later!`);
        }

        const output = errorStream ? stderr : stdout;
        (_hackConfig || _load_hackConfig()).logger.logTrace(`Hack output for ${ allArgs.toString() }: ${ output }`);
        try {
          const result = JSON.parse(output);

          if (!(result.hackRoot === undefined)) {
            throw new Error('Invariant violation: "result.hackRoot === undefined"');
          }
          // result may be an array, so don't return a new object.


          result.hackRoot = hackRoot;
          return result;
        } catch (err) {
          const errorMessage = `hh_client error, args: [${ args.join(',') }]
stdout: ${ stdout }, stderr: ${ stderr }`;
          (_hackConfig || _load_hackConfig()).logger.logError(errorMessage);
          throw new Error(errorMessage);
        }
      }));
    });
  });

  return function callHHClient(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
})();

exports.hackRangeToAtomRange = hackRangeToAtomRange;
exports.atomPointOfHackRangeStart = atomPointOfHackRangeStart;

var _process;

function _load_process() {
  return _process = require('../../commons-node/process');
}

var _promiseExecutors;

function _load_promiseExecutors() {
  return _promiseExecutors = require('../../commons-node/promise-executors');
}

var _hackConfig;

function _load_hackConfig() {
  return _hackConfig = require('./hack-config');
}

var _simpleTextBuffer;

function _load_simpleTextBuffer() {
  return _simpleTextBuffer = require('simple-text-buffer');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const HH_SERVER_INIT_MESSAGE = 'hh_server still initializing';
const HH_SERVER_BUSY_MESSAGE = 'hh_server is busy';


let hhPromiseQueue = null;function hackRangeToAtomRange(position) {
  return new (_simpleTextBuffer || _load_simpleTextBuffer()).Range(atomPointOfHackRangeStart(position), new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(position.line - 1, position.char_end));
}

function atomPointOfHackRangeStart(position) {
  return new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(position.line - 1, position.char_start - 1);
}

const HACK_WORD_REGEX = exports.HACK_WORD_REGEX = /[a-zA-Z0-9_$]+/g;

function trackingIdOfHackArgs(args) {
  const command = args.length === 0 ? '--diagnostics' : args[0];

  if (!command.startsWith('--')) {
    throw new Error('Invariant violation: "command.startsWith(\'--\')"');
  }

  return 'hh_client:' + command.substr(2);
}