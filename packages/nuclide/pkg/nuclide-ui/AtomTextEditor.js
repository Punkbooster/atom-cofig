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
exports.AtomTextEditor = undefined;

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _reactForAtom = require('react-for-atom');

var _semver;

function _load_semver() {
  return _semver = _interopRequireDefault(require('semver'));
}

var _atom = require('atom');

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('../commons-atom/text-editor');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../commons-node/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const doNothing = () => {};

function setupTextEditor(props) {
  const textBuffer = props.textBuffer || new _atom.TextBuffer();
  if (props.path) {
    textBuffer.setPath(props.path);
  }

  const disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  if (props.onDidTextBufferChange != null) {
    disposables.add(textBuffer.onDidChange(props.onDidTextBufferChange));
  }

  const textEditorParams = {
    buffer: textBuffer,
    lineNumberGutterVisible: !props.gutterHidden,
    autoHeight: props.autoGrow
  };
  const textEditor = atom.workspace.buildTextEditor(textEditorParams);

  if (props.grammar != null) {
    textEditor.setGrammar(props.grammar);
  }
  disposables.add((0, (_textEditor || _load_textEditor()).enforceSoftWrap)(textEditor, props.softWrapped));

  if (props.placeholderText) {
    textEditor.setPlaceholderText(props.placeholderText);
  }

  if (props.readOnly) {
    (0, (_textEditor || _load_textEditor()).enforceReadOnly)(textEditor);

    // Remove the cursor line decorations because that's distracting in read-only mode.
    textEditor.getDecorations({ class: 'cursor-line' }).forEach(decoration => {
      decoration.destroy();
    });
  }

  return {
    disposables,
    textEditor
  };
}

class AtomTextEditor extends _reactForAtom.React.Component {

  componentDidMount() {
    this._editorDisposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._updateTextEditor(setupTextEditor(this.props));
    this._onDidUpdateTextEditorElement(this.props);
  }

  _updateTextEditor(setup) {
    this._editorDisposables.dispose();
    const { textEditor, disposables } = setup;

    this._editorDisposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(disposables);

    const container = _reactForAtom.ReactDOM.findDOMNode(this);
    const textEditorElement = this._textEditorElement = document.createElement('atom-text-editor');
    textEditorElement.setModel(textEditor);
    textEditorElement.setAttribute('tabindex', this.props.tabIndex);
    // HACK! This is a workaround for the ViewRegistry where Atom has a default view provider for
    // TextEditor (that we cannot override), which is responsible for creating the view associated
    // with the TextEditor that we create and adding a mapping for it in its private views map.
    // To workaround this, we reach into the internals of the ViewRegistry and update the entry in
    // the map manually. Filed as https://github.com/atom/atom/issues/7954.
    // $FlowFixMe
    atom.views.views.set(textEditor, textEditorElement);
    // Attach to DOM.
    container.innerHTML = '';
    container.appendChild(textEditorElement);

    // The following is a hack to work around the broken atom-text-editor auto-sizing in Atom 1.9.x
    // See https://github.com/atom/atom/issues/12441 to follow the proper fix.
    // TODO @jxg remove once atom-text-editor is fixed.
    if ((_semver || _load_semver()).default.lt(atom.getVersion(), '1.9.0')) {
      return;
    }

    this._editorDisposables.add(textEditorElement.onDidAttach(() => {
      const correctlySizedElement = textEditorElement.querySelector('* /deep/ .lines > :first-child > :first-child');
      if (correctlySizedElement == null) {
        return;
      }
      const { width } = correctlySizedElement.style;
      container.style.width = width;
    }));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.textBuffer !== this.props.textBuffer || nextProps.readOnly !== this.props.readOnly) {
      const previousTextContents = this.getTextBuffer().getText();
      const nextTextContents = nextProps.textBuffer == null ? nextProps.textBuffer : nextProps.textBuffer.getText();
      if (nextProps._alwaysUpdate || nextTextContents !== previousTextContents) {
        const textEditorSetup = setupTextEditor(nextProps);

        if (nextProps.syncTextContents) {
          textEditorSetup.textEditor.setText(previousTextContents);
        }
        this._updateTextEditor(textEditorSetup);
        this._onDidUpdateTextEditorElement(nextProps);
      }
    }
    if (nextProps.path !== this.props.path) {
      this.getTextBuffer().setPath(nextProps.path);
    }
    if (nextProps.gutterHidden !== this.props.gutterHidden) {
      this.getModel().setLineNumberGutterVisible(nextProps.gutterHidden);
    }
    if (nextProps.grammar !== this.props.grammar) {
      this.getModel().setGrammar(nextProps.grammar);
    }
    if (nextProps.softWrapped !== this.props.softWrapped) {
      this.getModel().setSoftWrapped(nextProps.softWrapped);
    }
  }

  _onDidUpdateTextEditorElement(props) {
    if (!props.readOnly) {
      return;
    }
    // TODO(most): t9929679 Remove this hack when Atom has a blinking cursor configuration API.
    const { component } = this.getElement();
    if (component == null) {
      return;
    }
    const { presenter } = component;
    presenter.startBlinkingCursors = doNothing;
    presenter.stopBlinkingCursors(false);
  }

  getTextBuffer() {
    return this.getModel().getBuffer();
  }

  getModel() {
    return this.getElement().getModel();
  }

  getElement() {
    if (!this._textEditorElement) {
      throw new Error('Invariant violation: "this._textEditorElement"');
    }

    return this._textEditorElement;
  }

  render() {
    const className = (0, (_classnames || _load_classnames()).default)(this.props.className, 'nuclide-text-editor-container', {
      'no-auto-grow': !this.props.autoGrow
    });
    return _reactForAtom.React.createElement('div', { className: className });
  }

  // This component wraps the imperative API of `<atom-text-editor>`, and so React's rendering
  // should always pass because this subtree won't change.
  shouldComponentUpdate(nextProps, nextState) {
    return false;
  }

  componentWillUnmount() {
    this._editorDisposables.dispose();
  }

}
exports.AtomTextEditor = AtomTextEditor;
AtomTextEditor.defaultProps = {
  _alwaysUpdate: false,
  gutterHidden: false,
  lineNumberGutterVisible: true,
  readOnly: false,
  autoGrow: false,
  syncTextContents: true,
  tabIndex: '0', // Keep in line with other input elements.
  softWrapped: false
};