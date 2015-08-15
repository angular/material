(function() {
  'use strict';

  angular.module('material.components.fabShared', ['material.core'])
    .controller('FabController', FabController);

  function FabController($scope, $element, $animate, $mdUtil, $mdConstant) {
    var vm = this;

    // NOTE: We use async evals below to avoid conflicts with any existing digest loops

    vm.open = function() {
      $scope.$evalAsync("vm.isOpen = true");
    };

    vm.close = function() {
      // Async eval to avoid conflicts with existing digest loops
      $scope.$evalAsync("vm.isOpen = false");

      // Focus the trigger when the element closes so users can still tab to the next item
      $element.find('md-fab-trigger')[0].focus();
    };

    // Toggle the open/close state when the trigger is clicked
    vm.toggle = function() {
      $scope.$evalAsync("vm.isOpen = !vm.isOpen");
    };

    setupDefaults();
    setupListeners();
    setupWatchers();
    fireInitialAnimations();

    function setupDefaults() {
      // Set the default direction to 'down' if none is specified
      vm.direction = vm.direction || 'down';

      // Set the default to be closed
      vm.isOpen = vm.isOpen || false;

      // Start the keyboard interaction at the first action
      resetActionIndex();
    }

    var events = [];

    function setupListeners() {
      var eventTypes = [
        'mousedown', 'mouseup', 'click', 'touchstart', 'touchend', 'focusin', 'focusout'
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
      });
    }

    function resetEvents() {
      events = [];
    }

    function equalsEvents(toCheck) {
      var isEqual, strippedCheck, moreToCheck;

      // Quick check to make sure we don't get stuck in an infinite loop
      var numTests = 0;

      do {
        // Strip out the question mark
        strippedCheck = toCheck.map(function(event) {
          return event.replace('?', '')
        });

        // Check if they are equal
        isEqual = angular.equals(events, strippedCheck);

        // If not, check to see if removing an optional event makes them equal
        if (!isEqual) {
          toCheck = removeOptionalEvent(toCheck);
          moreToCheck = (toCheck.length >= events.length && toCheck.length !== strippedCheck.length);
        }
      }
      while (numTests < 10 && !isEqual && moreToCheck);

      return isEqual;
    }

    function removeOptionalEvent(events) {
      var foundOptional = false;

      return events.filter(function(event) {
        // If we have not found an optional one, keep searching
        if (!foundOptional && event.indexOf('?') !== -1) {
          foundOptional = true;

          // If we find an optional one, remove only that one and keep going
          return false;
        }

        return true;
      });
    }

    function parseEvents(latestEvent) {
      events.push(latestEvent.type);

      // Handle desktop click
      if (equalsEvents(['mousedown', 'focusout?', 'focusin?', 'mouseup', 'click'])) {
        handleItemClick(latestEvent);
        resetEvents();
        return;
      }

      // Handle mobile click/tap (and keyboard enter)
      if (equalsEvents(['touchstart?', 'touchend?', 'click'])) {
        handleItemClick(latestEvent);
        resetEvents();
        return;
      }

      // Handle tab keys (focusin)
      if (equalsEvents(['focusin'])) {
        vm.open();
        resetEvents();
        return;
      }

      // Handle tab keys (focusout)
      if (equalsEvents(['focusout'])) {
        vm.close();
        resetEvents();
        return;
      }

      eventUnhandled();
    }

    /*
     * No event was handled, so setup a timeout to clear the events
     *
     * TODO: Use $mdUtil.debounce()?
     */
    var resetEventsTimeout;

    function eventUnhandled() {
      if (resetEventsTimeout) {
        window.clearTimeout(resetEventsTimeout);
      }

      resetEventsTimeout = window.setTimeout(function() {
        resetEvents();
      }, 250);
    }

    function resetActionIndex() {
      vm.currentActionIndex = -1;
    }

    function setupWatchers() {
      // Watch for changes to the direction and update classes/attributes
      $scope.$watch('vm.direction', function(newDir, oldDir) {
        // Add the appropriate classes so we can target the direction in the CSS
        $animate.removeClass($element, 'md-' + oldDir);
        $animate.addClass($element, 'md-' + newDir);

        // Reset the action index since it may have changed
        resetActionIndex();
      });

      var trigger, actions;

      // Watch for changes to md-open
      $scope.$watch('vm.isOpen', function(isOpen) {
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

    // Fire the animations once in a separate digest loop to initialize them
    function fireInitialAnimations() {
      $mdUtil.nextTick(function() {
        $animate.addClass($element, 'md-noop');
      });
    }

    function enableKeyboard() {
      angular.element(document).on('keydown', keyPressed);
    }

    function disableKeyboard() {
      angular.element(document).off('keydown', keyPressed);
    }

    function keyPressed(event) {
      switch (event.which) {
        case $mdConstant.KEY_CODE.SPACE: event.preventDefault(); return false;
        case $mdConstant.KEY_CODE.ESCAPE: vm.close(); event.preventDefault(); return false;
        case $mdConstant.KEY_CODE.LEFT_ARROW: doKeyLeft(event); return false;
        case $mdConstant.KEY_CODE.UP_ARROW: doKeyUp(event); return false;
        case $mdConstant.KEY_CODE.RIGHT_ARROW: doKeyRight(event); return false;
        case $mdConstant.KEY_CODE.DOWN_ARROW: doKeyDown(event); return false;
      }
    }

    function doActionPrev(event) {
      focusAction(event, -1);
    }

    function doActionNext(event) {
      focusAction(event, 1);
    }

    function focusAction(event, direction) {
      // Grab all of the actions
      var actions = getActionsElement()[0].querySelectorAll('.md-fab-action-item');

      // Disable all other actions for tabbing
      angular.forEach(actions, function(action) {
        angular.element(angular.element(action).children()[0]).attr('tabindex', -1);
      });

      // Increment/decrement the counter with restrictions
      vm.currentActionIndex = vm.currentActionIndex + direction;
      vm.currentActionIndex = Math.min(actions.length - 1, vm.currentActionIndex);
      vm.currentActionIndex = Math.max(0, vm.currentActionIndex);

      // Focus the element
      var focusElement =  angular.element(actions[vm.currentActionIndex]).children()[0];
      angular.element(focusElement).attr('tabindex', 0);
      focusElement.focus();

      // Make sure the event doesn't bubble and cause something else
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    function doKeyLeft(event) {
      if (vm.direction === 'left') {
        doActionNext(event);
      } else {
        doActionPrev(event);
      }
    }

    function doKeyUp(event) {
      if (vm.direction === 'down') {
        doActionPrev(event);
      } else {
        doActionNext(event);
      }
    }

    function doKeyRight(event) {
      if (vm.direction === 'left') {
        doActionPrev(event);
      } else {
        doActionNext(event);
      }
    }

    function doKeyDown(event) {
      if (vm.direction === 'up') {
        doActionPrev(event);
      } else {
        doActionNext(event);
      }
    }

    function isTrigger(element) {
      return $mdUtil.getClosest(element, 'md-fab-trigger');
    }

    function isAction(element) {
      return $mdUtil.getClosest(element, 'md-fab-actions');
    }

    function handleItemClick(event) {
      if (isTrigger(event.target)) {
        vm.toggle();
      }

      if (isAction(event.target)) {
        vm.close();
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