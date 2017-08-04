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
exports.RecentFilesProvider = undefined;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _reactForAtom = require('react-for-atom');

var _collection;

function _load_collection() {
  return _collection = require('../../commons-node/collection');
}

var _string;

function _load_string() {
  return _string = require('../../commons-node/string');
}

var _nuclideFuzzyNative;

function _load_nuclideFuzzyNative() {
  return _nuclideFuzzyNative = require('../../nuclide-fuzzy-native');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Imported from nuclide-files-service, which is an apm package, preventing a direct import.
let _recentFilesService = null;

function getRecentFilesMatching(query) {
  if (_recentFilesService == null) {
    return [];
  }
  const projectPaths = atom.project.getPaths();
  const openFiles = new Set((0, (_collection || _load_collection()).arrayCompact)(atom.workspace.getTextEditors().map(editor => editor.getPath())));
  const validRecentFiles = _recentFilesService.getRecentFiles().filter(result => !openFiles.has(result.path) && projectPaths.some(projectPath => result.path.indexOf(projectPath) !== -1));
  const timestamps = new Map();
  const matcher = new (_nuclideFuzzyNative || _load_nuclideFuzzyNative()).Matcher(validRecentFiles.map(recentFile => {
    timestamps.set(recentFile.path, recentFile.timestamp);
    return recentFile.path;
  }));
  return matcher.match(query, { recordMatchIndexes: true }).map(result => ({
    path: result.value,
    score: result.score,
    matchIndexes: result.matchIndexes,
    timestamp: timestamps.get(result.value) || 0
  }))
  // $FlowIssue Flow seems to type the arguments to `sort` as `FileResult` without `timestamp`.
  .sort((a, b) => b.timestamp - a.timestamp);
}

const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;
const MIN_OPACITY = 0.6;
const SHELF = 8 * MS_PER_HOUR; // 8 hours: heuristic for "current work day".
const FALLOFF = 1.1;
/**
 * Calculate opacity with logarithmic falloff based on recency of the timestamp.
 *
 *  Opacity                     now
 *  ^                           |
 *  |                  < SHELF >
 *  |                  #########
 *  |                  #########
 *  |   < FALLOFF >  ###########
 *  |               ############
 *  |            ###############
 *  |        ###################
 *  | ##########################  ] MIN_OPACITY
 *  | ##########################  ]
 *  +----------Time-------------->
 */
function opacityForTimestamp(timestamp) {
  const ageInMS = Date.now() - timestamp;
  return Math.min(1, Math.max(1 - FALLOFF * Math.log10((ageInMS - SHELF) / MS_PER_DAY + 1), MIN_OPACITY));
}

const RecentFilesProvider = exports.RecentFilesProvider = {

  getName() {
    return 'RecentFilesProvider';
  },

  getProviderType() {
    return 'GLOBAL';
  },

  getDebounceDelay() {
    return 0;
  },

  isRenderable() {
    return true;
  },

  getAction() {
    return 'nuclide-recent-files-provider:toggle-provider';
  },

  getPromptText() {
    return 'Search recently opened files';
  },

  getTabTitle() {
    return 'Recent Files';
  },

  executeQuery(query) {
    return Promise.resolve(getRecentFilesMatching(query));
  },

  setRecentFilesService(service) {
    _recentFilesService = service;
  },

  getComponentForItem(item) {
    const filename = (_nuclideUri || _load_nuclideUri()).default.basename(item.path);
    const filePath = item.path.substring(0, item.path.lastIndexOf(filename));
    const date = item.timestamp == null ? null : new Date(item.timestamp);
    const datetime = date === null ? '' : date.toLocaleString();
    return _reactForAtom.React.createElement(
      'div',
      {
        className: 'recent-files-provider-result',
        style: { opacity: opacityForTimestamp(item.timestamp || Date.now()) },
        title: datetime },
      _reactForAtom.React.createElement(
        'div',
        { className: 'recent-files-provider-filepath-container' },
        _reactForAtom.React.createElement(
          'span',
          {
            className: 'icon icon-file-text file recent-files-provider-file-path',
            'data-name': filename },
          filePath
        ),
        _reactForAtom.React.createElement(
          'span',
          { className: 'recent-files-provider-file-name' },
          filename
        )
      ),
      _reactForAtom.React.createElement(
        'div',
        { className: 'recent-files-provider-datetime-container' },
        _reactForAtom.React.createElement(
          'span',
          { className: 'recent-files-provider-datetime-label' },
          date === null ? 'At some point' : (0, (_string || _load_string()).relativeDate)(date)
        )
      )
    );
  }

};