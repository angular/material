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
  'material.services.media',
  'material.animations'
])
  .factory('$mdSidenav', [
    '$mdComponentRegistry', 
    mdSidenavService 
  ])
  .directive('mdSidenav', [
    '$timeout',
    '$animate',
    '$parse',
    '$mdMedia',
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
  this.toggle = function() {
    $scope.isOpen = !$scope.isOpen;
  };
  this.open = function() {
    $scope.isOpen = true;
  };
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
        return instance && instance.isOpen();
      },
      toggle: function() {
        instance && instance.toggle();
      },
      open: function() {
        instance && instance.open();
      },
      close: function() {
        instance && instance.close();
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
 * When opened, it will appear above the app's main content area,
 * unless a `lock-open` attribute is provided (see below).
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
 * app.controller('MyController', function($scope, $mdSidenav) {
 *   $scope.openLeftMenu = function() {
 *     $mdSidenav('left').toggle();
 *   };
 * });
 * </hljs>
 *
 * @param {string=} component-id componentId to use with $mdSidenav 
 * service.
 * @param {expression=} lock-open When this expression evalutes to true,
 * the sidenav 'locks open': it falls into the content's flow instead
 * of appearing above it.
 *
 * A $media() function is exposed to the expression, which
 * can be given a media query or one of the `sm`, `md` or `lg` presets.
 * Examples:
 *
 *   - `<md-sidenav lock-open="shouldLockOpen"></md-sidenav>`
 *   - `<md-sidenav lock-open="$media('min-width: 1000px')"></md-sidenav>`
 *   - `<md-sidenav lock-open="$media('sm')"></md-sidenav>` <!-- locks open on small screens !-->
 */
function mdSidenavDirective($timeout, $animate, $parse, $mdMedia, $mdConstant) {
  return {
    restrict: 'E',
    scope: {},
    controller: '$mdSidenavController',
    link: postLink
  };

  function postLink(scope, element, attr, sidenavCtrl) {
    var lockOpenParsed = $parse(attr.lockOpen);
    var backdrop = angular.element(
      '<md-backdrop class="md-sidenav-backdrop">'
   );

    scope.$watch('isOpen', setOpen);
    scope.$watch(function() {
      return lockOpenParsed(scope.$parent, {
        $media: $mdMedia
      });
    }, function(isLocked) {
      element.toggleClass('lock-open', !!isLocked);
      backdrop.toggleClass('lock-open', !!isLocked);
    });

    /**
     * Toggle the SideNav view and attach/detach listeners
     * @param isOpen
     */
    function setOpen(isOpen) {
      var parent = element.parent();

      parent[isOpen ? 'on' : 'off']('keydown', onKeyDown);
      $animate[isOpen ? 'addClass' : 'removeClass'](element, 'open');

      $animate[isOpen ? 'enter' : 'leave'](backdrop, parent);
      backdrop[isOpen ? 'on' : 'off']('click', close);
    }

    /**
     * Auto-close sideNav when the `escape` key is pressed.
     * @param evt
     */
    function onKeyDown(ev) {
      if (ev.which === $mdConstant.KEY_CODE.ESCAPE) {
        close();
        ev.preventDefault();
        ev.stopPropagation();
      }
    }

    /**
     * With backdrop `clicks` or `escape` key-press, immediately
     * apply the CSS close transition... Then notify the controller
     * to close() and perform its own actions.
     */
    function close() {
      $timeout(function(){
        sidenavCtrl.close();
      });
    }

  }

}
