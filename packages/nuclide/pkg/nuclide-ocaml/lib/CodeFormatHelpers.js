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
exports.getEntireFormatting = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let formatImpl = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (editor, subText) {
    const path = editor.getPath();
    if (path == null) {
      return null;
    }
    const instance = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getReasonServiceByNuclideUri)(path);

    const syntaxArg = editor.getGrammar().name === 'Reason' ? 're' : 'ml';
    // Pass the flags here rather than in the service, so that we pick no the
    // extra flags in the (client side) refmtFlags
    const flags = [
    // We pipe the current editor buffer into refmt rather than passing the path
    // because the editor buffer might not have been saved to disk.
    '-use-stdin', 'true', '-parse', syntaxArg, '-print', syntaxArg, '-is-interface-pp', isInterfaceF(path) ? 'true' : 'false', ...getRefmtFlags()];
    return instance.format(editor.getText(), flags);
  });

  return function formatImpl(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

let getEntireFormatting = exports.getEntireFormatting = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (editor, range) {
    const buffer = editor.getBuffer();
    const wholeText = buffer.getText();
    const result = yield formatImpl(editor, wholeText);

    if (result == null) {
      return { formatted: wholeText };
    } else if (result.type === 'error') {
      throw new Error(result.error);
    } else {
      return { formatted: result.formattedResult };
    }
  });

  return function getEntireFormatting(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
})();

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _string;

function _load_string() {
  return _string = require('../../commons-node/string');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isInterfaceF(filePath) {
  const ext = (_nuclideUri || _load_nuclideUri()).default.extname(filePath);
  return ext === '.rei' || ext === '.mli';
}

function getRefmtFlags() {
  const configVal = (_featureConfig || _load_featureConfig()).default.get('nuclide-ocaml.refmtFlags') || '';
  return (0, (_string || _load_string()).shellParse)(configVal);
}