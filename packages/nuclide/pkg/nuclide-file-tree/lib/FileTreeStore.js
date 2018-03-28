'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FileTreeStore = exports.DEFAULT_CONF = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _FileTreeDispatcher;

function _load_FileTreeDispatcher() {
  return _FileTreeDispatcher = _interopRequireDefault(require('./FileTreeDispatcher'));
}

var _FileTreeDispatcher2;

function _load_FileTreeDispatcher2() {
  return _FileTreeDispatcher2 = require('./FileTreeDispatcher');
}

var _FileTreeHelpers;

function _load_FileTreeHelpers() {
  return _FileTreeHelpers = _interopRequireDefault(require('./FileTreeHelpers'));
}

var _FileTreeHgHelpers;

function _load_FileTreeHgHelpers() {
  return _FileTreeHgHelpers = _interopRequireDefault(require('./FileTreeHgHelpers'));
}

var _FileTreeNode;

function _load_FileTreeNode() {
  return _FileTreeNode = require('./FileTreeNode');
}

var _FileTreeSelectionManager;

function _load_FileTreeSelectionManager() {
  return _FileTreeSelectionManager = require('./FileTreeSelectionManager');
}

var _immutable;

function _load_immutable() {
  return _immutable = _interopRequireWildcard(require('immutable'));
}

var _atom = require('atom');

var _nuclideVcsBase;

function _load_nuclideVcsBase() {
  return _nuclideVcsBase = require('../../nuclide-vcs-base');
}

var _FileTreeFilterHelper;

function _load_FileTreeFilterHelper() {
  return _FileTreeFilterHelper = require('./FileTreeFilterHelper');
}

var _minimatch;

function _load_minimatch() {
  return _minimatch = require('minimatch');
}

var _observable;

function _load_observable() {
  return _observable = require('nuclide-commons/observable');
}

var _hgConstants;

function _load_hgConstants() {
  return _hgConstants = require('../../nuclide-hg-rpc/lib/hg-constants');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _nuclideWorkingSetsCommon;

function _load_nuclideWorkingSetsCommon() {
  return _nuclideWorkingSetsCommon = require('../../nuclide-working-sets-common');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _FileTreeSelectionRange;

function _load_FileTreeSelectionRange() {
  return _FileTreeSelectionRange = require('./FileTreeSelectionRange');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Used to ensure the version we serialized is the same version we are deserializing.
const VERSION = 1;
// $FlowFixMe(>=0.53.0) Flow suppress
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

const DEFAULT_CONF = exports.DEFAULT_CONF = {
  vcsStatuses: (_immutable || _load_immutable()).Map(),
  workingSet: new (_nuclideWorkingSetsCommon || _load_nuclideWorkingSetsCommon()).WorkingSet(),
  editedWorkingSet: new (_nuclideWorkingSetsCommon || _load_nuclideWorkingSetsCommon()).WorkingSet(),
  hideIgnoredNames: true,
  excludeVcsIgnoredPaths: true,
  ignoredPatterns: (_immutable || _load_immutable()).Set(),
  usePreviewTabs: false,
  focusEditorOnFileSelection: true,
  isEditingWorkingSet: false,
  openFilesWorkingSet: new (_nuclideWorkingSetsCommon || _load_nuclideWorkingSetsCommon()).WorkingSet(),
  reposByRoot: {},
  fileChanges: (_immutable || _load_immutable()).Map()
};

const FETCH_TIMEOUT = 20000;

let instance;

const actionTrackers = new Map();

/**
 * Implements the Flux pattern for our file tree. All state for the file tree will be kept in
 * FileTreeStore and the only way to update the store is through methods on FileTreeActions. The
 * dispatcher is a mechanism through which FileTreeActions interfaces with FileTreeStore.
 */
class FileTreeStore {
  // The configuration for the file-tree. Avoid direct writing.
  static getInstance() {
    if (!instance) {
      instance = new FileTreeStore();
    }
    return instance;
  }

  static dispose() {
    if (instance != null) {
      instance.dispose();
    }

    instance = null;
  }

  constructor() {
    this.roots = (_immutable || _load_immutable()).OrderedMap();
    this._dispatcher = (_FileTreeDispatcher || _load_FileTreeDispatcher()).default.getInstance();
    this._emitter = new _atom.Emitter();
    this._dispatcher.register(this._onDispatch.bind(this));
    this._logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-file-tree');
    this._fileChanges = (_immutable || _load_immutable()).Map();
    this.reorderPreviewStatus = null;

    this._usePrefixNav = false;
    this._autoExpandSingleChild = true;
    this._isLoadingMap = (_immutable || _load_immutable()).Map();
    this._repositories = (_immutable || _load_immutable()).Set();
    this.selectionManager = new (_FileTreeSelectionManager || _load_FileTreeSelectionManager()).FileTreeSelectionManager(this._emitChange.bind(this));

    this._conf = Object.assign({}, DEFAULT_CONF, { selectionManager: this.selectionManager });
    this._filter = '';
    this._extraProjectSelectionContent = (_immutable || _load_immutable()).List();
    this.foldersExpanded = true;
    this.openFilesExpanded = true;
    this.uncommittedChangesExpanded = true;
    this._selectionRange = null;
    this._targetNodeKeys = null;
    this._isCalculatingChanges = false;

    this._maxComponentWidth = -1;
  }

  /**
   * TODO: Move to a [serialization class][1] and use the built-in versioning mechanism. This might
   * need to be done one level higher within main.js.
   *
   * [1]: https://atom.io/docs/latest/behind-atom-serialization-in-atom
   */
  exportData() {
    const rootKeys = this.roots.valueSeq().toArray().map(root => root.uri);

    return {
      version: VERSION,
      childKeyMap: {},
      expandedKeysByRoot: {},
      rootKeys,
      selectedKeysByRoot: {},
      openFilesExpanded: this.openFilesExpanded,
      uncommittedChangesExpanded: this.uncommittedChangesExpanded,
      foldersExpanded: this.foldersExpanded
    };
  }

  /**
   * Imports store data from a previous export.
   */
  loadData(data) {
    // Ensure we are not trying to load data from an earlier version of this package.
    if (data.version !== VERSION) {
      return;
    }

    const buildRootNode = rootUri => {
      this._fetchChildKeys(rootUri);

      return new (_FileTreeNode || _load_FileTreeNode()).FileTreeNode({
        uri: rootUri,
        rootUri,
        isExpanded: true,
        isSelected: false,
        isLoading: true,
        children: (_immutable || _load_immutable()).OrderedMap(),
        isCwd: false,
        connectionTitle: (_FileTreeHelpers || _load_FileTreeHelpers()).default.getDisplayTitle(rootUri) || ''
      }, this._conf);
    };

    if (data.openFilesExpanded != null) {
      this.openFilesExpanded = data.openFilesExpanded;
    }

    if (data.uncommittedChangesExpanded != null) {
      this.uncommittedChangesExpanded = data.uncommittedChangesExpanded;
    }

    if (data.foldersExpanded != null) {
      this.foldersExpanded = data.foldersExpanded;
    }

    const normalizedAtomPaths = atom.project.getPaths().map((_nuclideUri || _load_nuclideUri()).default.ensureTrailingSeparator);
    const normalizedDataPaths = data.rootKeys.map((_nuclideUri || _load_nuclideUri()).default.ensureTrailingSeparator).filter(rootUri => (_nuclideUri || _load_nuclideUri()).default.isRemote(rootUri) || normalizedAtomPaths.indexOf(rootUri) >= 0);
    const pathsMissingInData = normalizedAtomPaths.filter(rootUri => normalizedDataPaths.indexOf(rootUri) === -1);
    const combinedPaths = normalizedDataPaths.concat(pathsMissingInData);

    this._setRoots((_immutable || _load_immutable()).OrderedMap(combinedPaths.map(rootUri => [rootUri, buildRootNode(rootUri)])));
  }

  _setExcludeVcsIgnoredPaths(excludeVcsIgnoredPaths) {
    this._updateConf(conf => {
      conf.excludeVcsIgnoredPaths = excludeVcsIgnoredPaths;
    });
  }

  _setHideIgnoredNames(hideIgnoredNames) {
    this._updateConf(conf => {
      conf.hideIgnoredNames = hideIgnoredNames;
    });
  }

  _setIsCalculatingChanges(isCalculatingChanges) {
    this._isCalculatingChanges = isCalculatingChanges;
    this._emitChange();
  }

  /**
   * Given a list of names to ignore, compile them into minimatch patterns and
   * update the store with them.
   */
  _setIgnoredNames(ignoredNames) {
    const ignoredPatterns = (_immutable || _load_immutable()).Set(ignoredNames).map(ignoredName => {
      if (ignoredName === '') {
        return null;
      }
      try {
        return new (_minimatch || _load_minimatch()).Minimatch(ignoredName, { matchBase: true, dot: true });
      } catch (error) {
        atom.notifications.addWarning(`Error parsing pattern '${ignoredName}' from "Settings" > "Ignored Names"`, { detail: error.message });
        return null;
      }
    }).filter(pattern => pattern != null);
    this._updateConf(conf => {
      conf.ignoredPatterns = ignoredPatterns;
    });
  }

  _onDispatch(payload) {
    const { performance } = global;
    const start = performance.now();

    switch (payload.actionType) {
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.DELETE_SELECTED_NODES:
        this._deleteSelectedNodes();
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_CWD:
        this._setCwdKey(payload.rootKey);
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_TRACKED_NODE:
        this._setTrackedNode(payload.rootKey, payload.nodeKey);
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.CLEAR_TRACKED_NODE:
        this._clearTrackedNode();
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.CLEAR_TRACKED_NODE_IF_NOT_LOADING:
        this._clearTrackedNodeIfNotLoading();
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.START_REORDER_DRAG:
        this._startReorderDrag(payload.draggedRootKey);
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.END_REORDER_DRAG:
        this._endReorderDrag();
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.REORDER_DRAG_INTO:
        this._reorderDragInto(payload.dragTargetNodeKey);
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.REORDER_ROOTS:
        this._doReorderRoots();
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.MOVE_TO_NODE:
        this._moveToNode(payload.rootKey, payload.nodeKey);
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_ROOT_KEYS:
        this._setRootKeys(payload.rootKeys);
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.EXPAND_NODE:
        this._expandNode(payload.rootKey, payload.nodeKey);
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.EXPAND_NODE_DEEP:
        this._expandNodeDeep(payload.rootKey, payload.nodeKey);
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.COLLAPSE_NODE:
        this._collapseNode(payload.rootKey, payload.nodeKey);
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_EXCLUDE_VCS_IGNORED_PATHS:
        this._setExcludeVcsIgnoredPaths(payload.excludeVcsIgnoredPaths);
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_USE_PREVIEW_TABS:
        this._setUsePreviewTabs(payload.usePreviewTabs);
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_FOCUS_EDITOR_ON_FILE_SELECTION:
        this._setFocusEditorOnFileSelection(payload.focusEditorOnFileSelection);
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_USE_PREFIX_NAV:
        this._setUsePrefixNav(payload.usePrefixNav);
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_AUTO_EXPAND_SINGLE_CHILD:
        this._setAutoExpandSingleChild(payload.autoExpandSingleChild);
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.COLLAPSE_NODE_DEEP:
        this._collapseNodeDeep(payload.rootKey, payload.nodeKey);
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_HIDE_IGNORED_NAMES:
        this._setHideIgnoredNames(payload.hideIgnoredNames);
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_IS_CALCULATING_CHANGES:
        this._setIsCalculatingChanges(payload.isCalculatingChanges);
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_IGNORED_NAMES:
        this._setIgnoredNames(payload.ignoredNames);
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_VCS_STATUSES:
        this._setVcsStatuses(payload.rootKey, payload.vcsStatuses);
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_REPOSITORIES:
        this._setRepositories(payload.repositories);
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_WORKING_SET:
        this._setWorkingSet(payload.workingSet);
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_OPEN_FILES_WORKING_SET:
        this._setOpenFilesWorkingSet(payload.openFilesWorkingSet);
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_WORKING_SETS_STORE:
        this._setWorkingSetsStore(payload.workingSetsStore);
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.START_EDITING_WORKING_SET:
        this._startEditingWorkingSet(payload.editedWorkingSet);
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.FINISH_EDITING_WORKING_SET:
        this._finishEditingWorkingSet();
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.CHECK_NODE:
        this._checkNode(payload.rootKey, payload.nodeKey);
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.UNCHECK_NODE:
        this._uncheckNode(payload.rootKey, payload.nodeKey);
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_DRAG_HOVERED_NODE:
        this._setDragHoveredNode(payload.rootKey, payload.nodeKey);
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.UNHOVER_NODE:
        this._unhoverNode(payload.rootKey, payload.nodeKey);
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_SELECTED_NODE:
        this._setSelectedNode(payload.rootKey, payload.nodeKey);
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_FOCUSED_NODE:
        this._setFocusedNode(payload.rootKey, payload.nodeKey);
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.ADD_SELECTED_NODE:
        this._addSelectedNode(payload.rootKey, payload.nodeKey);
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.UNSELECT_NODE:
        this._unselectNode(payload.rootKey, payload.nodeKey);
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.MOVE_SELECTION_UP:
        this._moveSelectionUp();
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.RANGE_SELECT_TO_NODE:
        this._rangeSelectToNode(payload.rootKey, payload.nodeKey);
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.RANGE_SELECT_UP:
        this._rangeSelectUp();
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.RANGE_SELECT_DOWN:
        this._rangeSelectDown();
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.MOVE_SELECTION_DOWN:
        this._moveSelectionDown();
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.MOVE_SELECTION_TO_TOP:
        this._moveSelectionToTop();
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.MOVE_SELECTION_TO_BOTTOM:
        this._moveSelectionToBottom();
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.ENSURE_CHILD_NODE:
        this._ensureChildNode(payload.nodeKey);
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.CLEAR_FILTER:
        this.clearFilter();
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.ADD_EXTRA_PROJECT_SELECTION_CONTENT:
        this.addExtraProjectSelectionContent(payload.content);
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.REMOVE_EXTRA_PROJECT_SELECTION_CONTENT:
        this.removeExtraProjectSelectionContent(payload.content);
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_OPEN_FILES_EXPANDED:
        this._setOpenFilesExpanded(payload.openFilesExpanded);
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_UNCOMMITTED_CHANGES_EXPANDED:
        this._setUncommittedChangesExpanded(payload.uncommittedChangesExpanded);
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_FOLDERS_EXPANDED:
        this._setFoldersExpanded(payload.foldersExpanded);
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.INVALIDATE_REMOVED_FOLDER:
        this._invalidateRemovedFolder();
        break;
      case (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_TARGET_NODE:
        this._setTargetNode(payload.rootKey, payload.nodeKey);
        break;
    }

    const end = performance.now();

    let tracker = actionTrackers.get(payload.actionType);
    if (tracker == null) {
      tracker = new (_nuclideAnalytics || _load_nuclideAnalytics()).HistogramTracker(`file-tree-action:${payload.actionType}`, 1000, 10);
      actionTrackers.set(payload.actionType, tracker);
    }

    tracker.track(end - start);
  }

  /**
   * Use the predicate function to update one or more of the roots in the file tree
   */
  _updateRoots(predicate) {
    this._setRoots(this.roots.map(predicate));
  }

  /**
   * Use the predicate to update a node (or a branch) of the file-tree
   */
  _updateNodeAtRoot(rootKey, nodeKey, predicate) {
    const root = this.roots.get(rootKey);
    if (root == null) {
      return;
    }

    const node = root.find(nodeKey);
    if (node == null) {
      return;
    }

    const roots = this.roots.set(rootKey, this._bubbleUp(node, predicate(node)));

    this._setRoots(roots);
  }

  /**
   * Update a node by calling the predicate, returns the new node.
   */
  _updateNode(node, predicate) {
    const newNode = predicate(node);
    const roots = this.roots.set(node.rootUri, this._bubbleUp(node, newNode));
    this._setRoots(roots);
    return newNode;
  }

  /**
   * Update a node or a branch under any of the roots it was found at
   */
  _updateNodeAtAllRoots(nodeKey, predicate) {
    const roots = this.roots.map(root => {
      const node = root.find(nodeKey);
      if (node == null) {
        return root;
      }

      return this._bubbleUp(node, predicate(node));
    });
    this._setRoots(roots);
  }

  /**
   * Bubble the change up. The newNode is assumed to be prevNode after some manipulateion done to it
   * therefore they are assumed to belong to the same parent.
   *
   * The method updates the child to the new node (which create a new parent instance) and call
   * recursively for the parent update. Until there are no more parents and the new root is returned
   *
   * As the change bubbles up, and in addition to the change from the new child assignment, an
   * optional predicate is also being applied to each newly created parent to support more complex
   * change patterns.
   */
  _bubbleUp(prevNode, newNode, postPredicate = node => node) {
    const parent = prevNode.parent;
    if (parent == null) {
      return newNode;
    }

    const newParent = postPredicate(parent.updateChild(newNode));
    return this._bubbleUp(parent, newParent, postPredicate);
  }

  /**
   * Updates the roots, maintains their sibling relationships and fires the change event.
   */
  _setRoots(roots) {
    // Explicitly test for the empty case, otherwise configuration changes with an empty
    // tree will not emit changes.
    const changed = !(_immutable || _load_immutable()).is(roots, this.roots) || roots.isEmpty();
    if (changed) {
      this.roots = roots;
      let prevRoot = null;
      roots.forEach(r => {
        r.prevSibling = prevRoot;
        if (prevRoot != null) {
          prevRoot.nextSibling = r;
        }
        prevRoot = r;
      });

      if (prevRoot != null) {
        prevRoot.nextSibling = null;
      }

      this._emitChange();
    }
  }

  _emitChange() {
    if (this._animationFrameRequestSubscription != null) {
      return;
    }

    this._animationFrameRequestSubscription = (_observable || _load_observable()).nextAnimationFrame.subscribe(() => {
      this._animationFrameRequestSubscription = null;
      const { performance } = global;
      const renderStart = performance.now();
      const childrenCount = this.roots.reduce((sum, root) => sum + root.shownChildrenCount, 0);

      this._emitter.emit('change');

      const duration = (performance.now() - renderStart).toString();
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('filetree-root-node-component-render', {
        'filetree-root-node-component-render-duration': duration,
        'filetree-root-node-component-rendered-child-count': childrenCount
      });
    });
  }

  /**
   * Update the configuration for the file-tree. The direct writing to the this._conf should be
   * avoided.
   */
  _updateConf(predicate) {
    predicate(this._conf);
    this._updateRoots(root => {
      return root.updateConf().setRecursive(
      // Remove selection from hidden nodes under this root
      node => node.containsHidden ? null : node, node => {
        if (node.shouldBeShown) {
          return node;
        }

        // The node is hidden - unselect all nodes under it if there are any
        return node.setRecursive(subNode => null, subNode => subNode.setIsSelected(false));
      });
    });
  }

  getTrackedNode() {
    if (this._trackedRootKey == null || this._trackedNodeKey == null) {
      return null;
    }

    return this.getNode(this._trackedRootKey, this._trackedNodeKey);
  }

  getRepositories() {
    return this._repositories;
  }

  getWorkingSet() {
    return this._conf.workingSet;
  }

  getWorkingSetsStore() {
    return this._workingSetsStore;
  }

  getRootKeys() {
    return this.roots.valueSeq().toArray().map(root => root.uri);
  }

  getCwdKey() {
    return this._cwdKey;
  }

  /**
   * Returns true if the store has no data, i.e. no roots, no children.
   */
  isEmpty() {
    return this.roots.isEmpty();
  }

  getFileChanges() {
    return this._fileChanges;
  }

  getIsCalculatingChanges() {
    return this._isCalculatingChanges;
  }

  _invalidateRemovedFolder() {
    const updatedFileChanges = new Map();
    atom.project.getPaths().forEach(projectPath => {
      const standardizedPath = (_nuclideUri || _load_nuclideUri()).default.ensureTrailingSeparator(projectPath);
      // Atom sometimes tells you a repo exists briefly even after it has been removed
      // This causes the map to first flush out the repo and then again try to add the
      // repo but the files now don't exist causing an undefined value to be added.
      // Adding check to prevent this from happening.
      const fileChangesForPath = this._fileChanges.get(standardizedPath);
      if (fileChangesForPath != null) {
        updatedFileChanges.set(standardizedPath, fileChangesForPath);
      }
    });

    this._fileChanges = (_immutable || _load_immutable()).Map(updatedFileChanges);
  }

  _setFileChanges(rootKey, vcsStatuses) {
    let fileChanges = (_immutable || _load_immutable()).Map();
    vcsStatuses.forEach((statusCode, filePath) => {
      fileChanges = fileChanges.set(filePath, (_nuclideVcsBase || _load_nuclideVcsBase()).HgStatusToFileChangeStatus[statusCode]);
    });

    this._fileChanges = this._fileChanges.set(rootKey, fileChanges);
  }

  _setVcsStatuses(rootKey, vcsStatuses) {
    // We use file changes for populating the uncommitted list, this is different as compared
    // to what is computed in the vcsStatuses in that it does not need the exact path but just
    // the root folder present in atom and the file name and its status. Another difference is
    // in the terms used for status change, while uncommitted changes needs the HgStatusChange
    // codes the file tree doesn't.
    this._setFileChanges(rootKey, vcsStatuses);

    // We can't build on the child-derived properties to maintain vcs statuses in the entire
    // tree, since the reported VCS status may be for a node that is not yet present in the
    // fetched tree, and so it it can't affect its parents statuses. To have the roots colored
    // consistently we manually add all parents of all of the modified nodes up till the root
    const enrichedVcsStatuses = new Map(vcsStatuses);

    const ensurePresentParents = uri => {
      if (uri === rootKey) {
        return;
      }

      let current = uri;
      while (current !== rootKey) {
        current = (_FileTreeHelpers || _load_FileTreeHelpers()).default.getParentKey(current);

        if (enrichedVcsStatuses.has(current)) {
          return;
        }

        enrichedVcsStatuses.set(current, (_hgConstants || _load_hgConstants()).StatusCodeNumber.MODIFIED);
      }
    };

    vcsStatuses.forEach((status, uri) => {
      if (status === (_hgConstants || _load_hgConstants()).StatusCodeNumber.MODIFIED || status === (_hgConstants || _load_hgConstants()).StatusCodeNumber.ADDED || status === (_hgConstants || _load_hgConstants()).StatusCodeNumber.REMOVED) {
        try {
          // An invalid URI might cause an exception to be thrown
          ensurePresentParents(uri);
        } catch (e) {
          this._logger.error(`Error enriching the VCS statuses for ${uri}`, e);
        }
      }
    });

    this._updateConf(conf => {
      conf.vcsStatuses = conf.vcsStatuses.set(rootKey, enrichedVcsStatuses);
    });
  }

  _setUsePreviewTabs(usePreviewTabs) {
    this._updateConf(conf => {
      conf.usePreviewTabs = usePreviewTabs;
    });
  }

  _setFocusEditorOnFileSelection(focusEditorOnFileSelection) {
    this._updateConf(conf => {
      conf.focusEditorOnFileSelection = focusEditorOnFileSelection;
    });
  }

  _setUsePrefixNav(usePrefixNav) {
    this._usePrefixNav = usePrefixNav;
  }

  usePrefixNav() {
    return this._usePrefixNav;
  }

  _setAutoExpandSingleChild(autoExpandSingleChild) {
    this._autoExpandSingleChild = autoExpandSingleChild;
  }

  /**
   * The node child keys may either be available immediately (cached), or
   * require an async fetch. If all of the children are needed it's easier to
   * return as promise, to make the caller oblivious to the way children were
   * fetched.
   */
  promiseNodeChildKeys(rootKey, nodeKey) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const shownChildrenUris = function (node) {
        return node.children.valueSeq().toArray().filter(function (n) {
          return n.shouldBeShown;
        }).map(function (n) {
          return n.uri;
        });
      };

      const node = _this.getNode(rootKey, nodeKey);
      if (node == null) {
        return [];
      }

      if (!node.isLoading) {
        return shownChildrenUris(node);
      }

      yield _this._fetchChildKeys(nodeKey);
      return _this.promiseNodeChildKeys(rootKey, nodeKey);
    })();
  }

  getSelectedNodes() {
    return (_immutable || _load_immutable()).List(this.selectionManager.selectedNodes().values());
  }

  // Retrieves target node in an immutable list if it's set, or all selected
  // nodes otherwise
  getTargetNodes() {
    if (this._targetNodeKeys) {
      const targetNode = this.getNode(this._targetNodeKeys.rootKey, this._targetNodeKeys.nodeKey);
      if (targetNode) {
        return (_immutable || _load_immutable()).List([targetNode]);
      }
    }
    return this.getSelectedNodes();
  }

  /**
   * Returns a node if it is the only one selected, or null otherwise
   */
  getSingleSelectedNode() {
    const selectedNodes = this.getSelectedNodes();

    if (selectedNodes.isEmpty() || selectedNodes.size > 1) {
      return null;
    }

    return selectedNodes.first();
  }

  // Retrieves the target node, if it's set, or the first selected node otherwise
  getSingleTargetNode() {
    if (this._targetNodeKeys) {
      const targetNode = this.getNode(this._targetNodeKeys.rootKey, this._targetNodeKeys.nodeKey);
      if (targetNode) {
        return targetNode;
      }
    }
    return this.getSingleSelectedNode();
  }

  getNode(rootKey, nodeKey) {
    const rootNode = this.roots.get(rootKey);

    if (rootNode == null) {
      return null;
    }

    return rootNode.find(nodeKey);
  }

  getNodeByIndex(index) {
    const firstRoot = this.roots.find(r => r.shouldBeShown);
    if (firstRoot == null) {
      return null;
    }

    return firstRoot.findByIndex(index);
  }

  getRootForPath(nodeKey) {
    const rootNode = this.roots.find(root => nodeKey.startsWith(root.uri));
    return rootNode || null;
  }

  isEditingWorkingSet() {
    return this._conf.isEditingWorkingSet;
  }

  /**
   * Builds the edited working set from the partially-child-derived .checkedStatus property
   */
  getEditedWorkingSet() {
    return this._conf.editedWorkingSet;
  }

  isEditedWorkingSetEmpty() {
    return this.roots.every(root => root.checkedStatus === 'clear');
  }

  getOpenFilesWorkingSet() {
    return this._conf.openFilesWorkingSet;
  }

  /**
   * Initiates the fetching of node's children if it's not already in the process.
   * Clears the node's .isLoading property once the fetch is complete.
   * Once the fetch is completed, clears the node's .isLoading property, builds the map of the
   * node's children out of the fetched children URIs and a change subscription is created
   * for the node to monitor future changes.
   */
  _fetchChildKeys(nodeKey) {
    const existingPromise = this._getLoading(nodeKey);
    if (existingPromise != null) {
      return existingPromise;
    }

    const promise = (0, (_promise || _load_promise()).timeoutAfterDeadline)((0, (_promise || _load_promise()).createDeadline)(FETCH_TIMEOUT), (_FileTreeHelpers || _load_FileTreeHelpers()).default.fetchChildren(nodeKey)).then(childrenKeys => this._setFetchedKeys(nodeKey, childrenKeys), error => {
      this._logger.error(`Unable to fetch children for "${nodeKey}".`);
      this._logger.error('Original error: ', error);

      // Unless the contents were already fetched in the past
      // collapse the node and clear its loading state on error so the
      // user can retry expanding it.
      this._updateNodeAtAllRoots(nodeKey, node => {
        if (node.wasFetched) {
          return node.setIsLoading(false);
        }

        return node.set({
          isExpanded: false,
          isLoading: false,
          children: (_immutable || _load_immutable()).OrderedMap()
        });
      });

      this._clearLoading(nodeKey);
    }).then(() => this._setGeneratedChildren(nodeKey));

    this._setLoading(nodeKey, promise);
    return promise;
  }

  _setFetchedKeys(nodeKey, childrenKeys = []) {
    const directory = (_FileTreeHelpers || _load_FileTreeHelpers()).default.getDirectoryByKey(nodeKey);

    const nodesToAutoExpand = [];

    // The node with URI === nodeKey might be present at several roots - update them all
    this._updateNodeAtAllRoots(nodeKey, node => {
      // Maintain the order fetched from the FS
      const childrenNodes = childrenKeys.map(uri => {
        const prevNode = node.find(uri);
        // If we already had a child with this URI - keep it
        if (prevNode != null) {
          return prevNode;
        }

        return new (_FileTreeNode || _load_FileTreeNode()).FileTreeNode({
          uri,
          rootUri: node.rootUri,
          isCwd: uri === this._cwdKey
        }, this._conf);
      });

      if (this._autoExpandSingleChild && childrenNodes.length === 1 && childrenNodes[0].isContainer) {
        nodesToAutoExpand.push(childrenNodes[0]);
      }

      const children = (_FileTreeNode || _load_FileTreeNode()).FileTreeNode.childrenFromArray(childrenNodes);
      const subscription = node.subscription || this._makeSubscription(nodeKey, directory);

      // If the fetch indicated that some children were removed - dispose of all
      // their subscriptions
      const removedChildren = node.children.filter(n => !children.has(n.name));
      removedChildren.forEach(c => {
        c.traverse(n => {
          if (n.subscription != null) {
            n.subscription.dispose();
          }

          return true;
        });
      });

      return node.set({
        isLoading: false,
        wasFetched: true,
        children,
        subscription
      });
    });

    this._clearLoading(nodeKey);
    nodesToAutoExpand.forEach(node => {
      this._expandNode(node.rootUri, node.uri);
    });
  }

  _makeSubscription(nodeKey, directory) {
    if (directory == null) {
      return null;
    }

    let fetchingPromise = null;
    let couldMissUpdate = false;

    try {
      // Here we intentionally circumvent, to a degree, the logic in the _fetchChildKeys
      // which wouldn't schedule a new fetch if there is already one running.
      // This is fine for the most cases, but not for the subscription handling, as the
      // subscription is notifying us that something has changed and if a fetch is already in
      // progress then it is racing with the change. Therefore, if we detect that there was a change
      // during the fetch we schedule another right after the first has finished.
      const checkMissed = () => {
        fetchingPromise = null;
        if (couldMissUpdate) {
          fetchKeys();
        }
      };

      const fetchKeys = () => {
        if (fetchingPromise == null) {
          couldMissUpdate = false;
          fetchingPromise = this._fetchChildKeys(nodeKey).then(checkMissed);
        } else {
          couldMissUpdate = true;
        }
      };

      // This call might fail if we try to watch a non-existing directory, or if permission denied.
      return directory.onDidChange(() => {
        fetchKeys();
      });
    } catch (ex) {
      /*
       * Log error and mark the directory as dirty so the failed subscription will be attempted
       * again next time the directory is expanded.
       */
      this._logger.error(`Cannot subscribe to directory "${nodeKey}"`, ex);
      return null;
    }
  }

  _getLoading(nodeKey) {
    return this._isLoadingMap.get(nodeKey);
  }

  _setLoading(nodeKey, value) {
    this._isLoadingMap = this._isLoadingMap.set(nodeKey, value);
  }

  hasCwd() {
    return this._cwdKey != null;
  }

  _setCwdKey(cwdKey) {
    if (this._cwdKey != null) {
      this._updateNodeAtAllRoots(this._cwdKey, node => node.setIsCwd(false));
    }
    this._cwdKey = cwdKey;
    if (cwdKey != null) {
      this._updateNodeAtAllRoots(cwdKey, node => node.setIsCwd(true));
    }
  }

  _setGeneratedChildren(nodeKey) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      let generatedFileService;
      try {
        generatedFileService = yield (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).awaitGeneratedFileServiceByNuclideUri)(nodeKey);
      } catch (e) {
        _this2._logger.warn(`ServerConnection cancelled while getting GeneratedFileService for ${nodeKey}`, e);
        return;
      }
      const generatedFileTypes = yield generatedFileService.getGeneratedFileTypes(nodeKey);
      _this2._updateNodeAtAllRoots(nodeKey, function (node) {
        const children = node.children.map(function (childNode) {
          const generatedType = generatedFileTypes.get(childNode.uri);
          if (generatedType != null) {
            return childNode.setGeneratedStatus(generatedType);
          } else {
            // if in the directory but not specified in the map, assume manual.
            return childNode.setGeneratedStatus('manual');
          }
        });
        return node.set({ children });
      });
    })();
  }

  getFilter() {
    return this._filter;
  }

  addFilterLetter(letter) {
    this._filter = this._filter + letter;
    this._updateRoots(root => {
      return root.setRecursive(node => node.containsFilterMatches ? null : node, node => {
        return (0, (_FileTreeFilterHelper || _load_FileTreeFilterHelper()).matchesFilter)(node.name, this._filter) ? node.set({
          highlightedText: this._filter,
          matchesFilter: true
        }) : node.set({ highlightedText: '', matchesFilter: false });
      });
    });
    this._selectFirstFilter();
    this._emitChange();
  }

  clearFilter() {
    this._filter = '';
    this._updateRoots(root => {
      return root.setRecursive(node => null, node => node.set({ highlightedText: '', matchesFilter: true }));
    });
  }

  removeFilterLetter() {
    const oldLength = this._filter.length;
    this._filter = this._filter.substr(0, this._filter.length - 1);
    if (oldLength > 1) {
      this._updateRoots(root => {
        return root.setRecursive(node => null, node => {
          return (0, (_FileTreeFilterHelper || _load_FileTreeFilterHelper()).matchesFilter)(node.name, this._filter) ? node.set({
            highlightedText: this._filter,
            matchesFilter: true
          }) : node.set({ highlightedText: '', matchesFilter: false });
        });
      });
      this._emitChange();
    } else if (oldLength === 1) {
      this.clearFilter();
    }
  }

  getExtraProjectSelectionContent() {
    return this._extraProjectSelectionContent;
  }

  addExtraProjectSelectionContent(content) {
    this._extraProjectSelectionContent = this._extraProjectSelectionContent.push(content);
    this._emitChange();
  }

  removeExtraProjectSelectionContent(content) {
    const index = this._extraProjectSelectionContent.indexOf(content);
    if (index === -1) {
      return;
    }
    this._extraProjectSelectionContent = this._extraProjectSelectionContent.remove(index);
    this._emitChange();
  }

  getFilterFound() {
    return this.roots.some(root => root.containsFilterMatches);
  }

  collectDebugState() {
    return {
      openFilesExpanded: this.openFilesExpanded,
      uncommittedChangesExpanded: this.uncommittedChangesExpanded,
      foldersExpanded: this.foldersExpanded,
      reorderPreviewStatus: this.reorderPreviewStatus,
      _filter: this._filter,
      _selectionRange: this._selectionRange,
      _targetNodeKeys: this._targetNodeKeys,
      _trackedRootKey: this._trackedRootKey,
      _trackedNodeKey: this._trackedNodeKey,
      _isCalculatingChanges: this._isCalculatingChanges,

      roots: Array.from(this.roots.values()).map(root => root.collectDebugState()),
      _conf: this._confCollectDebugState(),
      selectionManager: this.selectionManager.collectDebugState()
    };
  }

  _confCollectDebugState() {
    return {
      hideIgnoredNames: this._conf.hideIgnoredNames,
      excludeVcsIgnoredPaths: this._conf.excludeVcsIgnoredPaths,
      usePreviewTabs: this._conf.usePreviewTabs,
      focusEditorOnFileSelection: this._conf.focusEditorOnFileSelection,
      isEditingWorkingSet: this._conf.isEditingWorkingSet,

      vcsStatuses: this._conf.vcsStatuses.toObject(),
      workingSet: this._conf.workingSet.getUris(),
      ignoredPatterns: this._conf.ignoredPatterns.toArray().map(ignored => ignored.pattern),
      openFilesWorkingSet: this._conf.openFilesWorkingSet.getUris(),
      editedWorkingSet: this._conf.editedWorkingSet.getUris()
    };
  }

  /*
  * Manually sets a target node used for context menu actions. The value can be
  * retrieved by calling `getTargetNodes` or `getSingleTargetNode` both of
  * which will retrieve the target node if it exists and default to selected
  * nodes otherwise.
  * This value gets cleared everytime a selection is set
  */
  _setTargetNode(rootKey, nodeKey) {
    this._targetNodeKeys = { rootKey, nodeKey };
  }

  /**
   * Resets the node to be kept in view if no more data is being awaited. Safe to call many times
   * because it only changes state if a node is being tracked.
   */
  _clearTrackedNodeIfNotLoading() {
    if (
    /*
     * The loading map being empty is a heuristic for when loading has completed. It is inexact
     * because the loading might be unrelated to the tracked node, however it is cheap and false
     * positives will only last until loading is complete or until the user clicks another node in
     * the tree.
     */
    this._isLoadingMap.isEmpty()) {
      // Loading has completed. Allow scrolling to proceed as usual.
      this._clearTrackedNode();
    }
  }

  _clearLoading(nodeKey) {
    this._isLoadingMap = this._isLoadingMap.delete(nodeKey);
  }

  _startReorderDrag(draggedRootKey) {
    const rootIdx = this.getRootKeys().indexOf(draggedRootKey);
    if (rootIdx === -1) {
      return;
    }
    this._updateNodeAtRoot(draggedRootKey, draggedRootKey, node => node.setIsBeingReordered(true));
    this.reorderPreviewStatus = {
      source: draggedRootKey,
      sourceIdx: rootIdx
    };
    this._emitChange();
  }

  _reorderDragInto(targetRootKey) {
    const reorderPreviewStatus = this.reorderPreviewStatus;
    const targetIdx = this.getRootKeys().indexOf(targetRootKey);
    const targetRootNode = this.getNode(targetRootKey, targetRootKey);
    if (reorderPreviewStatus == null || targetIdx === -1 || targetRootNode == null) {
      return;
    }

    let targetNode;
    if (targetIdx <= reorderPreviewStatus.sourceIdx) {
      targetNode = targetRootNode;
    } else {
      targetNode = targetRootNode.findLastRecursiveChild();
    }

    this.reorderPreviewStatus = Object.assign({}, this.reorderPreviewStatus, {
      target: targetNode == null ? undefined : targetNode.uri,
      targetIdx
    });
    this._emitChange();
  }

  _doReorderRoots() {
    const rootKeys = this.getRootKeys();
    const rps = this.reorderPreviewStatus;
    if (rps == null) {
      return;
    }
    const sourceIdx = rps.sourceIdx;
    const targetIdx = rps.targetIdx;
    if (targetIdx == null || sourceIdx === targetIdx) {
      return;
    }

    rootKeys.splice(sourceIdx, 1);
    rootKeys.splice(targetIdx, 0, rps.source);
    this._setRootKeys(rootKeys);
  }

  _endReorderDrag() {
    if (this.reorderPreviewStatus != null) {
      const sourceRootKey = this.reorderPreviewStatus.source;
      this._updateNodeAtRoot(sourceRootKey, sourceRootKey, node => node.setIsBeingReordered(false));
      this.reorderPreviewStatus = null;
      this._emitChange();
    }
  }

  _moveToNode(rootKey, nodeKey) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const targetNode = _this3.getNode(rootKey, nodeKey);
      if (targetNode == null || !targetNode.isContainer) {
        return;
      }

      const selectedNodes = _this3.getSelectedNodes();
      _this3._clearDragHover();
      _this3._clearSelection();

      try {
        yield (_FileTreeHgHelpers || _load_FileTreeHgHelpers()).default.moveNodes(selectedNodes.toArray(), targetNode.uri);
      } catch (e) {
        atom.notifications.addError('Failed to move entries: ' + e.message);
      }
    })();
  }

  _deleteSelectedNodes() {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const selectedNodes = _this4.getSelectedNodes();
      try {
        yield (_FileTreeHgHelpers || _load_FileTreeHgHelpers()).default.deleteNodes(selectedNodes.toArray());
        _this4._clearSelectionRange();
      } catch (e) {
        atom.notifications.addError('Failed to delete entries: ' + e.message);
      }
    })();
  }

  _expandNode(rootKey, nodeKey) {
    const recursivelyExpandNode = node => {
      return node.setIsExpanded(true).setRecursive(n => {
        if (!n.isContainer) {
          return n;
        }

        if (this._autoExpandSingleChild && n.children.size === 1) {
          if (!n.isExpanded) {
            return recursivelyExpandNode(n);
          }

          return null;
        }

        return !n.isExpanded ? n : null;
      }, n => {
        if (n.isContainer && n.isExpanded) {
          this._fetchChildKeys(n.uri);
          return n.setIsLoading(true);
        }

        return n;
      });
    };

    this._updateNodeAtRoot(rootKey, nodeKey, recursivelyExpandNode);
  }

  /**
   * Performes a deep BFS scanning expand of contained nodes.
   * returns - a promise fulfilled when the expand operation is finished
   */
  _expandNodeDeep(rootKey, nodeKey) {
    // Stop the traversal after 100 nodes were added to the tree
    const itNodes = new FileTreeStoreBfsIterator(this, rootKey, nodeKey,
    /* limit */100);
    const promise = new Promise(resolve => {
      const expand = () => {
        const traversedNodeKey = itNodes.traversedNode();
        // flowlint-next-line sketchy-null-string:off
        if (traversedNodeKey) {
          this._expandNode(rootKey, traversedNodeKey);

          const nextPromise = itNodes.next();
          if (nextPromise) {
            nextPromise.then(expand);
          }
        } else {
          resolve();
        }
      };

      expand();
    });

    return promise;
  }

  _collapseNode(rootKey, nodeKey) {
    this._updateNodeAtRoot(rootKey, nodeKey, node => {
      // Clear all selected nodes under the node being collapsed and dispose their subscriptions
      return node.setRecursive(childNode => {
        if (childNode.isExpanded) {
          return null;
        }
        return childNode;
      }, childNode => {
        if (childNode.subscription != null) {
          childNode.subscription.dispose();
        }

        if (childNode.uri === node.uri) {
          return childNode.set({ isExpanded: false, subscription: null });
        } else {
          return childNode.set({ isSelected: false, subscription: null });
        }
      });
    });
  }

  _collapseNodeDeep(rootKey, nodeKey) {
    this._updateNodeAtRoot(rootKey, nodeKey, node => {
      return node.setRecursive( /* prePredicate */null, childNode => {
        if (childNode.subscription != null) {
          childNode.subscription.dispose();
        }

        if (childNode.uri !== node.uri) {
          return childNode.set({
            isExpanded: false,
            isSelected: false,
            subscription: null
          });
        } else {
          return childNode.set({ isExpanded: false, subscription: null });
        }
      });
    });
  }

  _setDragHoveredNode(rootKey, nodeKey) {
    this._clearDragHover();
    this._updateNodeAtRoot(rootKey, nodeKey, node => node.setIsDragHovered(true));
  }

  _unhoverNode(rootKey, nodeKey) {
    this._updateNodeAtRoot(rootKey, nodeKey, node => node.setIsDragHovered(false));
  }

  /**
   * Selects a single node and tracks it.
   */
  _setSelectedNode(rootKey, nodeKey) {
    this._clearSelection();
    this._updateNodeAtRoot(rootKey, nodeKey, node => node.setIsSelected(true));
    this._setTrackedNode(rootKey, nodeKey);
    this._setSelectionRange((_FileTreeSelectionRange || _load_FileTreeSelectionRange()).SelectionRange.ofSingleItem(new (_FileTreeSelectionRange || _load_FileTreeSelectionRange()).RangeKey(rootKey, nodeKey)));
  }

  /**
   * Mark a node that has been focused, similar to selected, but only true after mouseup.
   */
  _setFocusedNode(rootKey, nodeKey) {
    this._updateNodeAtRoot(rootKey, nodeKey, node => node.setIsFocused(true));
  }

  /**
   * Selects and focuses a node in one pass.
   */
  _setSelectedAndFocusedNode(rootKey, nodeKey) {
    this._clearSelection();
    this._updateNodeAtRoot(rootKey, nodeKey, node => node.set({ isSelected: true, isFocused: true }));
    this._setTrackedNode(rootKey, nodeKey);
    this._setSelectionRange((_FileTreeSelectionRange || _load_FileTreeSelectionRange()).SelectionRange.ofSingleItem(new (_FileTreeSelectionRange || _load_FileTreeSelectionRange()).RangeKey(rootKey, nodeKey)));
  }

  _addSelectedNode(rootKey, nodeKey) {
    this._updateNodeAtRoot(rootKey, nodeKey, node => node.setIsSelected(true));
    this._setSelectionRange((_FileTreeSelectionRange || _load_FileTreeSelectionRange()).SelectionRange.ofSingleItem(new (_FileTreeSelectionRange || _load_FileTreeSelectionRange()).RangeKey(rootKey, nodeKey)));
  }

  _unselectNode(rootKey, nodeKey) {
    this._updateNodeAtRoot(rootKey, nodeKey, node => node.set({ isSelected: false, isFocused: false }));
  }

  _setSelectionRange(selectionRange) {
    this._selectionRange = selectionRange;
    this._targetNodeKeys = null;
  }

  _clearSelectionRange() {
    this._selectionRange = null;
    this._targetNodeKeys = null;
  }

  /**
   * Refresh the selection range data.
   * invalidate the data
   * - if anchor node or range node is deleted.
   * - if these two nodes are not selected, and there is no nearby node to fall back to.
   * When this function returns, the selection range always contains valid data.
   */
  _refreshSelectionRange() {
    const invalidate = () => {
      this._clearSelectionRange();
      return null;
    };

    let selectionRange = this._selectionRange;
    if (selectionRange == null) {
      return invalidate();
    }
    const anchor = selectionRange.anchor();
    const range = selectionRange.range();
    let anchorNode = this.getNode(anchor.rootKey(), anchor.nodeKey());
    let rangeNode = this.getNode(range.rootKey(), range.nodeKey());
    if (anchorNode == null || rangeNode == null) {
      return invalidate();
    }

    anchorNode = (_FileTreeSelectionRange || _load_FileTreeSelectionRange()).RangeUtil.findSelectedNode(anchorNode);
    rangeNode = (_FileTreeSelectionRange || _load_FileTreeSelectionRange()).RangeUtil.findSelectedNode(rangeNode);
    if (anchorNode == null || rangeNode == null) {
      return invalidate();
    }
    const anchorIndex = anchorNode.calculateVisualIndex();
    const rangeIndex = rangeNode.calculateVisualIndex();
    const direction = rangeIndex > anchorIndex ? 'down' : rangeIndex === anchorIndex ? 'none' : 'up';

    selectionRange = new (_FileTreeSelectionRange || _load_FileTreeSelectionRange()).SelectionRange((_FileTreeSelectionRange || _load_FileTreeSelectionRange()).RangeKey.of(anchorNode), (_FileTreeSelectionRange || _load_FileTreeSelectionRange()).RangeKey.of(rangeNode));
    this._setSelectionRange(selectionRange);
    return {
      selectionRange,
      anchorNode,
      rangeNode,
      anchorIndex,
      rangeIndex,
      direction
    };
  }

  /**
   * Bulk selection based on the range.
   */
  _rangeSelectToNode(rootKey, nodeKey) {
    const data = this._refreshSelectionRange();
    if (data == null) {
      return;
    }
    const { selectionRange, anchorIndex, rangeIndex } = data;

    let nextRangeNode = this.getNode(rootKey, nodeKey);
    if (nextRangeNode == null) {
      return;
    }
    const nextRangeIndex = nextRangeNode.calculateVisualIndex();
    if (nextRangeIndex === rangeIndex) {
      return;
    }

    const modMinIndex = Math.min(anchorIndex, rangeIndex, nextRangeIndex);
    const modMaxIndex = Math.max(anchorIndex, rangeIndex, nextRangeIndex);

    let beginIndex = 1;

    // traversing the tree, flip the isSelected flag when applicable.
    const roots = this.roots.map(rootNode => rootNode.setRecursive(
    // keep traversing the sub-tree,
    // - if the node is shown, has children, and in the applicable range.
    node => {
      if (!node.shouldBeShown) {
        return node;
      }
      if (node.shownChildrenCount === 1) {
        beginIndex++;
        return node;
      }
      const endIndex = beginIndex + node.shownChildrenCount - 1;
      if (beginIndex <= modMaxIndex && modMinIndex <= endIndex) {
        beginIndex++;
        return null;
      }
      beginIndex += node.shownChildrenCount;
      return node;
    },
    // flip the isSelected flag accordingly, based on previous and current range.
    node => {
      if (!node.shouldBeShown) {
        return node;
      }
      const curIndex = beginIndex - node.shownChildrenCount;
      const inOldRange = Math.sign(curIndex - anchorIndex) * Math.sign(curIndex - rangeIndex) !== 1;
      const inNewRange = Math.sign(curIndex - anchorIndex) * Math.sign(curIndex - nextRangeIndex) !== 1;
      if (inOldRange && inNewRange || !inOldRange && !inNewRange) {
        return node;
      } else if (inOldRange && !inNewRange) {
        return node.set({ isSelected: false, isFocused: false });
      } else {
        return node.set({ isSelected: true, isFocused: true });
      }
    }));
    this._setRoots(roots);

    // expand the range to merge existing selected nodes.
    const getNextNode = cur => nextRangeIndex < rangeIndex ? cur.findPrevious() : cur.findNext();
    let probe = getNextNode(nextRangeNode);
    while (probe != null && probe.isSelected()) {
      nextRangeNode = probe;
      probe = getNextNode(nextRangeNode);
    }
    this._setSelectionRange(selectionRange.withNewRange((_FileTreeSelectionRange || _load_FileTreeSelectionRange()).RangeKey.of(nextRangeNode)));
  }

  /**
   * Move the range of selections by one step.
   */
  _rangeSelectMove(move) {
    const data = this._refreshSelectionRange();
    if (data == null) {
      return;
    }
    const { selectionRange, anchorNode, rangeNode, direction } = data;
    const getNextNode = cur => move === 'up' ? cur.findPrevious() : cur.findNext();

    const isExpanding = direction === move || direction === 'none';

    if (isExpanding) {
      let nextNode = getNextNode(rangeNode);
      while (nextNode != null && nextNode.isSelected()) {
        nextNode = getNextNode(nextNode);
      }
      if (nextNode == null) {
        return;
      }
      nextNode = this._updateNode(nextNode, n => n.set({ isSelected: true, isFocused: true }));
      let probe = getNextNode(nextNode);
      while (probe != null && probe.isSelected()) {
        nextNode = probe;
        probe = getNextNode(nextNode);
      }
      this._setSelectionRange(selectionRange.withNewRange((_FileTreeSelectionRange || _load_FileTreeSelectionRange()).RangeKey.of(nextNode)));
      this._setTrackedNode(nextNode.rootUri, nextNode.uri);
    } else {
      let nextNode = rangeNode;
      while (nextNode != null && nextNode !== anchorNode && nextNode.isSelected() === false) {
        nextNode = getNextNode(nextNode);
      }
      if (nextNode == null) {
        return;
      }
      if (nextNode === anchorNode) {
        this._setSelectionRange(selectionRange.withNewRange((_FileTreeSelectionRange || _load_FileTreeSelectionRange()).RangeKey.of(nextNode)));
        return;
      }
      nextNode = this._updateNode(nextNode, n => n.set({ isSelected: false, isFocused: false }));
      this._setSelectionRange(selectionRange.withNewRange((_FileTreeSelectionRange || _load_FileTreeSelectionRange()).RangeKey.of(nextNode)));
      this._setTrackedNode(nextNode.rootUri, nextNode.uri);
    }
  }

  _rangeSelectUp() {
    this._rangeSelectMove('up');
  }

  _rangeSelectDown() {
    this._rangeSelectMove('down');
  }

  _selectFirstFilter() {
    let node = this.getSingleSelectedNode();
    // if the current node matches the filter do nothing
    if (node != null && node.matchesFilter) {
      return;
    }

    this._moveSelectionDown();
    node = this.getSingleSelectedNode();
    // if the selection does not find anything up go down
    if (node != null && !node.matchesFilter) {
      this._moveSelectionUp();
    }
  }

  /**
   * Moves the selection one node down. In case several nodes were selected, the topmost (first in
   * the natural visual order) is considered to be the reference point for the move.
   */
  _moveSelectionDown() {
    if (this.roots.isEmpty()) {
      return;
    }

    const selectedNodes = this.getSelectedNodes();

    let nodeToSelect;
    if (selectedNodes.isEmpty()) {
      nodeToSelect = this.roots.first();
    } else {
      const selectedNode = (0, (_nullthrows || _load_nullthrows()).default)(selectedNodes.first());
      nodeToSelect = selectedNode.findNext();
    }

    while (nodeToSelect != null && !nodeToSelect.matchesFilter) {
      nodeToSelect = nodeToSelect.findNext();
    }

    if (nodeToSelect != null) {
      this._setSelectedAndFocusedNode(nodeToSelect.rootUri, nodeToSelect.uri);
    }
  }

  /**
   * Moves the selection one node up. In case several nodes were selected, the topmost (first in
   * the natural visual order) is considered to be the reference point for the move.
   */
  _moveSelectionUp() {
    if (this.roots.isEmpty()) {
      return;
    }

    const selectedNodes = this.getSelectedNodes();

    let nodeToSelect;
    if (selectedNodes.isEmpty()) {
      nodeToSelect = (0, (_nullthrows || _load_nullthrows()).default)(this.roots.last()).findLastRecursiveChild();
    } else {
      const selectedNode = (0, (_nullthrows || _load_nullthrows()).default)(selectedNodes.first());
      nodeToSelect = selectedNode.findPrevious();
    }

    while (nodeToSelect != null && !nodeToSelect.matchesFilter) {
      nodeToSelect = nodeToSelect.findPrevious();
    }

    if (nodeToSelect != null) {
      this._setSelectedAndFocusedNode(nodeToSelect.rootUri, nodeToSelect.uri);
    }
  }

  _moveSelectionToTop() {
    if (this.roots.isEmpty()) {
      return;
    }

    let nodeToSelect = this.roots.first();
    if (nodeToSelect != null && !nodeToSelect.shouldBeShown) {
      nodeToSelect = nodeToSelect.findNext();
    }

    if (nodeToSelect != null) {
      this._setSelectedAndFocusedNode(nodeToSelect.uri, nodeToSelect.uri);
    }
  }

  _moveSelectionToBottom() {
    if (this.roots.isEmpty()) {
      return;
    }

    const lastRoot = this.roots.last();

    if (!(lastRoot != null)) {
      throw new Error('Invariant violation: "lastRoot != null"');
    }

    const lastChild = lastRoot.findLastRecursiveChild();

    if (!(lastChild != null)) {
      throw new Error('Invariant violation: "lastChild != null"');
    }

    this._setSelectedAndFocusedNode(lastChild.rootUri, lastChild.uri);
  }

  _clearDragHover() {
    this._updateRoots(root => {
      return root.setRecursive(node => node.containsDragHover ? null : node, node => node.setIsDragHovered(false));
    });
  }

  // Clear selections and focuses on all nodes except an optionally specified
  // current node.
  _clearSelection() {
    this.selectionManager.clearSelected();
    this.selectionManager.clearFocused();
    this._clearSelectionRange();
  }

  _setRootKeys(rootKeys) {
    const rootNodes = rootKeys.map(rootUri => {
      const root = this.roots.get(rootUri);
      if (root != null) {
        return root;
      }

      this._fetchChildKeys(rootUri);
      return new (_FileTreeNode || _load_FileTreeNode()).FileTreeNode({
        uri: rootUri,
        rootUri,
        isLoading: true,
        isExpanded: true,
        connectionTitle: (_FileTreeHelpers || _load_FileTreeHelpers()).default.getDisplayTitle(rootUri) || ''
      }, this._conf);
    });

    const roots = (_immutable || _load_immutable()).OrderedMap(rootNodes.map(root => [root.uri, root]));
    const removedRoots = this.roots.filter(root => !roots.has(root.uri));
    removedRoots.forEach(root => root.traverse(node => node.isExpanded, node => {
      if (node.subscription != null) {
        node.subscription.dispose();
      }
    }));

    this._setRoots(roots);

    // Just in case there's a race between the update of the root keys and the cwdKey and the cwdKey
    // is set too early - set it again. If there was no race - it's a noop.
    this._setCwdKey(this._cwdKey);
  }

  /**
   * Makes sure a certain child node is present in the file tree, creating all its ancestors, if
   * needed and scheduling a child key fetch. Used by the reveal active file functionality.
   */
  _ensureChildNode(nodeKey) {
    let firstRootUri;

    const expandNode = node => {
      if (node.isExpanded && node.subscription != null) {
        return node;
      }

      if (node.subscription != null) {
        node.subscription.dispose();
      }

      const directory = (_FileTreeHelpers || _load_FileTreeHelpers()).default.getDirectoryByKey(node.uri);
      const subscription = this._makeSubscription(node.uri, directory);
      return node.set({ subscription, isExpanded: true });
    };

    this._updateRoots(root => {
      if (!nodeKey.startsWith(root.uri)) {
        return root;
      }

      if (firstRootUri == null) {
        firstRootUri = root.uri;
      }

      const deepest = root.findDeepest(nodeKey);
      if (deepest == null) {
        return root;
      }

      if (deepest.uri === nodeKey) {
        return this._bubbleUp(deepest, deepest, expandNode);
      }

      const parents = [];
      let prevUri = nodeKey;
      let currentParentUri = (_FileTreeHelpers || _load_FileTreeHelpers()).default.getParentKey(nodeKey);
      const rootUri = root.uri;
      while (currentParentUri !== deepest.uri && currentParentUri !== prevUri) {
        parents.push(currentParentUri);
        prevUri = currentParentUri;
        currentParentUri = (_FileTreeHelpers || _load_FileTreeHelpers()).default.getParentKey(currentParentUri);
      }

      if (currentParentUri !== deepest.uri) {
        // Something went wrong - we didn't find the match
        return root;
      }

      let currentChild = new (_FileTreeNode || _load_FileTreeNode()).FileTreeNode({ uri: nodeKey, rootUri }, this._conf);

      parents.forEach(currentUri => {
        this._fetchChildKeys(currentUri);
        const parent = new (_FileTreeNode || _load_FileTreeNode()).FileTreeNode({
          uri: currentUri,
          rootUri,
          isLoading: true,
          isExpanded: true,
          children: (_FileTreeNode || _load_FileTreeNode()).FileTreeNode.childrenFromArray([currentChild])
        }, this._conf);

        currentChild = parent;
      });

      this._fetchChildKeys(deepest.uri);
      return this._bubbleUp(deepest, deepest.set({
        isLoading: true,
        isExpanded: true,
        isPendingLoad: true,
        children: deepest.children.set(currentChild.name, currentChild)
      }), expandNode);
    });

    if (firstRootUri != null) {
      this._setSelectedNode(firstRootUri, nodeKey);
    }
  }

  _clearTrackedNode() {
    if (this._trackedRootKey != null || this._trackedNodeKey != null) {
      this._trackedRootKey = null;
      this._trackedNodeKey = null;
      this._emitChange();
    }
  }

  _setTrackedNode(rootKey, nodeKey) {
    if (this._trackedRootKey !== rootKey || this._trackedNodeKey !== nodeKey) {
      this._trackedRootKey = rootKey;
      this._trackedNodeKey = nodeKey;
      this._emitChange();
    }
  }

  _setRepositories(repositories) {
    this._repositories = repositories;
    this._updateConf(conf => {
      const reposByRoot = {};
      this.roots.forEach(root => {
        reposByRoot[root.uri] = (0, (_nuclideVcsBase || _load_nuclideVcsBase()).repositoryForPath)(root.uri);
      });
      conf.reposByRoot = reposByRoot;
    });
  }

  _setWorkingSet(workingSet) {
    this._updateConf(conf => {
      conf.workingSet = workingSet;
    });
  }

  _setOpenFilesWorkingSet(openFilesWorkingSet) {
    // Optimization: with an empty working set, we don't need a full tree refresh.
    if (this._conf.workingSet.isEmpty()) {
      this._conf.openFilesWorkingSet = openFilesWorkingSet;
      this._emitChange();
      return;
    }
    this._updateConf(conf => {
      conf.openFilesWorkingSet = openFilesWorkingSet;
    });
  }

  _setWorkingSetsStore(workingSetsStore) {
    this._workingSetsStore = workingSetsStore;
  }

  _startEditingWorkingSet(editedWorkingSet) {
    this._updateConf(conf => {
      conf.editedWorkingSet = editedWorkingSet;
      conf.isEditingWorkingSet = true;
    });
  }

  _finishEditingWorkingSet() {
    this._updateConf(conf => {
      conf.isEditingWorkingSet = false;
      conf.editedWorkingSet = new (_nuclideWorkingSetsCommon || _load_nuclideWorkingSetsCommon()).WorkingSet();
    });
  }

  _checkNode(rootKey, nodeKey) {
    if (!this._conf.isEditingWorkingSet) {
      return;
    }

    let node = this.getNode(rootKey, nodeKey);
    if (node == null) {
      return;
    }

    let uriToAppend = nodeKey; // Workaround flow's (over)aggressive nullability detection

    const allChecked = nodeParent => {
      return nodeParent.children.every(c => {
        return !c.shouldBeShown || c.checkedStatus === 'checked' || c === node;
      });
    };

    while (node.parent != null && allChecked(node.parent)) {
      node = node.parent;
      uriToAppend = node.uri;
    }

    this._updateConf(conf => {
      conf.editedWorkingSet = conf.editedWorkingSet.append(uriToAppend);
    });
  }

  _uncheckNode(rootKey, nodeKey) {
    if (!this._conf.isEditingWorkingSet) {
      return;
    }

    let node = this.getNode(rootKey, nodeKey);
    if (node == null) {
      return;
    }

    const nodesToAppend = [];
    let uriToRemove = nodeKey;

    while (node.parent != null && node.parent.checkedStatus === 'checked') {
      const parent = node.parent; // Workaround flow's (over)aggressive nullability detection
      parent.children.forEach(c => {
        if (c !== node) {
          nodesToAppend.push(c);
        }
      });

      node = parent;
      uriToRemove = node.uri;
    }

    this._updateConf(conf => {
      const urisToAppend = nodesToAppend.map(n => n.uri);
      conf.editedWorkingSet = conf.editedWorkingSet.remove(uriToRemove).append(...urisToAppend);
    });
  }

  _setOpenFilesExpanded(openFilesExpanded) {
    this.openFilesExpanded = openFilesExpanded;
    this._emitChange();
  }

  _setUncommittedChangesExpanded(uncommittedChangesExpanded) {
    this.uncommittedChangesExpanded = uncommittedChangesExpanded;
    this._emitChange();
  }

  _setFoldersExpanded(foldersExpanded) {
    this.foldersExpanded = foldersExpanded;
    this._emitChange();
  }

  reset() {
    this.roots.forEach(root => {
      root.traverse(n => {
        if (n.subscription != null) {
          n.subscription.dispose();
        }

        return true;
      });
    });

    // Reset data store.
    this._conf = Object.assign({}, DEFAULT_CONF, { selectionManager: this.selectionManager });
    this._setRoots((_immutable || _load_immutable()).OrderedMap());
    this.selectionManager.clearSelected();
    this.selectionManager.clearFocused();
    this._trackedRootKey = null;
    this._trackedNodeKey = null;
  }

  subscribe(listener) {
    return this._emitter.on('change', listener);
  }

  getMaxComponentWidth() {
    return this._maxComponentWidth;
  }

  updateMaxComponentWidth(width) {
    if (width != null) {
      this._maxComponentWidth = Math.max(this._maxComponentWidth, width);
    }
  }
}

exports.FileTreeStore = FileTreeStore; /**
                                        * Performs a breadth-first iteration over the directories of the tree starting
                                        * with a given node. The iteration stops once a given limit of nodes (both directories
                                        * and files) were traversed.
                                        * The node being currently traversed can be obtained by calling .traversedNode()
                                        * .next() returns a promise that is fulfilled when the traversal moves on to
                                        * the next directory.
                                        */

class FileTreeStoreBfsIterator {

  constructor(fileTreeStore, rootKey, nodeKey, limit) {
    this._fileTreeStore = fileTreeStore;
    this._rootKey = rootKey;
    this._nodesToTraverse = [];
    this._currentlyTraversedNode = nodeKey;
    this._limit = limit;
    this._numNodesTraversed = 0;
    this._promise = null;
    this._count = 0;
  }

  _handlePromiseResolution(childrenKeys) {
    this._numNodesTraversed += childrenKeys.length;
    if (this._numNodesTraversed < this._limit) {
      const nextLevelNodes = childrenKeys.filter(childKey => (_FileTreeHelpers || _load_FileTreeHelpers()).default.isDirOrArchiveKey(childKey));
      this._nodesToTraverse = this._nodesToTraverse.concat(nextLevelNodes);

      this._currentlyTraversedNode = this._nodesToTraverse.splice(0, 1)[0];
      this._promise = null;
    } else {
      this._currentlyTraversedNode = null;
      this._promise = null;
    }

    return;
  }

  next() {
    const currentlyTraversedNode = this._currentlyTraversedNode;
    // flowlint-next-line sketchy-null-string:off
    if (!this._promise && currentlyTraversedNode) {
      this._promise = this._fileTreeStore.promiseNodeChildKeys(this._rootKey, currentlyTraversedNode).then(this._handlePromiseResolution.bind(this));
    }
    return this._promise;
  }

  traversedNode() {
    return this._currentlyTraversedNode;
  }
}