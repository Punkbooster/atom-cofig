/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

export type {WorkingSetsStore} from './WorkingSetsStore';

export type WorkingSetDefinition = {
  name: string,
  active: boolean,
  uris: Array<string>,
};
