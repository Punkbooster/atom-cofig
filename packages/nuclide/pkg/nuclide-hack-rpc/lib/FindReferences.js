'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convertReferences = convertReferences;

var _HackHelpers;

function _load_HackHelpers() {
  return _HackHelpers = require('./HackHelpers');
}

function convertReferences(hackResult, projectRoot) {
  let symbolName = hackResult[0].name;
  // Strip off the global namespace indicator.
  if (symbolName.startsWith('\\')) {
    symbolName = symbolName.slice(1);
  }

  // Process this into the format nuclide-find-references expects.
  const references = hackResult.map(ref => {
    return {
      uri: ref.filename,
      name: null, // TODO(hansonw): Get the caller when it's available
      range: (0, (_HackHelpers || _load_HackHelpers()).hackRangeToAtomRange)(ref)
    };
  });

  return {
    type: 'data',
    baseUri: projectRoot,
    referencedSymbolName: symbolName,
    references
  };
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */