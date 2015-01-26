describe('md-icon directive', function() {
  beforeEach(module('material.components.icon'));

  var validIconUrl = '/fixtures/logo.svg';

  var $rootScope = null;
  var $compile = null;
  var $document = null;

  function setup(type,url,then) {
    var el = $compile('<md-icon type="' + type + '" icon="' + url + '"></md-icon>')($rootScope);
    $rootScope.$apply();
    angular.element($document[0].body).append(el);
    waitsFor(function() {
      var loaded = type === 'image' ? el.find('img')[0].complete : el.find('svg').children().length > 0;
      if(loaded){
        el.detach();
        then(el);
      }
      return loaded;
    },1500);
  }

  beforeEach(inject(function($injector) {
    $rootScope = $injector.get('$rootScope').$new();
    $compile = $injector.get('$compile');
    $document = $injector.get('$document');
  }));
  afterEach(function() {
    $rootScope.$destroy();
  });

  it('defaults to svg if type is not specified', function(){
    setup('svg',validIconUrl,function(el) {
      expect(el.find('svg').length).toBeGreaterThan(0);
      expect(el.find('path').length).toBeGreaterThan(0);
    });
  });

  it('should load svg icon from file', function() {
    setup('svg',validIconUrl,function(el) {
      expect(el.find('svg').length).toBeGreaterThan(0);
    });
  });

  it('should load static svg icon in img container', function() {
    setup('image',validIconUrl,function(el) {
      expect(el.find('img').length).toBeGreaterThan(0);
    });
  });
});
