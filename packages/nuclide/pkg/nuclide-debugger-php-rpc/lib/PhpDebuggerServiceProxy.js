"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};
  remoteModule.PhpDebuggerService = class {
    constructor() {
      _client.createRemoteObject("PhpDebuggerService", this, [], []);
    }

    getNotificationObservable() {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 71
          },
          name: "PhpDebuggerService"
        }).then(id => {
          return _client.callRemoteMethod(id, "getNotificationObservable", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 89
          },
          kind: "named",
          name: "NotificationMessage"
        });
      }).publish();
    }

    getServerMessageObservable() {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 71
          },
          name: "PhpDebuggerService"
        }).then(id => {
          return _client.callRemoteMethod(id, "getServerMessageObservable", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 93
          },
          kind: "string"
        });
      }).publish();
    }

    getOutputWindowObservable() {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 71
          },
          name: "PhpDebuggerService"
        }).then(id => {
          return _client.callRemoteMethod(id, "getOutputWindowObservable", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 97
          },
          kind: "string"
        });
      }).publish();
    }

    debug(arg0) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "config",
        type: {
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 101
          },
          kind: "named",
          name: "PhpDebuggerSessionConfig"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 71
          },
          name: "PhpDebuggerService"
        }).then(id => {
          return _client.callRemoteMethod(id, "debug", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 101
          },
          kind: "string"
        });
      });
    }

    sendCommand(arg0) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "message",
        type: {
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 124
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 71
          },
          name: "PhpDebuggerService"
        }).then(id => {
          return _client.callRemoteMethod(id, "sendCommand", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 124
          },
          kind: "void"
        });
      });
    }

    dispose() {
      return _client.disposeRemoteObject(this);
    }

  };
  return remoteModule;
};

Object.defineProperty(module.exports, "inject", {
  value: function () {
    Observable = arguments[0];
  }
});
Object.defineProperty(module.exports, "defs", {
  value: new Map([["Object", {
    kind: "alias",
    name: "Object",
    location: {
      type: "builtin"
    }
  }], ["Date", {
    kind: "alias",
    name: "Date",
    location: {
      type: "builtin"
    }
  }], ["RegExp", {
    kind: "alias",
    name: "RegExp",
    location: {
      type: "builtin"
    }
  }], ["Buffer", {
    kind: "alias",
    name: "Buffer",
    location: {
      type: "builtin"
    }
  }], ["fs.Stats", {
    kind: "alias",
    name: "fs.Stats",
    location: {
      type: "builtin"
    }
  }], ["NuclideUri", {
    kind: "alias",
    name: "NuclideUri",
    location: {
      type: "builtin"
    }
  }], ["atom$Point", {
    kind: "alias",
    name: "atom$Point",
    location: {
      type: "builtin"
    }
  }], ["atom$Range", {
    kind: "alias",
    name: "atom$Range",
    location: {
      type: "builtin"
    }
  }], ["PhpDebuggerSessionConfig", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "PhpDebuggerService.js",
      line: 22
    },
    name: "PhpDebuggerSessionConfig",
    definition: {
      location: {
        type: "source",
        fileName: "PhpDebuggerService.js",
        line: 22
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "PhpDebuggerService.js",
          line: 23
        },
        name: "xdebugAttachPort",
        type: {
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 23
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PhpDebuggerService.js",
          line: 24
        },
        name: "xdebugLaunchingPort",
        type: {
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 24
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PhpDebuggerService.js",
          line: 25
        },
        name: "launchScriptPath",
        type: {
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 25
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "PhpDebuggerService.js",
          line: 26
        },
        name: "pid",
        type: {
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 26
          },
          kind: "number"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "PhpDebuggerService.js",
          line: 27
        },
        name: "attachScriptRegex",
        type: {
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 27
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "PhpDebuggerService.js",
          line: 28
        },
        name: "idekeyRegex",
        type: {
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 28
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "PhpDebuggerService.js",
          line: 29
        },
        name: "endDebugWhenNoRequests",
        type: {
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 29
          },
          kind: "boolean"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "PhpDebuggerService.js",
          line: 30
        },
        name: "logLevel",
        type: {
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 30
          },
          kind: "named",
          name: "LogLevel"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PhpDebuggerService.js",
          line: 31
        },
        name: "targetUri",
        type: {
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 31
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PhpDebuggerService.js",
          line: 32
        },
        name: "phpRuntimePath",
        type: {
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 32
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PhpDebuggerService.js",
          line: 33
        },
        name: "phpRuntimeArgs",
        type: {
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 33
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PhpDebuggerService.js",
          line: 34
        },
        name: "dummyRequestFilePath",
        type: {
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 34
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PhpDebuggerService.js",
          line: 35
        },
        name: "stopOneStopAll",
        type: {
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 35
          },
          kind: "boolean"
        },
        optional: false
      }]
    }
  }], ["NotificationMessage", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "PhpDebuggerService.js",
      line: 38
    },
    name: "NotificationMessage",
    definition: {
      location: {
        type: "source",
        fileName: "PhpDebuggerService.js",
        line: 38
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "PhpDebuggerService.js",
          line: 39
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 39
          },
          kind: "union",
          types: [{
            location: {
              type: "source",
              fileName: "PhpDebuggerService.js",
              line: 39
            },
            kind: "string-literal",
            value: "info"
          }, {
            location: {
              type: "source",
              fileName: "PhpDebuggerService.js",
              line: 39
            },
            kind: "string-literal",
            value: "warning"
          }, {
            location: {
              type: "source",
              fileName: "PhpDebuggerService.js",
              line: 39
            },
            kind: "string-literal",
            value: "error"
          }, {
            location: {
              type: "source",
              fileName: "PhpDebuggerService.js",
              line: 39
            },
            kind: "string-literal",
            value: "fatalError"
          }]
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PhpDebuggerService.js",
          line: 40
        },
        name: "message",
        type: {
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 40
          },
          kind: "string"
        },
        optional: false
      }]
    }
  }], ["PhpDebuggerService", {
    kind: "interface",
    name: "PhpDebuggerService",
    location: {
      type: "source",
      fileName: "PhpDebuggerService.js",
      line: 71
    },
    constructorArgs: [],
    staticMethods: new Map(),
    instanceMethods: new Map([["getNotificationObservable", {
      location: {
        type: "source",
        fileName: "PhpDebuggerService.js",
        line: 89
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "PhpDebuggerService.js",
          line: 89
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 89
          },
          kind: "named",
          name: "NotificationMessage"
        }
      }
    }], ["getServerMessageObservable", {
      location: {
        type: "source",
        fileName: "PhpDebuggerService.js",
        line: 93
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "PhpDebuggerService.js",
          line: 93
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 93
          },
          kind: "string"
        }
      }
    }], ["getOutputWindowObservable", {
      location: {
        type: "source",
        fileName: "PhpDebuggerService.js",
        line: 97
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "PhpDebuggerService.js",
          line: 97
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 97
          },
          kind: "string"
        }
      }
    }], ["debug", {
      location: {
        type: "source",
        fileName: "PhpDebuggerService.js",
        line: 101
      },
      kind: "function",
      argumentTypes: [{
        name: "config",
        type: {
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 101
          },
          kind: "named",
          name: "PhpDebuggerSessionConfig"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "PhpDebuggerService.js",
          line: 101
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 101
          },
          kind: "string"
        }
      }
    }], ["sendCommand", {
      location: {
        type: "source",
        fileName: "PhpDebuggerService.js",
        line: 124
      },
      kind: "function",
      argumentTypes: [{
        name: "message",
        type: {
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 124
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "PhpDebuggerService.js",
          line: 124
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 124
          },
          kind: "void"
        }
      }
    }], ["dispose", {
      location: {
        type: "source",
        fileName: "PhpDebuggerService.js",
        line: 157
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "PhpDebuggerService.js",
          line: 157
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 157
          },
          kind: "void"
        }
      }
    }]])
  }], ["LogLevel", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 11
    },
    name: "LogLevel",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 12
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 12
        },
        kind: "string-literal",
        value: "ALL"
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 13
        },
        kind: "string-literal",
        value: "TRACE"
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 14
        },
        kind: "string-literal",
        value: "DEBUG"
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 15
        },
        kind: "string-literal",
        value: "INFO"
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 16
        },
        kind: "string-literal",
        value: "WARN"
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 17
        },
        kind: "string-literal",
        value: "ERROR"
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 18
        },
        kind: "string-literal",
        value: "FATAL"
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 19
        },
        kind: "string-literal",
        value: "OFF"
      }]
    }
  }]])
});