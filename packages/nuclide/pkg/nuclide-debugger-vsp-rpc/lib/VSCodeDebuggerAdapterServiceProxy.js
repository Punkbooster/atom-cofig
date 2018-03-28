"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};
  remoteModule.VSCodeDebuggerAdapterService = class {
    constructor(arg0) {
      _client.createRemoteObject("VSCodeDebuggerAdapterService", this, [arg0], [{
        name: "adapterType",
        type: {
          kind: "named",
          name: "VsAdapterType"
        }
      }]);
    }

    debug(arg0, arg1, arg2) {
      return Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "adapter",
        type: {
          kind: "named",
          name: "VSAdapterExecutableInfo"
        }
      }, {
        name: "debugMode",
        type: {
          kind: "named",
          name: "DebuggerConfigAction"
        }
      }, {
        name: "args",
        type: {
          kind: "named",
          name: "Object"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "VSCodeDebuggerAdapterService.js",
          line: 30
        },
        name: "VSCodeDebuggerAdapterService"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "debug", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "string"
        });
      });
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
          fileName: "VSCodeDebuggerAdapterService.js",
          line: 30
        },
        name: "VSCodeDebuggerAdapterService"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "sendCommand", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      });
    }

    getOutputWindowObservable() {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "VSCodeDebuggerAdapterService.js",
          line: 30
        },
        name: "VSCodeDebuggerAdapterService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "getOutputWindowObservable", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "string"
        });
      }).publish();
    }

    getAtomNotificationObservable() {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "VSCodeDebuggerAdapterService.js",
          line: 30
        },
        name: "VSCodeDebuggerAdapterService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "getAtomNotificationObservable", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "named",
          name: "AtomNotification"
        });
      }).publish();
    }

    getServerMessageObservable() {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "VSCodeDebuggerAdapterService.js",
          line: 30
        },
        name: "VSCodeDebuggerAdapterService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "getServerMessageObservable", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "string"
        });
      }).publish();
    }

    dispose() {
      return _client.disposeRemoteObject(this);
    }

  };
  remoteModule.VsRawAdapterSpawnerService = class {
    constructor() {
      _client.createRemoteObject("VsRawAdapterSpawnerService", this, [], []);
    }

    spawnAdapter(arg0) {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "adapter",
        type: {
          kind: "named",
          name: "VSAdapterExecutableInfo"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "VSCodeDebuggerAdapterService.js",
          line: 89
        },
        name: "VsRawAdapterSpawnerService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "spawnAdapter", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "named",
          name: "ProcessMessage"
        });
      }).publish();
    }

    write(arg0) {
      return Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "input",
        type: {
          kind: "string"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "VSCodeDebuggerAdapterService.js",
          line: 89
        },
        name: "VsRawAdapterSpawnerService"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "write", "promise", args)).then(value => {
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
    VsAdapterType: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 33
      },
      name: "VsAdapterType",
      definition: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "hhvm"
        }, {
          kind: "string-literal",
          value: "python"
        }, {
          kind: "string-literal",
          value: "node"
        }, {
          kind: "string-literal",
          value: "java"
        }, {
          kind: "string-literal",
          value: "react_native"
        }, {
          kind: "string-literal",
          value: "prepack"
        }, {
          kind: "string-literal",
          value: "ocaml"
        }, {
          kind: "string-literal",
          value: "mobilejs"
        }]
      }
    },
    VSAdapterExecutableInfo: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 28
      },
      name: "VSAdapterExecutableInfo",
      definition: {
        kind: "object",
        fields: [{
          name: "command",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "args",
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
    DebuggerConfigAction: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 26
      },
      name: "DebuggerConfigAction",
      definition: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "launch"
        }, {
          kind: "string-literal",
          value: "attach"
        }]
      }
    },
    AtomNotificationType: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 20
      },
      name: "AtomNotificationType",
      definition: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "info"
        }, {
          kind: "string-literal",
          value: "warning"
        }, {
          kind: "string-literal",
          value: "error"
        }, {
          kind: "string-literal",
          value: "fatalError"
        }]
      }
    },
    AtomNotification: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 21
      },
      name: "AtomNotification",
      definition: {
        kind: "object",
        fields: [{
          name: "type",
          type: {
            kind: "named",
            name: "AtomNotificationType"
          },
          optional: false
        }, {
          name: "message",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    VSCodeDebuggerAdapterService: {
      kind: "interface",
      name: "VSCodeDebuggerAdapterService",
      location: {
        type: "source",
        fileName: "VSCodeDebuggerAdapterService.js",
        line: 30
      },
      constructorArgs: [{
        name: "adapterType",
        type: {
          kind: "named",
          name: "VsAdapterType"
        }
      }],
      staticMethods: {},
      instanceMethods: {
        debug: {
          location: {
            type: "source",
            fileName: "VSCodeDebuggerAdapterService.js",
            line: 39
          },
          kind: "function",
          argumentTypes: [{
            name: "adapter",
            type: {
              kind: "named",
              name: "VSAdapterExecutableInfo"
            }
          }, {
            name: "debugMode",
            type: {
              kind: "named",
              name: "DebuggerConfigAction"
            }
          }, {
            name: "args",
            type: {
              kind: "named",
              name: "Object"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "string"
            }
          }
        },
        sendCommand: {
          location: {
            type: "source",
            fileName: "VSCodeDebuggerAdapterService.js",
            line: 62
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
        getOutputWindowObservable: {
          location: {
            type: "source",
            fileName: "VSCodeDebuggerAdapterService.js",
            line: 72
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
        getAtomNotificationObservable: {
          location: {
            type: "source",
            fileName: "VSCodeDebuggerAdapterService.js",
            line: 76
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "observable",
            type: {
              kind: "named",
              name: "AtomNotification"
            }
          }
        },
        getServerMessageObservable: {
          location: {
            type: "source",
            fileName: "VSCodeDebuggerAdapterService.js",
            line: 80
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
        dispose: {
          location: {
            type: "source",
            fileName: "VSCodeDebuggerAdapterService.js",
            line: 84
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
    },
    ProcessExitMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process.js",
        line: 600
      },
      name: "ProcessExitMessage",
      definition: {
        kind: "object",
        fields: [{
          name: "kind",
          type: {
            kind: "string-literal",
            value: "exit"
          },
          optional: false
        }, {
          name: "exitCode",
          type: {
            kind: "nullable",
            type: {
              kind: "number"
            }
          },
          optional: false
        }, {
          name: "signal",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: false
        }]
      }
    },
    ProcessMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process.js",
        line: 606
      },
      name: "ProcessMessage",
      definition: {
        kind: "union",
        types: [{
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "stdout"
            },
            optional: false
          }, {
            name: "data",
            type: {
              kind: "string"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "stderr"
            },
            optional: false
          }, {
            name: "data",
            type: {
              kind: "string"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "exit"
            },
            optional: false
          }, {
            name: "exitCode",
            type: {
              kind: "nullable",
              type: {
                kind: "number"
              }
            },
            optional: false
          }, {
            name: "signal",
            type: {
              kind: "nullable",
              type: {
                kind: "string"
              }
            },
            optional: false
          }]
        }],
        discriminantField: "kind"
      }
    },
    VsRawAdapterSpawnerService: {
      kind: "interface",
      name: "VsRawAdapterSpawnerService",
      location: {
        type: "source",
        fileName: "VSCodeDebuggerAdapterService.js",
        line: 89
      },
      constructorArgs: [],
      staticMethods: {},
      instanceMethods: {
        spawnAdapter: {
          location: {
            type: "source",
            fileName: "VSCodeDebuggerAdapterService.js",
            line: 90
          },
          kind: "function",
          argumentTypes: [{
            name: "adapter",
            type: {
              kind: "named",
              name: "VSAdapterExecutableInfo"
            }
          }],
          returnType: {
            kind: "observable",
            type: {
              kind: "named",
              name: "ProcessMessage"
            }
          }
        },
        write: {
          location: {
            type: "source",
            fileName: "VSCodeDebuggerAdapterService.js",
            line: 96
          },
          kind: "function",
          argumentTypes: [{
            name: "input",
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
            fileName: "VSCodeDebuggerAdapterService.js",
            line: 100
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