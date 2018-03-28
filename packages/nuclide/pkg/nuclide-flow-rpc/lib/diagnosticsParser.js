'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flowStatusOutputToDiagnostics = flowStatusOutputToDiagnostics;
exports.diagnosticToFix = diagnosticToFix;
exports.extractRange = extractRange;

var _simpleTextBuffer;

function _load_simpleTextBuffer() {
  return _simpleTextBuffer = require('simple-text-buffer');
}

// Flow sometimes reports this as the file path for an error. When this happens, we should simply
// leave out the location, since it isn't very useful and it's not a well-formed path, which can
// cause issues down the line.
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

const BUILTIN_LOCATION = '(builtins)';

function flowStatusOutputToDiagnostics(statusOutput) {
  return statusOutput.errors.map(error => {
    if (error.classic === undefined || error.classic === true) {
      return flowClassicMessageToDiagnosticMessage(error);
    }
    if (error.classic === false) {
      return flowFriendlyMessageToDiagnosticMessage(error);
    }
    throw new Error('Invalid flow status error type');
  });
}

// Exported for testing
function diagnosticToFix(diagnostic) {
  for (const extractionFunction of fixExtractionFunctions) {
    const fix = extractionFunction(diagnostic);
    if (fix != null) {
      return fix;
    }
  }

  return null;
}

const fixExtractionFunctions = [unusedSuppressionFix, namedImportTypo];

function unusedSuppressionFix(diagnostic) {
  // Automatically remove unused suppressions:
  const isUnusedLegacySuppression = diagnostic.trace != null && diagnostic.trace.length === 1 && diagnostic.text === 'Error suppressing comment' && diagnostic.trace[0].text === 'Unused suppression';
  const isUnusedSuppresion = diagnostic.text === 'Unused suppression comment.';
  if (isUnusedSuppresion || isUnusedLegacySuppression) {
    const oldRange = diagnostic.range;

    if (!(oldRange != null)) {
      throw new Error('Invariant violation: "oldRange != null"');
    }

    return {
      newText: '',
      oldRange,
      speculative: true
    };
  }

  return null;
}

function namedImportTypo(diagnostic) {
  const trace = diagnostic.trace;
  const text = diagnostic.text;
  if (trace == null || trace.length !== 1 || text == null) {
    return null;
  }
  const traceText = trace[0].text;
  if (traceText == null) {
    return null;
  }

  if (!/^Named import from module `[^`]*`$/.test(text)) {
    return null;
  }

  const regex = /^This module has no named export called `([^`]*)`. Did you mean `([^`]*)`\?$/;
  const match = regex.exec(traceText);
  if (match == null) {
    return null;
  }

  const oldText = match[1];
  const newText = match[2];
  const oldRange = diagnostic.range;

  if (!(oldRange != null)) {
    throw new Error('Invariant violation: "oldRange != null"');
  }

  return {
    oldText,
    newText,
    oldRange,
    speculative: true
  };
}

/**
 * Currently, a diagnostic from Flow is an object with a "message" property.
 * Each item in the "message" array is an object with the following fields:
 *     - path (string) File that contains the error.
 *     - descr (string) Description of the error.
 *     - line (number) Start line.
 *     - endline (number) End line.
 *     - start (number) Start column.
 *     - end (number) End column.
 *     - code (number) Presumably an error code.
 * The message array may have more than one item. For example, if there is a
 * type incompatibility error, the first item in the message array blames the
 * usage of the wrong type and the second blames the declaration of the type
 * with which the usage disagrees. Note that these could occur in different
 * files.
 */

function extractPath(message) {
  if (message.loc == null || message.loc.source === BUILTIN_LOCATION) {
    return undefined;
  }
  return message.loc.source;
}

// A trace object is very similar to an error object.
function flowMessageToTrace(message) {
  return {
    type: 'Trace',
    text: message.descr,
    filePath: extractPath(message),
    range: extractRange(message.loc)
  };
}

function flowFriendlyMessageToDiagnosticMessage(flowStatusError) {
  const diagnosticMessage = {
    providerName: 'Flow',
    type: flowStatusError.level === 'error' ? 'Error' : 'Warning',
    text: getFriendlyText(flowStatusError.messageMarkup),
    filePath: flowStatusError.primaryLoc.source,
    range: extractRange(flowStatusError.primaryLoc),
    trace: getFriendlyTrace(flowStatusError.referenceLocs)
  };

  const fix = diagnosticToFix(diagnosticMessage);
  if (fix != null) {
    diagnosticMessage.fix = fix;
  }
  return diagnosticMessage;
}

function getFriendlyTrace(referenceLocs) {
  const diagnostics = [];
  for (const referenceId in referenceLocs) {
    const loc = referenceLocs[referenceId];
    diagnostics.push({
      type: 'Trace',
      text: `[${referenceId}]`,
      filePath: loc.source,
      range: extractRange(loc)
    });
  }
  return diagnostics;
}

function getFriendlyText(messageMarkup) {
  if (Array.isArray(messageMarkup)) {
    const getText = message => {
      switch (message.kind) {
        case 'Text':
          return message.text;
        case 'Code':
          return `\`${message.text}\``;
        case 'Reference':
          return message.message.map(getText).join('') + ` [${message.referenceId}]`;
      }
    };
    return messageMarkup.map(getText).join('');
  }

  const header = getFriendlyText(messageMarkup.message);
  const items = messageMarkup.items.map(getFriendlyText).map(message => ` - ${message}`).join('\n');
  return `${header}\n${items}`;
}

function flowClassicMessageToDiagnosticMessage(flowStatusError) {
  const flowMessageComponents = flowStatusError.message;

  const mainMessage = flowMessageComponents[0];

  // The Flow type does not capture this, but the first message always has a path, and the
  // diagnostics package requires a FileDiagnosticMessage to have a path.
  const path = flowMessageComponents.map(extractPath).find(extractedPath => extractedPath != null);

  if (!(path != null)) {
    throw new Error('Expected path to not be null or undefined');
  }

  const diagnosticMessage = {
    providerName: 'Flow',
    type: flowStatusError.level === 'error' ? 'Error' : 'Warning',
    text: mainMessage.descr,
    filePath: path,
    range: extractRange(mainMessage.loc),
    trace: extractTraces(flowStatusError)
  };

  const fix = diagnosticToFix(diagnosticMessage);
  if (fix != null) {
    diagnosticMessage.fix = fix;
  }

  return diagnosticMessage;
}

function extractTraces(flowStatusError) {
  const flowMessageComponents = flowStatusError.message;

  const trace = [];
  // When the message is an array with multiple elements, the second element
  // onwards comprise the trace for the error.
  if (flowMessageComponents.length > 1) {
    trace.push(...flowMessageComponents.slice(1).map(flowMessageToTrace));
  }

  const operation = flowStatusError.operation;
  if (operation != null) {
    const operationComponent = flowMessageToTrace(operation);

    if (!(operationComponent.text != null)) {
      throw new Error('Invariant violation: "operationComponent.text != null"');
    }

    operationComponent.text = 'See also: ' + operationComponent.text;
    trace.push(operationComponent);
  }
  const extra = flowStatusError.extra;
  if (extra != null) {
    extra.forEach(({ message, children }) => {
      trace.push(...message.map(flowMessageToTrace));
      if (children != null) {
        const childrenTraces = [].concat(...children.map(child => [].concat(child.message.map(flowMessageToTrace))));
        trace.push(...childrenTraces);
      }
    });
  }

  if (trace.length > 0) {
    return trace;
  } else {
    return undefined;
  }
}

// Use `atom$Range | void` rather than `?atom$Range` to exclude `null`, so that the type is
// compatible with the `range` property, which is an optional property rather than a nullable
// property.
function extractRange(loc) {
  if (loc == null || loc.source === BUILTIN_LOCATION) {
    return undefined;
  } else {
    // It's unclear why the 1-based to 0-based indexing works the way that it
    // does, but this has the desired effect in the UI, in practice.
    return new (_simpleTextBuffer || _load_simpleTextBuffer()).Range([loc.start.line - 1, loc.start.column - 1], [loc.end.line - 1, loc.end.column]);
  }
}