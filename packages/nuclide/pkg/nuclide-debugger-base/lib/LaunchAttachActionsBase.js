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
exports.LaunchAttachActionsBase = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _consumeFirstProvider;

function _load_consumeFirstProvider() {
  return _consumeFirstProvider = _interopRequireDefault(require('../../commons-atom/consumeFirstProvider'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ATTACH_TARGET_LIST_REFRESH_INTERVAL = 2000;class LaunchAttachActionsBase {

  constructor(targetUri) {
    this._targetUri = targetUri;
    this._refreshTimerId = null;
    this._parentUIVisible = true; // Visible by default.
    this._attachUIVisible = false;
    this.updateAttachTargetList = this.updateAttachTargetList.bind(this);
    this.updateParentUIVisibility = this.updateParentUIVisibility.bind(this);
    this.updateAttachUIVisibility = this.updateAttachUIVisibility.bind(this);
  }

  getTargetUri() {
    return this._targetUri;
  }

  updateParentUIVisibility(visible) {
    this._parentUIVisible = visible;
    this._updateAutoRefresh();
  }

  updateAttachUIVisibility(visible) {
    this._attachUIVisible = visible;
    this._updateAutoRefresh();
  }

  _updateAutoRefresh() {
    if (this._parentUIVisible && this._attachUIVisible) {
      this._refreshTimerId = setInterval(this.updateAttachTargetList, ATTACH_TARGET_LIST_REFRESH_INTERVAL);
    } else {
      this._killAutoRefreshTimer();
    }
  }

  updateAttachTargetList() {
    throw Error('Not implemented');
  }

  _killAutoRefreshTimer() {
    if (this._refreshTimerId != null) {
      clearTimeout(this._refreshTimerId);
      this._refreshTimerId = null;
    }
  }

  toggleLaunchAttachDialog() {
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:toggle-launch-attach');
  }

  showDebuggerPanel() {
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
  }

  startDebugging(processInfo) {
    return (0, _asyncToGenerator.default)(function* () {
      const debuggerService = yield (0, (_consumeFirstProvider || _load_consumeFirstProvider()).default)('nuclide-debugger.remote');
      yield debuggerService.startDebugging(processInfo);
    })();
  }

  dispose() {
    this._killAutoRefreshTimer();
  }
}
exports.LaunchAttachActionsBase = LaunchAttachActionsBase;