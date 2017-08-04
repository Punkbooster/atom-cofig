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
exports.MutableListSelector = undefined;

var _Button;

function _load_Button() {
  return _Button = require('./Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('./ButtonGroup');
}

var _reactForAtom = require('react-for-atom');

const DELETE_BUTTON_TITLE_DEFAULT = 'Delete selected item';
const DELETE_BUTTON_TITLE_NONE = 'No item selected to delete';
const DELETE_BUTTON_TITLE_UNDELETABLE = 'Selected item cannot be deleted';

/**
 * A generic component that displays selectable list items, and offers
 * the ability to add and remove items. It looks roughly like the following:
 *
 *   - - - - -
 *  | Item 1  |
 *  |---------|
 *  | Item 2  |
 *  |---------|
 *  |         |
 *  |         |
 *  |---------|
 *  | +  |  - |
 *   ---------
 */
class MutableListSelector extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._onDeleteButtonClicked = this._onDeleteButtonClicked.bind(this);
  }

  _onDeleteButtonClicked() {
    this.props.onDeleteButtonClicked(this.props.idOfSelectedItem);
  }

  _onItemClicked(itemId) {
    this.props.onItemClicked(itemId);
  }

  _onItemDoubleClicked(itemId) {
    this.props.onItemDoubleClicked(itemId);
  }

  render() {
    let selectedItem;
    const listItems = this.props.items.map(item => {
      let classes = 'list-item';
      if (item.id === this.props.idOfSelectedItem) {
        classes += ' selected';
        selectedItem = item;
      }
      return _reactForAtom.React.createElement(
        'li',
        {
          key: item.id,
          className: classes,
          onClick: this._onItemClicked.bind(this, item.id),
          onDoubleClick: this._onItemDoubleClicked.bind(this, item.id),
          tabIndex: 0 },
        item.displayTitle
      );
    });

    // Explain why the delete button is disabled if the current selection, or lack thereof, is
    // undeletable.
    let deleteButtonTitle;
    if (selectedItem == null) {
      deleteButtonTitle = DELETE_BUTTON_TITLE_NONE;
    } else if (selectedItem.deletable === false) {
      deleteButtonTitle = DELETE_BUTTON_TITLE_UNDELETABLE;
    } else {
      deleteButtonTitle = DELETE_BUTTON_TITLE_DEFAULT;
    }

    return _reactForAtom.React.createElement(
      'div',
      null,
      _reactForAtom.React.createElement(
        'div',
        { className: 'block select-list' },
        _reactForAtom.React.createElement(
          'ol',
          { className: 'list-group' },
          listItems
        )
      ),
      _reactForAtom.React.createElement(
        'div',
        { style: { display: 'flex', justifyContent: 'flex-end' } },
        _reactForAtom.React.createElement(
          (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
          null,
          _reactForAtom.React.createElement(
            (_Button || _load_Button()).Button,
            {
              disabled: selectedItem == null || selectedItem.deletable === false,
              onClick: this._onDeleteButtonClicked,
              title: deleteButtonTitle },
            '-'
          ),
          _reactForAtom.React.createElement(
            (_Button || _load_Button()).Button,
            {
              onClick: this.props.onAddButtonClicked,
              title: 'Create new item' },
            '+'
          )
        )
      )
    );
  }
}
exports.MutableListSelector = MutableListSelector;