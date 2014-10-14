/**
 * @ngdoc module
 * @name material.components.sidenav
 *
 * @description
 * A Sidenav QP component.
 */
angular.module('material.components.sidenav', [
  'material.core',
  'material.services.registry',
  'material.animations'
])
  .factory('$mdSidenav', [
    '$mdComponentRegistry', 
    mdSidenavService 
  ])
  .directive('mdSidenav', [
    '$timeout',
    '$mdEffects',
    '$$rAF',
    '$mdConstant',
    mdSidenavDirective 
  ])
  .controller('$mdSidenavController', [
    '$scope',
    '$element',
    '$attrs',
    '$timeout',
    '$mdSidenav',
    '$mdComponentRegistry',
    mdSidenavController 
  ]);
  
/*
 * @private
 * @ngdoc object
 * @name mdSidenavController
 * @module material.components.sidenav
 *
 * @description
 * The controller for mdSidenav components.
 */
function mdSidenavController($scope, $element, $attrs, $timeout, $mdSidenav, $mdComponentRegistry) {

  var self = this;

  $mdComponentRegistry.register(this, $attrs.componentId);

  this.isOpen = function() {
    return !!$scope.isOpen;
  };

  /**
   * Toggle the side menu to open or close depending on its current state.
   */
  this.toggle = function() {
    $scope.isOpen = !$scope.isOpen;
  };

  /**
   * Open the side menu
   */
  this.open = function() {
    $scope.isOpen = true;
  };

  /**
   * Close the side menu
   */
  this.close = function() {
    $scope.isOpen = false;
  };
}

/*
 * @private
 * @ngdoc service
 * @name $mdSidenav
 * @module material.components.sidenav
 *
 * @description
 * $mdSidenav makes it easy to interact with multiple sidenavs
 * in an app.
 *
 * @usage
 *
 * ```javascript
 * // Toggle the given sidenav
 * $mdSidenav(componentId).toggle();
 *
 * // Open the given sidenav
 * $mdSidenav(componentId).open();
 *
 * // Close the given sidenav
 * $mdSidenav(componentId).close();
 * ```
 */
function mdSidenavService($mdComponentRegistry) {
  return function(handle) {
    var instance = $mdComponentRegistry.get(handle);
    if(!instance) {
      $mdComponentRegistry.notFoundError(handle);
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
 * @name mdSidenav
 * @module material.components.sidenav
 * @restrict E
 *
 * @description
 *
 * A Sidenav component that can be opened and closed programatically.
 *
 * When used properly with a layout, it will seamleslly stay open on medium
 * and larger screens, while being hidden by default on mobile devices.
 *
 * @usage
 * <hljs lang="html">
 * <div layout="horizontal" ng-controller="MyController">
 *   <md-sidenav component-id="left" class="md-sidenav-left">
 *     Left Nav!
 *   </md-sidenav>
 *
 *   <md-content>
 *     Center Content
 *     <md-button ng-click="openLeftMenu()">
 *       Open Left Menu
 *     </md-button>
 *   </md-content>
 *
 *   <md-sidenav component-id="right" class="md-sidenav-right">
 *     Right Nav!
 *   </md-sidenav>
 * </div>
 * </hljs>
 *
 * <hljs lang="js">
 * var app = angular.module('myApp', ['ngMaterial']);
 * app.controller('MainController', function($scope, $mdSidenav) {
 *   $scope.openLeftMenu = function() {
 *     $mdSidenav('left').toggle();
 *   };
 * });
 * </hljs>
 */
function mdSidenavDirective($timeout, $mdEffects, $$rAF, $mdConstant) {
  return {
    restrict: 'E',
    scope: {},
    controller: '$mdSidenavController',
    compile: compile
  };

  function compile(element, attr) {
    element.addClass('closed');

    return postLink;
  }
  function postLink(scope, element, attr, sidenavCtrl) {
    var backdrop = angular.element('<md-backdrop class="md-sidenav-backdrop">');

    scope.$watch('isOpen', onShowHideSide);
    element.on($mdEffects.TRANSITIONEND_EVENT, onTransitionEnd);

    /**
     * Toggle the SideNav view and attach/detach listeners
     * @param isOpen
     */
    function onShowHideSide(isOpen) {
      var parent = element.parent();

      if (isOpen) {
        element.removeClass('closed');

        parent.append(backdrop);
        backdrop.on('click', close);
        parent.on('keydown', onKeyDown);

      } else {
        backdrop.remove();
        backdrop.off('click', close);
        parent.off('keydown', onKeyDown);
      }

      // Wait until the next frame, so that if the `closed` class was just removed the 
      // element has a chance to 're-initialize' from being display: none.
      $$rAF(function() {
        element.toggleClass('open', !!scope.isOpen);
      });
    }

    function onTransitionEnd(ev) {
      if (ev.target === element[0] && !scope.isOpen) {
        element.addClass('closed');
      }
    }

    /**
     * Auto-close sideNav when the `escape` key is pressed.
     * @param evt
     */
    function onKeyDown(evt) {
      if(evt.which === $mdConstant.KEY_CODE.ESCAPE){
        close();

        evt.preventDefault();
        evt.stopPropagation();
      }
    }

    /**
     * With backdrop `clicks` or `escape` key-press, immediately
     * apply the CSS close transition... Then notify the controller
     * to close() and perform its own actions.
     */
    function close() {

      onShowHideSide( false );

      $timeout(function(){
        sidenavCtrl.close();
      });
    }

  }

}
