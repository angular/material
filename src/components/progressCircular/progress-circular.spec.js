describe('mdProgressCircular', function() {
  var $compile, $rootScope, element;

  beforeEach(module('material.components.progressCircular'));
  beforeEach(inject(function(_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  afterEach(function() {
    element.remove();
  });

  it('should auto-set the md-mode to "indeterminate" if not specified', inject(function($compile, $rootScope, $mdConstant) {
    element = $compile('<div>' +
          '<md-progress-circular></md-progress-circular>' +
          '</div>')($rootScope);

    $rootScope.$apply(function() {
      $rootScope.progress = 50;
      $rootScope.mode = "";
    });

    var progress = element.find('md-progress-circular');
    expect(progress.attr('md-mode')).toEqual('indeterminate');
  }));

  it('should trim the md-mode value', inject(function($compile, $rootScope, $mdConstant) {
    element = $compile('<div>' +
          '<md-progress-circular md-mode=" indeterminate"></md-progress-circular>' +
          '</div>')($rootScope);

    $rootScope.$apply(function() {
      $rootScope.progress = 50;
    });

    var progress = element.find('md-progress-circular');
    expect(progress.attr('md-mode')).toEqual('indeterminate');
  }));

  it('should auto-set the md-mode to "determinate" if not specified but has value', inject(function($compile, $rootScope, $mdConstant) {
    var element = $compile('<div>' +
      '<md-progress-circular value="{{progress}}"></md-progress-circular>' +
      '</div>')($rootScope);

    $rootScope.$apply(function() {
      $rootScope.progress = 50;
      $rootScope.mode = "";
    });

    var progress = element.find('md-progress-circular');
    expect(progress.attr('md-mode')).toEqual('determinate');
  }));



  it('should update aria-valuenow', inject(function($compile, $rootScope) {
    element = $compile('<div>' +
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
    expect( getScale(progress[0].children[0]) ).toBe(0.25);
    expect(progress.css('width')).toBe('25px');
    expect(progress.css('height')).toBe('25px');
  });

  it('should set scaling using pixel values', function() {
    var DEFAULT_SIZE = 100;

    var progress = buildIndicator('<md-progress-circular md-diameter="37px"></md-progress-circular>');
    var value = Math.round( (37 / DEFAULT_SIZE) * 100 )/100;

    expect( getScale(progress[0].children[0]) ).toBe(value);
  });

  /**
   * Build a progressCircular
   */
  function buildIndicator(template) {
    element = $compile('<div>' + template + '</div>')($rootScope);
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
