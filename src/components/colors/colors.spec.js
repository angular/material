describe('md-colors', function () {
  var $compile, $rootScope;
  var $mdColorPalette, $mdTheming;
  var supplant, scope;

  beforeEach(module('material.components.colors', function ($mdThemingProvider) {
    $mdThemingProvider.theme('myTheme')
      .primaryPalette('light-blue')
      .accentPalette('yellow');
  }));

  beforeEach(inject(function ($injector) {
    $compile = $injector.get('$compile');
    $rootScope = $injector.get('$rootScope');
    $mdColorPalette = $injector.get('$mdColorPalette');
    $mdTheming = $injector.get('$mdTheming');
    supplant = $injector.get('$mdUtil').supplant;
    scope = $rootScope.$new();
  }));

  describe('directive', function () {

    function createElement(scope, options) {
      var elementString = supplant('<div md-colors="{background: \'{theme}-{palette}{hue}{opacity}\'}" {attrs}></div>', {
        attrs   : options.attrs,
        palette : options.palette,
        theme   : options.theme || 'default',
        hue     : '-' + (options.hue || '500'),
        opacity : '-' + (options.opacity || 1)
      });

      var element = $compile(elementString)(scope);
      scope.$apply();

      return element;
    }

    function setup(options) {
      var element = createElement(scope, {
        palette: options.palette,
        hue: options.hue = options.hue || '500',
        opacity: options.opacity,
        theme: options.theme
      });
      var color = $mdColorPalette[options.palette][options.hue];

      color = options.contrast ? color.contrast : color.value;

      return {
        elementStyle: element[0].style,
        scope: scope,
        color: color[3] || options.opacity ?
          supplant('rgba({0}, {1}, {2}, {3})', [color[0], color[1], color[2], color[3] || options.opacity]) :
          supplant('rgb({0}, {1}, {2})', [color[0], color[1], color[2]])
      }
    }

    /**
     * <div md-colors="{background: 'red'}" >
     */
    it('should accept color palette', function () {
      var build = setup({ palette: 'red' });
      expect(build.elementStyle.background).toContain(build.color);
    });

    describe('two-worded palette', function () {
      /**
       * <div md-colors="{background: 'blue-grey'}" >
       */
      it('should accept palette spliced with dash', function () {
        var build = setup({ palette: 'blue-grey' });
        expect(build.elementStyle.background).toContain(build.color);
      });

      /**
       * <div md-colors="{background: 'blueGrey-200-0.8'}" >
       */
      it('should accept palette formatted as camelCase', function () {
        var element = createElement(scope, { palette: 'blueGrey',  hue: '200',  opacity: '0.8' });
        var color = $mdColorPalette['blue-grey']['200'].value;
        var expectedRGBa = supplant('rgba({0}, {1}, {2}, {3})', [color[0], color[1], color[2], '0.8']);

        expect(element[0].style.background).toContain( expectedRGBa );
      });
    });

    /**
     * <div md-colors="{background: 'red-200'}" >
     */
    it('should accept color palette and hue', function () {
      var build = setup({ palette: 'red', hue: '200' });
      expect(build.elementStyle.background).toContain(build.color);
    });

    /**
     * <div md-colors="{background: 'red-200-0.8'}" >
     */
    it('should accept color palette, hue and opacity', function () {
      var build = setup({ palette: 'red', hue: '200', opacity: '0.8' });
      expect(build.elementStyle.background).toContain(build.color);
    });

    /**
     * md-colors applies smart foreground colors (in case 'background' property is used) according the palettes from
     * https://www.google.com/design/spec/style/color.html#color-color-palette
     */
    describe('foreground color', function () {
      /**
       * <div md-colors="{background: 'red'}" >
       */
      it('should set background to red-500 and foreground color white', function () {
        var build = setup({ palette: 'red', contrast: true });
        expect(build.elementStyle.color).toContain(build.color);
      });
      /**
       * <div md-colors="{background: 'red-50'}" >
       */
      it('should set background to red-50 and foreground color black', function () {
        var build = setup({ palette: 'red', hue: '50', contrast: true });
        var elColor = build.elementStyle.color.replace('0588', ''); // hack to reduce 0.870588 to 0.87
        expect(elColor).toContain(build.color);
      });

    });
    
    describe('themes', function () {
      /**
       * <div md-colors="{background: 'primary'}">
       */
      it('should accept primary palette', function() {
        var type = 'primary';
        var paletteName = $mdTheming.THEMES['default'].colors[type].name;
        var color = $mdColorPalette[paletteName]['500'].value;
        var expectedRGB = supplant('rgb({0}, {1}, {2})', [color[0], color[1], color[2]]);
        var element = createElement(scope, { palette: type });

        expect(element[0].style.background).toContain(expectedRGB);
      });

      /**
       * <div md-colors="{background: 'accent'}" >
       */
      it('should accept accent palette', function() {
        var type = 'accent';
        var paletteName = $mdTheming.THEMES['default'].colors[type].name;
        var color = $mdColorPalette[paletteName]['500'].value;
        var expectedRGB = supplant('rgb({0}, {1}, {2})', [color[0], color[1], color[2]]);
        var element = createElement(scope, { palette: type });

        expect(element[0].style.background).toContain( expectedRGB );
      });

      /**
       * <div md-colors="{background: 'warn'}" >
       */
      it('should accept warn palette', function() {
        var type = 'warn';
        var paletteName = $mdTheming.THEMES['default'].colors[type].name;
        var color = $mdColorPalette[paletteName]['500'].value;
        var expectedRGB = supplant('rgb({0}, {1}, {2})', [color[0], color[1], color[2]]);
        var element = createElement(scope, { palette: type });

        expect(element[0].style.background).toContain( expectedRGB );
      });

      /**
       * <div md-colors="{background: 'background'}"></div>
       */
      it('should accept background palette', function() {
        var type = 'background';
        var paletteName = $mdTheming.THEMES['default'].colors[type].name;
        var color = $mdColorPalette[paletteName]['500'].value;
        var expectedRGB = supplant('rgb({0}, {1}, {2})', [color[0], color[1], color[2]]);
        var element = createElement(scope, { palette: type });

        expect(element[0].style.background).toContain( expectedRGB );
      });

      describe('custom themes', function () {

        /**
         * <div md-colors="{background: 'myTheme-primary-500'}" >
         */
        it('should accept theme, color palette, and hue', function () {
          var type = 'primary';
          var paletteName = $mdTheming.THEMES['myTheme'].colors[type].name;
          var color = $mdColorPalette[paletteName]['500'].value;
          var expectedRGB = supplant('rgb({0}, {1}, {2})', [color[0], color[1], color[2]]);
          var element = createElement(scope, { theme: 'myTheme',  palette: type, hue: '500' });

          expect(element[0].style.background).toContain( expectedRGB );
        });
      });
    });

    describe('watched values', function () {

      /**
       * <div md-colors="{background: 'default-{{color}}' }" >
       */
      it('should accept interpolated value', function() {
        var color = $mdColorPalette['red']['500'].value;
        var expectedRGB = supplant('rgb({0}, {1}, {2})', [color[0], color[1], color[2]]);

        scope.color = 'red';
        var element = createElement(scope, { palette: '{{color}}' });

        expect(element[0].style.background).toContain( expectedRGB );

        scope.color = 'lightBlue-200-0.8';
        scope.$apply();

        color = $mdColorPalette['light-blue']['200'].value;
        var expectedRGBa = supplant('rgba({0}, {1}, {2}, {3})', [color[0], color[1], color[2], '0.8']);

        expect(element[0].style.background).toContain( expectedRGBa );
      });

      /**
       * <div md-colors="{ background: color() }" >
       */
      it('should accept function', inject(function ($compile) {
        var color = $mdColorPalette['light-blue']['200'].value;
        var element = $compile('<div md-colors="{background: color()}"></div>')(scope);
        var expectedRGBa = supplant('rgba({0}, {1}, {2}, {3})', [color[0], color[1], color[2], '0.8']);

        scope.color = function () {
          return 'lightBlue-200-0.8';
        };
        scope.$apply();

        expect(element[0].style.background).toContain( expectedRGBa );
      }));

      /**
       * <div md-colors="{ background: test ? 'red' : 'lightBlue' }" >
       */
      it('should accept ternary value', inject(function ($compile, $timeout) {
        var element = $compile('<div md-colors="{background: \'{{test ? \'red\' : \'lightBlue\'}}\'}"></div>')(scope);
        var color = $mdColorPalette['light-blue']['500'].value;
        var red = $mdColorPalette['red']['500'].value;
        var expectedRGB = supplant('rgb({0}, {1}, {2})', [color[0], color[1], color[2]]);

        scope.$apply(function() {
          scope.test = false;
        });

        expect(element[0].style.background).toContain( expectedRGB );

        scope.$apply(function() {
          scope.test = true;
        });
        $timeout.flush();

        expectedRGB = supplant('rgb({0}, {1}, {2})', [red[0], red[1], red[2]]);
        expect(element[0].style.background).toContain( expectedRGB );
      }));

      describe('md-colors-watch', function () {
        it('should watch if mdColorsWatch attribute is set (without value)', function () {
          scope.color = 'red';

          var color = $mdColorPalette['red']['500'].value;
          var expectedRGB = supplant('rgb({0}, {1}, {2})', [color[0], color[1], color[2]]);
          var element = createElement(scope, { palette: '{{color}}',  attrs: 'md-colors-watch' });

          expect(element[0].style.background).toContain( expectedRGB );

          scope.$apply(function() {
            scope.color = 'lightBlue-200-0.8';
          });

          color = $mdColorPalette['light-blue']['200'].value;
          var expectedRGBa = supplant('rgba({0}, {1}, {2}, {3})', [color[0], color[1], color[2], '0.8']);
          expect(element[0].style.background).toContain( expectedRGBa )
        });

        it('should not watch if mdColorsWatch attribute is set to false', function () {
          scope.color = 'red';

          var color = $mdColorPalette['red']['500'].value;
          var expectedRGB = supplant('rgb({0}, {1}, {2})', [color[0], color[1], color[2]]);
          var element = createElement(scope, { palette: '{{color}}',  attrs: 'md-colors-watch="false"' });

          expect(element[0].style.background).toContain( expectedRGB );

          scope.$apply(function() {
            scope.color = 'lightBlue-200-0.8';
          });

          expect(element[0].style.background).toContain( expectedRGB )
        });

        it('should watch if mdColorsWatch attribute is set to true', function () {
          scope.$apply(function() {
            scope.color = 'red';
          });

          var color = $mdColorPalette['red']['500'].value;
          var element = createElement(scope, {
            palette: '{{color}}',
            attrs: 'md-colors-watch="true"'
          });
          var expectedRGB = supplant('rgb({0}, {1}, {2})', [color[0], color[1], color[2]]);


          expect(element[0].style.background).toContain( expectedRGB );

          scope.$apply(function() {
            scope.color = 'lightBlue-200-0.8';
          });

          color = $mdColorPalette['light-blue']['200'].value;
          var expectedRGBa = supplant('rgba({0}, {1}, {2}, {3})', [color[0], color[1], color[2], '0.8']);

          expect(element[0].style.background).toContain( expectedRGBa );
        });
      });
    })
  });

  describe('service', function () {
    it('should apply colors on an element', inject(function ($mdColors) {
      var element = angular.element('<div></div>');
      var color = $mdColorPalette['red']['200'].value;
      var expectedRGB = supplant('rgb({0}, {1}, {2})', [color[0], color[1], color[2]]);

      $mdColors.applyThemeColors(element, scope, '{background: \'red-200\'}');
      expect(element[0].style.background).toContain( expectedRGB );
    }));

    it('should return the parsed color', inject(function ($mdColors) {
      var color = $mdColorPalette['red']['200'].value;
      var expectedRGB = supplant('rgba( {0}, {1}, {2}, {3} )', [color[0], color[1], color[2], 1]);

      var themeColor = $mdColors.getThemeColor('red-200');
      expect(themeColor).toBe( expectedRGB );
    }));
  })
});
