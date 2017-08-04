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
exports.default = makeUnescapedUnicodeDatatipComponent;

var _reactForAtom = require('react-for-atom');

var _Unicode;

function _load_Unicode() {
  return _Unicode = require('./Unicode');
}

function makeUnescapedUnicodeDatatipComponent(codePoints) {
  return () => _reactForAtom.React.createElement(UnescapedUnicodeDatatipComponent, { codePoints: codePoints });
}

const UnescapedUnicodeDatatipComponent = props => {
  const text = props.codePoints.map(cp => String.fromCodePoint(cp)).join('');
  const charsWithCodePoints = props.codePoints.map((cp, i) => {
    const hex = (0, (_Unicode || _load_Unicode()).zeroPaddedHex)(cp, 4);
    return _reactForAtom.React.createElement(
      'div',
      {
        className: 'nuclide-unicode-escapes-unescaped-char',
        key: i,
        title: 'U+' + hex },
      String.fromCodePoint(cp),
      _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-unicode-escapes-unescaped-char-code-point' },
        hex
      )
    );
  });
  const result = _reactForAtom.React.createElement(
    'table',
    { className: 'nuclide-unicode-escapes-unescaped-datatip' },
    _reactForAtom.React.createElement(
      'tr',
      null,
      _reactForAtom.React.createElement(
        'td',
        null,
        'Visual'
      ),
      _reactForAtom.React.createElement(
        'td',
        { className: 'nuclide-unicode-escapes-string' },
        text
      )
    ),
    _reactForAtom.React.createElement(
      'tr',
      null,
      _reactForAtom.React.createElement(
        'td',
        null,
        'Logical'
      ),
      _reactForAtom.React.createElement(
        'td',
        null,
        _reactForAtom.React.createElement(
          'div',
          { className: 'nuclide-unicode-escapes-string' },
          charsWithCodePoints
        )
      )
    )
  );
  return result;
};
module.exports = exports['default'];