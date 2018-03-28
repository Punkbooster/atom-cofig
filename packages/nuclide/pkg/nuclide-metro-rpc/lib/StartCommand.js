'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getStartCommandFromBuck = exports.getStartCommandFromNodePackage = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

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

let getStartCommandFromNodePackage = exports.getStartCommandFromNodePackage = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (projectRoot) {
    return (yield getStartCommandFromNodeModules(projectRoot)) || getStartCommandFromReactNative(projectRoot);
  });

  return function getStartCommandFromNodePackage(_x) {
    return _ref.apply(this, arguments);
  };
})();

let getStartCommandFromBuck = exports.getStartCommandFromBuck = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (projectRoot) {
    const buckProjectRoot = yield (0, (_nuclideBuckRpc || _load_nuclideBuckRpc()).getRootForPath)(projectRoot);
    if (buckProjectRoot == null) {
      return null;
    }
    // TODO(matthewwithanm): Move this to BuckUtils?
    const filePath = (_nuclideUri || _load_nuclideUri()).default.join(buckProjectRoot, '.buckconfig');
    const content = yield (_fsPromise || _load_fsPromise()).default.readFile(filePath, 'utf8');
    const parsed = (_ini || _load_ini()).default.parse(`scope = global\n${content}`);
    const section = parsed['react-native'];
    if (section == null || section.server == null) {
      return null;
    }
    return {
      cwd: buckProjectRoot,
      args: ['--disable-global-hotkey'],
      command: section.server
    };
  });

  return function getStartCommandFromBuck(_x2) {
    return _ref2.apply(this, arguments);
  };
})();

/**
 * Look in the nearest node_modules directory for react-native and extract the packager script if
 * it's found.
 */


let getStartCommandFromNodeModules = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (projectRoot) {
    const nodeModulesParent = yield (_fsPromise || _load_fsPromise()).default.findNearestFile('node_modules', projectRoot);
    if (nodeModulesParent == null) {
      return null;
    }

    const command = yield getCommandForCli((_nuclideUri || _load_nuclideUri()).default.join(nodeModulesParent, 'node_modules', 'react-native'));

    return command == null ? null : Object.assign({}, command, {
      cwd: nodeModulesParent
    });
  });

  return function getStartCommandFromNodeModules(_x3) {
    return _ref3.apply(this, arguments);
  };
})();

/**
 * See if this is React Native itself and, if so, return the command to run the packager. This is
 * special cased so that the bundled examples work out of the box.
 */


let getStartCommandFromReactNative = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (dir) {
    const projectRoot = yield (_fsPromise || _load_fsPromise()).default.findNearestFile('package.json', dir);
    if (projectRoot == null) {
      return null;
    }
    const filePath = (_nuclideUri || _load_nuclideUri()).default.join(projectRoot, 'package.json');
    const content = yield (_fsPromise || _load_fsPromise()).default.readFile(filePath, 'utf8');
    const parsed = JSON.parse(content);
    const isReactNative = parsed.name === 'react-native';

    if (!isReactNative) {
      return null;
    }

    const command = yield getCommandForCli(projectRoot);

    return command == null ? null : Object.assign({}, command, {
      cwd: projectRoot
    });
  });

  return function getStartCommandFromReactNative(_x4) {
    return _ref4.apply(this, arguments);
  };
})();

let getCommandForCli = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* (pathToReactNative) {
    const cliPath = (_nuclideUri || _load_nuclideUri()).default.join(pathToReactNative, 'local-cli', 'cli.js');
    const cliExists = yield (_fsPromise || _load_fsPromise()).default.exists(cliPath);
    if (!cliExists) {
      return null;
    }
    return {
      command: 'node',
      args: [cliPath, 'start']
    };
  });

  return function getCommandForCli(_x5) {
    return _ref5.apply(this, arguments);
  };
})();

var _nuclideBuckRpc;

function _load_nuclideBuckRpc() {
  return _nuclideBuckRpc = require('../../nuclide-buck-rpc');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _ini;

function _load_ini() {
  return _ini = _interopRequireDefault(require('ini'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }