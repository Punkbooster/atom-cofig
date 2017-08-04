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

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _DeepLinkService;

function _load_DeepLinkService() {
  return _DeepLinkService = _interopRequireDefault(require('./DeepLinkService'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Activation {

  constructor(state) {
    this._service = new (_DeepLinkService || _load_DeepLinkService()).default();
  }

  dispose() {
    this._service.dispose();
  }

  provideDeepLinkService() {
    // Only expose the public methods of the service.
    return {
      subscribeToPath: (path, callback) => {
        return this._service.subscribeToPath(path, callback);
      }
    };
  }
}exports.default = (0, (_createPackage || _load_createPackage()).default)(Activation);
module.exports = exports['default'];