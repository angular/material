(function() {
  'use strict';

  /**
   * The duration of the CSS animation in milliseconds.
   *
   * @type {number}
   */
  var cssAnimationDuration = 300;

  /**
   * @ngdoc module
   * @name material.components.fabSpeedDial
   */
  angular
    // Declare our module
    .module('material.components.fabSpeedDial', [
      'material.core',
      'material.components.fabShared',
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
   * You may also easily position the trigger by applying one one of the following classes to the
   * `<md-fab-speed-dial>` element:
   *  - `md-fab-top-left`
   *  - `md-fab-top-right`
   *  - `md-fab-bottom-left`
   *  - `md-fab-bottom-right`
   *
   * These CSS classes use `position: absolute`, so you need to ensure that the container element
   * also uses `position: absolute` or `position: relative` in order for them to work.
   *
   * Additionally, you may use the standard `ng-mouseenter` and `ng-mouseleave` directives to
   * open or close the speed dial. However, if you wish to allow users to hover over the empty
   * space where the actions will appear, you must also add the `md-hover-full` class to the speed
   * dial element. Without this, the hover effect will only occur on top of the trigger.
   *
   * See the demos for more information.
   *
   * ## Troubleshooting
   *
   * If your speed dial shows the closing animation upon launch, you may need to use `ng-cloak` on
   * the parent container to ensure that it is only visible once ready. We have plans to remove this
   * necessity in the future.
   *
   * @usage
   * <hljs lang="html">
   * <md-fab-speed-dial md-direction="up" class="md-fling">
   *   <md-fab-trigger>
   *     <md-button aria-label="Add..."><md-icon md-svg-src="/img/icons/plus.svg"></md-icon></md-button>
   *   </md-fab-trigger>
   *
   *   <md-fab-actions>
   *     <md-button aria-label="Add User">
   *       <md-icon md-svg-src="/img/icons/user.svg"></md-icon>
   *     </md-button>
   *
   *     <md-button aria-label="Add Group">
   *       <md-icon md-svg-src="/img/icons/group.svg"></md-icon>
   *     </md-button>
   *   </md-fab-actions>
   * </md-fab-speed-dial>
   * </hljs>
   *
   * @param {string} md-direction From which direction you would like the speed dial to appear
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
      controller: 'MdFabController',
      controllerAs: 'vm',

      link: FabSpeedDialLink
    };

    function FabSpeedDialLink(scope, element) {
      // Prepend an element to hold our CSS variables so we can use them in the animations below
      element.prepend('<div class="_md-css-variables"></div>');
    }
  }

  function MdFabSpeedDialFlingAnimation($timeout) {
    function delayDone(done) { $timeout(done, cssAnimationDuration, false); }

    function runAnimation(element) {
      // Don't run if we are still waiting and we are not ready
      if (element.hasClass('md-animations-waiting') && !element.hasClass('_md-animations-ready')) {
        return;
      }

      var el = element[0];
      var ctrl = element.controller('mdFabSpeedDial');
      var items = el.querySelectorAll('.md-fab-action-item');

      // Grab our trigger element
      var triggerElement = el.querySelector('md-fab-trigger');

      // Grab our element which stores CSS variables
      var variablesElement = el.querySelector('._md-css-variables');

      // Setup JS variables based on our CSS variables
      var startZIndex = parseInt(window.getComputedStyle(variablesElement).zIndex);

      // Always reset the items to their natural position/state
      angular.forEach(items, function(item, index) {
        var styles = item.style;

        styles.transform = styles.webkitTransform = '';
        styles.transitionDelay = '';
        styles.opacity = 1;

        // Make the items closest to the trigger have the highest z-index
        styles.zIndex = (items.length - index) + startZIndex;
      });

      // Set the trigger to be above all of the actions so they disappear behind it.
      triggerElement.style.zIndex = startZIndex + items.length + 1;

      // If the control is closed, hide the items behind the trigger
      if (!ctrl.isOpen) {
        angular.forEach(items, function(item, index) {
          var newPosition, axis;
          var styles = item.style;

          // Make sure to account for differences in the dimensions of the trigger verses the items
          // so that we can properly center everything; this helps hide the item's shadows behind
          // the trigger.
          var triggerItemHeightOffset = (triggerElement.clientHeight - item.clientHeight) / 2;
          var triggerItemWidthOffset = (triggerElement.clientWidth - item.clientWidth) / 2;

          switch (ctrl.direction) {
            case 'up':
              newPosition = (item.scrollHeight * (index + 1) + triggerItemHeightOffset);
              axis = 'Y';
              break;
            case 'down':
              newPosition = -(item.scrollHeight * (index + 1) + triggerItemHeightOffset);
              axis = 'Y';
              break;
            case 'left':
              newPosition = (item.scrollWidth * (index + 1) + triggerItemWidthOffset);
              axis = 'X';
              break;
            case 'right':
              newPosition = -(item.scrollWidth * (index + 1) + triggerItemWidthOffset);
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
          delayDone(done);
        } else {
          done();
        }
      },
      removeClass: function(element, className, done) {
        runAnimation(element);
        delayDone(done);
      }
    };
  }

  function MdFabSpeedDialScaleAnimation($timeout) {
    function delayDone(done) { $timeout(done, cssAnimationDuration, false); }

    var delay = 65;

    function runAnimation(element) {
      var el = element[0];
      var ctrl = element.controller('mdFabSpeedDial');
      var items = el.querySelectorAll('.md-fab-action-item');

      // Grab our element which stores CSS variables
      var variablesElement = el.querySelector('._md-css-variables');

      // Setup JS variables based on our CSS variables
      var startZIndex = parseInt(window.getComputedStyle(variablesElement).zIndex);

      // Always reset the items to their natural position/state
      angular.forEach(items, function(item, index) {
        var styles = item.style,
          offsetDelay = index * delay;

        styles.opacity = ctrl.isOpen ? 1 : 0;
        styles.transform = styles.webkitTransform = ctrl.isOpen ? 'scale(1)' : 'scale(0)';
        styles.transitionDelay = (ctrl.isOpen ? offsetDelay : (items.length - offsetDelay)) + 'ms';

        // Make the items closest to the trigger have the highest z-index
        styles.zIndex = (items.length - index) + startZIndex;
      });
    }

    return {
      addClass: function(element, className, done) {
        runAnimation(element);
        delayDone(done);
      },

      removeClass: function(element, className, done) {
        runAnimation(element);
        delayDone(done);
      }
    };
  }
})();
