"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.getAttachTargetInfoList = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "targetPid",
      type: {
        kind: "nullable",
        type: {
          kind: "number"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("NativeDebuggerService/getAttachTargetInfoList", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "array",
        type: {
          kind: "named",
          name: "AttachTargetInfo"
        }
      });
    });
  };

  remoteModule.NativeDebuggerService = class {
    constructor(arg0) {
      _client.createRemoteObject("NativeDebuggerService", this, [arg0], [{
        name: "config",
        type: {
          kind: "named",
          name: "DebuggerConfig"
        }
      }]);
    }

    getOutputWindowObservable() {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "NativeDebuggerServiceInterface.js",
          line: 62
        },
        name: "NativeDebuggerService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "getOutputWindowObservable", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "string"
        });
      }).publish();
    }

    getServerMessageObservable() {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "NativeDebuggerServiceInterface.js",
          line: 62
        },
        name: "NativeDebuggerService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "getServerMessageObservable", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "string"
        });
      }).publish();
    }

    attach(arg0) {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "attachInfo",
        type: {
          kind: "named",
          name: "AttachTargetInfo"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "NativeDebuggerServiceInterface.js",
          line: 62
        },
        name: "NativeDebuggerService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "attach", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      }).publish();
    }

    launch(arg0) {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "launchInfo",
        type: {
          kind: "named",
          name: "LaunchTargetInfo"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "NativeDebuggerServiceInterface.js",
          line: 62
        },
        name: "NativeDebuggerService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "launch", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      }).publish();
    }

    prepareForTerminalLaunch(arg0) {
      return Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "launchInfo",
        type: {
          kind: "named",
          name: "LaunchTargetInfo"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "NativeDebuggerServiceInterface.js",
          line: 62
        },
        name: "NativeDebuggerService"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "prepareForTerminalLaunch", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "named",
          name: "PrepareForLaunchResponse"
        });
      });
    }

    bootstrap(arg0) {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "bootstrapInfo",
        type: {
          kind: "named",
          name: "BootstrapDebuggerInfo"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "NativeDebuggerServiceInterface.js",
          line: 62
        },
        name: "NativeDebuggerService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "bootstrap", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      }).publish();
    }

    sendCommand(arg0) {
      return Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "message",
        type: {
          kind: "string"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "NativeDebuggerServiceInterface.js",
          line: 62
        },
        name: "NativeDebuggerService"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "sendCommand", "promise", args)).then(value => {
        return _client.unmarshal(value, {
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
  value: {
    Object: {
      kind: "alias",
      name: "Object",
      location: {
        type: "builtin"
      }
    },
    Date: {
      kind: "alias",
      name: "Date",
      location: {
        type: "builtin"
      }
    },
    RegExp: {
      kind: "alias",
      name: "RegExp",
      location: {
        type: "builtin"
      }
    },
    Buffer: {
      kind: "alias",
      name: "Buffer",
      location: {
        type: "builtin"
      }
    },
    "fs.Stats": {
      kind: "alias",
      name: "fs.Stats",
      location: {
        type: "builtin"
      }
    },
    NuclideUri: {
      kind: "alias",
      name: "NuclideUri",
      location: {
        type: "builtin"
      }
    },
    atom$Point: {
      kind: "alias",
      name: "atom$Point",
      location: {
        type: "builtin"
      }
    },
    atom$Range: {
      kind: "alias",
      name: "atom$Range",
      location: {
        type: "builtin"
      }
    },
    AttachTargetInfo: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "NativeDebuggerServiceInterface.js",
        line: 16
      },
      name: "AttachTargetInfo",
      definition: {
        kind: "object",
        fields: [{
          name: "pid",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "name",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "commandName",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "basepath",
          type: {
            kind: "string"
          },
          optional: true
        }]
      }
    },
    LaunchTargetInfo: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "NativeDebuggerServiceInterface.js",
        line: 23
      },
      name: "LaunchTargetInfo",
      definition: {
        kind: "object",
        fields: [{
          name: "executablePath",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "arguments",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          },
          optional: false
        }, {
          name: "environmentVariables",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          },
          optional: false
        }, {
          name: "workingDirectory",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "stdinFilePath",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "basepath",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "lldbPythonPath",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: true
        }, {
          name: "coreDump",
          type: {
            kind: "string"
          },
          optional: true
        }]
      }
    },
    BootstrapDebuggerInfo: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "NativeDebuggerServiceInterface.js",
        line: 34
      },
      name: "BootstrapDebuggerInfo",
      definition: {
        kind: "object",
        fields: [{
          name: "lldbBootstrapFiles",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          },
          optional: false
        }, {
          name: "basepath",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "lldbPythonPath",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: true
        }]
      }
    },
    LogLevel: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 14
      },
      name: "LogLevel",
      definition: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "ALL"
        }, {
          kind: "string-literal",
          value: "TRACE"
        }, {
          kind: "string-literal",
          value: "DEBUG"
        }, {
          kind: "string-literal",
          value: "INFO"
        }, {
          kind: "string-literal",
          value: "WARN"
        }, {
          kind: "string-literal",
          value: "ERROR"
        }, {
          kind: "string-literal",
          value: "FATAL"
        }, {
          kind: "string-literal",
          value: "OFF"
        }]
      }
    },
    DebuggerConfig: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "NativeDebuggerServiceInterface.js",
        line: 40
      },
      name: "DebuggerConfig",
      definition: {
        kind: "object",
        fields: [{
          name: "logLevel",
          type: {
            kind: "named",
            name: "LogLevel"
          },
          optional: false
        }, {
          name: "pythonBinaryPath",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: false
        }, {
          name: "buckConfigRootFile",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "lldbPythonPath",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: false
        }, {
          name: "envPythonPath",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    PrepareForLaunchResponse: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "NativeDebuggerServiceInterface.js",
        line: 49
      },
      name: "PrepareForLaunchResponse",
      definition: {
        kind: "object",
        fields: [{
          name: "launchCommand",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "launchCwd",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          name: "targetExecutable",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          name: "launchArgs",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          },
          optional: false
        }]
      }
    },
    getAttachTargetInfoList: {
      kind: "function",
      name: "getAttachTargetInfoList",
      location: {
        type: "source",
        fileName: "NativeDebuggerServiceInterface.js",
        line: 56
      },
      type: {
        location: {
          type: "source",
          fileName: "NativeDebuggerServiceInterface.js",
          line: 56
        },
        kind: "function",
        argumentTypes: [{
          name: "targetPid",
          type: {
            kind: "nullable",
            type: {
              kind: "number"
            }
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "AttachTargetInfo"
            }
          }
        }
      }
    },
    NativeDebuggerService: {
      kind: "interface",
      name: "NativeDebuggerService",
      location: {
        type: "source",
        fileName: "NativeDebuggerServiceInterface.js",
        line: 62
      },
      constructorArgs: [{
        name: "config",
        type: {
          kind: "named",
          name: "DebuggerConfig"
        }
      }],
      staticMethods: {},
      instanceMethods: {
        getOutputWindowObservable: {
          location: {
            type: "source",
            fileName: "NativeDebuggerServiceInterface.js",
            line: 65
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "observable",
            type: {
              kind: "string"
            }
          }
        },
        getServerMessageObservable: {
          location: {
            type: "source",
            fileName: "NativeDebuggerServiceInterface.js",
            line: 69
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "observable",
            type: {
              kind: "string"
            }
          }
        },
        attach: {
          location: {
            type: "source",
            fileName: "NativeDebuggerServiceInterface.js",
            line: 73
          },
          kind: "function",
          argumentTypes: [{
            name: "attachInfo",
            type: {
              kind: "named",
              name: "AttachTargetInfo"
            }
          }],
          returnType: {
            kind: "observable",
            type: {
              kind: "void"
            }
          }
        },
        launch: {
          location: {
            type: "source",
            fileName: "NativeDebuggerServiceInterface.js",
            line: 77
          },
          kind: "function",
          argumentTypes: [{
            name: "launchInfo",
            type: {
              kind: "named",
              name: "LaunchTargetInfo"
            }
          }],
          returnType: {
            kind: "observable",
            type: {
              kind: "void"
            }
          }
        },
        prepareForTerminalLaunch: {
          location: {
            type: "source",
            fileName: "NativeDebuggerServiceInterface.js",
            line: 81
          },
          kind: "function",
          argumentTypes: [{
            name: "launchInfo",
            type: {
              kind: "named",
              name: "LaunchTargetInfo"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "named",
              name: "PrepareForLaunchResponse"
            }
          }
        },
        bootstrap: {
          location: {
            type: "source",
            fileName: "NativeDebuggerServiceInterface.js",
            line: 87
          },
          kind: "function",
          argumentTypes: [{
            name: "bootstrapInfo",
            type: {
              kind: "named",
              name: "BootstrapDebuggerInfo"
            }
          }],
          returnType: {
            kind: "observable",
            type: {
              kind: "void"
            }
          }
        },
        sendCommand: {
          location: {
            type: "source",
            fileName: "NativeDebuggerServiceInterface.js",
            line: 91
          },
          kind: "function",
          argumentTypes: [{
            name: "message",
            type: {
              kind: "string"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "void"
            }
          }
        },
        dispose: {
          location: {
            type: "source",
            fileName: "NativeDebuggerServiceInterface.js",
            line: 95
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "promise",
            type: {
              kind: "void"
            }
          }
        }
      }
    }
  }
});