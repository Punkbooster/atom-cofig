'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SyntacticSelectionManager = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _ProviderRegistry;

function _load_ProviderRegistry() {
  return _ProviderRegistry = _interopRequireDefault(require('nuclide-commons-atom/ProviderRegistry'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _event;

function _load_event() {
  return _event = require('nuclide-commons/event');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-syntactic-selection'); /**
                                                                                           * Copyright (c) 2015-present, Facebook, Inc.
                                                                                           * All rights reserved.
                                                                                           *
                                                                                           * This source code is licensed under the license found in the LICENSE file in
                                                                                           * the root directory of this source tree.
                                                                                           *
                                                                                           * 
                                                                                           * @format
                                                                                           */

class SyntacticSelectionManager {

  constructor() {
    this._providerRegistry = new (_ProviderRegistry || _load_ProviderRegistry()).default();
    this._textEditorMonitors = new Map();
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._registerCommands());
  }

  dispose() {
    this._disposables.dispose();
  }

  addProvider(provider) {
    this._disposables.add(this._providerRegistry.addProvider(provider));

    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      this._providerRegistry.removeProvider(provider);
    });
  }

  _registerCommands() {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.commands.add('atom-text-editor', 'nuclide-syntactic-selection:expand', () => this._expandSelection()), atom.commands.add('atom-text-editor', 'nuclide-syntactic-selection:collapse', () => this._collapseSelection()));
  }

  _expandSelection() {
    const monitor = this._getTextSelectionMonitor();
    if (monitor == null) {
      return;
    }

    monitor.doExpand();
  }

  _collapseSelection() {
    const monitor = this._getTextSelectionMonitor();
    if (monitor == null) {
      return;
    }

    monitor.doCollapse();
  }

  _expandRange(editor) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      try {
        const provider = _this._providerRegistry.getProviderForEditor(editor);
        if (provider == null) {
          return null;
        }

        return yield provider.getExpandedSelectionRange(editor);
      } catch (e) {
        // Don't let error in one expand/collapse affect the others
        logger.warn('Error processing syntactic selection expand in', editor.getPath(), e);
        return null;
      }
    })();
  }

  _collapseRange(editor, selectionAnchor) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      try {
        const provider = _this2._providerRegistry.getProviderForEditor(editor);
        if (provider == null) {
          return null;
        }

        return yield provider.getCollapsedSelectionRange(editor, selectionAnchor);
      } catch (e) {
        // Don't let error in one expand/collapse affect the others
        logger.warn('Error processing syntactic selection collapse in', editor.getPath(), e);
        return null;
      }
    })();
  }

  /**
   * Either retrieves the monitor object for the currently active text editor
   * from the cache, or creates (and caches) the new one
   *
   * The monitor object hides the complexity of maintaining the last selection
   * explicitly made by user and handles the expand/collapse requests
   *
   * The monitor objects are held in the state only as long as an editor's
   * selection is modified by the syntactic selection feature. I.e. should a
   * user change the selection manually, the editor is removed from the cache
   * and any in-flight collapse/expand requests are abandoned (ignored).
   */
  _getTextSelectionMonitor() {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor == null) {
      return null;
    }

    const cachedMonitor = this._textEditorMonitors.get(editor);
    if (cachedMonitor != null) {
      return cachedMonitor;
    }

    // The collapse-expand works with a single selection only, although
    // this could be extended to handle multiple selections as well
    const selectedRanges = editor.getSelectedBufferRanges();
    if (selectedRanges.length > 1) {
      return null;
    }

    // The anchor cursor position.
    // Applying a selection automatically moves the selection to either back
    // of the front of the selected region, so we're storing the original
    // location of the cursor.
    // This information later helps the language service to zoom in (collapse)
    // onto the proper sub-range of current selection when multiple children
    // exist.
    // For example, consider the line below:
    //    foo(arg1, bar('blah'), 100000)
    // If the expand will be iniated when the cursor is on 'blah', this position
    // will be marked as anchor. Let's assume we've expanded the selection
    // to include the entire line, entire call to foo().
    // It means that currently the cursor is at the end, after the ")"
    // When we issue the collapse call, having the anchor stored lets us deduct
    // that the child which is the second argument "bar('bla')" now needs to
    // be selected.
    const selectionAnchor = selectedRanges[0].end;

    // We will modify the selection in the current document, but we also are
    // subscribed to selection changes. We need to differentiate between
    // the changes made by our code from those made by the user.
    // Prior to making a change we set this variable to later on filter out
    // the notification with matching range
    let expectedSelection = selectedRanges[0];

    // Sometimes Atom may reinterpret the range that is provided by the language
    // service. In this case we have one more oportunity to detecting that
    // the selection change is done by us. That is if it is done synchronously
    // it is definitely ours. Unfortunately this relies on an implementation
    // details, and thus is not future-proof. Still, better then terminating
    // the watch too soon
    let changingNow = false;

    // There are multiple events that cover selection change.
    const selectionChangeSignals = _rxjsBundlesRxMinJs.Observable.merge((0, (_event || _load_event()).observableFromSubscribeFunction)(editor.observeSelections.bind(editor)), (0, (_event || _load_event()).observableFromSubscribeFunction)(editor.onDidChangeSelectionRange.bind(editor)));

    // We want to stop listening (managing) an editor instance when it is
    // either closed or if its selection was manually changed by the user
    const stopMonitorSignal = _rxjsBundlesRxMinJs.Observable.merge((0, (_event || _load_event()).observableFromSubscribeFunction)(editor.onDidDestroy.bind(editor)), selectionChangeSignals.filter(() => {
      if (changingNow) {
        return false;
      }

      const currentSelectedRanges = editor.getSelectedBufferRanges();
      if (currentSelectedRanges.length > 1 || expectedSelection != null && !currentSelectedRanges[0].isEqual(expectedSelection)) {
        // Stop monitoring
        return true;
      }

      return false;
    }));

    // Helps take care of racing requests
    const runningRangeRequests = new _rxjsBundlesRxMinJs.Subject();

    const monitor = {
      editor,
      doExpand: () => runningRangeRequests.next(this._expandRange(editor)),
      doCollapse: () => runningRangeRequests.next(this._collapseRange(editor, selectionAnchor))
    };

    this._textEditorMonitors.set(editor, monitor);

    const subscription = runningRangeRequests.switchMap(p => p).takeUntil(stopMonitorSignal).finally(() => {
      // Stop signal received - remove the monitor
      this._textEditorMonitors.delete(editor);
      // And do not leak the subscription object
      this._disposables.remove(subscription);
    }).subscribe(newExpected => {
      expectedSelection = newExpected;
      if (newExpected != null) {
        changingNow = true;
        editor.setSelectedBufferRange(newExpected);
        changingNow = false;
      }
    }, err => {
      logger.error('Unexpected error in sytnactic selection handling', err);
    });
    this._disposables.add(subscription);

    return monitor;
  }
}
exports.SyntacticSelectionManager = SyntacticSelectionManager;