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
exports.observeBuffers = observeBuffers;
exports.observeBufferOpen = observeBufferOpen;
exports.observeBufferCloseOrRename = observeBufferCloseOrRename;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../commons-node/nuclideUri'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _event;

function _load_event() {
  return _event = require('../commons-node/event');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Once https://github.com/atom/atom/pull/12501 is released, switch to
// `atom.project.observeBuffers`.
function observeBuffers(observeBuffer) {
  atom.project.getBuffers().filter(buffer => !(_nuclideUri || _load_nuclideUri()).default.isBrokenDeserializedUri(buffer.getPath())).forEach(observeBuffer);
  return atom.project.onDidAddBuffer(buffer => {
    if (!(_nuclideUri || _load_nuclideUri()).default.isBrokenDeserializedUri(buffer.getPath())) {
      observeBuffer(buffer);
    }
  });
}

// Observes all buffer opens.
// Buffer renames are sent as an open of the new name.
function observeBufferOpen() {
  return (0, (_event || _load_event()).observableFromSubscribeFunction)(observeBuffers).mergeMap(buffer => {
    const end = (0, (_event || _load_event()).observableFromSubscribeFunction)(buffer.onDidDestroy.bind(buffer));
    const rename = (0, (_event || _load_event()).observableFromSubscribeFunction)(buffer.onDidChangePath.bind(buffer)).map(() => buffer).takeUntil(end);
    return _rxjsBundlesRxMinJs.Observable.of(buffer).concat(rename);
  });
}

// Note that on a rename, the openedPath will be the path of the buffer when the open was sent,
// which may not match the current name of the buffer.


// Fires a single event when the buffer is destroyed or renamed.
// Note that on a rename the buffer path will not be the same as the openedPath.
function observeBufferCloseOrRename(buffer) {
  const openedPath = buffer.getPath();
  const end = (0, (_event || _load_event()).observableFromSubscribeFunction)(buffer.onDidDestroy.bind(buffer));
  const rename = (0, (_event || _load_event()).observableFromSubscribeFunction)(buffer.onDidChangePath.bind(buffer));
  return end.merge(rename).take(1).map(() => ({ kind: 'close', buffer, openedPath }));
}