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
exports.createExtraUiComponent = createExtraUiComponent;

var _ArcToolbarSection;

function _load_ArcToolbarSection() {
  return _ArcToolbarSection = _interopRequireDefault(require('../ArcToolbarSection'));
}

var _reactForAtom = require('react-for-atom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Create a component for the extra UI in the toolbar. We use a component
 * (instead of an element) so that we can pass down props from the toolbar itself in the future
 * (e.g. dimensions), and create the component in a closure so that we can close over state
 * too.
 */
function createExtraUiComponent(model) {

  return class ExtraUi extends _reactForAtom.React.Component {

    render() {
      return _reactForAtom.React.createElement((_ArcToolbarSection || _load_ArcToolbarSection()).default, { model: model });
    }

  };
}