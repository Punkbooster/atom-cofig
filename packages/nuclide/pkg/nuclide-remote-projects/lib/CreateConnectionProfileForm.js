'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('../../nuclide-ui/AtomInput');
}

var _reactForAtom = require('react-for-atom');

var _atom = require('atom');

var _ConnectionDetailsForm;

function _load_ConnectionDetailsForm() {
  return _ConnectionDetailsForm = _interopRequireDefault(require('./ConnectionDetailsForm'));
}

var _formValidationUtils;

function _load_formValidationUtils() {
  return _formValidationUtils = require('./form-validation-utils');
}

var _Button;

function _load_Button() {
  return _Button = require('../../nuclide-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('../../nuclide-ui/ButtonGroup');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const PROFILE_NAME_LABEL = 'Profile Name';
const DEFAULT_SERVER_COMMAND_PLACEHOLDER = '(DEFAULT)';

const emptyFunction = () => {};

/**
 * A form that is used to create a new connection profile.
 */
class CreateConnectionProfileForm extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._clickSave = this._clickSave.bind(this);
    this._clickCancel = this._clickCancel.bind(this);
    this.disposables = new _atom.CompositeDisposable();
  }

  componentDidMount() {
    const root = _reactForAtom.ReactDOM.findDOMNode(this);
    this.disposables.add(
    // Hitting enter when this panel has focus should confirm the dialog.
    atom.commands.add(root, 'core:confirm', this._clickSave),
    // Hitting escape when this panel has focus should cancel the dialog.
    atom.commands.add(root, 'core:cancel', this._clickCancel));
    this.refs['profile-name'].focus();
  }

  componentWillUnmount() {
    this.disposables.dispose();
  }

  /**
   * Note: This form displays DEFAULT_SERVER_COMMAND_PLACEHOLDER as the prefilled
   * remote server command. The remote server command will only be saved if the
   * user changes it from this default.
   */
  render() {
    const initialFields = this.props.initialFormFields;

    return _reactForAtom.React.createElement(
      'div',
      null,
      _reactForAtom.React.createElement(
        'div',
        { className: 'form-group' },
        _reactForAtom.React.createElement(
          'label',
          null,
          PROFILE_NAME_LABEL,
          ':'
        ),
        _reactForAtom.React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
          initialValue: '',
          ref: 'profile-name',
          unstyled: true
        })
      ),
      _reactForAtom.React.createElement((_ConnectionDetailsForm || _load_ConnectionDetailsForm()).default, {
        initialUsername: initialFields.username,
        initialServer: initialFields.server,
        initialCwd: initialFields.cwd,
        initialRemoteServerCommand: DEFAULT_SERVER_COMMAND_PLACEHOLDER,
        initialSshPort: initialFields.sshPort,
        initialPathToPrivateKey: initialFields.pathToPrivateKey,
        initialAuthMethod: initialFields.authMethod,
        initialDisplayTitle: initialFields.displayTitle,
        onCancel: emptyFunction,
        onConfirm: this._clickSave,
        onDidChange: emptyFunction,
        ref: 'connection-details'
      }),
      _reactForAtom.React.createElement(
        'div',
        { style: { display: 'flex', justifyContent: 'flex-end' } },
        _reactForAtom.React.createElement(
          (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
          null,
          _reactForAtom.React.createElement(
            (_Button || _load_Button()).Button,
            { onClick: this._clickCancel },
            'Cancel'
          ),
          _reactForAtom.React.createElement(
            (_Button || _load_Button()).Button,
            { buttonType: (_Button || _load_Button()).ButtonTypes.PRIMARY, onClick: this._clickSave },
            'Save'
          )
        )
      )
    );
  }

  _getProfileName() {
    const fieldName = 'profile-name';
    return this.refs[fieldName] && this.refs[fieldName].getText().trim() || '';
  }

  _clickSave() {
    // Validate the form inputs.
    const profileName = this._getProfileName();
    const connectionDetails = this.refs['connection-details'].getFormFields();
    const validationResult = (0, (_formValidationUtils || _load_formValidationUtils()).validateFormInputs)(profileName, connectionDetails, DEFAULT_SERVER_COMMAND_PLACEHOLDER);
    if (typeof validationResult.errorMessage === 'string') {
      atom.notifications.addError(validationResult.errorMessage);
      return;
    }

    if (!(validationResult.validatedProfile != null && typeof validationResult.validatedProfile === 'object')) {
      throw new Error('Invariant violation: "validationResult.validatedProfile != null &&\\n      typeof validationResult.validatedProfile === \'object\'"');
    }

    const newProfile = validationResult.validatedProfile;
    // Save the validated profile, and show any warning messages.
    if (typeof validationResult.warningMessage === 'string') {
      atom.notifications.addWarning(validationResult.warningMessage);
    }
    this.props.onSave(newProfile);
  }

  _clickCancel() {
    this.props.onCancel();
  }
}

module.exports = CreateConnectionProfileForm;