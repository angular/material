angular
  .module('material.core.interaction', [])
  .service('$mdInteraction', MdInteractionService);

/*
 * @ngdoc service
 * @name $mdInteraction
 * @module material.core.interaction
 *
 * @description
 *
 * Service which keeps track of the last interaction type and validates them for several browsers.
 * The service hooks into the document's body and listens for touch, mouse and keyboard events.
 *
 * The last interaction type can be retrieved by using the `getLastInteractionType` method, which returns
 * the following possible values:
 * - `touch`
 * - `mouse`
 * - `keyboard`
 *
 * Here is an example markup for using the interaction service.
 * ```
 *   var lastType = $mdInteraction.getLastInteractionType();
 *   if (lastType === 'keyboard') {
 *     restoreFocus();
 *   }}
 * ```
 *
 */
function MdInteractionService($timeout) {
  var body = angular.element(document.body);
  var mouseEvent = window.MSPointerEvent ? 'MSPointerDown' : window.PointerEvent ? 'pointerdown' : 'mousedown';
  var buffer = false;
  var timer;
  var lastInteractionType;

  // Type Mappings for the different events
  // There will be three three interaction types
  // `keyboard`, `mouse` and `touch`
  // type `pointer` will be evaluated in `pointerMap` for IE Browser events
  var inputMap = {
    'keydown': 'keyboard',
    'mousedown': 'mouse',
    'mouseenter': 'mouse',
    'touchstart': 'touch',
    'pointerdown': 'pointer',
    'MSPointerDown': 'pointer'
  };

  // IE PointerDown events will be validated in `touch` or `mouse`
  // Index numbers referenced here: https://msdn.microsoft.com/library/windows/apps/hh466130.aspx
  var pointerMap = {
    2: 'touch',
    3: 'touch',
    4: 'mouse'
  };

  function onInput(event) {
    if (buffer) return;
    var type = inputMap[event.type];
    if (type === 'pointer') {
      type = (typeof event.pointerType === 'number') ? pointerMap[event.pointerType] : event.pointerType;
    }
    lastInteractionType = type;
  }

  function onBufferInput(event) {
    $timeout.cancel(timer);

    onInput(event);
    buffer = true;

    // The timeout of 650ms is needed to delay the touchstart, because otherwise the touch will call
    // the `onInput` function multiple times.
    timer = $timeout(function() {
      buffer = false;
    }, 650);
  }

  body.on('keydown', onInput);
  body.on(mouseEvent, onInput);
  body.on('mouseenter', onInput);
  if ('ontouchstart' in document.documentElement) {
    body.on('touchstart', onBufferInput);
  }

  /**
   * Gets the last interaction type triggered in body.
   * Possible return values are `mouse`, `keyboard` and `touch`
   * @returns {string}
   */
  this.getLastInteractionType = function() {
    return lastInteractionType;
  }
}