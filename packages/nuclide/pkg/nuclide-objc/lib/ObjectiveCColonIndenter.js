'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _atom = require('atom');

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _observeLanguageTextEditors;

function _load_observeLanguageTextEditors() {
  return _observeLanguageTextEditors = _interopRequireDefault(require('../../commons-atom/observe-language-text-editors'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

const GRAMMARS = ['source.objc', 'source.objcpp'];

// The indentation amount depends on previous lines. If the user types a colon outside of a method
// call, it searches the entire buffer. This hard cutoff should work for sane code.
const NUMBER_OF_PREVIOUS_LINES_TO_SEARCH_FOR_COLONS = 25;

/**
 * This provides improved Objective-C indentation by aligning colons.
 * Clients must call `disable()` once they're done with an instance.
 */
class ObjectiveCColonIndenter {

  enable() {
    if (this._subscriptions) {
      return;
    }
    this._insertTextSubscriptionsMap = new Map();

    const subscriptions = this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    subscriptions.add({
      dispose: () => {
        this._insertTextSubscriptionsMap.forEach(subscription => subscription.dispose());
        this._insertTextSubscriptionsMap.clear();
      }
    });

    subscriptions.add((0, (_observeLanguageTextEditors || _load_observeLanguageTextEditors()).default)(GRAMMARS, textEditor => this._enableInTextEditor(textEditor), textEditor => this._disableInTextEditor(textEditor)));
  }

  disable() {
    if (this._subscriptions) {
      this._subscriptions.dispose();
      this._subscriptions = null;
    }
  }

  _enableInTextEditor(textEditor) {
    this._insertTextSubscriptionsMap.set(textEditor, textEditor.onDidInsertText(event => {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('objc:indent-colon', () => {
        const { range, text } = event;

        // Ignore the inserted text if the user is typing in a string or comment.
        //
        // The scope descriptor marks the text with semantic information,
        // generally used for syntax highlighting.
        const isNonCodeText = textEditor.scopeDescriptorForBufferPosition(range.start).getScopesArray().some(scope => scope.startsWith('string') || scope.startsWith('comment'));
        if (text !== ':' || isNonCodeText) {
          return;
        }

        const buffer = textEditor.getBuffer();

        const currentColonPosition = range.start;
        const colonColumn = ObjectiveCColonIndenter.getIndentedColonColumn(buffer, currentColonPosition);
        // flowlint-next-line sketchy-null-number:off
        if (!colonColumn) {
          return;
        }

        // Fully replace the current line with the properly-indented line.
        //
        // 1. Get the current line and strip all the indentation.
        const line = buffer.lineForRow(currentColonPosition.row);
        const unindentedLine = line.trimLeft();
        // 2. Calculate the amount of indentation the line should end up with.
        const numberOfIndentCharacters = line.length - unindentedLine.length;
        const unindentedCurrentColonColumn = currentColonPosition.column - numberOfIndentCharacters;
        const totalIndentAmount = unindentedCurrentColonColumn >= colonColumn ? 0 : colonColumn - unindentedCurrentColonColumn;
        // 3. Replace the current line with the properly-indented line.
        textEditor.setTextInBufferRange(buffer.rangeForRow(currentColonPosition.row,
        /* includeNewline */false), ' '.repeat(totalIndentAmount) + unindentedLine);

        // Move the cursor to right after the inserted colon.
        const newCursorPosition = [currentColonPosition.row, totalIndentAmount + unindentedCurrentColonColumn + 1];
        textEditor.setCursorBufferPosition(newCursorPosition);
        textEditor.scrollToBufferPosition(newCursorPosition);
      });
    }));
  }

  _disableInTextEditor(textEditor) {
    const subscription = this._insertTextSubscriptionsMap.get(textEditor);
    if (subscription) {
      subscription.dispose();
      this._insertTextSubscriptionsMap.delete(textEditor);
    }
  }

  /**
   * Return the column of the colon to align with, or null if it doesn't exist.
   */
  static getIndentedColonColumn(buffer, startPosition) {
    // Look for the first colon after the start of the current method.
    //
    // The general approach is to iterate backwards, checking key characters.
    // We keep track of the last colon that we see (i.e. the colon that is
    // closest to the beginning of the document) and terminate once we've
    // reached the start of the method.
    //
    // This doesn't work if there are strings/comments that contain `:`.
    let column = null;
    let numberOfUnclosedBrackets = 0;
    buffer.backwardsScanInRange(
    // Only stop at the key characters: `:[]+-`.
    /:|\[|]|\+|-/g, _atom.Range.fromObject([startPosition.translate([-NUMBER_OF_PREVIOUS_LINES_TO_SEARCH_FOR_COLONS, 0]), startPosition.translate([0, -1])]), ({ match, matchText, range, stop }) => {
      const position = range.start;
      // If we find a key character on the starting line, then the user is
      // typing a single-line method (it doesn't need to be indented).
      const isSingleLineMethod = position.row === startPosition.row;
      // `+` or `-` means we've reached the start of a method declaration.
      const isDeclaration = matchText === '+' || matchText === '-';
      if (isSingleLineMethod || isDeclaration) {
        stop();
        return;
      }

      // Unbalanced brackets mean we've reached the start of a method call.
      if (matchText === '[') {
        numberOfUnclosedBrackets--;
      } else if (matchText === ']') {
        numberOfUnclosedBrackets++;
      }
      if (numberOfUnclosedBrackets === -1) {
        stop();
        return;
      }

      // Keep track of the last colon that we see.
      if (matchText === ':') {
        ({ column } = position);
      }
    });
    return column;
  }
}
exports.default = ObjectiveCColonIndenter;