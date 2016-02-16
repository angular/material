describe('mdCard directive', function() {

  var $mdThemingMock = function() { $mdThemingMock.called = true; };

  beforeEach(module(function($provide) {
    $provide.value('$mdTheming', $mdThemingMock);
  }));

  beforeEach(module('material.components.card'));

  it('should be themable', inject(function($compile, $rootScope) {
    $compile('<md-card></md-card>')($rootScope.$new());
    expect($mdThemingMock.called).toBe(true);
  }));
});
