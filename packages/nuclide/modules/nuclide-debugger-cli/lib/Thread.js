"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

class Thread {

  constructor(id, name) {
    this._id = id;
    this._name = name;
    this.clearSelectedStackFrame();
  }

  id() {
    return this._id;
  }

  name() {
    return this._name;
  }

  clearSelectedStackFrame() {
    this._selectedStackFrame = 0;
  }

  selectedStackFrame() {
    return this._selectedStackFrame;
  }

  setSelectedStackFrame(frame) {
    this._selectedStackFrame = frame;
  }
}
exports.default = Thread;