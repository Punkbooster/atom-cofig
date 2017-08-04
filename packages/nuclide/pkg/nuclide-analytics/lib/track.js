'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// This extra module enables adding spies during testing.
try {
  // $FlowFB
  module.exports = require('../fb/analytics');
} catch (e) {
  module.exports = require('./analytics');
}