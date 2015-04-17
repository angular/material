(function() {
  'use strict';

  angular
    .module('material.components.fabSpeedDial', [
      'material.core',
      'material.components.fabTrigger',
      'material.components.fabActions'
    ])
    .directive('mdFabSpeedDial', MdFabSpeedDialDirective)
    .animation('.md-fling', MdFabSpeedDialFlingAnimation)
    .animation('.md-scale', MdFabSpeedDialScaleAnimation);

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
   *     <md-button><md-icon icon="/img/icons/plus.svg"></md-icon></md-button>
   *   </md-fab-trigger>
   *
   *   <md-fab-actions>
   *     <md-button><md-icon icon="/img/icons/user.svg"></md-icon></md-button>
   *     <md-button><md-icon icon="/img/icons/group.svg"></md-icon></md-button>
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
      controllerAs: 'vm'
    };

    function FabSpeedDialController($scope, $element, $animate) {
      var vm = this;

      // Define our open/close functions
      vm.open = function() {
        vm.isOpen = true;
        $scope.$apply();
      };

      vm.close = function() {
        vm.isOpen = false;
        $scope.$apply();
      };

      setupDefaults();
      setupListeners();
      setupWatchers();

      // Set our default variables
      function setupDefaults() {
        // Set the default direction to 'down' if none is specified
        if (!vm.direction) {
          vm.direction = 'down';
        }

        // Set the default to be closed
        vm.isOpen = vm.isOpen || false;
      }

      // Setup our event listeners
      function setupListeners() {
        $element.on('mouseenter', vm.open);
        $element.on('mouseleave', vm.close);
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

      // Always reset the items to their natural position/state
      angular.forEach(items, function(item, index) {
        item.style.transform = '';
        item.style.transitionDelay = '';
      });

      // If the control is closed, hide the items behind the trigger
      if (!ctrl.isOpen) {
        angular.forEach(items, function(item, index) {
          var newPosition, axis;

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

          item.style.transform = 'translate' + axis + '(' + newPosition + 'px)';
        });
      }
    }

    return {
      addClass: function(element, className, done) {
        if (element.hasClass('md-fling')) {
          runAnimation(element);
        }
      },
      removeClass: function(element, className, done) {
        runAnimation(element);
      }
    }
  }

  function MdFabSpeedDialScaleAnimation() {
    function runAnimation(element) {
      var el = element[0];
      var ctrl = element.controller('mdFabSpeedDial');
      var items = el.querySelectorAll('.md-fab-action-item');

      // Always reset the items to their natural position/state
      angular.forEach(items, function(item, index) {
        item.style.transform = '';
        item.style.transitionDelay = '';
      });

      // If it's open,
      if (ctrl.isOpen) {
        angular.forEach(items, function(item, index) {
          item.style.transform = 'scale(1)';
          item.style.transitionDelay = (index * 100) + 'ms';
        });
      } else {
        angular.forEach(items, function(item, index) {
          item.style.transform = 'scale(0)';
          item.style.transitionDelay = (items.length - index * 100) + 'ms';
        });
      }
    }

    return {
      addClass: function(element, className, done) {
        runAnimation(element);
      },

      removeClass: function(element, className, done) {
        runAnimation(element);
      }
    }
  }
})();
