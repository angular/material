describe('mdProgressCircular', function() {
  var $compile, $rootScope, config, element;

  beforeEach(module('material.components.progressCircular'));
  beforeEach(inject(function(_$compile_, _$rootScope_, _$mdProgressCircular_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    config = _$mdProgressCircular_;
  }));

  afterEach(function() {
    if (element) {
      element.remove();
    }
  });

  it('should auto-set the md-mode to "indeterminate" if not specified', function() {
    var progress = buildIndicator('<md-progress-circular></md-progress-circular>');

    $rootScope.$apply(function() {
      $rootScope.progress = 50;
      $rootScope.mode = "";
    });

    expect(progress.attr('md-mode')).toEqual('indeterminate');
  });

  it('should auto-set the md-mode to "indeterminate" if specified not as "indeterminate" or "determinate"', function() {
    var progress = buildIndicator('<md-progress-circular md-mode="test"></md-progress-circular>');

    $rootScope.$apply(function() {
      $rootScope.progress = 50;
      $rootScope.mode = "";
    });

    expect(progress.attr('md-mode')).toEqual('indeterminate');
  });

  it('should trim the md-mode value', function() {
    var progress = buildIndicator('<md-progress-circular md-mode=" indeterminate"></md-progress-circular>');

    $rootScope.$apply(function() {
      $rootScope.progress = 50;
    });

    expect(progress.attr('md-mode')).toEqual('indeterminate');
  });

  it('should auto-set the md-mode to "determinate" if not specified but has value', function() {
    var progress = buildIndicator('<md-progress-circular value="{{progress}}"></md-progress-circular>');

    $rootScope.$apply(function() {
      $rootScope.progress = 50;
      $rootScope.mode = "";
    });

    expect(progress.attr('md-mode')).toEqual('determinate');
  });

  it('should update aria-valuenow', function() {
    var progress = buildIndicator('<md-progress-circular value="{{progress}}"></md-progress-circular>');

    $rootScope.$apply(function() {
      $rootScope.progress = 50;
    });

    expect(progress.attr('aria-valuenow')).toEqual('50');
  });

  it('should not set aria-valuenow in indeterminate mode', function() {
    var progress = buildIndicator('<md-progress-circular md-mode="indeterminate" value="100"></md-progress-circular>');

    expect(progress.attr('aria-valuenow')).toBeUndefined();
  });

  it('should set the size using percentage values',function() {
    var progress = buildIndicator('<md-progress-circular md-diameter="50%"></md-progress-circular>');
    var expectedSize = config.progressSize / 2 + 'px';

    expect(progress.css('width')).toBe(expectedSize);
    expect(progress.css('height')).toBe(expectedSize);
  });

  it('should set the size using pixel values', function() {
    var progress = buildIndicator('<md-progress-circular md-diameter="37px"></md-progress-circular>');

    expect(progress.css('width')).toBe('37px');
    expect(progress.css('height')).toBe('37px');
  });

  it('should scale the stroke width as a percentage of the diameter', function() {
    var ratio = config.strokeWidth;
    var diameter = 25;
    var path = buildIndicator(
      '<md-progress-circular md-diameter="' + diameter + '"></md-progress-circular>'
    ).find('path').eq(0);

    expect(parseFloat(path.attr('stroke-width'))).toBe(diameter / ratio);
  });

  it('should hide the element if is disabled', function() {
    var element = buildIndicator(
      '<md-progress-circular disabled></md-progress-circular>'
    );

    expect(element.hasClass('_md-progress-circular-disabled')).toBe(true);
  });

  it('should set the transform origin in all dimensions', function() {
    var svg = buildIndicator('<md-progress-circular md-diameter="42px"></md-progress-circular>').find('svg').eq(0);
    expect(svg.css('transform-origin')).toBe('21px 21px 21px');
  });

  it('should adjust the element size when the diameter changes', function() {
    $rootScope.diameter = 30;

    var element = buildIndicator(
      '<md-progress-circular value="50" md-diameter="{{diameter}}"></md-progress-circular>'
    );

    var path = element.find('path');
    var initialPathDimensions = path.attr('d');

    expect(element.css('width')).toBe('30px');
    expect(element.css('height')).toBe('30px');
    expect(initialPathDimensions).toBeTruthy();

    $rootScope.$apply('diameter = 60');

    expect(element.css('width')).toBe('60px');
    expect(element.css('height')).toBe('60px');
    expect(path.attr('d')).not.toBe(initialPathDimensions);
  });

  /**
   * Build a progressCircular
   */
  function buildIndicator(template) {
    element = $compile(template)($rootScope);
    $rootScope.$digest();

    return element;
  }

});

describe('mdProgressCircularProvider', function() {
    beforeEach(function() {
        module('material.components.progressCircular', function($mdProgressCircularProvider) {
          $mdProgressCircularProvider.configure({
            progressSize: 1337,
            strokeWidth: 42
          });
        });
    });

    it('should allow for the default options to be configured', inject(function($mdProgressCircular) {
        expect($mdProgressCircular.progressSize).toBe(1337);
        expect($mdProgressCircular.strokeWidth).toBe(42);
    }));
});
