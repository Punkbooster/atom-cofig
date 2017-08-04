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
exports.stringifyError = stringifyError;
exports.maybeToString = maybeToString;
exports.relativeDate = relativeDate;
exports.countOccurrences = countOccurrences;
exports.shellParse = shellParse;
exports.removeCommonPrefix = removeCommonPrefix;
exports.removeCommonSuffix = removeCommonSuffix;

var _shellQuote;

function _load_shellQuote() {
  return _shellQuote = require('shell-quote');
}

function stringifyError(error) {
  return `name: ${ error.name }, message: ${ error.message }, stack: ${ error.stack }.`;
}

// As of Flow v0.28, Flow does not alllow implicit string coercion of null or undefined. Use this to
// make it explicit.
function maybeToString(str) {
  // We don't want to encourage the use of this function directly because it coerces anything to a
  // string. We get stricter typechecking by using maybeToString, so it should generally be
  // preferred.
  return String(str);
}

/**
 * Originally adapted from https://github.com/azer/relative-date.
 * We're including it because of https://github.com/npm/npm/issues/12012
 */
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const YEAR = DAY * 365;
const MONTH = YEAR / 12;

const shortFormats = [[0.7 * MINUTE, 'now'], [1.5 * MINUTE, '1m'], [60 * MINUTE, 'm', MINUTE], [1.5 * HOUR, '1h'], [DAY, 'h', HOUR], [2 * DAY, '1d'], [7 * DAY, 'd', DAY], [1.5 * WEEK, '1w'], [MONTH, 'w', WEEK], [1.5 * MONTH, '1mo'], [YEAR, 'mo', MONTH], [1.5 * YEAR, '1y'], [Number.MAX_VALUE, 'y', YEAR]];

const longFormats = [[0.7 * MINUTE, 'just now'], [1.5 * MINUTE, 'a minute ago'], [60 * MINUTE, 'minutes ago', MINUTE], [1.5 * HOUR, 'an hour ago'], [DAY, 'hours ago', HOUR], [2 * DAY, 'yesterday'], [7 * DAY, 'days ago', DAY], [1.5 * WEEK, 'a week ago'], [MONTH, 'weeks ago', WEEK], [1.5 * MONTH, 'a month ago'], [YEAR, 'months ago', MONTH], [1.5 * YEAR, 'a year ago'], [Number.MAX_VALUE, 'years ago', YEAR]];

function relativeDate(input_, reference_, useShortVariant = false) {
  let input = input_;
  let reference = reference_;
  if (input instanceof Date) {
    input = input.getTime();
  }
  if (!reference) {
    reference = new Date().getTime();
  }
  if (reference instanceof Date) {
    reference = reference.getTime();
  }

  const delta = reference - input;
  const formats = useShortVariant ? shortFormats : longFormats;
  for (const [limit, relativeFormat, remainder] of formats) {
    if (delta < limit) {
      if (typeof remainder === 'number') {
        return Math.round(delta / remainder) + (useShortVariant ? '' : ' ') + relativeFormat;
      } else {
        return relativeFormat;
      }
    }
  }

  throw new Error('This should never be reached.');
}

/**
 * Count the number of occurrences of `char` in `str`.
 * `char` must be a string of length 1.
 */
function countOccurrences(haystack, char) {
  if (!(char.length === 1)) {
    throw new Error('char must be a string of length 1');
  }

  let count = 0;
  const code = char.charCodeAt(0);
  for (let i = 0; i < haystack.length; i++) {
    if (haystack.charCodeAt(i) === code) {
      count++;
    }
  }
  return count;
}

/**
 * shell-quote's parse allows pipe operators.
 * Generally users don't care about this, so throw if we encounter any operators.
 */
function shellParse(str, env) {
  const result = (0, (_shellQuote || _load_shellQuote()).parse)(str, env);
  for (let i = 0; i < result.length; i++) {
    if (typeof result[i] !== 'string') {
      throw new Error(`Unexpected operator "${ result[i].op }" provided to shellParse`);
    }
  }
  return result;
}

function removeCommonPrefix(a, b) {
  let i = 0;
  while (a[i] === b[i] && i < a.length && i < b.length) {
    i++;
  }
  return [a.substring(i), b.substring(i)];
}

function removeCommonSuffix(a, b) {
  let i = 0;
  while (a[a.length - 1 - i] === b[b.length - 1 - i] && i < a.length && i < b.length) {
    i++;
  }
  return [a.substring(0, a.length - i), b.substring(0, b.length - i)];
}