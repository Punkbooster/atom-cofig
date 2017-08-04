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
exports.DebuggerRpcWebSocketService = exports.DebuggerRpcServiceBase = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _ws;

function _load_ws() {
  return _ws = _interopRequireDefault(require('ws'));
}

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('../../nuclide-debugger-common');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class DebuggerRpcServiceBase {

  constructor(debuggerRpcServiceName) {
    this._clientCallback = new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).ClientCallback();
    this._logger = (0, (_nuclideLogging || _load_nuclideLogging()).getCategoryLogger)(`nuclide-debugger-${ debuggerRpcServiceName }-rpc`);
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._clientCallback);
  }

  getClientCallback() {
    return this._clientCallback;
  }

  getLogger() {
    return this._logger;
  }

  getSubscriptions() {
    return this._subscriptions;
  }

  getOutputWindowObservable() {
    return this._clientCallback.getOutputWindowObservable().publish();
  }

  getServerMessageObservable() {
    return this._clientCallback.getServerMessageObservable().publish();
  }

  dispose() {
    this._subscriptions.dispose();
    return Promise.resolve();
  }
}

exports.DebuggerRpcServiceBase = DebuggerRpcServiceBase; // TODO: make this transportation plugable.
/**
 * Debugger base rpc service using WebSocket protocol to communicate with backend.
 */

class DebuggerRpcWebSocketService extends DebuggerRpcServiceBase {

  connectToWebSocketServer(webSocketServerAddress) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const webSocket = yield _this._startWebSocketClient(webSocketServerAddress);
      _this._webSocket = webSocket;
      _this._subscriptions.add(function () {
        return webSocket.terminate();
      });
      webSocket.on('message', _this._handleWebSocketServerMessage.bind(_this));
    })();
  }

  _handleWebSocketServerMessage(message) {
    this._clientCallback.sendChromeMessage(message);
  }

  _startWebSocketClient(webSocketServerAddress) {
    return new Promise((resolve, reject) => {
      const ws = new (_ws || _load_ws()).default(webSocketServerAddress);
      ws.on('open', () => {
        // Successfully connected with WS server, fulfill the promise.
        resolve(ws);
      });
    });
  }

  sendCommand(message) {
    const webSocket = this._webSocket;
    if (webSocket != null) {
      this.getLogger().logTrace(`forward client message to server: ${ message }`);
      webSocket.send(message);
    } else {
      this.getLogger().logInfo(`Nuclide sent message to server after socket closed: ${ message }`);
    }
    return Promise.resolve();
  }
}
exports.DebuggerRpcWebSocketService = DebuggerRpcWebSocketService;