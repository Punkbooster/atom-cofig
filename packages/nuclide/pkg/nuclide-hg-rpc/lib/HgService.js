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
exports.HgService = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getForkBaseName = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (directoryPath) {
    const arcConfig = yield (0, (_nuclideArcanistRpc || _load_nuclideArcanistRpc()).readArcConfig)(directoryPath);
    if (arcConfig != null) {
      return arcConfig['arc.feature.start.default'] || arcConfig['arc.land.onto.default'] || DEFAULT_ARC_PROJECT_FORK_BASE;
    }
    return DEFAULT_FORK_BASE_NAME;
  });

  return function getForkBaseName(_x) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * @return Array of additional watch expressions to apply to the primary
 *   watchman subscription.
 */


var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _nuclideWatchmanHelpers;

function _load_nuclideWatchmanHelpers() {
  return _nuclideWatchmanHelpers = require('../../nuclide-watchman-helpers');
}

var _fs = _interopRequireDefault(require('fs'));

var _hgConstants;

function _load_hgConstants() {
  return _hgConstants = require('./hg-constants');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _hgBlameOutputParser;

function _load_hgBlameOutputParser() {
  return _hgBlameOutputParser = require('./hg-blame-output-parser');
}

var _hgDiffOutputParser;

function _load_hgDiffOutputParser() {
  return _hgDiffOutputParser = require('./hg-diff-output-parser');
}

var _hgRevisionExpressionHelpers;

function _load_hgRevisionExpressionHelpers() {
  return _hgRevisionExpressionHelpers = require('./hg-revision-expression-helpers');
}

var _hgRevisionStateHelpers;

function _load_hgRevisionStateHelpers() {
  return _hgRevisionStateHelpers = require('./hg-revision-state-helpers');
}

var _hgUtils;

function _load_hgUtils() {
  return _hgUtils = require('./hg-utils');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

var _debounce;

function _load_debounce() {
  return _debounce = _interopRequireDefault(require('../../commons-node/debounce'));
}

var _hgBookmarkHelpers;

function _load_hgBookmarkHelpers() {
  return _hgBookmarkHelpers = require('./hg-bookmark-helpers');
}

var _nuclideArcanistRpc;

function _load_nuclideArcanistRpc() {
  return _nuclideArcanistRpc = require('../../nuclide-arcanist-rpc');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();
const DEFAULT_ARC_PROJECT_FORK_BASE = 'remote/master';
const DEFAULT_FORK_BASE_NAME = 'default';

const WATCHMAN_SUBSCRIPTION_NAME_PRIMARY = 'hg-repository-watchman-subscription-primary';
const WATCHMAN_SUBSCRIPTION_NAME_HGBOOKMARK = 'hg-repository-watchman-subscription-hgbookmark';
const WATCHMAN_SUBSCRIPTION_NAME_HGBOOKMARKS = 'hg-repository-watchman-subscription-hgbookmarks';
const WATCHMAN_HG_DIR_STATE = 'hg-repository-watchman-subscription-dirstate';
const WATCHMAN_SUBSCRIPTION_NAME_CONFLICTS = 'hg-repository-watchman-subscription-conflicts';

const CHECK_CONFLICT_DELAY_MS = 2000;

// If Watchman reports that many files have changed, it's not really useful to report this.
// This is typically caused by a large rebase or a Watchman re-crawl.
// We'll just report that the repository state changed, which should trigger a full client refresh.
const FILES_CHANGED_LIMIT = 1000;

// Suffixes of hg error messages that indicate that an error is safe to ignore,
// and should not warrant a user-visible error. These generally happen
// when performing an hg operation on a non-existent or untracked file.
const IGNORABLE_ERROR_SUFFIXES = ['abort: no files to copy', 'No such file or directory', 'does not exist!'];

/**
 * These are status codes used by Mercurial's output.
 * Documented in http://selenic.com/hg/help/status.
 */


/**
 * Internally, the HgRepository uses the string StatusCodeId to do bookkeeping.
 * However, GitRepository uses numbers to represent its statuses, and returns
 * statuses as numbers. In order to keep our status 'types' the same, we map the
 * string StatusCodeId to numbers.
 * The numbers themselves should not matter; they are meant to be passed
 * to ::isStatusNew/::isStatusModified to be interpreted.
 */
function getPrimaryWatchmanSubscriptionRefinements() {
  let refinements = [];
  try {
    // $FlowFB
    refinements = require('./fb/config').primaryWatchSubscriptionRefinements;
  } catch (e) {
    // purposely blank
  }
  return refinements;
}

class HgService {

  constructor(workingDirectory) {
    this._workingDirectory = workingDirectory;
    this._filesDidChangeObserver = new _rxjsBundlesRxMinJs.Subject();
    this._hgActiveBookmarkDidChangeObserver = new _rxjsBundlesRxMinJs.Subject();
    this._hgBookmarksDidChangeObserver = new _rxjsBundlesRxMinJs.Subject();
    this._hgRepoStateDidChangeObserver = new _rxjsBundlesRxMinJs.Subject();
    this._hgConflictStateDidChangeObserver = new _rxjsBundlesRxMinJs.Subject();
    this._hgRepoCommitsDidChangeObserver = new _rxjsBundlesRxMinJs.Subject();
    this._isInConflict = false;
    this._debouncedCheckConflictChange = (0, (_debounce || _load_debounce()).default)(() => {
      this._checkConflictChange();
    }, CHECK_CONFLICT_DELAY_MS);
    this._watchmanSubscriptionPromise = this._subscribeToWatchman();
  }

  waitForWatchmanSubscriptions() {
    return this._watchmanSubscriptionPromise;
  }

  dispose() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this._filesDidChangeObserver.complete();
      _this._hgRepoStateDidChangeObserver.complete();
      _this._hgActiveBookmarkDidChangeObserver.complete();
      _this._hgBookmarksDidChangeObserver.complete();
      _this._hgConflictStateDidChangeObserver.complete();
      if (_this._hgStoreDirWatcher != null) {
        _this._hgStoreDirWatcher.close();
        _this._hgStoreDirWatcher = null;
      }
      yield _this._cleanUpWatchman();
    })();
  }

  // Wrapper to help mocking during tests.
  _hgAsyncExecute(args, options) {
    return (0, (_hgUtils || _load_hgUtils()).hgAsyncExecute)(args, options);
  }

  _hgObserveExecution(args, options) {
    return (0, (_hgUtils || _load_hgUtils()).hgObserveExecution)(args, options);
  }

  /**
   * Section: File and Repository Status
   */

  /**
   * Shells out of the `hg status` to get the statuses of the paths.
   */
  fetchStatuses() {
    const execOptions = {
      cwd: this._workingDirectory
    };
    const args = ['status', '-Tjson'];

    return (0, (_hgUtils || _load_hgUtils()).hgRunCommand)(args, execOptions).map(stdout => {
      const statusMap = new Map();
      const statuses = JSON.parse(stdout);
      for (const status of statuses) {
        statusMap.set((_nuclideUri || _load_nuclideUri()).default.join(this._workingDirectory, status.path), status.status);
      }
      return statusMap;
    }).publish();
  }

  _subscribeToWatchman() {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // Using a local variable here to allow better type refinement.
      const watchmanClient = new (_nuclideWatchmanHelpers || _load_nuclideWatchmanHelpers()).WatchmanClient();
      _this2._watchmanClient = watchmanClient;
      const workingDirectory = _this2._workingDirectory;

      let primarySubscriptionExpression = ['allof', ['not', ['dirname', '.hg']],
      // Hg appears to modify temporary files that begin with these
      // prefixes, every time a file is saved.
      // TODO (t7832809) Remove this when it is unnecessary.
      ['not', ['match', 'hg-checkexec-*', 'wholename']], ['not', ['match', 'hg-checklink-*', 'wholename']],
      // This watchman subscription is used to determine when and which
      // files to fetch new statuses for. There is no reason to include
      // directories in these updates, and in fact they may make us overfetch
      // statuses. (See diff summary of D2021498.)
      // This line restricts this subscription to only return files.
      ['type', 'f']];
      primarySubscriptionExpression = primarySubscriptionExpression.concat(getPrimaryWatchmanSubscriptionRefinements());

      // Subscribe to changes to files unrelated to source control.
      const primarySubscribtion = yield watchmanClient.watchDirectoryRecursive(workingDirectory, WATCHMAN_SUBSCRIPTION_NAME_PRIMARY, {
        fields: ['name', 'exists', 'new'],
        expression: primarySubscriptionExpression,
        defer: ['hg.update']
      });
      logger.debug(`Watchman subscription ${ WATCHMAN_SUBSCRIPTION_NAME_PRIMARY } established.`);

      // Subscribe to changes to files unrelated to source control.
      const conflictStateSubscribtion = yield watchmanClient.watchDirectoryRecursive(workingDirectory, WATCHMAN_SUBSCRIPTION_NAME_CONFLICTS, {
        fields: ['name', 'exists', 'new'],
        expression: ['name', '.hg/merge', 'wholename'],
        defer: ['hg.update']
      });
      logger.debug(`Watchman subscription ${ WATCHMAN_SUBSCRIPTION_NAME_CONFLICTS } established.`);

      // Subscribe to changes to the active Mercurial bookmark.
      const hgActiveBookmarkSubscription = yield watchmanClient.watchDirectoryRecursive(workingDirectory, WATCHMAN_SUBSCRIPTION_NAME_HGBOOKMARK, {
        fields: ['name', 'exists'],
        expression: ['name', '.hg/bookmarks.current', 'wholename'],
        defer: ['hg.update']
      });
      logger.debug(`Watchman subscription ${ WATCHMAN_SUBSCRIPTION_NAME_HGBOOKMARK } established.`);

      // Subscribe to changes in Mercurial bookmarks.
      const hgBookmarksSubscription = yield watchmanClient.watchDirectoryRecursive(workingDirectory, WATCHMAN_SUBSCRIPTION_NAME_HGBOOKMARKS, {
        fields: ['name', 'exists'],
        expression: ['name', '.hg/bookmarks', 'wholename'],
        defer: ['hg.update']
      });
      logger.debug(`Watchman subscription ${ WATCHMAN_SUBSCRIPTION_NAME_HGBOOKMARKS } established.`);

      const dirStateSubscribtion = yield watchmanClient.watchDirectoryRecursive(workingDirectory, WATCHMAN_HG_DIR_STATE, {
        fields: ['name'],
        expression: ['name', '.hg/dirstate', 'wholename'],
        defer: ['hg.update']
      });
      logger.debug(`Watchman subscription ${ WATCHMAN_HG_DIR_STATE } established.`);

      // Those files' changes indicate a commit-changing action has been applied to the repository,
      // Watchman currently (v4.7) ignores `.hg/store` file updates.
      // Hence, we here use node's filesystem watchers instead.
      const hgStoreDirectory = (_nuclideUri || _load_nuclideUri()).default.join(workingDirectory, '.hg', 'store');
      const commitChangeIndicators = ['00changelog.i', 'obsstore', 'inhibit'];
      try {
        _this2._hgStoreDirWatcher = _fs.default.watch(hgStoreDirectory, function (event, fileName) {
          if (commitChangeIndicators.indexOf(fileName) === -1) {
            _this2._commitsDidChange();
          }
        });
        (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().debug('Node watcher created for .hg/store.');
      } catch (error) {
        (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('Error when creating node watcher for hg store', error);
      }

      primarySubscribtion.on('change', _this2._filesDidChange.bind(_this2));
      hgActiveBookmarkSubscription.on('change', _this2._hgActiveBookmarkDidChange.bind(_this2));
      hgBookmarksSubscription.on('change', _this2._hgBookmarksDidChange.bind(_this2));
      dirStateSubscribtion.on('change', _this2._emitHgRepoStateChanged.bind(_this2));
      conflictStateSubscribtion.on('change', _this2._debouncedCheckConflictChange);
    })();
  }

  _cleanUpWatchman() {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this3._watchmanClient != null) {
        yield _this3._watchmanClient.dispose();
        _this3._watchmanClient = null;
      }
    })();
  }

  /**
   * @param fileChanges The latest changed watchman files.
   */
  _filesDidChange(fileChanges) {
    if (fileChanges.length > FILES_CHANGED_LIMIT) {
      this._emitHgRepoStateChanged();
      return;
    }

    const workingDirectory = this._workingDirectory;
    const changedFiles = fileChanges.map(change => (_nuclideUri || _load_nuclideUri()).default.join(workingDirectory, change.name));
    this._filesDidChangeObserver.next(changedFiles);
  }

  _commitsDidChange() {
    this._hgRepoCommitsDidChangeObserver.next();
  }

  _checkMergeDirectoryExists() {
    return (_fsPromise || _load_fsPromise()).default.exists((_nuclideUri || _load_nuclideUri()).default.join(this._workingDirectory, '.hg', 'merge'));
  }

  _checkConflictChange() {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const mergeDirectoryExists = yield _this4._checkMergeDirectoryExists();
      if (_this4._isInConflict) {
        if (!mergeDirectoryExists) {
          _this4._isInConflict = false;
          _this4._hgConflictStateDidChangeObserver.next(false);
        }
        return;
      } else if (mergeDirectoryExists) {
        // Detect if the repository is in a conflict state.
        const mergeConflicts = yield _this4.fetchMergeConflicts();
        if (mergeConflicts.length > 0) {
          _this4._isInConflict = true;
          _this4._hgConflictStateDidChangeObserver.next(true);
        }
      }
    })();
  }

  _emitHgRepoStateChanged() {
    this._hgRepoStateDidChangeObserver.next();
  }

  _hgActiveBookmarkDidChange() {
    this._hgActiveBookmarkDidChangeObserver.next();
  }

  _hgBookmarksDidChange() {
    this._hgBookmarksDidChangeObserver.next();
  }

  /**
   * Observes one of more files has changed. Applies to all files except
   * .hgignore files. (See ::onHgIgnoreFileDidChange.)
   * @return A Observable which emits the changed file paths.
   */
  observeFilesDidChange() {
    return this._filesDidChangeObserver.publish();
  }

  /**
   * Observes that a Mercurial repository commits state have changed
   * (e.g. commit, amend, histedit, strip, rebase) that would require refetching from the service.
   */
  observeHgCommitsDidChange() {
    return this._hgRepoCommitsDidChangeObserver.publish();
  }

  /**
   * Observes that a Mercurial event has occurred (e.g. histedit) that would
   * potentially invalidate any data cached from responses from this service.
   */
  observeHgRepoStateDidChange() {
    return this._hgRepoStateDidChangeObserver.publish();
  }

  /**
   * Observes when a Mercurial repository enters and exits a rebase state.
   */
  observeHgConflictStateDidChange() {
    this._checkConflictChange();
    return this._hgConflictStateDidChangeObserver.publish();
  }

  /**
   * Shells out to `hg diff` to retrieve line diff information for the paths.
   * @param An Array of NuclideUri (absolute paths) for which to fetch diff info.
   * @return A map of each NuclideUri (absolute path) to its DiffInfo.
   *   Each path is presumed to be in the repo.
   *   If the `hg diff` call fails, this method returns null.
   *   If a path has no changes, it will not appear in the returned Map.
   */
  fetchDiffInfo(filePaths) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // '--unified 0' gives us 0 lines of context around each change (we don't
      // care about the context).
      // '--noprefix' omits the a/ and b/ prefixes from filenames.
      // '--nodates' avoids appending dates to the file path line.
      const args = ['diff', '--unified', '0', '--noprefix', '--nodates'].concat(filePaths);
      const options = {
        cwd: _this5._workingDirectory
      };
      let output;
      try {
        output = yield _this5._hgAsyncExecute(args, options);
      } catch (e) {
        (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error(`Error when running hg diff for paths: ${ filePaths.toString() } \n\tError: ${ e.stderr }`);
        return null;
      }
      const pathToDiffInfo = (0, (_hgDiffOutputParser || _load_hgDiffOutputParser()).parseMultiFileHgDiffUnifiedOutput)(output.stdout);
      const absolutePathToDiffInfo = new Map();
      for (const [filePath, diffInfo] of pathToDiffInfo) {
        absolutePathToDiffInfo.set((_nuclideUri || _load_nuclideUri()).default.join(_this5._workingDirectory, filePath), diffInfo);
      }
      return absolutePathToDiffInfo;
    })();
  }

  /**
   * Section: Bookmarks
   */

  createBookmark(name, revision) {
    const args = [];
    if (revision) {
      args.push('--rev', revision);
    }
    args.push(name);

    return this._runSimpleInWorkingDirectory('bookmark', args);
  }

  deleteBookmark(name) {
    return this._runSimpleInWorkingDirectory('bookmarks', ['--delete', name]);
  }

  renameBookmark(name, nextName) {
    return this._runSimpleInWorkingDirectory('bookmarks', ['--rename', name, nextName]);
  }

  /**
   * @return The name of the current bookmark.
   */
  fetchActiveBookmark() {
    return (0, (_hgBookmarkHelpers || _load_hgBookmarkHelpers()).fetchActiveBookmark)((_nuclideUri || _load_nuclideUri()).default.join(this._workingDirectory, '.hg'));
  }

  /**
   * @return An Array of bookmarks for this repository.
   */
  fetchBookmarks() {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const args = ['bookmarks', '-Tjson'];
      const execOptions = {
        cwd: _this6._workingDirectory
      };

      let output;
      try {
        output = yield _this6._hgAsyncExecute(args, execOptions);
      } catch (e) {
        (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error(`LocalHgServiceBase failed to fetch bookmarks. Error: ${ e.stderr }`);
        throw e;
      }

      return JSON.parse(output.stdout);
    })();
  }

  /**
   * Observes that the active Mercurial bookmark has changed.
   */
  observeActiveBookmarkDidChange() {
    return this._hgActiveBookmarkDidChangeObserver.publish();
  }

  /**
   * Observes that Mercurial bookmarks have changed.
   */
  observeBookmarksDidChange() {
    return this._hgBookmarksDidChangeObserver.publish();
  }

  /**
   * Section: Repository State at Specific Revisions
   */

  /**
   * @param filePath: The full path to the file of interest.
   * @param revision: An expression that hg can understand, specifying the
   * revision at which we want to see the file content.
   */
  fetchFileContentAtRevision(filePath, revision) {
    return (0, (_hgRevisionStateHelpers || _load_hgRevisionStateHelpers()).fetchFileContentAtRevision)(filePath, revision, this._workingDirectory);
  }

  fetchFilesChangedAtRevision(revision) {
    return (0, (_hgRevisionStateHelpers || _load_hgRevisionStateHelpers()).fetchFilesChangedAtRevision)(revision, this._workingDirectory);
  }

  /**
   * Fetch the revision details between the current head and the the common ancestor
   * of head and master in the repository.
   * @return an array with the revision info (`title`, `author`, `date` and `id`)
   * or `null` if no common ancestor was found.
   */
  fetchRevisionInfoBetweenHeadAndBase() {
    var _this7 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const forkBaseName = yield getForkBaseName(_this7._workingDirectory);
      const revisionsInfo = yield (0, (_hgRevisionExpressionHelpers || _load_hgRevisionExpressionHelpers()).fetchRevisionInfoBetweenRevisions)((0, (_hgRevisionExpressionHelpers || _load_hgRevisionExpressionHelpers()).expressionForCommonAncestor)(forkBaseName), (0, (_hgRevisionExpressionHelpers || _load_hgRevisionExpressionHelpers()).expressionForRevisionsBeforeHead)(0), _this7._workingDirectory);
      return revisionsInfo;
    })();
  }

  fetchSmartlogRevisions() {
    return (0, (_hgRevisionExpressionHelpers || _load_hgRevisionExpressionHelpers()).fetchSmartlogRevisions)(this._workingDirectory);
  }

  /**
   * Resolve the revision details of the base branch
   */
  getBaseRevision() {
    var _this8 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const forkBaseName = yield getForkBaseName(_this8._workingDirectory);
      return yield (0, (_hgRevisionExpressionHelpers || _load_hgRevisionExpressionHelpers()).fetchRevisionInfo)((0, (_hgRevisionExpressionHelpers || _load_hgRevisionExpressionHelpers()).expressionForCommonAncestor)(forkBaseName), _this8._workingDirectory);
    })();
  }

  /**
   * Gets the blame for the filePath at the current revision, including uncommitted changes
   * (but not unsaved changes).
   * @param filePath The file to get blame information for.
   * @return A Map that maps a line number (0-indexed) to the name that line blames to.
   *   The name is of the form: "Firstname Lastname <username@email.com> ChangeSetID".
   *   The Firstname Lastname may not appear sometimes.
   *   If no blame information is available, returns an empty Map.
   */
  getBlameAtHead(filePath) {
    var _this9 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const args = ['blame', '-r', 'wdir()', '-Tjson', '--changeset', '--user', '--line-number', filePath];
      const execOptions = {
        cwd: _this9._workingDirectory
      };
      let output;
      try {
        output = yield _this9._hgAsyncExecute(args, execOptions);
      } catch (e) {
        (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error(`LocalHgServiceBase failed to fetch blame for file: ${ filePath }. Error: ${ e.stderr }`);
        throw e;
      }
      return (0, (_hgBlameOutputParser || _load_hgBlameOutputParser()).parseHgBlameOutput)(output.stdout);
    })();
  }

  /**
   * Returns the value of the config item at `key`.
   * @param key Name of config item
   */
  getConfigValueAsync(key) {
    var _this10 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const args = ['config', key];
      const execOptions = {
        cwd: _this10._workingDirectory
      };
      try {
        return (yield _this10._hgAsyncExecute(args, execOptions)).stdout.trim();
      } catch (e) {
        (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error(`Failed to fetch Hg config for key ${ key }.  Error: ${ e.toString() }`);
        return null;
      }
    })();
  }

  /**
   * Gets the Differential Revision id (aka DXXXXXX) id for the specified changeSetId, if it exists.
   * Otherwise, returns null.
   * This implementation relies on the "phabdiff" template being available as defined in:
   * https://bitbucket.org/facebook/hg-experimental/src/fbf23b3f96bade5986121a7c57d7400585d75f54/phabdiff.py.
   */
  getDifferentialRevisionForChangeSetId(changeSetId) {
    var _this11 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const args = ['log', '-T', '{phabdiff}\n', '--limit', '1', '--rev', changeSetId];
      const execOptions = {
        cwd: _this11._workingDirectory
      };
      try {
        const output = yield _this11._hgAsyncExecute(args, execOptions);
        const stdout = output.stdout.trim();
        return stdout ? stdout : null;
      } catch (e) {
        // This should not happen: `hg log` does not error even if it does not recognize the template.
        (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error(`Failed when trying to get differential revision for: ${ changeSetId }`);
        return null;
      }
    })();
  }

  /**
   * Get the output of the experimental smartlog extension from Mercurial:
   * https://bitbucket.org/facebook/hg-experimental/#markdown-header-smartlog.
   * @param ttyOutput If true, return the output as if stdout were attached to a tty.
   * @param concise true to run `hg smartlog`; false to run `hg ssl`.
   * @return The output from running the command.
   */
  getSmartlog(ttyOutput, concise) {
    var _this12 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // disable the pager extension so that 'hg ssl' terminates. We can't just use
      // HGPLAIN because we have not found a way to get colored output when we do.
      const args = ['--config', 'extensions.pager=!', concise ? 'ssl' : 'smartlog'];
      const execOptions = {
        cwd: _this12._workingDirectory,
        NO_HGPLAIN: concise, // `hg ssl` is likely user-defined.
        TTY_OUTPUT: ttyOutput
      };
      return yield _this12._hgAsyncExecute(args, execOptions);
    })();
  }

  _commitCode(message, args) {
    let tempFile = null;
    let editMergeConfigs;

    return _rxjsBundlesRxMinJs.Observable.fromPromise((0, _asyncToGenerator.default)(function* () {
      editMergeConfigs = yield (0, (_hgUtils || _load_hgUtils()).getEditMergeConfigs)();
      if (message == null) {
        return args;
      } else {
        tempFile = yield (0, (_hgUtils || _load_hgUtils()).createCommmitMessageTempFile)(message);
        return [...args, '-l', tempFile];
      }
    })()).switchMap(argumentsWithCommitFile => {
      if (!(editMergeConfigs != null)) {
        throw new Error('editMergeConfigs cannot be null');
      }

      const execOptions = {
        cwd: this._workingDirectory,
        HGEDITOR: editMergeConfigs.hgEditor
      };
      return this._hgObserveExecution([...editMergeConfigs.args, ...argumentsWithCommitFile], execOptions);
    }).finally(() => {
      if (tempFile != null) {
        (_fsPromise || _load_fsPromise()).default.unlink(tempFile);
      }
    });
  }

  /**
   * Commit code to version control.
   * @param message Commit message.
   */
  commit(message) {
    return this._commitCode(message, ['commit']).publish();
  }

  /**
   * Amend code changes to the latest commit.
   * @param message Commit message.  Message will remain unchaged if not provided.
   * @param amendMode Decide the amend functionality to apply.
   *  Clean to just amend.
   *  Rebase to amend and rebase the stacked diffs.
   *  Fixup to fix the stacked commits, rebasing them on top of this commit.
   */
  amend(message, amendMode) {
    const args = ['amend'];
    switch (amendMode) {
      case (_hgConstants || _load_hgConstants()).AmendMode.CLEAN:
        break;
      case (_hgConstants || _load_hgConstants()).AmendMode.REBASE:
        args.push('--rebase');
        break;
      case (_hgConstants || _load_hgConstants()).AmendMode.FIXUP:
        args.push('--fixup');
        break;
      default:
        throw new Error('Unexpected AmendMode');
    }
    return this._commitCode(message, args).publish();
  }

  revert(filePaths, toRevision) {
    const args = [...filePaths];
    if (toRevision != null) {
      args.push('--rev', toRevision);
    }
    return this._runSimpleInWorkingDirectory('revert', args);
  }

  _runSimpleInWorkingDirectory(action, args) {
    var _this13 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const options = {
        cwd: _this13._workingDirectory
      };
      const cmd = [action].concat(args);
      try {
        yield _this13._hgAsyncExecute(cmd, options);
      } catch (e) {
        const errorString = e.stderr || e.message || e.toString();
        (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('hg %s failed with [%s] arguments: %s', action, args.toString(), errorString);
        throw new Error(errorString);
      }
    })();
  }

  /**
   * @param revision This could be a changeset ID, name of a bookmark, revision number, etc.
   * @param create Currently, this parameter is ignored.
   */
  checkout(revision, create) {
    return this._runSimpleInWorkingDirectory('checkout', [revision]);
  }

  /**
   * @param revision This could be a changeset ID, name of a bookmark, revision number, etc.
   * @param create Currently, this parameter is ignored.
   */
  checkoutForkBase() {
    var _this14 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const forkBaseName = yield getForkBaseName(_this14._workingDirectory);
      yield _this14._runSimpleInWorkingDirectory('checkout', [forkBaseName]);
    })();
  }

  /*
   * Silence errors from hg calls that don't include any tracked files - these
   * are generally harmless and should not create an error notification.
   * This checks the error string in order to avoid potentially slow hg pre-checks.
   */
  _rethrowErrorIfHelpful(e) {
    if (!IGNORABLE_ERROR_SUFFIXES.some(s => e.message.endsWith(s + '\n'))) {
      throw e;
    }
  }

  /**
   * Rename/move files versioned under Hg.
   * @param filePaths Which files should be renamed/moved.
   * @param destPath What should the file be renamed/moved to.
   */
  rename(filePaths, destPath, after) {
    var _this15 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const args = [...filePaths.map(function (p) {
        return (_nuclideUri || _load_nuclideUri()).default.getPath(p);
      }), // Sources
      (_nuclideUri || _load_nuclideUri()).default.getPath(destPath)];
      if (after) {
        args.unshift('--after');
      }
      try {
        yield _this15._runSimpleInWorkingDirectory('rename', args);
      } catch (e) {
        if (after) {
          _this15._rethrowErrorIfHelpful(e);
        } else {
          throw e;
        }
      }
    })();
  }

  /**
   * Remove a file versioned under Hg.
   * @param filePath Which file should be removed.
   */
  remove(filePaths, after) {
    var _this16 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const args = ['-f', ...filePaths.map(function (p) {
        return (_nuclideUri || _load_nuclideUri()).default.getPath(p);
      })];
      if (after) {
        args.unshift('--after');
      }

      try {
        yield _this16._runSimpleInWorkingDirectory('remove', args);
      } catch (e) {
        if (after) {
          _this16._rethrowErrorIfHelpful(e);
        } else {
          throw e;
        }
      }
    })();
  }

  /**
   * Version a new file under Hg.
   * @param filePath Which file should be versioned.
   */
  add(filePaths) {
    return this._runSimpleInWorkingDirectory('add', filePaths);
  }

  // TODO(t12228275) This is a stopgap hack, fix it. This takes the default
  // commit message from the hg commit message and since there is no change to
  // the commit message the commands errors out with error code : 255 and piggy
  // backs the stdout and stderr into an error message.
  getTemplateCommitMessage() {
    var _this17 = this;

    return (0, _asyncToGenerator.default)(function* () {
      let editor;

      // Windows will need 'type' in place of 'cat'
      if (process.platform === 'win32') {
        editor = 'type';
      } else {
        editor = 'cat';
      }
      const args = ['commit', '--config', `ui.editor=${ editor }`, '--config', 'ui.allowemptycommit=true'];
      const execOptions = {
        cwd: _this17._workingDirectory,
        HGEDITOR: ''
      };
      try {
        const { stdout } = yield _this17._hgAsyncExecute(args, execOptions);
        // It is most certianly not going to come here ever, the hg commit
        // is always going to error since no change is made to the commit message.
        return stdout;
      } catch (e) {
        // Since no change was made stderr is returned and the service thinks the
        // command execution failed. This is to get the stdout part of the message.
        // If there is no match return null. This will need to go away soon.
        // The message format : stderr:<error> stdout:<stdout>
        const re = /stdout:(.[\n\r]*[\s\S]*)/;
        const stdout = re.exec(e.message);

        if (stdout === null) {
          // Return the message as is
          return e.message;
        }

        // Match exists, return the commit message
        return stdout[1].trim();
      }
    })();
  }

  getHeadCommitMessage() {
    var _this18 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const args = ['log', '-T', '{desc}\n', '--limit', '1', '--rev', (0, (_hgRevisionExpressionHelpers || _load_hgRevisionExpressionHelpers()).expressionForRevisionsBeforeHead)(0)];
      const execOptions = {
        cwd: _this18._workingDirectory
      };
      try {
        const output = yield _this18._hgAsyncExecute(args, execOptions);
        const stdout = output.stdout.trim();
        return stdout || null;
      } catch (e) {
        // This should not happen: `hg log` does not error even if it does not recognize the template.
        (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('Failed when trying to get head commit message');
        return null;
      }
    })();
  }

  log(filePaths, limit) {
    var _this19 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const args = ['log', '-Tjson'];
      if (limit != null && limit > 0) {
        args.push('--limit', String(limit));
      }
      for (const filePath of filePaths) {
        args.push(filePath);
      }

      const execOptions = {
        cwd: _this19._workingDirectory
      };
      const result = yield _this19._hgAsyncExecute(args, execOptions);
      const entries = JSON.parse(result.stdout);
      return { entries };
    })();
  }

  fetchMergeConflicts() {
    var _this20 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { stdout } = yield _this20._hgAsyncExecute(['resolve', '--list', '-Tjson'], {
        cwd: _this20._workingDirectory
      });
      const fileListStatuses = JSON.parse(stdout);
      const conflictedFiles = fileListStatuses.filter(function (fileStatus) {
        return fileStatus.status === (_hgConstants || _load_hgConstants()).StatusCodeId.UNRESOLVED;
      });
      const origBackupPath = yield _this20._getOrigBackupPath();
      const conflicts = yield Promise.all(conflictedFiles.map((() => {
        var _ref3 = (0, _asyncToGenerator.default)(function* (conflictedFile) {
          let message;
          // Heuristic: If the `.orig` file doesn't exist, then it's deleted by the rebasing commit.
          if (yield _this20._checkOrigFile(origBackupPath, conflictedFile.path)) {
            message = (_hgConstants || _load_hgConstants()).MergeConflictStatus.BOTH_CHANGED;
          } else {
            message = (_hgConstants || _load_hgConstants()).MergeConflictStatus.DELETED_IN_THEIRS;
          }
          return {
            path: conflictedFile.path,
            message
          };
        });

        return function (_x2) {
          return _ref3.apply(this, arguments);
        };
      })()));
      return conflicts;
    })();
  }

  _getOrigBackupPath() {
    var _this21 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this21._origBackupPath == null) {
        const relativeBackupPath = yield _this21.getConfigValueAsync('ui.origbackuppath');
        if (relativeBackupPath == null) {
          _this21._origBackupPath = _this21._workingDirectory;
        } else {
          _this21._origBackupPath = (_nuclideUri || _load_nuclideUri()).default.join(_this21._workingDirectory, relativeBackupPath);
        }
      }
      return _this21._origBackupPath;
    })();
  }

  _checkOrigFile(origBackupPath, filePath) {
    return (0, _asyncToGenerator.default)(function* () {
      const origFilePath = (_nuclideUri || _load_nuclideUri()).default.join(origBackupPath, `${ filePath }.orig`);
      logger.info('origBackupPath:', origBackupPath);
      logger.info('filePath:', filePath);
      logger.info('origFilePath:', origFilePath);
      return yield (_fsPromise || _load_fsPromise()).default.exists(origFilePath);
    })();
  }

  resolveConflictedFile(filePath) {
    return this._runSimpleInWorkingDirectory('resolve', ['-m', filePath]);
  }

  continueRebase() {
    return this._runSimpleInWorkingDirectory('rebase', ['--continue']);
  }

  abortRebase() {
    return this._runSimpleInWorkingDirectory('rebase', ['--abort']);
  }

  rebase(destination, source) {
    return _rxjsBundlesRxMinJs.Observable.fromPromise((0, (_hgUtils || _load_hgUtils()).getEditMergeConfigs)()).switchMap(editMergeConfigs => {
      const args = [...editMergeConfigs.args, 'rebase', '-d', destination];
      if (source != null) {
        args.push('-s', source);
      }
      const execOptions = {
        cwd: this._workingDirectory,
        HGEDITOR: editMergeConfigs.hgEditor
      };

      return this._hgObserveExecution(args, execOptions);
    }).publish();
  }

  pull(options) {
    const args = ['pull', ...options];
    const execOptions = {
      cwd: this._workingDirectory
    };

    return this._hgObserveExecution(args, execOptions).publish();
  }

  /**
   * Copy files versioned under Hg.
   * @param filePaths Which files should be copied.
   * @param destPath What should the new file be named to.
   */
  copy(filePaths, destPath, after) {
    var _this22 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const args = [...filePaths.map(function (p) {
        return (_nuclideUri || _load_nuclideUri()).default.getPath(p);
      }), // Sources
      (_nuclideUri || _load_nuclideUri()).default.getPath(destPath)];
      if (after) {
        args.unshift('--after');
      }
      try {
        yield _this22._runSimpleInWorkingDirectory('copy', args);
      } catch (e) {
        if (after) {
          _this22._rethrowErrorIfHelpful(e);
        } else {
          throw e;
        }
      }
    })();
  }
}
exports.HgService = HgService;