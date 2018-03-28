"use strict";
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// Place this right on top
const initialize_1 = require("../initialize");
// The module 'assert' provides assertion methods from node
const assert = require("assert");
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const vscode = require("vscode");
const path = require("path");
const settings = require("../../client/common/configSettings");
const utils_1 = require("../../client/common/utils");
const helpers_1 = require("../../client/common/helpers");
let pythonSettings = settings.PythonSettings.getInstance();
let disposable;
let autoCompPath = path.join(__dirname, '..', '..', '..', 'src', 'test', 'pythonFiles', 'autocomp');
const filePep526 = path.join(autoCompPath, 'pep526.py');
suite('Autocomplete PEP 526', () => {
    const isPython3Deferred = helpers_1.createDeferred();
    const isPython3 = isPython3Deferred.promise;
    suiteSetup(() => __awaiter(this, void 0, void 0, function* () {
        disposable = initialize_1.setPythonExecutable(pythonSettings);
        yield initialize_1.initialize();
        let version = yield utils_1.execPythonFile(pythonSettings.pythonPath, ['--version'], __dirname, true);
        isPython3Deferred.resolve(version.indexOf('3.') >= 0);
    }));
    suiteTeardown(done => {
        disposable.dispose();
        initialize_1.closeActiveWindows().then(() => done(), () => done());
    });
    teardown(done => {
        initialize_1.closeActiveWindows().then(() => done(), () => done());
    });
    test('variable (abc:str)', () => __awaiter(this, void 0, void 0, function* () {
        if (!(yield isPython3)) {
            return;
        }
        let textDocument = yield vscode.workspace.openTextDocument(filePep526);
        yield vscode.window.showTextDocument(textDocument);
        assert(vscode.window.activeTextEditor, 'No active editor');
        const position = new vscode.Position(9, 8);
        let list = yield vscode.commands.executeCommand('vscode.executeCompletionItemProvider', textDocument.uri, position);
        assert.notEqual(list.items.filter(item => item.label === 'capitalize').length, 0, 'capitalize not found');
        assert.notEqual(list.items.filter(item => item.label === 'upper').length, 0, 'upper not found');
        assert.notEqual(list.items.filter(item => item.label === 'lower').length, 0, 'lower not found');
    }));
    test('variable (abc: str = "")', () => __awaiter(this, void 0, void 0, function* () {
        if (!(yield isPython3)) {
            return;
        }
        let textDocument = yield vscode.workspace.openTextDocument(filePep526);
        yield vscode.window.showTextDocument(textDocument);
        assert(vscode.window.activeTextEditor, 'No active editor');
        const position = new vscode.Position(8, 14);
        let list = yield vscode.commands.executeCommand('vscode.executeCompletionItemProvider', textDocument.uri, position);
        assert.notEqual(list.items.filter(item => item.label === 'capitalize').length, 0, 'capitalize not found');
        assert.notEqual(list.items.filter(item => item.label === 'upper').length, 0, 'upper not found');
        assert.notEqual(list.items.filter(item => item.label === 'lower').length, 0, 'lower not found');
    }));
    test('variable (abc = UNKNOWN # type: str)', () => __awaiter(this, void 0, void 0, function* () {
        if (!(yield isPython3)) {
            return;
        }
        let textDocument = yield vscode.workspace.openTextDocument(filePep526);
        yield vscode.window.showTextDocument(textDocument);
        assert(vscode.window.activeTextEditor, 'No active editor');
        const position = new vscode.Position(7, 14);
        let list = yield vscode.commands.executeCommand('vscode.executeCompletionItemProvider', textDocument.uri, position);
        assert.notEqual(list.items.filter(item => item.label === 'capitalize').length, 0, 'capitalize not found');
        assert.notEqual(list.items.filter(item => item.label === 'upper').length, 0, 'upper not found');
        assert.notEqual(list.items.filter(item => item.label === 'lower').length, 0, 'lower not found');
    }));
    test('class methods', () => __awaiter(this, void 0, void 0, function* () {
        if (!(yield isPython3)) {
            return;
        }
        let textDocument = yield vscode.workspace.openTextDocument(filePep526);
        yield vscode.window.showTextDocument(textDocument);
        assert(vscode.window.activeTextEditor, 'No active editor');
        let position = new vscode.Position(20, 4);
        let list = yield vscode.commands.executeCommand('vscode.executeCompletionItemProvider', textDocument.uri, position);
        assert.notEqual(list.items.filter(item => item.label === 'a').length, 0, 'method a not found');
        position = new vscode.Position(21, 4);
        list = yield vscode.commands.executeCommand('vscode.executeCompletionItemProvider', textDocument.uri, position);
        assert.notEqual(list.items.filter(item => item.label === 'b').length, 0, 'method b not found');
    }));
    test('class method types', () => __awaiter(this, void 0, void 0, function* () {
        if (!(yield isPython3)) {
            return;
        }
        let textDocument = yield vscode.workspace.openTextDocument(filePep526);
        yield vscode.window.showTextDocument(textDocument);
        assert(vscode.window.activeTextEditor, 'No active editor');
        const position = new vscode.Position(21, 6);
        const list = yield vscode.commands.executeCommand('vscode.executeCompletionItemProvider', textDocument.uri, position);
        assert.notEqual(list.items.filter(item => item.label === 'bit_length').length, 0, 'bit_length not found');
    }));
});
//# sourceMappingURL=pep526.test.js.map