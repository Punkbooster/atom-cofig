'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const Ansi = Object.freeze({
  BLUE: '\u001B[34m',
  GREEN: '\u001B[32m',
  RED: '\u001B[31m',
  RESET: '\u001B[39m',
  YELLOW: '\u001B[33m'
});

module.exports = Ansi;