'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConnectionHealthNotifier = undefined;

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-remote-connection'); /**
                                                                                         * Copyright (c) 2015-present, Facebook, Inc.
                                                                                         * All rights reserved.
                                                                                         *
                                                                                         * This source code is licensed under the license found in the LICENSE file in
                                                                                         * the root directory of this source tree.
                                                                                         *
                                                                                         * 
                                                                                         * @format
                                                                                         */

const HEARTBEAT_AWAY_REPORT_COUNT = 3;
const HEARTBEAT_NOTIFICATION_ERROR = 1;
const HEARTBEAT_NOTIFICATION_WARNING = 2;

// Returning true short-circuits the default error handling in onHeartbeatError()


// Provides feedback to the user of the health of a NuclideSocket.
class ConnectionHealthNotifier {

  constructor(host, port, heartbeat) {
    this._heartbeatNetworkAwayCount = 0;
    this._lastHeartbeatNotification = null;

    const uri = `https://${host}:${port}`;

    /**
     * Adds an Atom notification for the detected heartbeat network status
     * The function makes sure not to add many notifications for the same event and prioritize
     * new events.
     */
    const addHeartbeatNotification = (type, errorCode, message, dismissable, askToReload) => {
      const { code, notification: existingNotification } = this._lastHeartbeatNotification || {};
      if (code && code === errorCode && dismissable) {
        // A dismissable heartbeat notification with this code is already active.
        return;
      }
      let notification = null;
      const options = { dismissable, buttons: [] };
      if (askToReload) {
        options.buttons.push({
          className: 'icon icon-zap',
          onDidClick() {
            atom.reload();
          },
          text: 'Reload Atom'
        });
      }
      switch (type) {
        case HEARTBEAT_NOTIFICATION_ERROR:
          notification = atom.notifications.addError(message, options);
          break;
        case HEARTBEAT_NOTIFICATION_WARNING:
          notification = atom.notifications.addWarning(message, options);
          break;
        default:
          throw new Error('Unrecongnized heartbeat notification type');
      }
      if (existingNotification) {
        existingNotification.dismiss();
      }

      if (!notification) {
        throw new Error('Invariant violation: "notification"');
      }

      this._lastHeartbeatNotification = {
        notification,
        code: errorCode
      };
    };

    const onHeartbeat = () => {
      if (this._lastHeartbeatNotification) {
        // If there has been existing heartbeat error/warning,
        // that means connection has been lost and we shall show a message about connection
        // being restored without a reconnect prompt.
        const { notification } = this._lastHeartbeatNotification;
        notification.dismiss();
        atom.notifications.addSuccess('Connection restored to Nuclide Server at: ' + uri);
        this._heartbeatNetworkAwayCount = 0;
        this._lastHeartbeatNotification = null;
      }
    };

    const notifyNetworkAway = code => {
      this._heartbeatNetworkAwayCount++;
      if (this._heartbeatNetworkAwayCount >= HEARTBEAT_AWAY_REPORT_COUNT) {
        addHeartbeatNotification(HEARTBEAT_NOTIFICATION_WARNING, code, `Nuclide server cannot be reached at "${uri}".<br/>` + 'Nuclide will reconnect when the network is restored.',
        /* dismissable */true,
        /* askToReload */false);
      }
    };

    const onHeartbeatError = error => {
      const { code, message, originalCode } = error;
      // Don't keep tracking consecutive NETWORK_AWAY events:
      // the user's probably offline anyway so analytics events just pile up.
      if (code !== 'NETWORK_AWAY' || this._heartbeatNetworkAwayCount < HEARTBEAT_AWAY_REPORT_COUNT) {
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackEvent)({
          type: 'heartbeat-error',
          data: {
            code: code || '',
            message: message || '',
            host
          }
        });
      }
      logger.info('Heartbeat network error:', code, originalCode, message);

      if (this._onHeartbeatError != null && this._onHeartbeatError(error)) {
        return;
      }

      switch (code) {
        case 'NETWORK_AWAY':
          // Notify switching networks, disconnected, timeout, unreachable server or fragile
          // connection.
          notifyNetworkAway(code);
          break;
        case 'SERVER_CRASHED':
          // Server shut down or port no longer accessible.
          // Notify the server was there, but now gone.
          addHeartbeatNotification(HEARTBEAT_NOTIFICATION_ERROR, code, '**Nuclide Server Crashed**<br/>' + 'Please reload Atom to restore your remote project connection.',
          /* dismissable */true,
          /* askToReload */true);
          break;
        case 'PORT_NOT_ACCESSIBLE':
          // Notify never heard a heartbeat from the server.
          addHeartbeatNotification(HEARTBEAT_NOTIFICATION_ERROR, code, '**Nuclide Server Is Not Reachable**<br/>' + `It could be running on a port that is not accessible: ${String(port)}.`,
          /* dismissable */true,
          /* askToReload */false);
          break;
        case 'INVALID_CERTIFICATE':
          // Notify the client certificate is not accepted by nuclide server
          // (certificate mismatch).
          addHeartbeatNotification(HEARTBEAT_NOTIFICATION_ERROR, code, '**Certificate Expired**<br/>' +
          // The expiration date should be synced with
          // nuclide-server/scripts/nuclide_server_manager.py.
          'The Nuclide server certificate has most likely expired.<br>' + 'For your security, certificates automatically expire after 14 days.<br>' + 'Please reload Atom to restore your remote project connection.',
          /* dismissable */true,
          /* askToReload */true);
          break;
        default:
          notifyNetworkAway(code);
          logger.error('Unrecongnized heartbeat error code: ' + code, message);
          break;
      }
    };
    this._subscription = new (_UniversalDisposable || _load_UniversalDisposable()).default(heartbeat.onHeartbeat(onHeartbeat), heartbeat.onHeartbeatError(onHeartbeatError));
  }

  // Sets function to be called on Heartbeat error.
  // Function should return true to short-circuit the rest of the error logic.
  setOnHeartbeatError(onHeartbeatError) {
    this._onHeartbeatError = onHeartbeatError;
  }

  dispose() {
    this._subscription.dispose();
  }
}
exports.ConnectionHealthNotifier = ConnectionHealthNotifier;