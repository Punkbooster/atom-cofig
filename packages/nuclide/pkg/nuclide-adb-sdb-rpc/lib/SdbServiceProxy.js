"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.registerSdbPath = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "id",
      type: {
        kind: "string"
      }
    }, {
      name: "path",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "priority",
      type: {
        kind: "nullable",
        type: {
          kind: "number"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("SdbService/registerSdbPath", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "void"
      });
    });
  };

  remoteModule.getFullConfig = function () {
    return _client.marshalArguments(Array.from(arguments), []).then(args => {
      return _client.callRemoteFunction("SdbService/getFullConfig", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "DebugBridgeFullConfig"
      });
    });
  };

  remoteModule.registerCustomPath = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        kind: "nullable",
        type: {
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("SdbService/registerCustomPath", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "void"
      });
    });
  };

  remoteModule.getDeviceInfo = function (arg0) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "named",
        name: "DeviceId"
      }
    }])).switchMap(args => {
      return _client.callRemoteFunction("SdbService/getDeviceInfo", "observable", args);
    }).concatMap(value => {
      return _client.unmarshal(value, {
        kind: "map",
        keyType: {
          kind: "string"
        },
        valueType: {
          kind: "string"
        }
      });
    }).publish();
  };

  remoteModule.getDeviceList = function () {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [])).switchMap(args => {
      return _client.callRemoteFunction("SdbService/getDeviceList", "observable", args);
    }).concatMap(value => {
      return _client.unmarshal(value, {
        kind: "array",
        type: {
          kind: "named",
          name: "DeviceDescription"
        }
      });
    }).publish();
  };

  remoteModule.getPidFromPackageName = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "named",
        name: "DeviceId"
      }
    }, {
      name: "packageName",
      type: {
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("SdbService/getPidFromPackageName", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "number"
      });
    });
  };

  remoteModule.getFileContentsAtPath = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "named",
        name: "DeviceId"
      }
    }, {
      name: "path",
      type: {
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("SdbService/getFileContentsAtPath", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "string"
      });
    });
  };

  remoteModule.installPackage = function (arg0, arg1) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "named",
        name: "DeviceId"
      }
    }, {
      name: "packagePath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }])).switchMap(args => {
      return _client.callRemoteFunction("SdbService/installPackage", "observable", args);
    }).concatMap(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "LegacyProcessMessage"
      });
    }).publish();
  };

  remoteModule.launchApp = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "named",
        name: "DeviceId"
      }
    }, {
      name: "identifier",
      type: {
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("SdbService/launchApp", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "string"
      });
    });
  };

  remoteModule.stopProcess = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "named",
        name: "DeviceId"
      }
    }, {
      name: "packageName",
      type: {
        kind: "string"
      }
    }, {
      name: "pid",
      type: {
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("SdbService/stopProcess", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "void"
      });
    });
  };

  remoteModule.uninstallPackage = function (arg0, arg1) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "named",
        name: "DeviceId"
      }
    }, {
      name: "packageName",
      type: {
        kind: "string"
      }
    }])).switchMap(args => {
      return _client.callRemoteFunction("SdbService/uninstallPackage", "observable", args);
    }).concatMap(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "LegacyProcessMessage"
      });
    }).publish();
  };

  remoteModule.getProcesses = function (arg0, arg1) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "named",
        name: "DeviceId"
      }
    }, {
      name: "timeout",
      type: {
        kind: "number"
      }
    }])).switchMap(args => {
      return _client.callRemoteFunction("SdbService/getProcesses", "observable", args);
    }).concatMap(value => {
      return _client.unmarshal(value, {
        kind: "array",
        type: {
          kind: "named",
          name: "Process"
        }
      });
    }).publish();
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
    registerSdbPath: {
      kind: "function",
      name: "registerSdbPath",
      location: {
        type: "source",
        fileName: "SdbService.js",
        line: 29
      },
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 29
        },
        kind: "function",
        argumentTypes: [{
          name: "id",
          type: {
            kind: "string"
          }
        }, {
          name: "path",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "priority",
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
            kind: "void"
          }
        }
      }
    },
    DebugBridgeFullConfig: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 43
      },
      name: "DebugBridgeFullConfig",
      definition: {
        kind: "object",
        fields: [{
          name: "active",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: false
        }, {
          name: "all",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          },
          optional: false
        }, {
          name: "ports",
          type: {
            kind: "array",
            type: {
              kind: "number"
            }
          },
          optional: false
        }]
      }
    },
    getFullConfig: {
      kind: "function",
      name: "getFullConfig",
      location: {
        type: "source",
        fileName: "SdbService.js",
        line: 37
      },
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 37
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          kind: "promise",
          type: {
            kind: "named",
            name: "DebugBridgeFullConfig"
          }
        }
      }
    },
    registerCustomPath: {
      kind: "function",
      name: "registerCustomPath",
      location: {
        type: "source",
        fileName: "SdbService.js",
        line: 41
      },
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 41
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "void"
          }
        }
      }
    },
    DeviceId: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 22
      },
      name: "DeviceId",
      definition: {
        kind: "object",
        fields: [{
          name: "name",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "port",
          type: {
            kind: "number"
          },
          optional: false
        }]
      }
    },
    getDeviceInfo: {
      kind: "function",
      name: "getDeviceInfo",
      location: {
        type: "source",
        fileName: "SdbService.js",
        line: 45
      },
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 45
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            kind: "named",
            name: "DeviceId"
          }
        }],
        returnType: {
          kind: "observable",
          type: {
            kind: "map",
            keyType: {
              kind: "string"
            },
            valueType: {
              kind: "string"
            }
          }
        }
      }
    },
    DeviceDescription: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 24
      },
      name: "DeviceDescription",
      definition: {
        kind: "object",
        fields: [{
          name: "name",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "port",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "architecture",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "apiVersion",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "model",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    getDeviceList: {
      kind: "function",
      name: "getDeviceList",
      location: {
        type: "source",
        fileName: "SdbService.js",
        line: 51
      },
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 51
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          kind: "observable",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "DeviceDescription"
            }
          }
        }
      }
    },
    getPidFromPackageName: {
      kind: "function",
      name: "getPidFromPackageName",
      location: {
        type: "source",
        fileName: "SdbService.js",
        line: 57
      },
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 57
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            kind: "named",
            name: "DeviceId"
          }
        }, {
          name: "packageName",
          type: {
            kind: "string"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "number"
          }
        }
      }
    },
    getFileContentsAtPath: {
      kind: "function",
      name: "getFileContentsAtPath",
      location: {
        type: "source",
        fileName: "SdbService.js",
        line: 64
      },
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 64
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            kind: "named",
            name: "DeviceId"
          }
        }, {
          name: "path",
          type: {
            kind: "string"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "string"
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
    LegacyProcessMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process.js",
        line: 619
      },
      name: "LegacyProcessMessage",
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
        }, {
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "error"
            },
            optional: false
          }, {
            name: "error",
            type: {
              kind: "named",
              name: "Object"
            },
            optional: false
          }]
        }],
        discriminantField: "kind"
      }
    },
    installPackage: {
      kind: "function",
      name: "installPackage",
      location: {
        type: "source",
        fileName: "SdbService.js",
        line: 71
      },
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 71
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            kind: "named",
            name: "DeviceId"
          }
        }, {
          name: "packagePath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "observable",
          type: {
            kind: "named",
            name: "LegacyProcessMessage"
          }
        }
      }
    },
    launchApp: {
      kind: "function",
      name: "launchApp",
      location: {
        type: "source",
        fileName: "SdbService.js",
        line: 79
      },
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 79
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            kind: "named",
            name: "DeviceId"
          }
        }, {
          name: "identifier",
          type: {
            kind: "string"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "string"
          }
        }
      }
    },
    stopProcess: {
      kind: "function",
      name: "stopProcess",
      location: {
        type: "source",
        fileName: "SdbService.js",
        line: 86
      },
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 86
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            kind: "named",
            name: "DeviceId"
          }
        }, {
          name: "packageName",
          type: {
            kind: "string"
          }
        }, {
          name: "pid",
          type: {
            kind: "number"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "void"
          }
        }
      }
    },
    uninstallPackage: {
      kind: "function",
      name: "uninstallPackage",
      location: {
        type: "source",
        fileName: "SdbService.js",
        line: 94
      },
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 94
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            kind: "named",
            name: "DeviceId"
          }
        }, {
          name: "packageName",
          type: {
            kind: "string"
          }
        }],
        returnType: {
          kind: "observable",
          type: {
            kind: "named",
            name: "LegacyProcessMessage"
          }
        }
      }
    },
    Process: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 32
      },
      name: "Process",
      definition: {
        kind: "object",
        fields: [{
          name: "user",
          type: {
            kind: "string"
          },
          optional: false
        }, {
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
          name: "cpuUsage",
          type: {
            kind: "nullable",
            type: {
              kind: "number"
            }
          },
          optional: false
        }, {
          name: "memUsage",
          type: {
            kind: "nullable",
            type: {
              kind: "number"
            }
          },
          optional: false
        }, {
          name: "isJava",
          type: {
            kind: "boolean"
          },
          optional: false
        }]
      }
    },
    getProcesses: {
      kind: "function",
      name: "getProcesses",
      location: {
        type: "source",
        fileName: "SdbService.js",
        line: 102
      },
      type: {
        location: {
          type: "source",
          fileName: "SdbService.js",
          line: 102
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            kind: "named",
            name: "DeviceId"
          }
        }, {
          name: "timeout",
          type: {
            kind: "number"
          }
        }],
        returnType: {
          kind: "observable",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "Process"
            }
          }
        }
      }
    }
  }
});