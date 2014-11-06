describe('md-button', function() {

  beforeEach(TestUtil.mockRaf);
  beforeEach(module('material.components.button'));

  it('should be anchor if href attr', inject(function($compile, $rootScope) {

    var button = $compile('<md-button href="/link">')($rootScope.$new());
    $rootScope.$apply();
    expect(button.is('a')).toBe(true);
  }));
  it('should be anchor if ng-href attr', inject(function($compile, $rootScope) {

    var button = $compile('<md-button ng-href="/link">')($rootScope.$new());
    $rootScope.$apply();
    expect(button.is('a')).toBe(true);
  }));
  it('should be button otherwise', inject(function($compile, $rootScope) {

    var button = $compile('<md-button>')($rootScope.$new());
    $rootScope.$apply();
    expect(button.is('button')).toBe(true);
  }));

  it('should not overwrite explicit aria-labels', inject(function($compile, $rootScope) {
    var button = $compile('<md-button aria-label="my custom button">My Button</md-button>')($rootScope);
    $rootScope.$apply();
    expect( button.attr('aria-label')).toBe( "my custom button" );
  }));

  it('should inject simple button content as aria-label value', inject(function($compile, $rootScope) {
    var button = $compile('<md-button>My Button</md-button>')($rootScope);
    $rootScope.$apply();
    expect(button.attr('aria-label')).toBe("My Button");
  }));

});
