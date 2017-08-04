'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// Use this module to import the global `WebInspector` with types.

Object.defineProperty(exports, "__esModule", {
  value: true
});

// Prevent accidental import for this file when `WebInspector` is not in scope.
if (!(global.WebInspector != null)) {
  throw new Error('Invariant violation: "global.WebInspector != null"');
}

exports.default = global.WebInspector;
module.exports = exports['default'];