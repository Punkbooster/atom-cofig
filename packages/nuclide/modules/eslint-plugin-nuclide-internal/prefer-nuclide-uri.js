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

/**
 * This rule forbids the import of a native 'path' module.
 *
 * Why:
 *   Path module is platform dependent and does not support Nuclide's remote URIs
 *   Using it leads to all kinds of path related errors on Windows.
 *   nuclideUri, on the other hand can handle both platform dependent local paths and remote
 *   URIs correctly.
 */

module.exports = function(context) {
  return {
    ImportDeclaration(node) {
      if (node.source.value === 'path' &&
        node.importKind !== 'type' &&
        node.importKind !== 'typeof'
      ) {
        context.report({
          node,
          message: 'path module is not to be used. Use nuclide-commons/nuclideUri instead',
        });
      }
    },
  };
};
