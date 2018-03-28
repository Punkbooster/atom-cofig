'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _Format;

function _load_Format() {
  return _Format = _interopRequireDefault(require('./Format'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

class BreakpointListCommand {

  constructor(con, debug) {
    this.name = 'list';
    this.helpText = 'Lists all breakpoints.';

    this._console = con;
    this._debugger = debug;
  }

  execute(args) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const breakpoints = _this._debugger.getAllBreakpoints().sort(function (left, right) {
        return left.index - right.index;
      });

      if (breakpoints.length === 0) {
        return;
      }

      const lastBreakpoint = breakpoints[breakpoints.length - 1];
      const indexSize = String(lastBreakpoint.index).length;

      breakpoints.forEach(function (bpt) {
        const attributes = [];
        if (!bpt.verified) {
          attributes.push('unverified');
        }
        if (!bpt.enabled) {
          attributes.push('disabled');
        }

        const index = (0, (_Format || _load_Format()).default)(`#${bpt.index}`, indexSize);
        const attrs = attributes.length === 0 ? '' : `(${attributes.join(',')})`;
        _this._console.outputLine(`${index} ${bpt.toString()} ${attrs}`);
      });
    })();
  }
}
exports.default = BreakpointListCommand;