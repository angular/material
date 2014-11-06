/*
 * @ngdoc module
 * @name material.services.theming
 * @description Used to provide theming to angular-material directives
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

/**
 * @ngdoc provider
 * @name $mdThemingProvider
 *
 * @description Provider to configure the `$mdTheming` service.
 */

/**
 * @ngdoc method
 * @name $mdThemingProvider#setDefaultTheme
 * @param {string} themeName Default theme name to be applied to elements. Default value is `default`.
 */

/**
 * @ngdoc method
 * @name $mdThemingProvider#alwaysWatchTheme
 * @param {boolean} watch Whether or not to always watch themes for changes and re-apply
 * classes when they change. Default is `false`. Enabling can reduce performance.
 */

/**
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
 */

function Theming($injector) {
  var defaultTheme = 'default';
  var alwaysWatchTheme = false;
  return {
    setDefaultTheme: function(theme) {
      defaultTheme = theme;
    },
    alwaysWatchTheme: function(alwaysWatch) {
      alwaysWatchTheme = alwaysWatch;
    },
    $get: ['$rootElement', '$rootScope', ThemingService]
  };

  function ThemingService($rootElement, $rootScope) {
    applyTheme.inherit = function(el, parent) {
      var ctrl = parent.controller('mdTheme');

      var attrThemeValue = el.attr('md-theme-watch');
      if ( (alwaysWatchTheme || angular.isDefined(attrThemeValue)) && attrThemeValue != 'false') { 
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
