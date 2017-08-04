/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

export type SwiftPMTaskRunnerStoreState = {
  chdir: string,
  configuration: string,
  buildPath: string,
  Xcc: string,
  Xlinker: string,
  Xswiftc: string,
  compileCommands: Object,
  testBuildPath: string,
};
