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
exports.AtomLanguageService = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _CodeHighlightProvider;

function _load_CodeHighlightProvider() {
  return _CodeHighlightProvider = require('./CodeHighlightProvider');
}

var _OutlineViewProvider;

function _load_OutlineViewProvider() {
  return _OutlineViewProvider = require('./OutlineViewProvider');
}

var _TypeCoverageProvider;

function _load_TypeCoverageProvider() {
  return _TypeCoverageProvider = require('./TypeCoverageProvider');
}

var _DefinitionProvider;

function _load_DefinitionProvider() {
  return _DefinitionProvider = require('./DefinitionProvider');
}

var _TypeHintProvider;

function _load_TypeHintProvider() {
  return _TypeHintProvider = require('./TypeHintProvider');
}

var _CodeFormatProvider;

function _load_CodeFormatProvider() {
  return _CodeFormatProvider = require('./CodeFormatProvider');
}

var _FindReferencesProvider;

function _load_FindReferencesProvider() {
  return _FindReferencesProvider = require('./FindReferencesProvider');
}

var _EvaluationExpressionProvider;

function _load_EvaluationExpressionProvider() {
  return _EvaluationExpressionProvider = require('./EvaluationExpressionProvider');
}

var _AutocompleteProvider;

function _load_AutocompleteProvider() {
  return _AutocompleteProvider = require('./AutocompleteProvider');
}

var _DiagnosticsProvider;

function _load_DiagnosticsProvider() {
  return _DiagnosticsProvider = require('./DiagnosticsProvider');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class AtomLanguageService {

  constructor(languageServiceFactory, config) {
    this._config = config;
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    const lazy = true;
    this._connectionToLanguageService = new (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ConnectionCache(languageServiceFactory, lazy);
    this._subscriptions.add(this._connectionToLanguageService);
  }

  _selector() {
    return this._config.grammars.join(', ');
  }

  activate() {
    const highlightsConfig = this._config.highlights;
    if (highlightsConfig != null) {
      this._subscriptions.add((_CodeHighlightProvider || _load_CodeHighlightProvider()).CodeHighlightProvider.register(this._config.name, this._selector(), highlightsConfig, this._connectionToLanguageService));
    }

    const outlinesConfig = this._config.outlines;
    if (outlinesConfig != null) {
      this._subscriptions.add((_OutlineViewProvider || _load_OutlineViewProvider()).OutlineViewProvider.register(this._config.name, this._selector(), outlinesConfig, this._connectionToLanguageService));
    }

    const coverageConfig = this._config.coverage;
    if (coverageConfig != null) {
      this._subscriptions.add((_TypeCoverageProvider || _load_TypeCoverageProvider()).TypeCoverageProvider.register(this._config.name, this._selector(), coverageConfig, this._connectionToLanguageService));
    }

    const definitionConfig = this._config.definition;
    if (definitionConfig != null) {
      this._subscriptions.add((_DefinitionProvider || _load_DefinitionProvider()).DefinitionProvider.register(this._config.name, this._config.grammars, definitionConfig, this._connectionToLanguageService));
    }

    const typeHintConfig = this._config.typeHint;
    if (typeHintConfig != null) {
      this._subscriptions.add((_TypeHintProvider || _load_TypeHintProvider()).TypeHintProvider.register(this._config.name, this._selector(), typeHintConfig, this._connectionToLanguageService));
    }

    const codeFormatConfig = this._config.codeFormat;
    if (codeFormatConfig != null) {
      this._subscriptions.add((_CodeFormatProvider || _load_CodeFormatProvider()).CodeFormatProvider.register(this._config.name, this._selector(), codeFormatConfig, this._connectionToLanguageService));
    }

    const findReferencesConfig = this._config.findReferences;
    if (findReferencesConfig != null) {
      this._subscriptions.add((_FindReferencesProvider || _load_FindReferencesProvider()).FindReferencesProvider.register(this._config.name, this._config.grammars, findReferencesConfig, this._connectionToLanguageService));
    }

    const evaluationExpressionConfig = this._config.evaluationExpression;
    if (evaluationExpressionConfig != null) {
      this._subscriptions.add((_EvaluationExpressionProvider || _load_EvaluationExpressionProvider()).EvaluationExpressionProvider.register(this._config.name, this._selector(), evaluationExpressionConfig, this._connectionToLanguageService));
    }

    const autocompleteConfig = this._config.autocomplete;
    if (autocompleteConfig != null) {
      this._subscriptions.add((_AutocompleteProvider || _load_AutocompleteProvider()).AutocompleteProvider.register(this._config.name, this._config.grammars, autocompleteConfig, this._connectionToLanguageService));
    }

    const diagnosticsConfig = this._config.diagnostics;
    if (diagnosticsConfig != null) {
      this._subscriptions.add((0, (_DiagnosticsProvider || _load_DiagnosticsProvider()).registerDiagnostics)(this._config.name, this._config.grammars, diagnosticsConfig, this._connectionToLanguageService));
    }
  }

  getLanguageServiceForUri(fileUri) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const result = _this._connectionToLanguageService.getForUri(fileUri);
      return result == null ? null : yield result;
    })();
  }

  isFileInProject(fileUri) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const languageService = _this2._connectionToLanguageService.getExistingForUri(fileUri);
      if (languageService == null) {
        return false;
      }
      return yield (yield languageService).isFileInProject(fileUri);
    })();
  }

  observeLanguageServices() {
    return this._connectionToLanguageService.observeValues().switchMap(languageService => {
      return _rxjsBundlesRxMinJs.Observable.fromPromise(languageService);
    });
  }

  dispose() {
    this._subscriptions.dispose();
  }
}
exports.AtomLanguageService = AtomLanguageService;