'use strict';

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

/* eslint-disable rulesdir/no-commonjs */

try {
  // $FlowFB
  module.exports = require('../fb/trace');
} catch (e) {
  module.exports = require('./trace');
}