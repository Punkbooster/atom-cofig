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
exports.translateMessageFromServer = translateMessageFromServer;
exports.translateMessageToServer = translateMessageToServer;

var _url = _interopRequireDefault(require('url'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function translateMessageFromServer(hostname, message) {
  return translateMessage(message, uri => translateUriFromServer(hostname, uri));
}

function translateMessageToServer(message) {
  return translateMessage(message, translateUriToServer);
}

function translateMessage(message, translateUri) {
  const obj = JSON.parse(message);
  let result;
  switch (obj.method) {
    case 'Debugger.scriptParsed':
      result = translateField(obj, 'params.url', translateUri);
      break;
    case 'Debugger.setBreakpointByUrl':
      result = translateField(obj, 'params.url', translateUri);
      break;
    case 'Debugger.getScriptSource':
      result = translateField(obj, 'params.scriptId', translateUri);
      break;
    default:
      result = obj;
      break;
  }
  return JSON.stringify(result);
}

function translateField(obj, field, translateUri) {
  const fields = field.split('.');
  const fieldName = fields[0];
  if (fields.length === 1) {
    obj[fieldName] = translateUri(obj[fieldName]);
  } else {
    obj[fieldName] = translateField(obj[fieldName], fields.slice(1).join('.'), translateUri);
  }
  return obj;
}

function translateUriFromServer(hostname, uri) {
  const components = _url.default.parse(uri);
  if (components.protocol === 'file:') {
    if (!components.pathname) {
      throw new Error('Invariant violation: "components.pathname"');
    }

    const result = (_nuclideUri || _load_nuclideUri()).default.createRemoteUri(hostname, decodeURI(components.pathname));
    return result;
  } else {
    return uri;
  }
}

function translateUriToServer(uri) {
  if ((_nuclideUri || _load_nuclideUri()).default.isRemote(uri)) {
    const result = _url.default.format({
      protocol: 'file',
      slashes: true,
      pathname: (_nuclideUri || _load_nuclideUri()).default.getPath(uri)
    });
    return result;
  } else {
    return uri;
  }
}