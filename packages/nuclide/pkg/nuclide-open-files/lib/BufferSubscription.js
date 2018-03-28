'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BufferSubscription = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _semver;

function _load_semver() {
  return _semver = _interopRequireDefault(require('semver'));
}

var _nuclideOpenFilesRpc;

function _load_nuclideOpenFilesRpc() {
  return _nuclideOpenFilesRpc = require('../../nuclide-open-files-rpc');
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

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-open-files');

const RESYNC_TIMEOUT_MS = 2000;

const ATOM_VERSION_CHECK_FOR_LANGUAGE_ID = '1.24.0-beta0';

// Watches a TextBuffer for change/rename/destroy events and then sends
// those events to the FileNotifier or NotifiersByConnection as appropriate.
//
// change/rename events go to the FileNotifier.
// If sending a change/rename throws, that is an indication that we are out of
// sync with the server side, so send a 'sync' message.
//
// close events have a different error recovery policy so they go to the main
// NotifiersByConnection. The close message must be sent even if the buffer is
// renamed or destroyed, so rather than keep the per-buffer info around after
// a buffer is destroyed, the outstanding close messages are kept with the
// per-connection info in NotifiersByConnection.
class BufferSubscription {

  constructor(notifiers, buffer) {
    var _this = this;

    this._notifiers = notifiers;
    this._buffer = buffer;
    this._notifier = null;
    this._serverVersion = -1;
    this._lastAttemptedSync = -1;
    this._changeCount = 1;
    this._sentOpen = false;

    const subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();

    subscriptions.add(buffer.onDidChangeText((() => {
      var _ref = (0, _asyncToGenerator.default)(function* (event) {
        // It's important that we increment the change count *before* waiting on the notifier.
        // This makes sure that any users who use `getVersion` in between obtain the correct version.
        _this._changeCount += event.changes.length;
        if (_this._notifier == null) {
          return;
        }

        // Must inspect the buffer before awaiting on the notifier
        // to avoid race conditions
        const filePath = _this._buffer.getPath();

        if (!(filePath != null)) {
          throw new Error('Invariant violation: "filePath != null"');
        }

        const version = _this._changeCount;

        if (!(_this._notifier != null)) {
          throw new Error('Invariant violation: "this._notifier != null"');
        }

        const notifier = yield _this._notifier;
        if (_this._sentOpen) {
          // Changes must be sent in reverse order to ensure that they are applied cleanly.
          // (Atom ensures that they are sent over in increasing lexicographic order).
          for (let i = event.changes.length - 1; i >= 0; i--) {
            const edit = event.changes[i];
            _this.sendEvent({
              kind: (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).FileEventKind.EDIT,
              fileVersion: {
                notifier,
                filePath,
                version: version - i
              },
              oldRange: edit.oldRange,
              newRange: edit.newRange,
              oldText: edit.oldText,
              newText: edit.newText
            });
          }
        } else {
          _this._sendOpenByNotifier(notifier, version);
        }
      });

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    })()));

    subscriptions.add(buffer.onDidSave((0, _asyncToGenerator.default)(function* () {
      if (_this._notifier == null) {
        return;
      }

      const filePath = _this._buffer.getPath();

      if (!(filePath != null)) {
        throw new Error('Invariant violation: "filePath != null"');
      }

      if (!(_this._notifier != null)) {
        throw new Error('Invariant violation: "this._notifier != null"');
      }

      const notifier = yield _this._notifier;
      const version = _this._changeCount;
      if (_this._sentOpen) {
        _this.sendEvent({
          kind: (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).FileEventKind.SAVE,
          fileVersion: {
            notifier,
            filePath,
            version
          }
        });
      } else {
        _this._sendOpenByNotifier(notifier, version);
      }
    })));

    this._subscriptions = subscriptions;

    this._oldPath = this._buffer.getPath();
    this._notifier = this._notifiers.get(this._buffer);

    // This prevents the open message from sending when the file is initially empty.
    // Sadly there's no reliable 'is loaded' event from Atom.
    // TODO: Could watch onDidReload() which will catch the case where an empty file is opened
    // after startup, leaving the only failure the reopening of empty files at startup.
    if (this._buffer.getText() !== '' && this._notifier != null) {
      this._notifier.then(notifier => this._sendOpenByNotifier(notifier, this._changeCount));
    }
  }

  _sendOpenByNotifier(notifier, version) {
    const filePath = this._buffer.getPath();

    if (!(filePath != null)) {
      throw new Error('Invariant violation: "filePath != null"');
    }

    const contents = this._buffer.getText();
    const languageId = this._getLanguageId(filePath, contents);
    this._sentOpen = true;
    this.sendEvent({
      kind: (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).FileEventKind.OPEN,
      fileVersion: {
        notifier,
        filePath,
        version
      },
      contents,
      languageId
    });
  }

  /** TODO(hansonw): remove version check after Atom 1.24 drops. */
  _getLanguageId(filePath, contents) {
    if ((_semver || _load_semver()).default.gte(atom.getVersion(), ATOM_VERSION_CHECK_FOR_LANGUAGE_ID)) {
      return this._buffer.getLanguageMode().getLanguageId();
    }

    return atom.grammars.selectGrammar(filePath, contents).scopeName;
  }

  getVersion() {
    return this._changeCount;
  }

  sendEvent(event) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (!(event.kind !== (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).FileEventKind.SYNC)) {
        throw new Error('Invariant violation: "event.kind !== FileEventKind.SYNC"');
      }

      try {
        yield event.fileVersion.notifier.onFileEvent(event);
        _this2.updateServerVersion(event.fileVersion.version);
      } catch (e) {
        logger.error(`Error sending file event: ${eventToString(event)}`, e);

        if (event.fileVersion.filePath === _this2._buffer.getPath()) {
          logger.error('Attempting file resync');
          _this2.attemptResync();
        } else {
          logger.error('File renamed, so no resync attempted');
        }
      }
    })();
  }

  updateServerVersion(sentVersion) {
    this._serverVersion = Math.max(this._serverVersion, sentVersion);
    this._lastAttemptedSync = Math.max(this._lastAttemptedSync, sentVersion);
  }

  // Something went awry in our synchronization protocol
  // Attempt a reset with a 'sync' event.
  attemptResync() {
    var _this3 = this;

    // always attempt to resync to the latest version
    const resyncVersion = this._changeCount;
    const filePath = this._buffer.getPath();

    // don't send a resync if another edit has already succeeded at this version
    // or an attempt to sync at this version is already underway
    if (resyncVersion > this._lastAttemptedSync) {
      logger.error('At most recent edit, attempting file resync');
      this._lastAttemptedSync = resyncVersion;

      const sendResync = (() => {
        var _ref3 = (0, _asyncToGenerator.default)(function* () {
          if (_this3._notifier == null) {
            logger.error('Resync preempted by remote connection closed');
            return;
          }

          if (!(filePath != null)) {
            throw new Error('Invariant violation: "filePath != null"');
          }

          const notifier = yield _this3._notifier;
          if (_this3._buffer.isDestroyed()) {
            logger.error('Resync preempted by later event');
          } else if (filePath !== _this3._buffer.getPath()) {
            logger.error('Resync preempted by file rename');
          } else if (resyncVersion !== _this3._lastAttemptedSync) {
            logger.error('Resync preempted by later resync');
          } else if (resyncVersion !== _this3._changeCount) {
            logger.error('Resync preempted by later edit');
          } else {
            const contents = _this3._buffer.getText();
            const languageId = _this3._getLanguageId(filePath, contents);

            const syncEvent = {
              kind: (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).FileEventKind.SYNC,
              fileVersion: {
                notifier,
                filePath,
                version: resyncVersion
              },
              contents,
              languageId
            };
            try {
              yield notifier.onFileEvent(syncEvent);
              _this3.updateServerVersion(resyncVersion);

              logger.error(`Successful resync event: ${eventToString(syncEvent)}`);
            } catch (syncError) {
              logger.error(`Error sending file sync event: ${eventToString(syncEvent)}`, syncError);

              // continue trying until either the file is closed,
              // or a resync to a later edit is attempted
              // or the resync succeeds
              setTimeout(sendResync, RESYNC_TIMEOUT_MS);
            }
          }
        });

        return function sendResync() {
          return _ref3.apply(this, arguments);
        };
      })();

      sendResync();
    } else {
      logger.error('Resync aborted by more recent edit');
    }
  }

  sendClose() {
    // Use different retry policy for close messages.
    if (this._oldPath != null) {
      this._notifiers.sendClose(this._oldPath, this._changeCount);
    }
  }

  dispose() {
    this.sendClose();
    this._notifier = null;
    this._subscriptions.dispose();
  }
}

exports.BufferSubscription = BufferSubscription;
function eventToString(event) {
  const jsonable = Object.assign({}, event);
  jsonable.fileVersion = Object.assign({}, event.fileVersion);
  jsonable.fileVersion.notifier = null;
  return JSON.stringify(jsonable);
}