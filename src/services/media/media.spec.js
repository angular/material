describe('$mdMedia', function() {

  beforeEach(module('material.services.media'));

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
  it('should validate input', inject(function($window, $mdMedia) {
    $mdMedia('sm');
    expect($window.matchMedia).toHaveBeenCalledWith('(min-width: 600px)');

    $window.matchMedia.reset();
    $mdMedia('md');
    expect($window.matchMedia).toHaveBeenCalledWith('(min-width: 960px)');

    $window.matchMedia.reset();
    $mdMedia('lg');
    expect($window.matchMedia).toHaveBeenCalledWith('(min-width: 1200px)');
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
