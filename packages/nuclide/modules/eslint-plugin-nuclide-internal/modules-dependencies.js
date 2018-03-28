/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @noflow
 */
'use strict';

/* eslint
  comma-dangle: [1, always-multiline],
  prefer-object-spread/prefer-object-spread: 0,
  rulesdir/no-commonjs: 0,
  */

const idx = require('idx');
const path = require('path');
const resolveFrom = require('resolve-from');

const {ATOM_BUILTIN_PACKAGES, getPackage, isRequire} = require('./utils');

const MODULES_DIR = path.join(__dirname, '..', '..', 'modules');
const ASYNC_TO_GENERATOR = 'async-to-generator';

module.exports = function(context) {
  const filename = context.getFilename();
  const relativePath = path.relative(MODULES_DIR, filename);
  if (relativePath[0] === '.') {
    return {};
  }

  const dirname = path.dirname(filename);
  const moduleName = relativePath.split(path.sep)[0];
  const moduleDir = path.join(MODULES_DIR, moduleName);
  const modulePkg = getPackage(moduleDir);
  const isSpec = filename.indexOf('/spec/') !== -1;
  const allowDevDependencies = isSpec || idx(
    context,
    _ => _.options[0].allowDevDependencies
  );

  function checkDependency(node, dep) {
    // Relative imports must be within the root.
    if (dep[0] === '.') {
      const depPath = path.join(dirname, dep);
      if (depPath !== moduleDir && !depPath.startsWith(moduleDir + path.sep)) {
        context.report({
          node,
          message: 'modules/ cannot have external relative dependencies.',
        });
      }
      return;
    }
    // Built-in modules.
    if (ATOM_BUILTIN_PACKAGES.has(dep) || resolveFrom(moduleDir, dep) === dep) {
      return;
    }

    if (dep === 'vscode') {
      if (!(modulePkg.engines instanceof Object) ||
          !modulePkg.engines.hasOwnProperty('vscode')) {
        context.report({
          node,
          message: 'If "vscode" is an import, must declare vscode in "engines." ',
        });
      }
      return;
    }

    const depName = dep.split('/')[0];
    if (
      !Object.hasOwnProperty.call(modulePkg.dependencies, depName) &&
      (!allowDevDependencies ||
        !Object.hasOwnProperty.call(modulePkg.devDependencies || {}, depName))
    ) {
      context.report({
        node,
        data: {dep: depName, pkg: modulePkg.name},
        message: 'Dependency "{{dep}}" must be declared in module "{{pkg}}".',
      });
    }
  }

  function checkAsyncToGenerator(node) {
    if (node.async) {
      checkDependency(node, ASYNC_TO_GENERATOR);
    }
  }

  return {
    ArrowFunctionExpression: checkAsyncToGenerator,
    CallExpression(node) {
      if (!isRequire(node)) {
        return;
      }
      // require("…")
      checkDependency(node, node.arguments[0].value);
    },
    ExportNamedDeclaration(node) {
      if (node.source != null) {
        // export foo from "…"
        checkDependency(node, node.source.value);
      }
    },
    ExportAllDeclaration(node) {
      // export * from "…"
      checkDependency(node, node.source.value);
    },
    FunctionDeclaration: checkAsyncToGenerator,
    FunctionExpression: checkAsyncToGenerator,
    ImportDeclaration(node) {
      // import foo from "…"
      checkDependency(node, node.source.value);
    },
  };
};
