'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _helpers;

function _load_helpers() {
  return _helpers = require('./helpers');
}

/**
 * A dbgp Frame after it is converted from XML to JSON:
 * {
 *   "$":{
 *     "where":"{main}",
 *     "level":"0",
 *     "type":"file",
 *     "filename":"file:///home/peterhal/test/dbgp/test-client.php",
 *     "lineno":"2"
 *   }
 * }
 */
function idOfFrame(frame) {
  // TODO: Mangle in the transactionId of the most recent pause/status.
  return frame.$.level;
}

function functionOfFrame(frame) {
  return frame.$.where;
}

// Returns an absolute path
function fileOfFrame(frame) {
  return (0, (_helpers || _load_helpers()).uriToPath)(fileUrlOfFrame(frame));
}

function fileUrlOfFrame(frame) {
  return frame.$.filename;
}

function locationOfFrame(frame) {
  return {
    // TODO: columnNumber: from cmdbegin/end
    lineNumber: Number(frame.$.lineno) - 1,
    scriptId: fileOfFrame(frame)
  };
}

module.exports = {
  idOfFrame,
  functionOfFrame,
  fileOfFrame,
  fileUrlOfFrame,
  locationOfFrame
};