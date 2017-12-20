'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.config = undefined;
exports.activate = activate;
exports.deactivate = deactivate;
exports.serialize = serialize;

require('./preload-dependencies');

var _FeatureLoader;

function _load_FeatureLoader() {
  return _FeatureLoader = _interopRequireDefault(require('nuclide-commons-atom/FeatureLoader'));
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _fs = _interopRequireDefault(require('fs'));

var _electron = _interopRequireDefault(require('electron'));

var _path = _interopRequireDefault(require('path'));

var _atom = require('atom');

var _atomPackageDeps;

function _load_atomPackageDeps() {
  return _atomPackageDeps = require('atom-package-deps');
}

var _installErrorReporter;

function _load_installErrorReporter() {
  return _installErrorReporter = _interopRequireDefault(require('./installErrorReporter'));
}

var _patchEditors;

function _load_patchEditors() {
  return _patchEditors = _interopRequireDefault(require('./patchEditors'));
}

var _package;

function _load_package() {
  return _package = _interopRequireDefault(require('../package.json'));
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../pkg/nuclide-logging');
}

var _serviceManager;

function _load_serviceManager() {
  return _serviceManager = require('../pkg/nuclide-remote-connection/lib/service-manager');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Install the error reporting even before Nuclide is activated.

// eslint-disable-next-line nuclide-internal/prefer-nuclide-uri
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

/**
 *                  _  _ _  _ ____ _    _ ___  ____
 *                  |\ | |  | |    |    | |  \ |___
 *                  | \| |__| |___ |___ | |__/ |___
 * _  _ _  _ _ ____ _ ____ ___     ___  ____ ____ _  _ ____ ____ ____
 * |  | |\ | | |___ | |___ |  \    |__] |__| |    |_/  |__| | __ |___
 * |__| | \| | |    | |___ |__/    |    |  | |___ | \_ |  | |__] |___
 *
 */

let errorReporterDisposable = (0, (_installErrorReporter || _load_installErrorReporter()).default)();
// Install the logger config before Nuclide is activated.
(0, (_nuclideLogging || _load_nuclideLogging()).initializeLogging)();

// Patch Text editors to try to eliminate memory leaks.
(0, (_patchEditors || _load_patchEditors()).default)();

const { remote } = _electron.default;

if (!(remote != null)) {
  throw new Error('Invariant violation: "remote != null"');
}

const baseConfig = {
  installRecommendedPackages: {
    default: false,
    description: 'On start up, check for and install Atom packages recommended for use with Nuclide. The' + " list of packages can be found in the <code>package-deps</code> setting in this package's" + ' "package.json" file. Disabling this setting will not uninstall packages it previously' + ' installed. Restart Atom after changing this setting for it to take effect.',
    title: 'Install Recommended Packages on Startup',
    type: 'boolean'
  },
  useLocalRpc: {
    default: false,
    description: 'Use RPC marshalling for local services. This ensures better compatibility between the local' + ' and remote case. Useful for internal Nuclide development. Requires restart to take' + ' effect.',
    title: 'Use RPC for local Services.',
    type: 'boolean'
  }
};

// `setUseLocalRpc` can only be called once, so it's set out here during load.
const _useLocalRpc = atom.config.get('nuclide.useLocalRpc');
const _shouldUseLocalRpc = typeof _useLocalRpc !== 'boolean' ? baseConfig.useLocalRpc.default : _useLocalRpc;
(0, (_serviceManager || _load_serviceManager()).setUseLocalRpc)(_shouldUseLocalRpc);

// Nuclide packages for Atom are called "features"
const FEATURES_DIR = _path.default.join(__dirname, '../pkg');
const features = [];

/**
 * Get the "package.json" of all the features.
 */
_fs.default.readdirSync(FEATURES_DIR).forEach(item => {
  // Optimization: Our directories don't have periods - this must be a file
  if (item.indexOf('.') !== -1) {
    return;
  }
  const dirname = _path.default.join(FEATURES_DIR, item);
  const filename = _path.default.join(dirname, 'package.json');
  try {
    const stat = _fs.default.statSync(filename);

    if (!stat.isFile()) {
      throw new Error('Invariant violation: "stat.isFile()"');
    }
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      return;
    }
  }
  const src = _fs.default.readFileSync(filename, 'utf8');
  // Optimization: Avoid JSON parsing if it can't reasonably be an Atom package
  if (src.indexOf('"Atom"') === -1) {
    return;
  }
  const pkg = JSON.parse(src);
  if (pkg.nuclide && pkg.nuclide.packageType === 'Atom') {
    if (!pkg.name) {
      throw new Error('Invariant violation: "pkg.name"');
    }

    features.push({
      pkg,
      dirname
    });
  }
});

// atom-ide-ui packages are a lot more consistent.
const ATOM_IDE_DIR = _path.default.join(__dirname, '../modules/atom-ide-ui/pkg');
_fs.default.readdirSync(ATOM_IDE_DIR).forEach(item => {
  const dirname = _path.default.join(ATOM_IDE_DIR, item);
  const filename = _path.default.join(dirname, 'package.json');
  try {
    const src = _fs.default.readFileSync(filename, 'utf8');
    const pkg = JSON.parse(src);

    if (!pkg.name) {
      throw new Error('Invariant violation: "pkg.name"');
    }

    features.push({
      pkg,
      dirname
    });
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }
});

const featureLoader = new (_FeatureLoader || _load_FeatureLoader()).default({
  features,
  pkgName: 'nuclide'
});
featureLoader.load();

const config = exports.config = Object.assign({}, baseConfig, featureLoader.getConfig());

let disposables;
function activate() {
  if (errorReporterDisposable == null) {
    errorReporterDisposable = (0, (_installErrorReporter || _load_installErrorReporter()).default)();
  }

  disposables = new _atom.CompositeDisposable();

  // Add the "Nuclide" menu, if it's not there already.
  disposables.add(atom.menu.add([{
    // On Windows, menu labels have an & before a letter to indicate which
    // ALT key combination maps to that menu. In our case, Alt+N should open
    // the Nuclide menu.
    label: process.platform === 'win32' ? '&Nuclide' : 'Nuclide',
    submenu: [{
      label: `Version ${(_package || _load_package()).default.version}`,
      enabled: false
    }]
  }]));

  // Manually manipulate the menu template order.
  const insertIndex = atom.menu.template.findIndex(item => item.role === 'window' || item.role === 'help');
  if (insertIndex !== -1) {
    const nuclideIndex = atom.menu.template.findIndex(item => item.label === 'Nuclide');
    const menuItem = atom.menu.template.splice(nuclideIndex, 1)[0];
    const newIndex = insertIndex > nuclideIndex ? insertIndex - 1 : insertIndex;
    atom.menu.template.splice(newIndex, 0, menuItem);
    atom.menu.update();
  }

  // Activate all of the loaded features. Technically, this will be a no-op
  // generally because Atom [will activate all loaded packages][1]. However,
  // that won't happen, for example, with our `activateAllPackages()`
  // integration test helper.
  //
  // [1]: https://github.com/atom/atom/blob/v1.9.0/src/package-manager.coffee#L425
  featureLoader.activate();

  // Install public, 3rd-party Atom packages listed in this package's 'package-deps' setting. Run
  // this *after* other packages are activated so they can modify this setting if desired before
  // installation is attempted.
  if ((_featureConfig || _load_featureConfig()).default.get('installRecommendedPackages')) {
    // Workaround for restoring multiple Atom windows. This prevents having all
    // the windows trying to install the deps at the same time - often clobbering
    // each other's install.
    const firstWindowId = remote.BrowserWindow.getAllWindows()[0].id;
    const currentWindowId = remote.getCurrentWindow().id;
    if (firstWindowId === currentWindowId) {
      (0, (_atomPackageDeps || _load_atomPackageDeps()).install)('nuclide', /* promptUser */false);
    }
  }

  const menusToSort = ['Nuclide', 'View'];
  disposables.add(atom.packages.onDidActivateInitialPackages(() => {
    sortMenuGroups(menusToSort);

    if (!(disposables != null)) {
      throw new Error('Invariant violation: "disposables != null"');
    }

    disposables.add(atom.packages.onDidActivatePackage(() => {
      sortMenuGroups(menusToSort);
    }));
  }));
}

function sortLabelValue(label) {
  // Ignore the Windows accelerator key hint when sorting, the & doesn't
  // actually appear in the UX so it shouldn't affect the sort.
  return String(label).replace('&', '');
}

function sortSubmenuGroup(menuItems, startIndex, itemCount) {
  // Sort a subset of the items in the menu of length itemCount beginning
  // at startIndex.
  const itemsToSort = menuItems.splice(startIndex, itemCount);
  itemsToSort.sort((a, b) => {
    // Always put the "Version" label up top.
    if (sortLabelValue(a.label).startsWith('Version')) {
      return -1;
    } else {
      return sortLabelValue(a.label).localeCompare(sortLabelValue(b.label));
    }
  });

  menuItems.splice(startIndex, 0, ...itemsToSort);
}

function sortMenuGroups(menuNames) {
  for (const menuName of menuNames) {
    // Sorts the items in a menu alphabetically. If the menu contains one or more
    // separators, then the items within each separator subgroup will be sorted
    // with respect to each other, but items will remain in the same groups, and
    // the separators will not be moved.
    const menu = atom.menu.template.find(m => sortLabelValue(m.label) === menuName);
    if (menu == null) {
      continue;
    }

    // Sort each group of items (separated by a separator) individually.
    let sortStart = 0;
    for (let i = 0; i < menu.submenu.length; i++) {
      if (menu.submenu[i].type === 'separator') {
        sortSubmenuGroup(menu.submenu, sortStart, i - sortStart);
        sortStart = i + 1;
      }
    }

    // Sort any remaining items after the last separator.
    if (sortStart < menu.submenu.length) {
      sortSubmenuGroup(menu.submenu, sortStart, menu.submenu.length - sortStart);
    }
  }

  atom.menu.update();
}

function deactivate() {
  if (!(disposables != null)) {
    throw new Error('Invariant violation: "disposables != null"');
  }

  featureLoader.deactivate();
  disposables.dispose();
  disposables = null;

  if (!(errorReporterDisposable != null)) {
    throw new Error('Invariant violation: "errorReporterDisposable != null"');
  }

  errorReporterDisposable.dispose();
  errorReporterDisposable = null;
}

function serialize() {
  featureLoader.serialize();
}