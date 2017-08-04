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
exports.getlocalService = exports.getServiceByNuclideUri = exports.getServiceByConnection = exports.getService = exports.decorateSshConnectionDelegateWithTracking = exports.NuclideTextBuffer = exports.SshHandshake = exports.ConnectionCache = exports.ServerConnection = exports.RemoteFile = exports.RemoteDirectory = exports.RemoteConnection = undefined;
exports.getArcanistServiceByNuclideUri = getArcanistServiceByNuclideUri;
exports.getBuckServiceByNuclideUri = getBuckServiceByNuclideUri;
exports.getClangServiceByNuclideUri = getClangServiceByNuclideUri;
exports.getCtagsServiceByNuclideUri = getCtagsServiceByNuclideUri;
exports.getFileSystemServiceByNuclideUri = getFileSystemServiceByNuclideUri;
exports.getFileWatcherServiceByNuclideUri = getFileWatcherServiceByNuclideUri;
exports.getFlowServiceByNuclideUri = getFlowServiceByNuclideUri;
exports.getFuzzyFileSearchServiceByNuclideUri = getFuzzyFileSearchServiceByNuclideUri;
exports.getGrepServiceByNuclideUri = getGrepServiceByNuclideUri;
exports.getHackLanguageForUri = getHackLanguageForUri;
exports.getHgServiceByNuclideUri = getHgServiceByNuclideUri;
exports.getInfoServiceByNuclideUri = getInfoServiceByNuclideUri;
exports.getMerlinServiceByNuclideUri = getMerlinServiceByNuclideUri;
exports.getReasonServiceByNuclideUri = getReasonServiceByNuclideUri;
exports.getNativeDebuggerServiceByNuclideUri = getNativeDebuggerServiceByNuclideUri;
exports.getNodeDebuggerServiceByNuclideUri = getNodeDebuggerServiceByNuclideUri;
exports.getOpenFilesServiceByNuclideUri = getOpenFilesServiceByNuclideUri;
exports.getPhpDebuggerServiceByNuclideUri = getPhpDebuggerServiceByNuclideUri;
exports.getPythonServiceByNuclideUri = getPythonServiceByNuclideUri;
exports.getRemoteCommandServiceByNuclideUri = getRemoteCommandServiceByNuclideUri;
exports.getSourceControlServiceByNuclideUri = getSourceControlServiceByNuclideUri;
exports.getAdbServiceByNuclideUri = getAdbServiceByNuclideUri;

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _RemoteConnection;

function _load_RemoteConnection() {
  return _RemoteConnection = require('./RemoteConnection');
}

var _RemoteDirectory;

function _load_RemoteDirectory() {
  return _RemoteDirectory = require('./RemoteDirectory');
}

var _RemoteFile;

function _load_RemoteFile() {
  return _RemoteFile = require('./RemoteFile');
}

var _ServerConnection;

function _load_ServerConnection() {
  return _ServerConnection = require('./ServerConnection');
}

var _ConnectionCache;

function _load_ConnectionCache() {
  return _ConnectionCache = require('./ConnectionCache');
}

var _NuclideTextBuffer;

function _load_NuclideTextBuffer() {
  return _NuclideTextBuffer = _interopRequireDefault(require('./NuclideTextBuffer'));
}

var _SshHandshake;

function _load_SshHandshake() {
  return _SshHandshake = require('./SshHandshake');
}

var _serviceManager;

function _load_serviceManager() {
  return _serviceManager = require('./service-manager');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.RemoteConnection = (_RemoteConnection || _load_RemoteConnection()).RemoteConnection;
exports.RemoteDirectory = (_RemoteDirectory || _load_RemoteDirectory()).RemoteDirectory;
exports.RemoteFile = (_RemoteFile || _load_RemoteFile()).RemoteFile;
exports.ServerConnection = (_ServerConnection || _load_ServerConnection()).ServerConnection;
exports.ConnectionCache = (_ConnectionCache || _load_ConnectionCache()).ConnectionCache;
exports.SshHandshake = (_SshHandshake || _load_SshHandshake()).SshHandshake;
exports.NuclideTextBuffer = (_NuclideTextBuffer || _load_NuclideTextBuffer()).default;
exports.decorateSshConnectionDelegateWithTracking = (_SshHandshake || _load_SshHandshake()).decorateSshConnectionDelegateWithTracking;
exports.getService = (_serviceManager || _load_serviceManager()).getService;
exports.getServiceByConnection = (_serviceManager || _load_serviceManager()).getServiceByConnection;
exports.getServiceByNuclideUri = (_serviceManager || _load_serviceManager()).getServiceByNuclideUri;
exports.getlocalService = (_serviceManager || _load_serviceManager()).getlocalService;
function getArcanistServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('ArcanistService', uri));
}

function getBuckServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('BuckService', uri));
}

function getClangServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('ClangService', uri));
}

function getCtagsServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('CtagsService', uri));
}

function getFileSystemServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('FileSystemService', uri));
}

function getFileWatcherServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('FileWatcherService', uri));
}

function getFlowServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('FlowService', uri));
}

function getFuzzyFileSearchServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('FuzzyFileSearchService', uri));
}

function getGrepServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('GrepService', uri));
}

function getHackLanguageForUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('HackService', uri));
}

function getHgServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('HgService', uri));
}

function getInfoServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('InfoService', uri));
}

function getMerlinServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('MerlinService', uri));
}

function getReasonServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('ReasonService', uri));
}

function getNativeDebuggerServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('NativeDebuggerService', uri));
}

function getNodeDebuggerServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('NodeDebuggerService', uri));
}

function getOpenFilesServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('OpenFilesService', uri));
}

function getPhpDebuggerServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('PhpDebuggerService', uri));
}

function getPythonServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('PythonService', uri));
}

function getRemoteCommandServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('RemoteCommandService', uri));
}

function getSourceControlServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('SourceControlService', uri));
}

function getAdbServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('AdbService', uri));
}