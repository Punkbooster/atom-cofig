'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _react = _interopRequireWildcard(require('react'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _Checkbox;

function _load_Checkbox() {
  return _Checkbox = require('nuclide-commons-ui/Checkbox');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _ListView;

function _load_ListView() {
  return _ListView = require('../../nuclide-ui/ListView');
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _Icon;

function _load_Icon() {
  return _Icon = require('nuclide-commons-ui/Icon');
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

class BreakpointListComponent extends _react.Component {

  constructor(props) {
    super(props);

    this._handleBreakpointEnabledChange = (breakpoint, enabled) => {
      this.props.actions.updateBreakpointEnabled(breakpoint.id, enabled);
    };

    this._handleBreakpointClick = (breakpointIndex, breakpoint) => {
      if (!(breakpoint != null)) {
        throw new Error('Invariant violation: "breakpoint != null"');
      }

      const { path, line } = breakpoint;
      this.props.actions.openSourceLocation((_nuclideUri || _load_nuclideUri()).default.nuclideUriToUri(path), line);
    };

    this._debuggerSupportsConditionalBp = breakpoint => {
      return this.props.model.breakpointSupportsConditions(breakpoint);
    };

    this.state = {
      breakpoints: this.props.model.getAllBreakpoints()
    };
  }

  componentDidMount() {
    const { model } = this.props;
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(model.onNeedUIUpdate(() => {
      this.setState({
        breakpoints: model.getAllBreakpoints()
      });
    }));
  }

  componentWillUnmount() {
    if (this._disposables != null) {
      this._disposables.dispose();
    }
  }

  render() {
    const { breakpoints } = this.state;
    if (breakpoints == null || breakpoints.length === 0) {
      return _react.createElement(
        'span',
        null,
        '(no breakpoints)'
      );
    }

    const items = breakpoints.map(breakpoint => Object.assign({}, breakpoint, {
      // Calculate the basename exactly once for each breakpoint
      basename: (_nuclideUri || _load_nuclideUri()).default.basename(breakpoint.path)
    }))
    // Show resolved breakpoints at the top of the list, then order by filename & line number.
    .sort((breakpointA, breakpointB) => 100 * (Number(breakpointB.resolved) - Number(breakpointA.resolved)) + 10 * breakpointA.basename.localeCompare(breakpointB.basename) + Math.sign(breakpointA.line - breakpointB.line)).map((breakpoint, i) => {
      const { basename, line, enabled, resolved, path } = breakpoint;
      const label = `${basename}:${line + 1}`;
      const title = !enabled ? 'Disabled breakpoint' : !resolved ? 'Unresolved Breakpoint' : `Breakpoint at ${label} (resolved)`;

      const conditionElement = this._debuggerSupportsConditionalBp(breakpoint) && breakpoint.condition !== '' ? _react.createElement(
        'div',
        {
          className: 'nuclide-debugger-breakpoint-condition',
          title: `Breakpoint condition: ${breakpoint.condition}`,
          'data-path': path,
          'data-line': line,
          onClick: event => {
            atom.commands.dispatch(event.target, 'nuclide-debugger:edit-breakpoint');
          } },
        'Condition: ',
        breakpoint.condition
      ) : null;

      const { hitCount } = breakpoint;
      const hitCountElement = hitCount != null && hitCount >= 0 ? _react.createElement(
        'div',
        {
          className: 'nuclide-debugger-breakpoint-hitcount',
          title: `Breakpoint hit count: ${hitCount}` },
        'Hit count: ',
        hitCount
      ) : null;
      const content = _react.createElement(
        'div',
        { className: 'inline-block' },
        _react.createElement(
          'div',
          {
            className: (0, (_classnames || _load_classnames()).default)({
              'nuclide-debugger-breakpoint-disabled': !enabled,
              'nuclide-debugger-breakpoint-with-condition': breakpoint.condition !== ''
            }),
            key: i },
          _react.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
            checked: enabled,
            indeterminate: !resolved,
            disabled: !resolved,
            onChange: this._handleBreakpointEnabledChange.bind(this, breakpoint),
            onClick: event => event.stopPropagation(),
            title: title,
            className: (0, (_classnames || _load_classnames()).default)(resolved ? '' : 'nuclide-debugger-breakpoint-unresolved', 'nuclide-debugger-breakpoint-checkbox')
          }),
          _react.createElement(
            'span',
            { title: title, 'data-path': path, 'data-line': line },
            _react.createElement(
              'div',
              { className: 'nuclide-debugger-breakpoint-condition-controls' },
              _react.createElement((_Icon || _load_Icon()).Icon, {
                icon: 'pencil',
                className: 'nuclide-debugger-breakpoint-condition-control',
                onClick: event => {
                  (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_EDIT_BREAKPOINT_FROM_ICON);
                  atom.commands.dispatch(event.target, 'nuclide-debugger:edit-breakpoint');
                }
              }),
              _react.createElement((_Icon || _load_Icon()).Icon, {
                icon: 'x',
                className: 'nuclide-debugger-breakpoint-condition-control',
                'data-path': path,
                'data-line': line,
                onClick: event => {
                  (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_DELETE_BREAKPOINT_FROM_ICON);
                  atom.commands.dispatch(event.target, 'nuclide-debugger:remove-breakpoint');
                }
              })
            ),
            label
          ),
          conditionElement
        ),
        hitCountElement
      );
      return _react.createElement(
        (_ListView || _load_ListView()).ListViewItem,
        {
          key: label,
          index: i,
          value: breakpoint,
          'data-path': path,
          'data-line': line,
          title: title,
          className: 'nuclide-debugger-breakpoint' },
        content
      );
    });
    return _react.createElement(
      (_ListView || _load_ListView()).ListView,
      {
        alternateBackground: true,
        onSelect: this._handleBreakpointClick,
        selectable: true },
      items
    );
  }
}
exports.default = BreakpointListComponent;