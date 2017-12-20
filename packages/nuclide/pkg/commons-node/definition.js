'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.definitionsAreEqual = definitionsAreEqual;


/**
 * Returns true if the 2 definitions are considered equal. They are considered equal if:
 *    - they are both null
 *    - they are both undefined
 *    - they both refer to the same symbol, i.e. they are non-null/undefined and have the same:
 *      - name
 *      - path
 *      - position (row & column)
 *      - language
 *      - project root
 */
function definitionsAreEqual(x, y) {
  if (x == null || y == null) {
    return x === y;
  }
  if (x.name !== y.name) {
    return false;
  }
  if (x.path !== y.path) {
    return false;
  }
  if (x.position.row !== y.position.row || x.position.column !== y.position.column) {
    return false;
  }
  if (x.language !== y.language) {
    return false;
  }
  if (x.projectRoot !== y.projectRoot) {
    return false;
  }
  return true;
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