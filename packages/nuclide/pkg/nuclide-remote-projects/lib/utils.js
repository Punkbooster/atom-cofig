'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NUCLIDE_PROTOCOL_PREFIX_WIN = exports.NUCLIDE_PROTOCOL_PREFIX = undefined;
exports.sanitizeNuclideUri = sanitizeNuclideUri;
exports.getOpenFileEditorForRemoteProject = getOpenFileEditorForRemoteProject;

var _atom = require('atom');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _RemoteTextEditorPlaceholder;

function _load_RemoteTextEditorPlaceholder() {
  return _RemoteTextEditorPlaceholder = require('./RemoteTextEditorPlaceholder');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const NUCLIDE_PROTOCOL_PREFIX = exports.NUCLIDE_PROTOCOL_PREFIX = 'nuclide:/';
const NUCLIDE_PROTOCOL_PREFIX_WIN = exports.NUCLIDE_PROTOCOL_PREFIX_WIN = 'nuclide_\\';
const NUCLIDE_PROTOCOL_PREFIX_LENGTH = NUCLIDE_PROTOCOL_PREFIX.length;

/**
 * Clean a nuclide URI from the prepended absolute path prefixes and fix
 * the broken uri, in the sense that it's nuclide:/server/path/to/dir instead of
 * nuclide://server/path/to/dir because Atom called path.normalize() on the directory uri.
 */
function sanitizeNuclideUri(uri_) {
  let uri = uri_;
  // Remove the leading absolute path prepended to the file paths
  // between atom reloads.
  const protocolIndex = uri.indexOf(NUCLIDE_PROTOCOL_PREFIX);
  if (protocolIndex > 0) {
    uri = uri.substring(protocolIndex);
  }
  // Add the missing slash, if removed through a path.normalize() call.
  if (uri.startsWith(NUCLIDE_PROTOCOL_PREFIX) && uri[NUCLIDE_PROTOCOL_PREFIX_LENGTH] !== '/' /* protocol missing last slash */
  ) {
      uri = uri.substring(0, NUCLIDE_PROTOCOL_PREFIX_LENGTH) + '/' + uri.substring(NUCLIDE_PROTOCOL_PREFIX_LENGTH);
    }

  // On Windows path normalization converts all of the '/' chars to '\'
  // we need to revert that
  if (uri.startsWith(NUCLIDE_PROTOCOL_PREFIX_WIN)) {
    uri = NUCLIDE_PROTOCOL_PREFIX + '/' + uri.substring(NUCLIDE_PROTOCOL_PREFIX_LENGTH).replace(/\\/g, '/');
  }
  return uri;
}

function* getOpenFileEditorForRemoteProject(connectionConfig) {
  for (const pane of atom.workspace.getPanes()) {
    const paneItems = pane.getItems();
    for (const paneItem of paneItems) {
      // Here, we're explicitly looking for broken nuclide:/ editors.
      // eslint-disable-next-line rulesdir/atom-apis
      if (!(paneItem instanceof _atom.TextEditor || paneItem instanceof (_RemoteTextEditorPlaceholder || _load_RemoteTextEditorPlaceholder()).RemoteTextEditorPlaceholder) || !paneItem.getPath()) {
        // Ignore non-text editors and new editors with empty uris / paths.
        continue;
      }
      const uri = sanitizeNuclideUri(paneItem.getPath());
      const { hostname: fileHostname, path: filePath } = (_nuclideUri || _load_nuclideUri()).default.parse(uri);
      if (fileHostname === connectionConfig.host) {
        // flowlint-next-line sketchy-null-string:off
        if (!fileHostname) {
          throw new Error('Invariant violation: "fileHostname"');
        }

        yield {
          pane,
          editor: paneItem,
          uri,
          filePath
        };
      }
    }
  }
}