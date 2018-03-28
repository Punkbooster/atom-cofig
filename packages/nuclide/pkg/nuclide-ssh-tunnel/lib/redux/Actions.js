'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.openTunnel = openTunnel;
exports.addOpenTunnel = addOpenTunnel;
exports.closeTunnel = closeTunnel;
exports.setTunnelState = setTunnelState;
exports.setCurrentWorkingDirectory = setCurrentWorkingDirectory;
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

const OPEN_TUNNEL = exports.OPEN_TUNNEL = 'OPEN_TUNNEL';
const ADD_OPEN_TUNNEL = exports.ADD_OPEN_TUNNEL = 'ADD_OPEN_TUNNEL';
const CLOSE_TUNNEL = exports.CLOSE_TUNNEL = 'CLOSE_TUNNEL';
const SET_TUNNEL_STATE = exports.SET_TUNNEL_STATE = 'SET_TUNNEL_STATE';
const SET_CURRENT_WORKING_DIRECTORY = exports.SET_CURRENT_WORKING_DIRECTORY = 'SET_CURRENT_WORKING_DIRECTORY';

function openTunnel(tunnel, onOpen, onClose) {
  return {
    type: OPEN_TUNNEL,
    payload: { tunnel, onOpen, onClose }
  };
}

function addOpenTunnel(tunnel, close) {
  return {
    type: ADD_OPEN_TUNNEL,
    payload: { tunnel, close }
  };
}

function closeTunnel(tunnel, error) {
  return {
    type: CLOSE_TUNNEL,
    payload: { tunnel, error }
  };
}

function setTunnelState(tunnel, state) {
  return {
    type: SET_TUNNEL_STATE,
    payload: { tunnel, state }
  };
}

function setCurrentWorkingDirectory(directory) {
  return {
    type: SET_CURRENT_WORKING_DIRECTORY,
    payload: { directory }
  };
}