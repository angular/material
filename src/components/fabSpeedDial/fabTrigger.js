(function() {
  'use strict';

  angular
    .module('material.components.fabTrigger', [ 'material.core' ])
    .directive('mdFabTrigger', MdFabTriggerDirective);

  /**
   * @ngdoc directive
   * @name mdFabTrigger
   * @module material.components.fabSpeedDial
   *
   * @restrict E
   *
   * @description
   * The `<md-fab-trigger>` directive is used inside of a `<md-fab-speed-dial>` or
   * `<md-fab-toolbar>` directive to mark the an element (or elements) as the trigger and setup the
   * proper event listeners.
   *
   * @usage
   * See the `<md-fab-speed-dial>` or `<md-fab-toolbar>` directives for example usage.
   */
  function MdFabTriggerDirective() {
    return {
      restrict: 'E',

      require: ['^?mdFabSpeedDial', '^?mdFabToolbar'],

      link: function(scope, element, attributes, controllers) {
        angular.forEach(controllers, function(controller) {
          if (controller) {
            angular.forEach(element.children(), function(child) {
              angular.element(child).on('focus', controller.open);
              angular.element(child).on('blur', controller.close);
            });
          }
        });
      }
    }
  }
})();

