'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StatusBarTileComponent = undefined;

var _UnstyledButton;

function _load_UnstyledButton() {
  return _UnstyledButton = _interopRequireDefault(require('nuclide-commons-ui/UnstyledButton'));
}

var _react = _interopRequireWildcard(require('react'));

var _Icon;

function _load_Icon() {
  return _Icon = require('nuclide-commons-ui/Icon');
}

var _addTooltip;

function _load_addTooltip() {
  return _addTooltip = _interopRequireDefault(require('nuclide-commons-ui/addTooltip'));
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const REALLY_BAD_THRESHOLD = 50; /**
                                  * Copyright (c) 2015-present, Facebook, Inc.
                                  * All rights reserved.
                                  *
                                  * This source code is licensed under the license found in the LICENSE file in
                                  * the root directory of this source tree.
                                  *
                                  * 
                                  * @format
                                  */

const NOT_GREAT_THRESHOLD = 80;
const COLOR_DISPLAY_SETTING = 'nuclide-type-coverage.colorizeStatusBar';

class StatusBarTileComponent extends _react.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const result = this.props.result;
    if (result != null) {
      const percentage = result.percentage;
      let colorClasses = {};
      if ((_featureConfig || _load_featureConfig()).default.get(COLOR_DISPLAY_SETTING)) {
        colorClasses = {
          'text-error': percentage <= REALLY_BAD_THRESHOLD,
          'text-warning': percentage > REALLY_BAD_THRESHOLD && percentage <= NOT_GREAT_THRESHOLD,
          // Nothing applied if percentage > NOT_GREAT_THRESHOLD,
          'nuclide-type-coverage-status-bar-active': this.props.isActive
        };
      }
      const classes = (0, (_classnames || _load_classnames()).default)(Object.assign({
        'inline-block': true,
        'nuclide-type-coverage-status-bar': true,
        'nuclide-type-coverage-status-bar-pending': this.props.pending,
        'nuclide-type-coverage-status-bar-ready': !this.props.pending
      }, colorClasses));
      const formattedPercentage = `${Math.floor(percentage)}%`;
      const tooltipString = getTooltipString(formattedPercentage, result.providerName);
      return _react.createElement(
        (_UnstyledButton || _load_UnstyledButton()).default,
        {
          onClick: this.props.onClick,
          className: classes,
          ref: (0, (_addTooltip || _load_addTooltip()).default)({
            title: tooltipString,
            delay: 0,
            placement: 'top'
          }) },
        result.icon == null ? null : _react.createElement((_Icon || _load_Icon()).Icon, { icon: result.icon }),
        _react.createElement(
          'span',
          { className: 'nuclide-type-coverage-status-bar-percentage' },
          formattedPercentage
        )
      );
    } else {
      return null;
    }
  }
}

exports.StatusBarTileComponent = StatusBarTileComponent;
function getTooltipString(formattedPercentage, providerName) {
  return `This file is ${formattedPercentage} covered by ${providerName}.<br/>` + 'Click to toggle display of uncovered areas.';
}