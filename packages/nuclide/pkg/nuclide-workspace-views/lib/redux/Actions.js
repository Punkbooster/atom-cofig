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
exports.addOpener = addOpener;
exports.destroyWhere = destroyWhere;
exports.removeOpener = removeOpener;
exports.open = open;
exports.createViewable = createViewable;
exports.itemCreated = itemCreated;
exports.track = track;
exports.registerLocation = registerLocation;
exports.registerLocationFactory = registerLocationFactory;
exports.unregisterLocation = unregisterLocation;
exports.locationUnregistered = locationUnregistered;
exports.setItemVisibility = setItemVisibility;
exports.toggleItemVisibility = toggleItemVisibility;

const ADD_OPENER = exports.ADD_OPENER = 'ADD_OPENER';
const DESTROY_WHERE = exports.DESTROY_WHERE = 'DESTROY_WHERE';
const REMOVE_OPENER = exports.REMOVE_OPENER = 'REMOVE_OPENER';
const OPEN = exports.OPEN = 'OPEN';
const CREATE_VIEWABLE = exports.CREATE_VIEWABLE = 'CREATE_VIEWABLE';
const ITEM_CREATED = exports.ITEM_CREATED = 'ITEM_CREATED';
const SET_ITEM_VISIBILITY = exports.SET_ITEM_VISIBILITY = 'SET_ITEM_VISIBILITY';
const TOGGLE_ITEM_VISIBILITY = exports.TOGGLE_ITEM_VISIBILITY = 'TOGGLE_ITEM_VISIBILITY';
const TRACK = exports.TRACK = 'TRACK';
const REGISTER_LOCATION = exports.REGISTER_LOCATION = 'REGISTER_LOCATION';
const REGISTER_LOCATION_FACTORY = exports.REGISTER_LOCATION_FACTORY = 'REGISTER_LOCATION_FACTORY';
const UNREGISTER_LOCATION = exports.UNREGISTER_LOCATION = 'UNREGISTER_LOCATION';
const LOCATION_UNREGISTERED = exports.LOCATION_UNREGISTERED = 'LOCATION_UNREGISTERED';

function addOpener(opener) {
  return {
    type: ADD_OPENER,
    payload: { opener }
  };
}

function destroyWhere(predicate) {
  return {
    type: DESTROY_WHERE,
    payload: { predicate }
  };
}

function removeOpener(opener) {
  return {
    type: REMOVE_OPENER,
    payload: { opener }
  };
}

function open(uri, options) {
  return {
    type: OPEN,
    payload: {
      uri,
      searchAllPanes: Boolean(options && options.searchAllPanes === true)
    }
  };
}

function createViewable(uri) {
  return {
    type: CREATE_VIEWABLE,
    payload: { uri }
  };
}

function itemCreated(item, itemType) {
  return {
    type: ITEM_CREATED,
    payload: { item, itemType }
  };
}

function track(event) {
  return {
    type: TRACK,
    payload: { event }
  };
}

function registerLocation(id, location) {
  return {
    type: REGISTER_LOCATION,
    payload: { id, location }
  };
}

function registerLocationFactory(locationFactory) {
  return {
    type: REGISTER_LOCATION_FACTORY,
    payload: { locationFactory }
  };
}

function unregisterLocation(id) {
  return {
    type: UNREGISTER_LOCATION,
    payload: { id }
  };
}

function locationUnregistered(id) {
  return {
    type: LOCATION_UNREGISTERED,
    payload: { id }
  };
}

function setItemVisibility(options) {
  return {
    type: SET_ITEM_VISIBILITY,
    payload: options
  };
}

function toggleItemVisibility(uri, visible) {
  return {
    type: TOGGLE_ITEM_VISIBILITY,
    payload: { uri, visible }
  };
}