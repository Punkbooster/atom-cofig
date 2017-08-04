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

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _atom = require('atom');

var _config;

function _load_config() {
  return _config = require('./config');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class CodeFormatManager {

  constructor() {
    const subscriptions = this._subscriptions = new _atom.CompositeDisposable();
    subscriptions.add(atom.commands.add('atom-text-editor', 'nuclide-code-format:format-code',
    // Atom doesn't accept in-command modification of the text editor contents.
    () => process.nextTick(this._formatCodeInActiveTextEditor.bind(this))));
    subscriptions.add(atom.workspace.observeTextEditors(this._addEditor.bind(this)));
    this._codeFormatProviders = [];
    this._pendingFormats = new Map();
  }

  _addEditor(editor) {
    var _this = this;

    if (!this._subscriptions) {
      return;
    }

    this._subscriptions.add(editor.getBuffer().onDidSave((0, _asyncToGenerator.default)(function* () {
      if ((0, (_config || _load_config()).getFormatOnSave)() && !_this._pendingFormats.get(editor)) {
        // Because formatting code is async, we need to resave the file once
        // we're done formatting, but prevent resaving from retriggering the
        // onDidSave callback, which would be an infinite cycle.
        _this._pendingFormats.set(editor, true);
        try {
          const didFormat = yield _this._formatCodeInTextEditor(editor, false);
          if (didFormat) {
            // TextEditor.save is synchronous for local files, but our custom
            // NuclideTextBuffer.saveAs implementation is asynchronous.
            yield editor.save();
          }
        } finally {
          _this._pendingFormats.delete(editor);
        }
      }
    })));

    editor.onDidDestroy(() => {
      this._pendingFormats.delete(editor);
    });
  }

  // Checks whether contents are same in the buffer post-format, throwing if
  // anything has changed.
  _checkContentsAreSame(before, after) {
    if (before !== after) {
      throw new Error('The file contents were changed before formatting was complete.');
    }
  }

  // Formats code in the active editor, returning whether or not the code
  // formatted successfully.
  _formatCodeInActiveTextEditor() {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const editor = atom.workspace.getActiveTextEditor();
      if (!editor) {
        atom.notifications.addError('No active text editor to format its code!');
        return false;
      }

      return yield _this2._formatCodeInTextEditor(editor);
    })();
  }

  // Formats code in the editor specified, returning whether or not the code
  // formatted successfully.
  _formatCodeInTextEditor(editor, displayErrors = true) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { scopeName } = editor.getGrammar();
      const matchingProviders = _this3._getMatchingProvidersForScopeName(scopeName);

      if (!matchingProviders.length) {
        if (displayErrors) {
          atom.notifications.addError('No Code-Format providers registered for scope: ' + scopeName);
        }
        return false;
      }

      const buffer = editor.getBuffer();
      const selectionRange = editor.getSelectedBufferRange();
      const { start: selectionStart, end: selectionEnd } = selectionRange;
      let formatRange = null;
      const selectionRangeEmpty = selectionRange.isEmpty();
      if (selectionRangeEmpty) {
        // If no selection is done, then, the whole file is wanted to be formatted.
        formatRange = buffer.getRange();
      } else {
        // Format selections should start at the begining of the line,
        // and include the last selected line end.
        formatRange = new _atom.Range([selectionStart.row, 0], [selectionEnd.row + 1, 0]);
      }
      const contents = editor.getText();

      try {
        const provider = matchingProviders[0];
        if (provider.formatCode != null && (!selectionRangeEmpty || provider.formatEntireFile == null)) {
          const formatted = yield provider.formatCode(editor, formatRange);
          // Throws if contents have changed since the time of triggering format code.
          _this3._checkContentsAreSame(contents, editor.getText());

          if (selectionRangeEmpty) {
            buffer.setTextViaDiff(formatted);
          } else {
            editor.setTextInBufferRange(formatRange, formatted);
          }
          return true;
        } else if (provider.formatEntireFile != null) {
          const { newCursor, formatted } = yield provider.formatEntireFile(editor, formatRange);
          // Throws if contents have changed since the time of triggering format code.
          _this3._checkContentsAreSame(contents, editor.getText());

          buffer.setTextViaDiff(formatted);

          const newPosition = newCursor != null ? buffer.positionForCharacterIndex(newCursor) : editor.getCursorBufferPosition();

          // We call setCursorBufferPosition even when there is no newCursor,
          // because it unselects the text selection.
          editor.setCursorBufferPosition(newPosition);
          return true;
        } else {
          throw new Error('code-format providers must implement formatCode or formatEntireFile');
        }
      } catch (e) {
        if (displayErrors) {
          atom.notifications.addError('Failed to format code: ' + e.message);
        }
        return false;
      }
    })();
  }

  _getMatchingProvidersForScopeName(scopeName) {
    const matchingProviders = this._codeFormatProviders.filter(provider => {
      const providerGrammars = provider.selector.split(/, ?/);
      return provider.inclusionPriority > 0 && providerGrammars.indexOf(scopeName) !== -1;
    });
    // $FlowIssue sort doesn't take custom comparator.
    return matchingProviders.sort((providerA, providerB) => {
      return providerA.inclusionPriority < providerB.inclusionPriority;
    });
  }

  addProvider(provider) {
    this._codeFormatProviders.push(provider);
  }

  dispose() {
    if (this._subscriptions) {
      this._subscriptions.dispose();
      this._subscriptions = null;
    }
    this._codeFormatProviders = [];
    this._pendingFormats.clear();
  }
}
exports.default = CodeFormatManager;
module.exports = exports['default'];