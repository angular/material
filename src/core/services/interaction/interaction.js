/**
 * @ngdoc module
 * @name material.core.interaction
 * @description
 * User interaction detection to provide proper accessibility.
 */
angular
  .module('material.core.interaction', [])
  .service('$mdInteraction', MdInteractionService);


/**
 * @ngdoc service
 * @name $mdInteraction
 * @module material.core.interaction
 *
 * @description
 *
 * Service which keeps track of the last interaction type and validates them for several browsers.
 * The service hooks into the document's body and listens for touch, mouse and keyboard events.
 *
 * The most recent interaction type can be retrieved by calling the `getLastInteractionType` method.
 *
 * Here is an example markup for using the interaction service.
 *
 * <hljs lang="js">
 *   var lastType = $mdInteraction.getLastInteractionType();
 *
 *   if (lastType === 'keyboard') {
 *     // We only restore the focus for keyboard users.
 *     restoreFocus();
 *   }
 * </hljs>
 *
 */
function MdInteractionService($timeout, $mdUtil) {
  this.$timeout = $timeout;
  this.$mdUtil = $mdUtil;

  this.bodyElement = angular.element(document.body);
  this.isBuffering = false;
  this.bufferTimeout = null;
  this.lastInteractionType = null;
  this.lastInteractionTime = null;

  // Type Mappings for the different events
  // There will be three three interaction types
  // `keyboard`, `mouse` and `touch`
  // type `pointer` will be evaluated in `pointerMap` for IE Browser events
  this.inputEventMap = {
    'keydown': 'keyboard',
    'mousedown': 'mouse',
    'mouseenter': 'mouse',
    'touchstart': 'touch',
    'pointerdown': 'pointer',
    'MSPointerDown': 'pointer'
  };

  // IE PointerDown events will be validated in `touch` or `mouse`
  // Index numbers referenced here: https://msdn.microsoft.com/library/windows/apps/hh466130.aspx
  this.iePointerMap = {
    2: 'touch',
    3: 'touch',
    4: 'mouse'
  };

  this.initializeEvents();
}

/**
 * Initializes the interaction service, by registering all interaction events to the
 * body element.
 */
MdInteractionService.prototype.initializeEvents = function() {
  // IE browsers can also trigger pointer events, which also leads to an interaction.
  var pointerEvent = 'MSPointerEvent' in window ? 'MSPointerDown' : 'PointerEvent' in window ? 'pointerdown' : null;

  this.bodyElement.on('keydown mousedown', this.onInputEvent.bind(this));

  if ('ontouchstart' in document.documentElement) {
    this.bodyElement.on('touchstart', this.onBufferInputEvent.bind(this));
  }

  if (pointerEvent) {
    this.bodyElement.on(pointerEvent, this.onInputEvent.bind(this));
  }

};

/**
 * Event listener for normal interaction events, which should be tracked.
 * @param event {MouseEvent|KeyboardEvent|PointerEvent|TouchEvent}
 */
MdInteractionService.prototype.onInputEvent = function(event) {
  if (this.isBuffering) {
    return;
  }

  var type = this.inputEventMap[event.type];

  if (type === 'pointer') {
    type = this.iePointerMap[event.pointerType] || event.pointerType;
  }

  this.lastInteractionType = type;
  this.lastInteractionTime = this.$mdUtil.now();
};

/**
 * Event listener for interaction events which should be buffered (touch events).
 * @param event {TouchEvent}
 */
MdInteractionService.prototype.onBufferInputEvent = function(event) {
  this.$timeout.cancel(this.bufferTimeout);

  this.onInputEvent(event);
  this.isBuffering = true;

  // The timeout of 650ms is needed to delay the touchstart, because otherwise the touch will call
  // the `onInput` function multiple times.
  this.bufferTimeout = this.$timeout(function() {
    this.isBuffering = false;
  }.bind(this), 650, false);

};

/**
 * @ngdoc method
 * @name $mdInteraction#getLastInteractionType
 * @description Retrieves the last interaction type triggered in body.
 * @returns {string|null} Last interaction type.
 */
MdInteractionService.prototype.getLastInteractionType = function() {
  return this.lastInteractionType;
};

/**
 * @ngdoc method
 * @name $mdInteraction#isUserInvoked
 * @description Method to detect whether any interaction happened recently or not.
 * @param {number=} checkDelay Time to check for any interaction to have been triggered.
 * @returns {boolean} Whether there was any interaction or not.
 */
MdInteractionService.prototype.isUserInvoked = function(checkDelay) {
  var delay = angular.isNumber(checkDelay) ? checkDelay : 15;

  // Check for any interaction to be within the specified check time.
  return this.lastInteractionTime >= this.$mdUtil.now() - delay;
};
