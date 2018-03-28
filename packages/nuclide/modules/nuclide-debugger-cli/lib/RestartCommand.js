'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _DebuggerInterface;

function _load_DebuggerInterface() {
  return _DebuggerInterface = require('./DebuggerInterface');
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

class RestartCommand {

  constructor(debug) {
    this.name = 'restart';
    this.helpText = 'Restart the current target.';

    this._debugger = debug;
  }

  execute() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      return _this._debugger.relaunch();
    })();
  }
}
exports.default = RestartCommand;