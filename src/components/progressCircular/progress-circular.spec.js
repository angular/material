ddescribe('mdProgressCircular', function() {
  var $compile, $rootScope;

  beforeEach(module('material.components.progressCircular'));
  beforeEach(inject(function(_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('should update aria-valuenow', inject(function($compile, $rootScope) {
    var element = $compile('<div>' +
      '<md-progress-circular value="{{progress}}">' +
      '</md-progress-circular>' +
      '</div>')($rootScope);

    $rootScope.$apply(function() {
      $rootScope.progress = 50;
    });

    var progress = element.find('md-progress-circular');

    expect(progress.eq(0).attr('aria-valuenow')).toEqual('50');
  }));

  it('should set scaling using percentage values',function() {
    var progress = buildIndicator('<md-progress-circular md-diameter="25%"></md-progress-circular>');
    expect( getScale(progress) ).toBe(0.25);
  });

  it('should set scaling using pixel values', function() {
    var DEFAULT_SIZE = 96;

    var progress = buildIndicator('<md-progress-circular md-diameter="37px"></md-progress-circular>');
    var value = Math.round( (37 / DEFAULT_SIZE) * 100 )/100;

    expect( getScale(progress) ).toBe(value);
  });

  /**
   * Build a progressCircular
   */
  function buildIndicator(template) {
    var element = $compile('<div>' + template + '</div>')($rootScope);
        $rootScope.$digest();

    return element.find('md-progress-circular');
  }

  /**
   * Lookup the scale value assigned; based on the md-diameter attribute value
   */
  function getScale(element) {
    var el = angular.element(element)[0];
    var transform = el.style['transform'] || el.style['-webkit-transform'];
    var matches = /scale\(([0-9\.]+)\)/.exec(transform);
    var scale = parseFloat(matches[1]);

    return Math.round(scale * 100)/100;
  }
});
