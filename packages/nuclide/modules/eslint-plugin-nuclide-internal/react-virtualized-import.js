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

module.exports = function(context) {
  return {
    ImportDeclaration(node) {
      if (node.source.value !== 'react-virtualized') {
        return;
      }

      node.specifiers
        .filter(n => n.type === 'ImportSpecifier')
        .forEach(specifier => {
          const name = specifier.imported.name;
          context.report({
            node,
            message: "Do not import from 'react-virtualized' for performance" +
              ` reasons. Import 'react-virtualized/dist/commonjs/${name}'` +
              ' instead.',
          });
        });
    },
  };
};
