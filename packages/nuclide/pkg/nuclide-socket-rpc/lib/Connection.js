'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConnectionFactory = exports.Connection = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _net = _interopRequireDefault(require('net'));

var _utils;

function _load_utils() {
  return _utils = require('../../nuclide-server/lib/utils');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

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

const PROTOCOL_LOGGER_COUNT = 20;

class Connection {

  constructor(tunnelHost, remoteSocket) {
    trace('Connection: creating connection: ' + JSON.stringify(tunnelHost));
    this._closed = false;
    this._disposeCalled = false;
    this._remoteSocket = remoteSocket;
    this._error = null;

    this._socket = _net.default.createConnection({ port: tunnelHost.port, family: tunnelHost.family }, socket => {
      trace('Connection: connection created and ready to write data.');
    });

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(() => this._socket.end(), this._remoteSocket);

    this._socket.on('error', err => {
      // TODO: we should find a way to send the error back
      //       to the remote socket
      this._error = err;
      (0, (_log4js || _load_log4js()).getLogger)('SocketService').error('Connection error', err);
      this._closed = true;
      this._socket.end();
    });

    this._socket.on('close', () => {
      this.dispose();
    });

    this._socket.on('data', data => {
      if (!this._closed) {
        this._remoteSocket.write(data);
      } else {
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('socket-service:attempting-to-write-data-after-close', {
          disposeCalled: this._disposeCalled,
          lastError: this._error,
          protocolLog: (_utils || _load_utils()).protocolLogger.tail(PROTOCOL_LOGGER_COUNT)
        });
      }
    });
  }

  write(msg) {
    this._socket.write(msg);
  }

  dispose() {
    trace('Connection: disposing connection');
    this._disposeCalled = true;
    this._closed = true;
    this._disposables.dispose();
  }
}

exports.Connection = Connection;
class ConnectionFactory {
  constructor() {}

  createConnection(tunnelHost, socket) {
    return (0, _asyncToGenerator.default)(function* () {
      return new Connection(tunnelHost, socket);
    })();
  }

  dispose() {
    trace('disposing connection.');
  }
}

exports.ConnectionFactory = ConnectionFactory;
function trace(message) {
  (0, (_log4js || _load_log4js()).getLogger)('SocketService').trace(message);
}