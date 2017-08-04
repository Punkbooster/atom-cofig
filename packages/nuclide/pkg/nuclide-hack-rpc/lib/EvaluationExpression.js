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
exports.getEvaluationExpression = getEvaluationExpression;

var _range;

function _load_range() {
  return _range = require('../../commons-node/range');
}

var _HackHelpers;

function _load_HackHelpers() {
  return _HackHelpers = require('./HackHelpers');
}

function getEvaluationExpression(filePath, buffer, position) {
  // TODO: Replace RegExp with AST-based, more accurate approach.
  const extractedIdentifier = (0, (_range || _load_range()).wordAtPositionFromBuffer)(buffer, position, (_HackHelpers || _load_HackHelpers()).HACK_WORD_REGEX);
  if (extractedIdentifier == null) {
    return null;
  }
  const {
    range,
    wordMatch
  } = extractedIdentifier;
  const [expression] = wordMatch;
  if (expression == null) {
    return null;
  }
  return {
    expression,
    range
  };
}