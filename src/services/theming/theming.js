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
.provider('$mdTheming', [
  Theming
]);

/*
 * @ngdoc provider
 * @name $mdTheming
 *
 * @description
 *
 * Provider that makes an element apply theming related classes to itself.
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

function Theming($injector) {
  var defaultTheme = 'default';
  return {
    setDefaultTheme: function(theme) {
      defaultTheme = theme;
    },
    $get: ['$rootElement', '$rootScope', ThemingService]
  };

  function ThemingService($rootElement, $rootScope) {
    applyTheme.inherit = function(el, parent) {
      var ctrl = parent.controller('mdTheme');

      if (angular.isDefined(el.attr('md-theme-watch'))) { 
        var deregisterWatch = $rootScope.$watch(function() { 
          return ctrl && ctrl.$mdTheme || defaultTheme; 
        }, changeTheme);
        el.on('$destroy', deregisterWatch);
      } else {
        var theme = ctrl && ctrl.$mdTheme || defaultTheme;
        changeTheme(theme);
      }

      function changeTheme(theme) {
        var oldTheme = el.data('$mdThemeName');
        if (oldTheme) el.removeClass('md-' + oldTheme +'-theme');
        el.addClass('md-' + theme + '-theme');
        el.data('$mdThemeName', theme);
      }
    };

    return applyTheme;

    function applyTheme(scope, el) {
      // Allow us to be invoked via a linking function signature.
      if (el === undefined) { 
        el = scope;
        scope = undefined;
      }
      if (scope === undefined) {
        scope = $rootScope;
      }
      applyTheme.inherit(el, el);
    }
  }
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
