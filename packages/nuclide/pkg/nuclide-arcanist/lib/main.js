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

var _atom = require('atom');

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _registerGrammar;

function _load_registerGrammar() {
  return _registerGrammar = _interopRequireDefault(require('../../commons-atom/register-grammar'));
}

var _nuclideBusySignal;

function _load_nuclideBusySignal() {
  return _nuclideBusySignal = require('../../nuclide-busy-signal');
}

var _ArcanistDiagnosticsProvider;

function _load_ArcanistDiagnosticsProvider() {
  return _ArcanistDiagnosticsProvider = require('./ArcanistDiagnosticsProvider');
}

var _ArcBuildSystem;

function _load_ArcBuildSystem() {
  return _ArcBuildSystem = _interopRequireDefault(require('./ArcBuildSystem'));
}

var _openArcDeepLink;

function _load_openArcDeepLink() {
  return _openArcDeepLink = require('./openArcDeepLink');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
class Activation {

  constructor(state) {
    this._disposables = new _atom.CompositeDisposable();
    this._busySignalProvider = new (_nuclideBusySignal || _load_nuclideBusySignal()).DedupedBusySignalProviderBase();
    (0, (_registerGrammar || _load_registerGrammar()).default)('source.json', '.arcconfig');
  }

  dispose() {
    this._disposables.dispose();
  }

  setCwdApi(cwdApi) {
    this._cwdApi = cwdApi;
    if (this._buildSystem != null) {
      this._buildSystem.setCwdApi(cwdApi);
    }
  }

  provideBusySignal() {
    return this._busySignalProvider;
  }

  provideDiagnostics() {
    const provider = new (_ArcanistDiagnosticsProvider || _load_ArcanistDiagnosticsProvider()).ArcanistDiagnosticsProvider(this._busySignalProvider);
    this._disposables.add(provider);
    return provider;
  }

  consumeTaskRunnerServiceApi(api) {
    this._disposables.add(api.register(this._getBuildSystem()));
  }

  consumeOutputService(api) {
    this._disposables.add(api.registerOutputProvider({
      id: 'Arc Build',
      messages: this._getBuildSystem().getOutputMessages()
    }));
  }

  consumeCwdApi(api) {
    this.setCwdApi(api);

    let pkg = this;
    this._disposables.add({
      dispose() {
        pkg = null;
      }
    });
    return new _atom.Disposable(() => {
      if (pkg != null) {
        pkg.setCwdApi(null);
      }
    });
  }

  /**
   * Files can be opened relative to Arcanist directories via
   *   atom://nuclide/open-arc?project=<project_id>&path=<relative_path>
   * `line` and `column` can also be optionally provided as 1-based integers.
   */
  consumeDeepLinkService(deepLink) {
    this._disposables.add(deepLink.subscribeToPath('open-arc', params => {
      (0, (_openArcDeepLink || _load_openArcDeepLink()).openArcDeepLink)(params, this._remoteProjectsService);
    }));
  }

  consumeRemoteProjectsService(service) {
    this._remoteProjectsService = service;
    return new _atom.Disposable(() => {
      this._remoteProjectsService = null;
    });
  }

  _getBuildSystem() {
    if (this._buildSystem == null) {
      const buildSystem = new (_ArcBuildSystem || _load_ArcBuildSystem()).default();
      if (this._cwdApi != null) {
        buildSystem.setCwdApi(this._cwdApi);
      }
      this._disposables.add(buildSystem);
      this._buildSystem = buildSystem;
    }
    return this._buildSystem;
  }
}

exports.default = (0, (_createPackage || _load_createPackage()).default)(Activation);
module.exports = exports['default'];