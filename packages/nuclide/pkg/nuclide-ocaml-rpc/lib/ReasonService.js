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
exports.format = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let format = exports.format = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (content, flags) {
    return (0, (_ReasonProcess || _load_ReasonProcess()).refmt)(content, flags);
  });

  return function format(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

var _ReasonProcess;

function _load_ReasonProcess() {
  return _ReasonProcess = require('./ReasonProcess');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }