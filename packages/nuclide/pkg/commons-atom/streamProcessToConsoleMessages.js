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
exports.dispatchConsoleToggle = dispatchConsoleToggle;
exports.pipeProcessMessagesToConsole = pipeProcessMessagesToConsole;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function dispatchConsoleToggle(visible) {
  atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-console:toggle', { visible });
}function pipeProcessMessagesToConsole(processName, progressUpdates, processMessage) {
  switch (processMessage.kind) {
    case 'stderr':
      progressUpdates.next({ text: processMessage.data, level: 'error' });
      break;

    case 'stdout':
      progressUpdates.next({ text: processMessage.data, level: 'info' });
      break;

    case 'error':
      const { error } = processMessage;
      progressUpdates.next({ text: error.message || String(error), level: 'error' });
      break;

    case 'exit':
      if (processMessage.exitCode === 0) {
        // TODO(asriram) t13831340 Check if console was initially open, if yes then dont close here
        progressUpdates.next({ text: `${ processName } completed successfully`, level: 'success' });
        atom.notifications.addSuccess('Operation completed successfully', {
          detail: `${ processName } finished`
        });
      } else {
        // Keep console open
        progressUpdates.next({ text: `${ processName } exited with non zero code`, level: 'error' });
        atom.notifications.addError('Smartlog Operation Failed', {
          detail: 'Check console for output'
        });
      }
      break;
  }
}