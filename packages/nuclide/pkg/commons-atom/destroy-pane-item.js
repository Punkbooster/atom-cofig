"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = destroyPaneItemWithTitle;
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

function destroyPaneItemWithTitle(title) {
  for (const item of atom.workspace.getPaneItems()) {
    if (item.getTitle() === title) {
      const pane = atom.workspace.paneForItem(item);
      if (pane != null) {
        pane.destroyItem(item);
        return;
      }
    }
  }
}