/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

export type DeepLinkParams = {[key: string]: string | Array<string>};

export type DeepLinkService = {

  /**
   * Subscribes to all links of the form atom://nuclide/path?a=x,b=y,...
   * Trailing slashes will be stripped off the path.
   * Query parameters will be parsed and provided to the callback.
   */
  subscribeToPath(
    path: string,
    callback: (params: DeepLinkParams) => mixed,
  ): IDisposable,

};
