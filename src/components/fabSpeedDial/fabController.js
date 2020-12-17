(function() {
  'use strict';

  angular.module('material.components.fabShared', ['material.core'])
    .controller('MdFabController', MdFabController);

  function MdFabController($scope, $element, $animate, $mdUtil, $mdConstant, $timeout) {
    var ctrl = this;
    var initialAnimationAttempts = 0;

    // NOTE: We use async eval(s) below to avoid conflicts with any existing digest loops

    ctrl.open = function() {
      $scope.$evalAsync("ctrl.isOpen = true");
    };

    ctrl.close = function() {
      // Async eval to avoid conflicts with existing digest loops
      $scope.$evalAsync("ctrl.isOpen = false");

      // Focus the trigger when the element closes so users can still tab to the next item
      $element.find('md-fab-trigger')[0].focus();
    };

    // Toggle the open/close state when the trigger is clicked
    ctrl.toggle = function() {
      $scope.$evalAsync("ctrl.isOpen = !ctrl.isOpen");
    };

    /*
     * AngularJS Lifecycle hook for newer AngularJS versions.
     * Bindings are not guaranteed to have been assigned in the controller, but they are in the
     * $onInit hook.
     */
    ctrl.$onInit = function() {
      setupDefaults();
      setupListeners();
      setupWatchers();

      fireInitialAnimations();
    };

    // For AngularJS 1.4 and older, where there are no lifecycle hooks but bindings are pre-assigned,
    // manually call the $onInit hook.
    if (angular.version.major === 1 && angular.version.minor <= 4) {
      this.$onInit();
    }

    function setupDefaults() {
      // Set the default direction to 'down' if none is specified
      ctrl.direction = ctrl.direction || 'down';

      // Set the default to be closed
      ctrl.isOpen = ctrl.isOpen || false;

      // Start the keyboard interaction at the first action
      resetActionIndex();

      // Add an animations waiting class so we know not to run
      $element.addClass('md-animations-waiting');
    }

    function setupListeners() {
      var eventTypes = [
        'click', 'focusin', 'focusout'
      ];

      // Add our listeners
      angular.forEach(eventTypes, function(eventType) {
        $element.on(eventType, parseEvents);
      });

      // Remove our listeners when destroyed
      $scope.$on('$destroy', function() {
        angular.forEach(eventTypes, function(eventType) {
          $element.off(eventType, parseEvents);
        });

        // remove any attached keyboard handlers in case element is removed while
        // speed dial is open
        disableKeyboard();
      });
    }

    var closeTimeout;

    /**
     * @param {MouseEvent} event
     */
    function parseEvents(event) {
      // If the event is a click, just handle it
      if (event.type == 'click') {
        handleItemClick(event);
      }

      // If we focusout, set a timeout to close the element
      if (event.type == 'focusout' && !closeTimeout) {
        closeTimeout = $timeout(function() {
          ctrl.close();
        }, 100, false);
      }

      // If we see a focusin and there is a timeout about to run, cancel it so we stay open
      if (event.type == 'focusin' && closeTimeout) {
        $timeout.cancel(closeTimeout);
        closeTimeout = null;
      }
    }

    function resetActionIndex() {
      ctrl.currentActionIndex = -1;
    }

    function setupWatchers() {
      // Watch for changes to the direction and update classes/attributes
      $scope.$watch('ctrl.direction', function(newDir, oldDir) {
        // Add the appropriate classes so we can target the direction in the CSS
        $animate.removeClass($element, 'md-' + oldDir);
        $animate.addClass($element, 'md-' + newDir);

        // Reset the action index since it may have changed
        resetActionIndex();
      });

      var trigger, actions;

      // Watch for changes to md-open
      $scope.$watch('ctrl.isOpen', function(isOpen) {
        // Reset the action index since it may have changed
        resetActionIndex();

        // We can't get the trigger/actions outside of the watch because the component hasn't been
        // linked yet, so we wait until the first watch fires to cache them.
        if (!trigger || !actions) {
          trigger = getTriggerElement();
          actions = getActionsElement();
        }

        if (isOpen) {
          enableKeyboard();
        } else {
          disableKeyboard();
        }

        var toAdd = isOpen ? 'md-is-open' : '';
        var toRemove = isOpen ? '' : 'md-is-open';

        // Set the proper ARIA attributes
        trigger.attr('aria-haspopup', true);
        trigger.attr('aria-expanded', isOpen);
        actions.attr('aria-hidden', !isOpen);

        // Animate the CSS classes
        $animate.setClass($element, toAdd, toRemove);
      });
    }

    function fireInitialAnimations() {
      // If the element is actually visible on the screen
      if ($element[0].scrollHeight > 0) {
        // Fire our animation
        $animate.addClass($element, '_md-animations-ready').then(function() {
          // Remove the waiting class
          $element.removeClass('md-animations-waiting');
        });
      }

      // Otherwise, try for up to 1 second before giving up
      else if (initialAnimationAttempts < 10) {
        $timeout(fireInitialAnimations, 100);

        // Increment our counter
        initialAnimationAttempts = initialAnimationAttempts + 1;
      }
    }

    function enableKeyboard() {
      $element.on('keydown', keyPressed);

      // On the next tick, setup a check for outside clicks; we do this on the next tick to avoid
      // clicks/touches that result in the isOpen attribute changing (e.g. a bound radio button)
      $mdUtil.nextTick(function() {
        angular.element(document).on('click touchend', checkForOutsideClick);
      });
    }

    function disableKeyboard() {
      $element.off('keydown', keyPressed);
      angular.element(document).off('click touchend', checkForOutsideClick);
    }

    function checkForOutsideClick(event) {
      if (event.target) {
        var closestTrigger = $mdUtil.getClosest(event.target, 'md-fab-trigger');
        var closestActions = $mdUtil.getClosest(event.target, 'md-fab-actions');

        if (!closestTrigger && !closestActions) {
          ctrl.close();
        }
      }
    }

    /**
     * @param {KeyboardEvent} event
     * @returns {boolean}
     */
    function keyPressed(event) {
      switch (event.which) {
        case $mdConstant.KEY_CODE.ESCAPE: ctrl.close(); event.preventDefault(); return false;
        case $mdConstant.KEY_CODE.LEFT_ARROW: doKeyLeft(event); return false;
        case $mdConstant.KEY_CODE.UP_ARROW: doKeyUp(event); return false;
        case $mdConstant.KEY_CODE.RIGHT_ARROW: doKeyRight(event); return false;
        case $mdConstant.KEY_CODE.DOWN_ARROW: doKeyDown(event); return false;
        case $mdConstant.KEY_CODE.TAB: doShift(event); return false;
      }
    }

    function doActionPrev(event) {
      focusAction(event, -1);
    }

    function doActionNext(event) {
      focusAction(event, 1);
    }

    function focusAction(event, direction) {
      var actions = getActionsElement()[0].querySelectorAll('.md-fab-action-item');
      var previousActionIndex = ctrl.currentActionIndex;

      // Increment/decrement the counter with restrictions
      ctrl.currentActionIndex = ctrl.currentActionIndex + direction;
      ctrl.currentActionIndex = Math.min(actions.length - 1, ctrl.currentActionIndex);
      ctrl.currentActionIndex = Math.max(0, ctrl.currentActionIndex);

      // Let Tab and Shift+Tab escape if we're trying to move past the start/end.
      if (event.which !== $mdConstant.KEY_CODE.TAB ||
          previousActionIndex !== ctrl.currentActionIndex) {
        // Focus the element
        var focusElement = angular.element(actions[ctrl.currentActionIndex]).children()[0];
        focusElement.focus();

        // Make sure the event doesn't bubble and cause something else
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }

    function doKeyLeft(event) {
      if (ctrl.direction === 'left') {
        doActionNext(event);
      } else {
        doActionPrev(event);
      }
    }

    function doKeyUp(event) {
      if (ctrl.direction === 'down') {
        doActionPrev(event);
      } else {
        doActionNext(event);
      }
    }

    function doKeyRight(event) {
      if (ctrl.direction === 'left') {
        doActionPrev(event);
      } else {
        doActionNext(event);
      }
    }

    function doKeyDown(event) {
      if (ctrl.direction === 'up') {
        doActionPrev(event);
      } else {
        doActionNext(event);
      }
    }

    function doShift(event) {
      if (event.shiftKey) {
        doActionPrev(event);
      } else {
        doActionNext(event);
      }
    }

    /**
     * @param {Node} element
     * @returns {Node|null}
     */
    function getClosestButton(element) {
      return $mdUtil.getClosest(element, 'button') || $mdUtil.getClosest(element, 'md-button');
    }

    /**
     * @param {Node} element
     * @returns {Node|null}
     */
    function getClosestTrigger(element) {
      return $mdUtil.getClosest(element, 'md-fab-trigger');
    }

    /**
     * @param {Node} element
     * @returns {Node|null}
     */
    function getClosestAction(element) {
      return $mdUtil.getClosest(element, 'md-fab-actions');
    }

    /**
     * @param {MouseEvent|FocusEvent} event
     */
    function handleItemClick(event) {
      var closestButton = event.target ? getClosestButton(event.target) : null;

      // Check that the button in the trigger is not disabled
      if (closestButton && !closestButton.disabled) {
        if (getClosestTrigger(event.target)) {
          ctrl.toggle();
        }
      }

      if (getClosestAction(event.target)) {
        ctrl.close();
      }
    }

    function getTriggerElement() {
      return $element.find('md-fab-trigger');
    }

    function getActionsElement() {
      return $element.find('md-fab-actions');
    }
  }
})();
