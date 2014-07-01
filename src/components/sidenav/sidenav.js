/**
 * @ngdoc overview
 * @name material.components.sidenav
 *
 * @description
 * A Sidenav QP component.
 */
angular.module('material.components.sidenav', [
  'material.services.registry'
])
  .factory('$materialSidenav', [ '$materialComponentRegistry', materialSidenavService ])
  .controller('$materialSidenavController', [
      '$scope',
      '$element',
      '$attrs',
      '$materialSidenav',
      '$materialComponentRegistry',
    materialSidenavController ])
  .directive('materialSidenav', [ materialSidenavDirective ]);
  
/**
 * @ngdoc controller
 * @name material.components.sidenav.controller:$materialSidenavController
 *
 * @description
 * The controller for materialSidenav components.
 */
function materialSidenavController($scope, $element, $attrs, $materialSidenav, $materialComponentRegistry) {
  $materialComponentRegistry.register(this, $attrs.componentId);

  this.isOpen = function() {
    return !!$scope.isOpen;
  };

  /**
   * Toggle the side menu to open or close depending on its current state.
   */
  this.toggle = function() {
    $scope.isOpen = !$scope.isOpen;
  }

  /**
   * Open the side menu
   */
  this.open = function() {
    $scope.isOpen = true;
  }

  /**
   * Close the side menu
   */
  this.close = function() {
    $scope.isOpen = false;
  }
}

/**
 * @ngdoc service
 * @name material.components.sidenav:$materialSidenav
 *
 * @description
 * $materialSidenav makes it easy to interact with multiple sidenavs
 * in an app.
 *
 * @usage
 *
 * ```javascript
 * // Toggle the given sidenav
 * $materialSidenav.toggle(componentId);
 * // Open the given sidenav
 * $materialSidenav.open(componentId);
 * // Close the given sidenav
 * $materialSidenav.close(componentId);
 * ```
 */
function materialSidenavService($materialComponentRegistry) {
  return function(handle) {
    var instance = $materialComponentRegistry.get(handle);
    if(!instance) {
      $materialComponentRegistry.notFoundError(handle);
    }

    return {
      isOpen: function() {
        if (!instance) { return; }
        return instance.isOpen();
      },
      /**
       * Toggle the given sidenav
       * @param handle the specific sidenav to toggle
       */
      toggle: function() {
        if(!instance) { return; }
        instance.toggle();
      },
      /**
       * Open the given sidenav
       * @param handle the specific sidenav to open
       */
      open: function(handle) {
        if(!instance) { return; }
        instance.open();
      },
      /**
       * Close the given sidenav
       * @param handle the specific sidenav to close
       */
      close: function(handle) {
        if(!instance) { return; }
        instance.close();
      }
    }
  }
}

/**
 * @ngdoc directive
 * @name materialSidenav
 * @restrict E
 *
 * @description
 *
 * A Sidenav component that can be opened and closed programatically.
 *
 * @example
 * <material-sidenav>
 * </material-sidenav>
 */
function materialSidenavDirective() {
  return {
    restrict: 'E',
    transclude: true,
    scope: {},
    template: '<div class="material-sidenav-inner" ng-transclude></div>',
    controller: '$materialSidenavController',
    link: function($scope, $element, $attr) {
      $scope.$watch('isOpen', function(v) {
        if(v) {
          $element.addClass('open');
        } else {
          $element.removeClass('open');
        }
      });
    }
  };
}
