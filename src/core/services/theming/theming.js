angular.module('material.core.theming', ['material.core.theming.palette'])
  .directive('mdTheme', ThemingDirective)
  .directive('mdThemable', ThemableDirective)
  .provider('$mdTheming', ThemingProvider)
  .run(generateAllThemes);

/**
 * @ngdoc service
 * @name $mdThemingProvider
 * @module material.core.theming
 *
 * @description Provider to configure the `$mdTheming` service.
 */

/**
 * @ngdoc method
 * @name $mdThemingProvider#setNonce
 * @param {string} nonceValue The nonce to be added as an attribute to the theme style tags.
 * Setting a value allows the use CSP policy without using the unsafe-inline directive.
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

/* Some Example Valid Theming Expressions
 * =======================================
 *
 * Intention group expansion: (valid for primary, accent, warn, background)
 *
 * {{primary-100}} - grab shade 100 from the primary palette
 * {{primary-100-0.7}} - grab shade 100, apply opacity of 0.7
 * {{primary-100-contrast}} - grab shade 100's contrast color
 * {{primary-hue-1}} - grab the shade assigned to hue-1 from the primary palette
 * {{primary-hue-1-0.7}} - apply 0.7 opacity to primary-hue-1
 * {{primary-color}} - Generates .md-hue-1, .md-hue-2, .md-hue-3 with configured shades set for each hue
 * {{primary-color-0.7}} - Apply 0.7 opacity to each of the above rules
 * {{primary-contrast}} - Generates .md-hue-1, .md-hue-2, .md-hue-3 with configured contrast (ie. text) color shades set for each hue
 * {{primary-contrast-0.7}} - Apply 0.7 opacity to each of the above rules
 *
 * Foreground expansion: Applies rgba to black/white foreground text
 *
 * {{foreground-1}} - used for primary text
 * {{foreground-2}} - used for secondary text/divider
 * {{foreground-3}} - used for disabled text
 * {{foreground-4}} - used for dividers
 *
 */

// In memory generated CSS rules; registered by theme.name
var GENERATED = { };

// In memory storage of defined themes and color palettes (both loaded by CSS, and user specified)
var PALETTES;
var THEMES;

var DARK_FOREGROUND = {
  name: 'dark',
  '1': 'rgba(0,0,0,0.87)',
  '2': 'rgba(0,0,0,0.54)',
  '3': 'rgba(0,0,0,0.26)',
  '4': 'rgba(0,0,0,0.12)'
};
var LIGHT_FOREGROUND = {
  name: 'light',
  '1': 'rgba(255,255,255,1.0)',
  '2': 'rgba(255,255,255,0.7)',
  '3': 'rgba(255,255,255,0.3)',
  '4': 'rgba(255,255,255,0.12)'
};

var DARK_SHADOW = '1px 1px 0px rgba(0,0,0,0.4), -1px -1px 0px rgba(0,0,0,0.4)';
var LIGHT_SHADOW = '';

var DARK_CONTRAST_COLOR = colorToRgbaArray('rgba(0,0,0,0.87)');
var LIGHT_CONTRAST_COLOR = colorToRgbaArray('rgba(255,255,255,0.87)');
var STRONG_LIGHT_CONTRAST_COLOR = colorToRgbaArray('rgb(255,255,255)');

var THEME_COLOR_TYPES = ['primary', 'accent', 'warn', 'background'];
var DEFAULT_COLOR_TYPE = 'primary';

// A color in a theme will use these hues by default, if not specified by user.
var LIGHT_DEFAULT_HUES = {
  'accent': {
    'default': 'A200',
    'hue-1': 'A100',
    'hue-2': 'A400',
    'hue-3': 'A700'
  },
  'background': {
    'default': 'A100',
    'hue-1': '300',
    'hue-2': '800',
    'hue-3': '900'
  }
};

var DARK_DEFAULT_HUES = {
  'background': {
    'default': '800',
    'hue-1': '600',
    'hue-2': '300',
    'hue-3': '900'
  }
};
THEME_COLOR_TYPES.forEach(function(colorType) {
  // Color types with unspecified default hues will use these default hue values
  var defaultDefaultHues = {
    'default': '500',
    'hue-1': '300',
    'hue-2': '800',
    'hue-3': 'A100'
  };
  if (!LIGHT_DEFAULT_HUES[colorType]) LIGHT_DEFAULT_HUES[colorType] = defaultDefaultHues;
  if (!DARK_DEFAULT_HUES[colorType]) DARK_DEFAULT_HUES[colorType] = defaultDefaultHues;
});

var VALID_HUE_VALUES = [
  '50', '100', '200', '300', '400', '500', '600',
  '700', '800', '900', 'A100', 'A200', 'A400', 'A700'
];

// Whether or not themes are to be generated on-demand (vs. eagerly).
var generateOnDemand = false;

// Nonce to be added as an attribute to the generated themes style tags.
var nonce = null;

function ThemingProvider($mdColorPalette) {
  PALETTES = { };
  THEMES = { };

  var themingProvider;
  var defaultTheme = 'default';
  var alwaysWatchTheme = false;

  // Load JS Defined Palettes
  angular.extend(PALETTES, $mdColorPalette);

  // Default theme defined in core.js

  return themingProvider = {
    definePalette: definePalette,
    extendPalette: extendPalette,
    theme: registerTheme,

    setNonce: function(nonceValue) {
      nonce = nonceValue;
    },
    setDefaultTheme: function(theme) {
      defaultTheme = theme;
    },
    alwaysWatchTheme: function(alwaysWatch) {
      alwaysWatchTheme = alwaysWatch;
    },
    generateThemesOnDemand: function(onDemand) {
      generateOnDemand = onDemand;
    },
    $get: ThemingService,
    _LIGHT_DEFAULT_HUES: LIGHT_DEFAULT_HUES,
    _DARK_DEFAULT_HUES: DARK_DEFAULT_HUES,
    _PALETTES: PALETTES,
    _THEMES: THEMES,
    _parseRules: parseRules,
    _rgba: rgba
  };

  // Example: $mdThemingProvider.definePalette('neonRed', { 50: '#f5fafa', ... });
  function definePalette(name, map) {
    map = map || {};
    PALETTES[name] = checkPaletteValid(name, map);
    return themingProvider;
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
  // $mdThemingProvider.theme('custom-theme').primaryPalette('red');
  function registerTheme(name, inheritFrom) {
    if (THEMES[name]) return THEMES[name];

    inheritFrom = inheritFrom || 'default';

    var parentTheme = typeof inheritFrom === 'string' ? THEMES[inheritFrom] : inheritFrom;
    var theme = new Theme(name);

    if (parentTheme) {
      angular.forEach(parentTheme.colors, function(color, colorType) {
        theme.colors[colorType] = {
          name: color.name,
          // Make sure a COPY of the hues is given to the child color,
          // not the same reference.
          hues: angular.extend({}, color.hues)
        };
      });
    }
    THEMES[name] = theme;

    return theme;
  }

  function Theme(name) {
    var self = this;
    self.name = name;
    self.colors = {};

    self.dark = setDark;
    setDark(false);

    function setDark(isDark) {
      isDark = arguments.length === 0 ? true : !!isDark;

      // If no change, abort
      if (isDark === self.isDark) return;

      self.isDark = isDark;

      self.foregroundPalette = self.isDark ? LIGHT_FOREGROUND : DARK_FOREGROUND;
      self.foregroundShadow = self.isDark ? DARK_SHADOW : LIGHT_SHADOW;

      // Light and dark themes have different default hues.
      // Go through each existing color type for this theme, and for every
      // hue value that is still the default hue value from the previous light/dark setting,
      // set it to the default hue value from the new light/dark setting.
      var newDefaultHues = self.isDark ? DARK_DEFAULT_HUES : LIGHT_DEFAULT_HUES;
      var oldDefaultHues = self.isDark ? LIGHT_DEFAULT_HUES : DARK_DEFAULT_HUES;
      angular.forEach(newDefaultHues, function(newDefaults, colorType) {
        var color = self.colors[colorType];
        var oldDefaults = oldDefaultHues[colorType];
        if (color) {
          for (var hueName in color.hues) {
            if (color.hues[hueName] === oldDefaults[hueName]) {
              color.hues[hueName] = newDefaults[hueName];
            }
          }
        }
      });

      return self;
    }

    THEME_COLOR_TYPES.forEach(function(colorType) {
      var defaultHues = (self.isDark ? DARK_DEFAULT_HUES : LIGHT_DEFAULT_HUES)[colorType];
      self[colorType + 'Palette'] = function setPaletteType(paletteName, hues) {
        var color = self.colors[colorType] = {
          name: paletteName,
          hues: angular.extend({}, defaultHues, hues)
        };

        Object.keys(color.hues).forEach(function(name) {
          if (!defaultHues[name]) {
            throw new Error("Invalid hue name '%1' in theme %2's %3 color %4. Available hue names: %4"
              .replace('%1', name)
              .replace('%2', self.name)
              .replace('%3', paletteName)
              .replace('%4', Object.keys(defaultHues).join(', '))
            );
          }
        });
        Object.keys(color.hues).map(function(key) {
          return color.hues[key];
        }).forEach(function(hueValue) {
          if (VALID_HUE_VALUES.indexOf(hueValue) == -1) {
            throw new Error("Invalid hue value '%1' in theme %2's %3 color %4. Available hue values: %5"
              .replace('%1', hueValue)
              .replace('%2', self.name)
              .replace('%3', colorType)
              .replace('%4', paletteName)
              .replace('%5', VALID_HUE_VALUES.join(', '))
            );
          }
        });
        return self;
      };

      self[colorType + 'Color'] = function() {
        var args = Array.prototype.slice.call(arguments);
        console.warn('$mdThemingProviderTheme.' + colorType + 'Color() has been deprecated. ' +
                     'Use $mdThemingProviderTheme.' + colorType + 'Palette() instead.');
        return self[colorType + 'Palette'].apply(self, args);
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
  function ThemingService($rootScope, $log) {

    applyTheme.inherit = function(el, parent) {
      var ctrl = parent.controller('mdTheme');

      var attrThemeValue = el.attr('md-theme-watch');
      if ( (alwaysWatchTheme || angular.isDefined(attrThemeValue)) && attrThemeValue != 'false') {
        var deregisterWatch = $rootScope.$watch(function() {
          return ctrl && ctrl.$mdTheme || (defaultTheme == 'default' ? '' : defaultTheme);
        }, changeTheme);
        el.on('$destroy', deregisterWatch);
      } else {
        var theme = ctrl && ctrl.$mdTheme || (defaultTheme == 'default' ? '' : defaultTheme);
        changeTheme(theme);
      }

      function changeTheme(theme) {
        if (!theme) return;
        if (!registered(theme)) {
          $log.warn('Attempted to use unregistered theme \'' + theme + '\'. ' +
                    'Register it with $mdThemingProvider.theme().');
        }
        var oldTheme = el.data('$mdThemeName');
        if (oldTheme) el.removeClass('md-' + oldTheme +'-theme');
        el.addClass('md-' + theme + '-theme');
        el.data('$mdThemeName', theme);
        if (ctrl) {
          el.data('$mdThemeController', ctrl);
        }
      }
    };

    applyTheme.THEMES = angular.extend({}, THEMES);
    applyTheme.defaultTheme = function() { return defaultTheme; };
    applyTheme.registered = registered;
    applyTheme.generateTheme = function(name) { generateTheme(name, nonce); };

    return applyTheme;

    function registered(themeName) {
      if (themeName === undefined || themeName === '') return true;
      return applyTheme.THEMES[themeName] !== undefined;
    }

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

function ThemingDirective($mdTheming, $interpolate, $log) {
  return {
    priority: 100,
    link: {
      pre: function(scope, el, attrs) {
        var ctrl = {
          $setTheme: function(theme) {
            if (!$mdTheming.registered(theme)) {
              $log.warn('attempted to use unregistered theme \'' + theme + '\'');
            }
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

function parseRules(theme, colorType, rules) {
  checkValidPalette(theme, colorType);

  rules = rules.replace(/THEME_NAME/g, theme.name);
  var generatedRules = [];
  var color = theme.colors[colorType];

  var themeNameRegex = new RegExp('.md-' + theme.name + '-theme', 'g');
  // Matches '{{ primary-color }}', etc
  var hueRegex = new RegExp('(\'|")?{{\\s*(' + colorType + ')-(color|contrast)-?(\\d\\.?\\d*)?\\s*}}(\"|\')?','g');
  var simpleVariableRegex = /'?"?\{\{\s*([a-zA-Z]+)-(A?\d+|hue\-[0-3]|shadow)-?(\d\.?\d*)?(contrast)?\s*\}\}'?"?/g;
  var palette = PALETTES[color.name];

  // find and replace simple variables where we use a specific hue, not an entire palette
  // eg. "{{primary-100}}"
  //\(' + THEME_COLOR_TYPES.join('\|') + '\)'
  rules = rules.replace(simpleVariableRegex, function(match, colorType, hue, opacity, contrast) {
    if (colorType === 'foreground') {
      if (hue == 'shadow') {
        return theme.foregroundShadow;
      } else {
        return theme.foregroundPalette[hue] || theme.foregroundPalette['1'];
      }
    }
    if (hue.indexOf('hue') === 0) {
      hue = theme.colors[colorType].hues[hue];
    }
    return rgba( (PALETTES[ theme.colors[colorType].name ][hue] || '')[contrast ? 'contrast' : 'value'], opacity );
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

    // Don't apply a selector rule to the default theme, making it easier to override
    // styles of the base-component
    if (theme.name == 'default') {
      var themeRuleRegex = /((?:(?:(?: |>|\.|\w|-|:|\(|\)|\[|\]|"|'|=)+) )?)((?:(?:\w|\.|-)+)?)\.md-default-theme((?: |>|\.|\w|-|:|\(|\)|\[|\]|"|'|=)*)/g;
      newRule = newRule.replace(themeRuleRegex, function(match, prefix, target, suffix) {
        return match + ', ' + prefix + target + suffix;
      });
    }
    generatedRules.push(newRule);
  });

  return generatedRules;
}

var rulesByType = {};

// Generate our themes at run time given the state of THEMES and PALETTES
function generateAllThemes($injector) {
  var head = document.head;
  var firstChild = head ? head.firstElementChild : null;
  var themeCss = $injector.has('$MD_THEME_CSS') ? $injector.get('$MD_THEME_CSS') : '';

  if ( !firstChild ) return;
  if (themeCss.length === 0) return; // no rules, so no point in running this expensive task

  // Expose contrast colors for palettes to ensure that text is always readable
  angular.forEach(PALETTES, sanitizePalette);

  // MD_THEME_CSS is a string generated by the build process that includes all the themable
  // components as templates

  // Break the CSS into individual rules
  var rules = themeCss
                  .split(/\}(?!(\}|'|"|;))/)
                  .filter(function(rule) { return rule && rule.length; })
                  .map(function(rule) { return rule.trim() + '}'; });


  var ruleMatchRegex = new RegExp('md-(' + THEME_COLOR_TYPES.join('|') + ')', 'g');

  THEME_COLOR_TYPES.forEach(function(type) {
    rulesByType[type] = '';
  });


  // Sort the rules based on type, allowing us to do color substitution on a per-type basis
  rules.forEach(function(rule) {
    var match = rule.match(ruleMatchRegex);
    // First: test that if the rule has '.md-accent', it goes into the accent set of rules
    for (var i = 0, type; type = THEME_COLOR_TYPES[i]; i++) {
      if (rule.indexOf('.md-' + type) > -1) {
        return rulesByType[type] += rule;
      }
    }

    // If no eg 'md-accent' class is found, try to just find 'accent' in the rule and guess from
    // there
    for (i = 0; type = THEME_COLOR_TYPES[i]; i++) {
      if (rule.indexOf(type) > -1) {
        return rulesByType[type] += rule;
      }
    }

    // Default to the primary array
    return rulesByType[DEFAULT_COLOR_TYPE] += rule;
  });

  // If themes are being generated on-demand, quit here. The user will later manually
  // call generateTheme to do this on a theme-by-theme basis.
  if (generateOnDemand) return;

  angular.forEach(THEMES, function(theme) {
    if (!GENERATED[theme.name]) {
      generateTheme(theme.name, nonce);
    }
  });


  // *************************
  // Internal functions
  // *************************

  // The user specifies a 'default' contrast color as either light or dark,
  // then explicitly lists which hues are the opposite contrast (eg. A100 has dark, A200 has light)
  function sanitizePalette(palette) {
    var defaultContrast = palette.contrastDefaultColor;
    var lightColors = palette.contrastLightColors || [];
    var strongLightColors = palette.contrastStrongLightColors || [];
    var darkColors = palette.contrastDarkColors || [];

    // These colors are provided as space-separated lists
    if (typeof lightColors === 'string') lightColors = lightColors.split(' ');
    if (typeof strongLightColors === 'string') strongLightColors = strongLightColors.split(' ');
    if (typeof darkColors === 'string') darkColors = darkColors.split(' ');

    // Cleanup after ourselves
    delete palette.contrastDefaultColor;
    delete palette.contrastLightColors;
    delete palette.contrastStrongLightColors;
    delete palette.contrastDarkColors;

    // Change { 'A100': '#fffeee' } to { 'A100': { value: '#fffeee', contrast:DARK_CONTRAST_COLOR }
    angular.forEach(palette, function(hueValue, hueName) {
      if (angular.isObject(hueValue)) return; // Already converted
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
          if (darkColors.indexOf(hueName) > -1) {
            return DARK_CONTRAST_COLOR;
          } else {
            return strongLightColors.indexOf(hueName) > -1 ? STRONG_LIGHT_CONTRAST_COLOR
              : LIGHT_CONTRAST_COLOR;
          }
        } else {
          if (lightColors.indexOf(hueName) > -1) {
            return strongLightColors.indexOf(hueName) > -1 ? STRONG_LIGHT_CONTRAST_COLOR
              : LIGHT_CONTRAST_COLOR;
          } else {
            return DARK_CONTRAST_COLOR;
          }
        }
      }
    });
  }
}

function generateTheme(name, nonce) {
  var theme = THEMES[name];
  var head = document.head;
  var firstChild = head ? head.firstElementChild : null;

  if (!GENERATED[name]) {
    // For each theme, use the color palettes specified for
    // `primary`, `warn` and `accent` to generate CSS rules.
    THEME_COLOR_TYPES.forEach(function(colorType) {
      var styleStrings = parseRules(theme, colorType, rulesByType[colorType]);
      while (styleStrings.length) {
        var styleContent = styleStrings.shift();
        if (styleContent) {
          var style = document.createElement('style');
          style.setAttribute('md-theme-style', '');
          if (nonce) {
            style.setAttribute('nonce', nonce);
          }
          style.appendChild(document.createTextNode(styleContent));
          head.insertBefore(style, firstChild);
        }
      }
    });


    if (theme.colors.primary.name == theme.colors.accent.name) {
      console.warn('$mdThemingProvider: Using the same palette for primary and' +
                   ' accent. This violates the material design spec.');
    }

    GENERATED[theme.name] = true;
  }

}


function checkValidPalette(theme, colorType) {
  // If theme attempts to use a palette that doesnt exist, throw error
  if (!PALETTES[ (theme.colors[colorType] || {}).name ]) {
    throw new Error(
      "You supplied an invalid color palette for theme %1's %2 palette. Available palettes: %3"
                    .replace('%1', theme.name)
                    .replace('%2', colorType)
                    .replace('%3', Object.keys(PALETTES).join(', '))
    );
  }
}

function colorToRgbaArray(clr) {
  if (angular.isArray(clr) && clr.length == 3) return clr;
  if (/^rgb/.test(clr)) {
    return clr.replace(/(^\s*rgba?\(|\)\s*$)/g, '').split(',').map(function(value, i) {
      return i == 3 ? parseFloat(value, 10) : parseInt(value, 10);
    });
  }
  if (clr.charAt(0) == '#') clr = clr.substring(1);
  if (!/^([a-fA-F0-9]{3}){1,2}$/g.test(clr)) return;

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
  if ( !rgbArray ) return "rgb('0,0,0')";

  if (rgbArray.length == 4) {
    rgbArray = angular.copy(rgbArray);
    opacity ? rgbArray.pop() : opacity = rgbArray.pop();
  }
  return opacity && (typeof opacity == 'number' || (typeof opacity == 'string' && opacity.length)) ?
    'rgba(' + rgbArray.join(',') + ',' + opacity + ')' :
    'rgb(' + rgbArray.join(',') + ')';
}

