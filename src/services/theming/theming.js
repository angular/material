/*
 * @ngdoc module
 * @name material.services.theming
 * @description InterimElement
 */

angular.module('material.services.theming', [
])
.directive('mdTheme', [
  '$interpolate',
  ThemingDirective
])
.directive('mdThemable', [
  '$mdTheming',
  ThemableDirective
])
.factory('$mdTheming', [
  '$rootScope',
  Theming
]);

/*
 * @ngdoc service
 * @name $mdTheming
 *
 * @description
 *
 * Service that makes an element apply theming related classes to itself.
 *
 * ```js
 * app.directive('myFancyDirective', function($mdTheming) {
 *   return {
 *     restrict: 'e',
 *     link: function(scope, el, attrs) {
 *       $mdTheming(el);
 *     }
 *   };
 * });
 * ```
 * @param {el=} element to apply theming to
 *
 * @returns {$$interimElement.$service}
 *
 */

function Theming($rootScope) {
  return function applyTheme(scope, el) {
    // Allow us to be invoked via a linking function signature.
    if (el === undefined) { 
      el = scope;
      scope = undefined;
    }
    if (scope === undefined) {
      scope = $rootScope;
    }

    var ctrl = el.controller('mdTheme');

    if (angular.isDefined(el.attr('md-theme-watch'))) { 
      var deregisterWatch = scope.$watch(function() { 
        return ctrl && ctrl.$mdTheme || 'default'; 
      }, changeTheme);
      // If scope is $rootScope, we need to be sure to deregister when the
      // element is destroyed
      el.on('$destroy', deregisterWatch);
    } else {
      var theme = ctrl && ctrl.$mdTheme || 'default';
      changeTheme(theme);
    }

    function changeTheme(theme, oldTheme) {
      if (oldTheme) el.removeClass('md-' + oldTheme +'-theme');
      el.addClass('md-' + theme + '-theme');
    }
  };
}

function ThemingDirective($interpolate) {
  return {
    priority: 100,
    link: {
      pre: function(scope, el, attrs) {
        var ctrl = {
          $setTheme: function(theme) {
            ctrl.$mdTheme = theme;
          }
        };
        el.data('$mdThemeController', ctrl);
        ctrl.$setTheme($interpolate(attrs.mdTheme)(scope));
        attrs.$observe('mdTheme', ctrl.$setTheme);
      }
    }
  };
}

function ThemableDirective($mdTheming) {
  return $mdTheming;
}
