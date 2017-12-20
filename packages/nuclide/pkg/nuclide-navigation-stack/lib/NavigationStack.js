'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NavigationStack = undefined;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

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

const MAX_STACK_DEPTH = 100;

// Provides a navigation stack abstraction, useful for going forward/backwards
// while browsing code.
//
// Stack entries include the file (as uri for closed files and as
// atom$TextEditor for open files) as well as the cursor position and scroll.
// openEditor/closeEditor converts entries to/from editor/uri locations.
// Note that closeEditor may remove entries if the editor being closed does not
// have a path (aka has not been saved).
//
// New entries can be pushed on the stack. The stack maintains a current location which
// may be any element in the stack, not just the top. Pushing new elements is done relative to the
// current location not relative to the top of the stack. Pushing removes any
// elements above the current location before pushing the new element.
//
// The current location can be updated with next/previous which return non-null
// if the current location has been updated, or null of current is already at the
// top/bottom of the stack.
//
// The buffer position and scroll top of the current location can also be
// updated in place with attemptUpdate. If the editor of the new location matches
// the current location, then the current location is updated, otherwise a new
// entry is pushed.
//
// filter can be used to remove entries from the stack. This is done when
// closing unnamed editors and when closing remote directories.
class NavigationStack {

  constructor() {
    this._elements = [];
    this._index = -1;
    this._changes = new _rxjsBundlesRxMinJs.Subject();
  }

  observeChanges() {
    return this._changes;
  }

  isEmpty() {
    return this._elements.length === 0;
  }

  hasCurrent() {
    return !this.isEmpty();
  }

  getCurrent() {
    if (!(this._index >= 0 && this._index < this._elements.length)) {
      throw new Error('Invariant violation: "this._index >= 0 && this._index < this._elements.length"');
    }

    return this._elements[this._index];
  }

  getCurrentEditor() {
    if (!this.hasCurrent()) {
      return null;
    }
    const location = this.getCurrent();
    return location.type === 'editor' ? location.editor : null;
  }

  // Removes any elements below current, then pushes newTop onto the stack.
  push(newTop) {
    this._elements.splice(this._index + 1);
    this._elements.push(newTop);

    if (this._elements.length > MAX_STACK_DEPTH) {
      this._elements.splice(0, 1);
    }

    if (!(this._elements.length <= MAX_STACK_DEPTH)) {
      throw new Error('Invariant violation: "this._elements.length <= MAX_STACK_DEPTH"');
    }

    this._index = this._elements.length - 1;
    this._hasChanged();
  }

  // Updates the current location if the editors match.
  // If the editors don't match then push a new top.
  attemptUpdate(newTop) {
    if (this.getCurrentEditor() === newTop.editor) {
      const current = this.getCurrent();
      current.bufferPosition = newTop.bufferPosition;
      current.scrollTop = newTop.scrollTop;
    } else {
      this.push(newTop);
    }
  }

  hasNext() {
    return this._index + 1 < this._elements.length;
  }

  hasPrevious() {
    return this._index > 0;
  }

  // Moves current to the previous entry.
  // Returns null if there is no previous entry.
  previous() {
    if (this.hasPrevious()) {
      this._index -= 1;
      const result = this.getCurrent();
      this._hasChanged();
      return result;
    } else {
      return null;
    }
  }

  // Moves to the next entry.
  // Returns null if already at the last entry.
  next() {
    if (!this.hasNext()) {
      return null;
    }

    this._index += 1;
    const result = this.getCurrent();
    this._hasChanged();
    return result;
  }

  // When opening a new editor, convert all Uri locations on the stack to editor
  // locations.
  editorOpened(editor) {
    const uri = editor.getPath();
    if (uri == null) {
      return;
    }

    this._elements.forEach((location, index) => {
      if (location.type === 'uri' && location.uri === uri) {
        this._elements[index] = {
          type: 'editor',
          editor,
          scrollTop: location.scrollTop,
          bufferPosition: location.bufferPosition
        };
      }
    });
  }

  // When closing editors, convert all locations for that editor to URI locations.
  editorClosed(editor) {
    const uri = editor.getPath();
    if (uri === '' || uri == null) {
      this.filter(location => location.type !== 'editor' || editor !== location.editor);
    } else {
      this._elements.forEach((location, index) => {
        if (location.type === 'editor' && editor === location.editor) {
          this._elements[index] = {
            type: 'uri',
            uri,
            scrollTop: location.scrollTop,
            bufferPosition: location.bufferPosition
          };
        }
      });
    }
  }

  // Removes all entries which do not match the predicate.
  filter(predicate) {
    const originalSize = this._elements.length;
    let newIndex = this._index;
    this._elements = this._elements.filter((location, index) => {
      const result = predicate(location);
      if (!result && index <= this._index) {
        newIndex -= 1;
      }
      return result;
    });
    this._index = Math.min(Math.max(newIndex, 0), this._elements.length - 1);
    if (originalSize !== this._elements.length) {
      this._hasChanged();
    }
  }

  _hasChanged() {
    this._changes.next(this);
  }

  // For testing ...
  getLocations() {
    return this._elements;
  }

  getIndex() {
    return this._index;
  }
}
exports.NavigationStack = NavigationStack;