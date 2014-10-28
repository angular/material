describe('$mdTheming service', function() {
  beforeEach(module('material.services.theming'));

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

  it('applies a default theme if no theme can be found', inject(function($mdTheming) {
    $mdTheming(el);
    expect(el.hasClass('md-default-theme')).toBe(true);
  }));

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
    el = compileAndLink('<h1 md-themable></h1>');
    expect(el.hasClass('md-default-theme')).toBe(true);
  });
});

describe('md-theme directive', function() {
  beforeEach(module('material.services.theming'));

  it('should observe and set mdTheme controller', inject(function($compile, $rootScope) {
    $rootScope.themey = 'red';
    var el = $compile('<div md-theme="{{themey}}">')($rootScope);
    $rootScope.$apply();
    var ctrl = el.data('$mdThemeController');
    expect(ctrl.$mdTheme).toBe('red');
    $rootScope.$apply('themey = "blue"');
    expect(ctrl.$mdTheme).toBe('blue');
  }));
});

describe('md-themable directive', function() {
  beforeEach(module('material.services.theming'));

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

  it('should not watch parent theme by default', inject(function($compile, $rootScope) {
    $rootScope.themey = 'red';
    var el = $compile('<div md-theme="{{themey}}"><span md-themable></span></div>')($rootScope);
    $rootScope.$apply();
    
    expect(el.children().hasClass('md-red-theme')).toBe(true);
    $rootScope.$apply('themey = "blue"');
    expect(el.children().hasClass('md-blue-theme')).toBe(false);
    expect(el.children().hasClass('md-red-theme')).toBe(true);
  }));
});
