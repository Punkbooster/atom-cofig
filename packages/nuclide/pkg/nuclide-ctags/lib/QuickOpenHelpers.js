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

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getCtagsService = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (directory) {
    // The tags package looks in the directory, so give it a sample file.
    const path = (_nuclideUri || _load_nuclideUri()).default.join(directory.getPath(), 'file');
    const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('CtagsService', path);
    if (service == null) {
      return null;
    }
    return yield service.getCtagsService(path);
  });

  return function getCtagsService(_x) {
    return _ref.apply(this, arguments);
  };
})();

var _reactForAtom = require('react-for-atom');

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _HackLanguage;

function _load_HackLanguage() {
  return _HackLanguage = require('../../nuclide-hack/lib/HackLanguage');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// ctags doesn't have a true limit API, so having too many results slows down Nuclide.

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
const MIN_QUERY_LENGTH = 2;
const RESULTS_LIMIT = 10;
const DEFAULT_ICON = 'icon-squirrel';

class QuickOpenHelpers {

  static isEligibleForDirectory(directory) {
    return (0, _asyncToGenerator.default)(function* () {
      const svc = yield getCtagsService(directory);
      if (svc != null) {
        svc.dispose();
        return true;
      }
      return false;
    })();
  }

  static getComponentForItem(uncastedItem) {
    const item = uncastedItem;
    const path = (_nuclideUri || _load_nuclideUri()).default.relative(item.dir, item.path);
    let kind;
    let icon;
    if (item.kind != null) {
      kind = (_utils || _load_utils()).CTAGS_KIND_NAMES[item.kind];
      icon = (_utils || _load_utils()).CTAGS_KIND_ICONS[item.kind];
    }
    icon = icon || DEFAULT_ICON;
    return _reactForAtom.React.createElement(
      'div',
      { title: kind },
      _reactForAtom.React.createElement(
        'span',
        { className: `file icon ${ icon }` },
        _reactForAtom.React.createElement(
          'code',
          null,
          item.name
        )
      ),
      _reactForAtom.React.createElement(
        'span',
        { className: 'omnisearch-symbol-result-filename' },
        path
      )
    );
  }

  static executeQuery(query, directory) {
    return (0, _asyncToGenerator.default)(function* () {
      if (directory == null || query.length < MIN_QUERY_LENGTH) {
        return [];
      }

      const dir = directory.getPath();
      const service = yield getCtagsService(directory);
      if (service == null) {
        return [];
      }

      // HACK: Ctags results typically just duplicate Hack results when they're present.
      // Filter out results from PHP files when the Hack service is available.
      // TODO(hansonw): Remove this when quick-open has proper ranking/de-duplication.
      let isHackProject;
      if ((_featureConfig || _load_featureConfig()).default.get('nuclide-ctags.disableWithHack') !== false) {
        isHackProject = yield (0, (_HackLanguage || _load_HackLanguage()).isFileInHackProject)(directory.getPath());
      }

      try {
        const results = yield service.findTags(query, {
          caseInsensitive: true,
          partialMatch: true,
          limit: RESULTS_LIMIT
        });

        return yield Promise.all(results.filter(function (tag) {
          return !isHackProject || !tag.file.endsWith('.php');
        }).map((() => {
          var _ref2 = (0, _asyncToGenerator.default)(function* (tag) {
            const line = yield (0, (_utils || _load_utils()).getLineNumberForTag)(tag);
            return Object.assign({}, tag, {
              path: tag.file,
              dir,
              line
            });
          });

          return function (_x2) {
            return _ref2.apply(this, arguments);
          };
        })()));
      } finally {
        service.dispose();
      }
    })();
  }

}
exports.default = QuickOpenHelpers;
module.exports = exports['default'];