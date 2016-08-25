(function() {
  'use strict';

  /**
   * @ngdoc module
   * @name material.components.fabActions
   */
  angular
    .module('material.components.fabActions', ['material.core'])
    .directive('mdFabActions', MdFabActionsDirective);

  /**
   * @ngdoc directive
   * @name mdFabActions
   * @module material.components.fabActions
   *
   * @restrict E
   *
   * @description
   * The `<md-fab-actions>` directive is used inside of a `<md-fab-speed-dial>` or
   * `<md-fab-toolbar>` directive to mark an element (or elements) as the actions and setup the
   * proper event listeners.
   *
   * @usage
   * See the `<md-fab-speed-dial>` or `<md-fab-toolbar>` directives for example usage.
   */
  function MdFabActionsDirective($mdUtil) {
    return {
      restrict: 'E',

      require: ['^?mdFabSpeedDial', '^?mdFabToolbar'],
  
      compile: function(element, attributes) {
        var children = element.children();

        var hasNgRepeat = $mdUtil.prefixer().hasAttribute(children, 'ng-repeat');
        var hasReverse = attributes.mdReverse || attributes.mdReverse == "";

        // We don't want to be able to use reverse with NgRepeat
        // You should be reversing it in your controller if you are using NgRepeat
        if (hasReverse && !hasNgRepeat) {
          var childrenArr = [].slice.call(children);
          element.empty();
          childrenArr.reverse().forEach(function(child){
            element.append(child);
          });
          children = element.children();
        }

        // Support both ng-repeat and static content
        if (hasNgRepeat) {
          children.addClass('md-fab-action-item');
        } else {
          // Wrap every child in a new div and add a class that we can scale/fling independently
          children.wrap('<div class="md-fab-action-item">');
        }
      }
    }
  }

})();
