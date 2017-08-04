'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _reactForAtom = require('react-for-atom');

var _atom = require('atom');

var _StatusBarTile;

function _load_StatusBarTile() {
  return _StatusBarTile = _interopRequireDefault(require('./StatusBarTile'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _ConnectionState;

function _load_ConnectionState() {
  return _ConnectionState = _interopRequireDefault(require('./ConnectionState'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class RemoteProjectsController {

  constructor() {
    this._statusBarTile = null;
    this._disposables = new _atom.CompositeDisposable();

    this._statusSubscription = null;
    this._disposables.add(atom.workspace.onDidChangeActivePaneItem(this._disposeSubscription.bind(this)), atom.workspace.onDidStopChangingActivePaneItem(this._updateConnectionStatus.bind(this)));
  }

  _disposeSubscription() {
    const subscription = this._statusSubscription;
    if (subscription) {
      this._disposables.remove(subscription);
      subscription.dispose();
      this._statusSubscription = null;
    }
  }

  _updateConnectionStatus(paneItem) {
    this._disposeSubscription();

    if (!atom.workspace.isTextEditor(paneItem)) {
      this._renderStatusBar((_ConnectionState || _load_ConnectionState()).default.NONE);
      return;
    }
    // Flow does not understand that isTextEditor refines the type to atom$TextEditor
    const textEditor = paneItem;
    const fileUri = textEditor.getPath();
    if (!fileUri) {
      return;
    }
    if ((_nuclideUri || _load_nuclideUri()).default.isLocal(fileUri)) {
      this._renderStatusBar((_ConnectionState || _load_ConnectionState()).default.LOCAL, fileUri);
      return;
    }

    const updateStatus = isConnected => {
      this._renderStatusBar(isConnected ? (_ConnectionState || _load_ConnectionState()).default.CONNECTED : (_ConnectionState || _load_ConnectionState()).default.DISCONNECTED, fileUri);
    };

    const connection = (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ServerConnection.getForUri(fileUri);
    if (connection == null) {
      updateStatus(false);
      return;
    }

    const socket = connection.getSocket();
    updateStatus(socket.isConnected());

    this._statusSubscription = socket.onStatus(updateStatus);
    this._disposables.add(this._statusSubscription);
  }

  consumeStatusBar(statusBar) {
    this._statusBarDiv = document.createElement('div');
    this._statusBarDiv.className = 'nuclide-remote-projects inline-block';

    const tooltip = atom.tooltips.add(this._statusBarDiv, { title: 'Click to show details of connection.' });

    if (!this._statusBarDiv) {
      throw new Error('Invariant violation: "this._statusBarDiv"');
    }

    const rightTile = statusBar.addLeftTile({
      item: this._statusBarDiv,
      priority: -99
    });

    this._disposables.add(new _atom.Disposable(() => {
      if (!this._statusBarDiv) {
        throw new Error('Invariant violation: "this._statusBarDiv"');
      }

      const parentNode = this._statusBarDiv.parentNode;
      if (parentNode) {
        parentNode.removeChild(this._statusBarDiv);
      }
      _reactForAtom.ReactDOM.unmountComponentAtNode(this._statusBarDiv);
      this._statusBarDiv = null;
      rightTile.destroy();
      tooltip.dispose();
    }));

    const textEditor = atom.workspace.getActiveTextEditor();
    if (textEditor != null) {
      this._updateConnectionStatus(textEditor);
    }
  }

  _renderStatusBar(connectionState, fileUri) {
    if (!this._statusBarDiv) {
      return;
    }

    const component = _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement((_StatusBarTile || _load_StatusBarTile()).default, {
      connectionState: connectionState,
      fileUri: fileUri
    }), this._statusBarDiv);

    if (!(component instanceof (_StatusBarTile || _load_StatusBarTile()).default)) {
      throw new Error('Invariant violation: "component instanceof StatusBarTile"');
    }

    this._statusBarTile = component;
  }

  destroy() {
    this._disposables.dispose();
  }
}

module.exports = RemoteProjectsController;