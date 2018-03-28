'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__test__ = undefined;

var _memoize2;

function _load_memoize() {
  return _memoize2 = _interopRequireDefault(require('lodash/memoize'));
}

exports.proxyFilename = proxyFilename;
exports.createProxyFactory = createProxyFactory;

var _fs = _interopRequireDefault(require('fs'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _module = _interopRequireDefault(require('module'));

var _os = _interopRequireDefault(require('os'));

var _memoizeWithDisk;

function _load_memoizeWithDisk() {
  return _memoizeWithDisk = _interopRequireDefault(require('../../commons-node/memoizeWithDisk'));
}

var _serviceParser;

function _load_serviceParser() {
  return _serviceParser = require('./service-parser');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** Cache for remote proxies. */
const proxiesCache = new Map();

// Proxy dependencies
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

function proxyFilename(definitionPath) {
  if (!(_nuclideUri || _load_nuclideUri()).default.isAbsolute(definitionPath)) {
    throw new Error(`"${definitionPath}" definition path must be absolute.`);
  }

  const dir = (_nuclideUri || _load_nuclideUri()).default.dirname(definitionPath);
  const name = (_nuclideUri || _load_nuclideUri()).default.basename(definitionPath, (_nuclideUri || _load_nuclideUri()).default.extname(definitionPath));
  const filename = (_nuclideUri || _load_nuclideUri()).default.join(dir, name + 'Proxy.js');
  return filename;
}

function createProxyFactory(serviceName, preserveFunctionNames, definitionPath, predefinedTypes) {
  if (!proxiesCache.has(definitionPath)) {
    const filename = proxyFilename(definitionPath);

    let code;
    if (_fs.default.existsSync(filename)) {
      code = _fs.default.readFileSync(filename, 'utf8');
    } else {
      const definitionSource = _fs.default.readFileSync(definitionPath, 'utf8');
      const defs = (0, (_serviceParser || _load_serviceParser()).parseServiceDefinition)(definitionPath, definitionSource, predefinedTypes);
      code = memoizedGenerateProxy(serviceName, preserveFunctionNames, defs);
    }

    const m = loadCodeAsModule(code, filename);
    m.exports.inject(_rxjsBundlesRxMinJs.Observable);

    proxiesCache.set(definitionPath, m.exports);
  }

  const factory = proxiesCache.get(definitionPath);

  if (!(factory != null)) {
    throw new Error('Invariant violation: "factory != null"');
  }

  return factory;
}

const memoizedReadFile = (0, (_memoize2 || _load_memoize()).default)(filename => {
  return _fs.default.readFileSync(filename, 'utf8');
});

const memoizedGenerateProxy = (0, (_memoizeWithDisk || _load_memoizeWithDisk()).default)(function generateProxy(serviceName, preserveFunctionNames, defs) {
  // External dependencies: ensure that they're included in the key below.
  const createProxyGenerator = require('./proxy-generator').default;
  const generate = require('babel-generator').default;
  const t = require('babel-types');
  return createProxyGenerator(t, generate).generateProxy(serviceName, preserveFunctionNames, defs);
}, (serviceName, preserveFunctionNames, defs) => [serviceName, preserveFunctionNames, defs, memoizedReadFile(require.resolve('./proxy-generator')), require('babel-generator/package.json').version, require('babel-types/package.json').version], (_nuclideUri || _load_nuclideUri()).default.join(_os.default.tmpdir(), 'nuclide-rpc-cache'));

function loadCodeAsModule(code, filename) {
  if (!(code.length > 0)) {
    throw new Error('Code must not be empty.');
  }

  const m = new _module.default(filename);
  m.filename = filename;
  m.paths = []; // Disallow require resolving by removing lookup paths.
  m._compile(code, filename);
  m.loaded = true;

  return m;
}

// Export caches for testing.
const __test__ = exports.__test__ = {
  proxiesCache
};