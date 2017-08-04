'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _ContextMenu;

function _load_ContextMenu() {
  return _ContextMenu = _interopRequireDefault(require('../../commons-atom/ContextMenu'));
}

var _atom = require('atom');

var _FileTreeConstants;

function _load_FileTreeConstants() {
  return _FileTreeConstants = require('./FileTreeConstants');
}

var _FileTreeStore;

function _load_FileTreeStore() {
  return _FileTreeStore = require('./FileTreeStore');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// It's just atom$ContextMenuItem with an optional `callback` property added.
// I wish flow would let add it in a more elegant way.
const FILE_TREE_CSS = '.nuclide-file-tree';

const NEW_MENU_PRIORITY = 0;
const ADD_PROJECT_MENU_PRIORITY = 1000;
const SOURCE_CONTROL_MENU_PRIORITY = 2000;
const MODIFY_FILE_MENU_PRIORITY = 3000;
const SPLIT_MENU_PRIORITY = 4000;
const TEST_SECTION_PRIORITY = 5000;
const SHOW_IN_MENU_PRIORITY = 6000;

/**
 * This context menu wrapper exists to address some of the limitations in the ContextMenuManager:
 * https://atom.io/docs/api/latest/ContextMenuManager.
 *
 * Specifically, a context menu item would often like to know which file (or directory) the user
 * right-clicked on in the file tree when selecting the menu item. The fundamental problem is that
 * the way a menu item is notified that it was selected is that the Atom command associated with
 * the item is fired. By the time the function associated with the command is called, the state
 * with which the menu item was created is lost. Here we introduce a pattern where the callback
 * registered with the command can get the selection via the FileTreeContextMenu:
 * ```
 * // Subscribe to the nuclide-file-tree.context-menu service by ensuring the package.json for your
 * // Atom package contains the following stanza:
 * "consumedServices": {
 *   "nuclide-file-tree.context-menu": {
 *     "versions": {
 *       "0.1.0": "addItemsToFileTreeContextMenu"
 *     }
 *   }
 * },
 *
 * // Include the following in the main.js file for your package:
 * import {CompositeDisposable, Disposable} from 'atom';
 * import invariant from 'assert';
 *
 * let subscriptions: ?CompositeDisposable = null;
 *
 * export function activate(state: ?Object): void {
 *   subscriptions = new CompositeDisposable();
 * }
 *
 * export function deactivate(): void {
 *   if (subscriptions != null) {
 *     subscriptions.dispose();
 *     subscriptions = null;
 *   }
 * }
 *
 * export function addItemsToFileTreeContextMenu(contextMenu: FileTreeContextMenu): IDisposable {
 *   invariant(subscriptions);
 *
 *   const contextDisposable = contextMenu.addItemToSourceControlMenu(
 *     {
 *       label: 'Label for the menu item that acts on a file',
 *       command: 'command-that-should-only-be-fired-from-the-context-menu',
 *       // If the callback below is given a new atom command with the given name will be
 *       // automatically registered. You can omit it if you prefer to register the command
 *       // manually.
 *       callback() {
 *         Array.from(contextMenu.getSelectedNodes())
 *           .filter(node => !node.isContainer)
 *           .forEach((node: FileTreeNode) => {
 *             const uri = node.uri;
 *             // DO WHAT YOU LIKE WITH THE URI!
 *           });
 *       },
 *       shouldDisplay() {
 *         return Array.from(contextMenu.getSelectedNodes()).some(node => !node.isContainer);
 *       },
 *     },
 *     1000, // priority
 *   );
 *
 *   subscriptions.add(contextDisposable);
 *   return new Disposable(() => {
 *     invariant(subscriptions);
 *     if (subscriptions != null) {
 *       subscriptions.remove(contextDisposable);
 *     }
 *   });
 * }
 * ```
 */
class FileTreeContextMenu {

  constructor() {
    this._contextMenu = new (_ContextMenu || _load_ContextMenu()).default({
      type: 'root',
      cssSelector: (_FileTreeConstants || _load_FileTreeConstants()).EVENT_HANDLER_SELECTOR
    });
    this._subscriptions = new _atom.CompositeDisposable();
    this._store = (_FileTreeStore || _load_FileTreeStore()).FileTreeStore.getInstance();

    const shouldDisplaySetToCurrentWorkingRootOption = () => {
      const node = this._store.getSingleSelectedNode();
      return node != null && node.isContainer && this._store.hasCwd() && !node.isCwd;
    };

    this._addContextMenuItemGroup([{
      label: 'Set to Current Working Root',
      command: 'nuclide-file-tree:set-current-working-root',
      shouldDisplay: shouldDisplaySetToCurrentWorkingRootOption
    }, {
      type: 'separator',
      shouldDisplay: shouldDisplaySetToCurrentWorkingRootOption
    }, {
      label: 'New',
      shouldDisplay: () => {
        return this._store.getSingleSelectedNode() != null;
      },
      submenu: [{
        label: 'File',
        command: 'nuclide-file-tree:add-file'
      }, {
        label: 'Folder',
        command: 'nuclide-file-tree:add-folder'
      }]
    }], NEW_MENU_PRIORITY);

    this._addContextMenuItemGroup([{
      label: 'Add Project Folder',
      command: 'application:add-project-folder'
    }, {
      label: 'Add Remote Project Folder',
      command: 'nuclide-remote-projects:connect'
    }, {
      label: 'Remove Project Folder',
      command: 'nuclide-file-tree:remove-project-folder-selection',
      shouldDisplay: () => {
        const node = this.getSingleSelectedNode();
        return node != null && node.isRoot;
      }
    }], ADD_PROJECT_MENU_PRIORITY);

    this._sourceControlMenu = new (_ContextMenu || _load_ContextMenu()).default({
      type: 'submenu',
      label: 'Source Control',
      parent: this._contextMenu,
      shouldDisplay: e => {
        return !this._sourceControlMenu.isEmpty() && !this._store.getSelectedNodes().isEmpty();
      }
    });
    this._contextMenu.addSubmenu(this._sourceControlMenu, SOURCE_CONTROL_MENU_PRIORITY);
    this._contextMenu.addItem({
      type: 'separator',
      shouldDisplay: e => !this._sourceControlMenu.isEmpty()
    }, SOURCE_CONTROL_MENU_PRIORITY + 1);

    this._addContextMenuItemGroup([{
      label: 'Rename',
      command: 'nuclide-file-tree:rename-selection',
      shouldDisplay: () => {
        const node = this._store.getSingleSelectedNode();
        // For now, rename does not apply to root nodes.
        return node != null && !node.isRoot;
      }
    }, {
      label: 'Duplicate',
      command: 'nuclide-file-tree:duplicate-selection',
      shouldDisplay: () => {
        const node = this.getSingleSelectedNode();
        return node != null && !node.isContainer;
      }
    }, {
      label: 'Delete',
      command: 'nuclide-file-tree:remove',
      shouldDisplay: () => {
        const nodes = this.getSelectedNodes();
        // We can delete multiple nodes as long as no root node is selected
        return nodes.size > 0 && nodes.every(node => node != null && !node.isRoot);
      }
    }], MODIFY_FILE_MENU_PRIORITY);

    this._addContextMenuItemGroup([{
      label: 'Split',
      shouldDisplay: () => {
        const node = this.getSingleSelectedNode();
        return node != null && !node.isContainer;
      },
      submenu: [{
        label: 'Up',
        command: 'nuclide-file-tree:open-selected-entry-up'
      }, {
        label: 'Down',
        command: 'nuclide-file-tree:open-selected-entry-down'
      }, {
        label: 'Left',
        command: 'nuclide-file-tree:open-selected-entry-left'
      }, {
        label: 'Right',
        command: 'nuclide-file-tree:open-selected-entry-right'
      }]
    }], SPLIT_MENU_PRIORITY);

    this._addContextMenuItemGroup([{
      label: 'Copy Full Path',
      command: 'nuclide-file-tree:copy-full-path',
      shouldDisplay: () => {
        const node = this.getSingleSelectedNode();
        return node != null;
      }
    }, {
      label: 'Show in Finder', // Mac OS X
      command: 'nuclide-file-tree:show-in-file-manager',
      shouldDisplay: this._shouldDisplayShowInFileManager.bind(this, 'darwin')
    }, {
      label: 'Show in Explorer', // Windows
      command: 'nuclide-file-tree:show-in-file-manager',
      shouldDisplay: this._shouldDisplayShowInFileManager.bind(this, 'win32')
    }, {
      label: 'Show in File Manager', // Linux
      command: 'nuclide-file-tree:show-in-file-manager',
      shouldDisplay: this._shouldDisplayShowInFileManager.bind(this, 'linux')
    }, {
      label: 'Search in Directory',
      command: 'nuclide-file-tree:search-in-directory',
      shouldDisplay: () => {
        const nodes = this.getSelectedNodes();
        return nodes.size > 0 && nodes.every(node => node.isContainer);
      }
    }], SHOW_IN_MENU_PRIORITY);
  }

  /**
   * @param priority must be an integer in the range [0, 1000).
   */
  addItemToTestSection(originalItem, priority) {
    if (priority < 0 || priority >= 1000) {
      throw Error(`Illegal priority value: ${ priority }`);
    }

    return this._addItemToMenu(originalItem, this._contextMenu, TEST_SECTION_PRIORITY + priority);
  }

  addItemToSourceControlMenu(originalItem, priority) {
    return this._addItemToMenu(originalItem, this._sourceControlMenu, priority);
  }

  _addItemToMenu(originalItem, menu, priority) {
    const { itemDisposable, item } = initCommandIfPresent(originalItem);
    itemDisposable.add(menu.addItem(item, priority));

    this._subscriptions.add(itemDisposable);
    return new _atom.Disposable(() => {
      this._subscriptions.remove(itemDisposable);
      itemDisposable.dispose();
    });
  }

  getSelectedNodes() {
    return this._store.getSelectedNodes();
  }

  getSingleSelectedNode() {
    return this._store.getSingleSelectedNode();
  }

  dispose() {
    this._subscriptions.dispose();
  }

  _addContextMenuItemGroup(menuItems, priority_) {
    let priority = priority_;
    // Atom is smart about only displaying a separator when there are items to
    // separate, so there will never be a dangling separator at the end.
    // $FlowFixMe: The conversion between MenuItemDefinition and atom$ContextMenuItem is a mess.
    const allItems = menuItems.concat([{ type: 'separator' }]);
    allItems.forEach(item => {
      this._contextMenu.addItem(item, ++priority);
    });
  }

  /**
   * @return A {boolean} whether the "Show in File Manager" context menu item should be displayed
   * for the current selection and the given `platform`.
   */
  _shouldDisplayShowInFileManager(platform) {
    const node = this.getSingleSelectedNode();
    return node != null && (_nuclideUri || _load_nuclideUri()).default.isAbsolute(node.uri) && process.platform === platform;
  }
}

function initCommandIfPresent(item) {
  const itemDisposable = new _atom.CompositeDisposable();
  if (typeof item.callback === 'function' && item.label != null) {
    const command = item.command || generateNextInternalCommand(item.label);
    itemDisposable.add(atom.commands.add(FILE_TREE_CSS, command, item.callback));
    return { itemDisposable, item: Object.assign({}, item, { command }) };
  }

  return { itemDisposable, item };
}

let nextInternalCommandId = 0;

function generateNextInternalCommand(itemLabel) {
  const cmdName = itemLabel.toLowerCase().replace(/[^\w]+/g, '-') + '-' + nextInternalCommandId++;
  return `nuclide-file-tree:${ cmdName }`;
}

module.exports = FileTreeContextMenu;