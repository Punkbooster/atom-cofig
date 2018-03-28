'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NuxView = undefined;

var _debounce;

function _load_debounce() {
  return _debounce = _interopRequireDefault(require('nuclide-commons/debounce'));
}

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

/* global getComputedStyle */

const VALID_NUX_POSITIONS = new Set(['top', 'bottom', 'left', 'right', 'auto']);
// The maximum number of times the NuxView will attempt to attach to the DOM.
const ATTACHMENT_ATTEMPT_THRESHOLD = 5;
const ATTACHMENT_RETRY_TIMEOUT = 500; // milliseconds
const RESIZE_EVENT_DEBOUNCE_DURATION = 100; // milliseconds
// The frequency with which to poll the element that the NUX is bound to.
const POLL_ELEMENT_INTERVAL = 100; // milliseconds

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-nux');

function validatePlacement(position) {
  return VALID_NUX_POSITIONS.has(position);
}

class NuxView {

  /**
   * Constructor for the NuxView.
   *
   * @param {number} tourId - The ID of the associated NuxTour
   * @param {?string} selectorString - The query selector to use to find an element
    on the DOM to attach to. If null, will use `selectorFunction` instead.
   * @param {?Function} selectorFunction - The function to execute to query an item
    on the DOM to attach to. If this is null, will use `selectorString` inside
    a call to `document.querySelector`.
   * @param {string} position - The position relative to the DOM element that the
    NUX should show.
   * @param {string} content - The content to show in the NUX.
   * @param {?(() => boolean)} completePredicate - Will be used when determining whether
   * the NUX has been completed/viewed. The NUX will only be completed if this returns true.
   * If null, the predicate used will always return true.
   * @param {number} indexInTour - The index of the NuxView in the associated NuxTour
   * @param {number} tourSize - The number of NuxViews in the associated tour
   *
   * @throws Errors if both `selectorString` and `selectorFunction` are null.
   */
  constructor(tourId, selectorString, selectorFunction, position, content, completePredicate = null, indexInTour, tourSize) {
    this._tourId = tourId;
    if (selectorFunction != null) {
      this._selector = selectorFunction;
    } else if (selectorString != null) {
      this._selector = () => document.querySelector(selectorString);
    } else {
      throw new Error('Either the selector or selectorFunction must be non-null!');
    }
    this._content = content;
    this._position = validatePlacement(position) ? position : 'auto';
    this._completePredicate = completePredicate;
    this._index = indexInTour;
    this._finalNuxInTour = indexInTour === tourSize - 1;

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  _createNux(creationAttempt = 1) {
    if (creationAttempt > ATTACHMENT_ATTEMPT_THRESHOLD) {
      this._onNuxComplete(false);
      // An error is logged and tracked instead of simply throwing an error since this function
      // will execute outside of the parent scope's execution and cannot be caught.
      const error = `NuxView #${this._index} for NUX#"${this._tourId}" ` + 'failed to successfully attach to the DOM.';
      logger.error(`ERROR: ${error}`);
      this._track(error, error);
      return;
    }
    const elem = this._selector();
    if (elem == null) {
      const attachmentTimeout = setTimeout(this._createNux.bind(this, creationAttempt + 1), ATTACHMENT_RETRY_TIMEOUT);
      this._disposables.add(new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
        // eslint-disable-next-line eqeqeq
        if (attachmentTimeout !== null) {
          clearTimeout(attachmentTimeout);
        }
      }));
      return;
    }

    // A reference to the element we decorate with classes and listeners is retained
    // for easy cleanup when the NUX is destroyed.
    this._modifiedElem = elem;

    this._tooltipDiv = document.createElement('div');
    this._tooltipDiv.className = 'nuclide-nux-tooltip-helper';
    this._modifiedElem.classList.add('nuclide-nux-tooltip-helper-parent');
    this._modifiedElem.appendChild(this._tooltipDiv);

    this._createDisposableTooltip();

    const debouncedWindowResizeListener = (0, (_debounce || _load_debounce()).default)(this._handleWindowResize.bind(this), RESIZE_EVENT_DEBOUNCE_DURATION, false);
    window.addEventListener('resize', debouncedWindowResizeListener);

    // Destroy the NUX if the element it is bound to is no longer visible.
    const tryDismissTooltip = element => {
      // ヽ༼ຈل͜ຈ༽/ Yay for documentation! ᕕ( ᐛ )ᕗ
      // According to https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent,
      // `offsetParent` returns `null` if the parent or element is hidden.
      // However, it also returns null if the `position` CSS of the element is
      // `fixed`. This case requires a much slower operation `getComputedStyle`,
      // so try and avoid it if possible.
      let isHidden;
      if (element.style.position !== 'fixed') {
        // eslint-disable-next-line eqeqeq
        isHidden = element.offsetParent === null;
      } else {
        isHidden = getComputedStyle(element).display === 'none';
      }
      if (isHidden) {
        // Consider the NUX to be dismissed and mark it as completed.
        this._handleDisposableClick(false);
      }
    };
    // The element is polled every `POLL_ELEMENT_INTERVAL` milliseconds instead
    // of using a MutationObserver. When an element such as a panel is closed,
    // it may not mutate but simply be removed from the DOM - a change which
    // would not be captured by the MutationObserver.
    const pollElementInterval = setInterval(tryDismissTooltip.bind(this, elem), POLL_ELEMENT_INTERVAL);
    this._disposables.add(new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      // eslint-disable-next-line eqeqeq
      if (pollElementInterval !== null) {
        clearInterval(pollElementInterval);
      }
    }));

    const boundClickListener = this._handleDisposableClick.bind(this, true /* continue to the next NUX in the NuxTour */
    );
    this._modifiedElem.addEventListener('click', boundClickListener);
    this._disposables.add(new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      this._modifiedElem.removeEventListener('click', boundClickListener);
      window.removeEventListener('resize', debouncedWindowResizeListener);
    }));
  }

  _handleWindowResize() {
    this._tooltipDisposable.dispose();
    this._createDisposableTooltip();
  }

  _createDisposableTooltip() {
    const LINK_ENABLED = 'nuclide-nux-link-enabled';
    const LINK_DISABLED = 'nuclide-nux-link-disabled';

    // Let the link to the next NuxView be enabled iff
    //  a) it is not the last NuxView in the tour AND
    //  b) there is no condition for completion
    const nextLinkStyle = !this._finalNuxInTour && this._completePredicate == null ? LINK_ENABLED : LINK_DISABLED;

    // Additionally, the `Next` button may be disabled if an action must be completed.
    // In this case we show a hint to the user.
    const nextLinkButton = `\
      <span
        class="nuclide-nux-link ${nextLinkStyle} nuclide-nux-next-link-${this._index}"
        ${nextLinkStyle === LINK_DISABLED ? 'title="Interact with the indicated UI element to proceed."' : ''}>
        Continue
      </span>
    `;

    // The next NUX in the tour can be created and added before this NUX
    // has completed its disposal. So, we attach an index to the classname
    // of the navigation links to specificy which specific NUX the event listener
    // should be attached to.
    // Also, we don't show the
    const content = `\
      <span class="nuclide-nux-content-container">
        <div class="nuclide-nux-content">
            ${this._content}
        </div>
        <div class="nuclide-nux-navigation">
          <span class="nuclide-nux-link ${LINK_ENABLED} nuclide-nux-dismiss-link-${this._index}">
            ${!this._finalNuxInTour ? 'Dismiss' : 'Complete'} Tour
          </span>
          ${!this._finalNuxInTour ? nextLinkButton : ''}
      </div>
    </span>`;

    this._tooltipDisposable = atom.tooltips.add(this._tooltipDiv, {
      title: content,
      trigger: 'manual',
      placement: this._position,
      html: true,
      template: `<div class="tooltip nuclide-nux-tooltip">
                    <div class="tooltip-arrow"></div>
                    <div class="tooltip-inner"></div>
                  </div>`
    });
    this._disposables.add(this._tooltipDisposable);

    if (nextLinkStyle === LINK_ENABLED) {
      const nextElementClickListener = this._handleDisposableClick.bind(this, true /* continue to the next NUX in the tour */
      );
      const nextElement = document.querySelector(`.nuclide-nux-next-link-${this._index}`);

      if (!(nextElement != null)) {
        throw new Error('Invariant violation: "nextElement != null"');
      }

      nextElement.addEventListener('click', nextElementClickListener);
      this._disposables.add(new (_UniversalDisposable || _load_UniversalDisposable()).default(() => nextElement.removeEventListener('click', nextElementClickListener)));
    }

    // Record the NUX as dismissed iff it is not the last NUX in the tour.
    // Clicking "Complete Tour" on the last NUX should be tracked as successful completion.
    const dismissElementClickListener = !this._finalNuxInTour ? this._handleDisposableClick.bind(this, false /* skip to the end of the tour */
    ) : this._handleDisposableClick.bind(this, true /* continue to the next NUX in the tour */
    );
    const dismissElement = document.querySelector(`.nuclide-nux-dismiss-link-${this._index}`);

    if (!(dismissElement != null)) {
      throw new Error('Invariant violation: "dismissElement != null"');
    }

    dismissElement.addEventListener('click', dismissElementClickListener);

    this._disposables.add(new (_UniversalDisposable || _load_UniversalDisposable()).default(() => dismissElement.removeEventListener('click', dismissElementClickListener)));
  }

  _handleDisposableClick(success = true) {
    // If a completion predicate exists, only consider the NUX as complete
    // if the completion condition has been met.
    // Use `success` to short circuit the check and immediately dispose of the NUX.
    if (success && this._completePredicate != null && !this._completePredicate()) {
      return;
    }

    // Cleanup changes made to the DOM.
    this._modifiedElem.classList.remove('nuclide-nux-tooltip-helper-parent');
    this._tooltipDiv.remove();

    this._onNuxComplete(success);
  }

  showNux() {
    this._createNux();
  }

  setNuxCompleteCallback(callback) {
    this._callback = callback;
  }

  _onNuxComplete(success = true) {
    if (this._callback) {
      this._callback(success);
      // Avoid the callback being invoked again.
      this._callback = null;
    }
    this.dispose();
    return success;
  }

  dispose() {
    this._disposables.dispose();
  }

  _track(message, error) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nux-view-action', {
      tourId: this._tourId,
      message: `${message}`,
      error: (0, (_string || _load_string()).maybeToString)(error)
    });
  }
}
exports.NuxView = NuxView;