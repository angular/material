describe('mdContent directive', function() {

  beforeEach(module('material.components.content'));

  it('should have `._md` class indicator', inject(function($compile, $rootScope) {
    var element = $compile('<md-content></md-content>')($rootScope.$new());
    expect(element.hasClass('_md')).toBe(true);
  }));
  
});
