describe('md-grid-list', function() {

  // Need to mock the $mdMedia service as otherwise tests would fail on minified source through PhantomJS2
  var $mdMediaMock = function() {};
  $mdMediaMock.getQuery = function() {
    return {
      addListener: angular.noop,
      removeListener: angular.noop
    };
  };
  $mdMediaMock.getResponsiveAttribute = function() {
    return [];
  };
  $mdMediaMock.watchResponsiveAttributes = function () {
    return angular.noop;
  };

  beforeEach(module(function($provide) {
    $provide.value('$mdMedia', $mdMediaMock);
  }));

  beforeEach(module('material.components.gridList'));

  it('should have `._md` class indicator', inject(function($compile, $rootScope) {
    var element = $compile('<md-grid-list></md-grid-list>')($rootScope.$new());
    expect(element.hasClass('_md')).toBe(true);
  }));

});
