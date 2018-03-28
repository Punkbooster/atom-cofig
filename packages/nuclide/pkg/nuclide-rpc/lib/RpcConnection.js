'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RpcConnection = exports.RpcTimeoutError = undefined;

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

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-rpc'); /**
                                                                           * Copyright (c) 2015-present, Facebook, Inc.
                                                                           * All rights reserved.
                                                                           *
                                                                           * This source code is licensed under the license found in the LICENSE file in
                                                                           * the root directory of this source tree.
                                                                           *
                                                                           * 
                                                                           * @format
                                                                           */

const SERVICE_FRAMEWORK_RPC_TIMEOUT_MS = 60 * 1000;
const LARGE_RESPONSE_SIZE = 100000;

class Subscription {

  // Track the total number of received bytes to track large subscriptions.
  // Reset the count every minute so frequent offenders fire repeatedly.
  constructor(message, observer) {
    this._message = message;
    this._observer = observer;
    this._totalBytes = 0;
    this._firstByteTime = 0;
  }

  error(error) {
    try {
      this._observer.error((0, (_messages || _load_messages()).decodeError)(this._message, error));
    } catch (e) {
      logger.error(`Caught exception in Subscription.error: ${e.toString()}`);
    }
  }

  next(data, bytes) {
    try {
      this._observer.next(data);
      // TODO: consider implementing a rate limit
      this._totalBytes += bytes;
    } catch (e) {
      logger.error(`Caught exception in Subscription.next: ${e.toString()}`);
    }
  }

  complete() {
    try {
      this._observer.complete();
    } catch (e) {
      logger.error(`Caught exception in Subscription.complete: ${e.toString()}`);
    }
  }

  getBytes() {
    if (Date.now() - this._firstByteTime > 60000) {
      this._totalBytes = 0;
      this._firstByteTime = Date.now();
    }
    return this._totalBytes;
  }
}

// Special marker error for RPC timeouts.
class RpcTimeoutError extends Error {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.name = 'RpcTimeoutError', _temp;
  }

}

exports.RpcTimeoutError = RpcTimeoutError;
class Call {

  constructor(message, timeoutMessage, resolve, reject, cleanup) {
    this._message = message;
    this._timeoutMessage = timeoutMessage;
    this._resolve = resolve;
    this._reject = reject;
    this._cleanup = cleanup;
    this._complete = false;
    if (timeoutMessage != null) {
      this._timerId = setTimeout(() => {
        this._timeout();
      }, SERVICE_FRAMEWORK_RPC_TIMEOUT_MS);
    }
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
      // $FlowFixMe
      clearTimeout(this._timerId);
      this._timerId = null;
      this._cleanup();
    }
  }

  _timeout() {
    const timeoutMessage = this._timeoutMessage;

    if (!(timeoutMessage != null)) {
      throw new Error('Invariant violation: "timeoutMessage != null"');
    }

    if (!this._complete) {
      this.cleanup();
      this._reject(new RpcTimeoutError(`Timeout after ${SERVICE_FRAMEWORK_RPC_TIMEOUT_MS} for id: ` + `${this._message.id}, ${timeoutMessage}.`));
    }
  }
}

class RpcConnection {

  // Do not call this directly, use factory methods below.


  // Used to track if the IDs are incrementing atomically
  constructor(kind, serviceRegistry, transport, options = {}, connectionId = null, protocolLogger = null) {
    this._kind = kind;
    this._transport = transport;
    this._options = options;
    this._rpcRequestId = 1;
    this._rpcResponseId = 1;
    this._serviceRegistry = serviceRegistry;
    this._objectRegistry = new (_ObjectRegistry || _load_ObjectRegistry()).ObjectRegistry(kind, this._serviceRegistry, this);
    this._transport.onMessage().subscribe(message => {
      this._handleMessage(message);
    });
    this._subscriptions = new Map();
    this._calls = new Map();
    this._lastRequestId = -1;
    this._lastResponseId = -1;

    if (protocolLogger != null) {
      const prefix = connectionId == null ? '' : `${connectionId} `;
      this._objectRegistry.onRegisterLocal(id => protocolLogger.info('%sadding local object %s', prefix, id));
      this._objectRegistry.onUnregisterLocal(id => protocolLogger.info('%sremoving local object %s', prefix, id));
      this._objectRegistry.onRegisterRemote(id => protocolLogger.info('%sadding remote object %s', prefix, id));
    }
  }

  // Creates a connection on the server side.
  static createServer(serviceRegistry, transport, options = {}, connectionId = null, protocolLogger = null) {
    return new RpcConnection('server', serviceRegistry, transport, options, connectionId, protocolLogger);
  }

  // Creates a client side connection to a server on another machine.
  static createRemote(transport, predefinedTypes, services, options = {}, protocol = (_config || _load_config()).SERVICE_FRAMEWORK3_PROTOCOL, connectionId = null, protocolLogger = null) {
    return new RpcConnection('client', new (_ServiceRegistry || _load_ServiceRegistry()).ServiceRegistry(predefinedTypes, services, protocol), transport, options, connectionId, protocolLogger);
  }

  // Creates a client side connection to a server on the same machine.
  static createLocal(transport, predefinedTypes, services, protocol = (_config || _load_config()).SERVICE_FRAMEWORK3_PROTOCOL, connectionId = null, protocolLogger = null) {
    return new RpcConnection('client',
    // We can afford to be lazy when creating the RPC client.
    // Client code always explicitly loads services by name!
    new (_ServiceRegistry || _load_ServiceRegistry()).ServiceRegistry(predefinedTypes, services, protocol, { lazy: true }), transport, {}, connectionId, protocolLogger);
  }

  getService(serviceName) {
    const service = this._objectRegistry.getService(serviceName);

    if (!(service != null)) {
      throw new Error(`No config found for service ${serviceName}`);
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
    return this._sendMessageAndListenForResult((0, (_messages || _load_messages()).createCallMessage)(this._getProtocol(), functionName, this._generateRequestId(), args), returnType, `Calling function ${functionName}`);
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
    return this._sendMessageAndListenForResult((0, (_messages || _load_messages()).createCallObjectMessage)(this._getProtocol(), methodName, objectId, this._generateRequestId(), args), returnType, `Calling remote method ${methodName}.`);
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
      return _this._sendMessageAndListenForResult((0, (_messages || _load_messages()).createNewObjectMessage)(_this._getProtocol(), interfaceName, _this._generateRequestId(), marshalledArgs), 'promise', `Creating instance of ${interfaceName}`);
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
        return _this2._sendMessageAndListenForResult((0, (_messages || _load_messages()).createDisposeMessage)(_this2._getProtocol(), _this2._generateRequestId(), objectId), 'promise', `Disposing object ${objectId}`);
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
    switch (returnType) {
      case 'void':
        this._transport.send(JSON.stringify(message));
        return; // No values to return.
      case 'promise':
        // Listen for a single message, and resolve or reject a promise on that message.
        // If we're a server, we never give timeout errors and instead always
        // just queue up the message on the reliable transport; timeout errors
        // are solely intended to help clients behave nicer.
        const promise = new Promise((resolve, reject) => {
          this._transport.send(JSON.stringify(message));
          this._calls.set(message.id, new Call(message, this._kind === 'server' ? null : timeoutMessage, resolve, reject, () => {
            this._calls.delete(message.id);
          }));
        });
        const { trackSampleRate } = this._options;
        // flowlint-next-line sketchy-null-number:off
        if (trackSampleRate && Math.random() * trackSampleRate <= 1) {
          return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)(trackingIdOfMessageAndNetwork(this._objectRegistry, message), () => promise);
        }
        return promise;
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
        throw new Error(`Unknown return type: ${returnType}.`);
    }
  }

  _returnPromise(id, candidate, type) {
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
      this._transport.send(JSON.stringify((0, (_messages || _load_messages()).createPromiseMessage)(this._getProtocol(), id, this._generateResponseId(), result)));
    }, error => {
      this._transport.send(JSON.stringify((0, (_messages || _load_messages()).createErrorResponseMessage)(this._getProtocol(), id, this._generateResponseId(), error)));
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
      this._transport.send(JSON.stringify((0, (_messages || _load_messages()).createNextMessage)(this._getProtocol(), id, this._generateResponseId(), data)));
    }, error => {
      this._transport.send(JSON.stringify((0, (_messages || _load_messages()).createObserveErrorMessage)(this._getProtocol(), id, this._generateResponseId(), error)));
      this._objectRegistry.removeSubscription(id);
    }, completed => {
      this._transport.send(JSON.stringify((0, (_messages || _load_messages()).createCompleteMessage)(this._getProtocol(), id, this._generateResponseId())));
      this._objectRegistry.removeSubscription(id);
    });

    this._objectRegistry.addSubscription(id, result.connect());
  }

  // Returns true if a promise was returned.
  _returnValue(id, value, type) {
    switch (type.kind) {
      case 'void':
        break; // No need to send anything back to the user.
      case 'promise':
        this._returnPromise(id, value, type.type);
        break;
      case 'observable':
        this._returnObservable(id, value, type.type);
        break;
      default:
        throw new Error(`Unknown return type ${type.kind}.`);
    }
  }

  _callFunction(id, call) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { getLocalImplementation, type } = _this3._getFunctionImplemention(call.method);
      const marshalledArgs = yield _this3._getTypeRegistry().unmarshalArguments(_this3._objectRegistry, call.args, type.argumentTypes);
      const localImplementation = getLocalImplementation();
      _this3._returnValue(id, localImplementation.apply(_this3, marshalledArgs), type.returnType);
    })();
  }

  _callMethod(id, call) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const object = _this4._objectRegistry.unmarshal(call.objectId);

      if (!(object != null)) {
        throw new Error('Invariant violation: "object != null"');
      }

      const interfaceName = _this4._objectRegistry.getInterface(call.objectId);
      const { definition } = _this4._getClassDefinition(interfaceName);
      const type = definition.instanceMethods[call.method];

      const marshalledArgs = yield _this4._getTypeRegistry().unmarshalArguments(_this4._objectRegistry, call.args, type.argumentTypes);

      _this4._returnValue(id, object[call.method](...marshalledArgs), type.returnType);
    })();
  }

  _callConstructor(id, constructorMessage) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { getLocalImplementation, definition } = _this5._getClassDefinition(constructorMessage.interface);
      const { constructorArgs } = definition;

      if (!(constructorArgs != null)) {
        throw new Error('Invariant violation: "constructorArgs != null"');
      }

      const marshalledArgs = yield _this5._getTypeRegistry().unmarshalArguments(_this5._objectRegistry, constructorMessage.args, constructorArgs);
      const localImplementation = getLocalImplementation();
      // Create a new object and put it in the registry.
      const newObject = new localImplementation(...marshalledArgs);

      // If we want to use client-assigned IDs in the future, we need to
      // assign the ID to the object after construction.
      // Attempting to marshal before construction is complete makes this impossible.
      if (_this5._objectRegistry.isRegistered(newObject)) {
        logger.error(`Object of type ${constructorMessage.interface} was marshalled during the constructor.`);
      }

      // Return the object, which will automatically be converted to an id through the
      // marshalling system.
      _this5._returnPromise(id, Promise.resolve(newObject), {
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
        logger.error(`Received message with unexpected protocol: '${value}'`);
        return null;
      }
      */
      return result;
    } catch (e) {
      logger.error(`Received invalid JSON message: '${value}'`);
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
        this._handleResponseMessage(message, value);
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

  // Handles the response and returns the originating request message (if possible).
  _handleResponseMessage(message, rawMessage) {
    const id = message.id;
    // Keep track of the request message for logging
    let requestMessage = null;

    // Here's the main message handler ...
    switch (message.type) {
      case 'response':
        {
          const call = this._calls.get(id);
          if (call != null) {
            const { result } = message;
            call.resolve(result);
            requestMessage = call._message;
            if (rawMessage.length >= LARGE_RESPONSE_SIZE) {
              this._trackLargeResponse(call._message, rawMessage.length);
            }
          }
          break;
        }
      case 'error-response':
        {
          const call = this._calls.get(id);
          if (call != null) {
            const { error } = message;
            call.reject(error);
            requestMessage = call._message;
          }
          break;
        }
      case 'next':
        {
          const subscription = this._subscriptions.get(id);
          if (subscription != null) {
            const { value } = message;
            const prevBytes = subscription.getBytes();
            subscription.next(value, rawMessage.length);
            requestMessage = subscription._message;
            if (prevBytes < LARGE_RESPONSE_SIZE) {
              const bytes = subscription.getBytes();
              if (bytes >= LARGE_RESPONSE_SIZE) {
                this._trackLargeResponse(subscription._message, bytes);
              }
            }
          }
          break;
        }
      case 'complete':
        {
          const subscription = this._subscriptions.get(id);
          if (subscription != null) {
            subscription.complete();
            this._subscriptions.delete(id);
            requestMessage = subscription._message;
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
            requestMessage = subscription._message;
          }
          break;
        }
      default:
        throw new Error(`Unexpected message type ${JSON.stringify(message)}`);
    }
    // end main handler

    const responseId = message.responseId;
    if (responseId !== this._lastResponseId + 1 && this._lastResponseId !== -1 && requestMessage != null && this._options.trackSampleRate != null) {
      const eventName = trackingIdOfMessage(this._objectRegistry, requestMessage);

      logger.warn(`Out-of-order response received, responseId === ${responseId},` + `_lastResponseId === ${this._lastResponseId}`);

      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('response-message-id-mismatch', {
        eventName,
        responseId,
        lastResponseId: this._lastResponseId
      });
    }

    if (responseId > this._lastResponseId) {
      this._lastResponseId = responseId;
    }
  }

  _handleRequestMessage(message) {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const id = message.id;

      if (id !== _this6._lastRequestId + 1 && _this6._lastRequestId !== -1 &&
      // We're excluding Unsubscribe messages since they reuse the IDs from
      // their corresponding Subscribe messages, and will trigger
      // false positive warnings.
      message.type !== 'unsubscribe') {
        const eventName = trackingIdOfMessage(_this6._objectRegistry, message);

        logger.warn(`Out-of-order message received, id === ${id},` + `_lastRequestId === ${_this6._lastRequestId}`);

        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('message-id-mismatch', {
          eventName,
          id,
          lastRequestId: _this6._lastRequestId
        });
      }

      if (id > _this6._lastRequestId) {
        _this6._lastRequestId = id;
      }

      // Here's the main message handler ...
      try {
        switch (message.type) {
          case 'call':
            yield _this6._callFunction(id, message);
            break;
          case 'call-object':
            yield _this6._callMethod(id, message);
            break;
          case 'new':
            yield _this6._callConstructor(id, message);
            break;
          case 'dispose':
            yield _this6._objectRegistry.disposeObject(message.objectId);
            _this6._returnPromise(id, Promise.resolve(), (_builtinTypes || _load_builtinTypes()).voidType);
            break;
          case 'unsubscribe':
            _this6._objectRegistry.disposeSubscription(id);
            break;
          default:
            throw new Error(`Unknown message type ${message.type}`);
        }
      } catch (e) {
        logger.error(`Error handling RPC ${message.type} message`, e);
        _this6._transport.send(JSON.stringify((0, (_messages || _load_messages()).createErrorResponseMessage)(_this6._getProtocol(), id, _this6._generateResponseId(), e)));
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

  _generateResponseId() {
    return this._rpcResponseId++;
  }

  _getTypeRegistry() {
    return this._serviceRegistry.getTypeRegistry();
  }

  _trackLargeResponse(message, size) {
    // flowlint-next-line sketchy-null-number:off
    if (!this._options.trackSampleRate) {
      return;
    }
    const eventName = trackingIdOfMessage(this._objectRegistry, message);
    const args = message.args != null ? (0, (_string || _load_string()).shorten)(JSON.stringify(message.args), 100, '...') : '';
    logger.warn(`${eventName}: Large response of size ${size}. Args:`, args);
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('large-rpc-response', {
      eventName,
      size,
      args
    });
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
      return `service-framework:${message.method}`;
    case 'call-object':
      const callInterface = registry.getInterface(message.objectId);
      return `service-framework:${callInterface}.${message.method}`;
    case 'new':
      return `service-framework:new:${message.interface}`;
    case 'dispose':
      const interfaceName = registry.getInterface(message.objectId);
      return `service-framework:dispose:${interfaceName}`;
    case 'unsubscribe':
      return 'service-framework:disposeObservable';
    default:
      throw new Error(`Unknown message type ${message.type}`);
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