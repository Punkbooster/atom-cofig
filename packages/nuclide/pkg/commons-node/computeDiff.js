'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.computeDiff = computeDiff;

var _diff;

function _load_diff() {
  return _diff = require('diff');
}

function computeDiff(oldText, newText) {
  const { addedLines, removedLines, chunks } = _computeDiffChunks(oldText, newText);
  const { oldLineOffsets, newLineOffsets } = _computeOffsets(chunks);
  const { oldToNew, newToOld } = _computeLineDiffMapping(chunks);

  return {
    addedLines,
    removedLines,
    oldLineOffsets: Array.from(oldLineOffsets), // serialize for JSON.
    newLineOffsets: Array.from(newLineOffsets), // serialize for JSON.
    oldToNew,
    newToOld
  };
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

function _computeDiffChunks(oldText_, newText_) {
  let oldText = oldText_;
  let newText = newText_;

  // If the last line has changes, JsDiff doesn't return that.
  // Generally, content with new line ending are easier to calculate offsets for.
  if (oldText[oldText.length - 1] !== '\n' || newText[newText.length - 1] !== '\n') {
    oldText += '\n';
    newText += '\n';
  }

  const lineDiff = (0, (_diff || _load_diff()).diffLines)(oldText, newText);
  const chunks = [];

  let addedCount = 0;
  let removedCount = 0;
  let nextOffset = 0;
  let offset = 0;

  const addedLines = [];
  const removedLines = [];
  lineDiff.forEach(part => {
    const { added, removed, value } = part;
    const count = value.split('\n').length - 1;
    if (!added && !removed) {
      addedCount += count;
      removedCount += count;
      offset = nextOffset;
      nextOffset = 0;
    } else if (added) {
      for (let i = 0; i < count; i++) {
        addedLines.push(addedCount + i);
      }
      addedCount += count;
      nextOffset += count;
    } else {
      for (let i = 0; i < count; i++) {
        removedLines.push(removedCount + i);
      }
      removedCount += count;
      nextOffset -= count;
    }
    chunks.push({ added, removed, value, count, offset });
    offset = 0;
  });
  if (nextOffset !== 0) {
    // Add a trailing offset block at the end of the shorter file.
    chunks.push({
      added: 0,
      removed: 0,
      value: '',
      count: 0,
      offset: nextOffset
    });
  }
  return { addedLines, removedLines, chunks };
}

function _computeOffsets(diffChunks) {
  const newLineOffsets = new Map();
  const oldLineOffsets = new Map();

  let oldLineCount = 0;
  let newLineCount = 0;

  for (const chunk of diffChunks) {
    const { added, removed, offset, count } = chunk;
    if (added) {
      newLineCount += count;
    } else if (removed) {
      oldLineCount += count;
    } else {
      if (offset < 0) {
        // Non zero offset implies this block is neither a removal or an addition,
        // and is thus equal in both versions of the document.
        // Sign of offset indicates which version of document requires the offset
        // (negative -> old version, positive -> new version).
        // Magnitude of offset indicates the number of offset lines required for version.
        newLineOffsets.set(newLineCount, offset * -1);
      } else if (offset > 0) {
        oldLineOffsets.set(oldLineCount, offset);
      }
      newLineCount += count;
      oldLineCount += count;
    }
  }

  return {
    oldLineOffsets,
    newLineOffsets
  };
}

function _computeLineDiffMapping(diffChunks) {
  const newToOld = [];
  const oldToNew = [];

  let oldLineCount = 0;
  let newLineCount = 0;

  // Used to track the changed sections.
  let addedCount = 0;
  let removedCount = 0;

  for (const chunk of diffChunks) {
    const { added, removed, offset, count } = chunk;
    if (added) {
      addedCount = count;
    } else if (removed) {
      removedCount = count;
    } else {
      if (addedCount > 0 && removedCount > 0) {
        // There's a changed section.
        const changedCount = Math.min(addedCount, removedCount);
        for (let i = 0; i < changedCount; i++) {
          oldToNew.push(newLineCount + i);
          newToOld.push(oldLineCount + i);
        }
      }
      newLineCount += addedCount;
      oldLineCount += removedCount;
      if (offset < 0) {
        for (let i = offset; i < 0; i++) {
          oldToNew.push(newLineCount);
        }
      } else if (offset > 0) {
        for (let i = 0; i < offset; i++) {
          newToOld.push(oldLineCount);
        }
      }
      for (let i = 0; i < count; i++) {
        newToOld.push(oldLineCount);
        oldToNew.push(newLineCount);
        newLineCount++;
        oldLineCount++;
      }
      addedCount = 0;
      removedCount = 0;
    }
  }

  // Add two line number mapping for `after` decorations.
  newToOld.push(newLineCount++);
  newToOld.push(newLineCount);

  oldToNew.push(oldLineCount++);
  oldToNew.push(oldLineCount);

  return {
    newToOld,
    oldToNew
  };
}