/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

export type CodeHighlightProvider = {
  highlight(
    editor: atom$TextEditor,
    bufferPosition: atom$Point,
  ): Promise<Array<atom$Range>>,
  inclusionPriority: number,
  selector: string,
};
