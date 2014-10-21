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
