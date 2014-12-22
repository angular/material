describe('$mdMedia', function() {

  beforeEach(module('material.core'));

  var matchMediaResult = false;
  beforeEach(inject(function($window) {
    spyOn($window, 'matchMedia').andCallFake(function() {
      return { matches: matchMediaResult };
    });
  }));

  it('should validate input', inject(function($window, $mdMedia) {
    $mdMedia('something');
    expect($window.matchMedia).toHaveBeenCalledWith('(something)');
  }));

  it('should return result of matchMedia and recalculate on resize', inject(function($window, $mdMedia) {
    matchMediaResult = true;
    expect($mdMedia('foo')).toBe(true);
    matchMediaResult = false;
    expect($mdMedia('foo')).toBe(true);
    angular.element($window).triggerHandler('resize');
    expect($mdMedia('foo')).toBe(false);
  }));
});
