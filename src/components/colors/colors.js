(function () {
  "use strict";

  /**
   *  Use a RegExp to check if the `md-colors="<expression>"` is static string
   *  or one that should be observed and dynamically interpolated.
   */
  var STATIC_COLOR_EXPRESSION = /^{((\s|,)*?["'a-zA-Z-]+?\s*?:\s*?('|")[a-zA-Z0-9-.]*('|"))+\s*}$/;
  var colorPalettes = undefined;

  /**
   * @ngdoc module
   * @name material.components.colors
   *
   * @description
   * Define $mdColors service and a `md-colors=""` attribute directive
   */
  angular
    .module('material.components.colors', ['material.core'])
    .directive('mdColors', MdColorsDirective)
    .service('$mdColors', MdColorsService);

  /**
   * @ngdoc service
   * @name $mdColors
   * @module material.components.colors
   *
   * @description
   * With only defining themes, one couldn't get non ngMaterial elements colored with Material colors,
   * `$mdColors` service is used by the md-color directive to convert the 1..n color expressions to RGBA values and will apply
   * those values to element as CSS property values.
   *
   *  @usage
   *  <hljs lang="js">
   *    angular.controller('myCtrl', function ($mdColors) {
   *      var color = $mdColors.getThemeColor('myTheme-red-200-0.5');
   *      ...
   *    });
   *  </hljs>
   *
   */
  function MdColorsService($mdTheming, $mdUtil, $log) {
    colorPalettes = colorPalettes || Object.keys($mdTheming.PALETTES);

    // Publish service instance
    return {
      applyThemeColors: applyThemeColors,
      getThemeColor: getThemeColor
    };

    // ********************************************
    // Internal Methods
    // ********************************************

    /**
     * @ngdoc method
     * @name $mdColors#applyThemeColors
     *
     * @description
     * Convert the color expression into an object with scope-interpolated values
     * Then calculate the rgba() values based on the theme color parts
     *
     * @param {DOMElement} element the element to apply the styles on.
     * @param {object} colorExpression json object, keys are css properties and values are string of the wanted color,
     * for example: `{color: 'red-A200-0.3'}`.
     *
     * @usage
     * <hljs lang="js">
     *   app.directive('myDirective', function($mdColors) {
     *     return {
     *       ...
     *       link: function (scope, elem) {
     *         $mdColors.applyThemeColors(elem, scope, {color: 'red'});
     *       }
     *    }
     *   });
     * </hljs>
     */
    function applyThemeColors(element, colorExpression) {
      try {
        // Assign the calculate RGBA color values directly as inline CSS
        element.css(interpolateColors(colorExpression));
      } catch( e ) {
        $log.error(e.message);
      }

    }

    /**
     * @ngdoc method
     * @name $mdColors#getThemeColor
     *
     * @description
     * Get parsed color from expression
     *
     * @param {string} expression string of a color expression (for instance `'red-700-0.8'`)
     *
     * @returns {string} a css color expression (for instance `rgba(211, 47, 47, 0.8)`)
     *
     * @usage
     *  <hljs lang="js">
     *    angular.controller('myCtrl', function ($mdColors) {
     *      var color = $mdColors.getThemeColor('myTheme-red-200-0.5');
     *      ...
     *    });
     *  </hljs>
     */
    function getThemeColor(expression) {
      var color = extractColorOptions(expression);

      return parseColor(color);
    }

    /**
     * Return the parsed color
     * @param color hashmap of color definitions
     * @param contrast whether use contrast color for foreground
     * @returns rgba color string
     */
    function parseColor(color, contrast) {
      contrast = contrast || false;
      var rgbValues = $mdTheming.PALETTES[color.palette][color.hue];

      rgbValues = contrast ? rgbValues.contrast : rgbValues.value;

      return $mdUtil.supplant('rgba( {0}, {1}, {2}, {3} )',
        [rgbValues[0], rgbValues[1], rgbValues[2], rgbValues[3] || color.opacity]
      );
    }

    /**
     * Convert the color expression into an object with scope-interpolated values
     * Then calculate the rgba() values based on the theme color parts
     *
     * @results Hashmap of CSS properties with associated `rgba( )` string vales
     *
     *
     */
    function interpolateColors(themeColors) {
      var rgbColors = {};

      var hasColorProperty = themeColors.hasOwnProperty('color');

      angular.forEach(themeColors, function (value, key) {
        var color = extractColorOptions(value);
        var hasBackground = key.indexOf('background') > -1;

        rgbColors[key] = parseColor(color);
        if (hasBackground && !hasColorProperty) {
          rgbColors['color'] = parseColor(color, true);
        }
      });

      return rgbColors;
    }

    /**
     * For the evaluated expression, extract the color parts into a hash map
     */
    function extractColorOptions(expression) {
      var parts = expression.split('-');
      var hasTheme = angular.isDefined($mdTheming.THEMES[parts[0]]);
      var theme = hasTheme ? parts.splice(0, 1)[0] : $mdTheming.defaultTheme();

      var defaultHue = parts[0] !== 'accent' ? 500 : 'A200';

      return {
        theme: theme,
        palette: extractPalette(parts, theme),
        hue: parts[1] || defaultHue,
        opacity: parts[2] || 1
      };
    }

    /**
     * Calculate the theme palette name
     */
    function extractPalette(parts, theme) {
      // If the next section is one of the palettes we assume it's a two word palette
      // Two word palette can be also written in camelCase, forming camelCase to dash-case

      var isTwoWord = parts.length > 1 && colorPalettes.indexOf(parts[1]) !== -1;
      var palette = parts[0].replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

      if (isTwoWord)  palette = parts[0] + '-' + parts.splice(1, 1);

      if (colorPalettes.indexOf(palette) === -1) {
        // If the palette is not in the palette list it's one of primary/accent/warn/background
        var scheme = $mdTheming.THEMES[theme].colors[palette];
        if (!scheme) {
          throw new Error($mdUtil.supplant('mdColors: couldn\'t find \'{palette}\' in the palettes.', {palette: palette}));
        }
        palette = scheme.name;
      }

      return palette;
    }
  }

  /**
   * @ngdoc directive
   * @name mdColors
   * @module material.components.colors
   *
   * @restrict A
   *
   * @description
   * `mdColors` directive will apply the theme-based color expression as RGBA CSS style values.
   *
   *   The format will be similar to our color defining in the scss files:
   *
   *   ## `[?theme]-[palette]-[?hue]-[?opacity]`
   *   - [theme]    - default value is the default theme
   *   - [palette]  - can be either palette name or primary/accent/warn/background
   *   - [hue]      - default is 500
   *   - [opacity]  - default is 1
   *
   *   > `?` indicates optional parameter
   *
   * @usage
   * <hljs lang="html">
   *   <div md-colors="{background: 'myTheme-accent-900-0.43'}">
   *     <div md-colors="{color: 'red-A100', border-color: 'primary-600'}">
   *       <span>Color demo</span>
   *     </div>
   *   </div>
   * </hljs>
   *
   * `mdColors` directive will automatically watch for changes in the expression if it recognizes an interpolation
   * expression or a function. For performance options, you can use `::` prefix to the `md-colors` expression
   * to indicate a one-time data binding.
   * <hljs lang="html">
   *   <md-card md-colors="::{background: '{{theme}}-primary-700'}">
   *   </md-card>
   * </hljs>
   *
   */
  function MdColorsDirective($mdColors, $mdUtil, $log, $parse) {
    return {
      restrict: 'A',
      compile: function (tElem, tAttrs) {
        var shouldWatch = shouldColorsWatch();

        return function (scope, element, attrs) {
          var colorExpression = function () {
            // Json.parse() does not work because the keys are not quoted;
            // use $parse to convert to a hash map
            return $parse(attrs.mdColors)(scope);
          };

          try {
            if (shouldWatch) {
              scope.$watch(colorExpression, angular.bind(this,
                $mdColors.applyThemeColors, element
              ), true);
            }
            else {
              $mdColors.applyThemeColors(element, colorExpression());
            }

          }
          catch (e) {
            $log.error(e.message);
          }

        };

        function shouldColorsWatch() {
            // Simulate 1x binding and mark mdColorsWatch == false
            var rawColorExpression = tAttrs.mdColors;
            var bindOnce = rawColorExpression.indexOf('::') > -1;
            var isStatic = bindOnce ? true : STATIC_COLOR_EXPRESSION.test(tAttrs.mdColors);

              // Remove it for the postLink...
              tAttrs.mdColors = rawColorExpression.replace('::','');

            var hasWatchAttr = angular.isDefined(tAttrs.mdColorsWatch);

            return (bindOnce || isStatic) ? false :
                   hasWatchAttr ? $mdUtil.parseAttributeBoolean(tAttrs.mdColorsWatch) : true;
          }
      }
    };

  }


})();
