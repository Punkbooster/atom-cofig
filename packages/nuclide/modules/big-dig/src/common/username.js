'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getUsername = getUsername;
function getUsername() {
  // It is slightly more robust to get the uid and look it up in /etc/whateveritis.
  const { env } = process;
  // flowlint-next-line sketchy-null-string:off
  const username = env.LOGNAME || env.USER || env.LNAME || env.USERNAME;

  if (!username) {
    throw new Error('Invariant violation: "username"');
  }

  return username;
} /**
   * Copyright (c) 2017-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the BSD-style license found in the
   * LICENSE file in the root directory of this source tree. An additional grant
   * of patent rights can be found in the PATENTS file in the same directory.
   *
   * 
   * @format
   */