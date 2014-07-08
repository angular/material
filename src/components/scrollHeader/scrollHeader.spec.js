
describe('materialScrollHeader', function() {
  beforeEach(module('material.components.scrollHeader'));

  function setup(attrs) {
    var el;
    inject(function($compile, $document, $rootScope) {
      el = $compile('<div><material-toolbar class="material-theme-light-blue material-medium-tall" scroll-header condensed-height="60"><material-content></material-content></div>')($rootScope.$new());
      $rootScope.$apply();
    });
    return el;
  }

  describe('directive', function() {
    it('Should have attribute', function() {
      var el = setup('');
      var toolbar = el[0].querySelector('material-toolbar');
      expect(toolbar.hasAttribute('scroll-header')).toBe(true);
    });
  });

});
