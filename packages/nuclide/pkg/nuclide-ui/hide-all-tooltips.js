"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = hideAllTooltips;
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

function hideAllTooltips() {
  atom.tooltips.tooltips.forEach(([tooltip]) => tooltip.hide());
}