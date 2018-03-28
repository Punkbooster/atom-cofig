'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SshClient = exports.SshClosedError = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
}

var _stream;

function _load_stream() {
  return _stream = require('nuclide-commons/stream');
}

var _ssh;

function _load_ssh() {
  return _ssh = require('ssh2');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _SftpClient;

function _load_SftpClient() {
  return _SftpClient = require('./SftpClient');
}

var _events;

function _load_events() {
  return _events = require('../common/events');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const OPEN_CHANNEL_ATTEMPTS = 3; /**
                                  * Copyright (c) 2017-present, Facebook, Inc.
                                  * All rights reserved.
                                  *
                                  * This source code is licensed under the BSD-style license found in the
                                  * LICENSE file in the root directory of this source tree. An additional grant
                                  * of patent rights can be found in the PATENTS file in the same directory.
                                  *
                                  * 
                                  * @format
                                  */

const OPEN_CHANNEL_DELAY_MS = 200;

/**
 * Emitted when the server is asking for replies to the given `prompts` for keyboard-
 * interactive user authentication.
 *
 * * `name` is generally what you'd use as a window title (for GUI apps).
 * * `prompts` is an array of `Prompt` objects.
 *
 * The answers for all prompts must be returned as an array of strings in the same order.
 *
 * NOTE: It's possible for the server to come back and ask more questions.
 */
class SshClosedError extends Error {
  constructor(message) {
    super(message);
  }
}

exports.SshClosedError = SshClosedError;


/**
 * Represents an SSH connection. This wraps the `Client` class from ssh2, but reinterprets the
 * API using promises instead of callbacks. The methods of this class generally correspond to the
 * same methods on `Client`.
 */
class SshClient {

  /**
   * Wraps and takes ownership of the ssh2 Client.
   * @param {*} client
   * @param {*} onKeyboard - a callback to provide interactive prompts to the user
   */
  constructor(client, onKeyboard) {
    this._deferredContinue = null;

    this._client = client || new (_ssh || _load_ssh()).Client();
    this._onError = _rxjsBundlesRxMinJs.Observable.fromEvent(this._client, 'error');
    this._onClose = _rxjsBundlesRxMinJs.Observable.fromEvent(this._client, 'close', hadError => ({
      hadError
    }));
    this._closePromise = new (_promise || _load_promise()).Deferred();
    this._endPromise = new (_promise || _load_promise()).Deferred();

    this._client.on('end', this._endPromise.resolve);
    this._client.on('continue', () => this._resolveContinue());
    this._client.on('close', hadError => {
      this._resolveContinue();
      this._endPromise.resolve();
      this._closePromise.resolve({ hadError });
    });
    this._client.on('keyboard-interactive', (name, instructions, lang, prompts, finish) => onKeyboard(name, instructions, lang, prompts).then(finish));
  }

  /**
   * Emitted when an error occurred.
   */
  onError() {
    return this._onError;
  }

  /**
   * Emitted when the socket was closed.
   */
  onClose() {
    return this._onClose;
  }

  /**
   * @return `true` if the channel is ready for more data; `false` if the caller should wait for
   * the 'continue' event before sending more data. This variable is updated immediately after each
   * asynchronous call (i.e. when a Promise is returned; before it is necessarily resolved).
   */
  continue() {
    return this._deferredContinue == null;
  }

  /**
   * Attempts a connection to a server.
   *
   * @throws `Error & ClientErrorExtensions` if the connection failed
   */
  connect(config) {
    const { promise, resolve, reject } = new (_promise || _load_promise()).Deferred();
    function onClose() {
      reject(new SshClosedError('Connection closed before completion'));
    }
    this._client.once('ready', resolve).once('close', onClose).once('error', reject);
    this._client.connect(config);

    return (0, (_promise || _load_promise()).lastly)(promise, () => {
      this._client.removeListener('ready', resolve).removeListener('close', onClose).removeListener('error', reject);
    });
  }

  /**
   * Executes a command on the server.
   *
   * @param command The command to execute.
   * @param options Options for the command.
   */
  exec(command, options = {}) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const stdio = yield _this._clientToPromiseContinue(_this._client.exec, command, options);
      return {
        stdio,
        result: (0, (_events || _load_events()).onceEvent)(stdio, 'close').then(function (code, signal, dump, description, language) {
          return { code, signal, dump, description, language };
        }),
        stdout: (0, (_stream || _load_stream()).observeStream)(stdio)
      };
    })();
  }

  /**
   * Open a connection with `srcIP` and `srcPort` as the originating address and port and
   * `dstIP` and `dstPort` as the remote destination address and port.
   *
   * Updates 'continue'
   *
   * @param srcIP The originating address.
   * @param srcPort The originating port.
   * @param dstIP The destination address.
   * @param dstPort The destination port.
   */
  forwardOut(srcIP, srcPort, dstIP, dstPort) {
    return this._clientToPromiseContinue(this._client.forwardOut, srcIP, srcPort, dstIP, dstPort);
  }

  /**
   * Starts an SFTP session.
   *
   * Updates 'continue'
   */
  sftp(timeoutMs) {
    return this._clientToPromiseContinue(this._client.sftp).then(sftp => new (_SftpClient || _load_SftpClient()).SftpClient(sftp));
  }

  /**
   * Disconnects the socket.
   */
  end() {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this2._readyForData();
      _this2._client.end();
      return _this2._endPromise.promise;
    })();
  }

  /**
   * Destroys the socket.
   */
  destroy() {
    this._client.destroy();
    return this._closePromise.promise.then(() => {});
  }

  _resolveContinue() {
    if (this._deferredContinue != null) {
      const { resolve } = this._deferredContinue;
      this._deferredContinue = null;
      resolve();
    }
  }

  _readyForData() {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      while (_this3._deferredContinue != null) {
        // eslint-disable-next-line no-await-in-loop
        yield _this3._deferredContinue.promise;
      }
    })();
  }

  _clientToPromiseContinue(func, ...args) {
    return new Promise((resolve, reject) => {
      // In case there is a failure to open a channel.
      let attempts = 0;

      const self = this;
      function doOperation() {
        ++attempts;
        self._readyForData().then(() => {
          const readyForData = func.apply(self._client, args);
          if (!readyForData && this._deferredContinue == null) {
            self._deferredContinue = new (_promise || _load_promise()).Deferred();
          }
        });
      }

      args.push((err, result) => {
        if (err != null) {
          if (err instanceof Error && err.message === '(SSH) Channel open failure: open failed' && err.reason === 'ADMINISTRATIVELY_PROHIBITED' && attempts < OPEN_CHANNEL_ATTEMPTS) {
            // In case we're severely limited in the number of channels available, we may have to
            // wait a little while before the previous channel is closed. (If it was closed.)
            setTimeout(doOperation, OPEN_CHANNEL_DELAY_MS);
            return;
          } else {
            return reject(err);
          }
        }
        resolve(result);
      });

      doOperation();
    });
  }
}
exports.SshClient = SshClient;