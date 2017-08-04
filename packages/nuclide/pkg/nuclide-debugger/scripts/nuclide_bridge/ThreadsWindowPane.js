'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _NuclideBridge;

function _load_NuclideBridge() {
  return _NuclideBridge = _interopRequireDefault(require('./NuclideBridge'));
}

var _react;

function _load_react() {
  return _react = _interopRequireDefault(require('react'));
}

var _reactDom;

function _load_reactDom() {
  return _reactDom = _interopRequireDefault(require('react-dom'));
}

var _WebInspector;

function _load_WebInspector() {
  return _WebInspector = _interopRequireDefault(require('../../lib/WebInspector'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ThreadsWindowComponent extends (_react || _load_react()).default.Component {

  constructor(props) {
    super(props);
    this._registerUpdate();
    this.state = {
      threadData: null
    };
    this._stoppedThread = null;
    this._handleThreadsUpdated = this._handleThreadsUpdated.bind(this);
    this._handleClearInterface = this._handleClearInterface.bind(this);
  }

  componentWillUnmount() {
    this._unregisterUpdate();
  }

  componentDidUpdate() {
    // We can currently scroll to the stopped thread after each render
    // because we are only rendering when we update the threads. If we
    // add more UI functionality and state changes then we may need to add
    // flags so that we are only scrolling at the correct times.
    this._scrollToStoppedThread();
  }

  _handleThreadsUpdated(event) {
    this.setState(this._getState());
  }

  _getState() {
    let threadData = null;
    const mainTarget = (_WebInspector || _load_WebInspector()).default.targetManager.mainTarget();
    if (mainTarget != null) {
      threadData = mainTarget.debuggerModel.threadStore.getData();
    }
    return { threadData };
  }

  _registerUpdate() {
    (_WebInspector || _load_WebInspector()).default.targetManager.addModelListener((_WebInspector || _load_WebInspector()).default.DebuggerModel, (_WebInspector || _load_WebInspector()).default.DebuggerModel.Events.ThreadsUpdated, this._handleThreadsUpdated, this);
    (_WebInspector || _load_WebInspector()).default.targetManager.addModelListener((_WebInspector || _load_WebInspector()).default.DebuggerModel, (_WebInspector || _load_WebInspector()).default.DebuggerModel.Events.SelectedThreadChanged, this._handleThreadsUpdated, this);
    (_WebInspector || _load_WebInspector()).default.targetManager.addModelListener((_WebInspector || _load_WebInspector()).default.DebuggerModel, (_WebInspector || _load_WebInspector()).default.DebuggerModel.Events.ClearInterface, this._handleClearInterface, this);
  }

  _handleClearInterface(event) {
    this.setState({ threadData: null });
  }

  _unregisterUpdate() {
    (_WebInspector || _load_WebInspector()).default.targetManager.removeModelListener((_WebInspector || _load_WebInspector()).default.DebuggerModel, (_WebInspector || _load_WebInspector()).default.DebuggerModel.Events.ThreadsUpdated, this._handleThreadsUpdated, this);
    (_WebInspector || _load_WebInspector()).default.targetManager.removeModelListener((_WebInspector || _load_WebInspector()).default.DebuggerModel, (_WebInspector || _load_WebInspector()).default.DebuggerModel.Events.SelectedThreadChanged, this._handleThreadsUpdated, this);
    (_WebInspector || _load_WebInspector()).default.targetManager.removeModelListener((_WebInspector || _load_WebInspector()).default.DebuggerModel, (_WebInspector || _load_WebInspector()).default.DebuggerModel.Events.ClearInterface, this._handleClearInterface, this);
  }

  _handleDoubleClick(thread) {
    (_NuclideBridge || _load_NuclideBridge()).default.selectThread(thread.id);
  }

  /**
   * '>' means the stopped thread.
   * '*' means the current selected thread.
   * Empty space for other threads.
   */
  _getIndicator(thread, stopThreadId, selectedThreadId) {
    return thread.id === stopThreadId ? '>' : thread.id === selectedThreadId ? '*' : ' ';
  }

  _setStoppedThread(ref) {
    this._stoppedThread = ref;
  }

  _scrollToStoppedThread() {
    if (this._stoppedThread != null) {
      this._stoppedThread.scrollIntoView();
    }
  }

  render() {
    const children = [];
    const { threadData } = this.state;
    if (threadData && threadData.threadMap) {
      for (const thread of threadData.threadMap.values()) {
        const indicator = this._getIndicator(thread, threadData.stopThreadId, threadData.selectedThreadId);
        const rowStyle = {};
        if (thread.id === threadData.selectedThreadId) {
          rowStyle.backgroundColor = '#cfcfcf';
        }
        if (indicator === '>') {
          children.push((_react || _load_react()).default.createElement(
            'tr',
            {
              onDoubleClick: this._handleDoubleClick.bind(this, thread),
              style: rowStyle,
              ref: ref => this._setStoppedThread(ref) },
            (_react || _load_react()).default.createElement(
              'td',
              null,
              indicator
            ),
            (_react || _load_react()).default.createElement(
              'td',
              null,
              thread.id
            ),
            (_react || _load_react()).default.createElement(
              'td',
              null,
              thread.address
            ),
            (_react || _load_react()).default.createElement(
              'td',
              null,
              thread.stopReason
            )
          ));
        } else {
          children.push((_react || _load_react()).default.createElement(
            'tr',
            {
              onDoubleClick: this._handleDoubleClick.bind(this, thread),
              style: rowStyle },
            (_react || _load_react()).default.createElement(
              'td',
              null,
              indicator
            ),
            (_react || _load_react()).default.createElement(
              'td',
              null,
              thread.id
            ),
            (_react || _load_react()).default.createElement(
              'td',
              null,
              thread.address
            ),
            (_react || _load_react()).default.createElement(
              'td',
              null,
              thread.stopReason
            )
          ));
        }
      }
    }

    const containerStyle = {
      maxHeight: '20em',
      overflow: 'auto'
    };

    if (children.length > 0) {
      return (_react || _load_react()).default.createElement(
        'div',
        { style: containerStyle, className: 'nuclide-chrome-debugger-data-grid' },
        (_react || _load_react()).default.createElement(
          'table',
          { width: '100%' },
          (_react || _load_react()).default.createElement(
            'thead',
            null,
            (_react || _load_react()).default.createElement(
              'tr',
              { key: 0 },
              (_react || _load_react()).default.createElement('td', null),
              (_react || _load_react()).default.createElement(
                'td',
                null,
                'ID'
              ),
              (_react || _load_react()).default.createElement(
                'td',
                null,
                'Address'
              ),
              (_react || _load_react()).default.createElement(
                'td',
                null,
                'Stop Reason'
              )
            )
          ),
          (_react || _load_react()).default.createElement(
            'tbody',
            null,
            children
          )
        )
      );
    } else {
      return (_react || _load_react()).default.createElement(
        'div',
        { className: 'info' },
        'No Threads'
      );
    }
  }
}

class ThreadsWindowPane extends (_WebInspector || _load_WebInspector()).default.SidebarPane {
  constructor() {
    // WebInspector classes are not es6 classes, but babel forces a super call.
    super();
    // Actual super call.
    (_WebInspector || _load_WebInspector()).default.SidebarPane.call(this, 'Threads');

    // TODO: change.
    this.registerRequiredCSS('components/breakpointsList.css');

    (_reactDom || _load_reactDom()).default.render((_react || _load_react()).default.createElement(ThreadsWindowComponent, null), this.bodyElement);

    this.expand();
  }

  // This is implemented by various UI views, but is not declared anywhere as
  // an official interface. There's callers to various `reset` functions, so
  // it's probably safer to have this.
  reset() {}
}

module.exports = ThreadsWindowPane;