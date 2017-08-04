/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

/* eslint-disable no-unused-vars */

/**
 * The `uuid` generates RFC-compliant UUIDs in JavaScript. It has a more
 * extensive API than the one defined here, but this all we use from it.
 *
 * {@link https://github.com/broofa/node-uuid}
 */
declare module 'uuid' {
  declare function v4(): string;
}
