'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mapAtomLanguageIdToVsCode = mapAtomLanguageIdToVsCode;
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

const languageIdMap = {
  'source.c': 'c',
  'source.clojure': 'clojure',
  'source.coffee': 'coffeescript',
  'source.litcoffee': 'coffeescript',
  'source.cpp': 'cpp',
  'source.cake': 'csharp',
  'source.cs': 'csharp',
  'source.csx': 'csharp',
  'source.css.styled': 'css',
  'source.css': 'css',
  'text.git-commit': 'git-commit',
  'text.git-rebase': 'git-rebase',
  'source.go': 'go',
  'source.graphql': 'graphql',
  'source.hackfragment': 'hack',
  'text.html.hack': 'hack',
  'annotation.liquidhaskell.haskell': 'haskell',
  'hint.haskell': 'haskell',
  'hint.message.haskell': 'haskell',
  'hint.type.haskell': 'haskell',
  'source.c2hs': 'haskell',
  'source.cabal': 'haskell',
  'source.haskell': 'haskell',
  'source.hs.lhs': 'haskell',
  'source.hs.y': 'haskell',
  'source.hs': 'haskell',
  'source.hsc2hs': 'haskell',
  'source.hsig': 'haskell',
  'text.tex.latex.haskell': 'haskell',
  'text.html.basic': 'html',
  'source.infer.al': 'infer',
  'source.ini': 'ini',
  'source.java-properties': 'java',
  'source.java': 'java',
  'source.js.rails source.js.jquery': 'javascript',
  'source.js.regexp.replacement': 'javascript',
  'source.js.regexp': 'javascript',
  'source.js': 'javascript',
  'source.jsdoc': 'javascript',
  'source.js.jsx': 'javascriptreact',
  'source.json': 'json',
  'source.css.less': 'less',
  'source.lua': 'lua',
  'source.makefile': 'makefile',
  'source.gfm': 'markdown',
  'source.objc': 'objective-c',
  'source.objcpp': 'objective-cpp',
  'source.camlp4.ocaml': 'ocaml',
  'source.menhir': 'ocaml',
  'source.ocaml': 'ocaml',
  'source.ocamllex': 'ocaml',
  'text.ocaml.toplevel': 'ocaml',
  'source.perl': 'perl',
  'source.perl6': 'perl6',
  'text.html.php': 'php',
  'source.python': 'python',
  'text.python.console': 'python',
  'text.python.traceback': 'python',
  'source.reason.hover.type': 'reason',
  'source.reason': 'reason',
  'source.ruby.gemfile': 'ruby',
  'source.ruby.rails.rjs': 'ruby',
  'source.ruby.rails': 'ruby',
  'source.ruby': 'ruby',
  'source.sql.ruby': 'ruby',
  'source.rust': 'rust',
  'source.sass': 'sass',
  'source.scala': 'scala',
  'source.css.scss': 'scss',
  'source.shell': 'shellscript',
  'source.skip': 'skip',
  'source.sql': 'sql',
  'source.swift': 'swift',
  'source.thrift': 'thrift',
  'source.ts': 'typescript',
  'source.tsx': 'typescriptreact',
  'text.xml': 'xml',
  'text.xml.xsl': 'xsl',
  'source.yaml': 'yaml'
};

function mapAtomLanguageIdToVsCode(atomLanguageId) {
  return languageIdMap[atomLanguageId];
}