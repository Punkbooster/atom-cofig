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
exports.TableExamples = undefined;

var _reactForAtom = require('react-for-atom');

var _Block;

function _load_Block() {
  return _Block = require('./Block');
}

var _Table;

function _load_Table() {
  return _Table = require('./Table');
}

const Highlight42Component = props => _reactForAtom.React.createElement(
  'div',
  { style: props.data === 42 ? { fontWeight: 'bold' } : {} },
  props.data
);

const TableExample = () => {
  const columns = [{
    title: 'first column',
    key: 'first'
  }, {
    title: 'second column',
    key: 'second',
    component: Highlight42Component
  }, {
    title: 'third column',
    key: 'third'
  }, {
    title: 'fourth column',
    key: 'fourth'
  }, {
    title: 'fifth column',
    key: 'fifth'
  }];
  const rows = [{
    data: {
      first: 1,
      second: 2,
      third: 3,
      fourth: 33,
      fifth: 123
    }
  }, {
    className: 'this-is-an-optional-classname',
    data: {
      first: 4,
      second: 42,
      third: 6,
      fourth: 66,
      fifth: 123
    }
  }, {
    data: {
      first: 7,
      second: 42,
      // third is empty
      fourth: 66,
      fifth: 123
    }
  }];
  return _reactForAtom.React.createElement(
    (_Block || _load_Block()).Block,
    null,
    _reactForAtom.React.createElement((_Table || _load_Table()).Table, {
      columns: columns,
      rows: rows,
      selectable: true
    })
  );
};

class SortableTableExample extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    const rows = [{
      data: {
        first: 1,
        second: 3,
        third: 300
      }
    }, {
      data: {
        first: 2,
        second: 5,
        third: 200
      }
    }, {
      className: 'nuclide-ui-custom-classname-example',
      data: {
        first: 3,
        second: 4,
        third: 100
      }
    }];
    this.state = {
      sortDescending: false,
      sortedColumn: null,
      rows
    };
    this._handleSort = this._handleSort.bind(this);
  }

  _handleSort(sortedColumn, sortDescending) {
    const sortedRows = this.state.rows.sort((obj1, obj2) => {
      const order = sortDescending ? -1 : 1;
      return order * (obj1.data[sortedColumn] - obj2.data[sortedColumn]);
    });
    this.setState({
      rows: sortedRows,
      sortedColumn,
      sortDescending
    });
  }

  render() {
    const columns = [{
      title: 'first',
      key: 'first'
    }, {
      title: 'second',
      key: 'second'
    }, {
      title: 'third',
      key: 'third'
    }];
    return _reactForAtom.React.createElement(
      (_Block || _load_Block()).Block,
      null,
      _reactForAtom.React.createElement((_Table || _load_Table()).Table, {
        emptyComponent: () => _reactForAtom.React.createElement(
          'div',
          null,
          'An optional, custom "empty message" component.'
        ),
        columns: columns,
        rows: this.state.rows,
        sortable: true,
        onSort: this._handleSort,
        sortedColumn: this.state.sortedColumn,
        sortDescending: this.state.sortDescending
      })
    );
  }
}

const EmptyTableExample = () => {
  const columns = [{
    title: 'first column',
    key: 'first'
  }, {
    title: 'second column',
    key: 'second'
  }, {
    title: 'third column',
    key: 'third'
  }];
  const rows = [];
  return _reactForAtom.React.createElement(
    (_Block || _load_Block()).Block,
    null,
    _reactForAtom.React.createElement((_Table || _load_Table()).Table, {
      columns: columns,
      rows: rows
    })
  );
};

const TableExamples = exports.TableExamples = {
  sectionName: 'Table',
  description: '',
  examples: [{
    title: 'Simple Table',
    component: TableExample
  }, {
    title: 'Sortable Table',
    component: SortableTableExample
  }, {
    title: 'Empty Table',
    component: EmptyTableExample
  }]
};