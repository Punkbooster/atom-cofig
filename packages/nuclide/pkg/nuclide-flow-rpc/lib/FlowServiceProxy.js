"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.dispose = function () {
    return _client.marshalArguments(Array.from(arguments), []).then(args => {
      return _client.callRemoteFunction("FlowService/dispose", "void", args);
    });
  };

  remoteModule.FileNotifier = class {
    onFileEvent(arg0) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "event",
        type: {
          kind: "named",
          name: "FileEvent"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 50
          },
          name: "FileNotifier"
        }).then(id => {
          return _client.callRemoteMethod(id, "onFileEvent", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      });
    }

    onDirectoriesChanged(arg0) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "openDirectories",
        type: {
          kind: "set",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 50
          },
          name: "FileNotifier"
        }).then(id => {
          return _client.callRemoteMethod(id, "onDirectoriesChanged", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      });
    }

    dispose() {
      return _client.disposeRemoteObject(this);
    }

  };
  remoteModule.FlowLanguageServiceType = class {
    getDiagnostics(arg0) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "fileVersion",
        type: {
          kind: "named",
          name: "FileVersion"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 178
          },
          name: "FlowLanguageServiceType"
        }).then(id => {
          return _client.callRemoteMethod(id, "getDiagnostics", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          kind: "nullable",
          type: {
            kind: "named",
            name: "DiagnosticProviderUpdate"
          }
        });
      });
    }

    observeDiagnostics() {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 178
          },
          name: "FlowLanguageServiceType"
        }).then(id => {
          return _client.callRemoteMethod(id, "observeDiagnostics", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "array",
          type: {
            kind: "named",
            name: "FileDiagnosticMessages"
          }
        });
      }).publish();
    }

    getAutocompleteSuggestions(arg0, arg1, arg2) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "fileVersion",
        type: {
          kind: "named",
          name: "FileVersion"
        }
      }, {
        name: "position",
        type: {
          kind: "named",
          name: "atom$Point"
        }
      }, {
        name: "request",
        type: {
          kind: "named",
          name: "AutocompleteRequest"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 178
          },
          name: "FlowLanguageServiceType"
        }).then(id => {
          return _client.callRemoteMethod(id, "getAutocompleteSuggestions", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          kind: "nullable",
          type: {
            kind: "named",
            name: "AutocompleteResult"
          }
        });
      });
    }

    getDefinition(arg0, arg1) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "fileVersion",
        type: {
          kind: "named",
          name: "FileVersion"
        }
      }, {
        name: "position",
        type: {
          kind: "named",
          name: "atom$Point"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 178
          },
          name: "FlowLanguageServiceType"
        }).then(id => {
          return _client.callRemoteMethod(id, "getDefinition", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          kind: "nullable",
          type: {
            kind: "named",
            name: "DefinitionQueryResult"
          }
        });
      });
    }

    findReferences(arg0, arg1) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "fileVersion",
        type: {
          kind: "named",
          name: "FileVersion"
        }
      }, {
        name: "position",
        type: {
          kind: "named",
          name: "atom$Point"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 178
          },
          name: "FlowLanguageServiceType"
        }).then(id => {
          return _client.callRemoteMethod(id, "findReferences", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          kind: "nullable",
          type: {
            kind: "named",
            name: "FindReferencesReturn"
          }
        });
      });
    }

    getCoverage(arg0) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "filePath",
        type: {
          kind: "named",
          name: "NuclideUri"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 178
          },
          name: "FlowLanguageServiceType"
        }).then(id => {
          return _client.callRemoteMethod(id, "getCoverage", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          kind: "nullable",
          type: {
            kind: "named",
            name: "CoverageResult"
          }
        });
      });
    }

    getOutline(arg0) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "fileVersion",
        type: {
          kind: "named",
          name: "FileVersion"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 178
          },
          name: "FlowLanguageServiceType"
        }).then(id => {
          return _client.callRemoteMethod(id, "getOutline", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          kind: "nullable",
          type: {
            kind: "named",
            name: "Outline"
          }
        });
      });
    }

    typeHint(arg0, arg1) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "fileVersion",
        type: {
          kind: "named",
          name: "FileVersion"
        }
      }, {
        name: "position",
        type: {
          kind: "named",
          name: "atom$Point"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 178
          },
          name: "FlowLanguageServiceType"
        }).then(id => {
          return _client.callRemoteMethod(id, "typeHint", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          kind: "nullable",
          type: {
            kind: "named",
            name: "TypeHint"
          }
        });
      });
    }

    highlight(arg0, arg1) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "fileVersion",
        type: {
          kind: "named",
          name: "FileVersion"
        }
      }, {
        name: "position",
        type: {
          kind: "named",
          name: "atom$Point"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 178
          },
          name: "FlowLanguageServiceType"
        }).then(id => {
          return _client.callRemoteMethod(id, "highlight", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          kind: "nullable",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "atom$Range"
            }
          }
        });
      });
    }

    formatSource(arg0, arg1, arg2) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "fileVersion",
        type: {
          kind: "named",
          name: "FileVersion"
        }
      }, {
        name: "range",
        type: {
          kind: "named",
          name: "atom$Range"
        }
      }, {
        name: "options",
        type: {
          kind: "named",
          name: "FormatOptions"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 178
          },
          name: "FlowLanguageServiceType"
        }).then(id => {
          return _client.callRemoteMethod(id, "formatSource", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          kind: "nullable",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "TextEdit"
            }
          }
        });
      });
    }

    formatEntireFile(arg0, arg1, arg2) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "fileVersion",
        type: {
          kind: "named",
          name: "FileVersion"
        }
      }, {
        name: "range",
        type: {
          kind: "named",
          name: "atom$Range"
        }
      }, {
        name: "options",
        type: {
          kind: "named",
          name: "FormatOptions"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 178
          },
          name: "FlowLanguageServiceType"
        }).then(id => {
          return _client.callRemoteMethod(id, "formatEntireFile", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          kind: "nullable",
          type: {
            kind: "object",
            fields: [{
              name: "newCursor",
              type: {
                kind: "number"
              },
              optional: true
            }, {
              name: "formatted",
              type: {
                kind: "string"
              },
              optional: false
            }]
          }
        });
      });
    }

    formatAtPosition(arg0, arg1, arg2, arg3) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "fileVersion",
        type: {
          kind: "named",
          name: "FileVersion"
        }
      }, {
        name: "position",
        type: {
          kind: "named",
          name: "atom$Point"
        }
      }, {
        name: "triggerCharacter",
        type: {
          kind: "string"
        }
      }, {
        name: "options",
        type: {
          kind: "named",
          name: "FormatOptions"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 178
          },
          name: "FlowLanguageServiceType"
        }).then(id => {
          return _client.callRemoteMethod(id, "formatAtPosition", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          kind: "nullable",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "TextEdit"
            }
          }
        });
      });
    }

    getEvaluationExpression(arg0, arg1) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "fileVersion",
        type: {
          kind: "named",
          name: "FileVersion"
        }
      }, {
        name: "position",
        type: {
          kind: "named",
          name: "atom$Point"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 178
          },
          name: "FlowLanguageServiceType"
        }).then(id => {
          return _client.callRemoteMethod(id, "getEvaluationExpression", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          kind: "nullable",
          type: {
            kind: "named",
            name: "NuclideEvaluationExpression"
          }
        });
      });
    }

    supportsSymbolSearch(arg0) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "directories",
        type: {
          kind: "array",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 178
          },
          name: "FlowLanguageServiceType"
        }).then(id => {
          return _client.callRemoteMethod(id, "supportsSymbolSearch", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          kind: "boolean"
        });
      });
    }

    symbolSearch(arg0, arg1) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "query",
        type: {
          kind: "string"
        }
      }, {
        name: "directories",
        type: {
          kind: "array",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 178
          },
          name: "FlowLanguageServiceType"
        }).then(id => {
          return _client.callRemoteMethod(id, "symbolSearch", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          kind: "nullable",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "SymbolResult"
            }
          }
        });
      });
    }

    getProjectRoot(arg0) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "fileUri",
        type: {
          kind: "named",
          name: "NuclideUri"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 178
          },
          name: "FlowLanguageServiceType"
        }).then(id => {
          return _client.callRemoteMethod(id, "getProjectRoot", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          kind: "nullable",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        });
      });
    }

    isFileInProject(arg0) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "fileUri",
        type: {
          kind: "named",
          name: "NuclideUri"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 178
          },
          name: "FlowLanguageServiceType"
        }).then(id => {
          return _client.callRemoteMethod(id, "isFileInProject", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          kind: "boolean"
        });
      });
    }

    getServerStatusUpdates() {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 178
          },
          name: "FlowLanguageServiceType"
        }).then(id => {
          return _client.callRemoteMethod(id, "getServerStatusUpdates", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "named",
          name: "ServerStatusUpdate"
        });
      }).publish();
    }

    allowServerRestart() {
      return _client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 178
          },
          name: "FlowLanguageServiceType"
        }).then(id => {
          return _client.callRemoteMethod(id, "allowServerRestart", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      });
    }

    dispose() {
      return _client.disposeRemoteObject(this);
    }

  };
  remoteModule.HostServices = class {
    consoleNotification(arg0, arg1, arg2) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "source",
        type: {
          kind: "string"
        }
      }, {
        name: "level",
        type: {
          kind: "named",
          name: "ShowNotificationLevel"
        }
      }, {
        name: "text",
        type: {
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 17
          },
          name: "HostServices"
        }).then(id => {
          return _client.callRemoteMethod(id, "consoleNotification", "void", args);
        });
      });
    }

    dialogNotification(arg0, arg1) {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
        name: "level",
        type: {
          kind: "named",
          name: "ShowNotificationLevel"
        }
      }, {
        name: "text",
        type: {
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 17
          },
          name: "HostServices"
        }).then(id => {
          return _client.callRemoteMethod(id, "dialogNotification", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      }).publish();
    }

    dialogRequest(arg0, arg1, arg2, arg3) {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
        name: "level",
        type: {
          kind: "named",
          name: "ShowNotificationLevel"
        }
      }, {
        name: "text",
        type: {
          kind: "string"
        }
      }, {
        name: "buttonLabels",
        type: {
          kind: "array",
          type: {
            kind: "string"
          }
        }
      }, {
        name: "closeLabel",
        type: {
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 17
          },
          name: "HostServices"
        }).then(id => {
          return _client.callRemoteMethod(id, "dialogRequest", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "string"
        });
      }).publish();
    }

    childRegister(arg0) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "child",
        type: {
          kind: "named",
          name: "HostServices"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 17
          },
          name: "HostServices"
        }).then(id => {
          return _client.callRemoteMethod(id, "childRegister", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          kind: "named",
          name: "HostServices"
        });
      });
    }

    dispose() {
      return _client.disposeRemoteObject(this);
    }

  };

  remoteModule.initialize = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileNotifier",
      type: {
        kind: "named",
        name: "FileNotifier"
      }
    }, {
      name: "host",
      type: {
        kind: "named",
        name: "HostServices"
      }
    }, {
      name: "config",
      type: {
        kind: "named",
        name: "FlowSettings"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FlowService/initialize", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "FlowLanguageServiceType"
      });
    });
  };

  remoteModule.flowGetAst = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "file",
      type: {
        kind: "nullable",
        type: {
          kind: "named",
          name: "NuclideUri"
        }
      }
    }, {
      name: "currentContents",
      type: {
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FlowService/flowGetAst", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "any"
        }
      });
    });
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
    Loc: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "FlowService.js",
        line: 49
      },
      name: "Loc",
      definition: {
        kind: "object",
        fields: [{
          name: "file",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          name: "point",
          type: {
            kind: "named",
            name: "atom$Point"
          },
          optional: false
        }]
      }
    },
    ServerStatusType: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "FlowService.js",
        line: 56
      },
      name: "ServerStatusType",
      definition: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "failed"
        }, {
          kind: "string-literal",
          value: "unknown"
        }, {
          kind: "string-literal",
          value: "not running"
        }, {
          kind: "string-literal",
          value: "not installed"
        }, {
          kind: "string-literal",
          value: "busy"
        }, {
          kind: "string-literal",
          value: "init"
        }, {
          kind: "string-literal",
          value: "ready"
        }]
      }
    },
    ServerStatusUpdate: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "FlowService.js",
        line: 65
      },
      name: "ServerStatusUpdate",
      definition: {
        kind: "object",
        fields: [{
          name: "pathToRoot",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          name: "status",
          type: {
            kind: "named",
            name: "ServerStatusType"
          },
          optional: false
        }]
      }
    },
    FlowSettings: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "FlowService.js",
        line: 70
      },
      name: "FlowSettings",
      definition: {
        kind: "object",
        fields: [{
          name: "functionSnippetShouldIncludeArguments",
          type: {
            kind: "boolean"
          },
          optional: false
        }, {
          name: "stopFlowOnExit",
          type: {
            kind: "boolean"
          },
          optional: false
        }, {
          name: "lazyServer",
          type: {
            kind: "boolean"
          },
          optional: false
        }]
      }
    },
    FlowPoint: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "flowOutputTypes.js",
        line: 50
      },
      name: "FlowPoint",
      definition: {
        kind: "object",
        fields: [{
          name: "column",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "line",
          type: {
            kind: "number"
          },
          optional: false
        }]
      }
    },
    FlowLocNoSource: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "flowOutputTypes.js",
        line: 45
      },
      name: "FlowLocNoSource",
      definition: {
        kind: "object",
        fields: [{
          name: "start",
          type: {
            kind: "named",
            name: "FlowPoint"
          },
          optional: false
        }, {
          name: "end",
          type: {
            kind: "named",
            name: "FlowPoint"
          },
          optional: false
        }]
      }
    },
    dispose: {
      kind: "function",
      name: "dispose",
      location: {
        type: "source",
        fileName: "FlowService.js",
        line: 90
      },
      type: {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 90
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          kind: "void"
        }
      }
    },
    DiagnosticMessageType: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 64
      },
      name: "DiagnosticMessageType",
      definition: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "Error"
        }, {
          kind: "string-literal",
          value: "Warning"
        }, {
          kind: "string-literal",
          value: "Info"
        }]
      }
    },
    DiagnosticTrace: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 66
      },
      name: "DiagnosticTrace",
      definition: {
        kind: "object",
        fields: [{
          name: "type",
          type: {
            kind: "string-literal",
            value: "Trace"
          },
          optional: false
        }, {
          name: "text",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "html",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "filePath",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: true
        }, {
          name: "range",
          type: {
            kind: "named",
            name: "atom$Range"
          },
          optional: true
        }]
      }
    },
    TextEdit: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "text-edit.js",
        line: 19
      },
      name: "TextEdit",
      definition: {
        kind: "object",
        fields: [{
          name: "oldRange",
          type: {
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }, {
          name: "newText",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "oldText",
          type: {
            kind: "string"
          },
          optional: true
        }]
      }
    },
    DiagnosticFix: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 74
      },
      name: "DiagnosticFix",
      definition: {
        kind: "intersection",
        types: [{
          kind: "named",
          name: "TextEdit"
        }, {
          kind: "object",
          fields: [{
            name: "speculative",
            type: {
              kind: "boolean"
            },
            optional: true
          }, {
            name: "title",
            type: {
              kind: "string"
            },
            optional: true
          }]
        }],
        flattened: {
          kind: "object",
          fields: [{
            name: "oldRange",
            type: {
              kind: "named",
              name: "atom$Range"
            },
            optional: false
          }, {
            name: "newText",
            type: {
              kind: "string"
            },
            optional: false
          }, {
            name: "oldText",
            type: {
              kind: "string"
            },
            optional: true
          }, {
            name: "speculative",
            type: {
              kind: "boolean"
            },
            optional: true
          }, {
            name: "title",
            type: {
              kind: "string"
            },
            optional: true
          }]
        }
      }
    },
    FileDiagnosticMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 83
      },
      name: "FileDiagnosticMessage",
      definition: {
        kind: "object",
        fields: [{
          name: "scope",
          type: {
            kind: "string-literal",
            value: "file"
          },
          optional: false
        }, {
          name: "providerName",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "type",
          type: {
            kind: "named",
            name: "DiagnosticMessageType"
          },
          optional: false
        }, {
          name: "filePath",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          name: "text",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "html",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "range",
          type: {
            kind: "named",
            name: "atom$Range"
          },
          optional: true
        }, {
          name: "trace",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "DiagnosticTrace"
            }
          },
          optional: true
        }, {
          name: "fix",
          type: {
            kind: "named",
            name: "DiagnosticFix"
          },
          optional: true
        }, {
          name: "stale",
          type: {
            kind: "boolean"
          },
          optional: true
        }]
      }
    },
    ProjectDiagnosticMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 98
      },
      name: "ProjectDiagnosticMessage",
      definition: {
        kind: "object",
        fields: [{
          name: "scope",
          type: {
            kind: "string-literal",
            value: "project"
          },
          optional: false
        }, {
          name: "providerName",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "type",
          type: {
            kind: "named",
            name: "DiagnosticMessageType"
          },
          optional: false
        }, {
          name: "text",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "html",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "range",
          type: {
            kind: "named",
            name: "atom$Range"
          },
          optional: true
        }, {
          name: "trace",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "DiagnosticTrace"
            }
          },
          optional: true
        }, {
          name: "stale",
          type: {
            kind: "boolean"
          },
          optional: true
        }]
      }
    },
    DiagnosticProviderUpdate: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 59
      },
      name: "DiagnosticProviderUpdate",
      definition: {
        kind: "object",
        fields: [{
          name: "filePathToMessages",
          type: {
            kind: "map",
            keyType: {
              kind: "named",
              name: "NuclideUri"
            },
            valueType: {
              kind: "array",
              type: {
                kind: "named",
                name: "FileDiagnosticMessage"
              }
            }
          },
          optional: true
        }, {
          name: "projectMessages",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "ProjectDiagnosticMessage"
            }
          },
          optional: true
        }]
      }
    },
    FileOpenEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 14
      },
      name: "FileOpenEvent",
      definition: {
        kind: "object",
        fields: [{
          name: "kind",
          type: {
            kind: "string-literal",
            value: "open"
          },
          optional: false
        }, {
          name: "fileVersion",
          type: {
            kind: "named",
            name: "FileVersion"
          },
          optional: false
        }, {
          name: "contents",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    FileCloseEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 27
      },
      name: "FileCloseEvent",
      definition: {
        kind: "object",
        fields: [{
          name: "kind",
          type: {
            kind: "string-literal",
            value: "close"
          },
          optional: false
        }, {
          name: "fileVersion",
          type: {
            kind: "named",
            name: "FileVersion"
          },
          optional: false
        }]
      }
    },
    FileEditEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 32
      },
      name: "FileEditEvent",
      definition: {
        kind: "object",
        fields: [{
          name: "kind",
          type: {
            kind: "string-literal",
            value: "edit"
          },
          optional: false
        }, {
          name: "fileVersion",
          type: {
            kind: "named",
            name: "FileVersion"
          },
          optional: false
        }, {
          name: "oldRange",
          type: {
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }, {
          name: "newRange",
          type: {
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }, {
          name: "oldText",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "newText",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    FileSyncEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 21
      },
      name: "FileSyncEvent",
      definition: {
        kind: "object",
        fields: [{
          name: "kind",
          type: {
            kind: "string-literal",
            value: "sync"
          },
          optional: false
        }, {
          name: "fileVersion",
          type: {
            kind: "named",
            name: "FileVersion"
          },
          optional: false
        }, {
          name: "contents",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    FileEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 42
      },
      name: "FileEvent",
      definition: {
        kind: "union",
        types: [{
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "open"
            },
            optional: false
          }, {
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            },
            optional: false
          }, {
            name: "contents",
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
              value: "close"
            },
            optional: false
          }, {
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "edit"
            },
            optional: false
          }, {
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            },
            optional: false
          }, {
            name: "oldRange",
            type: {
              kind: "named",
              name: "atom$Range"
            },
            optional: false
          }, {
            name: "newRange",
            type: {
              kind: "named",
              name: "atom$Range"
            },
            optional: false
          }, {
            name: "oldText",
            type: {
              kind: "string"
            },
            optional: false
          }, {
            name: "newText",
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
              value: "sync"
            },
            optional: false
          }, {
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            },
            optional: false
          }, {
            name: "contents",
            type: {
              kind: "string"
            },
            optional: false
          }]
        }],
        discriminantField: "kind"
      }
    },
    FileNotifier: {
      kind: "interface",
      name: "FileNotifier",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 50
      },
      constructorArgs: null,
      staticMethods: {},
      instanceMethods: {
        onFileEvent: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 51
          },
          kind: "function",
          argumentTypes: [{
            name: "event",
            type: {
              kind: "named",
              name: "FileEvent"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "void"
            }
          }
        },
        onDirectoriesChanged: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 52
          },
          kind: "function",
          argumentTypes: [{
            name: "openDirectories",
            type: {
              kind: "set",
              type: {
                kind: "named",
                name: "NuclideUri"
              }
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
            fileName: "rpc-types.js",
            line: 53
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "void"
          }
        }
      }
    },
    FileVersion: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 56
      },
      name: "FileVersion",
      definition: {
        kind: "object",
        fields: [{
          name: "notifier",
          type: {
            kind: "named",
            name: "FileNotifier"
          },
          optional: false
        }, {
          name: "filePath",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          name: "version",
          type: {
            kind: "number"
          },
          optional: false
        }]
      }
    },
    FileDiagnosticMessages: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 109
      },
      name: "FileDiagnosticMessages",
      definition: {
        kind: "object",
        fields: [{
          name: "filePath",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          name: "messages",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "FileDiagnosticMessage"
            }
          },
          optional: false
        }]
      }
    },
    Completion: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "LanguageService.js",
        line: 28
      },
      name: "Completion",
      definition: {
        kind: "object",
        fields: [{
          name: "text",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "snippet",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "displayText",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "replacementPrefix",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "type",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: true
        }, {
          name: "leftLabel",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: true
        }, {
          name: "leftLabelHTML",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: true
        }, {
          name: "rightLabel",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: true
        }, {
          name: "rightLabelHTML",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: true
        }, {
          name: "className",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: true
        }, {
          name: "iconHTML",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: true
        }, {
          name: "description",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: true
        }, {
          name: "descriptionMoreURL",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: true
        }, {
          name: "filterText",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "sortText",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "extraData",
          type: {
            kind: "mixed"
          },
          optional: true
        }]
      }
    },
    AutocompleteResult: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "LanguageService.js",
        line: 53
      },
      name: "AutocompleteResult",
      definition: {
        kind: "object",
        fields: [{
          name: "isIncomplete",
          type: {
            kind: "boolean"
          },
          optional: false
        }, {
          name: "items",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "Completion"
            }
          },
          optional: false
        }]
      }
    },
    AutocompleteRequest: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "LanguageService.js",
        line: 75
      },
      name: "AutocompleteRequest",
      definition: {
        kind: "object",
        fields: [{
          name: "activatedManually",
          type: {
            kind: "boolean"
          },
          optional: false
        }, {
          name: "triggerCharacter",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: false
        }, {
          name: "prefix",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    Definition: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 25
      },
      name: "Definition",
      definition: {
        kind: "object",
        fields: [{
          name: "path",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          name: "position",
          type: {
            kind: "named",
            name: "atom$Point"
          },
          optional: false
        }, {
          name: "range",
          type: {
            kind: "named",
            name: "atom$Range"
          },
          optional: true
        }, {
          name: "id",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "name",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "language",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "projectRoot",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: true
        }]
      }
    },
    DefinitionQueryResult: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 38
      },
      name: "DefinitionQueryResult",
      definition: {
        kind: "object",
        fields: [{
          name: "queryRange",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "atom$Range"
            }
          },
          optional: false
        }, {
          name: "definitions",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "Definition"
            }
          },
          optional: false
        }]
      }
    },
    Reference: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 27
      },
      name: "Reference",
      definition: {
        kind: "object",
        fields: [{
          name: "uri",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          name: "name",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: false
        }, {
          name: "range",
          type: {
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }]
      }
    },
    FindReferencesData: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 33
      },
      name: "FindReferencesData",
      definition: {
        kind: "object",
        fields: [{
          name: "type",
          type: {
            kind: "string-literal",
            value: "data"
          },
          optional: false
        }, {
          name: "baseUri",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          name: "referencedSymbolName",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "references",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "Reference"
            }
          },
          optional: false
        }]
      }
    },
    FindReferencesError: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 40
      },
      name: "FindReferencesError",
      definition: {
        kind: "object",
        fields: [{
          name: "type",
          type: {
            kind: "string-literal",
            value: "error"
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
    FindReferencesReturn: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 45
      },
      name: "FindReferencesReturn",
      definition: {
        kind: "union",
        types: [{
          kind: "object",
          fields: [{
            name: "type",
            type: {
              kind: "string-literal",
              value: "data"
            },
            optional: false
          }, {
            name: "baseUri",
            type: {
              kind: "named",
              name: "NuclideUri"
            },
            optional: false
          }, {
            name: "referencedSymbolName",
            type: {
              kind: "string"
            },
            optional: false
          }, {
            name: "references",
            type: {
              kind: "array",
              type: {
                kind: "named",
                name: "Reference"
              }
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "type",
            type: {
              kind: "string-literal",
              value: "error"
            },
            optional: false
          }, {
            name: "message",
            type: {
              kind: "string"
            },
            optional: false
          }]
        }],
        discriminantField: "type"
      }
    },
    UncoveredRegion: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 12
      },
      name: "UncoveredRegion",
      definition: {
        kind: "object",
        fields: [{
          name: "range",
          type: {
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }, {
          name: "message",
          type: {
            kind: "string"
          },
          optional: true
        }]
      }
    },
    CoverageResult: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 17
      },
      name: "CoverageResult",
      definition: {
        kind: "object",
        fields: [{
          name: "percentage",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "uncoveredRegions",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "UncoveredRegion"
            }
          },
          optional: false
        }]
      }
    },
    OutlineTreeKind: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 46
      },
      name: "OutlineTreeKind",
      definition: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "file"
        }, {
          kind: "string-literal",
          value: "module"
        }, {
          kind: "string-literal",
          value: "namespace"
        }, {
          kind: "string-literal",
          value: "package"
        }, {
          kind: "string-literal",
          value: "class"
        }, {
          kind: "string-literal",
          value: "method"
        }, {
          kind: "string-literal",
          value: "property"
        }, {
          kind: "string-literal",
          value: "field"
        }, {
          kind: "string-literal",
          value: "constructor"
        }, {
          kind: "string-literal",
          value: "enum"
        }, {
          kind: "string-literal",
          value: "interface"
        }, {
          kind: "string-literal",
          value: "function"
        }, {
          kind: "string-literal",
          value: "variable"
        }, {
          kind: "string-literal",
          value: "constant"
        }, {
          kind: "string-literal",
          value: "string"
        }, {
          kind: "string-literal",
          value: "number"
        }, {
          kind: "string-literal",
          value: "boolean"
        }, {
          kind: "string-literal",
          value: "array"
        }]
      }
    },
    TokenKind: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "tokenized-text.js",
        line: 13
      },
      name: "TokenKind",
      definition: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "keyword"
        }, {
          kind: "string-literal",
          value: "class-name"
        }, {
          kind: "string-literal",
          value: "constructor"
        }, {
          kind: "string-literal",
          value: "method"
        }, {
          kind: "string-literal",
          value: "param"
        }, {
          kind: "string-literal",
          value: "string"
        }, {
          kind: "string-literal",
          value: "whitespace"
        }, {
          kind: "string-literal",
          value: "plain"
        }, {
          kind: "string-literal",
          value: "type"
        }]
      }
    },
    TextToken: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "tokenized-text.js",
        line: 24
      },
      name: "TextToken",
      definition: {
        kind: "object",
        fields: [{
          name: "kind",
          type: {
            kind: "named",
            name: "TokenKind"
          },
          optional: false
        }, {
          name: "value",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    TokenizedText: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "tokenized-text.js",
        line: 29
      },
      name: "TokenizedText",
      definition: {
        kind: "array",
        type: {
          kind: "named",
          name: "TextToken"
        }
      }
    },
    OutlineTree: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 27
      },
      name: "OutlineTree",
      definition: {
        kind: "object",
        fields: [{
          name: "icon",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "kind",
          type: {
            kind: "named",
            name: "OutlineTreeKind"
          },
          optional: true
        }, {
          name: "plainText",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "tokenizedText",
          type: {
            kind: "named",
            name: "TokenizedText"
          },
          optional: true
        }, {
          name: "representativeName",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "startPosition",
          type: {
            kind: "named",
            name: "atom$Point"
          },
          optional: false
        }, {
          name: "endPosition",
          type: {
            kind: "named",
            name: "atom$Point"
          },
          optional: true
        }, {
          name: "children",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "OutlineTree"
            }
          },
          optional: false
        }]
      }
    },
    Outline: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 41
      },
      name: "Outline",
      definition: {
        kind: "object",
        fields: [{
          name: "outlineTrees",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "OutlineTree"
            }
          },
          optional: false
        }]
      }
    },
    TypeHint: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 12
      },
      name: "TypeHint",
      definition: {
        kind: "object",
        fields: [{
          name: "hint",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "range",
          type: {
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }]
      }
    },
    FormatOptions: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "LanguageService.js",
        line: 68
      },
      name: "FormatOptions",
      definition: {
        kind: "object",
        fields: [{
          name: "tabSize",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "insertSpaces",
          type: {
            kind: "boolean"
          },
          optional: false
        }]
      }
    },
    NuclideEvaluationExpression: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 12
      },
      name: "NuclideEvaluationExpression",
      definition: {
        kind: "object",
        fields: [{
          name: "range",
          type: {
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }, {
          name: "expression",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    SymbolResult: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "LanguageService.js",
        line: 58
      },
      name: "SymbolResult",
      definition: {
        kind: "object",
        fields: [{
          name: "path",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          name: "line",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "column",
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
          name: "containerName",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: false
        }, {
          name: "icon",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: false
        }, {
          name: "hoverText",
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
    FlowLanguageServiceType: {
      kind: "interface",
      name: "FlowLanguageServiceType",
      location: {
        type: "source",
        fileName: "FlowService.js",
        line: 178
      },
      constructorArgs: null,
      staticMethods: {},
      instanceMethods: {
        getDiagnostics: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 179
          },
          kind: "function",
          argumentTypes: [{
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "nullable",
              type: {
                kind: "named",
                name: "DiagnosticProviderUpdate"
              }
            }
          }
        },
        observeDiagnostics: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 181
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "observable",
            type: {
              kind: "array",
              type: {
                kind: "named",
                name: "FileDiagnosticMessages"
              }
            }
          }
        },
        getAutocompleteSuggestions: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 183
          },
          kind: "function",
          argumentTypes: [{
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            }
          }, {
            name: "position",
            type: {
              kind: "named",
              name: "atom$Point"
            }
          }, {
            name: "request",
            type: {
              kind: "named",
              name: "AutocompleteRequest"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "nullable",
              type: {
                kind: "named",
                name: "AutocompleteResult"
              }
            }
          }
        },
        getDefinition: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 189
          },
          kind: "function",
          argumentTypes: [{
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            }
          }, {
            name: "position",
            type: {
              kind: "named",
              name: "atom$Point"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "nullable",
              type: {
                kind: "named",
                name: "DefinitionQueryResult"
              }
            }
          }
        },
        findReferences: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 194
          },
          kind: "function",
          argumentTypes: [{
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            }
          }, {
            name: "position",
            type: {
              kind: "named",
              name: "atom$Point"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "nullable",
              type: {
                kind: "named",
                name: "FindReferencesReturn"
              }
            }
          }
        },
        getCoverage: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 199
          },
          kind: "function",
          argumentTypes: [{
            name: "filePath",
            type: {
              kind: "named",
              name: "NuclideUri"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "nullable",
              type: {
                kind: "named",
                name: "CoverageResult"
              }
            }
          }
        },
        getOutline: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 201
          },
          kind: "function",
          argumentTypes: [{
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "nullable",
              type: {
                kind: "named",
                name: "Outline"
              }
            }
          }
        },
        typeHint: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 203
          },
          kind: "function",
          argumentTypes: [{
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            }
          }, {
            name: "position",
            type: {
              kind: "named",
              name: "atom$Point"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "nullable",
              type: {
                kind: "named",
                name: "TypeHint"
              }
            }
          }
        },
        highlight: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 205
          },
          kind: "function",
          argumentTypes: [{
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            }
          }, {
            name: "position",
            type: {
              kind: "named",
              name: "atom$Point"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "nullable",
              type: {
                kind: "array",
                type: {
                  kind: "named",
                  name: "atom$Range"
                }
              }
            }
          }
        },
        formatSource: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 210
          },
          kind: "function",
          argumentTypes: [{
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            }
          }, {
            name: "range",
            type: {
              kind: "named",
              name: "atom$Range"
            }
          }, {
            name: "options",
            type: {
              kind: "named",
              name: "FormatOptions"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "nullable",
              type: {
                kind: "array",
                type: {
                  kind: "named",
                  name: "TextEdit"
                }
              }
            }
          }
        },
        formatEntireFile: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 216
          },
          kind: "function",
          argumentTypes: [{
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            }
          }, {
            name: "range",
            type: {
              kind: "named",
              name: "atom$Range"
            }
          }, {
            name: "options",
            type: {
              kind: "named",
              name: "FormatOptions"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "nullable",
              type: {
                kind: "object",
                fields: [{
                  name: "newCursor",
                  type: {
                    kind: "number"
                  },
                  optional: true
                }, {
                  name: "formatted",
                  type: {
                    kind: "string"
                  },
                  optional: false
                }]
              }
            }
          }
        },
        formatAtPosition: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 225
          },
          kind: "function",
          argumentTypes: [{
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            }
          }, {
            name: "position",
            type: {
              kind: "named",
              name: "atom$Point"
            }
          }, {
            name: "triggerCharacter",
            type: {
              kind: "string"
            }
          }, {
            name: "options",
            type: {
              kind: "named",
              name: "FormatOptions"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "nullable",
              type: {
                kind: "array",
                type: {
                  kind: "named",
                  name: "TextEdit"
                }
              }
            }
          }
        },
        getEvaluationExpression: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 232
          },
          kind: "function",
          argumentTypes: [{
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            }
          }, {
            name: "position",
            type: {
              kind: "named",
              name: "atom$Point"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "nullable",
              type: {
                kind: "named",
                name: "NuclideEvaluationExpression"
              }
            }
          }
        },
        supportsSymbolSearch: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 237
          },
          kind: "function",
          argumentTypes: [{
            name: "directories",
            type: {
              kind: "array",
              type: {
                kind: "named",
                name: "NuclideUri"
              }
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "boolean"
            }
          }
        },
        symbolSearch: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 239
          },
          kind: "function",
          argumentTypes: [{
            name: "query",
            type: {
              kind: "string"
            }
          }, {
            name: "directories",
            type: {
              kind: "array",
              type: {
                kind: "named",
                name: "NuclideUri"
              }
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "nullable",
              type: {
                kind: "array",
                type: {
                  kind: "named",
                  name: "SymbolResult"
                }
              }
            }
          }
        },
        getProjectRoot: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 244
          },
          kind: "function",
          argumentTypes: [{
            name: "fileUri",
            type: {
              kind: "named",
              name: "NuclideUri"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "nullable",
              type: {
                kind: "named",
                name: "NuclideUri"
              }
            }
          }
        },
        isFileInProject: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 246
          },
          kind: "function",
          argumentTypes: [{
            name: "fileUri",
            type: {
              kind: "named",
              name: "NuclideUri"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "boolean"
            }
          }
        },
        getServerStatusUpdates: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 248
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "observable",
            type: {
              kind: "named",
              name: "ServerStatusUpdate"
            }
          }
        },
        allowServerRestart: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 250
          },
          kind: "function",
          argumentTypes: [],
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
            fileName: "FlowService.js",
            line: 252
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "void"
          }
        }
      }
    },
    ShowNotificationLevel: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 14
      },
      name: "ShowNotificationLevel",
      definition: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "info"
        }, {
          kind: "string-literal",
          value: "log"
        }, {
          kind: "string-literal",
          value: "warning"
        }, {
          kind: "string-literal",
          value: "error"
        }]
      }
    },
    HostServices: {
      kind: "interface",
      name: "HostServices",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 17
      },
      constructorArgs: null,
      staticMethods: {},
      instanceMethods: {
        consoleNotification: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 18
          },
          kind: "function",
          argumentTypes: [{
            name: "source",
            type: {
              kind: "string"
            }
          }, {
            name: "level",
            type: {
              kind: "named",
              name: "ShowNotificationLevel"
            }
          }, {
            name: "text",
            type: {
              kind: "string"
            }
          }],
          returnType: {
            kind: "void"
          }
        },
        dialogNotification: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 24
          },
          kind: "function",
          argumentTypes: [{
            name: "level",
            type: {
              kind: "named",
              name: "ShowNotificationLevel"
            }
          }, {
            name: "text",
            type: {
              kind: "string"
            }
          }],
          returnType: {
            kind: "observable",
            type: {
              kind: "void"
            }
          }
        },
        dialogRequest: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 29
          },
          kind: "function",
          argumentTypes: [{
            name: "level",
            type: {
              kind: "named",
              name: "ShowNotificationLevel"
            }
          }, {
            name: "text",
            type: {
              kind: "string"
            }
          }, {
            name: "buttonLabels",
            type: {
              kind: "array",
              type: {
                kind: "string"
              }
            }
          }, {
            name: "closeLabel",
            type: {
              kind: "string"
            }
          }],
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
            fileName: "rpc-types.js",
            line: 36
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "void"
          }
        },
        childRegister: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 40
          },
          kind: "function",
          argumentTypes: [{
            name: "child",
            type: {
              kind: "named",
              name: "HostServices"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "named",
              name: "HostServices"
            }
          }
        }
      }
    },
    initialize: {
      kind: "function",
      name: "initialize",
      location: {
        type: "source",
        fileName: "FlowService.js",
        line: 97
      },
      type: {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 97
        },
        kind: "function",
        argumentTypes: [{
          name: "fileNotifier",
          type: {
            kind: "named",
            name: "FileNotifier"
          }
        }, {
          name: "host",
          type: {
            kind: "named",
            name: "HostServices"
          }
        }, {
          name: "config",
          type: {
            kind: "named",
            name: "FlowSettings"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "named",
            name: "FlowLanguageServiceType"
          }
        }
      }
    },
    flowGetAst: {
      kind: "function",
      name: "flowGetAst",
      location: {
        type: "source",
        fileName: "FlowService.js",
        line: 255
      },
      type: {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 255
        },
        kind: "function",
        argumentTypes: [{
          name: "file",
          type: {
            kind: "nullable",
            type: {
              kind: "named",
              name: "NuclideUri"
            }
          }
        }, {
          name: "currentContents",
          type: {
            kind: "string"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "nullable",
            type: {
              kind: "any"
            }
          }
        }
      }
    }
  }
});