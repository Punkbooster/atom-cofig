'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFileIndex = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getFileIndex = exports.getFileIndex = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (root, configFromFlow) {
    const client = new (_nuclideWatchmanHelpers || _load_nuclideWatchmanHelpers()).WatchmanClient();
    const exportCache = new (_ExportCache || _load_ExportCache()).default({ root, configFromFlow });
    const loadPromise = exportCache.load().then(function (success) {
      const logger = (0, (_log4js || _load_log4js()).getLogger)('js-imports-server');
      if (success) {
        logger.info(`Restored exports cache: ${exportCache.getByteSize()} bytes`);
      } else {
        logger.warn(`Could not find cached exports at ${exportCache.getPath()}`);
      }
    });

    // This is easier and performant enough to express as a glob.
    const nodeModulesPackageJsonFilesPromise = globListFiles(root, 'node_modules/*/package.json');
    const [jsFiles, nodeModulesPackageJsonFiles, mainFiles] = yield Promise.all([watchmanListFiles(client, root, '*.js').catch(function (err) {
      (0, (_log4js || _load_log4js()).getLogger)('js-imports-server').warn('Failed to get files with Watchman: falling back to glob', err);
      return hgListFiles(root, '**.js', TO_IGNORE).catch(function () {
        return findListFiles(root, '*.js', TO_IGNORE);
      }).catch(function () {
        return globListFiles(root, '**/*.js', TO_IGNORE);
      }).catch(function () {
        return [];
      }).then(filesWithoutHash);
    }), nodeModulesPackageJsonFilesPromise, watchmanListFiles(client, root, 'package.json').then(function (files) {
      return getMainFiles(root, files.map(function (file) {
        return file.name;
      }));
    }).catch(function () {
      return hgListFiles(root, '**/package.json', TO_IGNORE).catch(function () {
        return findListFiles(root, 'package.json', TO_IGNORE);
      }).catch(function () {
        return globListFiles(root, '**/package.json', TO_IGNORE);
      }).catch(function () {
        return [];
      }).then(function (files) {
        return getMainFiles(root, files);
      });
    }), loadPromise]);
    client.dispose();
    return { root, exportCache, jsFiles, nodeModulesPackageJsonFiles, mainFiles };
  });

  return function getFileIndex(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

let getMainFiles = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (root, packageJsons) {
    const results = yield (0, (_promise || _load_promise()).asyncLimit)(packageJsons, _os.default.cpus().length, (() => {
      var _ref3 = (0, _asyncToGenerator.default)(function* (packageJson) {
        try {
          const fullPath = (_nuclideUri || _load_nuclideUri()).default.join(root, packageJson);
          const data = yield (_fsPromise || _load_fsPromise()).default.readFile(fullPath, 'utf8');
          let main = JSON.parse(data).main || 'index.js';
          // Ignore things that go outside the scope of the package.json.
          if (main.startsWith('..')) {
            return null;
          }
          if (!main.endsWith('.js')) {
            main += '.js';
          }
          const dirname = (_nuclideUri || _load_nuclideUri()).default.dirname(fullPath);
          // Note: the main file may not necessarily exist.
          // We don't really need to check existence here, since non-existent files
          // will never be indexed anyway.
          return [(_nuclideUri || _load_nuclideUri()).default.resolve(dirname, main), dirname];
        } catch (err) {
          return null;
        }
      });

      return function (_x5) {
        return _ref3.apply(this, arguments);
      };
    })());
    return new Map(results.filter(Boolean));
  });

  return function getMainFiles(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
})();

exports.watchDirectory = watchDirectory;

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _os = _interopRequireDefault(require('os'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideWatchmanHelpers;

function _load_nuclideWatchmanHelpers() {
  return _nuclideWatchmanHelpers = require('nuclide-watchman-helpers');
}

var _ExportCache;

function _load_ExportCache() {
  return _ExportCache = _interopRequireDefault(require('./ExportCache'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const TO_IGNORE = ['**/node_modules/**', '**/VendorLib/**', '**/flow-typed/**']; /**
                                                                                  * Copyright (c) 2015-present, Facebook, Inc.
                                                                                  * All rights reserved.
                                                                                  *
                                                                                  * This source code is licensed under the license found in the LICENSE file in
                                                                                  * the root directory of this source tree.
                                                                                  *
                                                                                  * 
                                                                                  * @format
                                                                                  */

function getOutputLines(command, args, opts) {
  return (0, (_process || _load_process()).spawn)(command, args, opts).switchMap(proc => {
    return (0, (_process || _load_process()).getOutputStream)(proc).reduce((acc, result) => {
      if (result.kind === 'stdout') {
        acc.push(result.data.trimRight());
      }
      return acc;
    }, []);
  });
}

function hgListFiles(root, pattern, ignore) {
  const ignorePatterns = (0, (_collection || _load_collection()).arrayFlatten)(ignore.map(x => ['-X', x]));
  return getOutputLines('hg', ['files', '-I', pattern, ...ignorePatterns], {
    cwd: root
  }).toPromise();
}

function findListFiles(root, pattern, ignore) {
  const ignorePatterns = (0, (_collection || _load_collection()).arrayFlatten)(ignore.map(x => ['-not', '-path', x]));
  return getOutputLines('find', ['.', '-name', pattern, ...ignorePatterns], {
    cwd: root
  })
  // Strip the leading "./".
  .map(files => files.map(f => f.substr(2))).toPromise();
}

function globListFiles(root, pattern, ignore) {
  return (_fsPromise || _load_fsPromise()).default.glob(pattern, { cwd: root, ignore });
}

function watchmanListFiles(client, root, pattern) {
  return client.listFiles(root, getWatchmanExpression(root, pattern)).then(files => files.map(data => ({ name: data.name, sha1: data['content.sha1hex'] })));
}

function filesWithoutHash(files) {
  return files.map(name => ({ name, sha1: null }));
}

// TODO: watch node_modules and package.json files for changes.
function watchDirectory(root) {
  return _rxjsBundlesRxMinJs.Observable.defer(() => {
    const watchmanClient = new (_nuclideWatchmanHelpers || _load_nuclideWatchmanHelpers()).WatchmanClient();
    return _rxjsBundlesRxMinJs.Observable.using(() => new (_UniversalDisposable || _load_UniversalDisposable()).default(watchmanClient), () => _rxjsBundlesRxMinJs.Observable.fromPromise(watchmanClient.watchDirectoryRecursive(root, 'js-imports-subscription', getWatchmanExpression(root, '*.js'))).switchMap(watchmanSubscription => {
      return _rxjsBundlesRxMinJs.Observable.fromEvent(watchmanSubscription, 'change').switchMap(changes => _rxjsBundlesRxMinJs.Observable.from(changes.map(change => {
        const name = (_nuclideUri || _load_nuclideUri()).default.join(watchmanSubscription.root, change.name);
        if (!(_nuclideUri || _load_nuclideUri()).default.contains(root, name)) {
          return null;
        }
        return Object.assign({}, change, {
          name
        });
      }).filter(Boolean)));
    }));
  });
}

function getWatchmanExpression(root, pattern) {
  return {
    expression: ['allof', ['match', pattern], ['type', 'f'], ...getWatchmanMatchesFromIgnoredFiles()],
    fields: ['name', 'content.sha1hex']
  };
}

function getWatchmanMatchesFromIgnoredFiles() {
  return TO_IGNORE.map(patternToIgnore => {
    return ['not', ['match', patternToIgnore, 'wholename', { includedotfiles: true }]];
  });
}