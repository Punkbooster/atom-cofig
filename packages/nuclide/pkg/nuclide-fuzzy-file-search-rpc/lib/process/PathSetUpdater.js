'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _event;

function _load_event() {
  return _event = require('nuclide-commons/event');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _hgUtils;

function _load_hgUtils() {
  return _hgUtils = require('../../../nuclide-hg-rpc/lib/hg-utils');
}

var _nuclideWatchmanHelpers;

function _load_nuclideWatchmanHelpers() {
  return _nuclideWatchmanHelpers = require('nuclide-watchman-helpers');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO: This probably won't work on Windows, but we'll worry about that
// when Watchman officially supports Windows.
const S_IFDIR = 16384; /**
                        * Copyright (c) 2015-present, Facebook, Inc.
                        * All rights reserved.
                        *
                        * This source code is licensed under the license found in the LICENSE file in
                        * the root directory of this source tree.
                        *
                        * 
                        * @format
                        */

const WATCHMAN_SUBSCRIPTION_BUFFER_TIME = 3000;
const CONCURRENT_HG_STATUS = 2;
const HG_STATUS_TIMEOUT = 10000;
const HG_STATUS_FILE_CAP = 1000;

/**
 * This class keeps the PathSets passed to it up to date by using file system
 * watchers to observe when relevant file additions and deletions occur.
 * This class currently relies on the Nuclide WatchmanClient, which requires fb-watchman.
 */
// TODO (t7298196) Investigate falling back to Node watchers.
class PathSetUpdater {

  constructor() {
    this._pathSetToSubscription = new Map();
  }

  dispose() {
    if (this._watchmanClient) {
      this._watchmanClient.dispose();
    }
  }

  // Section: Add/Remove PathSets

  /**
   * @param pathSet The PathSet to keep updated.
   * @param localDirectory The directory for which we are interested in file
   * changes. This is likely to the be the same as the directory the PathSet
   * was created from.
   * @return Disposable that can be disposed to stop updating the PathSet.
   */
  startUpdatingPathSet(pathSet, localDirectory) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const isHgRepo = (yield (_fsPromise || _load_fsPromise()).default.findNearestFile('.hg', localDirectory)) != null;
      const subscription = yield _this._addWatchmanSubscription(localDirectory);
      _this._pathSetToSubscription.set(pathSet, subscription);

      const changeSubscription = (0, (_event || _load_event()).observableFromSubscribeFunction)(function (callback) {
        return subscription.on('change', callback);
      }).bufferTime(WATCHMAN_SUBSCRIPTION_BUFFER_TIME).mergeMap(function (bufferedFiles) {
        return _this._flattenBufferedChanges(bufferedFiles);
      }).mergeMap(function (files) {
        return isHgRepo ? _this._filterIgnoredFiles(localDirectory, files) : _rxjsBundlesRxMinJs.Observable.of(files);
      }, CONCURRENT_HG_STATUS).subscribe(function (files) {
        return _this._processWatchmanUpdate(subscription.pathFromSubscriptionRootToSubscriptionPath, pathSet, files);
      });
      return new (_UniversalDisposable || _load_UniversalDisposable()).default(changeSubscription, function () {
        return _this._stopUpdatingPathSet(pathSet);
      });
    })();
  }

  _stopUpdatingPathSet(pathSet) {
    const subscription = this._pathSetToSubscription.get(pathSet);
    if (subscription) {
      this._pathSetToSubscription.delete(pathSet);
      this._removeWatchmanSubscription(subscription);
    }
  }

  // Section: Watchman Subscriptions

  _setupWatcherService() {
    if (this._watchmanClient) {
      return;
    }
    this._watchmanClient = new (_nuclideWatchmanHelpers || _load_nuclideWatchmanHelpers()).WatchmanClient();
  }

  _addWatchmanSubscription(localDirectory) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (!_this2._watchmanClient) {
        _this2._setupWatcherService();
      }

      if (!_this2._watchmanClient) {
        throw new Error('Invariant violation: "this._watchmanClient"');
      }

      return _this2._watchmanClient.watchDirectoryRecursive(localDirectory);
    })();
  }

  _removeWatchmanSubscription(subscription) {
    if (!this._watchmanClient) {
      return;
    }
    this._watchmanClient.unwatch(subscription.path);
  }

  // Section: PathSet Updating

  /**
   * Adds or removes paths from the pathSet based on the files in the update.
   * This method assumes the pathSet should be populated with file paths that
   * are *RELATIVE* to the localDirectory passed into PathSetUpdater::startUpdatingPathSet.
   * @param pathFromSubscriptionRootToDir The path from the watched
   *   root directory (what watchman actually watches) to the directory of interest
   *   (i.e. the localDirectory passed to PathSetUpdater::startUpdatingPathSet).
   *   For example, this string should be '' if those are the same.
   * @param pathSet The PathSet that should be updated by this watchman update.
   * @param files The `files` field of an fb-watchman update. Each file in the
   *   update is expected to contain fields for `name`, `new`, and `exists`.
   */
  _processWatchmanUpdate(pathFromSubscriptionRootToDir, pathSet, files) {
    const newPaths = [];
    const deletedPaths = [];

    files.forEach(file => {
      // Only keep track of files.
      // eslint-disable-next-line no-bitwise
      if ((file.mode & S_IFDIR) !== 0) {
        return;
      }
      if (!file.exists) {
        deletedPaths.push(file.name);
      } else if (file.new) {
        newPaths.push(file.name);
      }
    });

    if (newPaths.length) {
      pathSet.addPaths(newPaths);
    }
    if (deletedPaths.length) {
      pathSet.removePaths(deletedPaths);
    }
  }

  // Section: Buffering FileChanges

  /**
   * Flattens the array of array of FileChanges to a single array. Changes are
   * deduped and only the most recent change will be considered.
   * @param bufferedFiles Buffered FileChanges.
   * @return Flattened and deduped FileChanges.
   */
  _flattenBufferedChanges(bufferedFiles) {
    const filesMap = new Map();
    bufferedFiles.forEach(files => {
      files.forEach(file => {
        filesMap.set(file.name, file);
      });
    });
    return _rxjsBundlesRxMinJs.Observable.of(Array.from(filesMap.values()));
  }

  // Section: Filtering Ignored Files

  /**
   * New changes have the possibility of being ignored by hg, so they are
   * filtered out by running hg status -i.
   * @param directory Directory to passed into cwd flag for hg.
   * @param changes FileChanges to be filtered
   * @return Filtered FileChanges. Upon error, original changes are returned.
   */
  _filterIgnoredFiles(directory, changes) {
    // Filter out hg internals because hg status will trigger changes in .hg/,
    // which will result in infinite loop.

    // Divide changes into new changes and deleted changes
    const newChanges = [];
    const deletedChanges = [];
    changes.forEach(change => change.new ? newChanges.push(change) : deletedChanges.push(change));

    // Filter out hg internals because hg status will trigger changes in .hg/,
    // which will result in infinite loop.
    const realNewChanges = newChanges.filter(change => !(_nuclideUri || _load_nuclideUri()).default.contains('.hg', change.name));

    // Calling status -i without args takes forever and isn't productive.
    // Also, just give up on calling hg if there are too many files changed.
    if (realNewChanges.length === 0 || realNewChanges.length > HG_STATUS_FILE_CAP) {
      return new _rxjsBundlesRxMinJs.Observable.of(changes);
    }

    let args = ['status', '-i', '-Tjson'];
    const execOptions = {
      cwd: directory
    };

    args = args.concat(realNewChanges.map(change => change.name));
    return (0, (_hgUtils || _load_hgUtils()).hgRunCommand)(args, execOptions).map(stdout => {
      const ignoredFiles = new Set();
      const statuses = JSON.parse(stdout);
      for (const status of statuses) {
        ignoredFiles.add(status.path);
      }

      // Return filtered new changes along with all deleted changes.
      return realNewChanges.filter(change => !ignoredFiles.has(change.name)).concat(deletedChanges);
    }).timeout(HG_STATUS_TIMEOUT).catch(() => _rxjsBundlesRxMinJs.Observable.of(changes));
  }
}
exports.default = PathSetUpdater;