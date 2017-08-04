'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// TODO @jxg export debugger typedefs from main module. (t11406963)

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LazyNestedValueComponent = undefined;

var _reactForAtom = require('react-for-atom');

var _bindObservableAsProps;

function _load_bindObservableAsProps() {
  return _bindObservableAsProps = require('./bindObservableAsProps');
}

var _highlightOnUpdate;

function _load_highlightOnUpdate() {
  return _highlightOnUpdate = require('./highlightOnUpdate');
}

var _ValueComponentClassNames;

function _load_ValueComponentClassNames() {
  return _ValueComponentClassNames = require('./ValueComponentClassNames');
}

var _Tree;

function _load_Tree() {
  return _Tree = require('./Tree');
}

var _LoadingSpinner;

function _load_LoadingSpinner() {
  return _LoadingSpinner = require('./LoadingSpinner');
}

var _ignoreTextSelectionEvents;

function _load_ignoreTextSelectionEvents() {
  return _ignoreTextSelectionEvents = _interopRequireDefault(require('./ignoreTextSelectionEvents'));
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const SPINNER_DELAY = 100; /* ms */
const NOT_AVAILABLE_MESSAGE = '<not available>';

function isObjectValue(result) {
  return result.objectId != null;
}

function TreeItemWithLoadingSpinner() {
  return _reactForAtom.React.createElement(
    (_Tree || _load_Tree()).TreeItem,
    null,
    _reactForAtom.React.createElement((_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinner, { size: 'EXTRA_SMALL', delay: SPINNER_DELAY })
  );
}

/**
 * A wrapper that renders a (delayed) spinner while the list of child properties is being loaded.
 * Otherwise, it renders ValueComponent for each property in `children`.
 */
const LoadableValueComponent = props => {
  const {
    children,
    fetchChildren,
    path,
    expandedValuePaths,
    onExpandedStateChange,
    simpleValueComponent,
    shouldCacheChildren,
    getCachedChildren,
    setCachedChildren
  } = props;
  if (children == null) {
    return TreeItemWithLoadingSpinner();
  }
  if (shouldCacheChildren) {
    setCachedChildren(path, children);
  }
  return _reactForAtom.React.createElement(
    'span',
    null,
    children.map(child => _reactForAtom.React.createElement(
      (_Tree || _load_Tree()).TreeItem,
      { key: child.name },
      _reactForAtom.React.createElement(ValueComponent, {
        evaluationResult: child.value,
        fetchChildren: fetchChildren,
        expression: child.name,
        expandedValuePaths: expandedValuePaths,
        onExpandedStateChange: onExpandedStateChange,
        path: path + '.' + child.name,
        simpleValueComponent: simpleValueComponent,
        shouldCacheChildren: shouldCacheChildren,
        getCachedChildren: getCachedChildren,
        setCachedChildren: setCachedChildren
      })
    ))
  );
};

// TODO allow passing action components (edit button, pin button) here
function renderValueLine(expression, value) {
  if (expression == null) {
    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-ui-lazy-nested-value-container' },
      value
    );
  } else {
    // TODO @jxg use a text editor to apply proper syntax highlighting for expressions (t11408154)
    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-ui-lazy-nested-value-container' },
      _reactForAtom.React.createElement(
        'span',
        { className: (_ValueComponentClassNames || _load_ValueComponentClassNames()).ValueComponentClassNames.identifier },
        expression
      ),
      ': ',
      value
    );
  }
}

/**
 * A component that knows how to render recursive, interactive expression/evaluationResult pairs.
 * The rendering of non-expandable "leaf" values is delegated to the SimpleValueComponent.
 */
class ValueComponent extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isExpanded: false,
      children: null
    };
    this._toggleExpandFiltered = (0, (_ignoreTextSelectionEvents || _load_ignoreTextSelectionEvents()).default)(this._toggleExpand.bind(this));
  }

  componentDidMount() {
    const {
      path,
      expandedValuePaths,
      fetchChildren,
      evaluationResult
    } = this.props;
    const nodeData = expandedValuePaths.get(path);
    if (!this.state.isExpanded && nodeData != null && nodeData.isExpanded && this._shouldFetch() && evaluationResult != null && evaluationResult.objectId != null && fetchChildren != null) {
      if (!(evaluationResult.objectId != null)) {
        throw new Error('Invariant violation: "evaluationResult.objectId != null"');
      }

      this.setState({
        children: fetchChildren(evaluationResult.objectId),
        isExpanded: true
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this._shouldFetch() && this.state.isExpanded && nextProps.evaluationResult != null && nextProps.fetchChildren != null) {
      const { objectId } = nextProps.evaluationResult;
      if (objectId == null) {
        return;
      }
      this.setState({
        children: nextProps.fetchChildren(objectId)
      });
    }
  }

  _shouldFetch() {
    const { shouldCacheChildren, getCachedChildren, path } = this.props;
    const children = getCachedChildren(path);
    return !shouldCacheChildren || children == null;
  }

  _toggleExpand(event) {
    const {
      fetchChildren,
      evaluationResult,
      onExpandedStateChange,
      path
    } = this.props;
    const newState = {
      children: null,
      isExpanded: !this.state.isExpanded
    };
    if (!this.state.isExpanded) {
      if (this._shouldFetch() && typeof fetchChildren === 'function' && evaluationResult != null && evaluationResult.objectId != null) {
        newState.children = fetchChildren(evaluationResult.objectId);
      }
    }
    onExpandedStateChange(path, newState.isExpanded);
    this.setState(newState);
    event.stopPropagation();
  }

  render() {
    const {
      evaluationResult,
      expression,
      fetchChildren,
      isRoot,
      path,
      expandedValuePaths,
      onExpandedStateChange,
      shouldCacheChildren,
      getCachedChildren,
      setCachedChildren,
      simpleValueComponent: SimpleValueComponent
    } = this.props;
    if (evaluationResult == null) {
      return renderValueLine(expression, NOT_AVAILABLE_MESSAGE);
    }
    if (!isObjectValue(evaluationResult)) {
      const simpleValueElement = _reactForAtom.React.createElement(SimpleValueComponent, {
        expression: expression,
        evaluationResult: evaluationResult,
        simpleValueComponent: SimpleValueComponent
      });
      return isRoot ? simpleValueElement : _reactForAtom.React.createElement(
        (_Tree || _load_Tree()).TreeItem,
        null,
        simpleValueElement
      );
    }
    const description = evaluationResult.description || '<no description provided>';
    const {
      children,
      isExpanded
    } = this.state;
    let childListElement = null;
    if (isExpanded) {
      const cachedChildren = getCachedChildren(path);
      if (shouldCacheChildren && cachedChildren != null) {
        childListElement = _reactForAtom.React.createElement(LoadableValueComponent, {
          children: cachedChildren,
          fetchChildren: fetchChildren,
          path: path,
          expandedValuePaths: expandedValuePaths,
          onExpandedStateChange: onExpandedStateChange,
          simpleValueComponent: SimpleValueComponent,
          shouldCacheChildren: shouldCacheChildren,
          getCachedChildren: getCachedChildren,
          setCachedChildren: setCachedChildren
        });
      } else if (children == null) {
        childListElement = _reactForAtom.React.createElement(TreeItemWithLoadingSpinner, null);
      } else {
        const ChildrenComponent = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(children.map(childrenValue => ({ children: childrenValue })).startWith({ children: null }), LoadableValueComponent);
        childListElement = _reactForAtom.React.createElement(ChildrenComponent, {
          fetchChildren: fetchChildren,
          path: path,
          expandedValuePaths: expandedValuePaths,
          onExpandedStateChange: onExpandedStateChange,
          simpleValueComponent: SimpleValueComponent,
          shouldCacheChildren: shouldCacheChildren,
          getCachedChildren: getCachedChildren,
          setCachedChildren: setCachedChildren
        });
      }
    }
    const title = renderValueLine(expression, description);
    return _reactForAtom.React.createElement(
      (_Tree || _load_Tree()).TreeList,
      { showArrows: true, className: 'nuclide-ui-lazy-nested-value-treelist' },
      _reactForAtom.React.createElement(
        (_Tree || _load_Tree()).NestedTreeItem,
        {
          collapsed: !this.state.isExpanded,
          onClick: this._toggleExpandFiltered,
          title: title },
        childListElement
      )
    );
  }
}

/**
 * TopLevelValueComponent wraps all expandable value components. It is in charge of keeping track
 * of the set of recursively expanded values. The set is keyed by a "path", which is a string
 * containing the concatenated object keys of all recursive parent object for a given item. This
 * is necessary to preserve the expansion state while the values are temporarily unavailable, such
 * as after stepping in the debugger, which triggers a recursive re-fetch.
 */
class TopLevelLazyNestedValueComponent extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this.expandedValuePaths = new Map();
    this.handleExpansionChange = this.handleExpansionChange.bind(this);
    this.getCachedChildren = this.getCachedChildren.bind(this);
    this.setCachedChildren = this.setCachedChildren.bind(this);
    this.shouldCacheChildren = this.props.shouldCacheChildren == null ? false : this.props.shouldCacheChildren;
  }
  // $FlowIssue `evaluationResult` gets injected via HOC.


  handleExpansionChange(expandedValuePath, isExpanded) {
    const nodeData = this.expandedValuePaths.get(expandedValuePath) || { isExpanded, cachedChildren: null };
    if (isExpanded) {
      this.expandedValuePaths.set(expandedValuePath, Object.assign({}, nodeData, { isExpanded: true }));
    } else {
      this.expandedValuePaths.set(expandedValuePath, Object.assign({}, nodeData, { isExpanded: false }));
    }
  }

  getCachedChildren(path) {
    const nodeData = this.expandedValuePaths.get(path);
    if (nodeData == null) {
      return null;
    } else {
      return nodeData.cachedChildren;
    }
  }

  setCachedChildren(path, children) {
    const nodeData = this.expandedValuePaths.get(path);
    if (nodeData != null) {
      this.expandedValuePaths.set(path, Object.assign({}, nodeData, { cachedChildren: children }));
    }
  }

  render() {
    const className = (0, (_classnames || _load_classnames()).default)(this.props.className, {
      'native-key-bindings': true,
      // Note(vjeux): the following line should probably be `: true`
      'nuclide-ui-lazy-nested-value': this.props.className == null
    });
    return _reactForAtom.React.createElement(
      'span',
      { className: className, tabIndex: -1 },
      _reactForAtom.React.createElement(ValueComponent, Object.assign({}, this.props, {
        isRoot: true,
        expandedValuePaths: this.expandedValuePaths,
        onExpandedStateChange: this.handleExpansionChange,
        path: 'root',
        shouldCacheChildren: this.shouldCacheChildren,
        getCachedChildren: this.getCachedChildren,
        setCachedChildren: this.setCachedChildren
      }))
    );
  }
}

function arePropsEqual(p1, p2) {
  const evaluationResult1 = p1.evaluationResult;
  const evaluationResult2 = p2.evaluationResult;
  if (evaluationResult1 === evaluationResult2) {
    return true;
  }
  if (evaluationResult1 == null || evaluationResult2 == null) {
    return false;
  }
  return evaluationResult1.value === evaluationResult2.value && evaluationResult1.type === evaluationResult2.type && evaluationResult1.description === evaluationResult2.description;
}
const LazyNestedValueComponent = exports.LazyNestedValueComponent = (0, (_highlightOnUpdate || _load_highlightOnUpdate()).highlightOnUpdate)(TopLevelLazyNestedValueComponent, arePropsEqual, undefined, /* custom classname */
undefined);