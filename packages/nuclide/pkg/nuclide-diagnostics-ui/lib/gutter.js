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
exports.applyUpdateToEditor = applyUpdateToEditor;

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('../../commons-atom/go-to-location');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _DiagnosticsPopup;

function _load_DiagnosticsPopup() {
  return _DiagnosticsPopup = require('./DiagnosticsPopup');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const GUTTER_ID = 'nuclide-diagnostics-gutter';

// Needs to be the same as glyph-height in gutter.atom-text-editor.less.
const GLYPH_HEIGHT = 15; // px

const POPUP_DISPOSE_TIMEOUT = 100;

// TODO(mbolin): Make it so that when mousing over an element with this CSS class (or specifically,
// the child element with the "region" CSS class), we also do a showPopupFor(). This seems to be
// tricky given how the DOM of a TextEditor works today. There are div.tile elements, each of which
// has its own div.highlights element and many div.line elements. The div.highlights element has 0
// or more children, each child being a div.highlight with a child div.region. The div.region
// element is defined to be {position: absolute; pointer-events: none; z-index: -1}. The absolute
// positioning and negative z-index make it so it isn't eligible for mouseover events, so we
// might have to listen for mouseover events on TextEditor and then use its own APIs, such as
// decorationsForScreenRowRange(), to see if there is a hit target instead. Since this will be
// happening onmousemove, we also have to be careful to make sure this is not expensive.
const HIGHLIGHT_CSS = 'nuclide-diagnostics-gutter-ui-highlight';

const ERROR_HIGHLIGHT_CSS = 'nuclide-diagnostics-gutter-ui-highlight-error';
const WARNING_HIGHLIGHT_CSS = 'nuclide-diagnostics-gutter-ui-highlight-warning';

const ERROR_GUTTER_CSS = 'nuclide-diagnostics-gutter-ui-gutter-error';
const WARNING_GUTTER_CSS = 'nuclide-diagnostics-gutter-ui-gutter-warning';

const editorToMarkers = new WeakMap();
const itemToEditor = new WeakMap();

function applyUpdateToEditor(editor, update, fixer) {
  let gutter = editor.gutterWithName(GUTTER_ID);
  if (!gutter) {
    // TODO(jessicalin): Determine an appropriate priority so that the gutter:
    // (1) Shows up to the right of the line numbers.
    // (2) Shows the items that are added to it right away.
    // Using a value of 10 fixes (1), but breaks (2). This seems like it is likely a bug in Atom.

    // By default, a gutter will be destroyed when its editor is destroyed,
    // so there is no need to register a callback via onDidDestroy().
    gutter = editor.addGutter({
      name: GUTTER_ID,
      visible: false,
      // Priority is -200 by default and 0 is the line number
      priority: -1000
    });
  }

  let marker;
  let markers = editorToMarkers.get(editor);

  // TODO: Consider a more efficient strategy that does not blindly destroy all of the
  // existing markers.
  if (markers) {
    for (marker of markers) {
      marker.destroy();
    }
    markers.clear();
  } else {
    markers = new Set();
  }

  const rowToMessage = new Map();
  function addMessageForRow(message, row) {
    let messages = rowToMessage.get(row);
    if (!messages) {
      messages = [];
      rowToMessage.set(row, messages);
    }
    messages.push(message);
  }

  for (const message of update.messages) {
    const range = message.range;

    const highlightCssClass = (0, (_classnames || _load_classnames()).default)(HIGHLIGHT_CSS, message.type === 'Error' ? ERROR_HIGHLIGHT_CSS : WARNING_HIGHLIGHT_CSS);

    let highlightMarker;
    if (range) {
      addMessageForRow(message, range.start.row);

      // There is no API in Atom to say: I want to put an underline on all the
      // lines in this range. The closest is "highlight" which splits your range
      // into three boxes: the part of the first line, all the lines in between
      // and the part of the last line.
      //
      // This means that some lines in the middle are going to be dropped and
      // they are going to extend all the way to the right of the buffer.
      //
      // To fix this, we can manually split it line by line and give to atom
      // those ranges.
      for (let line = range.start.row; line <= range.end.row; line++) {
        let start;
        let end;
        const lineText = editor.getTextInBufferRange(new _atom.Range([line, 0], [line + 1, 0]));

        if (line === range.start.row) {
          start = range.start.column;
        } else {
          start = (lineText.match(/^\s*/) || [''])[0].length;
        }

        if (line === range.end.row) {
          end = range.end.column;
        } else {
          // Note: this is technically off by 1 (\n) or 2 (\r\n) but Atom will
          // not extend the range past the actual characters displayed on the
          // line
          end = lineText.length;
        }

        highlightMarker = editor.markBufferRange(new _atom.Range([line, start], [line, end]));
        editor.decorateMarker(highlightMarker, {
          type: 'highlight',
          class: highlightCssClass
        });
        markers.add(highlightMarker);
      }
    } else {
      addMessageForRow(message, 0);
    }
  }

  // Find all of the gutter markers for the same row and combine them into one marker/popup.
  for (const [row, messages] of rowToMessage.entries()) {
    // If at least one of the diagnostics is an error rather than the warning,
    // display the glyph in the gutter to represent an error rather than a warning.
    const gutterMarkerCssClass = messages.some(msg => msg.type === 'Error') ? ERROR_GUTTER_CSS : WARNING_GUTTER_CSS;

    // This marker adds some UI to the gutter.
    const { item, dispose } = createGutterItem(messages, gutterMarkerCssClass, fixer);
    itemToEditor.set(item, editor);
    const gutterMarker = editor.markBufferPosition([row, 0]);
    gutter.decorateMarker(gutterMarker, { item });
    gutterMarker.onDidDestroy(dispose);
    markers.add(gutterMarker);
  }

  editorToMarkers.set(editor, markers);

  // Once the gutter is shown for the first time, it is displayed for the lifetime of the
  // TextEditor.
  if (update.messages.length > 0) {
    gutter.show();
  }
}

function createGutterItem(messages, gutterMarkerCssClass, fixer) {
  const item = window.document.createElement('a');
  item.className = gutterMarkerCssClass;
  let popupElement = null;
  let paneItemSubscription = null;
  let disposeTimeout = null;
  const clearDisposeTimeout = () => {
    if (disposeTimeout) {
      clearTimeout(disposeTimeout);
    }
  };
  const dispose = () => {
    if (popupElement) {
      _reactForAtom.ReactDOM.unmountComponentAtNode(popupElement);

      if (!(popupElement.parentNode != null)) {
        throw new Error('Invariant violation: "popupElement.parentNode != null"');
      }

      popupElement.parentNode.removeChild(popupElement);
      popupElement = null;
    }
    if (paneItemSubscription) {
      paneItemSubscription.dispose();
      paneItemSubscription = null;
    }
    clearDisposeTimeout();
  };
  const goToLocation = (path, line) => {
    // Before we jump to the location, we want to close the popup.
    dispose();
    const column = 0;
    (0, (_goToLocation || _load_goToLocation()).goToLocation)(path, line, column);
  };
  item.addEventListener('mouseenter', event => {
    // If there was somehow another popup for this gutter item, dispose it. This can happen if the
    // user manages to scroll and escape disposal.
    dispose();
    popupElement = showPopupFor(messages, item, goToLocation, fixer);
    popupElement.addEventListener('mouseleave', dispose);
    popupElement.addEventListener('mouseenter', clearDisposeTimeout);
    // This makes sure that the popup disappears when you ctrl+tab to switch tabs.
    paneItemSubscription = atom.workspace.onDidChangeActivePaneItem(dispose);
  });
  item.addEventListener('mouseleave', event => {
    // When the popup is shown, we want to dispose it if the user manages to move the cursor off of
    // the gutter glyph without moving it onto the popup. Even though the popup appears above (as in
    // Z-index above) the gutter glyph, if you move the cursor such that it is only above the glyph
    // for one frame you can cause the popup to appear without the mouse ever entering it.
    disposeTimeout = setTimeout(dispose, POPUP_DISPOSE_TIMEOUT);
  });
  return { item, dispose };
}

/**
 * Shows a popup for the diagnostic just below the specified item.
 */
function showPopupFor(messages, item, goToLocation, fixer) {
  // The popup will be an absolutely positioned child element of <atom-workspace> so that it appears
  // on top of everything.
  const workspaceElement = atom.views.getView(atom.workspace);
  const hostElement = window.document.createElement('div');
  // $FlowFixMe check parentNode for null
  workspaceElement.parentNode.appendChild(hostElement);

  // Move it down vertically so it does not end up under the mouse pointer.
  const { top, left } = item.getBoundingClientRect();

  const trackedFixer = (...args) => {
    fixer(...args);
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diagnostics-gutter-autofix');
  };
  const trackedGoToLocation = (filePath, line) => {
    goToLocation(filePath, line);
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diagnostics-gutter-goto-location');
  };

  _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement((_DiagnosticsPopup || _load_DiagnosticsPopup()).DiagnosticsPopup, {
    left: left,
    top: top,
    messages: messages,
    fixer: trackedFixer,
    goToLocation: trackedGoToLocation
  }), hostElement);
  // Check to see whether the popup is within the bounds of the TextEditor. If not, display it above
  // the glyph rather than below it.
  const editor = itemToEditor.get(item);
  const editorElement = atom.views.getView(editor);
  const { top: editorTop, height: editorHeight } = editorElement.getBoundingClientRect();
  const { top: itemTop, height: itemHeight } = item.getBoundingClientRect();
  const popupHeight = hostElement.firstElementChild.clientHeight;
  if (itemTop + itemHeight + popupHeight > editorTop + editorHeight) {
    const popupElement = hostElement.firstElementChild;
    // Shift the popup back down by GLYPH_HEIGHT, so that the bottom padding overlaps with the
    // glyph. An additional 4 px is needed to make it look the same way it does when it shows up
    // below. I don't know why.
    popupElement.style.top = String(itemTop - popupHeight + GLYPH_HEIGHT + 4) + 'px';
  }

  try {
    return hostElement;
  } finally {
    messages.forEach(message => {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diagnostics-gutter-show-popup', {
        'diagnostics-provider': message.providerName,
        'diagnostics-message': message.text || message.html || ''
      });
    });
  }
}