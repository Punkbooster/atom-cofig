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
exports.activate = activate;
exports.deactivate = deactivate;

var _atom = require('atom');

var _move;

function _load_move() {
  return _move = require('./move');
}

class Activation {

  constructor(state) {
    this._disposables = new _atom.CompositeDisposable();
  }

  activate() {
    this._disposables.add(atom.commands.add('atom-text-editor', {
      // Pass the eta expansion of these functions to defer the loading of move.js.
      'nuclide-move-item-to-available-pane:right': () => (0, (_move || _load_move()).moveRight)(),
      'nuclide-move-item-to-available-pane:left': () => (0, (_move || _load_move()).moveLeft)(),
      'nuclide-move-item-to-available-pane:up': () => (0, (_move || _load_move()).moveUp)(),
      'nuclide-move-item-to-available-pane:down': () => (0, (_move || _load_move()).moveDown)()
    }));
  }

  dispose() {
    this._disposables.dispose();
  }
}

let activation = null;

function activate(state) {
  if (activation == null) {
    activation = new Activation(state);
    activation.activate();
  }
}

function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}