describe('mdCard directive', function() {

  beforeEach(module('material.components.card'));

  it('should have the default theme class when the md-theme attribute is not defined', inject(function($compile, $rootScope) {
    var card = $compile('<md-card></md-card>')($rootScope.$new());
    $rootScope.$apply();
    expect(card.hasClass('md-default-theme')).toBe(true);
  }));

  it('should have the correct theme class when the md-theme attribute is defined', inject(function($compile, $rootScope) {
    var card = $compile('<md-card md-theme="green"></md-card>')($rootScope.$new());
    $rootScope.$apply();
    expect(card.hasClass('md-green-theme')).toBe(true);
  }));
});
