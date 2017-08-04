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
 * Constants here represent enums with the same values got from hh_client.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

const HACK_GRAMMARS = exports.HACK_GRAMMARS = ['text.html.hack', 'text.html.php'];

const SearchResultType = exports.SearchResultType = Object.freeze({
  CLASS: 0,
  TYPEDEF: 1,
  METHOD: 2,
  CLASS_VAR: 3,
  FUNCTION: 4,
  CONSTANT: 5,
  INTERFACE: 6,
  ABSTRACT_CLASS: 7,
  TRAIT: 8
});