'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SyntacticSelectionProvider = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideOpenFiles;

function _load_nuclideOpenFiles() {
  return _nuclideOpenFiles = require('../../nuclide-open-files');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class SyntacticSelectionProvider {

  constructor(name, grammarScopes, priority, expandAnalyticsEventName, collapseAnalyticsEventName, connectionToLanguageService) {
    this.name = name;
    this.grammarScopes = grammarScopes;
    this.priority = priority;
    this._expandAnalyticsEventName = expandAnalyticsEventName;
    this._collapseAnalyticsEventName = collapseAnalyticsEventName;
    this._connectionToLanguageService = connectionToLanguageService;
  }

  static register(name, grammarScopes, config, connectionToLanguageService) {
    return atom.packages.serviceHub.provide('nuclide-syntactic-selection', config.version, new SyntacticSelectionProvider(name, grammarScopes, config.priority, config.expandAnalyticsEventName, config.collapseAnalyticsEventName, connectionToLanguageService));
  }

  getExpandedSelectionRange(editor) {
    var _this = this;

    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)(this._expandAnalyticsEventName, (0, _asyncToGenerator.default)(function* () {
      const fileVersion = yield (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getFileVersionOfEditor)(editor);
      const languageService = _this._connectionToLanguageService.getForUri(editor.getPath());
      if (languageService == null || fileVersion == null) {
        return null;
      }

      return (yield languageService).getExpandedSelectionRange(fileVersion, editor.getSelectedBufferRange());
    }));
  }

  getCollapsedSelectionRange(editor, originalCursorPosition) {
    var _this2 = this;

    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)(this._collapseAnalyticsEventName, (0, _asyncToGenerator.default)(function* () {
      const fileVersion = yield (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getFileVersionOfEditor)(editor);
      const languageService = _this2._connectionToLanguageService.getForUri(editor.getPath());
      if (languageService == null || fileVersion == null) {
        return null;
      }

      return (yield languageService).getCollapsedSelectionRange(fileVersion, editor.getSelectedBufferRange(), originalCursorPosition);
    }));
  }
}

exports.SyntacticSelectionProvider = SyntacticSelectionProvider; // Ensures that SyntacticSelectionProvider has all the fields and methods defined in
// the SyntacticSelectionProvider type in the atom-ide-syntactic-selection package.
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

null;