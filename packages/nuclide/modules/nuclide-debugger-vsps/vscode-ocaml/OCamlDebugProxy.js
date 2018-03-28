'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OCamlDebugProxy = exports.PROMPT = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _child_process = _interopRequireDefault(require('child_process'));

var _vscodeDebugadapter;

function _load_vscodeDebugadapter() {
  return _vscodeDebugadapter = require('vscode-debugadapter');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

const PROMPT = exports.PROMPT = '(ocd) ';

function stripPrompt(s) {
  return s.substr(0, s.length - PROMPT.length);
}

class OCamlDebugProxy {

  constructor(command, debuggerArguments, programFinishedCallback) {
    this._programFinishedCallback = programFinishedCallback;

    (_vscodeDebugadapter || _load_vscodeDebugadapter()).logger.verbose(`Running "${command} ${debuggerArguments.join(' ')}"`);
    this._debuggerProcess = _child_process.default.spawn(command, debuggerArguments);

    this._debuggerProcess.stdout.on('data', data => {
      (_vscodeDebugadapter || _load_vscodeDebugadapter()).logger.verbose(`STDOUT:${data.toString()}`);
    });

    this._debuggerProcess.stderr.on('data', data => {
      const dataString = data.toString();
      (_vscodeDebugadapter || _load_vscodeDebugadapter()).logger.verbose(`STDERR:${dataString}`);
      if (/^Program not found\.$/m.test(dataString)) {
        (_vscodeDebugadapter || _load_vscodeDebugadapter()).logger.error(dataString);
        this._programFinishedCallback({
          kind: 'error',
          message: `Invalid executable path ${command}`
        });
      }
    });
  }

  attachOnPromptListener(onBreak) {
    let buffer = '';
    const onData = data => {
      buffer += data;
      if (buffer.endsWith(PROMPT)) {
        this._debuggerProcess.stdout.removeListener('data', onData);
        onBreak(stripPrompt(buffer));
      }
    };
    this._debuggerProcess.stdout.on('data', onData);
    return () => {
      this._debuggerProcess.stdout.removeListener('data', onData);
    };
  }

  kill() {
    this._debuggerProcess.kill();
  }

  pause() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this._debuggerProcess.kill('SIGINT');
      yield _this.waitForPrompt();
    })();
  }

  resume() {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this2.send('run');
    })();
  }

  send(command) {
    (_vscodeDebugadapter || _load_vscodeDebugadapter()).logger.verbose(`STDIN:${command}`);
    this._debuggerProcess.stdin.write(`${command}\n`);
    return this.waitForPrompt();
  }

  waitForPrompt() {
    return new Promise((resolve, reject) => {
      const dispose = this.attachOnPromptListener(data => {
        if (data.match(/Time: \d+\nProgram exit.\n?$/)) {
          this._programFinishedCallback({ kind: 'finished' });
        }

        dispose();
        resolve(data);
      });
    });
  }
}
exports.OCamlDebugProxy = OCamlDebugProxy;