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

var _ConnectionState;

function _load_ConnectionState() {
  return _ConnectionState = _interopRequireDefault(require('./ConnectionState'));
}

var _notification;

function _load_notification() {
  return _notification = require('./notification');
}

var _reactForAtom = require('react-for-atom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class StatusBarTile extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._onStatusBarTileClicked = this._onStatusBarTileClicked.bind(this);
  }

  render() {
    let iconName = null;
    switch (this.props.connectionState) {
      case (_ConnectionState || _load_ConnectionState()).default.NONE:
        break;
      case (_ConnectionState || _load_ConnectionState()).default.LOCAL:
        iconName = 'device-desktop';
        break;
      case (_ConnectionState || _load_ConnectionState()).default.CONNECTED:
        iconName = 'cloud-upload';
        break;
      case (_ConnectionState || _load_ConnectionState()).default.DISCONNECTED:
        iconName = 'alert';
        break;
    }
    // When the active pane isn't a text editor, e.g. diff view, preferences, ..etc.,
    // We don't show a connection status bar.
    if (!iconName) {
      return null;
    }
    return _reactForAtom.React.createElement('span', {
      className: `icon icon-${ iconName } nuclide-remote-projects-status-icon`,
      onClick: this._onStatusBarTileClicked
    });
  }

  _onStatusBarTileClicked() {
    if (!this.props.fileUri) {
      return;
    }
    switch (this.props.connectionState) {
      case (_ConnectionState || _load_ConnectionState()).default.LOCAL:
        (0, (_notification || _load_notification()).notifyLocalDiskFile)(this.props.fileUri);
        break;
      case (_ConnectionState || _load_ConnectionState()).default.CONNECTED:
        (0, (_notification || _load_notification()).notifyConnectedRemoteFile)(this.props.fileUri);
        break;
      case (_ConnectionState || _load_ConnectionState()).default.DISCONNECTED:
        (0, (_notification || _load_notification()).notifyDisconnectedRemoteFile)(this.props.fileUri);
        break;
    }
  }
}
exports.default = StatusBarTile;
module.exports = exports['default'];