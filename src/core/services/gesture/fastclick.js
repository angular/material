angular
  .module('material.core')
  .run(attachFastclick);

var isRegistered = false;

function attachFastclick() {
  if (isRegistered) return;
  isRegistered = true;

  var START_EVENTS = 'touchstart pointerdown';
  var MOVE_EVENTS = 'touchmove pointermove';
  var END_EVENTS = 'touchend touchcancel pointerup pointercancel';
  var MAX_TAP_DELAY = 700;
  var MIN_TAP_DELAY = 100;

  // Register all required events on the document.
  angular
    .element(document)
    .on(START_EVENTS, onTouchStart)
    .on(MOVE_EVENTS, onTouchMove)
    .on(END_EVENTS, onTouchEnd)
    .on('click', onClick);

  // Objects which are temporary stored by the touch start event, and will be used on touch end.
  var trackingElement, trackingTouch, trackingTime;
  var preventNextClick, lastClickTime;

  function onTouchStart(event) {
    if (trackingElement || !event.targetTouches) return;

    // Multiple touches, can be ignored, because the touch delay is only occurring on single touches.
    if (event.targetTouches.length > 1) return;

    var touch = event.targetTouches[0];

    // On some old iOS browsers, the event target is a text node, which means that we need to use the parent node.
    trackingElement = event.target.nodeType === Node.TEXT_NODE ? event.target.parentNode : event.target;
    trackingTime = event.timeStamp;

    // We need to create a new object of the touch object, because it's a reference.
    trackingTouch = {
      pageX: touch.pageX,
      pageY: touch.pageY
    }
  }

  function onTouchMove(event) {
    if (!trackingElement) return;

    var touch = event.changedTouches[0];

    // When the touch position has changed, then we can be sure, that it should not dispatch a synthetic click.
    if (Math.abs(touch.pageX - trackingTouch.pageX) > 10 || Math.abs(touch.pageY - trackingTouch.pageY) > 10) {
      trackingElement = null;
    }
  }

  function onTouchEnd(event) {
    if (!trackingElement) return;

    var timeDifference = event.timeStamp - trackingTime;
    // When the touch was longer than the maximum tap delay, then it is not necessary to dispatch a synthetic click.
    if (timeDifference > MAX_TAP_DELAY) {
      trackingElement = null;
      return;
    }

    // When the last click was quicker than the minimum tap delay, then we can skip the next click to avoid
    // a ghost click.
    if (event.timeStamp - lastClickTime <= MIN_TAP_DELAY) {
      preventNextClick = true;
      return;
    }

    if (trackingElement.tabIndex !== -1) trackingElement.focus();

    lastClickTime = event.timeStamp;

    preventNextClick = false;

    event.preventDefault();

    // Dispatch the synthetic click on the target element.
    dispatchClickEvent(trackingElement, event);

    trackingElement = null;
  }

  function onClick(event) {
    if (preventNextClick && !event.fastClickEvent && event.cancelable) {
      event.preventDefault();
      event.stopPropagation();

      preventNextClick = false;
    }
  }

  /**
   * Dispatches a synthetic click event on the specified target, by using the event information from the
   * previous called touch event.
   * @param targetElement
   * @param touchEvent
   */
  function dispatchClickEvent(targetElement, touchEvent) {

    // Some Android Devices are ignoring the click event, if another element is currently focused.
    if (document.activeElement !== targetElement) {
      document.activeElement.blur();
    }

    var touch = touchEvent.changedTouches[0];
    var clickEvent = document.createEvent('MouseEvents');

    clickEvent.initMouseEvent('click', true, true, window, 1, touch.screenX, touch.screenY,
                              touch.clientX, touch.clientY, false, false, false, false, 0, null);

    // We mark all our click events, which have been forwarded from the touch event, to be able to distinguish between
    // the forwarded and delayed touch events.
    clickEvent.fastClickEvent = true;

    targetElement.dispatchEvent(clickEvent);
  }

}