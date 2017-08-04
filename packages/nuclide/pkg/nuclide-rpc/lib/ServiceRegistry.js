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
exports.ServiceRegistry = undefined;

var _main;

function _load_main() {
  return _main = require('./main');
}

var _TypeRegistry;

function _load_TypeRegistry() {
  return _TypeRegistry = require('./TypeRegistry');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _config;

function _load_config() {
  return _config = require('./config');
}

const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();class ServiceRegistry {

  /**
   * Store a mapping from function name to a structure holding both the local implementation and
   * the type definition of the function.
   */
  constructor(predefinedTypes, services, protocol = (_config || _load_config()).SERVICE_FRAMEWORK3_PROTOCOL) {
    this._protocol = protocol;
    this._typeRegistry = new (_TypeRegistry || _load_TypeRegistry()).TypeRegistry(predefinedTypes);
    this._predefinedTypes = predefinedTypes.map(predefinedType => predefinedType.typeName);
    this._functionsByName = new Map();
    this._classesByName = new Map();
    this._services = new Map();

    this.addServices(services);
  }

  /**
   * Store a mapping from a class name to a struct containing it's local constructor and it's
   * interface definition.
   */


  getProtocol() {
    return this._protocol;
  }

  addServices(services) {
    services.forEach(this.addService, this);
  }

  addService(service) {
    const preserveFunctionNames = service.preserveFunctionNames != null && service.preserveFunctionNames;
    try {
      const factory = (0, (_main || _load_main()).createProxyFactory)(service.name, preserveFunctionNames, service.definition, this._predefinedTypes);
      // $FlowIssue - the parameter passed to require must be a literal string.
      const localImpl = require(service.implementation);
      this._services.set(service.name, {
        name: service.name,
        factory
      });

      // Register type aliases.
      factory.defs.forEach(definition => {
        const name = definition.name;
        switch (definition.kind) {
          case 'alias':
            if (definition.definition != null) {
              this._typeRegistry.registerAlias(name, definition.location, definition.definition);
            }
            break;
          case 'function':
            // Register module-level functions.
            const functionName = service.preserveFunctionNames ? name : `${ service.name }/${ name }`;
            this._registerFunction(functionName, localImpl[name], definition.type);
            break;
          case 'interface':
            // Register interfaces.
            this._classesByName.set(name, {
              localImplementation: localImpl[name],
              definition
            });

            this._typeRegistry.registerType(name, definition.location, (object, context) => context.marshal(name, object), (objectId, context) => context.unmarshal(objectId, name, context.getService(service.name)[name]));

            // Register all of the static methods as remote functions.
            definition.staticMethods.forEach((funcType, funcName) => {
              this._registerFunction(`${ name }/${ funcName }`, localImpl[name][funcName], funcType);
            });
            break;
        }
      });
    } catch (e) {
      logger.error(`Failed to load service ${ service.name }. Stack Trace:\n${ e.stack }`);
      throw e;
    }
  }

  _registerFunction(name, localImpl, type) {
    if (this._functionsByName.has(name)) {
      throw new Error(`Duplicate RPC function: ${ name }`);
    }
    this._functionsByName.set(name, {
      localImplementation: localImpl,
      type
    });
  }

  getFunctionImplemention(name) {
    const result = this._functionsByName.get(name);

    if (!result) {
      throw new Error('Invariant violation: "result"');
    }

    return result;
  }

  getClassDefinition(className) {
    const result = this._classesByName.get(className);

    if (!(result != null)) {
      throw new Error('Invariant violation: "result != null"');
    }

    return result;
  }

  getTypeRegistry() {
    return this._typeRegistry;
  }

  getServices() {
    return this._services.values();
  }

  hasService(serviceName) {
    return this._services.has(serviceName);
  }

  getService(serviceName) {
    const result = this._services.get(serviceName);

    if (!(result != null)) {
      throw new Error('Invariant violation: "result != null"');
    }

    return result;
  }
}
exports.ServiceRegistry = ServiceRegistry;