(function() {
  'use strict';

  angular
    // Declare our module
    .module('material.components.fabSpeedDial', [
      'material.core',
      'material.components.fabTrigger',
      'material.components.fabActions'
    ])

    // Register our directive
    .directive('mdFabSpeedDial', MdFabSpeedDialDirective)

    // Register our custom animations
    .animation('.md-fling', MdFabSpeedDialFlingAnimation)
    .animation('.md-scale', MdFabSpeedDialScaleAnimation)

    // Register a service for each animation so that we can easily inject them into unit tests
    .service('mdFabSpeedDialFlingAnimation', MdFabSpeedDialFlingAnimation)
    .service('mdFabSpeedDialScaleAnimation', MdFabSpeedDialScaleAnimation);

  /**
   * @ngdoc directive
   * @name mdFabSpeedDial
   * @module material.components.fabSpeedDial
   *
   * @restrict E
   *
   * @description
   * The `<md-fab-speed-dial>` directive is used to present a series of popup elements (usually
   * `<md-button>`s) for quick access to common actions.
   *
   * There are currently two animations available by applying one of the following classes to
   * the component:
   *
   *  - `md-fling` - The speed dial items appear from underneath the trigger and move into their
   *    appropriate positions.
   *  - `md-scale` - The speed dial items appear in their proper places by scaling from 0% to 100%.
   *
   * @usage
   * <hljs lang="html">
   * <md-fab-speed-dial direction="up" class="md-fling">
   *   <md-fab-trigger>
   *     <md-button aria-label="Add..."><md-icon icon="/img/icons/plus.svg"></md-icon></md-button>
   *   </md-fab-trigger>
   *
   *   <md-fab-actions>
   *     <md-button aria-label="Add User">
   *       <md-icon icon="/img/icons/user.svg"></md-icon>
   *     </md-button>
   *
   *     <md-button aria-label="Add Group">
   *       <md-icon icon="/img/icons/group.svg"></md-icon>
   *     </md-button>
   *   </md-fab-actions>
   * </md-fab-speed-dial>
   * </hljs>
   *
   * @param {string=} md-direction From which direction you would like the speed dial to appear
   * relative to the trigger element.
   * @param {expression=} md-open Programmatically control whether or not the speed-dial is visible.
   */
  function MdFabSpeedDialDirective() {
    return {
      restrict: 'E',

      scope: {
        direction: '@?mdDirection',
        isOpen: '=?mdOpen'
      },

      bindToController: true,
      controller: FabSpeedDialController,
      controllerAs: 'vm',

      link: FabSpeedDialLink
    };

    function FabSpeedDialLink(scope, element) {
      // Prepend an element to hold our CSS variables so we can use them in the animations below
      element.prepend('<div class="md-css-variables"></div>');
    }

    function FabSpeedDialController($scope, $element, $animate, $mdUtil) {
      var vm = this;

      // Define our open/close functions
      // Note: Used by fabTrigger and fabActions directives
      vm.open = function() {
        // Async eval to avoid conflicts with existing digest loops
        $scope.$evalAsync("vm.isOpen = true");
      };

      vm.close = function() {
        // Async eval to avoid conflicts with existing digest loops
        // Only close if we do not currently have mouse focus (since child elements can call this)
        !vm.moused && $scope.$evalAsync("vm.isOpen = false");
      };

      vm.mouseenter = function() {
        vm.moused = true;
        vm.open();
      };

      vm.mouseleave = function() {
        vm.moused = false;
        vm.close();
      };

      setupDefaults();
      setupListeners();
      setupWatchers();

      // Fire the animations once in a separate digest loop to initialize them
      $mdUtil.nextTick(function() {
        $animate.addClass($element, 'md-noop');
      });

      // Set our default variables
      function setupDefaults() {
        // Set the default direction to 'down' if none is specified
        vm.direction = vm.direction || 'down';

        // Set the default to be closed
        vm.isOpen = vm.isOpen || false;
      }

      // Setup our event listeners
      function setupListeners() {
        $element.on('mouseenter', vm.mouseenter);
        $element.on('mouseleave', vm.mouseleave);
      }

      // Setup our watchers
      function setupWatchers() {
        // Watch for changes to the direction and update classes/attributes
        $scope.$watch('vm.direction', function(newDir, oldDir) {
          // Add the appropriate classes so we can target the direction in the CSS
          $animate.removeClass($element, 'md-' + oldDir);
          $animate.addClass($element, 'md-' + newDir);
        });


        // Watch for changes to md-open
        $scope.$watch('vm.isOpen', function(isOpen) {
          var toAdd = isOpen ? 'md-is-open' : '';
          var toRemove = isOpen ? '' : 'md-is-open';

          $animate.setClass($element, toAdd, toRemove);
        });
      }
    }
  }

  function MdFabSpeedDialFlingAnimation() {
    function runAnimation(element) {
      var el = element[0];
      var ctrl = element.controller('mdFabSpeedDial');
      var items = el.querySelectorAll('.md-fab-action-item');

      // Grab our element which stores CSS variables
      var variablesElement = el.querySelector('.md-css-variables');

      // Setup JS variables based on our CSS variables
      var startZIndex = variablesElement.style.zIndex;

      // Always reset the items to their natural position/state
      angular.forEach(items, function(item, index) {
        var styles = item.style;

        styles.transform = styles.webkitTransform = '';
        styles.transitionDelay = '';
        styles.opacity = 1;

        // Make the items closest to the trigger have the highest z-index
        styles.zIndex = (items.length - index) + startZIndex;
      });

      // If the control is closed, hide the items behind the trigger
      if (!ctrl.isOpen) {
        angular.forEach(items, function(item, index) {
          var newPosition, axis;
          var styles = item.style;

          switch (ctrl.direction) {
            case 'up':
              newPosition = item.scrollHeight * (index + 1);
              axis = 'Y';
              break;
            case 'down':
              newPosition = -item.scrollHeight * (index + 1);
              axis = 'Y';
              break;
            case 'left':
              newPosition = item.scrollWidth * (index + 1);
              axis = 'X';
              break;
            case 'right':
              newPosition = -item.scrollWidth * (index + 1);
              axis = 'X';
              break;
          }

          var newTranslate = 'translate' + axis + '(' + newPosition + 'px)';

          styles.transform = styles.webkitTransform = newTranslate;
        });
      }
    }

    return {
      addClass: function(element, className, done) {
        if (element.hasClass('md-fling')) {
          runAnimation(element);
          done();
        }
      },
      removeClass: function(element, className, done) {
        runAnimation(element);
        done();
      }
    }
  }

  function MdFabSpeedDialScaleAnimation() {
    var delay = 65;

    function runAnimation(element) {
      var el = element[0];
      var ctrl = element.controller('mdFabSpeedDial');
      var items = el.querySelectorAll('.md-fab-action-item');

      // Always reset the items to their natural position/state
      angular.forEach(items, function(item, index) {
        var styles = item.style,
          offsetDelay = index * delay;

        styles.opacity = ctrl.isOpen ? 1 : 0;
        styles.transform = styles.webkitTransform = ctrl.isOpen ? 'scale(1)' : 'scale(0)';
        styles.transitionDelay = (ctrl.isOpen ?  offsetDelay : (items.length - offsetDelay)) + 'ms';
      });
    }

    return {
      addClass: function(element, className, done) {
        runAnimation(element);
        done();
      },

      removeClass: function(element, className, done) {
        runAnimation(element);
        done();
      }
    }
  }
})();
