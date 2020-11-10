describe('mdWhiteframe directive', function() {

  beforeEach(module('material.components.whiteframe'));

  function buildWhiteframe(elevation) {
    var element;
    inject(function($compile, $rootScope) {
      element = $compile('<div md-whiteframe="' + (elevation || '') + '">')($rootScope);
      $rootScope.$digest();
    });
    return element;
  }

  it('should default to 4dp if no attribute value is specified', function() {
    var element = buildWhiteframe();

    expect(element).toHaveClass('md-whiteframe-4dp');
  });

  it('should default to 4dp if the attribute value is invalid', inject(function($log) {
    spyOn($log, 'warn');
    var element = buildWhiteframe('999');

    expect($log.warn).toHaveBeenCalled();
    expect(element).toHaveClass('md-whiteframe-4dp');
  }));

  it('should use the default dp and warn if the attribute value is to low', inject(function($log) {
    spyOn($log, 'warn');
    var element = buildWhiteframe('-2');

    expect($log.warn).toHaveBeenCalled();
    expect(element).toHaveClass('md-whiteframe-4dp');
  }));

  it('should not apply a whiteframe if the attribute value is -1', inject(function($log) {
    spyOn($log, 'warn');
    var element = buildWhiteframe('-1');

    expect($log.warn).not.toHaveBeenCalled();
    expect(element).not.toHaveClass('md-whiteframe-4dp');
  }));

  it('should apply the correct whiteframe if attribute value is valid', function() {
    var element = buildWhiteframe('9');

    expect(element).toHaveClass('md-whiteframe-9dp');
  });

  it('should default to 4dp if the attribute value is a text', function() {
    var element = buildWhiteframe('invalid text');

    expect(element).toHaveClass('md-whiteframe-4dp');
  });

  it('should not round a decimal number', function() {
    var element = buildWhiteframe('1.8');

    expect(element).toHaveClass('md-whiteframe-1dp');
  });

  it('should interpolate the elevation value', inject(function($rootScope) {
    $rootScope.elevation = 6;

    var element = buildWhiteframe('{{elevation}}');

    expect(element).toHaveClass('md-whiteframe-6dp');

    $rootScope.elevation = -1;
    $rootScope.$digest();

    expect(element).not.toHaveClass('md-whiteframe-6dp');
    expect(element).not.toHaveClass('md-whiteframe-4dp');

    $rootScope.elevation = 0;
    $rootScope.$digest();

    expect(element).toHaveClass('md-whiteframe-4dp');
  }));
});
