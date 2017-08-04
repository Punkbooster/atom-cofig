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
exports.WorkingSetNameAndSaveComponent = undefined;

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _reactForAtom = require('react-for-atom');

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('../../nuclide-ui/AtomInput');
}

var _Button;

function _load_Button() {
  return _Button = require('../../nuclide-ui/Button');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class WorkingSetNameAndSaveComponent extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);

    this.state = {
      name: props.initialName
    };

    this._trackName = this._trackName.bind(this);
    this._saveWorkingSet = this._saveWorkingSet.bind(this);
  }

  componentDidMount() {}

  componentWillUnmount() {}

  render() {
    let setNameText;
    if (this.state.name === '') {
      setNameText = _reactForAtom.React.createElement(
        'atom-panel',
        { 'class': 'nuclide-file-tree-working-set-name-missing' },
        'Name is missing'
      );
    }

    return _reactForAtom.React.createElement(
      'div',
      null,
      _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-file-tree-working-set-name-outline' },
        _reactForAtom.React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
          placeholderText: 'name',
          size: 'sm',
          className: 'nuclide-file-tree-working-set-name inline-block-tight',
          onDidChange: this._trackName,
          initialValue: this.props.initialName,
          onConfirm: this._saveWorkingSet,
          onCancel: this.props.onCancel
        })
      ),
      _reactForAtom.React.createElement(
        (_Button || _load_Button()).Button,
        {
          buttonType: (_Button || _load_Button()).ButtonTypes.SUCCESS,
          className: (0, (_classnames || _load_classnames()).default)({
            'inline-block-tight': true,
            'disabled': this.state.name === '',
            'nuclide-file-tree-toolbar-icon': true
          }),
          onClick: this._saveWorkingSet },
        _reactForAtom.React.createElement('span', { className: 'icon icon-check nuclide-file-tree-toolbar-icon' })
      ),
      setNameText
    );
  }

  _trackName(text) {
    this.setState({ name: text });
  }

  _saveWorkingSet() {
    if (this.state.name === '') {
      atom.notifications.addWarning('Name is missing', { detail: 'Please provide a name for the Working Set' });
      return;
    }

    if (this.props.isEditing) {
      this.props.onUpdate(this.props.initialName, this.state.name);
    } else {
      this.props.onSave(this.state.name);
    }
  }
}
exports.WorkingSetNameAndSaveComponent = WorkingSetNameAndSaveComponent;