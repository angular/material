(function() {
'use strict';
var alreadyGenerated = false;

angular.module('material.core')
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

// In memory storage of defined themes and color palettes (both loaded by CSS, and user specified)
var PALETTES = {};
var THEMES = {};

var DARK_FOREGROUND = {
  '1': 'rgba(0,0,0,0.87)',
  '2': 'rgba(0,0,0,0.54)',
  '3': 'rgba(0,0,0,0.26)',
  '4': 'rgba(0,0,0,0.12)'
};
var LIGHT_FOREGROUND = {
  '1': 'rgba(255,255,255,1.0)',
  '2': 'rgba(255,255,255,0.7)',
  '3': 'rgba(255,255,255,0.3)',
  '4': 'rgba(255,255,255,0.12)'
};

var DARK_SHADOW = '1px 1px 0px rgba(black, 0.4), -1px -1px 0px rgba(black, 0.4)';
var LIGHT_SHADOW = 'none';

var THEME_COLOR_TYPES = ['primary', 'accent', 'warn', 'background'];
var DEFAULT_COLOR_TYPE = 'primary';

// A color in a theme will use these hues by default, if not specified by user.
var DEFAULT_HUES = {
  'default': {
    'default': '500',
    'hue-1': '300',
    'hue-2': '800',
    'hue-3': 'A100',
  },
  'accent': {
    'default': '400',
    'hue-1': '300',
    'hue-2': '800',
    'hue-3': 'A100',
  }
};

var VALID_HUE_VALUES = [
  '50', '100', '200', '300', '400', '500', '600',
  '700', '800', '900', 'A100', 'A200', 'A400', 'A700'
];

function ThemingProvider() {
  var defaultTheme = 'default';
  var alwaysWatchTheme = false;

  // Load CSS defined palettes (generated from scss)
  readPaletteCss();

  // Default theme defined in core.js

  return {
    definePalette: definePalette,
    extendPalette: extendPalette,
    theme: registerTheme,

    setDefaultTheme: function(theme) {
      defaultTheme = theme;
    },
    alwaysWatchTheme: function(alwaysWatch) {
      alwaysWatchTheme = alwaysWatch;
    },
    $get: ThemingService
  };

  // Use a temporary element to read the palettes from the content of a decided selector as JSON
  function readPaletteCss() {
    var element = document.createElement('div');
    element.classList.add('md-color-palette-definition');
    document.body.appendChild(element);

    var content = getComputedStyle(element).content;
    // Get rid of leading and trailing quote
    content = content.substring(1,content.length-1);

    var parsed = JSON.parse(content);
    angular.extend(PALETTES, parsed);
    document.body.removeChild(element);
  }

  // Example: $mdThemingProvider.definePalette('neonRed', { 50: '#f5fafa', ... });
  function definePalette(name, map) {
    map = map || {};
    PALETTES[name] = checkPaletteValid(name, map);
  }

  // Returns an new object which is a copy of a given palette `name` with variables from
  // `map` overwritten
  // Example: var neonRedMap = $mdThemingProvider.extendPalette('red', { 50: '#f5fafafa' });
  function extendPalette(name, map) {
    return checkPaletteValid(name,  angular.extend({}, PALETTES[name] || {}, map) );
  }

  // Make sure that palette has all required hues
  function checkPaletteValid(name, map) {
    var missingColors = VALID_HUE_VALUES.filter(function(field) {
      return !map[field];
    });
    if (missingColors.length) {
      throw new Error("Missing colors %1 in palette %2!"
                      .replace('%1', missingColors.join(', '))
                      .replace('%2', name));
    }

    return map;
  }

  // Register a theme (which is a collection of color palettes to use with various states
  // ie. warn, accent, primary )
  // Optionally inherit from an existing theme
  // $mdThemingProvider.theme('custom-theme').primaryColor('red');
  function registerTheme(name, inheritFrom) {
    inheritFrom = inheritFrom || 'default';
    if (THEMES[name]) return THEMES[name];

    var parentTheme = typeof inheritFrom === 'string' ? THEMES[inheritFrom] : inheritFrom;
    var theme = new Theme(name);

    parentTheme && angular.extend(theme.colors, parentTheme.colors);
    THEMES[name] = theme;

    return theme;
  }

  function Theme(name) {
    var self = this;
    self.name = name;
    self.isDark = false;
    self.colors = {};

    self.dark = function(isDark) {
      self.isDark = arguments.length === 0 ? true : !!isDark;
      return self;
    };

    THEME_COLOR_TYPES.forEach(function(colorType) {
      var defaultHues = DEFAULT_HUES[colorType] || DEFAULT_HUES['default'];
      self[colorType + 'Color'] = function setColorType(paletteName, hues) {
        var color = self.colors[colorType] = {
          name: paletteName,
          hues: angular.extend({}, defaultHues, hues)
        };

        Object.keys(color.hues).forEach(function(name) {
          if (!defaultHues[name]) {
            throw new Error("Invalid hue name '%1' in theme %2's %3 color %4."
              .replace('%1', name)
              .replace('%2', self.name)
              .replace('%3', colorType)
              .replace('%4', paletteName)
            );
          }
        });
        Object.keys(color.hues).map(function(key) {
          return color.hues[key];
        }).forEach(function(hueValue) {
          if (VALID_HUE_VALUES.indexOf(hueValue) == -1) {
            throw new Error("Invalid hue value '%1' in theme %2's %3 color %4."
              .replace('%1', hueValue)
              .replace('%2', self.name)
              .replace('%3', colorType)
              .replace('%4', paletteName)
            );
          }
        });

        return self;
      };
    });
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
function generateThemes($MD_THEME_CSS) {
  if (alreadyGenerated) { return ; }
  alreadyGenerated = true;
  // MD_THEME_CSS is a string generated by the build process that includes all the themable
  // components as templates

  // Expose contrast colors for palettes to ensure that text is always readable
  angular.forEach(PALETTES, sanitizePalette);

  // Break the CSS into individual rules
  var rules = $MD_THEME_CSS.split(/\}(?!(\}|'|"|;))/)
    .filter(function(rule) { return rule && rule.length; })
    .map(function(rule) { return rule.trim() + '}'; });

  var rulesByType = {};
  THEME_COLOR_TYPES.forEach(function(type) {
    rulesByType[type] = [];
  });
  var ruleMatchRegex = new RegExp('md-\(' + THEME_COLOR_TYPES.join('\|') + '\)', 'g');

  // Sort the rules based on type, allowing us to do color substitution on a per-type basis
  rules.forEach(function(rule) {
    var match = rule.match(ruleMatchRegex);
    // First: test that if the rule has '.md-accent', it goes into the accent set of rules
    for (var i = 0, type; type = THEME_COLOR_TYPES[i]; i++) {
      if (rule.indexOf('.md-' + type) > -1) {
        return rulesByType[type].push(rule);
      }
    }

    // If no eg 'md-accent' class is found, try to just find 'accent' in the rule and guess from 
    // there
    for (i = 0; type = THEME_COLOR_TYPES[i]; i++) {
      if (rule.indexOf(type) > -1) {
        return rulesByType[type].push(rule);
      }
    }

    // Default to the primary array
    return rulesByType[DEFAULT_COLOR_TYPE].push(rule);
  });

  var generatedRules = [];

  // For each theme, use the color palettes specified for `primary`, `warn` and `accent`
  // to generate CSS rules.
  angular.forEach(THEMES, function(theme) {
    var foregroundPalette = theme.isDark ? LIGHT_FOREGROUND : DARK_FOREGROUND;

    THEME_COLOR_TYPES.forEach(function(colorType) {
      checkValidPalette(theme, colorType);

      var rules = rulesByType[colorType].join('').replace(/THEME_NAME/g, theme.name);
      var color = theme.colors[colorType];

      var themeNameRegex = new RegExp('.md-' + theme.name + '-theme', 'g');
      // Matches '{{ primary-color }}', etc
      var hueRegex = new RegExp('(\'|\")?{{\\s*\(' + colorType + '\)-\(color|contrast\)\-\?\(\\d\\.\?\\d\*\)\?\\s*}}(\"|\')?','g');
      var simpleVariableRegex = /'?"?\{\{\s*([a-zA-Z]+)-(A?\d+|hue\-[0-3]|shadow)-?(\d\.?\d*)?\s*\}\}'?"?/g;
      var palette = PALETTES[color.name];

      // find and replace simple variables where we use a specific hue, not angentire palette
      // eg. "{{primary-100}}"
      //\(' + THEME_COLOR_TYPES.join('\|') + '\)'
      rules = rules.replace(simpleVariableRegex, function(match, colorType, hue, opacity) {
        if (colorType === 'foreground') {
          if (hue == 'shadow') {
            return theme.isDark ? DARK_SHADOW : LIGHT_SHADOW;
          } else {
            var color = foregroundPalette[hue] || foregroundPalette['1'];
            return color;
          }
        }
        if (hue.indexOf('hue') === 0) {
          hue = theme.colors[colorType].hues[hue];
        }
        return rgba( (PALETTES[ theme.colors[colorType].name ][hue] || '').value, opacity );
      });

      // For each type, generate rules for each hue (ie. default, md-hue-1, md-hue-2, md-hue-3)
      angular.forEach(color.hues, function(hueValue, hueName) {
        var newRule = rules
          .replace(hueRegex, function(match, _, colorType, hueType, opacity) {
            return rgba(palette[hueValue][hueType === 'color' ? 'value' : 'contrast'], opacity);
          });
        if (hueName !== 'default') {
          newRule = newRule.replace(themeNameRegex, '.md-' + theme.name + '-theme.md-' + hueName);
        }
        generatedRules.push(newRule);
      });

    });
  });

  // Insert our newly minted styles into the DOM
  var style = document.createElement('style');
  style.innerHTML = generatedRules.join('');
  var head = document.getElementsByTagName('head')[0];
  head.insertBefore(style, head.firstElementChild);

  // The user specifies a 'default' contrast color as either light or dark,
  // then explicitly lists which hues are the opposite contrast (eg. A100 has dark, A200 has light)
  function sanitizePalette(palette) {
    var defaultContrast = palette.contrastDefaultColor;
    var lightColors = palette.contrastLightColors || [];
    var darkColors = palette.contrastDarkColors || [];

    var darkColor = colorToRgbaArray('rgba(0,0,0,0.87)');
    var lightColor = colorToRgbaArray('rgb(255,255,255)');

    // Sass provides these colors as space-separated lists
    if (typeof lightColors === 'string') lightColors = lightColors.split(' ');
    if (typeof darkColors === 'string') darkColors = darkColors.split(' ');

    // Cleanup after ourselves
    delete palette.contrastDefaultColor;
    delete palette.contrastLightColors;
    delete palette.contrastDarkColors;

    // Change { 'A100': '#fffeee' } to { 'A100': { value: '#fffeee', contrast:darkColor }
    angular.forEach(palette, function(hueValue, hueName) {
      // Map everything to rgb colors
      var rgbValue = colorToRgbaArray(hueValue);
      if (!rgbValue) { 
        throw new Error("Color %1, in palette %2's hue %3, is invalid. Hex or rgb(a) color expected."
                        .replace('%1', hueValue)
                        .replace('%2', palette.name)
                        .replace('%3', hueName));
      }

      palette[hueName] = {
        value: rgbValue,
        contrast: getContrastColor()
      };
      function getContrastColor() {
        if (defaultContrast === 'light') {
          return darkColors.indexOf(hueName) > -1 ? darkColor : lightColor;
        } else {
          return lightColors.indexOf(hueName) > -1 ? lightColor : darkColor;
        }
      }
    });
  }

  function checkValidPalette(theme, colorType) {
    // If theme attempts to use a palette that doesnt exist, throw error
    if (!PALETTES[ (theme.colors[colorType] || {}).name ]) {
      throw new Error("You supplied an invalid color palette for theme %1's %2 " +
                      "palette. Available palettes: %3"
        .replace('%1', theme.name)
        .replace('%2', colorType)
        .replace('%3', Object.keys(PALETTES).join(', '))
      );
    }
  }
}

function colorToRgbaArray(clr) {
  if (angular.isArray(clr) && clr.length == 3) return clr;
  if (/^rgb/.test(clr)) {
    return clr.replace(/(^\s*rgba?\(|\)\s*$)/g, '').split(',').map(function(value) {
      return parseInt(value, 10);
    });
  }
  if (clr.charAt(0) == '#') clr = clr.substring(1);
  if (!/^([a-f0-9]{3}){1,2}$/g.test(clr)) return;

  var dig = clr.length / 3;
  var red = clr.substr(0, dig);
  var grn = clr.substr(dig, dig);
  var blu = clr.substr(dig * 2);
  if (dig === 1) {
    red += red;
    grn += grn;
    blu += blu;
  }
  return [parseInt(red, 16), parseInt(grn, 16), parseInt(blu, 16)];
}

function rgba(rgbArray, opacity) {
  if (rgbArray.length == 4) opacity = rgbArray.pop();
  return opacity && opacity.length ?
    ' rgba(' + rgbArray.join(',') + ',' + opacity + ') ' :
    ' rgb(' + rgbArray.join(',') + ') ';
}

})();
