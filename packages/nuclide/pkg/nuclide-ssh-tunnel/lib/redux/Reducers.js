'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.openTunnels = openTunnels;
exports.currentWorkingDirectory = currentWorkingDirectory;
exports.consoleOutput = consoleOutput;

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./Actions'));
}

var _immutable;

function _load_immutable() {
  return _immutable = _interopRequireWildcard(require('immutable'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

function openTunnels(state = (_immutable || _load_immutable()).Map(), action) {
  switch (action.type) {
    case (_Actions || _load_Actions()).ADD_OPEN_TUNNEL:
      const { close, tunnel } = action.payload;
      return state.set(tunnel, {
        close,
        state: 'initializing'
      });
    case (_Actions || _load_Actions()).CLOSE_TUNNEL:
      const toClose = action.payload.tunnel;
      const openTunnel = state.get(toClose);
      if (openTunnel == null) {
        return state;
      }
      openTunnel.close(action.payload.error);
      return state.delete(toClose);
    case (_Actions || _load_Actions()).SET_TUNNEL_STATE:
      if (!(state.get(action.payload.tunnel) != null)) {
        throw new Error('Invariant violation: "state.get(action.payload.tunnel) != null"');
      }

      return state.update(action.payload.tunnel, value => Object.assign({}, value, {
        state: action.payload.state
      }));
    default:
      return state;
  }
}

function currentWorkingDirectory(state = null, action) {
  switch (action.type) {
    case (_Actions || _load_Actions()).SET_CURRENT_WORKING_DIRECTORY:
      return action.payload.directory;
    default:
      return state;
  }
}

function consoleOutput(state = new _rxjsBundlesRxMinJs.Subject(), action) {
  return state;
}