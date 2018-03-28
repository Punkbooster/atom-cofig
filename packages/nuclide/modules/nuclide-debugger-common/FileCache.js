'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _helpers;

function _load_helpers() {
  return _helpers = require('./helpers');
}

var _File;

function _load_File() {
  return _File = _interopRequireDefault(require('./File'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Handles registering files encountered during debugging with the Chrome debugger
 */
/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

class FileCache {

  constructor(sendServerMethod) {
    this._sendServerMethod = sendServerMethod;
    this._files = new Map();
    this._realpathCache = {};
  }

  registerFile(fileUrl) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const filepath = (0, (_helpers || _load_helpers()).uriToPath)(fileUrl);
      let realFilepath;
      try {
        realFilepath = yield (_fsPromise || _load_fsPromise()).default.realpath(filepath, _this._realpathCache);
      } catch (error) {
        realFilepath = filepath;
      }
      if (!_this._files.has(filepath)) {
        _this._files.set(filepath, new (_File || _load_File()).default(filepath));
        _this._sendServerMethod('Debugger.scriptParsed', {
          scriptId: filepath,
          url: (0, (_helpers || _load_helpers()).pathToUri)(realFilepath),
          startLine: 0,
          startColumn: 0,
          endLine: 0,
          endColumn: 0
        });
      }
      const result = _this._files.get(filepath);

      if (!(result != null)) {
        throw new Error('Invariant violation: "result != null"');
      }

      return result;
    })();
  }

  getFileSource(filepath) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      try {
        const file = yield _this2.registerFile(filepath);
        return file.getSource();
      } catch (e) {
        (0, (_log4js || _load_log4js()).getLogger)('DebuggerFileCache').error(`Failed to get source for path ${filepath}: ${e.toString()}`);
        return '';
      }
    })();
  }
}
exports.default = FileCache;