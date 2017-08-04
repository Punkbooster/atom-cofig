'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// Regenerates the .proxy baseline files in the spec/fixtures directory.

var _serviceParser;

function _load_serviceParser() {
  return _serviceParser = require('./service-parser');
}

var _proxyGenerator;

function _load_proxyGenerator() {
  return _proxyGenerator = require('./proxy-generator');
}

var _location;

function _load_location() {
  return _location = require('./location');
}

var _fs = _interopRequireDefault(require('fs'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const dir = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../spec/fixtures');
for (const file of _fs.default.readdirSync(dir)) {
  if (file.endsWith('.def')) {
    const serviceName = (_nuclideUri || _load_nuclideUri()).default.basename(file, '.def');
    const preserveFunctionNames = false;
    const definitionPath = (_nuclideUri || _load_nuclideUri()).default.join(dir, file);

    const definitionSource = _fs.default.readFileSync(definitionPath, 'utf8');
    const definitions = (0, (_serviceParser || _load_serviceParser()).parseServiceDefinition)(definitionPath, definitionSource, []);

    (0, (_location || _load_location()).stripLocationsFileName)(definitions);

    const json = mapDefinitions(definitions);
    _fs.default.writeFileSync(definitionPath.replace('.def', '.def.json'), JSON.stringify(json, null, 4), 'utf8');

    const code = (0, (_proxyGenerator || _load_proxyGenerator()).generateProxy)(serviceName, preserveFunctionNames, definitions);
    _fs.default.writeFileSync(definitionPath.replace('.def', '.proxy'), code, 'utf8');
  }
}

function mapDefinitions(map) {
  const obj = {};
  for (const it of map.values()) {
    let value;
    switch (it.kind) {
      case 'interface':
        value = {
          constructorArgs: it.constructorArgs,
          instanceMethods: mapToJSON(it.instanceMethods),
          staticMethods: mapToJSON(it.staticMethods)
        };
        break;
      default:
        value = it;
        break;
    }
    obj[it.name] = value;
  }
  return obj;
}

function mapToJSON(map) {
  const result = {};
  for (const it of map.entries()) {
    result[it[0]] = it[1];
  }
  return result;
}