describe('md-button', function() {

  beforeEach(TestUtil.mockRaf);
  beforeEach(module('material.components.button'));

  it('should be anchor if href attr', inject(function($compile, $rootScope) {
    var button = $compile('<md-button href="/link">')($rootScope.$new());
    $rootScope.$apply();
    expect(button[0].tagName.toLowerCase()).toEqual('a');
  }));

  it('should be anchor if ng-href attr', inject(function($compile, $rootScope) {
    var button = $compile('<md-button ng-href="/link">')($rootScope.$new());
    $rootScope.$apply();
    expect(button[0].tagName.toLowerCase()).toEqual('a');
  }));

  it('should be button otherwise', inject(function($compile, $rootScope) {
    var button = $compile('<md-button>')($rootScope.$new());
    $rootScope.$apply();
    expect(button[0].tagName.toLowerCase()).toEqual('button');
  }));

  it('should pass in disabled attribute (testing our DOM bug-fix)', inject(function($compile, $rootScope) {
    var button = $compile('<md-button disabled>')($rootScope.$new());
    $rootScope.$apply();
    expect(button[0].hasAttribute('disabled')).toBe(true);
  }));

});
