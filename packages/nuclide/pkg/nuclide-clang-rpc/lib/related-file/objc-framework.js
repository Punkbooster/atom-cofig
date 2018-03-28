'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getRelatedSourceForHeaderFromFramework = exports.getRelatedHeaderForSourceFromFramework = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getRelatedHeaderForSourceFromFramework = exports.getRelatedHeaderForSourceFromFramework = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (src) {
    const frameworkStructure = getFrameworkStructureFromSourceDir((_nuclideUri || _load_nuclideUri()).default.dirname(src));
    if (frameworkStructure == null) {
      return null;
    }
    const { frameworkPath, frameworkName, frameworkSubFolder } = frameworkStructure;
    const basename = (0, (_utils || _load_utils()).getFileBasename)(src);
    const headers = yield Promise.all(['Headers', 'PrivateHeaders'].map(function (headerFolder) {
      return (0, (_common || _load_common()).searchFileWithBasename)((_nuclideUri || _load_nuclideUri()).default.join(frameworkPath, headerFolder, frameworkName, frameworkSubFolder), basename, (_utils || _load_utils()).isHeaderFile);
    }));
    return headers.find(function (file) {
      return file != null;
    });
  });

  return function getRelatedHeaderForSourceFromFramework(_x) {
    return _ref.apply(this, arguments);
  };
})();

let getRelatedSourceForHeaderFromFramework = exports.getRelatedSourceForHeaderFromFramework = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (header) {
    const frameworkStructure = getFrameworkStructureFromHeaderDir((_nuclideUri || _load_nuclideUri()).default.dirname(header));
    if (frameworkStructure == null) {
      return null;
    }
    const { frameworkPath, frameworkSubFolder } = frameworkStructure;
    return (0, (_common || _load_common()).searchFileWithBasename)((_nuclideUri || _load_nuclideUri()).default.join(frameworkPath, 'Sources', frameworkSubFolder), (0, (_utils || _load_utils()).getFileBasename)(header), (_utils || _load_utils()).isSourceFile);
  });

  return function getRelatedSourceForHeaderFromFramework(_x2) {
    return _ref2.apply(this, arguments);
  };
})();

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _utils;

function _load_utils() {
  return _utils = require('../utils');
}

var _common;

function _load_common() {
  return _common = require('./common');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getFrameworkStructureFromSourceDir(dir) {
  const paths = (_nuclideUri || _load_nuclideUri()).default.split(dir).reverse();
  const rootIndex = paths.findIndex(folderName => folderName === 'Sources');
  if (rootIndex === -1) {
    return null;
  }
  const frameworkName = paths[rootIndex + 1];
  const frameworkPath = (_nuclideUri || _load_nuclideUri()).default.join(...paths.slice(rootIndex + 1).reverse());
  const frameworkSubPaths = paths.slice(0, rootIndex);
  const frameworkSubFolder = frameworkSubPaths.length === 0 ? '' : (_nuclideUri || _load_nuclideUri()).default.join(...frameworkSubPaths.reverse());
  return {
    frameworkPath,
    frameworkName,
    frameworkSubFolder
  };
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

function getFrameworkStructureFromHeaderDir(dir) {
  const paths = (_nuclideUri || _load_nuclideUri()).default.split(dir).reverse();
  const rootIndex = paths.findIndex(folderName => ['Headers', 'PrivateHeaders'].includes(folderName));
  if (rootIndex === -1) {
    return null;
  }
  const frameworkName = paths[rootIndex + 1];
  const frameworkPath = (_nuclideUri || _load_nuclideUri()).default.join(...paths.slice(rootIndex + 1).reverse());
  const frameworkSubPaths = paths.slice(0, rootIndex - 1);
  const frameworkSubFolder = frameworkSubPaths.length === 0 ? '' : (_nuclideUri || _load_nuclideUri()).default.join(...frameworkSubPaths.reverse());
  return {
    frameworkPath,
    frameworkName,
    frameworkSubFolder
  };
}