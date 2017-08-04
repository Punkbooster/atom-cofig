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

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _libclang;

function _load_libclang() {
  return _libclang = _interopRequireDefault(require('./libclang'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class CodeFormatHelpers {
  static formatEntireFile(editor, range) {
    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackOperationTiming)('nuclide-clang-format.formatCode', (0, _asyncToGenerator.default)(function* () {
      try {
        return yield (_libclang || _load_libclang()).default.formatCode(editor, range);
      } catch (e) {
        (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('Could not run clang-format:', e);
        throw new Error('Could not run clang-format.<br>Ensure it is installed and in your $PATH.');
      }
    }));
  }
}
exports.default = CodeFormatHelpers;
module.exports = exports['default'];