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

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class DebuggerProcessInfo {

  constructor(serviceName, targetUri) {
    this._serviceName = serviceName;
    this._targetUri = targetUri;
  }

  getServiceName() {
    return this._serviceName;
  }

  getTargetUri() {
    return this._targetUri;
  }

  // Whether or not this ProcessInfo supports threading or not.
  // TODO: move this into chrome protocol after we move threads window
  // to Nuclide UI.
  supportThreads() {
    return false;
  }

  supportSingleThreadStepping() {
    return false;
  }

  singleThreadSteppingEnabled() {
    return false;
  }

  customControlButtons() {
    return [];
  }

  debug() {
    return (0, _asyncToGenerator.default)(function* () {
      throw new Error('abstract method');
    })();
  }
}
exports.default = DebuggerProcessInfo;
module.exports = exports['default'];