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
exports.datatip = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let datatip = exports.datatip = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (editor, position) {
    if (!(yield (0, (_passesGK || _load_passesGK()).default)(GK_DIAGNOSTICS_DATATIPS, 0))) {
      return null;
    }

    if (!fileDiagnostics) {
      throw new Error('Invariant violation: "fileDiagnostics"');
    }

    const messagesForFile = fileDiagnostics.get(editor);
    if (messagesForFile == null) {
      return null;
    }
    const messagesAtPosition = messagesForFile.filter(function (message) {
      return message.range != null && message.range.containsPoint(position);
    });
    if (messagesAtPosition.length === 0) {
      return null;
    }
    const [message] = messagesAtPosition;
    const { range } = message;

    if (!range) {
      throw new Error('Invariant violation: "range"');
    }

    return {
      component: (0, (_DiagnosticsDatatipComponent || _load_DiagnosticsDatatipComponent()).makeDiagnosticsDatatipComponent)(message),
      pinnable: false,
      range
    };
  });

  return function datatip(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

exports.consumeDatatipService = consumeDatatipService;
exports.activate = activate;
exports.consumeDiagnosticUpdates = consumeDiagnosticUpdates;
exports.deactivate = deactivate;

var _atom = require('atom');

var _DiagnosticsDatatipComponent;

function _load_DiagnosticsDatatipComponent() {
  return _DiagnosticsDatatipComponent = require('./DiagnosticsDatatipComponent');
}

var _passesGK;

function _load_passesGK() {
  return _passesGK = _interopRequireDefault(require('../../commons-node/passesGK'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const GK_DIAGNOSTICS_DATATIPS = 'nuclide_diagnostics_datatips';

const DATATIP_PACKAGE_NAME = 'nuclide-diagnostics-datatip';


function getDatatipProvider() {
  return {
    // show this datatip for every type of file
    validForScope: scope => true,
    providerName: DATATIP_PACKAGE_NAME,
    inclusionPriority: 1,
    datatip
  };
}

function consumeDatatipService(service) {
  const datatipProvider = getDatatipProvider();

  if (!disposables) {
    throw new Error('Invariant violation: "disposables"');
  }

  service.addProvider(datatipProvider);
  const disposable = new _atom.Disposable(() => service.removeProvider(datatipProvider));
  disposables.add(disposable);
  return disposable;
}

let disposables = null;
let fileDiagnostics = null;

function activate(state) {
  disposables = new _atom.CompositeDisposable();
  fileDiagnostics = new WeakMap();
}

function consumeDiagnosticUpdates(diagnosticUpdater) {
  if (!disposables) {
    throw new Error('Invariant violation: "disposables"');
  }

  disposables.add(atom.workspace.observeTextEditors(editor => {
    if (!fileDiagnostics) {
      throw new Error('Invariant violation: "fileDiagnostics"');
    }

    const filePath = editor.getPath();
    if (!filePath) {
      return;
    }
    fileDiagnostics.set(editor, []);
    const callback = update => {
      if (!fileDiagnostics) {
        throw new Error('Invariant violation: "fileDiagnostics"');
      }

      fileDiagnostics.set(editor, update.messages);
    };
    const disposable = diagnosticUpdater.onFileMessagesDidUpdate(callback, filePath);

    editor.onDidDestroy(() => {
      disposable.dispose();
      if (fileDiagnostics != null) {
        fileDiagnostics.delete(editor);
      }
    });

    if (!disposables) {
      throw new Error('Invariant violation: "disposables"');
    }

    disposables.add(disposable);
  }));
}

function deactivate() {
  if (disposables != null) {
    disposables.dispose();
    disposables = null;
  }
  fileDiagnostics = null;
}