'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ShowMoreComponent = undefined;

var _react = _interopRequireDefault(require('react'));

var _MeasuredComponent;

function _load_MeasuredComponent() {
  return _MeasuredComponent = require('./MeasuredComponent');
}

var _Button;

function _load_Button() {
  return _Button = require('nuclide-commons-ui/Button');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** A component which sets a max height and includes a "Show More" button
 * aligned at the bottom. Clicking "Show More" will remove the max height restriction
 * and expand the component to full height.
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class ShowMoreComponent extends _react.default.Component {

  constructor(props) {
    super(props);

    this._updateMeasurements = newMeasurements => {
      if (newMeasurements.scrollHeight !== this.state.currentHeight) {
        this.setState({
          currentHeight: newMeasurements.scrollHeight
        });
      }
    };

    this._toggleShowMore = () => {
      this.setState({ showingMore: !this.state.showingMore });
    };

    this.state = {
      // Defaults to false if showMoreByDefault not specified
      showingMore: this.props.showMoreByDefault != null && this.props.showMoreByDefault,
      currentHeight: 0
    };
  }

  render() {
    const { showingMore, currentHeight } = this.state;
    const { maxHeight } = this.props;

    const showMessage = showingMore ? 'Show Less' : 'Show More';
    const conditionalStyle = !showingMore ? {
      maxHeight: `${maxHeight}px`,
      overflowY: 'hidden'
    } : {};
    const displayNoneIfBelowMaxHeight = currentHeight <= maxHeight ? { display: 'none' } : {};
    const showMoreButton = _react.default.createElement(
      'div',
      {
        className: 'nuclide-ui-show-more-button-container',
        style: displayNoneIfBelowMaxHeight },
      _react.default.createElement(
        (_Button || _load_Button()).Button,
        { onClick: this._toggleShowMore, size: 'EXTRA_SMALL' },
        showMessage
      )
    );

    return _react.default.createElement(
      'div',
      null,
      _react.default.createElement(
        'div',
        {
          className: 'nuclide-ui-show-more-component',
          style: conditionalStyle },
        _react.default.createElement('div', {
          className: 'nuclide-ui-show-more-gradient',
          style: displayNoneIfBelowMaxHeight
        }),
        _react.default.createElement(
          (_MeasuredComponent || _load_MeasuredComponent()).MeasuredComponent,
          { onMeasurementsChanged: this._updateMeasurements },
          this.props.children
        )
      ),
      showMoreButton
    );
  }

}
exports.ShowMoreComponent = ShowMoreComponent;