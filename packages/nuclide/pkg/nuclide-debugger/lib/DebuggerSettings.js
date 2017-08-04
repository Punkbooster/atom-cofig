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

class DebuggerSettings {

  constructor() {
    this._settings = {
      SupportThreadsWindow: false,
      SingleThreadStepping: false
    };
  }

  set(key, value) {
    this._settings[key] = value;
  }

  get(key) {
    return this._settings[key];
  }

  getSerializedData() {
    return JSON.stringify(this._settings);
  }
}
exports.DebuggerSettings = DebuggerSettings;