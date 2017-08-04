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
exports.getMultiRootFileChanges = getMultiRootFileChanges;

var _collection;

function _load_collection() {
  return _collection = require('../../commons-node/collection');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _nuclideHgGitBridge;

function _load_nuclideHgGitBridge() {
  return _nuclideHgGitBridge = require('../../nuclide-hg-git-bridge');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getMultiRootFileChanges(fileChanges, rootPaths) {
  let roots;
  if (rootPaths == null) {
    roots = (0, (_collection || _load_collection()).arrayCompact)(atom.project.getDirectories().map(directory => {
      const rootPath = directory.getPath();
      const repository = (0, (_nuclideHgGitBridge || _load_nuclideHgGitBridge()).repositoryForPath)(rootPath);
      if (repository == null || repository.getType() !== 'hg') {
        return null;
      }
      return (_nuclideUri || _load_nuclideUri()).default.ensureTrailingSeparator(rootPath);
    }));
  } else {
    roots = rootPaths.map(root => (_nuclideUri || _load_nuclideUri()).default.ensureTrailingSeparator(root));
  }

  const sortedFilePaths = Array.from(fileChanges.entries()).sort(([filePath1], [filePath2]) => (_nuclideUri || _load_nuclideUri()).default.basename(filePath1).toLowerCase().localeCompare((_nuclideUri || _load_nuclideUri()).default.basename(filePath2).toLowerCase()));

  const changedRoots = new Map(roots.map(root => {
    const rootChanges = new Map(sortedFilePaths.filter(([filePath]) => (_nuclideUri || _load_nuclideUri()).default.contains(root, filePath)));
    return [root, rootChanges];
  }));

  return changedRoots;
}