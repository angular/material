describe('$mdBiDirectional service', function () {
  beforeEach(module('material.core'));


  function createBiDirectionalProvider(providerName, rtlMode) {
    var biDirectionalProvider;

    module(function ($mdBiDirectionalProvider, $provide) {
      biDirectionalProvider = $mdBiDirectionalProvider;
      biDirectionalProvider.rtlMode(rtlMode || false);
      $provide.provider(providerName, biDirectionalProvider);
    });

    return biDirectionalProvider;
  }

  it('should create an object of BiDirectional', function () {
    createBiDirectionalProvider('biDirectional');

    inject(function (biDirectional) {
      expect(biDirectional.isRTL).toBeOfType('function');
      expect(biDirectional.isLTR).toBeOfType('function');
      expect(biDirectional.direction).toBeOfType('string');
    });
  });

  it('should set rtl as the direction', function () {
    createBiDirectionalProvider('biDirectional', true);

    inject(function (biDirectional) {
      expect(biDirectional.isRTL()).toBe(true);
      expect(biDirectional.isLTR()).toBe(false);
      expect(biDirectional.direction).toBe('rtl');
    });
  });

  it('should set ltr as the direction', function () {
    createBiDirectionalProvider('biDirectional', false);

    inject(function (biDirectional) {
      expect(biDirectional.isRTL()).toBe(false);
      expect(biDirectional.isLTR()).toBe(true);
      expect(biDirectional.direction).toBe('ltr');
    });
  });

});
