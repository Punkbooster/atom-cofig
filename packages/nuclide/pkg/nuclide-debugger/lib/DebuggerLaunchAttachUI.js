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
exports.DebuggerLaunchAttachUI = undefined;

var _Dropdown;

function _load_Dropdown() {
  return _Dropdown = require('../../nuclide-ui/Dropdown');
}

var _reactForAtom = require('react-for-atom');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class DebuggerLaunchAttachUI extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);

    this._resetConnections = this._resetConnections.bind(this);
    this._handleConnectionDropdownChange = this._handleConnectionDropdownChange.bind(this);
    this._handleDebuggingTypeDropdownChange = this._handleDebuggingTypeDropdownChange.bind(this);
    this._handleProviderActionsDropdownChange = this._handleProviderActionsDropdownChange.bind(this);

    this.state = {
      connectionsUpdatedDisposable: this.props.store.onConnectionsUpdated(this._resetConnections),
      connections: [],
      availableProviders: [],
      providerActions: [],
      connectionsDropdownIndex: 0,
      debuggingTypeDropdownIndex: 0,
      providerActionsDropdownIndex: 0,
      element: null
    };
  }

  componentWillMount() {
    this.props.debuggerActions.updateConnections();
  }

  componentWillUnmount() {
    this.state.connectionsUpdatedDisposable.dispose();
  }

  render() {
    const connectionItems = this.state.connections.map((connection, index) => ({
      label: (_nuclideUri || _load_nuclideUri()).default.isRemote(connection) ? (_nuclideUri || _load_nuclideUri()).default.getHostname(connection) : connection,
      value: index
    }));

    const debuggingTypeItems = this.state.availableProviders.map((provider, index) => ({
      label: provider.getDebuggingTypeName(),
      value: index
    }));

    const providerActions = this.state.providerActions.map((action, index) => ({
      label: action,
      value: index
    }));

    return _reactForAtom.React.createElement(
      'div',
      { className: 'padded nuclide-debugger-launch-attach-container' },
      _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-debugger-launch-attach-header' },
        _reactForAtom.React.createElement(
          'label',
          { className: 'inline-block' },
          'Connection: '
        ),
        _reactForAtom.React.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
          className: 'inline-block',
          options: connectionItems,
          onChange: this._handleConnectionDropdownChange,
          value: this.state.connectionsDropdownIndex,
          size: 'sm'
        }),
        _reactForAtom.React.createElement(
          'label',
          { className: 'inline-block' },
          'Type: '
        ),
        _reactForAtom.React.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
          className: 'inline-block',
          options: debuggingTypeItems,
          onChange: this._handleDebuggingTypeDropdownChange,
          value: this.state.debuggingTypeDropdownIndex,
          size: 'sm'
        }),
        _reactForAtom.React.createElement(
          'label',
          { className: 'inline-block' },
          'Action: '
        ),
        _reactForAtom.React.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
          className: 'inline-block',
          options: providerActions,
          onChange: this._handleProviderActionsDropdownChange,
          value: this.state.providerActionsDropdownIndex,
          size: 'sm'
        })
      ),
      _reactForAtom.React.createElement(
        'div',
        null,
        this.state.element
      )
    );
  }

  // Reset connections dropdown with latest connections.
  _resetConnections() {
    const connections = this.props.store.getConnections();
    this.setState({
      connections,
      connectionsDropdownIndex: 0
    });
    // Continue fill debugging types dropdown for new connection.
    this._resetAvailableDebuggingTypes(connections[0]);
  }

  _handleConnectionDropdownChange(newIndex) {
    this.setState({
      connectionsDropdownIndex: newIndex
    });
    const selectedConnection = this.state.connections[newIndex];
    this._resetAvailableDebuggingTypes(selectedConnection);
  }

  // Reset debugging types dropdown for input connection.
  _resetAvailableDebuggingTypes(connection) {
    this._clearPreviousProviders();
    const availableProviders = this.props.store.getLaunchAttachProvidersForConnection(connection);
    this.setState({
      availableProviders,
      debuggingTypeDropdownIndex: 0
    });
    // Continue fill actions dropdown for new provider.
    this._resetProviderActions(availableProviders[0]);
  }

  _clearPreviousProviders() {
    for (const provider of this.state.availableProviders) {
      provider.dispose();
    }
  }

  _handleDebuggingTypeDropdownChange(newIndex) {
    this.setState({
      debuggingTypeDropdownIndex: newIndex
    });
    this._resetProviderActions(this.state.availableProviders[newIndex]);
  }

  // Reset actions dropdown for input DebuggerLaunchAttachProvider.
  _resetProviderActions(provider) {
    provider.getActions().then(providerActions => {
      this.setState({
        providerActions,
        providerActionsDropdownIndex: 0
      });
      this._resetElement(provider, providerActions[0]);
    });
  }

  _handleProviderActionsDropdownChange(newIndex) {
    this.setState({
      providerActionsDropdownIndex: newIndex
    });
    const selectedProviderIndex = this.state.debuggingTypeDropdownIndex;
    const provider = this.state.availableProviders[selectedProviderIndex];
    const selectedAction = this.state.providerActions[newIndex];
    // Continue use new UI element for new provider + action.
    this._resetElement(provider, selectedAction);
  }

  // Display new customized element UI from input provider and action.
  _resetElement(provider, action) {
    let element = provider.getComponent(action, this.props.emitter);
    // Assign an unique key to element so that react treats it as a new element.
    if (element != null) {
      element = _reactForAtom.React.cloneElement(element, { key: provider.getUniqueKey() });
    }
    this.setState({
      element
    });
  }
}
exports.DebuggerLaunchAttachUI = DebuggerLaunchAttachUI;