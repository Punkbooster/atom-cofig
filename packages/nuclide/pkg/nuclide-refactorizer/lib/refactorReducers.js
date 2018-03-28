'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = refactorReducers;
function refactorReducers(state_, action) {
  let state = state_;
  if (state == null) {
    state = { type: 'closed' };
  }

  if (action.error) {
    // We handle errors in epics, display an appropriate message, and then send an ordinary action
    // to update the state appropriately.
    return state;
  }

  switch (action.type) {
    case 'open':
      return open(state, action);
    case 'got-refactorings':
      return gotRefactorings(state, action);
    case 'close':
      return close(state);
    case 'back-from-diff-preview':
      return backFromDiffPreview(state, action);
    case 'picked-refactor':
      return pickedRefactor(state, action);
    case 'inline-picked-refactor':
      return inlinePickedRefactor(state, action);
    case 'execute':
      return executeRefactor(state, action);
    case 'confirm':
      return confirmRefactor(state, action);
    case 'load-diff-preview':
      return loadDiffPreview(state, action);
    case 'display-diff-preview':
      return displayDiffPreview(state, action);
    case 'progress':
      return progress(state, action);
    default:
      return state;
  }
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

function open(state, action) {
  if (!(state.type === 'closed')) {
    throw new Error('Invariant violation: "state.type === \'closed\'"');
  }

  return {
    type: 'open',
    ui: action.ui,
    phase: {
      type: 'get-refactorings'
    }
  };
}

function gotRefactorings(state, action) {
  if (!(state.type === 'open')) {
    throw new Error('Invariant violation: "state.type === \'open\'"');
  }

  if (!(state.phase.type === 'get-refactorings')) {
    throw new Error('Invariant violation: "state.phase.type === \'get-refactorings\'"');
  }

  const { editor, originalRange } = action.payload;

  return {
    type: 'open',
    ui: state.ui,
    phase: {
      type: 'pick',
      provider: action.payload.provider,
      editor,
      originalRange,
      availableRefactorings: action.payload.availableRefactorings
    }
  };
}

function close(state) {
  if (!(state.type === 'open')) {
    throw new Error('Invariant violation: "state.type === \'open\'"');
  }

  return {
    type: 'closed'
  };
}

function backFromDiffPreview(state, action) {
  if (!(state.type === 'open')) {
    throw new Error('Invariant violation: "state.type === \'open\'"');
  }

  return Object.assign({}, state, {
    phase: action.payload.phase
  });
}

function pickedRefactor(state, action) {
  if (!(state.type === 'open')) {
    throw new Error('Invariant violation: "state.type === \'open\'"');
  }

  if (!(state.phase.type === 'pick')) {
    throw new Error('Invariant violation: "state.phase.type === \'pick\'"');
  }

  const { refactoring } = action.payload;
  const { provider, editor, originalRange } = state.phase;

  return {
    type: 'open',
    ui: state.ui,
    phase: getRefactoringPhase(refactoring, provider, editor, originalRange)
  };
}

function inlinePickedRefactor(state, action) {
  const { provider, editor, originalRange, refactoring } = action.payload;

  if (!(state.type === 'closed')) {
    throw new Error('Invariant violation: "state.type === \'closed\'"');
  }

  if (!(refactoring.kind === 'freeform')) {
    throw new Error('Invariant violation: "refactoring.kind === \'freeform\'"');
  }

  return {
    type: 'open',
    ui: 'generic',
    phase: getRefactoringPhase(refactoring, provider, editor, originalRange)
  };
}

function getRefactoringPhase(refactoring, provider, editor, originalRange) {
  switch (refactoring.kind) {
    case 'rename':
      return {
        type: 'rename',
        provider,
        editor,
        originalPoint: originalRange.start,
        symbolAtPoint: refactoring.symbolAtPoint
      };
    case 'freeform':
      return {
        type: 'freeform',
        provider,
        editor,
        originalRange,
        refactoring
      };
    default:
      if (!false) {
        throw new Error(`Unexpected refactoring kind ${refactoring.kind}`);
      }

  }
}

function executeRefactor(state, action) {
  if (!(state.type === 'open')) {
    throw new Error('Invariant violation: "state.type === \'open\'"');
  }

  return {
    type: 'open',
    ui: state.ui,
    phase: {
      type: 'execute'
    }
  };
}

function confirmRefactor(state, action) {
  if (!(state.type === 'open')) {
    throw new Error('Invariant violation: "state.type === \'open\'"');
  }

  return {
    type: 'open',
    ui: state.ui,
    phase: {
      type: 'confirm',
      response: action.payload.response
    }
  };
}

function loadDiffPreview(state, action) {
  if (!(state.type === 'open')) {
    throw new Error('Invariant violation: "state.type === \'open\'"');
  }

  return Object.assign({}, state, {
    phase: {
      type: 'diff-preview',
      loading: true,
      diffs: [],
      previousPhase: action.payload.previousPhase
    }
  });
}

function displayDiffPreview(state, action) {
  if (!(state.type === 'open')) {
    throw new Error('Invariant violation: "state.type === \'open\'"');
  }

  if (!(state.phase.type === 'diff-preview')) {
    throw new Error('Invariant violation: "state.phase.type === \'diff-preview\'"');
  }

  return Object.assign({}, state, {
    phase: Object.assign({}, state.phase, {
      loading: false,
      diffs: action.payload.diffs
    })
  });
}

function progress(state, action) {
  if (!(state.type === 'open')) {
    throw new Error('Invariant violation: "state.type === \'open\'"');
  }

  return {
    type: 'open',
    ui: state.ui,
    phase: Object.assign({
      type: 'progress'
    }, action.payload)
  };
}