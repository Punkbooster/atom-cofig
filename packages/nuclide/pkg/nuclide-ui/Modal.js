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
exports.Modal = undefined;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../commons-node/UniversalDisposable'));
}

var _Portal;

function _load_Portal() {
  return _Portal = require('./Portal');
}

var _reactForAtom = require('react-for-atom');

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Shows a modal dialog when rendered, using Atom's APIs (atom.workspace.addModalPanel).
 */
class Modal extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._handleContainerInnerElement = this._handleContainerInnerElement.bind(this);
    this._handleWindowClick = this._handleWindowClick.bind(this);
  }

  componentWillMount() {
    this._container = document.createElement('div');
    this._panel = atom.workspace.addModalPanel({ item: this._container });
  }

  componentWillUnmount() {
    this._panel.destroy();
  }

  _handleWindowClick(event) {
    // If the user clicks outside of the modal, close it.
    if (this._innerElement && !this._innerElement.contains(event.target)) {
      this.props.onDismiss();
    }
  }

  // Since we're rendering null, we can't use `findDOMNode(this)`.
  _handleContainerInnerElement(el) {
    if (this._cancelDisposable != null) {
      this._cancelDisposable.dispose();
    }

    this._innerElement = el;
    if (el == null) {
      return;
    }

    el.focus();
    this._cancelDisposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.commands.add(window, 'core:cancel', () => {
      this.props.onDismiss();
    }), _rxjsBundlesRxMinJs.Observable.fromEvent(window, 'click')
    // Ignore clicks in the current tick. We don't want to capture the click that showed this
    // modal.
    .skipUntil(_rxjsBundlesRxMinJs.Observable.interval(0).first()).subscribe(this._handleWindowClick));
  }

  render() {
    return _reactForAtom.React.createElement(
      (_Portal || _load_Portal()).Portal,
      { container: this._container },
      _reactForAtom.React.createElement(
        'div',
        {
          tabIndex: '0',
          ref: this._handleContainerInnerElement },
        this.props.children
      )
    );
  }

}
exports.Modal = Modal;