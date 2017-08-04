# Nuclide Changelog

## v0.186.0

### Hotfix

* Fix case-sensitivity issue that manifested on Linux and Windows.
* Fix issue where datatips would close when they are clicked on.

## v0.185.0

### Highlights

* When you right click on the file tree, it now highlights the row you clicked on!

### General

* Make remote "Search in Directory" behaviour more consistent.
* Performance improvements for remote "Search in Directory".
* Make remote "Search in Directory” work with multiple projects.
* Fix Task Runner alphabetical ordering.
* Buck toolbar no longer includes a “React Native Server” checkbox for iOS/Android targets.
* New icon for active project root in the file tree.
* File Tree no longer “jumps” when editing a Working Set.

### File tree

* The `[+]` icon for the working set no longer jumps around when scrolling.
* Do not show (default) bubble next to the root.

### Debugger

* Watch expressions are working again.
* Debugger highlights the current stack frame in the call stack.
* Fix issue with launching scripts with arguments under the PHP debugger.

### Diagnostics

* The yellow and red `~~~~` underlines no longer extends to the end of the line.

### Datatip

* Once interacted with (clicking, selecting text or scrolling horizontally), the datatip closes less aggressively when you mouse out of it.
* When switching tabs or applications, it should no longer trigger a datatip without moving the mouse.

### Diff view

* The amend button is no longer enabled when the top commit isn't yours.
* Clicking on the diff gutter no longer creates a breakpoint.

### OCaml/Reason

* Fix bug in formatting `rei` and `mli` files.

### Task Runner Toolbar

* Task selection dropdown  and action button have been separated.
* UI no longer jumps when the active project root changes or is set for the first time.

## v0.184.0

* Fixes regression in backspace/enter events not working in input fields of the debugger.
* Workaround for unprepared Atom environment during package activation.

## v0.183.0

* Fix inadvertent infinite loop in work deferral queue.

## v0.182.0

### Highlights

* You can now open files with [atom://nuclide/open-arc?project=<project_id>&path=<path>](http:) URLs.

### General

* Arc Lint processes can no longer stack - saving a file while a lint is running will kill the old lint process.
* Nuclide settings filter now matches on Section and Package names.
* Arc lint timeout is now configurable in Nuclide Settings.

### Health

* Add list of calls to external processes and their duration.
* You can now use cmd-c to copy the content.

### Source Control

* No longer display some random stranger commit and now clicking on a commit shows its own changes.
* Lots of small tweaks to make the UI stop jumping around all the time.

### Debugger

* Add support for selecting text and copy/paste.
* PHP debugger can be started if active file is not remote.

## v0.181.0

Hotfix for gutter breakpoint click-listener regression.

## v0.180.0

### General

* Put quick-open results for the current working directory at the top.
* Diagnostics now appears in a tab, which users can manage.
* The blue dot in the gutter should no longer be stuck.

### Python

* Respect the user `PYTHONPATH` when resolving modules.

### PHP/Hack

* End PHP debugger session when we have a fatal socket error.


## v0.179.0

Hotfix to prevent debugger serialization performance regression Atom 1.12.

## v0.178.0

### Highlights

* Diagnostics: Added an "Open All" button that opens all files with errors.
* Improved datatip UX.

### General

* Add grammars for the [Reason](https://facebook.github.io/reason/) language.
* Numerous quality, stability and performance improvements.
* Numerous updates to our extensive public docs at [nuclide.io](https://nuclide.io).

### Fixes

* Don't close files when they're renamed from the file tree.
* Numerous Atom 1.12 compatibility fixes.

### Flow

* Don't show Flow type hints for comments.
* Support default exports for Flow outline view.
* Support destructuring in top-level assignments in Flow outline view.

### Debugger

* C++ debug tab now lets you pause on all exceptions (i.e. when they're thrown). The other options (don't pause / pause on uncaught exceptions) continue to pause only on `SIGABRT`, i.e. unhandled exceptions.
* Add keybinding tooltip for debugger icons.
* Update all Debugger Launch/Attach dialogs to handle 'ENTER' keypress.


## v0.177.0

### General

* Enable showTraces in diagnostics.
* Add keyboard shortcuts for cycling through diagnostic traces.
* Files can be closed now by middle-clicking on their name in "Open Files" section.

### React

* Updated React Inspector now works with all different kinds of React apps! See facebook/react-devtools#440.

### Debugger

* More intuitive icons for step over/in/out.
* Doesn't jump anymore when you expand a local.

### Smart Log

* Fix cmd-click to checkout a branch.


## v0.176.0

### Highlights

* Reduce the number of calls to `hg` asking for commit info to only when a change (commit, strip, rebase, amend, histedit) is applied. Makes React Native experience better!
* Test runner now defines a keyboard bindable command for Test/Re-Test action. (Thanks Stepan!)

### General

* A handful of bug fixes for Atom 1.12 beta.
* Display remote “Opening...” and “Saving...” notification less often.
* HHVM debug toolbar availability now depends on the Current Working Root.

### C++ Debugger

* Add C++ debugger redirect stdin file during launch.
* Resolve "~" in launch arguments into home directory for C++ debugger launch.

### Flow

* Drop support for Flow v0.22 and below.
* Update outline view for the upcoming Flow v0.34's AST changes.

### Related Files

* Allow Related-Files feature to specify which file types to switch between.


## v0.175.0

### Highlights

* The number of Mercurial calls made on save has been reduced by 50%.
* An option has been added to enable/disable the editor gutter and status-bar line diff info display.
* Added a new debugger for the [iOS Webkit Debug Proxy](https://github.com/google/ios-webkit-debug-proxy) which targets the JS runtime JavaScriptCore on iOS targets.

### General

* The tool-bar button order has been reworked to group items that are used at a similar point in the development lifecycle (writing code, running/building, committing).
* Fixed missing Clang diagnostics in certain cases.
* Buck build errors now trigger an error notification.
* Arrow keys now scroll through history in Nuclide Console.
* The format-js package is no longer bundled with Nuclide.
* `arc lint` is run with lower CPU and IO scheduling priority.
* Arc build steps are now displayed in a dropdown instead of a Combobox.

### Android Logging

* Fixed the error when running logcat on older devices.
* Fixed parsing for older versions of logcat.

### Source Control

* A loading indicator has been added to the Diff View "selected files" section.
* Fixed git repository changes highlighting in the file tree.
* Fixed a rare CPU usage issue with the Diff View.

## v0.174.0

Hotfix for the exception thrown by requiring the `'invariant'` module in production.

## v0.173.0

Hotfix for rare cases of uncommitted changes view throwing exception when folder is removed.

## v0.172.0

### Highlights

* Enabled context view for C family languages.
* Task runner is now displayed by default.

### Hack

* Added rudimentary hack typedecl and generics syntax highlighting support.
* HHVM toolbar has been moved into the Task Runner.

### Ui

* Updated diagnostics table UI: Consistent look & feel, resizable columns, more content per pixel.
* Improved Breakpoint list UI in the debugger.
* File-tree now supports range selection with shift-click and shift-arrow keys. (thanks Li Li!)
* Ensure that Buck loading messages are displayed in the console.
* Display a loading notification for slow remote file saves/loads.
* Outline view now has an option to display only the short symbol name (thanks Pankaj Kakkar!)
* Clicking on file in uncommitted changes section opens file in editor instead of diff view.

### Flow

* Autofix certain Flow errors caused by slight misspellings.

### OSS

* New console debugger REPL is now available for OSS.
* OSS Nuclide now has access to the new Debugger Selection UI.
* Context view is now available for the OSS.
* PHP debugger supports "Single Request Stepping".

### Fixes

* Fixed uncommitted changes section breaking when there are too many uncommitted files.
* Fix blame error on remote repositories when it needs to pull info from hg server.
* Fixed setInterval timer leak under certain circumstances in debugger's entry point code.
* Fixed remote mercurial repository detection.

## v0.171.0

### Highlights

* Debugger support for attaching to local and remote Node processes.
* Adds a file changes file tree section to quickly browse and diff changes.

### General

* Autofix can now remove unused Flow suppression comments.
* Add keyboard shortcuts for navigating the list of diagnostic messages:
  * Previous: `alt-<`, Next: `alt->`, First: `alt-ctrl-<`, Last: `alt-ctrl->`.
* Diff View is now only showing the current working directory diff / stack changes.
* Console position is now preserved across Atom reloads.
* Distraction Free Mode now also hides "Find and Replace".
* Fix 100% CPU usage infinite loop when opening `atom://` uris (e.g. preferences).

### Debugger

* Added UI in PHP debugger for editing and sending HTTP requests to a chosen endpoint.
* Attach Debugger UI now collapses a row if its content is too large.

## v0.170.0

Hotfix release for spurious Diff View errors.

## v0.169.0

### General:

* Columns in the Diagnostics table are now sortable.
* Dragging the last tab out of a panel will now hide it.
* Outline View is now rendered as a tab.
* Improved React Native Packager errors.
* Task Runner: Unavailable tasks are now marked as disabled in the dropdown.

### Buck:

* Auto-detect the build target of the active file in the targets typeahead.

### Flow:

* Top-level variables are now displayed in Outline View.

## v0.168.0

### General:

* Merged RN iOS Log Tailer & iOS Log Tailer; Filtering is controlled via a setting (which only shows RN logs by default).
* Added tag whitelist setting, with an RN appropriate default.
* Add keyboard shortcut for clearing the console. (Shortcut: `⌃L`)
* tool-bar@^1.0.0 are now the only versions supported.
* Fixed Hack grammar type hinted default parameters.

### Debugger:

* Breakpoint checkboxes in the new debugger UI for enabling and disabling breakpoints now works.
* Fixed bug where the C++ debugger wouldn't attach to a process in certain scenarios.

### Source Control

* Add navigation buttons and keyboard shortcuts (`cmd-ctrl-[` & `cmd-ctrl-]`) to Diff View's toolbar.

## v0.167.1

_OSS only release_

* Workaround possible deferred activation.

## v0.167.0

### General

* Fix incorrect remote file save / reload conflict warnings.

### Languages

* Objective-C: Support go-to-declaration for `#imports`.
* C++: fix out-of-memory crashes with large compile_commands.json files
* Fix default Hyperclick trigger keys for Linux/Windows to be the same as before.

### Debugger

* Fix breakpoint line numbers off by one.
* Breakpoints can now be placed in files with no extension.
* PHP scripts without file extensions are now able to be launched under the debugger from the HHVM toolbar.

### Source Control

* Add navigation buttons and keyboard shortcuts (`cmd-ctrl-]` & `cmd-ctrl-[`) to Diff View's toolbar.
* Add 'Rebase Stacked Commits' option in Diff View's Amend Form.

## v0.166.0

### Highlights

* Allow subdirectories of project roots to be the Current Working Root
* Added Open File in Atom from your remote server:
  * `nuclide/pkg/nuclide-remote-atom-rpc/bin/atom [--wait] <FileName>[:line[:column]]`
* Hyperclick trigger keys are now customizable

### General

* Added Atom commands for all Task Runner tasks (Buck, Swift, etc)
* Remote connection config is now stored under `nuclide.nuclide-remote-projects`
* Remove Recent Files keyboard shortcut (`cmd-alt-r`) due to conflict with React Native packager
* File tree: Only show the "Open Files" label if there are open files

### Languages

* C++: Fix `#pragma mark` positioning in Outline View
* Python: Enable language features for MagicPython users

### Buck

* C++ build errors are now displayed as in-editor diagnostics
* Enable the “Debug” toolbar option for C++ binaries
  * Launch arguments can be provided from the settings button in the toolbar
* Added a Nuclide > Buck submenu for Buck tasks
* Fix race condition with build output

### Debugger

* Single thread/request stepping option for PHP and C++
* Improved UI for attaching the native debugger to a process
* Improved Threads List table
* For C++
  * Suspends all threads besides the active thread while stepping
  * Fix LLDB launch arguments with quotes/escapes
  * Enable Buck "Debug" button for C++ binaries
* For PHP: prevents the debugger from jumping between requests while debugging

### Source Control

* Improve Nuclide's merge conflicts detection to report conflicts only when not resolved in any other merge tool / editor

### Fixes

* Removed hardcoded paths in the debugger in favor of a new PHP Runtime Arguments field in settings
* Removed hack to work around debugger XML corruption bug in HHVM
* Make arc lint autofix more robust

## v0.165.0

### Hotfixes

* Fixed type-hint scroll bar on Atom 1.9.x

## v0.164.0

### Highlights
* New Debugger UI
* Fix issue with lingering code highlights when editing

### General

* Compatibility fixes for Atom 1.9.x
* 40+ quality, performance and & stability improvements
* UX Improvements to task runner, console, NUX tours, ctrl-clicking on mac, and more

### debugger

* UX & UI improvements to native launch/attach modal
* NUX for new debugger UI

### Languages

* Python: Fix outline view with Python 3 typehints
* Clang: Improvements and fixes to autocomplete, C++ diagnostics

### Remote connection
* Fixed: File-tree failed to expand a directory with file names containing `%` character

## v0.163.0

### Hotfixes

* Reverted changes to the diagnostics panel that caused refresh issues
* Put back quick-open modal styles for Atom Dark theme
* Fix a regression that you can't set breakpoint in a non-parsed source file after starting debugging

## v0.162.0

### Highlights

* Hovering over Unicode escape sequences shows a data tip with the phrase rendered
* Performance improvements:
    * Flow uses a lower CPU priority
    * Large remote files (over 2MB) no longer make the editor unusable

### General

* Added developmentMode for easier NUX debugging
* Created a NUX for Diff view
* Fix for horizontal scrolling in file tree in Atom 1.9
* Failed SSH authentication will automatically retry using a password prompt
* Server certificates/keys are no longer stored in `$ATOM_HOME/config.cson`

### C++

* You can specify environment variables in C++ debugger launch UI for target process
* Optional arguments (i.e. with a default) now show up in autocomplete results

## v0.161.0 (hotfix)

* Fix React Native packager (wasn't getting working root)
* Use new command for showing console in Debugger
* Fix file tree resizing in Atom 1.9

## v0.160.0

### General

* New User Experiences (NUXes) are now released and ready for use! These can be used by developers to introduce and guide users around Nuclide features
* `arc build` is now enabled in the task runner (build toolbar) for any repo that supports it
* Added “Always Ignore” option to popup that appears when active bookmark changes
* Fuzzy filename search now respects hg/gitignore

### PHP

* New PHP/HHVM debugger breakpoint calibration/resolution experience

### Python

* Fixed outline view breaking for functions without parameters

### Console

* New button for toggling console added to the toolbar
* Improved consistency of message styling
* Console now appears in panel (instead of the normal workspace)
* Size is restored after panel has been closed

### Task Runner

* Palette commands now give precedence to task runner of the selected task

### React Native

* Packager is now run from current working root

## v0.159.0

* Nuclide version is now reported in the 'Nuclide' menu in the menu bar.

### [New Feature] Swift

* Select "Swift" from the task runner toolbar to build and test Swift packages.
* After you've built a Swift package, Nuclide provides autocompletion suggestions for Swift source files in the package.
* More info https://nuclide.io/docs/languages/swift/
* Thank you @modocache!

### Remote Connection

* Connecting with an empty remote command will now use the default remote command.
* Significantly faster reloading of remote projects with many files open.

### C++:

* The user will now receive an in-editor notification telling them when they have switched threads while debugging.

### HACK:

* The user will now receive an in-editor notification telling them when they have switched requests while debugging.

### Python:

* Display a busy signal while waiting for code formatting results.

### Fixes

* Duplicate error messages from the PHP debugger in the console now report correctly.
* Remote files are restored correctly after restart on Windows.
* Restore cursor state correctly when code formatting large files.

## v0.158.0

* Quick Open: “Open All” button to open all search results (or `shift+enter`)
* Flow: Setting to use the version of Flow installed in individual projects via the `flow-bin` npm package
* Buck: Selected Simulator is now remembered between sessions
* Task Runner: Added toolbar toggle commands for each runner
* Settings: Add a search field that filters for relevant settings
* Code format: Preserve cursor location after full file format (`cmd-shift-c`)
* Performance: Health metric now shows in toolbar to highlight when Nuclide is waiting on external processes
* Python: Fix Find References on import statements

## v0.157.0

* Hotfix service framework erroring on undefined object values (fixes remote Flow type tooltips).

## v0.156.0

### General

* [New Feature] **Bookshelf** feature for tracking open files per bookmark and prompt to open those files on active bookmark changes and customize behavior to '**Always Restore**', '**Always Ignore**' or '**Prompt to Restore**' from Nuclide Settings.
* Added setting controlling the server shutdown confirmation dialog.
* Atom messages now show up in the console.
* [Fixed] Starting the RN debugger no longer pauses in the Executor.js file unexpectedly.
* Context View: Change hotkey from cmd+B to cmd+I to match OSX “Get Info” pattern.
* Context View: Add “open in main editor” button to Definition Preview which opens the currently selected definition displayed in Definition Preview in the main editor pane.
* Turn lint-on-fly on by default for packages compatible with the 'linter' package.

### C/C++

* GTest TEST/TEST_F macros now show up in clang outline view.
* One-click debugging of C++ unit tests via the "Debug" button in the Buck toolbar.


### Python

* Added a setting to disable linting in Python.
* Added a setting to enable linting on the fly.
* [Fixed] A bug with Python flake8 linting where unused `from .. import ..`s would crash the linter.

### UI

* Display a loading indicator while fuzzy filename search is starting up.


## v0.155.0

* v0.152.0, v0.153.0, and v0.154.0 could not be packaged internally - skipping them.
* Hotfix an overly-zealous python linter integration.

## v0.151.0

### General

* [Fixed] Working Sets are significantly faster now.

### React Native

* Improve ADB Logcat errors.
* Notify when the packager is running.

### Buck

* Added settings to allow providing of extra arguments to build/test/run.
* Fixed an issue where Buck project would not be found after reloading Atom.

### Python

* Builtin flake8 linting, uses configuration from the nearest .flake8 file.

### C/C++

* Fixed instability while working with (local) files in large Buck targets.

### Hack

* [Fixed] Autocomplete and XHP, don't insert duplicate ':'
* Improved the Autocomplete UI. In particular make function signatures easily visible.
* Code highlighting now highlights all symbols, not just local variables.

## v0.150.0

* Hotfix a file-tree de-serialization bug resulting in an empty file-tree despite having a project mounted.

## v0.149.0

### General

* Atom 1.8.0 is now the officially supported version of Atom.
* Clicking on Find References preview now takes you to the reference.
* Fixed Remote Project reconnection after a network interruption (like bad wifi or waking).
* Fixed a scrolling bug in Open Files when the selected entry is the active file.
* Fixed remote searching for things that look like broken regexes (e.g. `foo(`).
* Fixed the blame gutter not hiding if blame failed to load.

### C/C++

* Added local-only setting for specifying the clang library path.
* Fixed Nuclide buck source level iOS debugging.
* Show `#pragma mark` in Outline view.

### Console

* RN Packager output now appears in Console.
* Multiple sources can be shown at once in the console.
* Processes can be started and stopped from console source list.

### File Tree

* Added keyboard shortcut (`cmd-f`) to "Search in Directory" from the file-tree.
* Fixed canceling a "save" after a file's remote project root is removed.
* Fixed removing a project after a re-start when that project's directory no longer exists.

### Hack

* Hack grammar now handles `HEREDOC`'s correctly.

## v0.148.0

**General**

* 2-3X faster remote connection initialization
* Fix bug with autoscrolling console
* Various bugfixes for build toolbar
* Build system can be selected using command palette
* Path search: Now respects Atom's “Ignored Names” setting
* More responsive file tree deletion for hg projects

**Buck**

* Build / test output now appears in the console
* Buck commands are now cancellable (press the stop button in the toolbar)

**Python**

* Autocompletion/hyperclick support for Buck-based Python projects
  * Requires that a python_binary or python_unittest target for the source file has been built. Currently we don't automatically run buck build, so make sure to do so manually.
  * Will not work if a dependent python_binary or python_unittest isn't present in a parent directory's TARGETS/BUCK file.
* Import/module resolution for autocompletion/hyperclick relative to top-level module
* New setting to toggle arguments autocompletion

## v0.147.0

Hotfix release. Fixes:

* Conflict resolver opening invalid file paths.
* Check heartbeat version while starting connection for smoother upgrades when the RPC protocol changes.
* Properly handle `getDigestSync` for remote files that no longer exist.

## v0.146.0

Hotfix release. The Context View was misbehaving and causing the remote hack service to timeout.

## v0.145.0

**General**

* More detailed Flow error messages.
* Remote Connection Dialog: Added a “Save” button to save changes to Connection Profiles.
* Remote Connection Dialog: Double clicking a profile now connects to that profile.
* Performance improvements for C++ outline view / diagnostics.

**Source Control**

* Added “Rename bookmark” ability to the bookmarks side bar.

## v0.144.0

Hotfix release

## v0.143.0

**General**

* [New Feature] The file-tree can display a list of open files.
* [New Feature] Drag to move files and directories in the file-tree, including ability to move multiple files at once with cmd/ctrl click.
* Opt-in new behavior for moving editors across panes via keyboard shortcuts ([see details](https://github.com/facebook/nuclide/tree/master/pkg/nuclide-move-item-to-available-pane/#readme)).
* Double click on an outline view item to select it in the editor.
* Fixed docs navigation on nuclide.io.

**Internal**

* Lots of new integration tests that improve Nuclide's reliability & speed up releases.

**Source Control**

* Better error handling and messages for publish failures.
* Diff View: Update UI for project additions/removals.
* Diff View: rate-limit the calls to `hg status`.
* Show author in revision timeline
* Added “show history” to source control context menu.

**Debugger**

* C++ debugger: Various UX improvements for launching debuggee process
* More prominent debugger breakpoints


## v0.142.0

**General**

* Fixed: file-tree could spontaneously collapse on a flaky network.
* New Settings UI Pane (cmd-option-, or Nuclide Settings: Show from the command palette)

**Source Control**

* Diff View is now much faster showing the changed files.

**Python**

* Code formatting on local or remote using pyfmt or yapf, accessible using standard controls (context menu, cmd/ctrl+shift+c, or Edit→Text→Format Code). This will use rules from the nearest .style.yapf, or if not available use yapf's default (pep8). Currently pyfmt or yapf must be in the system path - the path to binary will be configurable in the near future.
* Find references, will only find results within the current file and PYTHONPATH at the moment.



## v0.141.0

* Hotfix for Python httplib server compatibility issues.

## v0.140.0

**General**

* After updating Nuclide, a notification now asks you to reload Atom.
* Atom 1.7.4 is now the minimally required version of Atom.

**Source Control**

* Clear diff view UI when the active file is deleted.
* Diff View: Fix various contents-override errors when the diff view is closed and opened on with a different file.

**Flow**

* Outline view now includes type declarations.
* Fixed race condition that often caused outdated Flow errors to appear, requiring multiple saves to get up-to-date errors.

**C++**

* Threads window for C++ debugger.

**Hack**

* Cmd-B Preview Definition Window.

## v0.139.0

**Python**

* Experimental: Autocompletion and go-to-definition for Python files.

**Hack**

* Debugger warns if HPHPD is attached.

**C++**

* Automatically select the first frame with source code during C++ debugging pause.
* Auto refresh C++ debugger attach process list.
* Decreased resource usage of background indexing processes.

**Buck**

* Added loading indicator for target selector.
* Re-enabled build progress indicator in the toolbar
* iOS simulator dropdown is now hidden for non-iOS projects.

## v0.138.0

Hotfix for an error being thrown during the upgrade process from <0.136 to >=0.137

## v0.137.0

### JavaScript & Hack

* New feature: Added the type-system coverage information.

### C/C++

* Added support for #include hyperclick.
* Improved flags detection for header files.

### OCaml

* Added support for switch between header/source.

### Hack

* Outline improvements:
  * Overall responsiveness.
  * Additional symbols and function params.
  * Modifiers.
  * Highlighting current symbol in the outline view.

### Debugger

* React Native attach UI.

### Source Control

* Typed in publish message is preserved if a publish is canceled.
* hg add and hg remove are reflected properly in the file-tree.
* Existing files can be added to and removed from the Mercurial from Source Control menu.

### General

* Bump Atom version dependency to 1.7.3 and Node to 5.1.1.
* Nuclide logs are always written under system temp dir now.
* Filename search now supports full paths.

### UI:

* z-index fix to combobox in buck build toolbar.
* Nuclide console now shows a notifications when there are new unseen messages.
* Reduced flickering in omni-search.
* Shadow breakpoint is displayed when hovering over the gutter for easier breakpoint toggle.


## v0.136.0

### General

* Fix: file-tree and remote connection modals now appear properly in Atom Beta v1.8.

### Debugger

* Highlight pinned debugger values when they change.
* HHVM Toolbar remembers script arguments for launched scripts when tabs are switched.
* PHP Debugger stability fixes.

### Source Control

* Fix fast editing/saving with long-delay saves reverting user changes.
* Fix diff view updating block decorations to sync with out-of-diff-view edits.
* Fix publish suggestions racing with commit/amend.
* Fix a case when scrolling gets out of sync when opening a new file.
* Fix race condition that leads to closing/re-opening the Diff View not loading the revisions.
* Fix stuck in publishing state after publish/amend.
* Fix padding and invalid scrolling of changes at the end of a buffer.
* [UI] Fixed blame usage for 3rd-party themes ([#484](https://github.com/facebook/nuclide/issues/484)).
* [UI] Better theme coloring for diff blocks.
* [UI] Easier switching to Commit/Amend/Publish.
* [UI] Fix highlighting removed by Atom when editor not focussed when updated.
* [Experiment] Change the default comparison revision to show dirty changes (hg diff result).

### Windows

* Fix: clicking on an item in the diagnostics panel no longer opens a new tab every click.
* Fix: reveal in file-tree does not freeze Nuclide any more.

## v0.135.0

### General

* Remote
    * Variety of remote project reliability improvements.
    * Unsaved file contents will be reopened in a new tab if saving fails while closing a tab.
    * Fix spurious 'file has changed on disk' messages in remote files.
* Quick-open: Fuzzy filename results now always rank at the top of Omnisearch.
* Working Sets now work on Windows.
* Fix z-index issue with Hyperclick suggestions.

### Source Control

* [New] Improved integration: Revert files/directories from the file tree and text editor context menu + shortcut (cmd+alt+shif+r).
* Fix file tree VCS status rendering with hg updates.
* Diff View Publish: faster feedback about the created/updated Phabricator revision.
* Fix mercurial diff stats spiking CPU with Atom >= 1.7 (open source).
* Show the `hg log` for a file or directory. You can launch this view in one of three ways:
    * In the active text editor, use the keyboard shortcut `ctrl-cmd-l` on OS X or `ctrl-shift-l` on Linux/Windows. (Mnemonic: L is for Log!).
    * In the file tree, right-click on a file or folder. From the context menu, select **Source Control** ▶ **Show history**.
    * In the active text editor, right click. From the context menu, select **Show history**.

### JS

* Render `module.exports` in Outline View.

### C/C++/Obj-C

* Go-to-declaration (cmd+click) now works for macros.
* Outline view fixed for Objective-C files.
* Improved autocompletion performance for large files.


## v0.134.0

Hotfix for outline view regression.

## v0.133.0

### General

* Vastly improved file-tree performance for large repositories.
* Added a "Kill Nuclide and Restart" menu option to kill the remote server.
* Output pane now autoscrolls correctly.
* Fixed file-tree appearance with the one-light-ui Atom theme.
* Quick Open: Fixed bug where filename search fails to load at startup.
* Diff View: Improved file switching performance.
* Diff View: Fixed off-by-one diff view blocks.

### PHP

* Added project selector in Debugger Launch/Attach UI (cmd+shift+A)

### C++

* Added outline view support for C++.
* Debugging:
  * Fixed crash while stepping into function with parameters pointing to non-utf8 characters.
  * Support simultaneous debugging from multiple Nuclide instances.

### React Native

* Updated bundled React Native inspector to 0.14.9.
* Improved error messages for adb, syslog, and React Native debugging.

## v0.132.0

* Hotfix double publish.

## v0.131.0

### Added

* cmd+click on npm packages in `package.json` files to open the package's page on npmjs.com.
* The file tree will now highlight changes from local git repositories.
* Test runner "Run in Debug Mode" checkbox.

### Fixed

* UX improvements for the Console window.
* UX improvements for Commit / Amend / Publish.
* Remote "Search in Directory" now finds all results.

### Changed

* Improved search in the file-tree. Contributed by Alexander Juarez (@alexjuarez).
* C++: Hover over 'auto' variable declarations to reveal their type.
* C++: Automatically update include paths when `TARGETS` files change.

## v0.130.0

### Added

* Distraction-Free-Mode:
  - Hide things the file tree and outline view to focus on your code.
  - Toggle Distraction-Free-Mode from the toolbar's eye icon (or trigger the `nuclide-distraction-free-mode:toggle` command).
* Debugging:
  - Native/C++ debugging for remote devserver.
  - Datatips while debugging, hover over identifiers to display their value. Value datatips can be pinned and will update while debugging.
* Settings for specifying the paths of `adb` and `syslog`.
* Source Control context menu in the file tree.
* Support for `BUCK.autodeps` files.
* Enable open files ouside of file-tree in remote server.
* Outline view for JSON files.

### Fixed

* User-visible errors (with troubleshooting tips) are now raised when adb and syslog aren't on the `PATH` and you try to run them.
* Made PHP debugger less crashy when stepping, setting breakpoints, and more.
* Text no longer jumps around while stepping in the debugger.

### Changed

* File-tree scrolling performance was improved.
* Hide debugger panel after stop debugging.
* Nuclide will not load at all in Atom <1.3.0.

## v0.129.0

* Fixes an issue where the Diff View would fetch Mercurial data even if not visible.
* Fixes an issue where Mercurial commands would inherit personal user settings resulting in unexpected behavior when standard commands where aliased with flags.

## v0.128.0

### Added

* Outline View:
  * Python support.
  * Show flow class fields.
  * Highlight the current location of the cursor for JavaScript.

### Fixed

* Made a handful of small improvements to outline view, including improving the UX when outlines are computed slowly.
* Datatip highlight color across themes.
* Async Repository incompatibility with v1.7.0-beta.
* Fix Diff View's tree highlighting deleted commit changes.

### Changed

* The "Nuclide" menu is now before "Window" and "Help".
* Atom 1.6.1 is now the minimally required version.

## v0.127.0

### Added

* Outline view for Flow and Hack. Toggle with the outline icon on the toolbar, or with alt+o.
* Forward/Backwards Navigation Stack with `ctrl-`, and `ctrl-`. (`ctrl-<` and `ctrl->` on linux).
* New "Nuclide" top-level menu.
* Diff View:
  - Browse history & commit (hg only).
  - Persist commit messages between mode switches.
  - Switching modes changes the diff method to show relevant changes only.
  - Open from file tree will select the nearest file change within that directory (or in the selected root).
  - Opening from the toolbar defaults to diffing the current working root (File tree Suitcase icon).
  - Show multiple repos changes in browse mode, while in Commit mode, show only the active repository's relevant changes.
* nuclide-console messages can be copied to clipboard.

### Fixed

* Diff View: Opening a changed file won't revert user changes nor clear undo history.
* React Native debugger no longer pauses on loader breakpoint.
* Performance and stability wins for PHP script debugging, approximately a 2s speedup when launching scripts.
* Fix Remote "file changed on disk" notification without actual changes.
* Fix file reloads, conflict popups or reverting user changes on flaky / slow network connections.
* C++: Significantly faster (~50%) initialization times on devservers.
  - Improved feature coverage for header files in Buck projects.
  - Restarting Atom now clears Clang server state (or try "Clean and Rebuild" from the Nuclide menu).
* Static/out-of-scope variables are no longer shown in “locals” section of lldb debugger.

### Changed

* Toolbar icons split into two groups when you upgrade to tool-bar 0.3.0.
* nuclide-output is now nuclide-console.

## v0.126.0

* Fixes for the `left-pad`/`relative-date` npm unpublishing.

## v0.125.0

### Added

* Buck tests can now be triggered from,
  - The "Test" button in the Buck toolbar, or
  - via Atom commands (command palette or custom keyboard shortcut).
* Diagnostic/linter results table columns are now resizable.
* Settings for custom HHVM, RN node executable and Merlin (OCaml) paths.
* Support Clang macros and brief comments for autocompletion.
* Improvements to evaluation in the HHVM debugger.

### Fixed

* Improved the support for multiple windows in Working Sets.
* Debugger doesn't refresh when reloading React Native apps.
* Opening an already open remote file won't not discard all local changes.
* Focus and blur side bar children (like file-tree).
* Continued improvements to fuzzy file searching.
* Remote search for matches with `:`.
* Preview tab support for Atom 1.6.0+.

## v0.124.0

Fixed:

* Server Crash related to Mercurial / Watchman upgrade rollout.
* Improved the support for multiple Nuclide windows in Working Sets.

## v0.123.0

Added:

* Show Hack Type Coverage - ctrl-alt-shift-V
* Display an error if the Flow server crashes, rather than silently ceasing to provide Flow features.
* Autofix for C++ diagnostics (e.g. for typos and missing semicolons)
* OCaml diagnostics and typehints
* Diff View auto-scroll to first change.
* Show connection profile info next to remote folders in file tree.

Fixed:

* Diff View: Fix multiple race conditions that caused user edits override.
* 3x Optimization to mercurial status queries during updates - fix halting nuclide.
* Better scrolling when navigating with hyperclick and diagnostics.
* Fix Hyperclick error when going out of screen range.
* Improved autocompletion for C++ function/method calls

## v0.122.0

Added:

* Added 'Current Working Root'

Fixed:

* Faster Path Search (blacklist yourself from GK nuclide_file_search_native in case of issues)
* Working Sets selection UI was aligned with core Atom for better compatibility with themes and other UI elements
* Correctly report invalid .buckconfig file
* A bug prevented certain types of Flow errors from appearing. This is now fixed.
* Some fixes for HHVM debugger printing of map-like arrays and other hierarchical data structures.
* HHVM script debugging breakpoints trigger more reliably.

## 0.121.0

Fixed:
* Slow typing caused by the FileTree - even when hidden.
* Fix Slow typing caused by health monitor.
* Fix FB login.
* Fix endDebugWhenNoRequests

## 0.120.0

Added:
* New feature: Working Sets - show only selected directories in the file-tree
* File tree keyboard navigation: Allows you to rapidly change the selected node by typing a prefix string.
* Buck toolbar now shows loading message while querying targets
* Diagnostics panel displays errors above warnings

Fixed:
* Improved Ctags search performance
* Fix some server connection issues

## 0.119.0

* Fix an assertion that can cause the server to crash periodically.

## 0.118.0

### Added

  * Open a newly duplicated file on duplication.
  * Pretty toolbar dividers.
  * React Native debugger w/o Buck.
  * React Native iOS simulator logs.
  * HHVM output is shown in the output window.

### Fixed

  * Correctly remember last connection profile.
  * Close project files when removing project.
  * CMD+C copying from "Find References".

## 0.117.0

* Add commands for debugging non-Buck React Native apps (requires [react-native#5717](https://github.com/facebook/react-native/pull/5715))
* Add commands for running RN Packager without building via Buck
* Fixed “unknown call” warning in RN element inspector
* Added limit on Clang server memory usage
* Improvements to datatip UX: Datatips disappear on keydown, and the default delay is now 200ms and can be configured in settings (Packages > Nuclide > Nuclide-datatip > debounce delay). Also improved the mapping of mouse coordinates to code.

## 0.116.0

* Datatips are now pinnable.
* Make diagnostics look a bit more like datatips.
* Improved arc lint autofix - handling multi-line.
* Improvements to Diff View syncing.
* Diff View supports opening revealing files in the file tree and directly in the editor.
* Fixed specifying custom buck command.
* Fix: Debugger scrolling works in Atom 1.4.x.
* Added code formatting for clang.
* Added custom clang flags in the settings page.
* Minor improvements to remote file handling.
* Disable blinking cursor from readonly editors in (Diff View, Test Runner & Smartlog).

## 0.115.0

* Fixed the OCaml Merlin path config setting
* Fixed Clang autocomplete latency regression
* Fixed diagnostics for local PHP files
* Fixed diagnostics for Hack
* Improved reloading multiple remote projects after a crash
* Improved server reliability by handling invalid marshalling and Watchman recrawls
* Prevent opening files larger than 10MB on the server to prevent crashes

## 0.114.0

### Added

* Output:
  * Panel for displaying log messages.
  * adb-logcat provider (and commands for starting and stopping `adb` logcat).
* Hack: XHP syntax to language grammar.

### Fixed

* Server connection flakiness.
* File-tree: clicking on a selected node with preview tabs enabled opens the file.

### Changed

## 0.113.0

### Added

* Type Hints:
  * Better (faster) UX for triggering and interacting with type hints.
  * ESC/cancel closes current type hint.
  * Experimental support for flow "hint trees" (interactive UI for exploring nested types in type hints). To try it out, enable the "nuclide-flow: Enable Tree-structured Type Hints" setting.
* Lint: Autofix is now enabled by default.
  * Eligible lint errors will have a "Fix" button in the gutter popup.
  * `alt+shift+a` will fix all eligible errors in the current file.
* Debugger: HPHPD-style leading `=` syntax for evaluating expressions is now supported in the debugger console.
* Debugger: Pass multi args to hhvm in script debugging.
* HHVM Debugger: Scripts launched from the HHVM toolbar can now be passed command line arguments.
* Debugger: Add a new contextual menu for regular breakpoints (conditional breakpoints in the works).
* Tool Bar: Add "Hide Tool Bar" context menu for Buck/HHVM.

### Fixed

* ctags: Improve relevancy for JS development, shows results even if Hack service is available.
* C++: Hyperclick performance improvements, better compile error messaging.
* Nuclide Server: Diagnostic improvements.

### Changed

* Blame: Replaced individual show/hide commands with toggle.
* UI: Move Health icon from statusbar to toolbar.

## 0.112.0

### Added

* Dedicated toolbar shortcut icons for toggling the HHVM and Buck top bar.
* Include type information with clang results.
* Quick open for ctags.
* "Reload Atom" on server crash button.
* Connection profiles got a total makeover.

### Fixed

* Reduced clang cache memory consumption.
* diff-view context menu items appear both in Nuclide's file-tree and in Atom's tree-view.
* fb-watchman exceptions.
* Race condition that prevented the diff-view from re-opening on restart.
* React Native debugging for newer versions of React Native (Note: Node v4 still needs to be on Atom's path).

### Changed

* Continued improvements to the experimental filename search.
* hg-repository now checks `default` instead of fb-specific `remote/master`.

## 0.111.0

Nuclide is now a single Atom package named 'nuclide'. All 'nuclide-*' packages are deprecated and
will be unpublished after this release.

* Node Debugger:
  * Now works on node processes running any major version of node/iojs including 0.10.x, 0.12.x,
  1.x, 2.x, 4.x, 5.x.
* Hyperclick:
  * Anything that looks like it might be a valid web address is clickable. Eg. http://cats.com
    (http://cats.com/) (a word with a valid TLD).
  * ctags support: any symbols in a valid 'tags' file in your project directory should be clickable.
  * Fix Hyperclick errors with split panes.
* Settings:
  * All settings are in one spot: Preferences → Packages → Nuclide → Settings.
* File Tree:
  * Preview Tab support. Enable from Packages →  tabs →  Use Preview Tabs.
* Buck Toolbar
  * RN Server checkbox value now remembered after restart
  * Output window can now be moved and split
* C++ support:
  * Significant performance improvements for diagnostics, autocompletion, and click-to-declaration
  * Loading indicator will display in status bar while C++ files are parsing
  * Stability: clang errors should no longer cause the Nuclide server to crash
  * “Find References” support for clang-enabled projects (right click on any symbol)
* More robust Watchman integration for Mercurial and file-change reload features.
* Fix Mercurial blame for remote projects.
* Fix Diff View offset rendering for large diffs and split panes errors.
* Arc lint autofix beta:
  * In the settings for the Nuclide package, check nuclide-diagnostics-ui: enableAutofix.
  * There will then be a 'Fix' button in the popup for eligible lint problems.

## 0.0.35

* Improvements to prevent spawning many Mercurial processes.
* Diff View:
  * Performance Optimizations (Caching and avoid expensive calls when Diff View is closed).
  * Add a 'Navigation Bar' for easier (add/delete/change) line change scrolling
* Hyperclick / Go to definition Improvements:
  * Go to definition doesn't collide with multi-cursor feature (not end up with multiple cursors).
  * Hack: Go to definition shows a navigable suggestion list when hh_server can't determine the
    exact location of the (e.g. dynamically-typed method calls).
  * Hack: XHP go to definition highlights XHP tags correctly (while it still jumps to the right
    place).
  * UX: Fix cursor indicator for loading and result-ready.
* Support formatting of `const` requires in format-js

## 0.0.34

npm-only release. Our Node packages were released so that external packages could consume them, but
we did not update any Atom packages.

## 0.0.33

This was tagged but not released due to an issue.

## 0.0.32

* **Bug Fix**
  * Exclude `nuclide-debugger-node` from `nuclide-installer` until we can fix the issue with
  its native dependencies getting built properly. Fixes
  [#193](https://github.com/facebook/nuclide/issues/193).
  * Hack and Flow diagnostics are now removed appropriately when the corresponding project folder
  is removed.

* **Documentation**
  * Added [README for `nuclide-diagnostics-store`](
  https://github.com/facebook/nuclide/tree/master/pkg/nuclide/diagnostics/store#readme).

## 0.0.31

* **New Feature**

  * **New Diagnostics UI** Previously, we encouraged Nuclide users to install the third-party
[linter](https://atom.io/packages/linter) package in order to see errors from our Flow and Hack
packages, but now we include our own packages for displaying diagnostics as part of Nuclide. We
divided this functionality across two Atom packages:
[nuclide-diagnostics-store](https://atom.io/packages/nuclide-diagnostics-store) and
[nuclide-diagnostics-ui](https://atom.io/packages/nuclide-diagnostics-ui). The former is the
model/controller component where diagnostics are reported and broadcast out to registered listeners.
The latter is the view component that subscribes to the model and presents diagnostics to the user
via editor gutters and a table view. The `nuclide-diagnostics-store` is capable of consuming
providers that conform to the `linter` API in addition to its own API. This means that even if you
disable the `linter` package, you will still see all of the same errors and warnings from packages
that adhere to the `linter` API in Nuclide.
![](https://raw.githubusercontent.com/facebook/nuclide/master/pkg/nuclide/diagnostics/ui/docs/diagnostics-ui.png)
  * **Buck** We now support building with [Buck](https://buckbuild.com/) in Nuclide. If the active
  editor corresponds to a file in a Buck project (which means it has a `.buckconfig` file in its
  ancestor directory), then the Buck toolbar will be displayed at the top of your Atom window.
  From there, you can enter a Buck [build target](https://buckbuild.com/concept/build_target.html)
  or alias, and then choose to build, run, or debug that target. (Note that like most features in
  Nuclide, this also works if you are [working with remote files](http://nuclide.io/docs/remote/).) We
  also syntax highlight `BUCK` files and make it possible to `cmd-click` on build targets to navigate
  between `BUCK` files. As Buck supplies all sorts of information about the structure of your project
  to Nuclide, you can expect us to provide even more integration with Buck going forward.
  * **iOS support** This release builds on top of the new Buck support to also provide support for
  iOS. The major caveat is that your iOS project must be configured to
  [build with Buck](https://buckbuild.com/rule/apple_bundle.html) in order to get support for iOS
  development in Nuclide. Once you have made this investment, common IDE features, such as
  autocomplete, click-to-symbol, and diagnostics reporting will be available for your iOS code in
  Nuclide. You can also build, run, and yes, *debug* your iOS app from Nuclide. As is common in most
  IDEs, you can click in the gutter of an editor to set a breakpoint. When running your app in debug
  mode and you encounter a breakpoint, you can inspect it via the familiar
  [Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools/) UI. Note that the
  Console in the DevTools is wired up to the LLDB REPL, so you can issue LLDB commands such as
  `thread backtrace`.
  * **cxx support** In many ways, iOS support is just a special case of supporting the C-family of
  languages. However, the same caveat still applies: your cxx project needs to
  [build with Buck](https://buckbuild.com/rule/cxx_binary.html) in order to get support for
  autocomplete, click-to-symbol, and diagnostics.
  * **Hack** improvements:
    * Use `hh_client` for the diagnostics result if available for better accuracy and consistency
    and eliminate the false positives of cases not known for the local Hack model.
    * Prioritize Hack's context-sensitive autocompletions over grammar snippets.
    * Autocomplete of static and instance methods does not require a typed prefix (to be more
    predictable).
    * Updated [hh_ide.js](
    https://github.com/facebook/nuclide/blob/master/pkg/nuclide/hack/static/hh_ide.js) to the
    latest HHVM build.
  * **Flow** improvements:
    * Display all Flow errors in the entire project, rather than just those in files that have been
    recently opened.
    * Fix Flow autocomplete, and use snippets to pre-fill function arguments.
  * **hg blame** From the initial launch of Nuclide, one of our most unique features compared to
  most editors is tight integration with Mercurial. In this release, we take things one step further
  by adding support for `hg blame`. If your current file belongs to an Hg repository, you can
  right-click in the editor and choose **Show Blame** from the context menu to see the author and
  changeset ID for each line in a custom gutter. Right-click again and choose **Hide Blame** to
  remove the blame information. (Note that as stated in the
  [README](https://github.com/facebook/nuclide/blob/master/pkg/nuclide/hg-repository/README.md),
  this has been tested with Hg 3.4 and above.)
  * **Diff View** (works only for mercurial repositories): The Diff View now offers more help
  discovering the uncommitted source control changes by showing a highlighted up-to-date file status
  changes in a list on the right and changing the right pane editor to be editable and savable to
  allow previewing the changes in realtime and saving the contents to the filesystem, when ready.
  The Diff View is not yet able to detect and diff against the fork base of the source control to
  allow amend commit diffs iterating on the same commit.
  Usage (Open, Navigate, Edit and Save) is as follows:
    * For a certain file, either choose **Open in Diff View** from the context menu or
    **Packages > Open Diff View** from the Atom's menu bar.
    * Double-clicking changed files in the change list will load the diff for that file.
    * Edit the right pane editor with an updated change and see the diff in real-time.
    * (`cmd-s`) or **File > Save** will save the new contents to the filesystem.
  * **Connection Status:** We now display an icon in the status bar to indicate whether a file is
  local or remote, and whether the server is connected or disconnected.
  * **nuclide-file-tree-deux** We have heard your complaints about
  [nuclide-file-tree](https://github.com/facebook/nuclide/tree/master/pkg/nuclide/file-tree) loud
  and clear, so we have embarked on a [rewrite of our file tree package](
  https://github.com/facebook/nuclide/tree/master/pkg/nuclide/file-tree-deux) named
  `nuclide-file-tree-deux` that uses proper React/Flux design patterns to ensure the tree is
  performant for the largest of directory structures. The new package has not reached feature
  parity with the existing `nuclide-file-tree` quite yet, so it is available for dogfooding, but
  it is not enabled by default. Once we have achieved feature parity, we will replace the code for
  `nuclide-file-tree` with that of `nuclide-file-tree-deux` and will delete the
  `nuclide-file-tree-deux` package.
  * **New service framework** One of the primary features of Nuclide is support for developing
  remote files. This is more than just the ability to edit files on a remote machine: it also means
  surfacing information from developer tools that are running locally on that machine, such as Buck,
  Mercurial, Clang, Hack, and Flow. To that end, we design our integration with these tools to use
  asynchronous APIs that are agnostic to where the tools are running. Our pattern for doing this has
  been continuously evolving, but our most recent implementation focuses on definition files written
  in JavaScript/Flow with RPCs that return promises or observables. Our [nuclide-buck-base](
  https://github.com/facebook/nuclide/tree/master/pkg/nuclide/buck/base) package is the first to
  take advantage of this new framework, but we plan to retrofit the rest of our codebase to use this
  soon. We also intend to document it so that you can define your own remote services that plug into
  [nuclide-server](https://github.com/facebook/nuclide/tree/master/pkg/nuclide/server).
  * **New package: nuclide-move-pane** The [`nuclide-move-pane` package](
  https://atom.io/packages/nuclide-move-pane) overrides the default behavior of `cmd/ctrl-k arrow`
  to *move* the pane rather than split it.
  If you want the original behavior, we encourage you to disable this package.
  * **New package: nuclide-format-js** This package is meant to help format JavaScript code in order
  to speed up development. Currently, it has support for automatically adding, removing, and sorting
  requires. It also understands Flow types and will promote or demote a `require()` when
  appropriate. This feature is still in an experimental phase: please see the
  [README](https://github.com/facebook/nuclide/tree/master/pkg/nuclide/format-js#readme) for the
  heuristics involved and how best to integrate it into your workflow. In the future we will be
  adding more AST based transformations that can be configured on and off.

* **Bug Fix**
  * Improve [`nuclide-ocaml`](https://atom.io/packages/nuclide-ocaml) behavior when `ocamlmerlin` is
missing or errors. Previously this could cause a crash.

## 0.0.30

* **Bug Fix**
  * [#163](https://github.com/facebook/nuclide/issues/163)

## 0.0.29

* **Bug Fix**
  * Fixed the transpilation issue identified in [#162](https://github.com/facebook/nuclide/issues/162).

## 0.0.28

* **New Feature**
  * Babel files in Node and Atom packages are now pre-transpiled prior to publishing. This should
reduce initial startup time for `nuclide-server` as well as for Atom, post-Nuclide install.
Both `nuclide-server` and Atom have schemes to cache their transpilations, but

## 0.0.27

*Scrubbed this release because it would have missed [55efd78b](
https://github.com/facebook/nuclide/commit/55efd78b3eb949129fe582657b5988ce0aa70159).*

## 0.0.26

* **Bug Fix**
  * [#157](https://github.com/facebook/nuclide/issues/157)

## 0.0.25

* **New Feature**
  * Was long overdue for a release. There were 222 commits since `0.0.24`.
  * New Atom package: `nuclide-arcanist`.
  * New Atom package: `nuclide-diagnostics-store`.
  * New Atom package: `nuclide-diagnostics-ui`.
  * New Atom package: `nuclide-find-references`.
  * New Atom package: `nuclide-ocaml`.

## 0.0.24

* **Bug Fix**
  * Back out Facebook-specific code.

## 0.0.23

* **New Feature**
  * Was overdue for a release. There were 76 commits since `0.0.22`.

## 0.0.22

* **Polish**
 * Various small fixes in preparation for [CodeConf 2015](http://codeconf.com/) demo.

## 0.0.21

* **New Feature**
  * Target `linter-plus` rather than `linter` Atom package: [1fc2358e](
https://github.com/facebook/nuclide/commit/1fc2358e646d779c9fe9cb39b22b7c21ad61fa6c).

## 0.0.20

*Initial public release of Nuclide.*
