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
exports.LoadingSpinner = exports.LoadingSpinnerSizes = undefined;

var _addTooltip;

function _load_addTooltip() {
  return _addTooltip = _interopRequireDefault(require('./add-tooltip'));
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _reactForAtom = require('react-for-atom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const LoadingSpinnerSizes = exports.LoadingSpinnerSizes = Object.freeze({
  EXTRA_SMALL: 'EXTRA_SMALL',
  SMALL: 'SMALL',
  MEDIUM: 'MEDIUM',
  LARGE: 'LARGE'
});

const LoadingSpinnerClassnames = Object.freeze({
  EXTRA_SMALL: 'loading-spinner-tiny',
  SMALL: 'loading-spinner-small',
  MEDIUM: 'loading-spinner-medium',
  LARGE: 'loading-spinner-large'
});

/**
 * Shows an indefinite, animated LoadingSpinner.
 */
class LoadingSpinner extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this.state = { shouldRender: !this.props.delay };
  }

  componentDidMount() {
    if (!this.state.shouldRender) {
      this._timeout = setTimeout(() => this.setState({ shouldRender: true }), this.props.delay);
    }
  }

  componentWillUnmount() {
    if (this._timeout != null) {
      clearTimeout(this._timeout);
    }
  }

  render() {
    const {
      className,
      size,
      tooltip
    } = this.props;
    if (!this.state.shouldRender) {
      return null;
    }

    const ref = tooltip ? (0, (_addTooltip || _load_addTooltip()).default)(tooltip) : null;
    const safeSize = size != null && LoadingSpinnerSizes.hasOwnProperty(size) ? size : LoadingSpinnerSizes.MEDIUM;
    const sizeClassname = LoadingSpinnerClassnames[safeSize];
    const newClassName = (0, (_classnames || _load_classnames()).default)(className, 'loading', sizeClassname);
    return _reactForAtom.React.createElement('div', { className: newClassName, ref: ref });
  }
}
exports.LoadingSpinner = LoadingSpinner;