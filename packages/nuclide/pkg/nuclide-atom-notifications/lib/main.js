'use strict';

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _marked;

function _load_marked() {
  return _marked = _interopRequireDefault(require('marked'));
}

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
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

class Activation {

  constructor() {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  consumeConsoleService(createConsole) {
    const consoleApi = createConsole({
      id: 'Atom',
      name: 'Atom'
    });
    const notificationDisposable = atom.notifications.onDidAddNotification(notification => {
      consoleApi.append({
        text: stripFormatting(notification.getMessage()),
        level: getLevel(notification.getType())
      });
    });
    this._disposables.add(consoleApi, notificationDisposable);
    return notificationDisposable;
  }

  dispose() {
    this._disposables.dispose();
  }
}

function getLevel(atomNotificationType) {
  switch (atomNotificationType) {
    case 'error':
    case 'fatal':
      return 'error';
    case 'info':
      return 'info';
    case 'warning':
      return 'warning';
    case 'success':
      return 'success';
    default:
      return 'log';
  }
}

let formattingDiv;
/**
 * Markdown and HTML can be used with Atom notifications, but not in the console. In order to strip
 * all of the formatting, we'll first compile the markdown, then use a DOM element to convert that
 * to raw text. This isn't the most performant way to strip the HTML, but it does handle `<br />`s
 * and stuff really easily and only happens once per notification so it's okay.
 */
function stripFormatting(raw) {
  const div = formattingDiv == null ? formattingDiv = document.createElement('div') : formattingDiv;
  div.innerHTML = (0, (_marked || _load_marked()).default)(raw);
  return div.innerText || '';
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);