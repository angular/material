describe('$mdMedia', function() {
  var matchMediaResult;
  var queriesCache;
  var resultsCache;


  beforeEach(module('material.core'));

  beforeEach(inject(function($cacheFactory, $mdMedia, $window) {
    matchMediaResult = false;

    queriesCache = $cacheFactory.get('$mdMedia:queries');
    resultsCache = $cacheFactory.get('$mdMedia:results');

    spyOn($window, 'matchMedia').andCallFake(function() {
      return {matches: matchMediaResult};
    });
  }));

  afterEach(function() {
    queriesCache.removeAll();
    resultsCache.removeAll();
  });


  it('should look up queries in `$mdConstant.MEDIA`', inject(
    function($mdConstant, $mdMedia, $window) {
      $mdConstant.MEDIA.somePreset = 'someQuery';

      $mdMedia('somePreset');
      expect($window.matchMedia).toHaveBeenCalledWith('someQuery');

      delete($mdConstant.MEDIA.somePreset);
    }
  ));

  it('should look up validated queries in `queriesCache`', inject(function($mdMedia, $window) {
    queriesCache.put('originalQuery', 'validatedQuery');

    $mdMedia('originalQuery');
    expect($window.matchMedia).toHaveBeenCalledWith('validatedQuery');
  }));

  it('should validate queries', inject(function($mdMedia, $window) {
    $mdMedia('something');
    expect($window.matchMedia).toHaveBeenCalledWith('(something)');
  }));

  it('should cache validated queries in `queriesCache`', inject(function($mdMedia) {
    $mdMedia('query');
    expect(queriesCache.get('query')).toBe('(query)');
  }));

  it('should return cached results if available', inject(function($mdMedia) {
    resultsCache.put('(query)', 'result');
    expect($mdMedia('(query)')).toBe('result');
  }));

  it('should cache results in `resultsCache`', inject(function($mdMedia) {
    $mdMedia('(query)');
    expect(resultsCache.get('(query)')).toBe(false);
  }));

  it('should recalculate on resize', inject(function($mdMedia, $window) {
    matchMediaResult = true;
    expect($mdMedia('query')).toBe(true);
    expect($window.matchMedia.callCount).toBe(1);

    expect($mdMedia('query')).toBe(true);
    expect($window.matchMedia.callCount).toBe(1);

    matchMediaResult = false;
    expect($mdMedia('query')).toBe(true);
    expect($window.matchMedia.callCount).toBe(1);

    angular.element($window).triggerHandler('resize');

    expect($mdMedia('query')).toBe(false);
    expect($window.matchMedia.callCount).toBe(2);
  }));
});
