'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SshHandshake = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.decorateSshConnectionDelegateWithTracking = decorateSshConnectionDelegateWithTracking;

var _ConnectionTracker;

function _load_ConnectionTracker() {
  return _ConnectionTracker = _interopRequireDefault(require('./ConnectionTracker'));
}

var _ssh;

function _load_ssh() {
  return _ssh = require('ssh2');
}

var _fsPlus;

function _load_fsPlus() {
  return _fsPlus = _interopRequireDefault(require('fs-plus'));
}

var _net = _interopRequireDefault(require('net'));

var _RemoteConnection;

function _load_RemoteConnection() {
  return _RemoteConnection = require('./RemoteConnection');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
}

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

var _lookupPreferIpV;

function _load_lookupPreferIpV() {
  return _lookupPreferIpV = _interopRequireDefault(require('./lookup-prefer-ip-v6'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _RemoteCommand;

function _load_RemoteCommand() {
  return _RemoteCommand = require('./RemoteCommand');
}

var _systemInfo;

function _load_systemInfo() {
  return _systemInfo = require('../../commons-node/system-info');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-remote-connection');

// Sync word and regex pattern for parsing command stdout.
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

const READY_TIMEOUT_MS = 120 * 1000;
const SFTP_TIMEOUT_MS = 20 * 1000;

// Automatically retry with a password prompt if existing authentication methods fail.
const PASSWORD_RETRIES = 3;

const SupportedMethods = Object.freeze({
  SSL_AGENT: 'SSL_AGENT',
  PASSWORD: 'PASSWORD',
  PRIVATE_KEY: 'PRIVATE_KEY'
});

const ErrorType = Object.freeze({
  UNKNOWN: 'UNKNOWN',
  HOST_NOT_FOUND: 'HOST_NOT_FOUND',
  CANT_READ_PRIVATE_KEY: 'CANT_READ_PRIVATE_KEY',
  CERT_NOT_YET_VALID: 'CERT_NOT_YET_VALID',
  SSH_CONNECT_TIMEOUT: 'SSH_CONNECT_TIMEOUT',
  SSH_CONNECT_FAILED: 'SSH_CONNECT_FAILED',
  SSH_AUTHENTICATION: 'SSH_AUTHENTICATION',
  DIRECTORY_NOT_FOUND: 'DIRECTORY_NOT_FOUND',
  SERVER_START_FAILED: 'SERVER_START_FAILED',
  SERVER_CANNOT_CONNECT: 'SERVER_CANNOT_CONNECT',
  SFTP_TIMEOUT: 'SFTP_TIMEOUT',
  USER_CANCELLED: 'USER_CANCELLED'
});

/**
 * The server is asking for replies to the given prompts for
 * keyboard-interactive user authentication.
 *
 * @param name is generally what you'd use as
 *     a window title (for GUI apps).
 * @param prompts is an array of { prompt: 'Password: ',
 *     echo: false } style objects (here echo indicates whether user input
 *     should be displayed on the screen).
 * @param finish: The answers for all prompts must be provided as an
 *     array of strings and passed to finish when you are ready to continue. Note:
 *     It's possible for the server to come back and ask more questions.
 */


const SshConnectionErrorLevelMap = new Map([['client-timeout', ErrorType.SSH_CONNECT_TIMEOUT], ['client-socket', ErrorType.SSH_CONNECT_FAILED], ['protocal', ErrorType.SSH_CONNECT_FAILED], ['client-authentication', ErrorType.SSH_AUTHENTICATION], ['agent', ErrorType.SSH_AUTHENTICATION], ['client-dns', ErrorType.SSH_AUTHENTICATION]]);

class SshHandshake {

  constructor(delegate, connection) {
    this._cancelled = false;
    this._delegate = delegate;
    this._connection = connection ? connection : new (_ssh || _load_ssh()).Client();
    this._connection.on('ready', this._onConnect.bind(this));
    this._connection.on('error', this._onSshConnectionError.bind(this));
    this._connection.on('keyboard-interactive', this._onKeyboardInteractive.bind(this));
  }

  _willConnect() {
    this._delegate.onWillConnect(this._config);
  }

  _didConnect(connection) {
    this._delegate.onDidConnect(connection, this._config);
  }

  _error(message, errorType, error) {
    logger.error(`SshHandshake failed: ${errorType}, ${message}`, error);
    this._delegate.onError(errorType, error, this._config);
  }

  _onSshConnectionError(error) {
    const errorLevel = error.level;
    // Upon authentication failure, fall back to using a password.
    if (errorLevel === 'client-authentication' && this._passwordRetryCount < PASSWORD_RETRIES) {
      const config = this._config;
      const retryText = this._passwordRetryCount ? ' again' : '';
      this._delegate.onKeyboardInteractive('', '', '', // ignored
      [{
        prompt: `Authentication failed. Try entering your password${retryText}:`,
        echo: true
      }], ([password]) => {
        this._connection.connect({
          // Use the correctly resolved hostname.
          host: this._connection.config.host,
          port: config.sshPort,
          username: config.username,
          password,
          tryKeyboard: true,
          readyTimeout: READY_TIMEOUT_MS
        });
      });
      this._passwordRetryCount++;
      return;
    }
    const errorType = SshConnectionErrorLevelMap.get(errorLevel) || SshHandshake.ErrorType.UNKNOWN;
    this._error('Ssh connection failed.', errorType, error);
  }

  connect(config) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this._config = config;
      _this._passwordRetryCount = 0;
      _this._cancelled = false;
      _this._willConnect();

      let lookup;
      try {
        lookup = yield (0, (_lookupPreferIpV || _load_lookupPreferIpV()).default)(config.host);
      } catch (e) {
        return _this._error('Failed to resolve DNS.', SshHandshake.ErrorType.HOST_NOT_FOUND, e);
      }

      const { address, family } = lookup;
      _this._config.family = family;

      if (config.authMethod === SupportedMethods.SSL_AGENT) {
        // Point to ssh-agent's socket for ssh-agent-based authentication.
        let agent = process.env.SSH_AUTH_SOCK;
        // flowlint-next-line sketchy-null-string:off
        if (!agent && /^win/.test(process.platform)) {
          // #100: On Windows, fall back to pageant.
          agent = 'pageant';
        }
        _this._connection.connect({
          host: address,
          port: config.sshPort,
          username: config.username,
          agent,
          tryKeyboard: true,
          readyTimeout: READY_TIMEOUT_MS
        });
      } else if (config.authMethod === SupportedMethods.PASSWORD) {
        // The user has already entered the password once.
        _this._passwordRetryCount++;
        // When the user chooses password-based authentication, we specify
        // the config as follows so that it tries simple password auth and
        // failing that it falls through to the keyboard interactive path
        _this._connection.connect({
          host: address,
          port: config.sshPort,
          username: config.username,
          password: config.password,
          tryKeyboard: true,
          readyTimeout: READY_TIMEOUT_MS
        });
      } else if (config.authMethod === SupportedMethods.PRIVATE_KEY) {
        // We use fs-plus's normalize() function because it will expand the ~, if present.
        const expandedPath = (_fsPlus || _load_fsPlus()).default.normalize(config.pathToPrivateKey);
        try {
          const privateKey = yield (_fsPromise || _load_fsPromise()).default.readFile(expandedPath);
          _this._connection.connect({
            host: address,
            port: config.sshPort,
            username: config.username,
            privateKey,
            tryKeyboard: true,
            readyTimeout: READY_TIMEOUT_MS
          });
        } catch (e) {
          _this._error('Failed to read private key', SshHandshake.ErrorType.CANT_READ_PRIVATE_KEY, e);
        }
      }
    })();
  }

  cancel() {
    this._cancelled = true;
    this._connection.end();
  }

  _onKeyboardInteractive(name, instructions, instructionsLang, prompts, finish) {
    this._delegate.onKeyboardInteractive(name, instructions, instructionsLang, prompts, finish);
  }

  _forwardSocket(socket) {
    if (!(socket.remoteAddress != null)) {
      throw new Error('Invariant violation: "socket.remoteAddress != null"');
    }

    this._connection.forwardOut(socket.remoteAddress, socket.remotePort, 'localhost', this._remotePort, (err, stream) => {
      if (err) {
        socket.end();
        logger.error(err);
        return;
      }
      socket.pipe(stream);
      stream.pipe(socket);
    });
  }

  _updateServerInfo(serverInfo) {
    if (!(typeof serverInfo.port === 'number')) {
      throw new Error('Invariant violation: "typeof serverInfo.port === \'number\'"');
    }

    this._remotePort = serverInfo.port || 0;
    this._remoteHost = typeof serverInfo.hostname === 'string' ? serverInfo.hostname : this._config.host;

    // Because the value for the Initial Directory that the user supplied may have
    // been a symlink that was resolved by the server, overwrite the original `cwd`
    // value with the resolved value.

    if (!(typeof serverInfo.workspace === 'string')) {
      throw new Error('Invariant violation: "typeof serverInfo.workspace === \'string\'"');
    }

    this._config.cwd = serverInfo.workspace;

    // The following keys are optional in `RemoteConnectionConfiguration`.
    //
    // Do not throw when any of them (`ca`, `cert`, or `key`) are undefined because that will be the
    // case when the server is started in "insecure" mode. See `::_isSecure`, which returns the
    // security of this connection after the server is started.
    if (typeof serverInfo.ca === 'string') {
      this._certificateAuthorityCertificate = new Buffer(serverInfo.ca);
    }
    if (typeof serverInfo.cert === 'string') {
      this._clientCertificate = new Buffer(serverInfo.cert);
    }
    if (typeof serverInfo.key === 'string') {
      this._clientKey = new Buffer(serverInfo.key);
    }
  }

  _isSecure() {
    return Boolean(this._certificateAuthorityCertificate && this._clientCertificate && this._clientKey);
  }

  _startRemoteServer() {
    var _this2 = this;

    return new Promise((resolve, reject) => {
      const command = this._config.remoteServerCommand;
      const remoteTempFile = `/tmp/nuclide-sshhandshake-${Math.random()}`;
      const flags = [`--workspace=${this._config.cwd}`, `--common-name=${this._config.host}`, `--json-output-file=${remoteTempFile}`, '--timeout=60'];
      // Append the client version if not already provided.
      if (!command.includes('--version=')) {
        flags.push(`--version=${(0, (_systemInfo || _load_systemInfo()).getNuclideVersion)()}`);
      }
      // We'll take the user-provided command literally.
      const cmd = command + ' ' + (0, (_string || _load_string()).shellQuote)(flags);

      this._connection.exec(cmd, { pty: { term: 'nuclide' } }, (err, stream) => {
        if (err) {
          this._onSshConnectionError(err);
          return resolve(false);
        }

        let stdOut = '';
        // $FlowIssue - Problem with function overloads. Maybe related to #4616, #4683, #4685, and #4669
        stream.on('close', (() => {
          var _ref = (0, _asyncToGenerator.default)(function* (exitCode, signal) {
            if (exitCode !== 0) {
              if (_this2._cancelled) {
                _this2._error('Cancelled by user', SshHandshake.ErrorType.USER_CANCELLED, new Error(stdOut));
              } else {
                _this2._error('Remote shell execution failed', SshHandshake.ErrorType.UNKNOWN, new Error(stdOut));
              }
              return resolve(false);
            }

            // Some servers have max channels set to 1, so add a delay to ensure
            // the old channel has been cleaned up on the server.
            // TODO(hansonw): Implement a proper retry mechanism.
            // But first, we have to clean up this callback hell.
            yield (0, (_promise || _load_promise()).sleep)(100);
            const result = yield (0, (_RemoteCommand || _load_RemoteCommand()).readFile)(_this2._connection, SFTP_TIMEOUT_MS, remoteTempFile);

            switch (result.type) {
              case 'success':
                {
                  let serverInfo = null;
                  try {
                    serverInfo = JSON.parse(result.data.toString());
                  } catch (e) {
                    _this2._error('Malformed server start information', SshHandshake.ErrorType.SERVER_START_FAILED, new Error(result.data));
                    return resolve(false);
                  }

                  if (!serverInfo.success) {
                    _this2._error('Remote server failed to start', SshHandshake.ErrorType.SERVER_START_FAILED, new Error(serverInfo.logs));
                    return resolve(false);
                  }

                  if (!serverInfo.workspace) {
                    _this2._error('Could not find directory', SshHandshake.ErrorType.DIRECTORY_NOT_FOUND, new Error(serverInfo.logs));
                    return resolve(false);
                  }

                  // Update server info that is needed for setting up client.
                  _this2._updateServerInfo(serverInfo);
                  return resolve(true);
                }

              case 'timeout':
                _this2._error('Failed to start sftp connection', SshHandshake.ErrorType.SFTP_TIMEOUT, new Error());
                _this2._connection.end();
                return resolve(false);

              case 'fail-to-start-connection':
                _this2._error('Failed to start sftp connection', SshHandshake.ErrorType.SERVER_START_FAILED, result.error);
                return resolve(false);

              case 'fail-to-transfer-data':
                _this2._error('Failed to transfer server start information', SshHandshake.ErrorType.SERVER_START_FAILED, result.error);
                return resolve(false);

              default:
                result;
            }
          });

          return function (_x, _x2) {
            return _ref.apply(this, arguments);
          };
        })()).on('data', data => {
          stdOut += data;
        });
      });
    });
  }

  _onConnect() {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (!(yield _this3._startRemoteServer())) {
        return;
      }

      const connect = (() => {
        var _ref2 = (0, _asyncToGenerator.default)(function* (config) {
          let connection = null;
          try {
            connection = yield (_RemoteConnection || _load_RemoteConnection()).RemoteConnection.findOrCreate(config);
          } catch (e) {
            _this3._error('Connection check failed', e.code === 'CERT_NOT_YET_VALID' ? SshHandshake.ErrorType.CERT_NOT_YET_VALID : SshHandshake.ErrorType.SERVER_CANNOT_CONNECT, e);
          }
          if (connection != null) {
            _this3._didConnect(connection);
            // If we are secure then we don't need the ssh tunnel.
            if (_this3._isSecure()) {
              _this3._connection.end();
            }
          }
        });

        return function connect(_x3) {
          return _ref2.apply(this, arguments);
        };
      })();

      // Use an ssh tunnel if server is not secure
      if (_this3._isSecure()) {
        // flowlint-next-line sketchy-null-string:off
        if (!_this3._remoteHost) {
          throw new Error('Invariant violation: "this._remoteHost"');
        }

        connect({
          host: _this3._remoteHost,
          port: _this3._remotePort,
          family: _this3._config.family,
          cwd: _this3._config.cwd,
          certificateAuthorityCertificate: _this3._certificateAuthorityCertificate,
          clientCertificate: _this3._clientCertificate,
          clientKey: _this3._clientKey,
          displayTitle: _this3._config.displayTitle
        });
      } else {
        _this3._forwardingServer = _net.default.createServer(function (sock) {
          _this3._forwardSocket(sock);
        })
        // $FlowFixMe
        .listen(0, 'localhost', function () {
          const localPort = _this3._getLocalPort();
          // flowlint-next-line sketchy-null-number:off

          if (!localPort) {
            throw new Error('Invariant violation: "localPort"');
          }

          connect({
            host: 'localhost',
            port: localPort,
            family: _this3._config.family,
            cwd: _this3._config.cwd,
            displayTitle: _this3._config.displayTitle
          });
        });
      }
    })();
  }

  _getLocalPort() {
    return this._forwardingServer ? this._forwardingServer.address().port : null;
  }

  getConfig() {
    return this._config;
  }
}

exports.SshHandshake = SshHandshake;
SshHandshake.ErrorType = ErrorType;
SshHandshake.SupportedMethods = SupportedMethods;
function decorateSshConnectionDelegateWithTracking(delegate) {
  let connectionTracker;

  return {
    onKeyboardInteractive: (name, instructions, instructionsLang, prompts, finish) => {
      if (!connectionTracker) {
        throw new Error('Invariant violation: "connectionTracker"');
      }

      connectionTracker.trackPromptYubikeyInput();
      delegate.onKeyboardInteractive(name, instructions, instructionsLang, prompts, answers => {
        if (!connectionTracker) {
          throw new Error('Invariant violation: "connectionTracker"');
        }

        connectionTracker.trackFinishYubikeyInput();
        finish(answers);
      });
    },
    onWillConnect: config => {
      connectionTracker = new (_ConnectionTracker || _load_ConnectionTracker()).default(config);
      delegate.onWillConnect(config);
    },
    onDidConnect: (connection, config) => {
      if (!connectionTracker) {
        throw new Error('Invariant violation: "connectionTracker"');
      }

      connectionTracker.trackSuccess();
      delegate.onDidConnect(connection, config);
    },
    onError: (errorType, error, config) => {
      if (!connectionTracker) {
        throw new Error('Invariant violation: "connectionTracker"');
      }

      connectionTracker.trackFailure(errorType, error);
      delegate.onError(errorType, error, config);
    }
  };
}