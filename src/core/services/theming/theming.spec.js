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


  it('applies a default theme if no theme can be found', inject(function($mdTheming) {
    $mdTheming(el);
    expect(el.hasClass('md-default-theme')).toBe(true);
  }));

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
    el = compileAndLink('<h1 md-themable></h1>');
    expect(el.hasClass('md-default-theme')).toBe(true);
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
});

describe('md-theme directive', function() {
  beforeEach(module('material.core'));

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

  it('should not watch parent theme by default', inject(function($compile, $rootScope) {
    $rootScope.themey = 'red';
    var el = $compile('<div md-theme="{{themey}}"><span md-themable></span></div>')($rootScope);
    $rootScope.$apply();
    
    expect(el.children().hasClass('md-red-theme')).toBe(true);
    $rootScope.$apply('themey = "blue"');
    expect(el.children().hasClass('md-blue-theme')).toBe(false);
    expect(el.children().hasClass('md-red-theme')).toBe(true);
  }));

  it('should support watching parent theme by default', function() {
    $mdThemingProvider.alwaysWatchTheme(true);
    inject(function($rootScope, $compile, $mdTheming) {
      $rootScope.themey = 'red';
      var el = $compile('<div md-theme="{{themey}}"><span md-themable></span></div>')($rootScope);
      $rootScope.$apply();
      expect(el.children().hasClass('md-red-theme')).toBe(true);
      $rootScope.$apply('themey = "blue"');
      expect(el.children().hasClass('md-blue-theme')).toBe(false);
      expect(el.children().hasClass('md-red-theme')).toBe(true);
    });
  });
});
