'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.tokenizeGenericText = tokenizeGenericText;


const SIMPLE_BREAKS = ['<', '>', '(', ')', '[', ']', ',', ' ', ':', '*', '&'];

/**
 * This tokenizes a given text without any special symbol handling. Words become
 * tokens and special characters are handled accordingly.
 */
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

function tokenizeGenericText(text) {
  const tokens = [];
  let curToken = '';
  for (let i = 0; i < text.length; i++) {
    if (SIMPLE_BREAKS.includes(text[i])) {
      if (curToken.length > 0) {
        tokens.push({ text: curToken, isBreak: false });
        curToken = '';
      }
      tokens.push({ text: text[i], isBreak: true });
    } else {
      curToken += text[i];
    }
  }
  if (curToken.length > 0) {
    tokens.push({ text: curToken, isBreak: false });
  }
  return tokens;
}