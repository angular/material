(function() {
'use strict';

angular.module('material.core.themeGenerator', [])
  .constant('$mdThemeGenerator', (function() {
    'use strict';
    
    
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
    
    var DARK_SHADOW = '1px 1px 0px rgba(black, 0.4), -1px -1px 0px rgba(black, 0.4)';
    var LIGHT_SHADOW = '';
    
    var DARK_CONTRAST_COLOR = colorToRgbaArray('rgba(0,0,0,0.87)');
    var LIGHT_CONTRAST_COLOR = colorToRgbaArray('rgb(255,255,255)');
    
    var THEME_COLOR_TYPES = ['primary', 'accent', 'warn', 'background'];
    var DEFAULT_COLOR_TYPE = 'primary';
    
    // A color in a theme will use these hues by default, if not specified by user.
    var LIGHT_DEFAULT_HUES = {
      'accent': {
        'default': '400',
        'hue-1': '300',
        'hue-2': '800',
        'hue-3': 'A100',
      }
    };
    var DARK_DEFAULT_HUES = {
      'background': {
        'default': '500',
        'hue-1': '300',
        'hue-2': '600',
        'hue-3': '800'
      }
    };
    THEME_COLOR_TYPES.forEach(function(colorType) {
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
    
    return {
      definePalette: definePalette,
      extendPalette: extendPalette,
      registerTheme: registerTheme,
      generateThemes: generateThemes,
      reset: function () {
        PALETTES = this.PALETTES = {};
        THEMES = this.THEMES = {};
      },
  
      LIGHT_DEFAULT_HUES: LIGHT_DEFAULT_HUES,
      DARK_DEFAULT_HUES: DARK_DEFAULT_HUES,
      PALETTES: PALETTES,
      THEMES: THEMES,
      parseRules: parseRules,
      rgba: rgba
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
      return checkPaletteValid(name,  _extend({}, PALETTES[name] || {}, map) );
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
  
      parentTheme && _extend(theme.colors, parentTheme.colors);
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
        
        var newDefaultHues = self.isDark ? DARK_DEFAULT_HUES : LIGHT_DEFAULT_HUES;
        var oldDefaultHues = self.isDark ? LIGHT_DEFAULT_HUES : DARK_DEFAULT_HUES;
        
        var newDefaults, colorType, color, oldDefaults, hueName;
        for (colorType in newDefaultHues) {
          newDefaults = newDefaultHues[colorType];
          oldDefaults = oldDefaultHues[colorType];
          color = self.colors[colorType];
          if (color) {
            for (hueName in color.hues) {
              if (color.hues[hueName] === oldDefaults[hueName]) {
                color.hues[hueName] = newDefaults[hueName];
              }
            }
          }
        }
  
        return self;
      }
  
      THEME_COLOR_TYPES.forEach(function(colorType) {
        var defaultHues = (self.isDark ? DARK_DEFAULT_HUES : LIGHT_DEFAULT_HUES)[colorType];
        self[colorType + 'Color'] = function setColorType(paletteName, hues) {
          var color = self.colors[colorType] = {
            name: paletteName,
            hues: _extend({}, defaultHues, hues)
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
      });
    }
  
    
    function parseRules(theme, colorType, rules) {
      checkValidPalette(theme, colorType);
    
      rules = rules.replace(/THEME_NAME/g, theme.name);
      var generatedRules = [];
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
            return theme.foregroundShadow;
          } else {
            return theme.foregroundPalette[hue] || theme.foregroundPalette['1'];
          }
        }
        if (hue.indexOf('hue') === 0) {
          hue = theme.colors[colorType].hues[hue];
        }
        return rgba( (PALETTES[ theme.colors[colorType].name ][hue] || '').value, opacity );
      });
    
      // For each type, generate rules for each hue (ie. default, md-hue-1, md-hue-2, md-hue-3)
      var hueValue, hueName, newRule;
      for (hueName in color.hues) {
        hueValue = color.hues[hueName];
        newRule = rules
          .replace(hueRegex, function(match, _, colorType, hueType, opacity) {
            return rgba(palette[hueValue][hueType === 'color' ? 'value' : 'contrast'], opacity);
          });
        if (hueName !== 'default') {
          newRule = newRule.replace(themeNameRegex, '.md-' + theme.name + '-theme.md-' + hueName);
        }
        generatedRules.push(newRule);
      }
    
      return generatedRules.join('');
    }
    
    // Generate our themes at run time given the state of THEMES and PALETTES
    function generateThemes(template) {
      // MD_THEME_CSS is a string generated by the build process that includes all the themable
      // components as templates
    
      // Expose contrast colors for palettes to ensure that text is always readable
      for (var paletteName in PALETTES) {
        sanitizePalette(PALETTES[paletteName], paletteName);
      }
    
      // Break the CSS into individual rules
      var rules = template.split(/\}(?!(\}|'|"|;))/)
        .filter(function(rule) { return rule && rule.length; })
        .map(function(rule) { return rule.trim() + '}'; });
    
      var rulesByType = {};
      THEME_COLOR_TYPES.forEach(function(type) {
        rulesByType[type] = '';
      });
      var ruleMatchRegex = new RegExp('md-\(' + THEME_COLOR_TYPES.join('\|') + '\)', 'g');
    
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
    
      var styleString = '';
    
      // For each theme, use the color palettes specified for `primary`, `warn` and `accent`
      // to generate CSS rules.
      var theme, themeName;
      for (themeName in THEMES) {
        theme = THEMES[themeName];
        THEME_COLOR_TYPES.forEach(function(colorType) {
          styleString += parseRules(theme, colorType, rulesByType[colorType] + '');
        });
      }
    
      // Insert our newly minted styles into the DOM
      return styleString;
    
      // The user specifies a 'default' contrast color as either light or dark,
      // then explicitly lists which hues are the opposite contrast (eg. A100 has dark, A200 has light)
      function sanitizePalette(palette) {
        var defaultContrast = palette.contrastDefaultColor;
        var lightColors = palette.contrastLightColors || [];
        var darkColors = palette.contrastDarkColors || [];
    
        // Sass provides these colors as space-separated lists
        if (typeof lightColors === 'string') lightColors = lightColors.split(' ');
        if (typeof darkColors === 'string') darkColors = darkColors.split(' ');
    
        // Cleanup after ourselves
        delete palette.contrastDefaultColor;
        delete palette.contrastLightColors;
        delete palette.contrastDarkColors;
    
        // Change { 'A100': '#fffeee' } to { 'A100': { value: '#fffeee', contrast:DARK_CONTRAST_COLOR }
        var hueValue, hueName, rgbValue;
        for (hueName in palette) {
          hueValue = palette[hueName];
          
          // Map everything to rgb colors
          rgbValue = colorToRgbaArray(hueValue);
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
        }
        
        function getContrastColor() {
          if (defaultContrast === 'light') {
            return darkColors.indexOf(hueName) > -1 ? DARK_CONTRAST_COLOR : LIGHT_CONTRAST_COLOR;
          } else {
            return lightColors.indexOf(hueName) > -1 ? LIGHT_CONTRAST_COLOR : DARK_CONTRAST_COLOR;
          }
        }
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
      if (Array.isArray(clr) && clr.length == 3) return clr;
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
        'rgba(' + rgbArray.join(',') + ',' + opacity + ')' :
        'rgb(' + rgbArray.join(',') + ')';
    }
    
    
    function _extend(dst) {
      for (var i = 1, ii = arguments.length; i < ii; i++) {
        var obj = arguments[i];
        if (obj) {
          var keys = Object.keys(obj);
          for (var j = 0, jj = keys.length; j < jj; j++) {
            var key = keys[j];
            dst[key] = obj[key];
          }
        }
      }
    
      return dst;
    }
    
  })());
    
})();
