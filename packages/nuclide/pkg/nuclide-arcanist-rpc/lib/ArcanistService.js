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
exports.__TEST__ = exports.getProjectRelativePath = exports.findArcProjectIdAndDirectory = exports.findArcProjectIdOfPath = exports.readArcConfig = exports.findArcConfigDirectory = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let findArcConfigDirectory = exports.findArcConfigDirectory = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (fileName) {
    if (!arcConfigDirectoryMap.has(fileName)) {
      const result = yield (_fsPromise || _load_fsPromise()).default.findNearestFile(ARC_CONFIG_FILE_NAME, fileName);
      arcConfigDirectoryMap.set(fileName, result);
    }
    return arcConfigDirectoryMap.get(fileName);
  });

  return function findArcConfigDirectory(_x) {
    return _ref.apply(this, arguments);
  };
})();

let readArcConfig = exports.readArcConfig = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (fileName) {
    const arcConfigDirectory = yield findArcConfigDirectory(fileName);
    if (!arcConfigDirectory) {
      return null;
    }
    if (!arcProjectMap.has(arcConfigDirectory)) {
      const arcconfigFile = (_nuclideUri || _load_nuclideUri()).default.join(arcConfigDirectory, ARC_CONFIG_FILE_NAME);
      const contents = yield (_fsPromise || _load_fsPromise()).default.readFile(arcconfigFile, 'utf8');

      if (!(typeof contents === 'string')) {
        throw new Error('Invariant violation: "typeof contents === \'string\'"');
      }

      const result = JSON.parse(contents);
      arcProjectMap.set(arcConfigDirectory, result);
    }
    return arcProjectMap.get(arcConfigDirectory);
  });

  return function readArcConfig(_x2) {
    return _ref2.apply(this, arguments);
  };
})();

let findArcProjectIdOfPath = exports.findArcProjectIdOfPath = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (fileName) {
    const project = yield readArcConfig(fileName);
    return project ? project.project_id : null;
  });

  return function findArcProjectIdOfPath(_x3) {
    return _ref3.apply(this, arguments);
  };
})();

let findArcProjectIdAndDirectory = exports.findArcProjectIdAndDirectory = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (fileName) {
    const directory = yield findArcConfigDirectory(fileName);
    if (directory != null) {
      // This will hit the directory map cache.
      const projectId = yield findArcProjectIdOfPath(fileName);

      if (!(projectId != null)) {
        throw new Error('Invariant violation: "projectId != null"');
      }

      return { projectId, directory };
    }
    return null;
  });

  return function findArcProjectIdAndDirectory(_x4) {
    return _ref4.apply(this, arguments);
  };
})();

let getProjectRelativePath = exports.getProjectRelativePath = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* (fileName) {
    const arcPath = yield findArcConfigDirectory(fileName);
    return arcPath && fileName ? (_nuclideUri || _load_nuclideUri()).default.relative(arcPath, fileName) : null;
  });

  return function getProjectRelativePath(_x5) {
    return _ref5.apply(this, arguments);
  };
})();

let getMercurialHeadCommitChanges = (() => {
  var _ref6 = (0, _asyncToGenerator.default)(function* (filePath) {
    const hgRepoDetails = (0, (_nuclideSourceControlHelpers || _load_nuclideSourceControlHelpers()).findHgRepository)(filePath);
    if (hgRepoDetails == null) {
      return null;
    }
    const filesChanged = yield (0, (_hgRevisionStateHelpers || _load_hgRevisionStateHelpers()).fetchFilesChangedAtRevision)((0, (_hgRevisionExpressionHelpers || _load_hgRevisionExpressionHelpers()).expressionForRevisionsBeforeHead)(0), hgRepoDetails.workingDirectoryPath).refCount().toPromise();
    if (filesChanged == null) {
      throw new Error('Failed to fetch commit changed files while diffing');
    }
    return filesChanged;
  });

  return function getMercurialHeadCommitChanges(_x6) {
    return _ref6.apply(this, arguments);
  };
})();

let getCommitBasedArcConfigDirectory = (() => {
  var _ref7 = (0, _asyncToGenerator.default)(function* (filePath) {
    // TODO Support other source control types file changes (e.g. `git`).
    const filesChanged = yield getMercurialHeadCommitChanges(filePath);
    if (filesChanged == null) {
      throw new Error('Cannot find source control root to diff from');
    }
    let configLookupPath = null;
    if (filesChanged.all.length > 0) {
      configLookupPath = (_fsPromise || _load_fsPromise()).default.getCommonAncestorDirectory(filesChanged.all);
    } else {
      configLookupPath = filePath;
    }
    return yield findArcConfigDirectory(configLookupPath);
  });

  return function getCommitBasedArcConfigDirectory(_x7) {
    return _ref7.apply(this, arguments);
  };
})();

exports.findDiagnostics = findDiagnostics;
exports.createPhabricatorRevision = createPhabricatorRevision;
exports.updatePhabricatorRevision = updatePhabricatorRevision;
exports.execArcPull = execArcPull;
exports.execArcLand = execArcLand;
exports.execArcPatch = execArcPatch;

var _hgUtils;

function _load_hgUtils() {
  return _hgUtils = require('../../nuclide-hg-rpc/lib/hg-utils');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _process;

function _load_process() {
  return _process = require('../../commons-node/process');
}

var _nice;

function _load_nice() {
  return _nice = require('../../commons-node/nice');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

var _hgRevisionStateHelpers;

function _load_hgRevisionStateHelpers() {
  return _hgRevisionStateHelpers = require('../../nuclide-hg-rpc/lib/hg-revision-state-helpers');
}

var _hgRevisionExpressionHelpers;

function _load_hgRevisionExpressionHelpers() {
  return _hgRevisionExpressionHelpers = require('../../nuclide-hg-rpc/lib/hg-revision-expression-helpers');
}

var _nuclideSourceControlHelpers;

function _load_nuclideSourceControlHelpers() {
  return _nuclideSourceControlHelpers = require('../../nuclide-source-control-helpers');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ARC_CONFIG_FILE_NAME = '.arcconfig';

const arcConfigDirectoryMap = new Map();
const arcProjectMap = new Map();

function findDiagnostics(path, skip) {
  return _rxjsBundlesRxMinJs.Observable.fromPromise(findArcConfigDirectory(path)).switchMap(arcDir => {
    if (arcDir == null) {
      return _rxjsBundlesRxMinJs.Observable.empty();
    }
    return execArcLint(arcDir, [path], skip);
  }).publish();
}

function getArcExecOptions(cwd, hgEditor) {
  const options = {
    cwd,
    env: Object.assign({}, (0, (_process || _load_process()).getOriginalEnvironment)(), {
      ATOM_BACKUP_EDITOR: 'false'
    })
  };

  if (hgEditor != null) {
    options.env.HGEDITOR = hgEditor;
  }

  return options;
}

function _callArcDiff(filePath, extraArcDiffArgs) {
  const args = ['diff', '--json'].concat(extraArcDiffArgs);

  return _rxjsBundlesRxMinJs.Observable.fromPromise(getCommitBasedArcConfigDirectory(filePath)).flatMap(arcConfigDir => {
    if (arcConfigDir == null) {
      throw new Error('Failed to find Arcanist config.  Is this project set up for Arcanist?');
    }
    return (0, (_process || _load_process()).scriptSafeSpawnAndObserveOutput)('arc', args, getArcExecOptions(arcConfigDir));
  }).share();
}

function getArcDiffParams(lintExcuse, isPrepareMode = false) {
  const args = [];
  if (isPrepareMode) {
    args.push('--prepare');
  }

  if (lintExcuse != null) {
    args.push('--nolint', '--excuse', lintExcuse);
  }

  return args;
}

function createPhabricatorRevision(filePath, isPrepareMode, lintExcuse) {
  const args = ['--verbatim', ...getArcDiffParams(lintExcuse, isPrepareMode)];
  return _callArcDiff(filePath, args).publish();
}

function updatePhabricatorRevision(filePath, message, allowUntracked, lintExcuse) {
  const args = ['-m', message, ...getArcDiffParams(lintExcuse)];
  if (allowUntracked) {
    args.push('--allow-untracked');
  }
  return _callArcDiff(filePath, args).publish();
}

function execArcPull(cwd, fetchLatest, allowDirtyChanges) {
  return _rxjsBundlesRxMinJs.Observable.fromPromise((0, (_hgUtils || _load_hgUtils()).getEditMergeConfigs)()).switchMap(editMergeConfigs => {
    const args = ['pull'];
    if (fetchLatest) {
      args.push('--latest');
    }

    if (allowDirtyChanges) {
      args.push('--allow-dirty');
    }

    return (0, (_process || _load_process()).observeProcess)(() => (0, (_process || _load_process()).safeSpawn)('arc', args, getArcExecOptions(cwd, editMergeConfigs.hgEditor)));
  }).publish();
}

function execArcLand(cwd) {
  const args = ['land'];
  return (0, (_process || _load_process()).observeProcess)(() => (0, (_process || _load_process()).safeSpawn)('arc', args, getArcExecOptions(cwd))).publish();
}

function execArcPatch(cwd, differentialRevision) {
  const args = ['patch', differentialRevision];
  return (0, (_process || _load_process()).observeProcess)(() => (0, (_process || _load_process()).safeSpawn)('arc', args, getArcExecOptions(cwd))).publish();
}

function execArcLint(cwd, filePaths, skip) {
  const args = ['lint', '--output', 'json', ...filePaths];
  if (skip.length > 0) {
    args.push('--skip', skip.join(','));
  }
  return _rxjsBundlesRxMinJs.Observable.fromPromise((0, (_nice || _load_nice()).niceSafeSpawn)('arc', args, getArcExecOptions(cwd))).switchMap(arcProcess => (0, (_process || _load_process()).getOutputStream)(arcProcess, /* killTreeOnComplete */true)).mergeMap(event => {
    if (event.kind === 'error') {
      return _rxjsBundlesRxMinJs.Observable.throw(event.error);
    } else if (event.kind === 'exit') {
      if (event.exitCode !== 0) {
        return _rxjsBundlesRxMinJs.Observable.throw(Error((0, (_process || _load_process()).exitEventToMessage)(event)));
      }
      return _rxjsBundlesRxMinJs.Observable.empty();
    } else if (event.kind === 'stderr') {
      return _rxjsBundlesRxMinJs.Observable.empty();
    }
    // Arc lint outputs multiple JSON objects on multiple lines.
    const stdout = event.data.trim();
    if (stdout === '') {
      return _rxjsBundlesRxMinJs.Observable.empty();
    }
    let json;
    try {
      json = JSON.parse(stdout);
    } catch (error) {
      (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().warn('Error parsing `arc lint` JSON output', stdout);
      return _rxjsBundlesRxMinJs.Observable.empty();
    }
    const output = new Map();
    for (const file of Object.keys(json)) {
      const errorsToAdd = json[file];
      let errors = output.get(file);
      if (errors == null) {
        errors = [];
        output.set(file, errors);
      }
      for (const error of errorsToAdd) {
        errors.push(error);
      }
    }

    const lints = [];
    for (const file of filePaths) {
      // TODO(7876450): For some reason, this does not work for particular
      // values of pathToFile. Depending on the location of .arcconfig, we may
      // get a key that is different from what `arc lint` actually returns,
      // and end up without any lints for this path.
      const key = (_nuclideUri || _load_nuclideUri()).default.relative(cwd, file);
      const rawLints = output.get(key);
      if (rawLints) {
        for (const lint of convertLints(file, rawLints)) {
          lints.push(lint);
        }
      }
    }
    return _rxjsBundlesRxMinJs.Observable.from(lints);
  });
}

function convertLints(pathToFile, lints) {
  return lints.map(lint => {
    // Choose an appropriate level based on lint['severity'].
    const severity = lint.severity;
    const level = severity === 'error' ? 'Error' : 'Warning';

    const line = lint.line;
    // Sometimes the linter puts in global errors on line 0, which will result
    // in a negative index. We offset those back to the first line.
    const col = Math.max(0, lint.char - 1);
    const row = Math.max(0, line - 1);

    const diagnostic = {
      type: level,
      text: lint.description,
      filePath: pathToFile,
      row,
      col,
      code: lint.code
    };
    if (lint.original != null) {
      diagnostic.original = lint.original;
    }
    if (lint.replacement != null) {
      diagnostic.replacement = lint.replacement;
    }
    return diagnostic;
  });
}

const __TEST__ = exports.__TEST__ = {
  arcConfigDirectoryMap,
  arcProjectMap,
  reset() {
    arcConfigDirectoryMap.clear();
    arcProjectMap.clear();
  }
};