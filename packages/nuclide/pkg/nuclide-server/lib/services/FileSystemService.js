'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * This code implements the NuclideFs service.  It exports the FS on http via
 * the endpoint: http://your.server:your_port/fs/method where method is one of
 * readFile, writeFile, etc.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.writeFile = exports.readFile = exports.rmdirAll = exports.copy = exports.move = exports.readdir = exports.newFile = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/**
 * If no file (or directory) at the specified path exists, creates the parent
 * directories (if necessary) and then writes an empty file at the specified
 * path.
 *
 * @return A boolean indicating whether the file was created.
 */
let newFile = exports.newFile = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (filePath) {
    const isExistingFile = yield (_fsPromise || _load_fsPromise()).default.exists(filePath);
    if (isExistingFile) {
      return false;
    }
    yield (_fsPromise || _load_fsPromise()).default.mkdirp((_nuclideUri || _load_nuclideUri()).default.dirname(filePath));
    yield (_fsPromise || _load_fsPromise()).default.writeFile(filePath, '');
    return true;
  });

  return function newFile(_x) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * The readdir endpoint accepts the following query parameters:
 *
 *   path: path to the folder to list entries inside.
 *
 * Body contains a JSON encoded array of objects with file: and stats: entries.
 * file: has the file or directory name, stats: has the stats of the file/dir,
 * isSymbolicLink: true if the entry is a symlink to another filesystem location.
 */


let readdir = exports.readdir = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (path) {
    const files = yield (_fsPromise || _load_fsPromise()).default.readdir(path);
    const entries = yield Promise.all(files.map((() => {
      var _ref3 = (0, _asyncToGenerator.default)(function* (file) {
        const fullpath = (_nuclideUri || _load_nuclideUri()).default.join(path, file);
        const lstats = yield (_fsPromise || _load_fsPromise()).default.lstat(fullpath);
        if (!lstats.isSymbolicLink()) {
          return { file, stats: lstats, isSymbolicLink: false };
        } else {
          try {
            const stats = yield (_fsPromise || _load_fsPromise()).default.stat(fullpath);
            return { file, stats, isSymbolicLink: true };
          } catch (error) {
            return null;
          }
        }
      });

      return function (_x3) {
        return _ref3.apply(this, arguments);
      };
    })()));
    // TODO: Return entries directly and change client to handle error.
    return (0, (_collection || _load_collection()).arrayCompact)(entries).map(function (entry) {
      return { file: entry.file, stats: entry.stats, isSymbolicLink: entry.isSymbolicLink };
    });
  });

  return function readdir(_x2) {
    return _ref2.apply(this, arguments);
  };
})();

/**
 * Gets the real path of a file path.
 * It could be different than the given path if the file is a symlink
 * or exists in a symlinked directory.
 */


/**
 * Moves all sourcePaths into the specified destDir, assumed to be a directory name.
 */
let move = exports.move = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (sourcePaths, destDir) {
    yield Promise.all(sourcePaths.map(function (path) {
      const destPath = (_nuclideUri || _load_nuclideUri()).default.join(destDir, (_nuclideUri || _load_nuclideUri()).default.basename(path));
      return (_fsPromise || _load_fsPromise()).default.move(path, destPath);
    }));
  });

  return function move(_x4, _x5) {
    return _ref4.apply(this, arguments);
  };
})();

/**
 * Runs the equivalent of `cp sourcePath destinationPath`.
 * @return true if the operation was successful; false if it wasn't.
 */


let copy = exports.copy = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* (sourcePath, destinationPath) {
    const isExistingFile = yield (_fsPromise || _load_fsPromise()).default.exists(destinationPath);
    if (isExistingFile) {
      return false;
    }
    yield (_fsPromise || _load_fsPromise()).default.copy(sourcePath, destinationPath);
    yield copyFilePermissions(sourcePath, destinationPath);
    return true;
  });

  return function copy(_x6, _x7) {
    return _ref5.apply(this, arguments);
  };
})();

/**
 * Removes directories even if they are non-empty. Does not fail if the directory doesn't exist.
 */


let rmdirAll = exports.rmdirAll = (() => {
  var _ref6 = (0, _asyncToGenerator.default)(function* (paths) {
    yield Promise.all(paths.map(function (p) {
      return (_fsPromise || _load_fsPromise()).default.rmdir(p);
    }));
  });

  return function rmdirAll(_x8) {
    return _ref6.apply(this, arguments);
  };
})();

/**
 * The stat endpoint accepts the following query parameters:
 *
 *   path: path to the file to read
 *
 * It returns a JSON encoded stats object that looks something like this:
 *
 * { dev: 2114,
 *  ino: 48064969,
 *  mode: 33188,
 *  nlink: 1,
 *  uid: 85,
 *  gid: 100,
 *  rdev: 0,
 *  size: 527,
 *  blksize: 4096,
 *  blocks: 8,
 *  atime: 'Mon, 10 Oct 2011 23:24:11 GMT',
 *  mtime: 'Mon, 10 Oct 2011 23:24:11 GMT',
 *  ctime: 'Mon, 10 Oct 2011 23:24:11 GMT',
 *  birthtime: 'Mon, 10 Oct 2011 23:24:11 GMT'
 * }
 *
 */


/**
 *   path: the path to the file to read
 *   options: options to pass to fs.readFile.
 *      Note that options does NOT include 'encoding' this ensures that the return value
 *      is always a Buffer and never a string.
 *
 *   Callers who want a string should call buffer.toString('utf8').
 */
let readFile = exports.readFile = (() => {
  var _ref7 = (0, _asyncToGenerator.default)(function* (path, options) {
    const stats = yield (_fsPromise || _load_fsPromise()).default.stat(path);
    if (stats.size > READFILE_SIZE_LIMIT) {
      throw new Error(`File is too large (${ stats.size } bytes)`);
    }
    return (_fsPromise || _load_fsPromise()).default.readFile(path, options);
  });

  return function readFile(_x9, _x10) {
    return _ref7.apply(this, arguments);
  };
})();

/**
 * Returns true if the path being checked exists in a `NFS` mounted directory device.
 */


let copyFilePermissions = (() => {
  var _ref8 = (0, _asyncToGenerator.default)(function* (sourcePath, destinationPath) {
    let permissions = null;
    try {
      permissions = (yield (_fsPromise || _load_fsPromise()).default.stat(sourcePath)).mode;
    } catch (e) {
      // If the file does not exist, then ENOENT will be thrown.
      if (e.code !== 'ENOENT') {
        throw e;
      }
    }
    if (permissions != null) {
      yield (_fsPromise || _load_fsPromise()).default.chmod(destinationPath, permissions);
    }
  });

  return function copyFilePermissions(_x11, _x12) {
    return _ref8.apply(this, arguments);
  };
})();

/**
 * The writeFile endpoint accepts the following query parameters:
 *
 *   path: path to the file to read (it must be url encoded).
 *   data: file contents to write.
 *   options: options to pass to fs.writeFile
 *
 * TODO: move to nuclide-commons and rename to writeFileAtomic
 */


let writeFile = exports.writeFile = (() => {
  var _ref9 = (0, _asyncToGenerator.default)(function* (path, data, options) {

    let complete = false;
    const tempFilePath = yield (_fsPromise || _load_fsPromise()).default.tempfile('nuclide');
    try {
      yield (_fsPromise || _load_fsPromise()).default.writeFile(tempFilePath, data, options);

      // Ensure file still has original permissions:
      // https://github.com/facebook/nuclide/issues/157
      // We update the mode of the temp file rather than the destination file because
      // if we did the mv() then the chmod(), there would be a brief period between
      // those two operations where the destination file might have the wrong permissions.
      yield copyFilePermissions(path, tempFilePath);

      // TODO(mikeo): put renames into a queue so we don't write older save over new save.
      // Use mv as fs.rename doesn't work across partitions.
      yield mvPromise(tempFilePath, path);
      complete = true;
    } finally {
      if (!complete) {
        yield (_fsPromise || _load_fsPromise()).default.unlink(tempFilePath);
      }
    }
  });

  return function writeFile(_x13, _x14, _x15) {
    return _ref9.apply(this, arguments);
  };
})();

exports.exists = exists;
exports.findNearestFile = findNearestFile;
exports.lstat = lstat;
exports.mkdir = mkdir;
exports.mkdirp = mkdirp;
exports.chmod = chmod;
exports.realpath = realpath;
exports.resolveRealPath = resolveRealPath;
exports.rename = rename;
exports.rmdir = rmdir;
exports.stat = stat;
exports.unlink = unlink;
exports.isNfs = isNfs;

var _mv;

function _load_mv() {
  return _mv = _interopRequireDefault(require('mv'));
}

var _fs = _interopRequireDefault(require('fs'));

var _collection;

function _load_collection() {
  return _collection = require('../../../commons-node/collection');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../commons-node/nuclideUri'));
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../commons-node/fsPromise'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Attempting to read large files just crashes node, so just fail.
// Atom can't handle files of this scale anyway.
const READFILE_SIZE_LIMIT = 10 * 1024 * 1024;

//------------------------------------------------------------------------------
// Services
//------------------------------------------------------------------------------

/**
 * Checks a certain path for existence and returns 'true'/'false' accordingly
 */
function exists(path) {
  return (_fsPromise || _load_fsPromise()).default.exists(path);
}

function findNearestFile(fileName, pathToDirectory) {
  return (_fsPromise || _load_fsPromise()).default.findNearestFile(fileName, pathToDirectory);
}

/**
 * The lstat endpoint is the same as the stat endpoint except it will return
 * the stat of a link instead of the file the link points to.
 */
function lstat(path) {
  return (_fsPromise || _load_fsPromise()).default.lstat(path);
}

/**
 * Creates a new directory with the given path.
 * Throws EEXIST error if the directory already exists.
 * Throws ENOENT if the path given is nested in a non-existing directory.
 */
function mkdir(path) {
  return (_fsPromise || _load_fsPromise()).default.mkdir(path);
}

/**
 * Runs the equivalent of `mkdir -p` with the given path.
 *
 * Like most implementations of mkdirp, if it fails, it is possible that
 * directories were created for some prefix of the given path.
 * @return true if the path was created; false if it already existed.
 */
function mkdirp(path) {
  return (_fsPromise || _load_fsPromise()).default.mkdirp(path);
}

/**
 * Changes permissions on a file.
 */
function chmod(path, mode) {
  return (_fsPromise || _load_fsPromise()).default.chmod(path, mode);
}function realpath(path) {
  return (_fsPromise || _load_fsPromise()).default.realpath(path);
}

/**
 * Gets the real path of a file path, while expanding tilda paths and symlinks
 * like: ~/abc to its absolute path format.
 */
function resolveRealPath(path) {
  return (_fsPromise || _load_fsPromise()).default.realpath((_nuclideUri || _load_nuclideUri()).default.expandHomeDir(path));
}

/**
 * Runs the equivalent of `mv sourcePath destinationPath`.
 */
function rename(sourcePath, destinationPath) {
  return (_fsPromise || _load_fsPromise()).default.move(sourcePath, destinationPath);
}function rmdir(path) {
  return (_fsPromise || _load_fsPromise()).default.rmdir(path);
}

function stat(path) {
  return (_fsPromise || _load_fsPromise()).default.stat(path);
}

/**
 * Removes files. Does not fail if the file doesn't exist.
 */
function unlink(path) {
  return (_fsPromise || _load_fsPromise()).default.unlink(path).catch(error => {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  });
}function isNfs(path) {
  return (_fsPromise || _load_fsPromise()).default.isNfs(path);
}

// TODO: Move to nuclide-commons
function mvPromise(sourcePath, destinationPath) {
  return new Promise((resolve, reject) => {
    (0, (_mv || _load_mv()).default)(sourcePath, destinationPath, { mkdirp: false }, error => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}