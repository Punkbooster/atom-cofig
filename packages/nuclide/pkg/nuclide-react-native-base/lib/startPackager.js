'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Wraps the calling of the start-packager command in a little more friendly way.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startPackager = startPackager;

function startPackager() {
  return new Promise((resolve, reject) => {
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-react-native:start-packager', {
      onRunning: err => {
        if (err != null) {
          reject(err);
        } else {
          resolve();
        }
      }
    });
  });
}