'use strict';

var _util = _interopRequireDefault(require('util'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function layout(loggingEvent) {
  const eventInfo = _util.default.format('[%s] [%s] %s - ', loggingEvent.startTime.toISOString(), loggingEvent.level, loggingEvent.categoryName);

  const data = loggingEvent.data.slice();

  // Since console.log support string format as first parameter, we should preserve this behavior
  // by concating eventInfo with first parameter if it is string.
  if (data.length > 0 && typeof data[0] === 'string') {
    data[0] = eventInfo + data[0];
  } else {
    data.unshift(eventInfo);
  }

  // When logging an Error object, just print the message and the stack trace.
  // Since we attach other properties to the object like `stackTrace`, these
  // can be really noisy.
  for (let i = 0; i < data.length; i++) {
    if (data[i] instanceof Error) {
      // `stack` will often have `message` in its first line, but not always,
      // like in the case of remote errors.
      data[i] = data[i].message + '\n' + data[i].stack;
    }
  }

  return data;
}

/**
 * Comparing to log4js's console appender(https://fburl.com/69861669), you can expand and explore
 * the object in console logged by this Appender.
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

function consoleAppender() {
  return loggingEvent => {
    // eslint-disable-next-line no-console
    console.log(...layout(loggingEvent));
  };
}

// eslint-disable-next-line rulesdir/no-commonjs
module.exports = {
  appender: consoleAppender,
  configure: consoleAppender
};