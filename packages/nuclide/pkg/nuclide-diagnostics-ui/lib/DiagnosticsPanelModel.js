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
exports.DiagnosticsPanelModel = exports.WORKSPACE_VIEW_URI = undefined;

var _paneUtils;

function _load_paneUtils() {
  return _paneUtils = require('./paneUtils');
}

var _reactForAtom = require('react-for-atom');

var _DiagnosticsPanel;

function _load_DiagnosticsPanel() {
  return _DiagnosticsPanel = _interopRequireDefault(require('./DiagnosticsPanel'));
}

var _renderReactRoot;

function _load_renderReactRoot() {
  return _renderReactRoot = require('../../commons-atom/renderReactRoot');
}

var _event;

function _load_event() {
  return _event = require('../../commons-node/event');
}

var _observable;

function _load_observable() {
  return _observable = require('../../commons-node/observable');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _bindObservableAsProps;

function _load_bindObservableAsProps() {
  return _bindObservableAsProps = require('../../nuclide-ui/bindObservableAsProps');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const WORKSPACE_VIEW_URI = exports.WORKSPACE_VIEW_URI = 'atom://nuclide/diagnostics';

class DiagnosticsPanelModel {

  constructor(diagnostics, initialfilterByActiveTextEditor, showTraces, disableLinter, onFilterByActiveTextEditorChange, warnAboutLinterStream) {
    this._visibility = new _rxjsBundlesRxMinJs.BehaviorSubject(true);

    this._visibilitySubscription = this._visibility.debounceTime(1000).distinctUntilChanged().filter(Boolean).subscribe(() => {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diagnostics-show-table');
    });

    // A stream that contains the props, but is "muted" when the panel's not visible.
    this._props = (0, (_observable || _load_observable()).toggle)(getPropsStream(diagnostics, warnAboutLinterStream, showTraces, initialfilterByActiveTextEditor, disableLinter, onFilterByActiveTextEditorChange).publishReplay(1).refCount(), this._visibility.distinctUntilChanged());
  }

  destroy() {
    this._visibilitySubscription.unsubscribe();
  }

  getTitle() {
    return 'Diagnostics';
  }

  getIconName() {
    return 'law';
  }

  getURI() {
    return WORKSPACE_VIEW_URI;
  }

  getDefaultLocation() {
    return 'bottom-panel';
  }

  serialize() {
    return {
      deserializer: 'nuclide.DiagnosticsPanelModel'
    };
  }

  didChangeVisibility(visible) {
    this._visibility.next(visible);
  }

  getElement() {
    if (this._element == null) {
      const Component = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(this._props, (_DiagnosticsPanel || _load_DiagnosticsPanel()).default);
      const element = (0, (_renderReactRoot || _load_renderReactRoot()).renderReactRoot)(_reactForAtom.React.createElement(Component, null));
      element.classList.add('nuclide-diagnostics-ui');
      this._element = element;
    }
    return this._element;
  }
}

exports.DiagnosticsPanelModel = DiagnosticsPanelModel;
function getPropsStream(diagnosticsStream, warnAboutLinterStream, showTraces, initialfilterByActiveTextEditor, disableLinter, onFilterByActiveTextEditorChange) {
  const activeTextEditorPaths = (0, (_event || _load_event()).observableFromSubscribeFunction)(atom.workspace.observeActivePaneItem.bind(atom.workspace)).map(paneItem => {
    if (atom.workspace.isTextEditor(paneItem)) {
      const textEditor = paneItem;
      return textEditor ? textEditor.getPath() : null;
    }
  }).distinctUntilChanged();

  const sortedDiagnostics = _rxjsBundlesRxMinJs.Observable.concat(_rxjsBundlesRxMinJs.Observable.of([]), diagnosticsStream.map(diagnostics => diagnostics.slice().sort((_paneUtils || _load_paneUtils()).compareMessagesByFile)));

  const filterByActiveTextEditorStream = new _rxjsBundlesRxMinJs.BehaviorSubject(initialfilterByActiveTextEditor);
  const handleFilterByActiveTextEditorChange = filterByActiveTextEditor => {
    filterByActiveTextEditorStream.next(filterByActiveTextEditor);
    onFilterByActiveTextEditorChange(filterByActiveTextEditor);
  };

  // $FlowFixMe: We haven't typed this function with this many args.
  return _rxjsBundlesRxMinJs.Observable.combineLatest(activeTextEditorPaths, sortedDiagnostics, warnAboutLinterStream, filterByActiveTextEditorStream, showTraces).map(([pathToActiveTextEditor, diagnostics, warnAboutLinter, filter, traces]) => ({
    pathToActiveTextEditor,
    diagnostics,
    warnAboutLinter,
    showTraces: traces,
    disableLinter,
    filterByActiveTextEditor: filter,
    onFilterByActiveTextEditorChange: handleFilterByActiveTextEditorChange
  }));
}