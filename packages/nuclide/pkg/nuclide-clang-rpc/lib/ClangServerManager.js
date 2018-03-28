'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let augmentDefaultFlags = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (src, flags) {
    if (_getDefaultFlags === undefined) {
      _getDefaultFlags = null;
      try {
        // $FlowFB
        _getDefaultFlags = require('./fb/custom-flags').getDefaultFlags;
      } catch (e) {
        // Open-source version
      }
    }
    if (_getDefaultFlags != null) {
      return flags.concat((yield _getDefaultFlags(src)));
    }
    return flags;
  });

  return function augmentDefaultFlags(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

var _lruCache;

function _load_lruCache() {
  return _lruCache = _interopRequireDefault(require('lru-cache'));
}

var _os = _interopRequireDefault(require('os'));

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _ClangFlagsManager;

function _load_ClangFlagsManager() {
  return _ClangFlagsManager = _interopRequireDefault(require('./ClangFlagsManager'));
}

var _ClangServer;

function _load_ClangServer() {
  return _ClangServer = _interopRequireDefault(require('./ClangServer'));
}

var _findClangServerArgs;

function _load_findClangServerArgs() {
  return _findClangServerArgs = _interopRequireDefault(require('./find-clang-server-args'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Limit the number of active Clang servers.
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

const SERVER_LIMIT = 20;

// Limit the total memory usage of all Clang servers.
const DEFAULT_MEMORY_LIMIT = Math.round(_os.default.totalmem() * 15 / 100);

let _getDefaultFlags;
class ClangServerManager {

  constructor() {
    this._memoryLimit = DEFAULT_MEMORY_LIMIT;

    this._flagsManager = new (_ClangFlagsManager || _load_ClangFlagsManager()).default();
    this._servers = new (_lruCache || _load_lruCache()).default({
      max: SERVER_LIMIT,
      dispose(_, val) {
        val.dispose();
      }
    });
    // Avoid race conditions with simultaneous _checkMemoryUsage calls.
    this._checkMemoryUsage = (0, (_promise || _load_promise()).serializeAsyncCall)(this._checkMemoryUsageImpl.bind(this));
  }

  getClangFlagsManager() {
    return this._flagsManager;
  }

  setMemoryLimit(percent) {
    this._memoryLimit = Math.round(Math.abs(_os.default.totalmem() * percent / 100));
    this._checkMemoryUsage();
  }

  /**
   * Spawn one Clang server per translation unit (i.e. source file).
   * This allows working on multiple files at once, and simplifies per-file state handling.
   *
   * TODO(hansonw): We should ideally restart on change for all service requests.
   * However, restarting (and refetching flags) can take a very long time.
   * Currently, there's no "status" observable, so we can only provide a busy signal to the user
   * on diagnostic requests - and hence we only restart on 'compile' requests.
   */
  getClangServer(src, contents, _requestSettings, defaultFlags, restartIfChanged) {
    const requestSettings = _requestSettings || {
      compilationDatabase: null,
      projectRoot: null
    };
    let server = this._servers.get(src);
    if (server != null) {
      if (restartIfChanged && server.getFlagsChanged()) {
        this.reset(src);
      } else {
        return server;
      }
    }
    const compilationDB = requestSettings.compilationDatabase;
    server = new (_ClangServer || _load_ClangServer()).default(src, contents, (0, (_findClangServerArgs || _load_findClangServerArgs()).default)(src, compilationDB == null ? null : compilationDB.libclangPath), this._getFlags(src, requestSettings, defaultFlags));
    server.waitForReady().then(() => this._checkMemoryUsage());
    this._servers.set(src, server);
    return server;
  }

  // 1. Attempt to get flags from ClangFlagsManager.
  // 2. Otherwise, fall back to default flags.
  _getFlags(src, requestSettings, defaultFlags) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const flagsData = yield _this._flagsManager.getFlagsForSrc(src, requestSettings).catch(function (e) {
        (0, (_log4js || _load_log4js()).getLogger)('nuclide-clang-rpc').error(`Error getting flags for ${src}:`, e);
        return null;
      });
      if (flagsData != null && flagsData.flags.length > 0) {
        // Flags length could be 0 if the clang provider wants us to watch the
        // flags file but doesn't have accurate flags (e.g. header-only libs).
        return {
          flags: flagsData.flags,
          usesDefaultFlags: false,
          flagsFile: flagsData.flagsFile
        };
      } else if (defaultFlags != null) {
        return {
          flags: yield augmentDefaultFlags(src, defaultFlags),
          usesDefaultFlags: true,
          flagsFile: flagsData != null ? flagsData.flagsFile : null
        };
      } else {
        return null;
      }
    })();
  }

  reset(src) {
    if (src != null) {
      this._servers.del(src);
    } else {
      this._servers.reset();
    }
    this._flagsManager.reset();
  }

  dispose() {
    this._servers.reset();
    this._flagsManager.reset();
  }

  _checkMemoryUsageImpl() {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const serverPids = _this2._servers.values().map(function (server) {
        return server.getPID();
      }).filter(Boolean);
      if (serverPids.length === 0) {
        return 0;
      }

      let total = 0;
      const usage = new Map();
      try {
        const stdout = yield (0, (_process || _load_process()).runCommand)('ps', ['-p', serverPids.join(','), '-o', 'pid=', '-o', 'rss=']).toPromise();
        stdout.split('\n').forEach(function (line) {
          const parts = line.split(/\s+/);
          if (parts.length === 2) {
            const [pid, rss] = parts.map(function (x) {
              return parseInt(x, 10);
            });
            usage.set(pid, rss);
            total += rss;
          }
        });
      } catch (err) {}
      // Ignore errors.


      // Remove servers until we're under the memory limit.
      // Make sure we allow at least one server to stay alive.
      let count = usage.size;
      if (count > 1 && total > _this2._memoryLimit) {
        const toDispose = [];
        _this2._servers.rforEach(function (server, key) {
          const mem = usage.get(server.getPID());
          if (mem != null && count > 1 && total > _this2._memoryLimit) {
            total -= mem;
            count--;
            toDispose.push(key);
          }
        });
        toDispose.forEach(function (key) {
          return _this2._servers.del(key);
        });
      }

      return total;
    })();
  }
}
exports.default = ClangServerManager;