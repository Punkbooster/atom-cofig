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
exports.ConnectionMultiplexer = exports.ConnectionMultiplexerNotification = exports.ConnectionMultiplexerStatus = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _utils;

function _load_utils() {
  return _utils = _interopRequireDefault(require('./utils'));
}

var _helpers;

function _load_helpers() {
  return _helpers = require('./helpers');
}

var _Connection;

function _load_Connection() {
  return _Connection = require('./Connection');
}

var _config;

function _load_config() {
  return _config = require('./config');
}

var _settings;

function _load_settings() {
  return _settings = require('./settings');
}

var _ConnectionUtils;

function _load_ConnectionUtils() {
  return _ConnectionUtils = require('./ConnectionUtils');
}

var _BreakpointStore;

function _load_BreakpointStore() {
  return _BreakpointStore = require('./BreakpointStore');
}

var _DbgpConnector;

function _load_DbgpConnector() {
  return _DbgpConnector = require('./DbgpConnector');
}

var _DbgpSocket;

function _load_DbgpSocket() {
  return _DbgpSocket = require('./DbgpSocket');
}

var _events = _interopRequireDefault(require('events'));

var _ClientCallback;

function _load_ClientCallback() {
  return _ClientCallback = require('./ClientCallback');
}

var _event;

function _load_event() {
  return _event = require('../../commons-node/event');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const CONNECTION_MUX_STATUS_EVENT = 'connection-mux-status';
const CONNECTION_MUX_NOTIFICATION_EVENT = 'connection-mux-notification';

const ConnectionMultiplexerStatus = exports.ConnectionMultiplexerStatus = {
  Init: 'Init',
  Running: 'Running',
  SingleConnectionPaused: 'SingleConnectionPaused',
  AllConnectionsPaused: 'AllConnectionsPaused',
  UserAsyncBreakSent: 'UserAsyncBreakSent',
  End: 'End'
};

const ConnectionMultiplexerNotification = exports.ConnectionMultiplexerNotification = {
  RequestUpdate: 'RequestUpdate'
};

// The ConnectionMultiplexer makes multiple debugger connections appear to be
// a single connection to the debugger UI.
//
// The initialization sequence occurs as follows:
//  - the constructor is called
//  - onStatus is called to hook up event handlers
//  - initial breakpoints may be added here.
//  - listen() is called indicating that all initial Breakpoints have been set
//    and debugging may commence.
//
// Once initialized, the ConnectionMultiplexer can be in one of 3 main states:
// running, break-disabled, and break-enabled.
//
// Running state means that all connections are in the running state.
// Note that running includes the state where there are no connections.
//
// Break-disabled state has at least one connection in break state.
// And none of the connections is enabled. Once in break-disabled state,
// the connection mux will immediately enable one of the broken connections
// and move to break-enabled state.
//
// Break-enabled state has a single connection which is in break-enabled
// state. There may be connections in break-disabled state and running state
// as well. The enabled connection will be shown in the debugger UI and all
// commands will go to the enabled connection.
//
// The ConnectionMultiplexer will close only if there are no connections
// and if either the attach or launch DbgpConnectors are closed. The DbgpConnectors will likely only
// close if HHVM crashes or is stopped.
class ConnectionMultiplexer {

  constructor(clientCallback) {
    this._clientCallback = clientCallback;
    this._status = ConnectionMultiplexerStatus.Init;
    this._connectionStatusEmitter = new _events.default();
    this._previousConnection = null;
    this._enabledConnection = null;
    this._dummyConnection = null;
    this._connections = new Map();
    this._attachConnector = null;
    this._launchConnector = null;
    this._dummyRequestProcess = null;
    this._breakpointStore = new (_BreakpointStore || _load_BreakpointStore()).BreakpointStore();
    this._launchedScriptProcess = null;
    this._launchedScriptProcessPromise = null;
    this._requestSwitchMessage = null;
    this._lastEnabledConnection = null;
  }

  onStatus(callback) {
    return (0, (_event || _load_event()).attachEvent)(this._connectionStatusEmitter, CONNECTION_MUX_STATUS_EVENT, callback);
  }

  onNotification(callback) {
    return (0, (_event || _load_event()).attachEvent)(this._connectionStatusEmitter, CONNECTION_MUX_NOTIFICATION_EVENT, callback);
  }

  listen() {
    const { launchScriptPath } = (0, (_config || _load_config()).getConfig)();
    if (launchScriptPath != null) {
      this._launchModeListen();
    } else {
      this._attachModeListen();
    }

    this._status = ConnectionMultiplexerStatus.Running;

    const pleaseWaitMessage = {
      level: 'warning',
      text: 'Pre-loading, please wait...'
    };
    this._clientCallback.sendUserMessage('console', pleaseWaitMessage);
    this._clientCallback.sendUserMessage('outputWindow', pleaseWaitMessage);
    this._dummyRequestProcess = (0, (_ConnectionUtils || _load_ConnectionUtils()).sendDummyRequest)();

    if (launchScriptPath != null) {
      this._launchedScriptProcessPromise = new Promise(resolve => {
        this._launchedScriptProcess = (0, (_helpers || _load_helpers()).launchPhpScriptWithXDebugEnabled)(launchScriptPath, text => {
          this._clientCallback.sendUserMessage('outputWindow', { level: 'info', text });
          resolve();
        });
      });
    }
  }

  _attachModeListen() {
    const { xdebugAttachPort, xdebugLaunchingPort } = (0, (_config || _load_config()).getConfig)();
    // When in attach mode we are guaranteed that the two ports are not equal.

    if (!(xdebugAttachPort !== xdebugLaunchingPort)) {
      throw new Error('xdebug ports are equal in attach mode');
    }
    // In this case we need to listen for incoming connections to attach to, as well as on the
    // port that the dummy connection will use.


    this._attachConnector = this._setupConnector(xdebugAttachPort, this._disposeAttachConnector.bind(this));
    this._launchConnector = this._setupConnector(xdebugLaunchingPort, this._disposeLaunchConnector.bind(this));
  }

  _launchModeListen() {
    const { xdebugLaunchingPort } = (0, (_config || _load_config()).getConfig)();
    // If we are only doing script debugging, then the dummy connection listener's port can also be
    // used to listen for the script's xdebug requests.
    this._launchConnector = this._setupConnector(xdebugLaunchingPort, this._disposeLaunchConnector.bind(this));
  }

  _setupConnector(port, onClose) {
    const connector = new (_DbgpConnector || _load_DbgpConnector()).DbgpConnector(port);
    connector.onAttach(this._onAttach.bind(this));
    connector.onClose(onClose);
    connector.onError(this._handleAttachError.bind(this));
    connector.listen();
    return connector;
  }

  // For testing purpose.
  getDummyConnection() {
    return this._dummyConnection;
  }

  _onAttach(params) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { socket, message } = params;
      const isAttachConnection = socket.localPort === (0, (_config || _load_config()).getConfig)().xdebugAttachPort;
      if (!(0, (_ConnectionUtils || _load_ConnectionUtils()).isCorrectConnection)(isAttachConnection, message)) {
        (0, (_ConnectionUtils || _load_ConnectionUtils()).failConnection)(socket, 'Discarding connection ' + JSON.stringify(message));
        return;
      }
      yield _this._handleNewConnection(socket, message);
    })();
  }

  _handleNewConnection(socket, message) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const connection = new (_Connection || _load_Connection()).Connection(socket, _this2._connectionOnStatus.bind(_this2), _this2._handleNotification.bind(_this2), (0, (_ConnectionUtils || _load_ConnectionUtils()).isDummyConnection)(message));
      _this2._connections.set(connection.getId(), connection);
      yield _this2._handleSetupForConnection(connection);
      yield _this2._breakpointStore.addConnection(connection);
      _this2._connectionOnStatus(connection, connection.getStatus());
      if (connection.isDummyConnection()) {
        _this2._dummyConnection = connection;
        const text = 'Pre-loading is done! You can use console window now.';
        _this2._clientCallback.sendUserMessage('console', { text, level: 'warning' });
        _this2._clientCallback.sendUserMessage('outputWindow', { text, level: 'success' });
      }
    })();
  }

  _handleNotification(connection, notifyName, notify) {
    switch (notifyName) {
      case (_DbgpSocket || _load_DbgpSocket()).BREAKPOINT_RESOLVED_NOTIFICATION:
        const xdebugBreakpoint = notify;
        const breakpointId = this._breakpointStore.getBreakpointIdFromConnection(connection, xdebugBreakpoint);
        if (breakpointId == null) {
          throw Error(`Cannot find xdebug breakpoint ${ JSON.stringify(xdebugBreakpoint) } in connection.`);
        }
        this._breakpointStore.updateBreakpoint(breakpointId, xdebugBreakpoint);
        const breakpoint = this._breakpointStore.getBreakpoint(breakpointId);
        this._emitNotification((_DbgpSocket || _load_DbgpSocket()).BREAKPOINT_RESOLVED_NOTIFICATION, breakpoint);
        break;
      default:
        (_utils || _load_utils()).default.logError(`Unknown notify: ${ notifyName }`);
        break;
    }
  }

  _shouldPauseAllConnections() {
    return this._status === ConnectionMultiplexerStatus.UserAsyncBreakSent || this._status === ConnectionMultiplexerStatus.AllConnectionsPaused;
  }

  _connectionOnStatus(connection, status, ...args) {
    (_utils || _load_utils()).default.log(`Mux got status: ${ status } on connection ${ connection.getId() }`);

    switch (status) {
      case (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.Starting:
        // Starting status has no stack.
        // step before reporting initial status to get to the first instruction.
        // TODO: Use loader breakpoint configuration to choose between step/run.
        if (!this._shouldPauseAllConnections()) {
          connection.sendContinuationCommand((_DbgpSocket || _load_DbgpSocket()).COMMAND_RUN);
        } else {
          // Debugger is in paused mode, wait for user resume.
          // Don't show starting requests in UI because:
          // 1. They do not have interesting information to users.
          // 2. They cause bounce in debugger UI.
        }
        break;
      case (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.Stopping:
        // TODO: May want to enable post-mortem features?
        if (this._isPaused()) {
          this._emitRequestUpdate(connection);
        }
        connection.sendContinuationCommand((_DbgpSocket || _load_DbgpSocket()).COMMAND_RUN);
        return;
      case (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.Running:
        if (connection === this._enabledConnection) {
          this._disableConnection();
        } else if (this._isPaused()) {
          this._emitRequestUpdate(connection);
        }
        break;
      case (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.Break:
        if (this._isPaused()) {
          // We don't want to send the first threads updated message until the debugger is
          // paused.
          this._emitRequestUpdate(connection);
        }
        break;
      case (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.Error:
        let message = 'The debugger encountered a problem and the connection had to be shut down.';
        if (args[0] != null) {
          message = `${ message }  Error message: ${ args[0] }`;
        }
        this._clientCallback.sendUserMessage('notification', {
          type: 'error',
          message
        });
        if (this._isPaused()) {
          this._emitRequestUpdate(connection);
        }
        this._removeConnection(connection);
        break;
      case (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.Stopped:
      case (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.End:
        if (this._isPaused()) {
          this._emitRequestUpdate(connection);
        }
        this._removeConnection(connection);
        break;
      case (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.Stdout:
        this._sendOutput(args[0], 'log');
        break;
      case (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.Stderr:
        this._sendOutput(args[0], 'info');
        break;
    }

    this._updateStatus();
  }

  _sendOutput(message, level) {
    this._clientCallback.sendUserMessage('outputWindow', {
      level,
      text: message
    });
  }

  _updateStatus() {
    if (this._status === ConnectionMultiplexerStatus.End) {
      return;
    }

    if (this._status === ConnectionMultiplexerStatus.SingleConnectionPaused || this._status === ConnectionMultiplexerStatus.AllConnectionsPaused) {
      (_utils || _load_utils()).default.log('Mux already in break status');
      return;
    }

    // Now check if we can move from running to break.
    for (const connection of this._connections.values()) {
      if (this._shouldEnableConnection(connection)) {
        this._enableConnection(connection);
        break;
      }
    }
  }

  _shouldEnableConnection(connection) {
    // If no connections are available and we async break, enable a connection in starting mode.
    return this._isFirstStartingConnection(connection) || connection.getStatus() === (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.Break && (
    // Only enable connection paused by async_break if user has explicitly issued an async_break.
    connection.getStopReason() !== (_Connection || _load_Connection()).ASYNC_BREAK || this._status === ConnectionMultiplexerStatus.UserAsyncBreakSent) && (
    // Don't switch threads unnecessarily in single thread stepping mode.
    !(0, (_settings || _load_settings()).getSettings)().singleThreadStepping || this._lastEnabledConnection === null || connection === this._lastEnabledConnection) && (
    // Respect the visibility of the dummy connection.
    !connection.isDummyConnection() || connection.isViewable());
  }

  _isFirstStartingConnection(connection) {
    return this._status === ConnectionMultiplexerStatus.UserAsyncBreakSent && connection.getStatus() === (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.Starting && this._connections.size === 2 // Dummy connection + first connection.
    && !connection.isDummyConnection();
  }

  _enableConnection(connection) {
    (_utils || _load_utils()).default.log('Mux enabling connection');
    this._enabledConnection = connection;
    this._handlePotentialRequestSwitch(connection);
    this._lastEnabledConnection = connection;
    this._setBreakStatus();
    this._sendRequestInfo(connection);
    this._pauseConnectionsIfNeeded();
  }

  _pauseConnectionsIfNeeded() {
    if ((0, (_config || _load_config()).getConfig)().stopOneStopAll && this._status !== ConnectionMultiplexerStatus.UserAsyncBreakSent) {
      this._asyncBreak();
    }
  }

  _setBreakStatus() {
    this._setStatus(this._status === ConnectionMultiplexerStatus.UserAsyncBreakSent || (0, (_config || _load_config()).getConfig)().stopOneStopAll ? ConnectionMultiplexerStatus.AllConnectionsPaused : ConnectionMultiplexerStatus.SingleConnectionPaused);
  }

  _sendRequestInfo(connection) {
    for (const backgroundConnection of this._connections.values()) {
      this._emitRequestUpdate(backgroundConnection);
    }
  }

  _emitRequestUpdate(connection) {
    if (connection.isDummyConnection() && !connection.isViewable()) {
      // Only show dummy connection in requests UI if it is viewable.
      return;
    }
    this._emitNotification(ConnectionMultiplexerNotification.RequestUpdate, {
      id: connection.getId(),
      status: connection.getStatus(),
      stopReason: connection.getStopReason() || connection.getStatus()
    });
  }

  _setStatus(status) {
    if (status !== this._status) {
      this._status = status;
      this._emitStatus(status);
    }
  }

  _handlePotentialRequestSwitch(connection) {
    if (this._previousConnection != null && connection !== this._previousConnection) {
      // The enabled connection is different than it was last time the debugger paused
      // so we know that the active request has switched so we should alert the user.
      this._requestSwitchMessage = 'Active request switched';
    }
    this._previousConnection = connection;
  }

  _handleAttachError(error) {
    this._clientCallback.sendUserMessage('notification', {
      type: 'error',
      message: error
    });
    this._emitStatus(ConnectionMultiplexerStatus.End);
  }

  _emitStatus(status) {
    this._connectionStatusEmitter.emit(CONNECTION_MUX_STATUS_EVENT, status);
  }

  _emitNotification(status, params) {
    this._connectionStatusEmitter.emit(CONNECTION_MUX_NOTIFICATION_EVENT, status, params);
  }

  runtimeEvaluate(expression) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      (_utils || _load_utils()).default.log(`runtimeEvaluate() on dummy connection for: ${ expression }`);
      if (_this3._dummyConnection != null) {
        // Global runtime evaluation on dummy connection does not care about
        // which frame it is being evaluated on so choose top frame here.
        const result = yield _this3._dummyConnection.runtimeEvaluate(0, expression);
        _this3._reportEvaluationFailureIfNeeded(expression, result);
        return result;
      } else {
        throw _this3._noConnectionError();
      }
    })();
  }

  evaluateOnCallFrame(frameIndex, expression) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this4._enabledConnection) {
        const result = yield _this4._enabledConnection.evaluateOnCallFrame(frameIndex, expression);
        _this4._reportEvaluationFailureIfNeeded(expression, result);
        return result;
      } else {
        throw _this4._noConnectionError();
      }
    })();
  }

  _reportEvaluationFailureIfNeeded(expression, result) {
    if (result.wasThrown) {
      const message = {
        text: 'Failed to evaluate ' + `"${ expression }": (${ result.error.$.code }) ${ result.error.message[0] }`,
        level: 'error'
      };
      this._clientCallback.sendUserMessage('console', message);
      this._clientCallback.sendUserMessage('outputWindow', message);
    }
  }

  getBreakpointStore() {
    return this._breakpointStore;
  }

  removeBreakpoint(breakpointId) {
    return this._breakpointStore.removeBreakpoint(breakpointId);
  }

  getStackFrames() {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this5._enabledConnection == null) {
        // This occurs on startup with the loader breakpoint.
        return { stack: [] };
      }
      const frames = yield _this5._enabledConnection.getStackFrames();
      if (frames.stack == null) {
        // This occurs when the enabled connection is in starting mode.
        return { stack: [] };
      } else {
        return frames;
      }
    })();
  }

  getConnectionStackFrames(id) {
    const connection = this._connections.get(id);
    if (connection != null && connection.getStatus() === (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.Break) {
      return connection.getStackFrames();
    } else {
      // This occurs on startup with the loader breakpoint.
      return Promise.resolve({ stack: {} });
    }
  }

  getScopesForFrame(frameIndex) {
    if (this._enabledConnection) {
      return this._enabledConnection.getScopesForFrame(frameIndex);
    } else {
      throw this._noConnectionError();
    }
  }

  getStatus() {
    return this._status;
  }

  sendContinuationCommand(command) {
    this._resumeBackgroundConnections();
    if (this._enabledConnection) {
      this._enabledConnection.sendContinuationCommand(command);
    } else {
      throw this._noConnectionError();
    }
  }

  _resumeBackgroundConnections() {
    for (const connection of this._connections.values()) {
      if (connection !== this._enabledConnection && (connection.getStopReason() === (_Connection || _load_Connection()).ASYNC_BREAK || connection.getStatus() === (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.Starting)) {
        connection.sendContinuationCommand((_DbgpSocket || _load_DbgpSocket()).COMMAND_RUN);
      }
    }
  }

  _asyncBreak() {
    for (const connection of this._connections.values()) {
      if (connection.getStatus() === (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.Running) {
        connection.sendBreakCommand();
      }
    }
  }

  pause() {
    this._status = ConnectionMultiplexerStatus.UserAsyncBreakSent;
    // allow a connection that hasnt hit a breakpoint to be enabled, then break all connections.
    this._asyncBreak();
  }

  resume() {
    // For now we will have only single thread stepping, not single thread running.
    this._lastEnabledConnection = null;
    this.sendContinuationCommand((_DbgpSocket || _load_DbgpSocket()).COMMAND_RUN);
  }

  getProperties(remoteId) {
    if (this._enabledConnection) {
      return this._enabledConnection.getProperties(remoteId);
    } else if (this._dummyConnection) {
      return this._dummyConnection.getProperties(remoteId);
    } else {
      throw this._noConnectionError();
    }
  }

  _removeConnection(connection) {
    connection.dispose();
    this._connections.delete(connection.getId());

    if (connection === this._enabledConnection) {
      this._disableConnection();
      this._lastEnabledConnection = null;
    }
    this._checkForEnd();
  }

  _disableConnection() {
    (_utils || _load_utils()).default.log('Mux disabling connection');
    this._enabledConnection = null;
    this._setStatus(ConnectionMultiplexerStatus.Running);
  }

  _disposeAttachConnector() {
    // Avoid recursion with connector's onClose event.
    const connector = this._attachConnector;
    if (connector != null) {
      this._attachConnector = null;
      connector.dispose();
    }
    this._checkForEnd();
  }

  _disposeLaunchConnector() {
    // Avoid recursion with connector's onClose event.
    const connector = this._launchConnector;
    if (connector != null) {
      this._launchConnector = null;
      connector.dispose();
    }
    this._checkForEnd();
  }

  _checkForEnd() {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this6._onlyDummyRemains() && (_this6._attachConnector == null || _this6._launchConnector == null || (0, (_config || _load_config()).getConfig)().endDebugWhenNoRequests)) {

        if (_this6._launchedScriptProcessPromise != null) {
          yield _this6._launchedScriptProcessPromise;
          _this6._launchedScriptProcessPromise = null;
        }

        _this6._setStatus(ConnectionMultiplexerStatus.End);
      }
    })();
  }

  _onlyDummyRemains() {
    return this._connections.size === 1 && this._dummyConnection != null && this._connections.has(this._dummyConnection.getId());
  }

  _noConnectionError() {
    // This is an indication of a bug in the state machine.
    // .. we are seeing a request in a state that should not generate
    // that request.
    return new Error('No connection');
  }

  _handleSetupForConnection(connection) {
    var _this7 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this7._setupStdStreams(connection);
      yield _this7._setupFeatures(connection);
    })();
  }

  _setupStdStreams(connection) {
    var _this8 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const stdoutRequestSucceeded = yield connection.sendStdoutRequest();
      if (!stdoutRequestSucceeded) {
        (_utils || _load_utils()).default.logError('HHVM returned failure for a stdout request');
        _this8._clientCallback.sendUserMessage('outputWindow', {
          level: 'error',
          text: 'HHVM failed to redirect stdout, so no output will be sent to the output window.'
        });
      }
      // TODO: Stderr redirection is not implemented in HHVM so we won't check this return value.
      yield connection.sendStderrRequest();
    })();
  }

  _setupFeatures(connection) {
    return (0, _asyncToGenerator.default)(function* () {
      // max_depth sets the depth that the debugger engine respects when
      // returning hierarchical data.
      let setFeatureSucceeded = yield connection.setFeature('max_depth', '5');
      if (!setFeatureSucceeded) {
        (_utils || _load_utils()).default.logError('HHVM returned failure for setting feature max_depth');
      }
      // show_hidden allows the client to request data from private class members.
      setFeatureSucceeded = yield connection.setFeature('show_hidden', '1');
      if (!setFeatureSucceeded) {
        (_utils || _load_utils()).default.logError('HHVM returned failure for setting feature show_hidden');
      }
      // Turn on notifications.
      setFeatureSucceeded = yield connection.setFeature('notify_ok', '1');
      if (!setFeatureSucceeded) {
        (_utils || _load_utils()).default.logError('HHVM returned failure for setting feature notify_ok');
      }
    })();
  }

  _isPaused() {
    return this._status === ConnectionMultiplexerStatus.SingleConnectionPaused || this._status === ConnectionMultiplexerStatus.AllConnectionsPaused;
  }

  getRequestSwitchMessage() {
    return this._requestSwitchMessage;
  }

  resetRequestSwitchMessage() {
    this._requestSwitchMessage = null;
  }

  getEnabledConnectionId() {
    if (this._enabledConnection != null) {
      return this._enabledConnection.getId();
    } else {
      return null;
    }
  }

  selectThread(id) {
    const connection = this._connections.get(id);
    if (connection != null && connection.getStatus() === (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.Break) {
      this._enabledConnection = connection;
    }
  }

  dispose() {
    if (this._launchedScriptProcess != null) {
      this._launchedScriptProcessPromise = null;
      this._launchedScriptProcess.kill('SIGKILL');
      this._launchedScriptProcess = null;
    }
    for (const connection of this._connections.values()) {
      this._removeConnection(connection);
    }
    if (this._dummyRequestProcess) {
      this._dummyRequestProcess.kill('SIGKILL');
    }
    this._disposeLaunchConnector();
    this._disposeAttachConnector();
  }
}
exports.ConnectionMultiplexer = ConnectionMultiplexer;