/**
 * @ngdoc module
 * @name material.components.sidenav
 *
 * @description
 * A Sidenav QP component.
 */
angular
  .module('material.components.sidenav', [
    'material.core',
    'material.components.backdrop'
  ])
  .factory('$mdSidenav', SidenavService )
  .directive('mdSidenav', SidenavDirective)
  .directive('mdSidenavFocus', SidenavFocusDirective)
  .controller('$mdSidenavController', SidenavController);


/**
 * @ngdoc service
 * @name $mdSidenav
 * @module material.components.sidenav
 *
 * @description
 * `$mdSidenav` makes it easy to interact with multiple sidenavs
 * in an app.
 *
 * @usage
 * <hljs lang="js">
 * // Async lookup for sidenav instance; will resolve when the instance is available
 * $mdSidenav(componentId).then(function(instance) {
 *   $log.debug( componentId + "is now ready" );
 * });
 * // Async toggle the given sidenav;
 * // when instance is known ready and lazy lookup is not needed.
 * $mdSidenav(componentId)
 *    .toggle()
 *    .then(function(){
 *      $log.debug('toggled');
 *    });
 * // Async open the given sidenav
 * $mdSidenav(componentId)
 *    .open()
 *    .then(function(){
 *      $log.debug('opened');
 *    });
 * // Async close the given sidenav
 * $mdSidenav(componentId)
 *    .close()
 *    .then(function(){
 *      $log.debug('closed');
 *    });
 * // Sync check to see if the specified sidenav is set to be open
 * $mdSidenav(componentId).isOpen();
 * // Sync check to whether given sidenav is locked open
 * // If this is true, the sidenav will be open regardless of close()
 * $mdSidenav(componentId).isLockedOpen();
 * </hljs>
 */
function SidenavService($mdComponentRegistry, $q) {
  return function(handle) {

    // Lookup the controller instance for the specified sidNav instance
    var self;
    var errorMsg = "SideNav '" + handle + "' is not available!";
    var instance = $mdComponentRegistry.get(handle);

    if(!instance) {
      $mdComponentRegistry.notFoundError(handle);
    }

    return self = {
      // -----------------
      // Sync methods
      // -----------------
      isOpen: function() {
        return instance && instance.isOpen();
      },
      isLockedOpen: function() {
        return instance && instance.isLockedOpen();
      },
      // -----------------
      // Async methods
      // -----------------
      toggle: function() {
        return instance ? instance.toggle() : $q.reject(errorMsg);
      },
      open: function() {
        return instance ? instance.open() : $q.reject(errorMsg);
      },
      close: function() {
        return instance ? instance.close() : $q.reject(errorMsg);
      },
      then : function( callbackFn ) {
        var promise = instance ? $q.when(instance) : waitForInstance();
        return promise.then( callbackFn || angular.noop );
      }
    };

    /**
     * Deferred lookup of component instance using $component registry
     */
    function waitForInstance() {
      return $mdComponentRegistry
                .when(handle)
                .then(function( it ){
                  instance = it;
                  return it;
                });
    }
  };
}
/**
 * @ngdoc directive
 * @name mdSidenavFocus
 * @module material.components.sidenav
 *
 * @restrict A
 *
 * @description
 * `mdSidenavFocus` provides a way to specify the focused element when a sidenav opens.
 * This is completely optional, as the sidenav itself is focused by default.
 *
 * @usage
 * <hljs lang="html">
 * <md-sidenav>
 *   <form>
 *     <md-input-container>
 *       <label for="testInput">Label</label>
 *       <input id="testInput" type="text" md-sidenav-focus>
 *     </md-input-container>
 *   </form>
 * </md-sidenav>
 * </hljs>
 **/
function SidenavFocusDirective() {
  return {
    restrict: 'A',
    require: '^mdSidenav',
    link: function(scope, element, attr, sidenavCtrl) {
      // @see $mdUtil.findFocusTarget(...)
    }
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
 * By default, upon opening it will slide out on top of the main content area.
 *
 * For keyboard and screen reader accessibility, focus is sent to the sidenav wrapper by default.
 * It can be overridden with the `md-autofocus` directive on the child element you want focused.
 *
 * @usage
 * <hljs lang="html">
 * <div layout="row" ng-controller="MyController">
 *   <md-sidenav md-component-id="left" class="md-sidenav-left">
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
 *   <md-sidenav md-component-id="right"
 *     md-is-locked-open="$mdMedia('min-width: 333px')"
 *     class="md-sidenav-right">
 *     <form>
 *       <md-input-container>
 *         <label for="testInput">Test input</label>
 *         <input id="testInput" type="text"
 *                ng-model="data" md-autofocus>
 *       </md-input-container>
 *     </form>
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
 * @param {expression=} md-is-open A model bound to whether the sidenav is opened.
 * @param {string=} md-component-id componentId to use with $mdSidenav service.
 * @param {expression=} md-is-locked-open When this expression evalutes to true,
 * the sidenav 'locks open': it falls into the content's flow instead
 * of appearing over it. This overrides the `md-is-open` attribute.
 *
 * The $mdMedia() service is exposed to the is-locked-open attribute, which
 * can be given a media query or one of the `sm`, `gt-sm`, `md`, `gt-md`, `lg` or `gt-lg` presets.
 * Examples:
 *
 *   - `<md-sidenav md-is-locked-open="shouldLockOpen"></md-sidenav>`
 *   - `<md-sidenav md-is-locked-open="$mdMedia('min-width: 1000px')"></md-sidenav>`
 *   - `<md-sidenav md-is-locked-open="$mdMedia('sm')"></md-sidenav>` (locks open on small screens)
 */
function SidenavDirective($mdMedia, $mdUtil, $mdConstant, $mdTheming, $animate, $compile, $parse, $log, $q, $document) {
  return {
    restrict: 'E',
    scope: {
      isOpen: '=?mdIsOpen'
    },
    controller: '$mdSidenavController',
    compile: function(element) {
      element.addClass('md-closed');
      element.attr('tabIndex', '-1');
      return postLink;
    }
  };

  /**
   * Directive Post Link function...
   */
  function postLink(scope, element, attr, sidenavCtrl) {
    var lastParentOverFlow;
    var triggeringElement = null;
    var promise = $q.when(true);

    var isLockedOpenParsed = $parse(attr.mdIsLockedOpen);
    var isLocked = function() {
      return isLockedOpenParsed(scope.$parent, {
        $media: function(arg) {
          $log.warn("$media is deprecated for is-locked-open. Use $mdMedia instead.");
          return $mdMedia(arg);
        },
        $mdMedia: $mdMedia
      });
    };
    var backdrop = $mdUtil.createBackdrop(scope, "md-sidenav-backdrop md-opaque ng-enter");

    $mdTheming.inherit(backdrop, element);

    element.on('$destroy', function() {
      backdrop.remove();
      sidenavCtrl.destroy();
    });

    scope.$on('$destroy', function(){
      backdrop.remove()
    });

    scope.$watch(isLocked, updateIsLocked);
    scope.$watch('isOpen', updateIsOpen);


    // Publish special accessor for the Controller instance
    sidenavCtrl.$toggleOpen = toggleOpen;

    /**
     * Toggle the DOM classes to indicate `locked`
     * @param isLocked
     */
    function updateIsLocked(isLocked, oldValue) {
      scope.isLockedOpen = isLocked;
      if (isLocked === oldValue) {
        element.toggleClass('md-locked-open', !!isLocked);
      } else {
        $animate[isLocked ? 'addClass' : 'removeClass'](element, 'md-locked-open');
      }
      backdrop.toggleClass('md-locked-open', !!isLocked);
    }

    /**
     * Toggle the SideNav view and attach/detach listeners
     * @param isOpen
     */
    function updateIsOpen(isOpen) {
      // Support deprecated md-sidenav-focus attribute as fallback
      var focusEl = $mdUtil.findFocusTarget(element) || $mdUtil.findFocusTarget(element,'[md-sidenav-focus]') || element;
      var parent = element.parent();

      parent[isOpen ? 'on' : 'off']('keydown', onKeyDown);
      backdrop[isOpen ? 'on' : 'off']('click', close);

      if ( isOpen ) {
        // Capture upon opening..
        triggeringElement = $document[0].activeElement;
      }

      disableParentScroll(isOpen);

      return promise = $q.all([
                isOpen ? $animate.enter(backdrop, parent) : $animate.leave(backdrop),
                $animate[isOpen ? 'removeClass' : 'addClass'](element, 'md-closed')
              ])
              .then(function() {
                // Perform focus when animations are ALL done...
                if (scope.isOpen) {
                  focusEl && focusEl.focus();
                }
              });
    }

    /**
     * Prevent parent scrolling (when the SideNav is open)
     */
    function disableParentScroll(disabled) {
      var parent = element.parent();
      if ( disabled && !lastParentOverFlow ) {

        lastParentOverFlow = parent.css('overflow');
        parent.css('overflow', 'hidden');

      } else if (angular.isDefined(lastParentOverFlow)) {

        parent.css('overflow', lastParentOverFlow);
        lastParentOverFlow = undefined;

      }
    }

    /**
     * Toggle the sideNav view and publish a promise to be resolved when
     * the view animation finishes.
     *
     * @param isOpen
     * @returns {*}
     */
    function toggleOpen( isOpen ) {
      if (scope.isOpen == isOpen ) {

        return $q.when(true);

      } else {
        return $q(function(resolve){
          // Toggle value to force an async `updateIsOpen()` to run
          scope.isOpen = isOpen;

          $mdUtil.nextTick(function() {
            // When the current `updateIsOpen()` animation finishes
            promise.then(function(result) {

              if ( !scope.isOpen ) {
                // reset focus to originating element (if available) upon close
                triggeringElement && triggeringElement.focus();
                triggeringElement = null;
              }

              resolve(result);
            });
          });

        });

      }
    }

    /**
     * Auto-close sideNav when the `escape` key is pressed.
     * @param evt
     */
    function onKeyDown(ev) {
      var isEscape = (ev.keyCode === $mdConstant.KEY_CODE.ESCAPE);
      return isEscape ? close(ev) : $q.when(true);
    }

    /**
     * With backdrop `clicks` or `escape` key-press, immediately
     * apply the CSS close transition... Then notify the controller
     * to close() and perform its own actions.
     */
    function close(ev) {
      ev.preventDefault();

      return sidenavCtrl.close();
    }

  }
}

/*
 * @private
 * @ngdoc controller
 * @name SidenavController
 * @module material.components.sidenav
 *
 */
function SidenavController($scope, $element, $attrs, $mdComponentRegistry, $q) {

  var self = this;

  // Use Default internal method until overridden by directive postLink

  // Synchronous getters
  self.isOpen = function() { return !!$scope.isOpen; };
  self.isLockedOpen = function() { return !!$scope.isLockedOpen; };

  // Async actions
  self.open   = function() { return self.$toggleOpen( true );  };
  self.close  = function() { return self.$toggleOpen( false ); };
  self.toggle = function() { return self.$toggleOpen( !$scope.isOpen );  };
  self.$toggleOpen = function(value) { return $q.when($scope.isOpen = value); };

  self.destroy = $mdComponentRegistry.register(self, $attrs.mdComponentId);
}
