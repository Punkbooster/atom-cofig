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
exports.RpcConnection = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _ServiceRegistry;

function _load_ServiceRegistry() {
  return _ServiceRegistry = require('./ServiceRegistry');
}

var _ObjectRegistry;

function _load_ObjectRegistry() {
  return _ObjectRegistry = require('./ObjectRegistry');
}

var _messages;

function _load_messages() {
  return _messages = require('./messages');
}

var _builtinTypes;

function _load_builtinTypes() {
  return _builtinTypes = require('./builtin-types');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _config;

function _load_config() {
  return _config = require('./config');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();

const SERVICE_FRAMEWORK_RPC_TIMEOUT_MS = 60 * 1000;

class Subscription {

  constructor(message, observer) {
    this._message = message;
    this._observer = observer;
  }

  error(error) {
    try {
      this._observer.error((0, (_messages || _load_messages()).decodeError)(this._message, error));
    } catch (e) {
      logger.error(`Caught exception in Subscription.error: ${ e.toString() }`);
    }
  }

  next(data) {
    try {
      this._observer.next(data);
    } catch (e) {
      logger.error(`Caught exception in Subscription.next: ${ e.toString() }`);
    }
  }

  complete() {
    try {
      this._observer.complete();
    } catch (e) {
      logger.error(`Caught exception in Subscription.complete: ${ e.toString() }`);
    }
  }
}

class Call {

  constructor(message, timeoutMessage, resolve, reject, cleanup) {
    this._message = message;
    this._timeoutMessage = timeoutMessage;
    this._resolve = resolve;
    this._reject = reject;
    this._cleanup = cleanup;
    this._complete = false;
    this._timerId = setTimeout(() => {
      this._timeout();
    }, SERVICE_FRAMEWORK_RPC_TIMEOUT_MS);
  }

  reject(error) {
    if (!this._complete) {
      this.cleanup();
      this._reject((0, (_messages || _load_messages()).decodeError)(this._message, error));
    }
  }

  resolve(result) {
    if (!this._complete) {
      this.cleanup();
      this._resolve(result);
    }
  }

  cleanup() {
    if (!this._complete) {
      this._complete = true;
      clearTimeout(this._timerId);
      this._timerId = null;
      this._cleanup();
    }
  }

  _timeout() {
    if (!this._complete) {
      this.cleanup();
      this._reject(new Error(`Timeout after ${ SERVICE_FRAMEWORK_RPC_TIMEOUT_MS } for id: ` + `${ this._message.id }, ${ this._timeoutMessage }.`));
    }
  }
}

class RpcConnection {

  // Do not call this directly, use factory methods below.
  constructor(kind, serviceRegistry, transport) {
    this._transport = transport;
    this._rpcRequestId = 1;
    this._serviceRegistry = serviceRegistry;
    this._objectRegistry = new (_ObjectRegistry || _load_ObjectRegistry()).ObjectRegistry(kind, this._serviceRegistry, this);
    this._transport.onMessage().subscribe(message => {
      this._handleMessage(message);
    });
    this._subscriptions = new Map();
    this._calls = new Map();
  }

  // Creates a connection on the server side.
  static createServer(serviceRegistry, transport) {
    return new RpcConnection('server', serviceRegistry, transport);
  }

  // Creates a client side connection to a server on another machine.
  static createRemote(transport, predefinedTypes, services, protocol = (_config || _load_config()).SERVICE_FRAMEWORK3_PROTOCOL) {
    return new RpcConnection('client', new (_ServiceRegistry || _load_ServiceRegistry()).ServiceRegistry(predefinedTypes, services, protocol), transport);
  }

  // Creates a client side connection to a server on the same machine.
  static createLocal(transport, predefinedTypes, services, protocol = (_config || _load_config()).SERVICE_FRAMEWORK3_PROTOCOL) {
    return new RpcConnection('client', new (_ServiceRegistry || _load_ServiceRegistry()).ServiceRegistry(predefinedTypes, services, protocol), transport);
  }

  getService(serviceName) {
    const service = this._objectRegistry.getService(serviceName);

    if (!(service != null)) {
      throw new Error(`No config found for service ${ serviceName }`);
    }

    return service;
  }

  addServices(services) {
    services.forEach(this.addService, this);
  }

  addService(service) {
    this._serviceRegistry.addService(service);
  }

  // Delegate marshalling to the type registry.
  marshal(value, type) {
    return this._getTypeRegistry().marshal(this._objectRegistry, value, type);
  }
  unmarshal(value, type) {
    return this._getTypeRegistry().unmarshal(this._objectRegistry, value, type);
  }

  marshalArguments(args, argTypes) {
    return this._getTypeRegistry().marshalArguments(this._objectRegistry, args, argTypes);
  }

  unmarshalArguments(args, argTypes) {
    return this._getTypeRegistry().unmarshalArguments(this._objectRegistry, args, argTypes);
  }

  /**
   * Call a remote function, through the service framework.
   * @param functionName - The name of the remote function to invoke.
   * @param returnType - The type of object that this function returns, so the the transport
   *   layer can register the appropriate listeners.
   * @param args - The serialized arguments to invoke the remote function with.
   */
  callRemoteFunction(functionName, returnType, args) {
    return this._sendMessageAndListenForResult((0, (_messages || _load_messages()).createCallMessage)(this._getProtocol(), functionName, this._generateRequestId(), args), returnType, `Calling function ${ functionName }`);
  }

  /**
   * Call a method of a remote object, through the service framework.
   * @param objectId - The id of the remote object.
   * @param methodName - The name of the method to invoke.
   * @param returnType - The type of object that this function returns, so the the transport
   *   layer can register the appropriate listeners.
   * @param args - The serialized arguments to invoke the remote method with.
   */
  callRemoteMethod(objectId, methodName, returnType, args) {
    return this._sendMessageAndListenForResult((0, (_messages || _load_messages()).createCallObjectMessage)(this._getProtocol(), methodName, objectId, this._generateRequestId(), args), returnType, `Calling remote method ${ methodName }.`);
  }

  /**
   * Call a remote constructor, returning an id that eventually resolves to a unique identifier
   * for the object.
   * @param interfaceName - The name of the remote class for which to construct an object.
   * @param thisArg - The newly created proxy object.
   * @param unmarshalledArgs - Unmarshalled arguments to pass to the remote constructor.
   * @param argTypes - Types of arguments.
   */
  createRemoteObject(interfaceName, thisArg, unmarshalledArgs, argTypes) {
    var _this = this;

    const idPromise = (0, _asyncToGenerator.default)(function* () {
      const marshalledArgs = yield _this._getTypeRegistry().marshalArguments(_this._objectRegistry, unmarshalledArgs, argTypes);
      return _this._sendMessageAndListenForResult((0, (_messages || _load_messages()).createNewObjectMessage)(_this._getProtocol(), interfaceName, _this._generateRequestId(), marshalledArgs), 'promise', `Creating instance of ${ interfaceName }`);
    })();
    this._objectRegistry.addProxy(thisArg, interfaceName, idPromise);
  }

  /**
   * Dispose a remote object. This makes it's proxies unsuable, and calls the `dispose` method on
   * the remote object.
   * @param object - The remote object.
   * @returns A Promise that resolves when the object disposal has completed.
   */
  disposeRemoteObject(object) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const objectId = yield _this2._objectRegistry.disposeProxy(object);
      if (objectId == null) {
        logger.info('Duplicate dispose call on remote proxy');
      } else if (_this2._transport.isClosed()) {
        logger.info('Dispose call on remote proxy after connection closed');
      } else {
        return yield _this2._sendMessageAndListenForResult((0, (_messages || _load_messages()).createDisposeMessage)(_this2._getProtocol(), _this2._generateRequestId(), objectId), 'promise', `Disposing object ${ objectId }`);
      }
    })();
  }

  /**
   * Helper function that listens for a result for the given id.
   * @param returnType - Determines the type of messages we should subscribe to, and what this
   *   function should return.
   * @param id - The id of the request who's result we are listening for.
   * @returns Depending on the expected return type, this function either returns undefined, a
   *   Promise, or an Observable.
   */
  _sendMessageAndListenForResult(message, returnType, timeoutMessage) {
    const operation = () => {
      switch (returnType) {
        case 'void':
          this._transport.send(JSON.stringify(message));
          return; // No values to return.
        case 'promise':
          // Listen for a single message, and resolve or reject a promise on that message.
          return new Promise((resolve, reject) => {
            this._transport.send(JSON.stringify(message));
            this._calls.set(message.id, new Call(message, timeoutMessage, resolve, reject, () => {
              this._calls.delete(message.id);
            }));
          });
        case 'observable':
          {
            const id = message.id;

            if (!!this._subscriptions.has(id)) {
              throw new Error('Invariant violation: "!this._subscriptions.has(id)"');
            }

            const sendSubscribe = () => {
              this._transport.send(JSON.stringify(message));
            };
            const sendUnsubscribe = () => {
              if (!this._transport.isClosed()) {
                this._transport.send(JSON.stringify((0, (_messages || _load_messages()).createUnsubscribeMessage)(this._getProtocol(), id)));
              }
            };
            let hadSubscription = false;
            const observable = _rxjsBundlesRxMinJs.Observable.create(observer => {
              // Only allow a single subscription. This will be the common case,
              // and adding this restriction allows disposing of the observable
              // on the remote side after the initial subscription is complete.
              if (hadSubscription) {
                throw new Error('Attempt to re-connect with a remote Observable.');
              }
              hadSubscription = true;

              const subscription = new Subscription(message, observer);
              this._subscriptions.set(id, subscription);
              sendSubscribe();

              // Observable dispose function, which is called on subscription dispose, on stream
              // completion, and on stream error.
              return {
                unsubscribe: () => {
                  if (!this._subscriptions.has(id)) {
                    // guard against multiple unsubscribe calls
                    return;
                  }
                  this._subscriptions.delete(id);

                  sendUnsubscribe();
                }
              };
            });

            // Conversion to ConnectableObservable happens in the generated
            // proxies.
            return observable;
          }
        default:
          throw new Error(`Unkown return type: ${ returnType }.`);
      }
    };
    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackOperationTiming)(trackingIdOfMessageAndNetwork(this._objectRegistry, message), operation);
  }

  _returnPromise(id, timingTracker, candidate, type) {
    let returnVal = candidate;
    // Ensure that the return value is a promise.
    if (!isThenable(returnVal)) {
      returnVal = Promise.reject(new Error('Expected a Promise, but the function returned something else.'));
    }

    // Marshal the result, to send over the network.

    if (!(returnVal != null)) {
      throw new Error('Invariant violation: "returnVal != null"');
    }

    returnVal = returnVal.then(value => this._getTypeRegistry().marshal(this._objectRegistry, value, type));

    // Send the result of the promise across the socket.
    returnVal.then(result => {
      this._transport.send(JSON.stringify((0, (_messages || _load_messages()).createPromiseMessage)(this._getProtocol(), id, result)));
      timingTracker.onSuccess();
    }, error => {
      this._transport.send(JSON.stringify((0, (_messages || _load_messages()).createErrorResponseMessage)(this._getProtocol(), id, error)));
      timingTracker.onError(error == null ? new Error() : error);
    });
  }

  _returnObservable(id, returnVal, elementType) {
    let result;
    // Ensure that the return value is an observable.
    if (!isConnectableObservable(returnVal)) {
      result = _rxjsBundlesRxMinJs.Observable.throw(new Error('Expected an Observable, but the function returned something else.')).publish();
    } else {
      result = returnVal;
    }

    // Marshal the result, to send over the network.
    result.concatMap(value => this._getTypeRegistry().marshal(this._objectRegistry, value, elementType))

    // Send the next, error, and completion events of the observable across the socket.
    .subscribe(data => {
      this._transport.send(JSON.stringify((0, (_messages || _load_messages()).createNextMessage)(this._getProtocol(), id, data)));
    }, error => {
      this._transport.send(JSON.stringify((0, (_messages || _load_messages()).createObserveErrorMessage)(this._getProtocol(), id, error)));
      this._objectRegistry.removeSubscription(id);
    }, completed => {
      this._transport.send(JSON.stringify((0, (_messages || _load_messages()).createCompleteMessage)(this._getProtocol(), id)));
      this._objectRegistry.removeSubscription(id);
    });

    this._objectRegistry.addSubscription(id, result.connect());
  }

  // Returns true if a promise was returned.
  _returnValue(id, timingTracker, value, type) {
    switch (type.kind) {
      case 'void':
        break; // No need to send anything back to the user.
      case 'promise':
        this._returnPromise(id, timingTracker, value, type.type);
        return true;
      case 'observable':
        this._returnObservable(id, value, type.type);
        break;
      default:
        throw new Error(`Unkown return type ${ type.kind }.`);
    }
    return false;
  }

  _callFunction(id, timingTracker, call) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const {
        localImplementation,
        type
      } = _this3._getFunctionImplemention(call.method);
      const marshalledArgs = yield _this3._getTypeRegistry().unmarshalArguments(_this3._objectRegistry, call.args, type.argumentTypes);

      return _this3._returnValue(id, timingTracker, localImplementation.apply(_this3, marshalledArgs), type.returnType);
    })();
  }

  _callMethod(id, timingTracker, call) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const object = _this4._objectRegistry.unmarshal(call.objectId);

      if (!(object != null)) {
        throw new Error('Invariant violation: "object != null"');
      }

      const interfaceName = _this4._objectRegistry.getInterface(call.objectId);
      const classDefinition = _this4._getClassDefinition(interfaceName);

      if (!(classDefinition != null)) {
        throw new Error('Invariant violation: "classDefinition != null"');
      }

      const type = classDefinition.definition.instanceMethods.get(call.method);

      if (!(type != null)) {
        throw new Error('Invariant violation: "type != null"');
      }

      const marshalledArgs = yield _this4._getTypeRegistry().unmarshalArguments(_this4._objectRegistry, call.args, type.argumentTypes);

      return _this4._returnValue(id, timingTracker, object[call.method](...marshalledArgs), type.returnType);
    })();
  }

  _callConstructor(id, timingTracker, constructorMessage) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const classDefinition = _this5._getClassDefinition(constructorMessage.interface);

      if (!(classDefinition != null)) {
        throw new Error('Invariant violation: "classDefinition != null"');
      }

      const {
        localImplementation,
        definition
      } = classDefinition;
      const constructorArgs = definition.constructorArgs;

      if (!(constructorArgs != null)) {
        throw new Error('Invariant violation: "constructorArgs != null"');
      }

      const marshalledArgs = yield _this5._getTypeRegistry().unmarshalArguments(_this5._objectRegistry, constructorMessage.args, constructorArgs);

      // Create a new object and put it in the registry.
      const newObject = new localImplementation(...marshalledArgs);

      // Return the object, which will automatically be converted to an id through the
      // marshalling system.
      _this5._returnPromise(id, timingTracker, Promise.resolve(newObject), {
        kind: 'named',
        name: constructorMessage.interface,
        location: (_builtinTypes || _load_builtinTypes()).builtinLocation
      });
    })();
  }

  getTransport() {
    return this._transport;
  }

  _parseMessage(value) {
    try {
      const result = JSON.parse(value);
      if (result == null) {
        return null;
      }
      /* TODO: Uncomment this when the Hack service updates their protocol.
      if (result.protocol !== this._getProtocol()) {
        logger.error(`Recieved message with unexpected protocol: '${value}'`);
        return null;
      }
      */
      return result;
    } catch (e) {
      logger.error(`Recieved invalid JSON message: '${ value }'`);
      return null;
    }
  }

  _getProtocol() {
    return this._serviceRegistry.getProtocol();
  }

  _handleMessage(value) {
    const message = this._parseMessage(value);
    if (message == null) {
      return;
    }

    switch (message.type) {
      case 'response':
      case 'error-response':
      case 'next':
      case 'complete':
      case 'error':
        this._handleResponseMessage(message);
        break;
      case 'call':
      case 'call-object':
      case 'new':
      case 'dispose':
      case 'unsubscribe':
        this._handleRequestMessage(message);
        break;
      default:
        throw new Error('Unexpected message type');
    }
  }

  _handleResponseMessage(message) {
    const id = message.id;
    switch (message.type) {
      case 'response':
        {
          const call = this._calls.get(id);
          if (call != null) {
            const { result } = message;
            call.resolve(result);
          }
          break;
        }
      case 'error-response':
        {
          const call = this._calls.get(id);
          if (call != null) {
            const { error } = message;
            call.reject(error);
          }
          break;
        }
      case 'next':
        {
          const subscription = this._subscriptions.get(id);
          if (subscription != null) {
            const { value } = message;
            subscription.next(value);
          }
          break;
        }
      case 'complete':
        {
          const subscription = this._subscriptions.get(id);
          if (subscription != null) {
            subscription.complete();
            this._subscriptions.delete(id);
          }
          break;
        }
      case 'error':
        {
          const subscription = this._subscriptions.get(id);
          if (subscription != null) {
            const { error } = message;
            subscription.error(error);
            this._subscriptions.delete(id);
          }
          break;
        }
      default:
        throw new Error(`Unexpected message type ${ JSON.stringify(message) }`);
    }
  }

  _handleRequestMessage(message) {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const id = message.id;

      // Track timings of all function calls, method calls, and object creations.
      // Note: for Observables we only track how long it takes to create the initial Observable.
      // while for Promises we track the length of time it takes to resolve or reject.
      // For returning void, we track the time for the call to complete.
      const timingTracker = (0, (_nuclideAnalytics || _load_nuclideAnalytics()).startTracking)(trackingIdOfMessage(_this6._objectRegistry, message));

      // Here's the main message handler ...
      try {
        let returnedPromise = false;
        switch (message.type) {
          case 'call':
            returnedPromise = yield _this6._callFunction(id, timingTracker, message);
            break;
          case 'call-object':
            returnedPromise = yield _this6._callMethod(id, timingTracker, message);
            break;
          case 'new':
            yield _this6._callConstructor(id, timingTracker, message);
            returnedPromise = true;
            break;
          case 'dispose':
            yield _this6._objectRegistry.disposeObject(message.objectId);
            _this6._returnPromise(id, timingTracker, Promise.resolve(), (_builtinTypes || _load_builtinTypes()).voidType);
            returnedPromise = true;
            break;
          case 'unsubscribe':
            _this6._objectRegistry.disposeSubscription(id);
            break;
          default:
            throw new Error(`Unknown message type ${ message.type }`);
        }
        if (!returnedPromise) {
          timingTracker.onSuccess();
        }
      } catch (e) {
        logger.error(`Error handling RPC ${ message.type } message`, e);
        timingTracker.onError(e == null ? new Error() : e);
        _this6._transport.send(JSON.stringify((0, (_messages || _load_messages()).createErrorResponseMessage)(_this6._getProtocol(), id, e)));
      }
    })();
  }

  _getFunctionImplemention(name) {
    return this._serviceRegistry.getFunctionImplemention(name);
  }

  _getClassDefinition(className) {
    return this._serviceRegistry.getClassDefinition(className);
  }

  _generateRequestId() {
    return this._rpcRequestId++;
  }

  _getTypeRegistry() {
    return this._serviceRegistry.getTypeRegistry();
  }

  dispose() {
    this._transport.close();
    this._objectRegistry.dispose();
    this._calls.forEach(call => {
      call.reject(new Error('Connection Closed'));
    });
    this._subscriptions.forEach(subscription => {
      subscription.error(new Error('Connection Closed'));
    });
    this._subscriptions.clear();
  }
}

exports.RpcConnection = RpcConnection;
function trackingIdOfMessage(registry, message) {
  switch (message.type) {
    case 'call':
      return `service-framework:${ message.method }`;
    case 'call-object':
      const callInterface = registry.getInterface(message.objectId);
      return `service-framework:${ callInterface }.${ message.method }`;
    case 'new':
      return `service-framework:new:${ message.interface }`;
    case 'dispose':
      const interfaceName = registry.getInterface(message.objectId);
      return `service-framework:dispose:${ interfaceName }`;
    case 'unsubscribe':
      return 'service-framework:disposeObservable';
    default:
      throw new Error(`Unknown message type ${ message.type }`);
  }
}

function trackingIdOfMessageAndNetwork(registry, message) {
  return trackingIdOfMessage(registry, message) + ':plus-network';
}

/**
 * A helper function that checks if an object is thenable (Promise-like).
 */
function isThenable(object) {
  return Boolean(object && object.then);
}

/**
 * A helper function that checks if an object is an Observable.
 */
function isConnectableObservable(object) {
  return Boolean(object && object.concatMap && object.subscribe && object.connect);
}