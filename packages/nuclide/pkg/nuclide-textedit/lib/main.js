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
exports.default = applyTextEdits;

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('../../commons-atom/text-editor');
}

/**
 * Attempts to apply the given patches to the given file.
 *
 * For best results, the edits should be non-overlapping and in order. That is, for every edit
 * provided, the start of its range should be after the end of the previous edit's range.
 *
 * The file must be currently open in Atom, and the changes will be applied to the buffer but not
 * saved.
 *
 * Returns true if the application was successful, otherwise false (e.g. if the oldText did not
 * match).
 */
function applyTextEdits(path, ...edits) {
  const editor = (0, (_textEditor || _load_textEditor()).existingEditorForUri)(path);

  if (!(editor != null)) {
    throw new Error('Invariant violation: "editor != null"');
  }

  const buffer = editor.getBuffer();
  const checkpoint = buffer.createCheckpoint();

  // Iterate through in reverse order. Edits earlier in the file can move around text later in the
  // file, so to avoid conflicts edits should be applied last first.
  for (let i = edits.length - 1; i >= 0; i--) {
    const edit = edits[i];
    const success = applyToBuffer(buffer, edit);
    if (!success) {
      buffer.revertToCheckpoint(checkpoint);
      return false;
    }
  }

  buffer.groupChangesSinceCheckpoint(checkpoint);
  return true;
}

function applyToBuffer(buffer, edit) {
  if (edit.oldRange.start.row === edit.oldRange.end.row) {
    // A little extra validation when the old range spans only one line. In particular, this helps
    // when the old range is empty so there is no old text for us to compare against. We can at
    // least abort if the line isn't long enough.
    const lineLength = buffer.lineLengthForRow(edit.oldRange.start.row);
    if (edit.oldRange.end.column > lineLength) {
      return false;
    }
  }
  if (edit.oldText != null) {
    const currentText = buffer.getTextInRange(edit.oldRange);
    if (currentText !== edit.oldText) {
      return false;
    }
  }
  buffer.setTextInRange(edit.oldRange, edit.newText);
  return true;
}
module.exports = exports['default'];