'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.moveUp = moveUp;
exports.moveDown = moveDown;
exports.moveRight = moveRight;
exports.moveLeft = moveLeft;

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

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

function moveUp(el) {
  doSplit(el, 'up', (pane, params) => pane.splitUp(params));
}

function moveDown(el) {
  doSplit(el, 'down', (pane, params) => pane.splitDown(params));
}

function moveRight(el) {
  doSplit(el, 'right', (pane, params) => pane.splitRight(params));
}

function moveLeft(el) {
  doSplit(el, 'left', (pane, params) => pane.splitLeft(params));
}

function doSplit(el, operation, splitOperation) {
  const pane = findNearestPane(el) || getCenter().getActivePane();
  if (pane == null) {
    return;
  }

  (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-move-item-to-available-pane');
  const activeItem = pane.getActiveItem();
  if (activeItem != null) {
    const targetPane = findTargetPane(pane, operation);
    if (targetPane != null) {
      const index = targetPane.getItems().length;
      pane.moveItemToPane(activeItem, targetPane, index);
      targetPane.activateItemAtIndex(index);
      targetPane.activate();
      return;
    }
  }

  // Note that this will (intentionally) create an empty pane if the active
  // pane contains exactly zero or one items.
  // The new empty pane will be kept if the global atom setting
  // 'Destroy Empty Panes' is false, otherwise it will be removed.
  const newPane = splitOperation(pane, { copyActiveItem: false });
  const item = pane.getActiveItem();
  if (item) {
    pane.moveItemToPane(item, newPane, 0);
  }
}

/**
 * Find the Pane that contains the provided element.
 */
function findNearestPane(el_) {
  let el = el_;
  while (el != null) {
    if (el.tagName === 'ATOM-PANE' && typeof el.getModel === 'function') {
      return el.getModel();
    }
    el = el.parentElement;
  }
}

// TODO: Replace this once our lowest supported version is 1.17
const getCenter = () => atom.workspace.getCenter ? atom.workspace.getCenter() : atom.workspace;

/**
 * See if there is already a pane in the direction the user is trying to split.
 * If there are multiple, returns the "nearest" pane.
 */
function findTargetPane(activePane, operation) {
  const activeRect = atom.views.getView(activePane).getBoundingClientRect();
  const predicate = createPredicate(operation, activeRect);

  const paneToRect = new WeakMap();
  const candidatePanes = activePane.getContainer().getPanes().filter(pane => {
    if (pane === activePane) {
      return false;
    } else {
      const rect = atom.views.getView(pane).getBoundingClientRect();
      paneToRect.set(pane, rect);
      return predicate(rect);
    }
  });

  if (candidatePanes.length === 1) {
    return candidatePanes[0];
  } else if (candidatePanes.length > 1) {
    const xAxisComparator = rect => Math.abs(rect.left - activeRect.left);
    const yAxisComparator = rect => Math.abs(rect.top - activeRect.top);
    const isHorizontalMove = operation === 'left' || operation === 'right';
    const primaryComparator = isHorizontalMove ? xAxisComparator : yAxisComparator;
    const secondaryComparator = isHorizontalMove ? yAxisComparator : xAxisComparator;
    candidatePanes.sort((pane1, pane2) => {
      const rect1 = paneToRect.get(pane1);
      const rect2 = paneToRect.get(pane2);

      if (!(rect1 != null)) {
        throw new Error('Invariant violation: "rect1 != null"');
      }

      if (!(rect2 != null)) {
        throw new Error('Invariant violation: "rect2 != null"');
      }

      const comp = primaryComparator(rect1) - primaryComparator(rect2);
      if (comp !== 0) {
        return comp;
      } else {
        return secondaryComparator(rect1) - secondaryComparator(rect2);
      }
    });
    return candidatePanes[0];
  } else {
    return null;
  }
}

function createPredicate(operation, activeRect) {
  switch (operation) {
    case 'up':
      return rect => rect.top < activeRect.top;
    case 'down':
      return rect => rect.top > activeRect.top;
    case 'left':
      return rect => rect.left < activeRect.left;
    case 'right':
      return rect => rect.left > activeRect.left;
  }
  throw Error(`Unknown operation: ${operation}`);
}