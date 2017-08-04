'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../commons-node/nuclideUri'));
}

var _Console;

function _load_Console() {
  return _Console = _interopRequireDefault(require('./Console'));
}

var _Dropdown;

function _load_Dropdown() {
  return _Dropdown = require('../../../nuclide-ui/Dropdown');
}

var _PanelComponent;

function _load_PanelComponent() {
  return _PanelComponent = require('../../../nuclide-ui/PanelComponent');
}

var _Toolbar;

function _load_Toolbar() {
  return _Toolbar = require('../../../nuclide-ui/Toolbar');
}

var _ToolbarLeft;

function _load_ToolbarLeft() {
  return _ToolbarLeft = require('../../../nuclide-ui/ToolbarLeft');
}

var _ToolbarRight;

function _load_ToolbarRight() {
  return _ToolbarRight = require('../../../nuclide-ui/ToolbarRight');
}

var _Checkbox;

function _load_Checkbox() {
  return _Checkbox = require('../../../nuclide-ui/Checkbox');
}

var _Button;

function _load_Button() {
  return _Button = require('../../../nuclide-ui/Button');
}

var _createPaneContainer;

function _load_createPaneContainer() {
  return _createPaneContainer = _interopRequireDefault(require('../../../commons-atom/create-pane-container'));
}

var _reactForAtom = require('react-for-atom');

var _TestClassTree;

function _load_TestClassTree() {
  return _TestClassTree = _interopRequireDefault(require('./TestClassTree'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class TestRunnerPanel extends _reactForAtom.React.Component {

  // Bound Functions for use as callbacks.
  constructor(props) {
    super(props);
    this.state = {
      roots: [],
      // If there are test runners, start with the first one selected. Otherwise store -1 to
      // later indicate there were no active test runners.
      selectedTestRunnerIndex: props.testRunners.length > 0 ? 0 : -1
    };

    // Bind Functions for use as callbacks;
    // TODO: Replace with property initializers when supported by Flow;
    this.setSelectedTestRunnerIndex = this.setSelectedTestRunnerIndex.bind(this);
  }

  componentDidMount() {
    this._paneContainer = (0, (_createPaneContainer || _load_createPaneContainer()).default)();
    this._leftPane = this._paneContainer.getActivePane();
    this._rightPane = this._leftPane.splitRight({
      // Prevent Atom from cloning children on splitting; this panel wants an empty container.
      copyActiveItem: false,
      // Make the right pane 2/3 the width of the parent since console output is generally wider
      // than the test tree.
      flexScale: 2
    });

    this.renderTree();
    this.renderConsole();

    _reactForAtom.ReactDOM.findDOMNode(this.refs.paneContainer).appendChild(atom.views.getView(this._paneContainer));
  }

  componentDidUpdate() {
    this.renderTree();
  }

  componentWillReceiveProps(nextProps) {
    const currSelectedIndex = this.state.selectedTestRunnerIndex;
    if (currSelectedIndex === -1 && nextProps.testRunners.length > 0) {
      this.setState({ selectedTestRunnerIndex: 0 });
    } else if (nextProps.testRunners.length === 0 && currSelectedIndex >= 0) {
      this.setState({ selectedTestRunnerIndex: -1 });
    }
  }

  componentWillUnmount() {
    _reactForAtom.ReactDOM.unmountComponentAtNode(atom.views.getView(this._rightPane).querySelector('.item-views'));
    _reactForAtom.ReactDOM.unmountComponentAtNode(atom.views.getView(this._leftPane).querySelector('.item-views'));
    this._paneContainer.destroy();
  }

  render() {
    let runStopButton;
    switch (this.props.executionState) {
      case TestRunnerPanel.ExecutionState.RUNNING:
        runStopButton = _reactForAtom.React.createElement(
          (_Button || _load_Button()).Button,
          {
            icon: 'primitive-square',
            buttonType: (_Button || _load_Button()).ButtonTypes.ERROR,
            onClick: this.props.onClickStop },
          'Stop'
        );
        break;
      case TestRunnerPanel.ExecutionState.STOPPED:
        const initialTest = this.props.path === undefined;
        runStopButton = _reactForAtom.React.createElement(
          (_Button || _load_Button()).Button,
          {
            icon: initialTest ? 'playback-play' : 'sync',
            buttonType: (_Button || _load_Button()).ButtonTypes.PRIMARY,
            disabled: this.isDisabled(),
            onClick: this.props.onClickRun },
          initialTest ? 'Test' : 'Re-Test'
        );
        break;
    }

    // Assign `value` only when needed so a null/undefined value will show an indeterminate
    // progress bar.
    let progressAttrs = undefined;
    if (this.props.progressValue) {
      // `key` is set to force React to treat this as a new element when the `value` attr should be
      // removed. Currently it just sets `value="0"`, which is styled differently from no `value`
      // attr at all.
      // TODO: Remove the `key` once https://github.com/facebook/react/issues/1448 is resolved.
      progressAttrs = {
        key: 1,
        value: this.props.progressValue
      };
    }

    let runMsg;
    if (this.props.executionState === TestRunnerPanel.ExecutionState.RUNNING) {
      runMsg = _reactForAtom.React.createElement(
        'span',
        { className: 'inline-block' },
        'Running'
      );
    } else if (this.props.runDuration) {
      runMsg = _reactForAtom.React.createElement(
        'span',
        { className: 'inline-block' },
        'Done (in ',
        this.props.runDuration / 1000,
        's)'
      );
    }

    let pathMsg;
    if (this.props.path) {
      pathMsg = _reactForAtom.React.createElement(
        'span',
        { title: this.props.path },
        (_nuclideUri || _load_nuclideUri()).default.basename(this.props.path)
      );
    }

    let dropdown;
    if (this.isDisabled()) {
      dropdown = _reactForAtom.React.createElement(
        'span',
        { className: 'inline-block text-warning' },
        'No registered test runners'
      );
    } else {
      dropdown = _reactForAtom.React.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
        className: 'inline-block nuclide-test-runner__runner-dropdown',
        disabled: this.props.executionState === TestRunnerPanel.ExecutionState.RUNNING,
        options: this.props.testRunners.map((testRunner, index) => ({ label: testRunner.label, value: index })),
        onChange: this.setSelectedTestRunnerIndex,
        ref: 'dropdown',
        value: this.state.selectedTestRunnerIndex,
        size: 'sm',
        title: 'Choose a test runner'
      });
    }

    let attachDebuggerCheckbox = null;
    if (this.props.attachDebuggerBeforeRunning != null) {
      attachDebuggerCheckbox = _reactForAtom.React.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
        checked: this.props.attachDebuggerBeforeRunning,
        label: 'Enable Debugger',
        onChange: this.props.onDebuggerCheckboxChanged
      });
    }

    return _reactForAtom.React.createElement(
      (_PanelComponent || _load_PanelComponent()).PanelComponent,
      { dock: 'bottom' },
      _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-test-runner-panel' },
        _reactForAtom.React.createElement(
          (_Toolbar || _load_Toolbar()).Toolbar,
          { location: 'top' },
          _reactForAtom.React.createElement(
            (_ToolbarLeft || _load_ToolbarLeft()).ToolbarLeft,
            null,
            dropdown,
            runStopButton,
            attachDebuggerCheckbox,
            _reactForAtom.React.createElement((_Button || _load_Button()).Button, {
              size: (_Button || _load_Button()).ButtonSizes.SMALL,
              icon: 'trashcan',
              className: 'trashcan inline-block',
              disabled: this.isDisabled() || this.props.executionState === TestRunnerPanel.ExecutionState.RUNNING,
              onClick: this.props.onClickClear,
              title: 'Clear Output'
            }),
            pathMsg
          ),
          _reactForAtom.React.createElement(
            (_ToolbarRight || _load_ToolbarRight()).ToolbarRight,
            null,
            runMsg,
            _reactForAtom.React.createElement('progress', Object.assign({ className: 'inline-block', max: '100' }, progressAttrs)),
            _reactForAtom.React.createElement((_Button || _load_Button()).Button, {
              onClick: this.props.onClickClose,
              className: 'inline-block',
              icon: 'x',
              size: (_Button || _load_Button()).ButtonSizes.SMALL,
              title: 'Close Panel'
            })
          )
        ),
        _reactForAtom.React.createElement('div', { className: 'nuclide-test-runner-console', ref: 'paneContainer' })
      )
    );
  }

  isDisabled() {
    return this.props.testRunners.length === 0;
  }

  setSelectedTestRunnerIndex(selectedTestRunnerIndex) {
    this.setState({ selectedTestRunnerIndex });
  }

  getSelectedTestRunner() {
    const selectedTestRunnerIndex = this.state.selectedTestRunnerIndex;
    if (selectedTestRunnerIndex >= 0) {
      return this.props.testRunners[selectedTestRunnerIndex];
    }
  }

  renderTree() {
    const component = _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement((_TestClassTree || _load_TestClassTree()).default, {
      isRunning: this.props.executionState === TestRunnerPanel.ExecutionState.RUNNING,
      testSuiteModel: this.props.testSuiteModel
    }), atom.views.getView(this._leftPane).querySelector('.item-views'));

    if (!(component instanceof (_TestClassTree || _load_TestClassTree()).default)) {
      throw new Error('Invariant violation: "component instanceof TestClassTree"');
    }

    this._tree = component;
  }

  renderConsole() {
    _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement((_Console || _load_Console()).default, { textBuffer: this.props.buffer }), atom.views.getView(this._rightPane).querySelector('.item-views'));
  }
}TestRunnerPanel.ExecutionState = Object.freeze({
  RUNNING: 0,
  STOPPED: 1
});


module.exports = TestRunnerPanel;