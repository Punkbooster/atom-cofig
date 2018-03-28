'use strict';

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let findSourcePath = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (path) {
    if ((0, (_utils || _load_utils()).isHeaderFile)(path)) {
      const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getClangServiceByNuclideUri)(path);
      if (service != null) {
        const source = yield service.getRelatedSourceOrHeader(path);
        if (source != null) {
          return source;
        }
      }
    }
    return path;
  });

  return function findSourcePath(_x) {
    return _ref.apply(this, arguments);
  };
})();

let getClangProvidersForSource = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (_src) {
    const src = yield findSourcePath(_src);

    // $FlowFixMe(>=0.55.0) Flow suppress
    return (0, (_collection || _load_collection()).arrayCompact)((
    // $FlowFixMe(>=0.55.0) Flow suppress
    yield Promise.all([...clangProviders].map((() => {
      var _ref3 = (0, _asyncToGenerator.default)(function* (provider) {
        if (yield provider.supportsSource(src)) {
          return provider;
        }
        return null;
      });

      return function (_x3) {
        return _ref3.apply(this, arguments);
      };
    })())))).sort(function (provider) {
      return -provider.priority;
    });
  });

  return function getClangProvidersForSource(_x2) {
    return _ref2.apply(this, arguments);
  };
})();

let getClangRequestSettings = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (src) {
    const provider = (yield getClangProvidersForSource(src))[0];
    if (provider != null) {
      return provider.getSettings(src);
    }
  });

  return function getClangRequestSettings(_x4) {
    return _ref4.apply(this, arguments);
  };
})();

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _utils;

function _load_utils() {
  return _utils = require('../../nuclide-clang-rpc/lib/utils');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

const clangProviders = new Set();

function getDefaultFlags() {
  const config = (_featureConfig || _load_featureConfig()).default.get('nuclide-clang');
  if (!config.enableDefaultFlags) {
    return null;
  }
  return config.defaultFlags;
}

const clangServices = new WeakSet();

// eslint-disable-next-line rulesdir/no-commonjs
module.exports = {
  getDefaultFlags,
  getClangRequestSettings,
  registerClangProvider(provider) {
    clangProviders.add(provider);
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => clangProviders.delete(provider));
  },

  getRelatedSourceOrHeader(src) {
    return (0, _asyncToGenerator.default)(function* () {
      return (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getClangServiceByNuclideUri)(src).getRelatedSourceOrHeader(src, (yield getClangRequestSettings(src)));
    })();
  },

  getDiagnostics(editor) {
    return (0, _asyncToGenerator.default)(function* () {
      const src = editor.getPath();
      if (src == null) {
        return null;
      }
      const contents = editor.getText();

      const defaultFlags = getDefaultFlags();
      const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getClangServiceByNuclideUri)(src);

      // When we fetch diagnostics for the first time, reset the server state.
      // This is so the user can easily refresh the Clang + Buck state by reloading Atom.
      // At this time we also set the memory limit of the service.
      if (!clangServices.has(service)) {
        const config = (_featureConfig || _load_featureConfig()).default.get('nuclide-clang');
        clangServices.add(service);
        yield service.setMemoryLimit(config.serverProcessMemoryLimit);
        yield service.reset();
      }

      return service.compile(src, contents, (yield getClangRequestSettings(src)), defaultFlags).refCount().toPromise();
    })();
  },

  getCompletions(editor, prefix) {
    return (0, _asyncToGenerator.default)(function* () {
      const src = editor.getPath();
      if (src == null) {
        return null;
      }
      const cursor = editor.getLastCursor();

      const line = cursor.getBufferRow();
      const column = cursor.getBufferColumn();
      const tokenStartColumn = column - prefix.length;

      const defaultFlags = getDefaultFlags();
      const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getClangServiceByNuclideUri)(src);

      return service.getCompletions(src, editor.getText(), line, column, tokenStartColumn, prefix, (yield getClangRequestSettings(src)), defaultFlags);
    })();
  },

  /**
   * If a location can be found for the declaration, it will be available via
   * the 'location' field on the returned object.
   */
  getDeclaration(editor, line, column) {
    return (0, _asyncToGenerator.default)(function* () {
      const src = editor.getPath();
      if (src == null) {
        return null;
      }
      const defaultFlags = getDefaultFlags();
      const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getClangServiceByNuclideUri)(src);
      return service.getDeclaration(src, editor.getText(), line, column, (yield getClangRequestSettings(src)), defaultFlags);
    })();
  },

  getDeclarationInfo(editor, line, column) {
    return (0, _asyncToGenerator.default)(function* () {
      const src = editor.getPath();
      if (src == null) {
        return Promise.resolve(null);
      }
      const defaultFlags = getDefaultFlags();

      const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getClangServiceByNuclideUri)(src);
      if (service == null) {
        return Promise.resolve(null);
      }

      return service.getDeclarationInfo(src, editor.getText(), line, column, (yield getClangRequestSettings(src)), defaultFlags);
    })();
  },

  getOutline(editor) {
    return (0, _asyncToGenerator.default)(function* () {
      const src = editor.getPath();
      if (src == null) {
        return Promise.resolve();
      }
      const defaultFlags = getDefaultFlags();
      const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getClangServiceByNuclideUri)(src);
      return service.getOutline(src, editor.getText(), (yield getClangRequestSettings(src)), defaultFlags);
    })();
  },

  getLocalReferences(editor, line, column) {
    return (0, _asyncToGenerator.default)(function* () {
      const src = editor.getPath();
      if (src == null) {
        return Promise.resolve(null);
      }
      const defaultFlags = getDefaultFlags();

      const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getClangServiceByNuclideUri)(src);
      if (service == null) {
        return Promise.resolve(null);
      }

      return service.getLocalReferences(src, editor.getText(), line, column, (yield getClangRequestSettings(src)), defaultFlags);
    })();
  },

  formatCode(editor, range) {
    return (0, _asyncToGenerator.default)(function* () {
      const fileUri = editor.getPath();
      const buffer = editor.getBuffer();
      const cursor = buffer.characterIndexForPosition(editor.getLastCursor().getBufferPosition());
      if (fileUri == null) {
        return {
          formatted: editor.getText()
        };
      }
      const startIndex = buffer.characterIndexForPosition(range.start);
      const endIndex = buffer.characterIndexForPosition(range.end);
      const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getClangServiceByNuclideUri)(fileUri);
      return Object.assign({}, (yield service.formatCode(fileUri, editor.getText(), cursor, startIndex, endIndex - startIndex)));
    })();
  },

  resetForSource(editor) {
    return (0, _asyncToGenerator.default)(function* () {
      const src = editor.getPath();
      if (src != null) {
        (yield getClangProvidersForSource(src)).forEach(function (provider) {
          return provider.resetForSource(src);
        });
        const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getClangServiceByNuclideUri)(src);
        return service.resetForSource(src);
      }
    })();
  },

  reset(src) {
    return (0, _asyncToGenerator.default)(function* () {
      (yield getClangProvidersForSource(src)).forEach(function (provider) {
        return provider.reset(src);
      });
      yield (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getClangServiceByNuclideUri)(src).reset();
    })();
  }
};