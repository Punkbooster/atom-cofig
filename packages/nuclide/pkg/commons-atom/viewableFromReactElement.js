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
exports.viewableFromReactElement = viewableFromReactElement;

var _reactForAtom = require('react-for-atom');

var _ReactMountRootElement;

function _load_ReactMountRootElement() {
  return _ReactMountRootElement = _interopRequireDefault(require('../nuclide-ui/ReactMountRootElement'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Create an object that can be used as an Atom model from a React element. Example:
 *
 *     class UsageStats extends React.Component {
 *
 *       // Methods that Atom looks for on models (like `getTitle()`, `getIconName()`, etc.) can be
 *       // added to the component.
 *       getTitle(): string {
 *         return 'Usage Stats';
 *       }
 *
 *       render(): React.Element {
 *         return <div>Stats</div>;
 *       }
 *
 *     }
 *
 *    const item = viewableFromReactElement(<UsageStats />);
 *    atom.workspace.getPanes()[0].addItem(item); // Or anywhere else Atom uses model "items."
 */
function viewableFromReactElement(reactElement) {
  const container = new (_ReactMountRootElement || _load_ReactMountRootElement()).default();
  const item = _reactForAtom.ReactDOM.render(reactElement, container);

  // Add the a reference to the container to the item. This will allow Atom's view registry to
  // associate the item with the HTML element.
  if (item.element != null) {
    throw new Error("Component cannot have an `element` property. That's added by viewableFromReactElement");
  }
  item.element = container;

  // Add a destroy method to the item that will unmount the component. There's no need for users to
  // implement this themselves because they have `componentWillUnmount()`.
  if (item.destroy != null) {
    throw new Error("Component cannot implement `destroy()`. That's added by `viewableFromReactElement`");
  }
  item.destroy = () => {
    _reactForAtom.ReactDOM.unmountComponentAtNode(container);
  };

  return item;
}