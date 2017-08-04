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

var _AuthenticationPrompt;

function _load_AuthenticationPrompt() {
  return _AuthenticationPrompt = _interopRequireDefault(require('./AuthenticationPrompt'));
}

var _Button;

function _load_Button() {
  return _Button = require('../../nuclide-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('../../nuclide-ui/ButtonGroup');
}

var _ConnectionDetailsPrompt;

function _load_ConnectionDetailsPrompt() {
  return _ConnectionDetailsPrompt = _interopRequireDefault(require('./ConnectionDetailsPrompt'));
}

var _IndeterminateProgressBar;

function _load_IndeterminateProgressBar() {
  return _IndeterminateProgressBar = _interopRequireDefault(require('./IndeterminateProgressBar'));
}

var _notification;

function _load_notification() {
  return _notification = require('./notification');
}

var _reactForAtom = require('react-for-atom');

var _electron = _interopRequireDefault(require('electron'));

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _formValidationUtils;

function _load_formValidationUtils() {
  return _formValidationUtils = require('./form-validation-utils');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();
const { remote } = _electron.default;

if (!(remote != null)) {
  throw new Error('Invariant violation: "remote != null"');
}

const REQUEST_CONNECTION_DETAILS = 1;
const WAITING_FOR_CONNECTION = 2;
const REQUEST_AUTHENTICATION_DETAILS = 3;
const WAITING_FOR_AUTHENTICATION = 4;

/**
 * Component that manages the state transitions as the user connects to a server.
 */
class ConnectionDialog extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);

    const sshHandshake = new (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).SshHandshake((0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).decorateSshConnectionDelegateWithTracking)({
      onKeyboardInteractive: (name, instructions, instructionsLang, prompts, finish) => {
        // TODO: Display all prompts, not just the first one.
        this.requestAuthentication(prompts[0], finish);
      },

      onWillConnect: () => {},

      onDidConnect: (connection, config) => {
        this.close(); // Close the dialog.
        this.props.onConnect(connection, config);
      },

      onError: (errorType, error, config) => {
        this.close(); // Close the dialog.
        (0, (_notification || _load_notification()).notifySshHandshakeError)(errorType, error, config);
        this.props.onError(error, config);
        logger.debug(error);
      }
    }));

    this.state = {
      finish: answers => {},
      indexOfSelectedConnectionProfile: props.indexOfInitiallySelectedConnectionProfile,
      instructions: '',
      isDirty: false,
      mode: REQUEST_CONNECTION_DETAILS,
      sshHandshake
    };

    this.cancel = this.cancel.bind(this);
    this._handleClickSave = this._handleClickSave.bind(this);
    this._handleDidChange = this._handleDidChange.bind(this);
    this.ok = this.ok.bind(this);
    this.onProfileClicked = this.onProfileClicked.bind(this);
  }

  componentDidMount() {
    this._focus();
  }

  componentWillReceiveProps(nextProps) {
    let indexOfSelectedConnectionProfile = this.state.indexOfSelectedConnectionProfile;
    if (nextProps.connectionProfiles == null) {
      indexOfSelectedConnectionProfile = -1;
    } else if (this.props.connectionProfiles == null
    // The current selection is outside the bounds of the next profiles list
    || indexOfSelectedConnectionProfile > nextProps.connectionProfiles.length - 1
    // The next profiles list is longer than before, a new one was added
    || nextProps.connectionProfiles.length > this.props.connectionProfiles.length) {
      // Select the final connection profile in the list because one of the above conditions means
      // the current selected index is outdated.
      indexOfSelectedConnectionProfile = nextProps.connectionProfiles.length - 1;
    }

    this.setState({ indexOfSelectedConnectionProfile });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.mode !== prevState.mode) {
      this._focus();
    } else if (this.state.mode === REQUEST_CONNECTION_DETAILS && this.state.indexOfSelectedConnectionProfile === prevState.indexOfSelectedConnectionProfile && !this.state.isDirty && prevState.isDirty) {
      // When editing a profile and clicking "Save", the Save button disappears. Focus the primary
      // button after re-rendering so focus is on a logical element.
      this.refs.okButton.focus();
    }
  }

  _focus() {
    const content = this.refs.content;
    if (content == null) {
      _reactForAtom.ReactDOM.findDOMNode(this.refs.cancelButton).focus();
    } else {
      content.focus();
    }
  }

  _handleDidChange() {
    this.setState({ isDirty: true });
  }

  _handleClickSave() {
    if (!(this.props.connectionProfiles != null)) {
      throw new Error('Invariant violation: "this.props.connectionProfiles != null"');
    }

    const selectedProfile = this.props.connectionProfiles[this.state.indexOfSelectedConnectionProfile];
    const connectionDetails = this.refs.content.getFormFields();
    const validationResult = (0, (_formValidationUtils || _load_formValidationUtils()).validateFormInputs)(selectedProfile.displayTitle, connectionDetails, '');

    if (typeof validationResult.errorMessage === 'string') {
      atom.notifications.addError(validationResult.errorMessage);
      return;
    }

    if (!(validationResult.validatedProfile != null && typeof validationResult.validatedProfile === 'object')) {
      throw new Error('Invariant violation: "validationResult.validatedProfile != null &&\\n      typeof validationResult.validatedProfile === \'object\'"');
    }
    // Save the validated profile, and show any warning messages.


    const newProfile = validationResult.validatedProfile;
    if (typeof validationResult.warningMessage === 'string') {
      atom.notifications.addWarning(validationResult.warningMessage);
    }

    this.props.onSaveProfile(this.state.indexOfSelectedConnectionProfile, newProfile);
    this.setState({ isDirty: false });
  }

  _validateInitialDirectory(path) {
    return path !== '/';
  }

  render() {
    const mode = this.state.mode;
    let content;
    let isOkDisabled;
    let okButtonText;

    if (mode === REQUEST_CONNECTION_DETAILS) {
      content = _reactForAtom.React.createElement((_ConnectionDetailsPrompt || _load_ConnectionDetailsPrompt()).default, {
        connectionProfiles: this.props.connectionProfiles,
        indexOfSelectedConnectionProfile: this.state.indexOfSelectedConnectionProfile,
        onAddProfileClicked: this.props.onAddProfileClicked,
        onCancel: this.cancel,
        onConfirm: this.ok,
        onDeleteProfileClicked: this.props.onDeleteProfileClicked,
        onDidChange: this._handleDidChange,
        onProfileClicked: this.onProfileClicked,
        ref: 'content'
      });
      isOkDisabled = false;
      okButtonText = 'Connect';
    } else if (mode === WAITING_FOR_CONNECTION || mode === WAITING_FOR_AUTHENTICATION) {
      content = _reactForAtom.React.createElement((_IndeterminateProgressBar || _load_IndeterminateProgressBar()).default, null);
      isOkDisabled = true;
      okButtonText = 'Connect';
    } else {
      content = _reactForAtom.React.createElement((_AuthenticationPrompt || _load_AuthenticationPrompt()).default, {
        instructions: this.state.instructions,
        onCancel: this.cancel,
        onConfirm: this.ok,
        ref: 'content'
      });
      isOkDisabled = false;
      okButtonText = 'OK';
    }

    let saveButtonGroup;
    let selectedProfile;
    if (this.state.indexOfSelectedConnectionProfile >= 0 && this.props.connectionProfiles != null) {
      selectedProfile = this.props.connectionProfiles[this.state.indexOfSelectedConnectionProfile];
    }
    if (this.state.isDirty && selectedProfile != null && selectedProfile.saveable) {
      saveButtonGroup = _reactForAtom.React.createElement(
        (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
        { className: 'inline-block' },
        _reactForAtom.React.createElement(
          (_Button || _load_Button()).Button,
          { onClick: this._handleClickSave },
          'Save'
        )
      );
    }

    return _reactForAtom.React.createElement(
      'div',
      null,
      _reactForAtom.React.createElement(
        'div',
        { className: 'block' },
        content
      ),
      _reactForAtom.React.createElement(
        'div',
        { style: { display: 'flex', justifyContent: 'flex-end' } },
        saveButtonGroup,
        _reactForAtom.React.createElement(
          (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
          null,
          _reactForAtom.React.createElement(
            'button',
            { className: 'btn', onClick: this.cancel, ref: 'cancelButton' },
            'Cancel'
          ),
          _reactForAtom.React.createElement(
            'button',
            {
              className: 'btn btn-primary',
              disabled: isOkDisabled,
              onClick: this.ok,
              ref: 'okButton' },
            okButtonText
          )
        )
      )
    );
  }

  cancel() {
    const mode = this.state.mode;

    // It is safe to call cancel even if no connection is started
    this.state.sshHandshake.cancel();

    if (mode === WAITING_FOR_CONNECTION) {
      // TODO(mikeo): Tell delegate to cancel the connection request.
      this.setState({
        isDirty: false,
        mode: REQUEST_CONNECTION_DETAILS
      });
    } else {
      // TODO(mikeo): Also cancel connection request, as appropriate for mode?
      this.props.onCancel();
      this.close();
    }
  }

  close() {
    if (this.props.onClosed) {
      this.props.onClosed();
    }
  }

  ok() {
    const { mode } = this.state;

    if (mode === REQUEST_CONNECTION_DETAILS) {
      // User is trying to submit connection details.
      const connectionDetailsForm = this.refs.content;
      const {
        username,
        server,
        cwd,
        remoteServerCommand,
        sshPort,
        pathToPrivateKey,
        authMethod,
        password,
        displayTitle
      } = connectionDetailsForm.getFormFields();

      if (!this._validateInitialDirectory(cwd)) {
        remote.dialog.showErrorBox('Invalid initial path', 'Please specify a non-root directory.');
        return;
      }

      if (username && server && cwd && remoteServerCommand) {
        this.setState({
          isDirty: false,
          mode: WAITING_FOR_CONNECTION
        });
        this.state.sshHandshake.connect({
          host: server,
          sshPort,
          username,
          pathToPrivateKey,
          authMethod,
          cwd,
          remoteServerCommand,
          password,
          displayTitle
        });
      } else {
        remote.dialog.showErrorBox('Missing information', "Please make sure you've filled out all the form fields.");
      }
    } else if (mode === REQUEST_AUTHENTICATION_DETAILS) {
      const authenticationPrompt = this.refs.content;
      const password = authenticationPrompt.getPassword();

      this.state.finish([password]);

      this.setState({
        isDirty: false,
        mode: WAITING_FOR_AUTHENTICATION
      });
    }
  }

  requestAuthentication(instructions, finish) {
    this.setState({
      finish,
      instructions: instructions.prompt,
      isDirty: false,
      mode: REQUEST_AUTHENTICATION_DETAILS
    });
  }

  getFormFields() {
    const connectionDetailsForm = this.refs.content;
    if (!connectionDetailsForm) {
      return null;
    }

    const {
      username,
      server,
      cwd,
      remoteServerCommand,
      sshPort,
      pathToPrivateKey,
      authMethod,
      displayTitle
    } = connectionDetailsForm.getFormFields();
    return {
      username,
      server,
      cwd,
      remoteServerCommand,
      sshPort,
      pathToPrivateKey,
      authMethod,
      displayTitle
    };
  }

  onProfileClicked(indexOfSelectedConnectionProfile) {
    this.setState({
      indexOfSelectedConnectionProfile,
      isDirty: false
    });
  }
}
exports.default = ConnectionDialog;
ConnectionDialog.defaultProps = {
  indexOfInitiallySelectedConnectionProfile: -1
};
module.exports = exports['default'];