'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _atom = require('atom');

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _observeLanguageTextEditors;

function _load_observeLanguageTextEditors() {
  return _observeLanguageTextEditors = _interopRequireDefault(require('../../commons-atom/observe-language-text-editors'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const GRAMMARS = ['source.objc', 'source.objcpp'];

/**
 * This closes square brackets for Objective-C message calls.
 * Clients must call `disable()` once they're done with an instance.
 */
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

class ObjectiveCBracketBalancer {

  enable() {
    // The feature is already enabled.
    if (this._languageListener) {
      return;
    }

    this._editingSubscriptionsMap = new Map();
    this._languageListener = (0, (_observeLanguageTextEditors || _load_observeLanguageTextEditors()).default)(GRAMMARS, textEditor => this._enableInTextEditor(textEditor), textEditor => this._disableInTextEditor(textEditor));
  }

  disable() {
    // The feature is already disabled.
    if (!this._languageListener) {
      return;
    }
    this._languageListener.dispose();
    this._languageListener = null;

    this._editingSubscriptionsMap.forEach(subscription => subscription.dispose());
    this._editingSubscriptionsMap.clear();
  }

  _enableInTextEditor(textEditor) {
    const insertTextSubscription = textEditor.onDidInsertText(event => {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('objc:balance-bracket', () => {
        const { range, text } = event;
        if (text === ']') {
          const buffer = textEditor.getBuffer();
          const leftBracketInsertPosition = ObjectiveCBracketBalancer.getOpenBracketInsertPosition(buffer, range.start);
          if (leftBracketInsertPosition) {
            buffer.insert(leftBracketInsertPosition, '[');
          }
        }
      });
    });
    this._editingSubscriptionsMap.set(textEditor, insertTextSubscription);
  }

  _disableInTextEditor(textEditor) {
    const subscription = this._editingSubscriptionsMap.get(textEditor);
    if (subscription) {
      subscription.dispose();
      this._editingSubscriptionsMap.delete(textEditor);
    }
  }

  static getOpenBracketInsertPosition(buffer, closeBracketPosition) {
    const startingLine = buffer.lineForRow(closeBracketPosition.row);
    let singleQuoteCount = 0;
    let doubleQuoteCount = 0;
    const characterCount = {
      '[': 0,
      ']': 0
    };

    // Iterate through the line, determining if we have balanced brackets.
    // We do not count brackets we encounter inside string/char literals.
    for (let i = 0; i < startingLine.length; i++) {
      if (startingLine[i] === "'") {
        singleQuoteCount++;
      } else if (startingLine[i] === '"') {
        doubleQuoteCount++;
      } else {
        if (singleQuoteCount % 2 === 0 && doubleQuoteCount % 2 === 0) {
          // We are not inside a char nor string literal. Count the brackets.
          characterCount[startingLine[i]]++;
        }
      }
    }

    const stringLiteralMatch = /@".*"\s.*]/.exec(startingLine);
    if (stringLiteralMatch) {
      return _atom.Point.fromObject([closeBracketPosition.row, stringLiteralMatch.index]);
    } else if (characterCount['['] < characterCount[']']) {
      // Check if we're at the bottom of a multi-line method.
      const multiLineMethodRegex = /^[\s\w[]*:.*[^;{];?$/;
      let currentRow = closeBracketPosition.row;
      let currentRowPlusOne = null;
      let match = multiLineMethodRegex.exec(buffer.lineForRow(currentRow));

      // eslint-disable-next-line eqeqeq
      while (match !== null) {
        currentRowPlusOne = currentRow;
        match = multiLineMethodRegex.exec(buffer.lineForRow(--currentRow));
      }

      if (
      // eslint-disable-next-line eqeqeq
      currentRowPlusOne !== null && currentRowPlusOne !== closeBracketPosition.row) {
        const targetLine = buffer.lineForRow(currentRowPlusOne);
        const targetMatch = /\S/.exec(targetLine);

        if (targetLine[targetMatch.index] === '[') {
          return null;
        } else {
          return _atom.Point.fromObject([currentRowPlusOne, targetMatch.index]);
        }
      } else {
        // We need a bracket on this line - at this point it's either
        // At the beginning, or after an `=`.
        const initMatch = /.*(=\s?)\S/.exec(startingLine);
        const startOfLineMatch = /\S/.exec(startingLine);
        let column = 0;

        if (initMatch && initMatch[1]) {
          let equalsMatchPosition = startingLine.lastIndexOf(initMatch[1]);
          column = equalsMatchPosition += initMatch[1].length;
        } else if (startOfLineMatch && startOfLineMatch.index) {
          column = startOfLineMatch.index;
        } else {
          column = 0;
        }

        return _atom.Point.fromObject([closeBracketPosition.row, column]);
      }
    } else {
      return null;
    }
  }
}
exports.default = ObjectiveCBracketBalancer;