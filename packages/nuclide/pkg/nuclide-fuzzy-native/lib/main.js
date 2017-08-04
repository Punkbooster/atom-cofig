'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();

// Use the pre-built, native module if available.
// If not, use the fallback JS implementation.
try {
  module.exports = require('../VendorLib/fuzzy-native/lib/main');
} catch (e) {
  logger.error('Failed to load native fuzzy matching. Falling back to JS implementation', e);
  module.exports = require('./FallbackMatcher');
}