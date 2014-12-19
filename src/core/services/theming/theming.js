(function() {
'use strict';

angular.module('material.core.theming', ['material.core.themeGenerator'])
  .constant('$MD_THEME_CSS', '{}') // This is overwritten when angular-material is built
  .directive('mdTheme', ThemingDirective)
  .directive('mdThemable', ThemableDirective)
  .provider('$mdTheming', ThemingProvider)
  .run(generateThemes);

/**
 * @ngdoc provider
 * @name $mdThemingProvider
 * @module material.core
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

var themingProvider;

function ThemingProvider($mdThemeGenerator) {
  var defaultTheme = 'default';
  var alwaysWatchTheme = false;
  $mdThemeGenerator.reset();

  // Load CSS defined palettes (generated from scss)
  readPaletteCss();

  // Default theme defined in core.js

  return themingProvider = {
    definePalette: $mdThemeGenerator.definePalette,
    extendPalette: $mdThemeGenerator.extendPalette,
    theme: $mdThemeGenerator.registerTheme,

    setDefaultTheme: function(theme) {
      defaultTheme = theme;
    },
    alwaysWatchTheme: function(alwaysWatch) {
      alwaysWatchTheme = alwaysWatch;
    },
    $get: ThemingService,
    _LIGHT_DEFAULT_HUES: $mdThemeGenerator.LIGHT_DEFAULT_HUES,
    _DARK_DEFAULT_HUES: $mdThemeGenerator.DARK_DEFAULT_HUES,
    _PALETTES: $mdThemeGenerator.PALETTES,
    _THEMES: $mdThemeGenerator.THEMES,
    _parseRules: $mdThemeGenerator.parseRules,
    _rgba: $mdThemeGenerator.rgba
  };

  // Use a temporary element to read the palettes from the content of a decided selector as JSON
  function readPaletteCss() {
    var element = document.createElement('div');
    element.classList.add('md-color-palette-definition');
    document.body.appendChild(element);

    var content = getComputedStyle(element).content;
    // Get rid of leading and trailing quote
    content = content ? content.substring(1,content.length-1) : '{}';

    var parsed = JSON.parse(content);
    for (var name in parsed) {
      $mdThemeGenerator.registerTheme(name, parsed[name]);
    }
    document.body.removeChild(element);
  }


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
  /* @ngInject */
  function ThemingService($rootScope) {
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


// Generate our themes at run time given the state of THEMES and PALETTES
function generateThemes($MD_THEME_CSS, $mdThemeGenerator) {
  var styleString = $mdThemeGenerator.generateThemes($MD_THEME_CSS);

  // Insert our newly minted styles into the DOM
  var style = document.createElement('style');
  style.innerHTML = styleString;
  var head = document.getElementsByTagName('head')[0];
  head.insertBefore(style, head.firstElementChild);


}

})();
