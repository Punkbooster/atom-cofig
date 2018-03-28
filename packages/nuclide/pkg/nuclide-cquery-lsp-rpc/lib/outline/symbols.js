'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isFunction = isFunction;

var _protocol;

function _load_protocol() {
  return _protocol = require('../../../nuclide-vscode-language-service-rpc/lib/protocol');
}

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

function isFunction(symbol) {
  return symbol.kind === (_protocol || _load_protocol()).SymbolKind.Function || symbol.kind === (_protocol || _load_protocol()).SymbolKind.Method;
}