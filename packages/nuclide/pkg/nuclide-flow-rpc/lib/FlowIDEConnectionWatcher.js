'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FlowIDEConnectionWatcher = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _FlowIDEConnection;

function _load_FlowIDEConnection() {
  return _FlowIDEConnection = require('./FlowIDEConnection');
}

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

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

const defaultIDEConnectionFactory = (proc, fileCache) => new (_FlowIDEConnection || _load_FlowIDEConnection()).FlowIDEConnection(proc, fileCache);

// ESLint thinks the comment at the end is whitespace and warns. Worse, the autofix removes the
// entire comment as well as the whitespace.
// eslint-disable-next-line semi-spacing
const IDE_CONNECTION_MAX_WAIT_MS = 20 /* min */ * 60 /* s/min */ * 1000 /* ms/s */;

const IDE_CONNECTION_MIN_INTERVAL_MS = 1000;

// If a connection lives shorter than this, it is considered unhealthy (it probably crashed
// immediately for whatever reason)
const IDE_CONNECTION_HEALTHY_THRESHOLD_MS = 10 * 1000;

// If we get this many unhealthy connections in a row, give up.
const MAX_UNHEALTHY_CONNECTIONS = 20;

// For the lifetime of this class instance, keep a FlowIDEConnection alive, assuming we do not have
// too many failures in a row.
class FlowIDEConnectionWatcher {

  constructor(processFactory, fileCache, ideConnectionCallback,
  // Can be injected for testing purposes
  ideConnectionFactory = defaultIDEConnectionFactory) {
    this._processFactory = processFactory;
    this._fileCache = fileCache;
    this._ideConnectionFactory = ideConnectionFactory;
    this._ideConnectionCallback = ideConnectionCallback;

    this._currentIDEConnection = null;
    this._currentIDEConnectionSubscription = null;
    this._consecutiveUnhealthyConnections = 0;

    this._isDisposed = false;
    this._isStarted = false;
  }

  // Returns a promise which resolves when the first connection has been established, or we give up.
  start() {
    if (!this._isStarted) {
      this._isStarted = true;
      return this._makeIDEConnection();
    } else {
      return Promise.resolve();
    }
  }

  _makeIDEConnection() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      (0, (_log4js || _load_log4js()).getLogger)('nuclide-flow-rpc').info('Attempting to start IDE connection...');
      let proc = null;
      const endTimeMS = _this._getTimeMS() + IDE_CONNECTION_MAX_WAIT_MS;
      while (true) {
        const attemptStartTime = _this._getTimeMS();

        // Start the process. Eventually we should cancel by unsubscribing, but for now we'll just
        // convert to an uncancelable promise. We need to use `connect()` because otherwise, `take(1)`
        // would complete the stream and kill the process as soon as we got it.
        const processStream = _this._processFactory.publish();
        const processPromise = processStream.take(1).toPromise();
        processStream.connect();

        // eslint-disable-next-line no-await-in-loop
        proc = yield processPromise;
        // dispose() could have been called while we were waiting for the above promise to resolve.
        if (_this._isDisposed) {
          if (proc != null) {
            proc.kill();
          }
          return;
        }
        const attemptEndTime = _this._getTimeMS();
        if (proc != null || attemptEndTime > endTimeMS) {
          break;
        } else {
          (0, (_log4js || _load_log4js()).getLogger)('nuclide-flow-rpc').info('Failed to start Flow IDE connection... retrying');
          const attemptWallTime = attemptEndTime - attemptStartTime;
          const additionalWaitTime = IDE_CONNECTION_MIN_INTERVAL_MS - attemptWallTime;
          if (additionalWaitTime > 0) {
            (0, (_log4js || _load_log4js()).getLogger)('nuclide-flow-rpc').info(`Waiting an additional ${additionalWaitTime} ms before retrying`);
            // eslint-disable-next-line no-await-in-loop
            yield _this._sleep(additionalWaitTime);
          }
        }
      }
      if (proc == null) {
        (0, (_log4js || _load_log4js()).getLogger)('nuclide-flow-rpc').error('Failed to start Flow IDE connection too many times... giving up');
        return;
      }
      const connectionStartTime = _this._getTimeMS();
      const ideConnection = _this._ideConnectionFactory(proc, _this._fileCache);
      _this._ideConnectionCallback(ideConnection);
      _this._currentIDEConnectionSubscription = ideConnection.onWillDispose(function () {
        _this._ideConnectionCallback(null);
        const connectionAliveTime = _this._getTimeMS() - connectionStartTime;
        if (connectionAliveTime < IDE_CONNECTION_HEALTHY_THRESHOLD_MS) {
          _this._consecutiveUnhealthyConnections++;
          if (_this._consecutiveUnhealthyConnections >= MAX_UNHEALTHY_CONNECTIONS) {
            (0, (_log4js || _load_log4js()).getLogger)('nuclide-flow-rpc').error('Too many consecutive unhealthy Flow IDE connections... giving up');
            return;
          }
        } else {
          _this._consecutiveUnhealthyConnections = 0;
        }
        _this._makeIDEConnection();
      });

      _this._currentIDEConnection = ideConnection;
    })();
  }

  // Split this out just so it's easy to mock
  _getTimeMS() {
    return Date.now();
  }

  // Split this out just so it's easy to mock
  _sleep(ms) {
    return (0, (_promise || _load_promise()).sleep)(ms);
  }

  dispose() {
    if (!this._isDisposed) {
      this._isDisposed = true;
      if (this._currentIDEConnectionSubscription != null) {
        this._currentIDEConnectionSubscription.dispose();
      }
      if (this._currentIDEConnection != null) {
        this._currentIDEConnection.dispose();
      }
    }
  }
}
exports.FlowIDEConnectionWatcher = FlowIDEConnectionWatcher;