/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

/* eslint-disable no-unused-vars */

import type {Observable} from 'rxjs';

export type ControlButtonSpecification = {
  icon: atom$Octicon,
  title?: string,
  onClick: () => mixed,
};

/* Evaluation & values */
export type EvaluationResult = {
  type: string,
  // Either:
  value?: string,
  // Or:
  description?: string,
  objectId?: string,
  subtype?: string,
};

export type ExpansionResult = Array<{
  name: string,
  value: EvaluationResult,
}>;

export type Expression = string;
export type EvaluatedExpression = {
  expression: Expression,
  value: Observable<?EvaluationResult>,
};
export type EvaluatedExpressionList = Array<EvaluatedExpression>;
export type EvalCommand = 'runtimeEvaluate' | 'evaluateOnSelectedCallFrame' | 'getProperties';
export type ExpressionResult = ChromeProtocolResponse & {
  expression: string,
};

export type GetPropertiesResult = ChromeProtocolResponse & {
  objectId: string,
};

export type ChromeProtocolResponse = {
  result: ?EvaluationResult | ?GetPropertiesResult,
  error: ?Object,
};

/* Breakpoints */
export type FileLineBreakpoint = {
  id: number,
  path: string,
  line: number,
  condition: string,
  enabled: boolean,
  resolved: boolean,
};
export type FileLineBreakpoints = Array<FileLineBreakpoint>;

// TODO: handle non file line breakpoints.
export type IPCBreakpoint = {
  sourceURL: string,
  lineNumber: number,
  condition: string,
  enabled: boolean,
};

export type BreakpointUserChangeArgType = {
  action: string,
  breakpoint: FileLineBreakpoint,
};

export type SerializedBreakpoint = {
  line: number,
  sourceURL: string,
};

/* Callstack */
export type CallstackItem = {
  name: string,
  location: {
    path: string,
    line: number,
    column?: number,
  },
};
export type Callstack = Array<CallstackItem>;

/* ThreadStore Types */
export type ThreadItem = {
  id: string,
  name: string,
  address: string,
  location: {
    scriptId: string,
    lineNumber: number,
    columnNumber: number,
  },
  stopReason: string,
  description: string,
};

export type NuclideThreadData = {
  threads: Array<ThreadItem>,
  owningProcessId: number,
  stopThreadId: number,
  selectedThreadId: number,
};

/* Debugger mode */
export type DebuggerModeType = 'starting' | 'running' | 'paused' | 'stopping' | 'stopped';

export type ObjectGroup = 'watch-group' | 'console';

/**
 * Interfaces for Chrome Dev Tools internal APIs.
 * These are defined only for code executing in the chrome devtools webview.
 */
declare class WebInspector$Object {
  // Hack to call super constructor in WebInspector classes.
  static call(...args?: any[]): void,

  addEventListener(
    eventType: string,
    callback: (event: WebInspector$Event) => void): void,
  removeEventListener(
    eventType: string,
    callback: (event: WebInspector$Event) => void): void,
  dispatchEventToListeners(eventType: string, value?: any): void,
}

declare class WebInspector$Script {
  sourceURL: string,
}

declare class WebInspector$DebuggerModel$Location {
  lineNumber: number,
  columnNumber?: number,
  scriptId: string,
}

declare class WebInspector$CallFrame {
  script: WebInspector$Script,
  functionName: string,
  location(): WebInspector$DebuggerModel$Location,
}

declare class WebInspector$Event {
  type: string,
  data: any,
}

declare class WebInspector$UISourceCode {
  uri(): string,
}

type ThreadData = {
  owningProcessId: number,
  stopThreadId: number,
  selectedThreadId: number,
  threadMap: Object, // TODO: add flow type.
};

declare class WebInspector$RuntimeModel {
  executionContexts(): Array<WebInspector$ExecutionContext>,
}

declare class WebInspector$ExecutionContext {
  evaluate(
    expression: string,
    objectGroup: string,
    includeCommandLineAPI: boolean,
    doNotPauseOnExceptionsAndMuteConsole: boolean,
    returnByValue: boolean,
    generatePreview: boolean,
    callback: (
      remoteObject: ?Object,
      wasThrown: boolean,
      resultOrError: mixed
    ) => void,
  ): void,
}

declare class WebInspector$DebuggerModel {
  static Events: {
    CallFrameSelected: string,
    ClearInterface: string,
    DebuggerResumed: string,
    DebuggerPaused: string,
    ThreadsUpdated: string,
    ThreadsUpdateIPC: string,
    ThreadUpdateIPC: string,
    SelectedThreadChanged: string,
  },

  threadStore: WebInspector$ThreadStore,

  isPaused(): boolean,
  resume(): void,
  stepOver(): void,
  stepInto(): void,
  stepOut(): void,

  selectedCallFrame(): ?WebInspector$CallFrame,
  setSelectedCallFrame(callFrame: WebInspector$CallFrame): void,
  callFrames: Array<WebInspector$CallFrame>,
  evaluateOnSelectedCallFrame(
    expression: string,
    objectGroup: string,
    includeCommandLineAPI: boolean,
    doNotPauseOnExceptionsAndMuteConsole: boolean,
    returnByValue: boolean,
    generatePreview: boolean,
    callback: (
      remoteObject: ?Object,
      wasThrown: boolean,
      resultOrError: mixed
    ) => void,
  ): void,
  selectThread(threadId: string): void,

  _parsedScriptSource(sourceUrl: string, sourceUrl: string): void,
}

declare class WebInspector$ThreadStore {
  getData(): ThreadData,
  getActiveThreadStack(callback: (callFrames: Array<Object>) => void): void,
}

declare class WebInspector$BreakpointManager {
  static Events: {
    BreakpointAdded: string,
    BreakpointRemoved: string,
  },
  allBreakpoints(): WebInspector$BreakpointManager$Breakpoint[],
  setBreakpoint(
    uiSourceCode: WebInspector$UISourceCode,
    lineNumber: number,
    columnNumber: number,
    condition: string,
    enabled: boolean
  ): WebInspector$BreakpointManager$Breakpoint,
  findBreakpointOnLine(
    source: WebInspector$UISourceCode,
    lineNumber: number,
  ): ?WebInspector$BreakpointManager$Breakpoint,
  addEventListener(
    eventType: string,
    listener: (event: WebInspector$Event) => void,
    thisObject: Object
  ): void,
}

declare class WebInspector$BreakpointManager$Breakpoint {
  uiSourceCode(): ?WebInspector$UISourceCode,
  lineNumber(): number,
  remove(keepInStorage: boolean): void,
  setCondition(condition: string): void,
  setEnabled(enabled: boolean): void,
}

declare class WebInspector$RuntimeAgent {
  getProperties(
    objectId: string,
    ownProperties: boolean,
    accessorPropertiesOnly: boolean,
    generatePreview: boolean,
    callback: (
      error: ?Object,
      properties: ?ExpansionResult,
      internalProperties: ?Object,
    ) => void,
  ): void,
}

declare class WebInspector$Target {
  debuggerModel: WebInspector$DebuggerModel,
  runtimeModel: WebInspector$RuntimeModel,
  runtimeAgent(): WebInspector$RuntimeAgent,
}

declare class WebInspector$TargetManager {
  addModelListener(
    modelClass: any,
    eventType: string,
    listener: (event: WebInspector$Event) => void,
    thisObject: Object): void,
  removeModelListener(
    modelClass: any,
    eventType: string,
    listener: (event: WebInspector$Event) => void,
    thisObject: Object): void,
  mainTarget(): ?WebInspector$Target,
}

declare class WebInspector$ActionRegistry {
  execute(
    actionId: string,
  ): ?Promise<boolean>,
}

declare class WebInspector$Workspace {
  static Events: {
    UISourceCodeAdded: string,
  },

  uiSourceCodeForOriginURL(url: string): WebInspector$UISourceCode,
  addEventListener(
    eventType: string,
    listener: (event: WebInspector$Event) => void,
    thisObject: Object): void,
}

declare class WebInspector$SplitView {
  static Events: {
    ShowModeChanged: string,
  },

  static ShowMode: {
    Both: string,
    OnlyMain: string,
    OnlySidebar: string,
  },
}

declare class WebInspector$App {
  presentUI(): void,
}

declare class WebInspector$AppProvider {
  createApp(): WebInspector$App,
}

declare class WebInspector$View extends WebInspector$Object {
  element: HTMLElement,
  registerRequiredCSS(cssFile: string): void,
  show(parentElement: HTMLElement, insertBefore?: HTMLElement): void,
}

declare class WebInspector$VBox extends WebInspector$View {
}

declare class WebInspector$RootView extends WebInspector$VBox {
  attachToDocument(document: Document): void,
}

declare class WebInspector$InspectorView extends WebInspector$VBox {
  panel(panelName: string): Promise<WebInspector$Panel>,
  showInitialPanel(): void,
}

declare class WebInspector$Panel extends WebInspector$VBox {
}

declare class WebInspector$SidebarPane extends WebInspector$View {
  bodyElement: HTMLElement,
  expand(): void,
}

declare class WebInspector$Settings {
  breakpoints: WebInspector$Setting<Array<mixed>>,
  pauseOnExceptionEnabled: WebInspector$Setting<boolean>,
  pauseOnCaughtException: WebInspector$Setting<boolean>,
  singleThreadStepping: WebInspector$Setting<boolean>,
}

declare class WebInspector$Setting<T> {
  addChangeListener(callback: (event: WebInspector$Event) => void, thisObj?: Object): void,
  set(value: T): void,
  get(): T,
}

declare class WebInspector$UILocation {
  linkText(): string,
  id(): string,
  toUIString(): string,
  uiSourceCode: WebInspector$UISourceCode,
  lineNumber: number,
}

declare class WebInspector$DebuggerWorkspaceBinding {
  rawLocationToUILocation(
    rawLocation: WebInspector$DebuggerModel$Location
  ): WebInspector$UILocation,
}

declare class WebInspector$UserMetrics {
  static UserAction: string,
}

declare class WebInspector$NotificationService {
  addEventListener(
    eventType: string,
    listener: (event: WebInspector$Event) => void,
    thisObject: Object): void,
}

declare class WebInspector$Streams {
  static streamWrite(streamId: number, chunk: string): void,
}

type WebInspector = {
  App: typeof WebInspector$App,
  AppProvider: typeof WebInspector$AppProvider,
  DebuggerModel: typeof WebInspector$DebuggerModel,
  Event: typeof WebInspector$Event,
  Object: typeof WebInspector$Object,
  Panel: typeof WebInspector$Panel,
  RootView: typeof WebInspector$RootView,
  SplitView: typeof WebInspector$SplitView,
  SidebarPane: typeof WebInspector$SidebarPane,
  UserMetrics: typeof WebInspector$UserMetrics,
  Workspace: typeof WebInspector$Workspace,
  BreakpointManager: typeof WebInspector$BreakpointManager,
  Streams: typeof WebInspector$Streams,

  actionRegistry: WebInspector$ActionRegistry,
  breakpointManager: WebInspector$BreakpointManager,
  debuggerWorkspaceBinding: WebInspector$DebuggerWorkspaceBinding,
  inspectorView: WebInspector$InspectorView,
  notifications: WebInspector$NotificationService,
  settings: WebInspector$Settings,
  targetManager: WebInspector$TargetManager,
  workspace: WebInspector$Workspace,

  beautifyFunctionName: (name: string) => string,
};

export type {
  ThreadData,
  WebInspector$Event,
  WebInspector$CallFrame,
  WebInspector$UILocation,
  WebInspector,
};
