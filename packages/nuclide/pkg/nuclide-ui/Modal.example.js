'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ModalExamples = undefined;

var _react = _interopRequireDefault(require('react'));

var _Button;

function _load_Button() {
  return _Button = require('nuclide-commons-ui/Button');
}

var _Modal;

function _load_Modal() {
  return _Modal = require('./Modal');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ModalExample extends _react.default.Component {

  constructor(props) {
    super(props);

    this._showModal = () => {
      this.setState({ isModalShown: true });
    };

    this._hideModal = () => {
      this.setState({ isModalShown: false });
    };

    this.state = { isModalShown: false };
  }

  render() {
    const { isModalShown } = this.state;
    const modal = isModalShown ? _react.default.createElement(
      (_Modal || _load_Modal()).Modal,
      { onDismiss: this._hideModal },
      _react.default.createElement(
        'div',
        null,
        'I\'m a modal. You can add any content you like.'
      ),
      _react.default.createElement(
        (_Button || _load_Button()).Button,
        { onClick: this._hideModal },
        'hide modal'
      )
    ) : null;
    return _react.default.createElement(
      'div',
      null,
      _react.default.createElement(
        (_Button || _load_Button()).Button,
        { onClick: this._showModal },
        'show modal'
      ),
      modal
    );
  }
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

const ModalExamples = exports.ModalExamples = {
  sectionName: 'Modal',
  description: 'Overlays that cover the entire screen. ',
  examples: [{
    title: 'Click the button to toggle a modal:',
    component: ModalExample
  }]
};