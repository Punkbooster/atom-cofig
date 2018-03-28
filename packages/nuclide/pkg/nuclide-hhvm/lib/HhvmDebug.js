'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.debug = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

// eslint-disable-next-line rulesdir/no-cross-atom-imports
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

let debug = exports.debug = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (debugMode, activeProjectRoot, target, useTerminal, scriptArguments) {
    let processInfo = null;

    if (!(activeProjectRoot != null)) {
      throw new Error('Active project is null');
    }

    // See if this is a custom debug mode type.


    try {
      // $FlowFB
      const helper = require('./fb-hhvm');
      processInfo = helper.getCustomLaunchInfo(debugMode, activeProjectRoot, target, scriptArguments);
    } catch (e) {}

    if (processInfo == null) {
      if (debugMode === 'script') {
        processInfo = new (_LaunchProcessInfo || _load_LaunchProcessInfo()).LaunchProcessInfo(activeProjectRoot, target, null, useTerminal, scriptArguments);
      } else {
        processInfo = new (_AttachProcessInfo || _load_AttachProcessInfo()).AttachProcessInfo(activeProjectRoot);
      }
    }

    // Use commands here to trigger package activation.
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
    const debuggerService = yield (0, (_debugger || _load_debugger()).getDebuggerService)();
    yield debuggerService.startDebugging(processInfo);
  });

  return function debug(_x, _x2, _x3, _x4, _x5) {
    return _ref.apply(this, arguments);
  };
})();
// eslint-disable-next-line rulesdir/no-cross-atom-imports


var _debugger;

function _load_debugger() {
  return _debugger = require('../../commons-atom/debugger');
}

var _LaunchProcessInfo;

function _load_LaunchProcessInfo() {
  return _LaunchProcessInfo = require('../../nuclide-debugger-php/lib/LaunchProcessInfo');
}

var _AttachProcessInfo;

function _load_AttachProcessInfo() {
  return _AttachProcessInfo = require('../../nuclide-debugger-php/lib/AttachProcessInfo');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }