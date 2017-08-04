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
exports.getDefaultConnectionProfile = getDefaultConnectionProfile;
exports.getSavedConnectionProfiles = getSavedConnectionProfiles;
exports.saveConnectionProfiles = saveConnectionProfiles;
exports.onSavedConnectionProfilesDidChange = onSavedConnectionProfilesDidChange;
exports.saveConnectionConfig = saveConnectionConfig;
exports.getDefaultConfig = getDefaultConfig;
exports.getOfficialRemoteServerCommand = getOfficialRemoteServerCommand;

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Section: Default Connection Profile
 */

/**
 * A default connection profile is a combination of the user's last inputs to
 * the connection dialog and the default settings, plus the update logic we use
 * to change the remote server command.
 */
function getDefaultConnectionProfile() {
  const defaultConnectionSettings = getDefaultConfig();
  const currentOfficialRSC = defaultConnectionSettings.remoteServerCommand;

  const rawLastConnectionDetails = window.localStorage.getItem('nuclide:nuclide-remote-projects:lastConnectionDetails');

  let lastConnectionDetails;
  try {
    lastConnectionDetails = JSON.parse(rawLastConnectionDetails);
  } catch (err) {
    // nothing to do...
  } finally {
    if (lastConnectionDetails == null) {
      lastConnectionDetails = {};
    }
  }

  if (!(lastConnectionDetails != null)) {
    throw new Error('Invariant violation: "lastConnectionDetails != null"');
  }

  const { lastOfficialRemoteServerCommand, updatedConfig } = lastConnectionDetails;
  const lastConfig = updatedConfig || {};

  // Only use the user's last saved remote server command if there has been no
  // change (upgrade) in the official remote server command.
  let remoteServerCommand = currentOfficialRSC;
  if (lastOfficialRemoteServerCommand === currentOfficialRSC && lastConfig.remoteServerCommand) {
    remoteServerCommand = lastConfig.remoteServerCommand;
  }
  const dialogSettings = Object.assign({}, defaultConnectionSettings, lastConfig, { remoteServerCommand });
  // Due to a previous bug in the sshPort type, we may need to do this cast to
  // correct bad state that was persisted in users' configs.
  dialogSettings.sshPort = String(dialogSettings.sshPort);
  return {
    deletable: false,
    displayTitle: '(default)',
    params: dialogSettings,
    saveable: false
  };
}

/**
 * Section: User-created Connection Profiles
 */

/**
 * Returns an array of saved connection profiles.
 */
function getSavedConnectionProfiles() {
  const connectionProfiles = (_featureConfig || _load_featureConfig()).default.get('nuclide-remote-projects.connectionProfiles');

  if (!Array.isArray(connectionProfiles)) {
    throw new Error('Invariant violation: "Array.isArray(connectionProfiles)"');
  }

  prepareSavedConnectionProfilesForDisplay(connectionProfiles);
  return connectionProfiles;
}

/**
 * Saves the connection profiles. Overwrites any existing profiles.
 */
function saveConnectionProfiles(profiles) {
  prepareConnectionProfilesForSaving(profiles);
  (_featureConfig || _load_featureConfig()).default.set('nuclide-remote-projects.connectionProfiles', profiles);
}

/**
 * Calls the callback when the saved connection profiles change.
 * @return Disposable that can be disposed to stop listening for changes.
 */
function onSavedConnectionProfilesDidChange(callback) {
  return (_featureConfig || _load_featureConfig()).default.onDidChange('nuclide-remote-projects.connectionProfiles', event => {
    const newProfiles = event.newValue;
    prepareSavedConnectionProfilesForDisplay(newProfiles);
    callback(newProfiles);
  });
}

/**
 * Section: Default/Last-Used Connection Profiles
 */

/**
 * Saves a connection configuration along with the last official server command.
 */
function saveConnectionConfig(config, lastOfficialRemoteServerCommand) {
  // Don't store user's password.
  const updatedConfig = Object.assign({}, config, { password: '' });
  // SshConnectionConfiguration's sshPort type is 'number', but we want to save
  // everything as strings.
  updatedConfig.sshPort = String(config.sshPort);
  window.localStorage.setItem('nuclide:nuclide-remote-projects:lastConnectionDetails', JSON.stringify({
    updatedConfig,
    // Save last official command to detect upgrade.
    lastOfficialRemoteServerCommand
  }));
}

let defaultConfig = null;
/**
 * This fetches the 'default' connection configuration supplied to the user
 * regardless of any connection profiles they might have saved.
 */
function getDefaultConfig() {
  if (defaultConfig) {
    return defaultConfig;
  }
  let defaultConfigGetter;
  try {
    // $FlowFB
    defaultConfigGetter = require('./fb/config');
  } catch (e) {
    defaultConfigGetter = require('./config');
  }
  defaultConfig = defaultConfigGetter.getConnectionDialogDefaultSettings();
  return defaultConfig;
}

function getOfficialRemoteServerCommand() {
  return getDefaultConfig().remoteServerCommand;
}

function prepareSavedConnectionProfilesForDisplay(connectionProfiles) {
  if (!connectionProfiles) {
    return;
  }
  // If a profile does not inclide a remote server command, this means the user
  // intended to use the default server command. We must fill this in.
  const defaultConnectionSettings = getDefaultConfig();
  const currentOfficialRSC = defaultConnectionSettings.remoteServerCommand;
  connectionProfiles.forEach(profile => {
    if (!profile.params.remoteServerCommand) {
      profile.params.remoteServerCommand = currentOfficialRSC;
    }
  });
}

function prepareConnectionProfilesForSaving(connectionProfiles) {
  // If a connection profile has a default remote server command, replace it with
  // an empty string. This indicates that this server command should be filled in
  // when this profile is used.
  const defaultConnectionSettings = getDefaultConfig();
  const currentOfficialRSC = defaultConnectionSettings.remoteServerCommand;
  connectionProfiles.forEach(profile => {
    if (profile.params.remoteServerCommand === currentOfficialRSC) {
      profile.params.remoteServerCommand = '';
    }
  });
}