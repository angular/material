describe('md-icon directive', function() {
  beforeEach(module('material.components.icon'));

  var validIconUrl = '/fixtures/logo.svg';

  var $rootScope = null;
  var $compile = null;
  var $document = null;
  beforeEach(inject(function($injector) {
    $rootScope = $injector.get('$rootScope').$new();
    $compile = $injector.get('$compile');
    $document = $injector.get('$document');
  }));

  afterEach(function() {
    $rootScope.$destroy();
  });

  it('should load svg icon from file', function() {
    var el = $compile('<md-icon icon="' + validIconUrl + '"></md-icon>')($rootScope);
    $rootScope.$apply();
    waitsFor(function checkLoaded() {
      return el.find('svg').length > 0  && el.find('path').length > 0;
    },1500);
  });

  it('should load static svg icon in img container', function() {
    var el = $compile('<md-icon type="image" icon="' + validIconUrl + '"></md-icon>')($rootScope);
    $rootScope.$apply();
    waitsFor(function checkLoaded() {
      return el.find('img').length > 0;
    },1500);
  });
});
