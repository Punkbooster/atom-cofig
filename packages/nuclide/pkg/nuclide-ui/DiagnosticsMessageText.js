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
exports.DiagnosticsMessageText = undefined;
exports.separateUrls = separateUrls;

var _reactForAtom = require('react-for-atom');

var _electron = require('electron');

// Exported for testing.
function separateUrls(message) {
  // Don't match periods at the end of URLs, because those are usually just to
  // end the sentence and not actually part of the URL.
  const urlRegex = /https?:\/\/[a-zA-Z0-9/._-]*[a-zA-Z0-9/_-]/g;

  const urls = message.match(urlRegex);
  const nonUrls = message.split(urlRegex);

  const parts = [{
    isUrl: false,
    text: nonUrls[0]
  }];
  for (let i = 1; i < nonUrls.length; i++) {
    if (!(urls != null)) {
      throw new Error('Invariant violation: "urls != null"');
    }

    parts.push({
      isUrl: true,
      url: urls[i - 1]
    });
    parts.push({
      isUrl: false,
      text: nonUrls[i]
    });
  }
  return parts;
}

function renderTextWithLinks(message) {
  const parts = separateUrls(message).map((part, index) => {
    if (!part.isUrl) {
      return part.text;
    } else {
      const openUrl = () => {
        _electron.shell.openExternal(part.url);
      };
      return _reactForAtom.React.createElement(
        'a',
        { href: '#', key: index, onClick: openUrl },
        part.url
      );
    }
  });

  return _reactForAtom.React.createElement(
    'span',
    null,
    parts
  );
}

const DiagnosticsMessageText = exports.DiagnosticsMessageText = props => {
  const {
    message
  } = props;
  if (message.html != null) {
    return _reactForAtom.React.createElement('span', { dangerouslySetInnerHTML: { __html: message.html } });
  } else if (message.text != null) {
    return _reactForAtom.React.createElement(
      'span',
      null,
      renderTextWithLinks(message.text)
    );
  } else {
    return _reactForAtom.React.createElement(
      'span',
      null,
      'Diagnostic lacks message.'
    );
  }
};