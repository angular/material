(function() {
  'use strict';

  angular
    .module('material.components.fabActions', ['material.core'])
    .directive('mdFabActions', MdFabActionsDirective);

  /**
   * @ngdoc directive
   * @name mdFabActions
   * @module material.components.fabSpeedDial
   *
   * @restrict E
   *
   * @description
   * The `<md-fab-actions>` directive is used inside of a `<md-fab-speed-dial>` or
   * `<md-fab-toolbar>` directive to mark the an element (or elements) as the actions and setup the
   * proper event listeners.
   *
   * @usage
   * See the `<md-fab-speed-dial>` or `<md-fab-toolbar>` directives for example usage.
   */
  function MdFabActionsDirective() {
    return {
      restrict: 'E',

      require: ['^?mdFabSpeedDial', '^?mdFabToolbar'],

      compile: function(element, attributes) {
        var children = element.children();

        // Support both ng-repat and static content
        if (children.attr('ng-repeat')) {
          children.addClass('md-fab-action-item');
        } else {
          // Wrap every child in a new div and add a class that we can scale/fling independently
          children.wrap('<div class="md-fab-action-item">');
        }

        return function postLink(scope, element, attributes, controllers) {
          // Grab whichever parent controller is used
          var controller = controllers[0] || controllers[1];

          // Make the children open/close their parent directive
          if (controller) {
            angular.forEach(element.children(), function(child) {
              // Attach listeners to the `md-fab-action-item`
              child = angular.element(child).children()[0];

              angular.element(child).on('focus', controller.open);
              angular.element(child).on('blur', controller.close);
            });
          }
        }
      }
    }
  }

})();
