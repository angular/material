/**
 * @ngdoc module
 * @name material.components.sidenav
 *
 * @description
 * A Sidenav QP component.
 */
angular.module('material.components.sidenav', [
  'material.services.registry'
])
  .factory('$materialSidenav', [
    '$materialComponentRegistry', 
    materialSidenavService 
  ])
  .directive('materialSidenav', [
    materialSidenavDirective 
  ])
  .controller('$materialSidenavController', [
    '$scope',
    '$element',
    '$attrs',
    '$timeout',
    '$document',
    '$materialSidenav',
    '$materialComponentRegistry',
    materialSidenavController 
  ]);
  
/**
 * @ngdoc object
 * @name materialSidenavController
 * @module material.components.sidenav
 *
 * @description
 * The controller for materialSidenav components.
 */
function materialSidenavController($scope, $element, $attrs, $timeout, 
    $document, $materialSidenav, $materialComponentRegistry) {

  var self = this;

  $materialComponentRegistry.register(this, $attrs.componentId);

  // Process a click event on the body to close if necessary
  var bodyClick = function(e) {
    var node = e.target;
    while(node) {
      if(node === $element[0]) {
        // Don't allow clicks originating in the sidenav to close it
        return true;
      }
      node = node.parentNode;
    }

    $scope.$apply(function() {
      self.close();
      onClose();
    });
  };
  /**
   * If the side nav is open, listen for clicks on the content to close it.
   */
  var onOpen = function() {
    $document[0].body.classList.add('material-sidenav-open');

    // Defer the event binding to avoid a false click
    $timeout(function() {
      angular.element($document[0].body).on('click', bodyClick);
    });
  };

  var onClose = function() {
    $document[0].body.classList.remove('material-sidenav-open');
    angular.element($document[0].body).off('click', bodyClick);
  };

  this.isOpen = function() {
    return !!$scope.isOpen;
  };

  /**
   * Toggle the side menu to open or close depending on its current state.
   */
  this.toggle = function() {
    $scope.isOpen = !$scope.isOpen;
    if($scope.isOpen) {
      onOpen();
    } else {
      onClose();
    }
  };

  /**
   * Open the side menu
   */
  this.open = function() {
    $scope.isOpen = true;
    onOpen();
  };

  /**
   * Close the side menu
   */
  this.close = function() {
    $scope.isOpen = false;
    onClose();
  };
}

/**
 * @ngdoc service
 * @name $materialSidenav
 * @module material.components.sidenav
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
    };
  };
}

/**
 * @ngdoc directive
 * @name materialSidenav
 * @module material.components.sidenav
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
