describe('$mdThemingProvider', function() {

  var themingProvider;
  var defaultTheme;
  var testTheme;
  var testPalette;
  var startAngular = inject;

  beforeEach(function() {

    module('material.core', function($provide) {
      /**
       *  material-mocks.js clears the $MD_THEME_CSS for Karma testing performance
       *  performance optimizations. Here inject some length into our theme_css so that
       *  palettes are parsed/generated
       */
      $provide.constant('$MD_THEME_CSS', '/**/');
    });

  });

  function setup() {
    module('material.core', function($mdThemingProvider) {
      themingProvider = $mdThemingProvider;

      testPalette = themingProvider._PALETTES.testPalette = themingProvider._PALETTES.otherTestPalette = {
        '50': 'ffebee',
        '100': 'ffcdd2',
        '200': 'ef9a9a',
        '300': 'e57373',
        '400': 'ef5350',
        '500': 'f44336',
        '600': 'e53935',
        '700': 'd32f2f',
        '800': 'c62828',
        '900': 'b71c1c',
        'A100': 'ff8a80',
        'A200': 'ff5252',
        'A400': 'ff1744',
        'A700': 'd50000',
        'contrastDefaultColor': 'light',
        'contrastDarkColors': ['50', '100', '200', '300', '400', 'A100'],
        'contrastStrongLightColors': ['900']
      };


      defaultTheme = themingProvider.theme('default')
        .primaryPalette('testPalette')
        .warnPalette('testPalette')
        .accentPalette('otherTestPalette')
        .backgroundPalette('testPalette');

      testTheme = themingProvider.theme('test');

    });
    startAngular();
  }

  describe('creating themes', function() {
    beforeEach(setup);

    it('allows registering of a theme', function() {
      expect(testTheme.name).toBe('test');
      expect(testTheme.dark).toBeOfType('function');
      expect(testTheme.colors).toBeOfType('object');
    });
    it('defaults to light theme', function() {
      expect(testTheme.foregroundPalette.name).toBe('dark');
      expect(testTheme.foregroundShadow).toBeFalsy();
    });

    describe('registering a dark theme', function() {
      it('changes the foreground color & shadow', function() {
        testTheme.dark();
        expect(testTheme.foregroundPalette.name).toBe('light');
        expect(testTheme.foregroundShadow).toBeTruthy();
      });
      it('changes the existing hues to match the dark or light defaults, if the hues are still default', function() {
        var darkBackground = themingProvider._DARK_DEFAULT_HUES.background;
        var lightBackground = themingProvider._LIGHT_DEFAULT_HUES.background;
        testTheme.dark();
        expect(testTheme.colors.background.hues['hue-3']).toBe(darkBackground['hue-3']);
        testTheme.dark(false);
        expect(testTheme.colors.background.hues['hue-3']).toBe(lightBackground['hue-3']);
        testTheme.dark();
        expect(testTheme.colors.background.hues['hue-3']).toBe(darkBackground['hue-3']);

        testTheme.backgroundPalette('testPalette', {
          'hue-3': '50'
        });
        testTheme.dark(false);
        expect(testTheme.colors.background.hues['hue-3']).toBe('50');
      });
    });

    describe('theme extension', function() {
      var parentTheme;
      beforeEach(function() {
        themingProvider.definePalette('parentPalette', angular.extend({}, testPalette));
        parentTheme = themingProvider.theme('parent').primaryPalette('parentPalette');
      });
      it('allows extension by string', function() {
        var childTheme = themingProvider.theme('child', 'parent');
        expect(childTheme.colors.primary.name).toBe('parentPalette');
      });
      it('allows extension by reference', function() {
        var childTheme = themingProvider.theme('child', parentTheme);
        expect(childTheme.colors.primary.name).toBe('parentPalette');
      });
      it('extends the default theme automatically', function() {
        var childTheme = themingProvider.theme('child');
        expect(childTheme.colors.primary.name).toEqual(defaultTheme.colors.primary.name);
      });
    });

    describe('providing hue map for a color', function() {
      it('extends default hue map automatically', function() {
        expect(testTheme.colors.primary.hues).toEqual(defaultTheme.colors.primary.hues);
      });
      it('allows specifying a custom hue map', function() {
        expect(testTheme.colors.primary.hues['hue-1']).not.toBe('50');
        testTheme.primaryPalette('testPalette', {
          'hue-1': '50'
        });
        expect(testTheme.colors.primary.hues['hue-1']).toBe('50');
      });
      it('errors on invalid key in hue map', function() {
        expect(function() {
          testTheme.primaryPalette('testPalette', {
            'invalid-key': '100'
          });
        }).toThrow();
      });
      it('errors on invalid value in hue map', function() {
        expect(function() {
          testTheme.primaryPalette('testPalette', {
            'hue-1': 'invalid-value'
          });
        }).toThrow();
      });
    });

  });

  describe('registering palettes', function() {
    beforeEach(setup);
    it('requires all hues specified', function() {
      var colors = {
        '50': ' ', '100': ' ', '200': ' ', '300': ' ', '400': ' ',
        '500': ' ', '600': ' ', '700': ' ', '800': ' ', '900': ' ',
        'A100': ' ', 'A200': ' ', 'A400': ' ', 'A700': ' '
      };
      themingProvider.definePalette('newPalette', colors);
      delete colors['50'];
      expect(function() {
        themingProvider.definePalette('newPaletteTwo', colors);
      }).toThrow();
    });
    it('allows to extend an existing palette', function() {
      themingProvider.definePalette('extended', themingProvider.extendPalette('testPalette', {
        '50': 'newValue'
      }));
      expect(themingProvider._PALETTES.extended['100']).toEqual(testPalette['100']);
      expect(themingProvider._PALETTES.extended['50']).toEqual('newValue');
    });
  });

  describe('css template parsing', function() {
    beforeEach(setup);

    function parse(str) {
      return themingProvider._parseRules(testTheme, 'primary', str)
        .join('')
        .split(/\}(?!(\}|'|"|;))/)
        .filter(function(val) { return !!val; })
        .map(function(rule) {
          rule += '}';
          return {
            content: (rule.match(/\{\s*(.*?)\s*\}/) || [])[1] || null,
            hue: (rule.match(/md-(hue-\d)/) || [])[1] || null,
            type: (rule.match(/(primary)/) || [])[1] || null
          };
        });
    }

    it('errors if given a theme with invalid palettes', function() {
      testTheme.primaryPalette('invalidPalette');
      expect(function() {
        themingProvider._parseRules(testTheme, 'primary', '').join('');
      }).toThrow();
    });

    it('drops the default theme name from the selectors', function() {
      expect(themingProvider._parseRules(
        defaultTheme, 'primary', '.md-THEME_NAME-theme.md-button { }'
      ).join('')).toContain('.md-button { }');
    });

    it('replaces THEME_NAME', function() {
      expect(themingProvider._parseRules(
        testTheme, 'primary', '.md-THEME_NAME-theme {}'
      ).join('')).toContain('.md-test-theme {}');
    });

    describe('background palette', function() {

      function getRgbaBackgroundHue(hue) {
        return themingProvider._rgba(themingProvider._PALETTES.testPalette[hue].value);
      }

      it('should parse for a light theme probably', function() {
        testTheme.dark(false);

        expect(parse('.md-THEME_NAME-theme { color: "{{background-default}}"; }')[0].content)
          .toEqual('color: ' + getRgbaBackgroundHue('50') + ';');
        expect(parse('.md-THEME_NAME-theme { color: "{{background-hue-1}}"; }')[0].content)
          .toEqual('color: ' + getRgbaBackgroundHue('A100') + ';');
        expect(parse('.md-THEME_NAME-theme { color: "{{background-hue-2}}"; }')[0].content)
          .toEqual('color: ' + getRgbaBackgroundHue('100') + ';');
        expect(parse('.md-THEME_NAME-theme { color: "{{background-hue-3}}"; }')[0].content)
          .toEqual('color: ' + getRgbaBackgroundHue('300') + ';');
      });

      it('should parse for a dark theme probably', function() {
        testTheme.dark(true);

        expect(parse('.md-THEME_NAME-theme { color: "{{background-default}}"; }')[0].content)
          .toEqual('color: ' + getRgbaBackgroundHue('A400') + ';');
        expect(parse('.md-THEME_NAME-theme { color: "{{background-hue-1}}"; }')[0].content)
          .toEqual('color: ' + getRgbaBackgroundHue('800') + ';');
        expect(parse('.md-THEME_NAME-theme { color: "{{background-hue-2}}"; }')[0].content)
          .toEqual('color: ' + getRgbaBackgroundHue('900') + ';');
        expect(parse('.md-THEME_NAME-theme { color: "{{background-hue-3}}"; }')[0].content)
          .toEqual('color: ' + getRgbaBackgroundHue('A200') + ';');
      });

    });

    describe('parses foreground text and shadow', function() {
      it('for a light theme', function() {
        testTheme.dark(false);
        expect(parse('.md-THEME_NAME-theme { color: "{{foreground-1}}"; }')[0].content)
          .toEqual('color: rgba(0,0,0,0.87);');
        expect(parse('.md-THEME_NAME-theme { color: "{{foreground-2}}"; }')[0].content)
          .toEqual('color: rgba(0,0,0,0.54);');
        expect(parse('.md-THEME_NAME-theme { color: "{{foreground-3}}"; }')[0].content)
          .toEqual('color: rgba(0,0,0,0.38);');
        expect(parse('.md-THEME_NAME-theme { color: "{{foreground-4}}"; }')[0].content)
          .toEqual('color: rgba(0,0,0,0.12);');
        expect(parse('.md-THEME_NAME-theme { color: "{{foreground-shadow}}"; }')[0].content)
          .toEqual('color: ;');
      });

      it('for a dark theme', function() {
        testTheme.dark();
        expect(parse('.md-THEME_NAME-theme { color: "{{foreground-1}}"; }')[0].content)
          .toEqual('color: rgba(255,255,255,1.0);');
        expect(parse('.md-THEME_NAME-theme { color: "{{foreground-2}}"; }')[0].content)
          .toEqual('color: rgba(255,255,255,0.7);');
        expect(parse('.md-THEME_NAME-theme { color: "{{foreground-3}}"; }')[0].content)
          .toEqual('color: rgba(255,255,255,0.5);');
        expect(parse('.md-THEME_NAME-theme { color: "{{foreground-4}}"; }')[0].content)
          .toEqual('color: rgba(255,255,255,0.12);');
        expect(parse('.md-THEME_NAME-theme { color: "{{foreground-shadow}}"; }')[0].content)
          .toEqual('color: 1px 1px 0px rgba(0,0,0,0.4), -1px -1px 0px rgba(0,0,0,0.4);');
      });
    });

    it('parses contrast colors', function() {
      testTheme.primaryPalette('testPalette', {
        'default': '50'
      });
      expect(parse('.md-THEME_NAME-theme { color: "{{primary-contrast}}"; } ')[0].content)
        .toEqual('color: rgba(0,0,0,0.87);');

      testTheme.primaryPalette('testPalette', {
        'default': '800'
      });
      expect(parse('{ color: "{{primary-contrast}}"; }')[0].content)
        .toEqual('color: rgba(255,255,255,0.87);');

      testTheme.primaryPalette('testPalette', {
        'default': '900'
      });
      expect(parse('{ color: "{{primary-contrast}}"; }')[0].content)
        .toEqual('color: rgb(255,255,255);');
    });

    it('generates base, non-colorType-specific, rules', function() {
      var accent100 = themingProvider._rgba(themingProvider._PALETTES.testPalette['100'].value);
      var result = parse('.md-THEME_NAME-theme { color: "{{accent-100}}"; }');
      expect(result[0].content).toEqual('color: ' + accent100 + ';');
      expect(result[0].hue).toBeFalsy();
      expect(result[1].content).toEqual('color: ' + accent100 + ';');
      expect(result[1].hue).toBe('hue-1');
      expect(result[2].content).toEqual('color: ' + accent100 + ';');
      expect(result[2].hue).toBe('hue-2');
      expect(result[3].content).toEqual('color: ' + accent100 + ';');
      expect(result[3].hue).toBe('hue-3');
      expect(result.length).toBe(4);
    });

    it('generates colorType-specific rules for each hue', function() {
      var primary = themingProvider._rgba(themingProvider._PALETTES.testPalette['500'].value);
      var hue1 = themingProvider._rgba(themingProvider._PALETTES.testPalette['300'].value);
      var hue2 = themingProvider._rgba(themingProvider._PALETTES.testPalette['800'].value);
      var hue3 = themingProvider._rgba(themingProvider._PALETTES.testPalette.A100.value);
      var result = parse('.md-THEME_NAME-theme.md-primary { color: "{{primary-color}}"; }');
      expect(result[0]).toEqual({content: 'color: ' + primary + ';', hue: null, type: 'primary'});
      expect(result[1]).toEqual({content: 'color: ' + hue1 + ';', hue: 'hue-1', type: 'primary'});
      expect(result[2]).toEqual({content: 'color: ' + hue2 + ';', hue: 'hue-2', type: 'primary'});
      expect(result[3]).toEqual({content: 'color: ' + hue3 + ';', hue: 'hue-3', type: 'primary'});
      expect(result.length).toEqual(4);
    });

    it('should generate styles when a md-something selector has an expression for a different palette', function() {
      // The selector has `md-primary` in the name, but the expression is for md-warn.
      var result = parse('.md-THEME_NAME-theme.md-primary { color: "{{warn-color}}"; }');

      // This should not leave an unevaluated expression in the output.
      expect(result.join(' ')).not.toContain('{{');
    });

    it('generates colorType-specific rules for each hue with opacity', function() {
      var primary = themingProvider._rgba(themingProvider._PALETTES.testPalette['500'].value, '0.3');
      var hue1 = themingProvider._rgba(themingProvider._PALETTES.testPalette['300'].value, '0.3');
      var hue2 = themingProvider._rgba(themingProvider._PALETTES.testPalette['800'].value, '0.3');
      var hue3 = themingProvider._rgba(themingProvider._PALETTES.testPalette.A100.value, '0.3');
      var result = parse('.md-THEME_NAME-theme.md-primary { color: "{{primary-color-0.3}}"; }');
      expect(result[0]).toEqual({content: 'color: ' + primary + ';', hue: null, type: 'primary'});
      expect(result[1]).toEqual({content: 'color: ' + hue1 + ';', hue: 'hue-1', type: 'primary'});
      expect(result[2]).toEqual({content: 'color: ' + hue2 + ';', hue: 'hue-2', type: 'primary'});
      expect(result[3]).toEqual({content: 'color: ' + hue3 + ';', hue: 'hue-3', type: 'primary'});
      expect(result.length).toEqual(4);
    });
    describe('allows selecting a colorType', function() {
      it('hue value', function() {
        var A400 = themingProvider._rgba(themingProvider._PALETTES.testPalette.A400.value);
        var result = parse('.md-THEME_NAME-theme.md-primary { color: {{primary-A400}}; }');
        expect(result[0]).toEqual({content: 'color: ' + A400 + ';', hue: null, type: 'primary'});
        expect(result[1]).toEqual({content: 'color: ' + A400 + ';', hue: 'hue-1', type: 'primary'});
        expect(result[2]).toEqual({content: 'color: ' + A400 + ';', hue: 'hue-2', type: 'primary'});
        expect(result[3]).toEqual({content: 'color: ' + A400 + ';', hue: 'hue-3', type: 'primary'});
        expect(result.length).toEqual(4);
      });
      it('hue value with opacity', function() {
        var A400 = themingProvider._rgba(themingProvider._PALETTES.testPalette.A400.value, '0.25');
        var result = parse('.md-THEME_NAME-theme.md-primary { color: {{primary-A400-0.25}}; }');
        expect(result[0]).toEqual({content: 'color: ' + A400 + ';', hue: null, type: 'primary'});
        expect(result[1]).toEqual({content: 'color: ' + A400 + ';', hue: 'hue-1', type: 'primary'});
        expect(result[2]).toEqual({content: 'color: ' + A400 + ';', hue: 'hue-2', type: 'primary'});
        expect(result[3]).toEqual({content: 'color: ' + A400 + ';', hue: 'hue-3', type: 'primary'});
        expect(result.length).toEqual(4);
      });
    });
  });

  describe('browser color', function () {
    beforeEach(function () {
      setup();
      angular.element(document.getElementsByTagName('meta')).remove();
    });

    it('should use default primary color at the meta tag', function () {
      var name = 'theme-color';
      var content = '#' + themingProvider._PALETTES.testPalette['800'].hex;

      expect(document.getElementsByName(name).length).toBe(0);

      themingProvider.enableBrowserColor();

      expect(document.getElementsByName(name).length).toBe(1);
      expect(angular.element(document.getElementsByName(name)[0]).attr('content')).toBe(content);
    });

    it('should use default primary color with hue `200`', function () {
      var name = 'theme-color';

      var hue = '200';

      var content = '#' + themingProvider._PALETTES.testPalette[hue].hex;

      expect(document.getElementsByName(name).length).toBe(0);

      themingProvider.enableBrowserColor({ hue: hue });

      expect(document.getElementsByName(name).length).toBe(1);
      expect(angular.element(document.getElementsByName(name)[0]).attr('content')).toBe(content);
    });

    it('should use red palette', function () {
      var name = 'theme-color';

      var content = themingProvider._PALETTES.red['800'].hex;

      expect(document.getElementsByName(name).length).toBe(0);

      themingProvider.enableBrowserColor({ palette: 'red' });

      expect(document.getElementsByName(name).length).toBe(1);
      expect(angular.element(document.getElementsByName(name)[0]).attr('content')).toBe(content);
    });

    it('should use test theme', function () {
      var name = 'theme-color';

      var content = '#' + themingProvider._PALETTES.testPalette['800'].hex;

      expect(document.getElementsByName(name).length).toBe(0);

      themingProvider.enableBrowserColor({ theme: 'test' });

      expect(document.getElementsByName(name).length).toBe(1);
      expect(angular.element(document.getElementsByName(name)[0]).attr('content')).toBe(content);
    });
  })

  describe('configuration', function () {
    beforeEach(function () {
      module('material.core', function($mdThemingProvider) {
            themingProvider = $mdThemingProvider;
      });
      startAngular();
    });

    it('should have access to read-only configuration', function () {
      var config = themingProvider.configuration();

      expect(config.disableTheming).toBe(false);
      expect(config.generateOnDemand).toBe(false);
      expect(config.registeredStyles.length).toBe(0);
      expect(config.nonce).toBe(null);
      expect(config.alwaysWatchTheme).toBe(false);

      // Change local copies
      config.disableTheming = true;
      config.generateOnDemand = true;
      config.registeredStyles.push("Something");
      config.nonce = 'myNonce';
      config.alwaysWatchTheme = true;

      var config2 = themingProvider.configuration();

      // Confirm master versions are not altered
      expect(config2.disableTheming).toBe(false);
      expect(config2.generateOnDemand).toBe(false);
      expect(config2.registeredStyles.length).toBe(0);
      expect(config2.nonce).toBe(null);
      expect(config2.alwaysWatchTheme).toBe(false);

    });


  })
});

describe('$mdThemeProvider with custom styles', function() {
  it('appends the custom styles to the end of the $MD_THEME_CSS string', function() {
    module('material.core', function($mdThemingProvider) {
      $mdThemingProvider.registerStyles('/*test*/');
      $mdThemingProvider.theme('register-custom-styles');
    });

    inject(function($MD_THEME_CSS) {
      // Verify that $MD_THEME_CSS is still set to '/**/' in the test environment.
      // Check angular-material-mocks.js for $MD_THEME_CSS latest value if this test starts to fail.
      expect($MD_THEME_CSS).toBe('/**/');
    });

    // Find the string '/**//*test*/' in the head tag.
    expect(document.head.innerHTML).toContain('/*test*/');
  });
});

describe('$mdThemeProvider with on-demand generation', function() {
  var $mdTheming;

  function getThemeStyleElements() {
    return document.head.querySelectorAll('style[md-theme-style]');
  }

  function cleanThemeStyleElements() {
    angular.forEach(getThemeStyleElements(), function(style) {
      document.head.removeChild(style);
    });
  }

  beforeEach(module('material.core', function($provide, $mdThemingProvider) {
    // Theming requires that there is at least one element present in the document head.
    cleanThemeStyleElements();

    // Use a single simple style rule for which we can check presence / absense.
    $provide.constant('$MD_THEME_CSS',
        "sparkle.md-THEME_NAME-theme { color: '{{primary-color}}' }");

    $mdThemingProvider.theme('sweden')
        .primaryPalette('light-blue')
        .accentPalette('yellow');

    $mdThemingProvider.theme('belarus')
        .primaryPalette('red')
        .accentPalette('green');

    $mdThemingProvider.generateThemesOnDemand(true);
  }));

  beforeEach(inject(function(_$mdTheming_) {
    $mdTheming = _$mdTheming_;
  }));

  it('should not add any theme styles automatically', function() {
    var styles = getThemeStyleElements();
    expect(styles.length).toBe(0);
  });

  it('should add themes on-demand', function() {
    $mdTheming.generateTheme('sweden');

    var styles = getThemeStyleElements();
    // One style tag for each default hue (default, hue-1, hue-2, hue-3).
    expect(styles.length).toBe(4);
    expect(document.head.innerHTML).toMatch(/md-sweden-theme/);
    expect(document.head.innerHTML).not.toMatch(/md-belarus-theme/);

    $mdTheming.generateTheme('belarus');
    styles = getThemeStyleElements();
    expect(styles.length).toBe(8);
    expect(document.head.innerHTML).toMatch(/md-sweden-theme/);
    expect(document.head.innerHTML).toMatch(/md-belarus-theme/);
  });
});

describe('$mdThemeProvider with a theme that ends in a newline', function() {
  beforeEach(function() {
    module('material.core', function($provide) {
      // Note that it should end with a newline
      $provide.constant('$MD_THEME_CSS', "sparkle.md-THEME_NAME-theme { color: '{{primary-color}}' }\n");
    });

    inject(function($mdTheming) {});
  });

  it('should not add an extra closing bracket if the stylesheet ends with a newline', function() {
    var style = document.head.querySelector('style[md-theme-style]');
    expect(style.innerText).not.toContain('}}');
    style.parentNode.removeChild(style);
  });
});

describe('$mdThemeProvider with disabled themes', function() {

  function getThemeStyleElements() {
    return document.head.querySelectorAll('style[md-theme-style]');
  }

  function cleanThemeStyleElements() {
    angular.forEach(getThemeStyleElements(), function(style) {
      document.head.removeChild(style);
    });
  }
  beforeEach(function() {

    module('material.core', function($provide, $mdThemingProvider) {
      // Use a single simple style rule for which we can check presence / absense.
      $provide.constant('$MD_THEME_CSS', "sparkle.md-THEME_NAME-theme { color: '{{primary-color}}' }");

      $mdThemingProvider
        .theme('belarus')
        .primaryPalette('red')
        .accentPalette('green');

    });
  });

  afterEach(function() {
    cleanThemeStyleElements();
  });

  describe('can disable themes programmatically', function() {
    beforeEach(function() {
      cleanThemeStyleElements();

      module('material.core', function($mdThemingProvider) {
        $mdThemingProvider.disableTheming();
      });
    });

    it('should not add any theme styles', function() {
      var styles = getThemeStyleElements();
      expect(styles.length).toBe(0);
    });
  });

  describe('can disable themes declaratively', function() {
    beforeEach(function() {
      // Set the body attribute BEFORE the theming module is loaded
      var el = document.body;
          el.setAttribute('md-themes-disabled', '');
    });

    afterEach(function() {
      var el = document.body;
          el.removeAttribute('md-themes-disabled');
    });

    it('should not set any classnames', function() {
      inject(function($rootScope, $compile, $mdTheming) {
        var el = $compile('<h1>Test</h1>')($rootScope);
        $mdTheming(el);
        expect(el.hasClass('md-default-theme')).toBe(false);
      });
    });

    it('should not inject any styles', function() {
      inject(function($rootScope, $compile, $mdTheming) {
        var el = $compile('<h1>Test</h1>')($rootScope);
        $mdTheming(el);

        var styles = getThemeStyleElements();
        expect(styles.length).toBe(0);
      });
    });

  });
});

describe('$mdThemeProvider with nonce', function() {
  beforeEach(function() {

    module('material.core', function($provide) {
      /**
       *  material-mocks.js clears the $MD_THEME_CSS for Karma testing performance
       *  performance optimizations. Here inject some length into our theme_css so that
       *  palettes are parsed/generated
       */
      $provide.constant('$MD_THEME_CSS', '/**/');
    });
  });

  describe('and auto-generated themes', function() {
    beforeEach(function() {
      module('material.core', function($mdThemingProvider) {
        $mdThemingProvider.generateThemesOnDemand(false);

        $mdThemingProvider.theme('auto-nonce')
            .primaryPalette('light-blue')
            .accentPalette('yellow');

        $mdThemingProvider.setNonce('1');
      });
      inject();
    });

    it('should add a nonce', function() {
      var styles = document.head.querySelectorAll('style[nonce="1"]');
      expect(styles.length).toBe(4);
    });
  });

  describe('and on-demand generated themes', function() {
    var $mdTheming;

    beforeEach(function() {
      module('material.core', function($mdThemingProvider) {
        $mdThemingProvider.generateThemesOnDemand(true);

        $mdThemingProvider.theme('nonce')
            .primaryPalette('light-blue')
            .accentPalette('yellow');

        $mdThemingProvider.setNonce('2');
      });
      inject(function(_$mdTheming_) {
        $mdTheming = _$mdTheming_;
      });
    });

    it('should add a nonce', function() {
      var styles = document.head.querySelectorAll('style[nonce="2"]');
      expect(styles.length).toBe(0);

      $mdTheming.generateTheme('nonce');
      styles = document.head.querySelectorAll('style[nonce="2"]');
      expect(styles.length).toBe(4);
    });
  });
});

describe('$mdTheming service', function() {
  var $mdThemingProvider;
  beforeEach(module('material.core', function(_$mdThemingProvider_) {
    $mdThemingProvider = _$mdThemingProvider_;
  }));

  var el, testHtml, compileAndLink;

  beforeEach(inject(function($rootScope, $compile) {
    compileAndLink = function(html) {
      return $compile(html)($rootScope.$new());
    };
  }));

  beforeEach(function() {
    testHtml = '<h1>Test</h1>';
    el = compileAndLink(testHtml);
  });


  it('supports setting a different default theme', function() {
    $mdThemingProvider.setDefaultTheme('other');
    inject(function($rootScope, $compile, $mdTheming) {
      el = $compile('<h1>Test</h1>')($rootScope);
      $mdTheming(el);
      expect(el.hasClass('md-other-theme')).toBe(true);
      expect(el.hasClass('md-default-theme')).toBe(false);
    });
  });

  it('inherits the theme from parent elements', inject(function($mdTheming) {
    el = compileAndLink([
      '<div md-theme="awesome">',
        testHtml,
      '</div>'
    ].join('')).children(0);

    $mdTheming(el);
    expect(el.hasClass('md-default-theme')).toBe(false);
    expect(el.hasClass('md-awesome-theme')).toBe(true);
  }));

  it('provides the md-themable directive', function() {
    $mdThemingProvider.setDefaultTheme('some');
    el = compileAndLink('<h1 md-themable></h1>');
    expect(el.hasClass('md-some-theme')).toBe(true);
  });

  it('can inherit from explicit parents', inject(function($rootScope, $mdTheming) {
    var child = compileAndLink('<h1 md-theme="dark"></h1>');
    var container = compileAndLink('<div md-theme="space"><h1></h1></div>');
    var inherited = container.children();
    $mdTheming(child);
    expect(child.hasClass('md-dark-theme')).toBe(true);
    $mdTheming.inherit(child, inherited);
    expect(child.hasClass('md-dark-theme')).toBe(false);
    expect(child.hasClass('md-space-theme')).toBe(true);
  }));

  it('exposes a getter for the default theme', inject(function($mdTheming) {
    expect($mdTheming.defaultTheme()).toBe('default');
  }));

  it('supports registering theme on the fly', inject(function ($mdTheming) {
    expect($mdTheming.THEMES.hasOwnProperty('test')).toBeFalsy();

    $mdTheming.defineTheme('test', {
      primary: 'red',
      warn: 'yellow'
    });

    expect($mdTheming.THEMES.hasOwnProperty('test')).toBeTruthy();
  }));

  it('supports setting palette options when registering theme on the fly', inject(function ($mdTheming) {
    expect($mdTheming.THEMES.hasOwnProperty('testHues')).toBeFalsy();

    $mdTheming.defineTheme('testHues', {
      primary: 'red',
      primaryHues: {
        default: '300'
      },
      accent: 'blue',
      accentHues: {
        default: '600'
      },
      warn: 'yellow',
      warnHues: {
        default: '200'
      },
      background: 'amber',
      backgroundHues: {
        default: '800'
      },
    });

    expect($mdTheming.THEMES.hasOwnProperty('testHues')).toBeTruthy();
    expect($mdTheming.THEMES.testHues.colors.primary.hues.default).toBe('300');
    expect($mdTheming.THEMES.testHues.colors.accent.hues.default).toBe('600');
    expect($mdTheming.THEMES.testHues.colors.warn.hues.default).toBe('200');
    expect($mdTheming.THEMES.testHues.colors.background.hues.default).toBe('800');
  }));

  it('supports changing browser color on the fly', function() {
    var name = 'theme-color';
    var primaryPalette = $mdThemingProvider._THEMES.default.colors.primary.name;
    var primaryColor = $mdThemingProvider._PALETTES[primaryPalette]['800'].hex;
    var redColor = $mdThemingProvider._PALETTES.red['800'].hex;

    $mdThemingProvider.enableBrowserColor();

    expect(angular.element(document.getElementsByName(name)[0]).attr('content')).toBe(primaryColor);

    inject(function($mdTheming) {
      $mdTheming.setBrowserColor({ palette: 'red' });

      expect(angular.element(document.getElementsByName(name)[0]).attr('content')).toBe(redColor);
    });
  });
});

describe('md-theme directive', function() {
  beforeEach(module('material.core'));

  it('should watch and set mdTheme controller',
    inject(function ($compile, $rootScope) {
      $rootScope.themey = 'red';
      var el = $compile('<div md-theme="{{themey}}">')($rootScope);
      $rootScope.$apply();
      var ctrl = el.data('$mdThemeController');
      expect(ctrl.$mdTheme).toBe('red');
      $rootScope.$apply('themey = "blue"');
      expect(ctrl.$mdTheme).toBe('blue');
    })
  );

  it('warns when an unregistered theme is used', inject(function ($log, $compile, $rootScope) {
    spyOn($log, 'warn');
    $compile('<div md-theme="unregistered"></div>')($rootScope);
    $rootScope.$apply();
    expect($log.warn).toHaveBeenCalled();
  }));

  it('does not warn when a registered theme is used', inject(function($log, $compile, $rootScope) {
    spyOn($log, 'warn');
    $compile('<div md-theme="default"></div>')($rootScope);
    $rootScope.$apply();
    expect($log.warn.calls.count()).toBe(0);
  }));

  it('should accept string as a theme', inject(function($compile, $rootScope, $mdTheming) {
    var el = $compile('<div md-theme="red"></div>')($rootScope);
    $rootScope.$apply();
    $mdTheming(el);
    expect(el.hasClass('md-default-theme')).toBeFalsy();
    expect(el.hasClass('md-red-theme')).toBeTruthy();
  }));

  it('should accept interpolation string as a theme and automatically watch changes',
    inject(function ($compile, $rootScope, $mdTheming) {
      $rootScope.themey = 'red';
      var el = $compile('<div md-theme="{{themey}}">')($rootScope);
      $mdTheming(el);
      $rootScope.$apply();
      expect(el.hasClass('md-red-theme')).toBeTruthy();
      $rootScope.$apply('themey = "blue"');
      expect(el.hasClass('md-blue-theme')).toBeTruthy();
    })
  );

  it('should accept onetime bind interpolation string as a theme and not watch changes',
    inject(function ($compile, $rootScope, $mdTheming) {
      $rootScope.themey = 'red';
      var el = $compile('<div md-theme="{{::themey}}">')($rootScope);
      $mdTheming(el);
      $rootScope.$apply();
      expect(el.hasClass('md-red-theme')).toBeTruthy();
      $rootScope.$apply('themey = "blue"');
      expect(el.hasClass('md-blue-theme')).toBeFalsy();
      expect(el.hasClass('md-red-theme')).toBeTruthy();
    })
  );

  it('should accept $q promise as a theme', inject(function($compile, $rootScope, $q, $mdTheming) {
    $rootScope.promise = $mdTheming.defineTheme('red', { primary: 'red' });
    var el = $compile('<div md-theme="promise"></div>')($rootScope);
    $mdTheming(el);
    $rootScope.$apply();
    expect(el.hasClass('md-default-theme')).toBeFalsy();
    expect(el.hasClass('md-red-theme')).toBeTruthy();
  }));

  it('should accept a function that returns a promise as a theme',
    inject(function ($compile, $rootScope, $q, $mdTheming) {
      $rootScope.func = function () {
        return $mdTheming.defineTheme('red', {primary: 'red'});
      };
      var el = $compile('<div md-theme="func"></div>')($rootScope);
      $mdTheming(el);
      $rootScope.$apply();
      expect(el.hasClass('md-default-theme')).toBeFalsy();
      expect(el.hasClass('md-red-theme')).toBeTruthy();
    }));

  describe('$shouldWatch controller property', function () {
    it('should set to true if there\'s a md-theme-watch attribute',
      inject(function ($mdTheming, $compile, $rootScope) {
        var el = $compile('<div md-theme="default" md-theme-watch></div>')($rootScope);
        $mdTheming(el);
        $rootScope.$apply();

        expect(el.controller('mdTheme').$shouldWatch).toBeTruthy();
      })
    );

    it('should set to true if there\'s an interpolation',
      inject(function ($mdTheming, $compile, $rootScope) {
        $rootScope.theme = 'default';
        var el = $compile('<div md-theme="{{theme}}"></div>')($rootScope);
        $mdTheming(el);
        $rootScope.$apply();

        expect(el.controller('mdTheme').$shouldWatch).toBeTruthy();
      })
    );

    it('should set to false if there\'s an interpolation with one way binding',
      inject(function ($mdTheming, $compile, $rootScope) {
        $rootScope.theme = 'default';
        var el = $compile('<div md-theme="{{::theme}}"></div>')($rootScope);
        $mdTheming(el);
        $rootScope.$apply();

        expect(el.controller('mdTheme').$shouldWatch).toBeFalsy();
      })
    );
  });
});

describe('md-themable directive', function() {
  var $mdThemingProvider;
  beforeEach(module('material.core', function(_$mdThemingProvider_) {
    $mdThemingProvider = _$mdThemingProvider_;
  }));

  it('should inherit parent theme', inject(function($compile, $rootScope) {
    var el = $compile('<div md-theme="a"><span md-themable></span></div>')($rootScope);
    $rootScope.$apply();
    expect(el.children().hasClass('md-a-theme')).toBe(true);
  }));

  it('should watch parent theme with md-theme-watch', inject(function($compile, $rootScope) {
    $rootScope.themey = 'red';
    var el = $compile('<div md-theme="{{themey}}"><span md-themable md-theme-watch></span></div>')($rootScope);
    $rootScope.$apply();

    expect(el.children().hasClass('md-red-theme')).toBe(true);
    $rootScope.$apply('themey = "blue"');
    expect(el.children().hasClass('md-blue-theme')).toBe(true);
    expect(el.children().hasClass('md-red-theme')).toBe(false);
  }));

  it('should watch parent theme by default', inject(function($compile, $rootScope) {
    $rootScope.themey = 'red';
    var el = $compile('<div md-theme="{{themey}}"><span md-themable></span></div>')($rootScope);
    $rootScope.$apply();

    expect(el.children().hasClass('md-red-theme')).toBe(true);
    $rootScope.$apply('themey = "blue"');
    expect(el.children().hasClass('md-blue-theme')).toBe(true);
    expect(el.children().hasClass('md-red-theme')).toBe(false);
  }));

  it('should not apply a class for an unnested default theme', inject(function($rootScope, $compile) {
    var el = $compile('<div md-themable></div>')($rootScope);
    expect(el.hasClass('md-default-theme')).toBe(false);
  }));

  it('should apply a class for a nested default theme', inject(function($rootScope, $compile) {
    var el = $compile('<div md-theme="default" md-themable></div>')($rootScope);
    expect(el.hasClass('md-default-theme')).toBe(true);
  }));
});
