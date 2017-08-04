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
exports.DiagnosticsMessageNoHeader = exports.DiagnosticsMessage = undefined;

var _reactForAtom = require('react-for-atom');

var _Button;

function _load_Button() {
  return _Button = require('./Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('./ButtonGroup');
}

var _DiagnosticsMessageText;

function _load_DiagnosticsMessageText() {
  return _DiagnosticsMessageText = require('./DiagnosticsMessageText');
}

var _DiagnosticsTraceItem;

function _load_DiagnosticsTraceItem() {
  return _DiagnosticsTraceItem = require('./DiagnosticsTraceItem');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../commons-node/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function plainTextForItem(item) {
  let mainComponent = undefined;
  if (item.html != null) {
    // Quick and dirty way to get an approximation for the plain text from HTML.
    // This will work in simple cases, anyway.
    mainComponent = item.html.replace('<br/>', '\n').replace(/<[^>]*>/g, '');
  } else {
    if (!(item.text != null)) {
      throw new Error('Invariant violation: "item.text != null"');
    }

    mainComponent = item.text;
  }

  let pathComponent;
  if (item.filePath == null) {
    pathComponent = '';
  } else {
    const lineComponent = item.range != null ? `:${ item.range.start.row + 1 }` : '';
    pathComponent = ': ' + (_nuclideUri || _load_nuclideUri()).default.getPath(item.filePath) + lineComponent;
  }
  return mainComponent + pathComponent;
}

function plainTextForDiagnostic(message) {
  const trace = message.trace != null ? message.trace : [];
  return [message, ...trace].map(plainTextForItem).join('\n');
}

function diagnosticHeader(props) {
  const {
    message,
    fixer
  } = props;
  const providerClassName = message.type === 'Error' ? 'highlight-error' : 'highlight-warning';
  const copy = () => {
    const text = plainTextForDiagnostic(message);
    atom.clipboard.write(text);
  };
  let fixButton = null;
  if (message.fix != null) {
    const applyFix = () => {
      fixer(message);
    };
    const speculative = message.fix.speculative === true;
    const buttonType = speculative ? undefined : (_Button || _load_Button()).ButtonTypes.SUCCESS;
    fixButton = _reactForAtom.React.createElement(
      (_Button || _load_Button()).Button,
      { buttonType: buttonType, size: 'EXTRA_SMALL', onClick: applyFix },
      'Fix'
    );
  }
  return _reactForAtom.React.createElement(
    'div',
    { className: 'nuclide-diagnostics-gutter-ui-popup-header' },
    _reactForAtom.React.createElement(
      (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
      null,
      fixButton,
      _reactForAtom.React.createElement(
        (_Button || _load_Button()).Button,
        { size: 'EXTRA_SMALL', onClick: copy },
        'Copy'
      )
    ),
    _reactForAtom.React.createElement(
      'span',
      { className: providerClassName },
      message.providerName
    )
  );
}

function traceElements(props) {
  const {
    message,
    goToLocation
  } = props;
  return message.trace ? message.trace.map((traceItem, i) => _reactForAtom.React.createElement((_DiagnosticsTraceItem || _load_DiagnosticsTraceItem()).DiagnosticsTraceItem, {
    key: i,
    trace: traceItem,
    goToLocation: goToLocation
  })) : null;
}

/**
 * Visually groups Buttons passed in as children.
 */
const DiagnosticsMessage = exports.DiagnosticsMessage = props => {
  return _reactForAtom.React.createElement(
    'div',
    null,
    diagnosticHeader(props),
    _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-diagnostics-gutter-ui-popup-message' },
      _reactForAtom.React.createElement((_DiagnosticsMessageText || _load_DiagnosticsMessageText()).DiagnosticsMessageText, { message: props.message })
    ),
    traceElements(props)
  );
};

/**
 * Visually groups Buttons passed in as children.
 */
const DiagnosticsMessageNoHeader = exports.DiagnosticsMessageNoHeader = props => {
  return _reactForAtom.React.createElement(
    'div',
    null,
    _reactForAtom.React.createElement((_DiagnosticsMessageText || _load_DiagnosticsMessageText()).DiagnosticsMessageText, { message: props.message }),
    traceElements(props)
  );
};