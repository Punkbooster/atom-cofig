'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _marked;

function _load_marked() {
  return _marked = _interopRequireDefault(require('marked'));
}

var _react = _interopRequireDefault(require('react'));

var _MarkedStringSnippet;

function _load_MarkedStringSnippet() {
  return _MarkedStringSnippet = _interopRequireDefault(require('./MarkedStringSnippet'));
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

class MarkedStringDatatip extends _react.default.PureComponent {

  render() {
    const elements = this.props.markedStrings.map((chunk, i) => {
      if (chunk.type === 'markdown') {
        return _react.default.createElement('div', {
          className: 'nuclide-datatip-marked-container',
          dangerouslySetInnerHTML: {
            __html: (0, (_marked || _load_marked()).default)(chunk.value, { sanitize: true })
          },
          key: i
        });
      } else {
        return _react.default.createElement((_MarkedStringSnippet || _load_MarkedStringSnippet()).default, Object.assign({ key: i }, chunk));
      }
    });

    return _react.default.createElement(
      'div',
      { className: 'nuclide-datatip-marked' },
      elements
    );
  }
}
exports.default = MarkedStringDatatip;