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
exports.applyActionMiddleware = applyActionMiddleware;

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

var _event;

function _load_event() {
  return _event = require('../../commons-node/event');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

const HANDLED_ACTION_TYPES = [(_constants || _load_constants()).ActionType.ADD_PROJECT_REPOSITORY, (_constants || _load_constants()).ActionType.RESTORE_PANE_ITEM_STATE];

function getActionsOfType(actions, type) {
  return actions.filter(action => action.type === type);
}

function applyActionMiddleware(actions, getState) {
  const output = _rxjsBundlesRxMinJs.Observable.merge(
  // Let the unhandled ActionTypes pass through.
  actions.filter(action => HANDLED_ACTION_TYPES.indexOf(action.type) === -1), getActionsOfType(actions, (_constants || _load_constants()).ActionType.ADD_PROJECT_REPOSITORY).flatMap(action => {
    if (!(action.type === (_constants || _load_constants()).ActionType.ADD_PROJECT_REPOSITORY)) {
      throw new Error('Invariant violation: "action.type === ActionType.ADD_PROJECT_REPOSITORY"');
    }

    return watchProjectRepository(action, getState);
  }), getActionsOfType(actions, (_constants || _load_constants()).ActionType.RESTORE_PANE_ITEM_STATE).switchMap(action => {
    if (!(action.type === (_constants || _load_constants()).ActionType.RESTORE_PANE_ITEM_STATE)) {
      throw new Error('Invariant violation: "action.type === ActionType.RESTORE_PANE_ITEM_STATE"');
    }

    return restorePaneItemState(action, getState);
  }));
  return output.share();
}

function watchProjectRepository(action, getState) {

  const { repository } = action.payload;
  const hgRepository = repository;
  // Type was checked with `getType`. Downcast to safely access members with Flow.
  return _rxjsBundlesRxMinJs.Observable.merge((0, (_event || _load_event()).observableFromSubscribeFunction)(
  // Re-fetch when the list of bookmarks changes.
  hgRepository.onDidChangeBookmarks.bind(hgRepository)), (0, (_event || _load_event()).observableFromSubscribeFunction)(
  // Re-fetch when the active bookmark changes (called "short head" to match
  // Atom's Git API).
  hgRepository.onDidChangeShortHead.bind(hgRepository))).startWith(null) // Kick it off the first time
  .switchMap(() => _rxjsBundlesRxMinJs.Observable.fromPromise(hgRepository.getBookmarks())).map(bookmarks => {
    const bookmarkNames = new Set(bookmarks.map(bookmark => bookmark.bookmark).concat([(_constants || _load_constants()).EMPTY_SHORTHEAD]));

    const activeBookmark = bookmarks.filter(bookmark => bookmark.active)[0];
    const activeShortHead = activeBookmark == null ? (_constants || _load_constants()).EMPTY_SHORTHEAD : activeBookmark.bookmark;

    return {
      payload: {
        activeShortHead,
        bookmarkNames,
        repository
      },
      type: (_constants || _load_constants()).ActionType.UPDATE_REPOSITORY_BOOKMARKS
    };
  }).takeUntil((0, (_event || _load_event()).observableFromSubscribeFunction)(repository.onDidDestroy.bind(repository))).concat(_rxjsBundlesRxMinJs.Observable.of({
    payload: {
      repository
    },
    type: (_constants || _load_constants()).ActionType.REMOVE_PROJECT_REPOSITORY
  }));
}

function restorePaneItemState(action, getState) {
  const { repository, shortHead } = action.payload;

  const repositoryState = getState().repositoryPathToState.get(repository.getWorkingDirectory());
  if (repositoryState == null) {
    return _rxjsBundlesRxMinJs.Observable.empty();
  }

  // TODO(most): refactor to a `Set` all the way.
  const fileUris = new Set(repositoryState.shortHeadsToFileList.get(shortHead) || []);

  const oldOpenEditors = (0, (_utils || _load_utils()).getRepoPathToEditors)().get(repository.getWorkingDirectory()) || [];
  const oldOpenUris = oldOpenEditors.map(textEditor => textEditor.getPath() || '');

  const editorsToReload = oldOpenEditors.filter(textEditor => fileUris.has(textEditor.getPath() || ''));
  const editorsToClose = oldOpenEditors.filter(textEditor => !fileUris.has(textEditor.getPath() || ''));
  const urisToOpen = Array.from(fileUris).filter(fileUri => oldOpenUris.indexOf(fileUri) === -1);

  return _rxjsBundlesRxMinJs.Observable.concat(_rxjsBundlesRxMinJs.Observable.of({
    payload: {
      repository
    },
    type: (_constants || _load_constants()).ActionType.START_RESTORING_REPOSITORY_STATE
  }), _rxjsBundlesRxMinJs.Observable.from(editorsToClose)
  // Close the open files from the old short head.
  .map(textEditor => {
    const editorPane = atom.workspace.paneForItem(textEditor);
    if (editorPane != null) {
      editorPane.destroyItem(textEditor);
    } else {
      textEditor.destroy();
    }
  }).ignoreElements(),
  // Note: the reloading step can be omitted if the file watchers are proven to be robust.
  // But that's not the case; hence, a reload on bookmark switch/restore doesn't hurt.
  _rxjsBundlesRxMinJs.Observable.from(editorsToReload).flatMap(textEditor => {
    // Reload the open files that also exist to be in the current.
    if (textEditor.isModified()) {
      // If the filesystem version has changed while it's edited,
      // the user will be prompted to resolve the conflict: `file-watcher`.
      return _rxjsBundlesRxMinJs.Observable.empty();
    } else {
      return _rxjsBundlesRxMinJs.Observable.fromPromise(textEditor.getBuffer().load());
    }
  }).ignoreElements(), _rxjsBundlesRxMinJs.Observable.from(urisToOpen).flatMap(fileUri => {
    return _rxjsBundlesRxMinJs.Observable.fromPromise(atom.workspace.open(fileUri));
  }).ignoreElements(), _rxjsBundlesRxMinJs.Observable.of({
    payload: {
      repository
    },
    type: (_constants || _load_constants()).ActionType.COMPLETE_RESTORING_REPOSITORY_STATE
  }));
}