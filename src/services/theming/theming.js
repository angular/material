/*
 * @ngdoc module
 * @name material.services.theming
 * @description InterimElement
 */

angular.module('material.services.theming', [
])
.directive('mdTheme', [
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

    if (el.attr('md-theme')) { window.debugging = true; }
    var ctrl = el.controller('mdTheme');

    if (el.attr('md-theme-watch')) { 
      $scope.$watch(function() { return ctrl && ctrl.$mdTheme || 'default'; }, changeTheme);
    } else {
      var theme = ctrl && ctrl.$mdTheme || 'default';
      changeTheme(theme);
    }

    function changeTheme(theme, oldTheme) {
      if (oldTheme) el.removeClass('md-' + theme +'-theme');
      el.addClass('md-' + theme + '-theme');
    }
  };
}

function ThemingDirective() {
  return {
    priority: 100,
    link: {
      pre: function(scope, el, attrs) {
        var ctrl = {
          $setTheme: function(theme) {
            this.$mdTheme = theme;
          }
        };
        el.data('$mdThemeController', ctrl);
        ctrl.$setTheme(attrs.mdTheme);
        attrs.$observe('mdTheme', ctrl.$setTheme);
      }
    }
  };
}

function ThemableDirective($mdTheming) {
  return $mdTheming;
}
