describe('mdCard directive', function() {

  var $mdThemingMock = function() { $mdThemingMock.called = true; };
  var $compile;
  var $rootScope;

  beforeEach(function() {
    module('material.components.card');
    module(function($provide) {
      $provide.value('$mdTheming', $mdThemingMock);
    });
    inject(function(_$compile_, _$rootScope_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
    });
  });

  it('should be themable', function() {
    $compile('<md-card></md-card>')($rootScope.$new());
    expect($mdThemingMock.called).toBe(true);
  });

  it('should have `._md` class indicator', function() {
    var element = $compile('<md-card></md-card>')($rootScope.$new());
    expect(element.hasClass('_md')).toBe(true);
  });
});
