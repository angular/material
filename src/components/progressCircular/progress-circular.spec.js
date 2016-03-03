describe('mdProgressCircular', function() {
  var $compile, $rootScope, config, element;

  beforeEach(module('material.components.progressCircular'));
  beforeEach(inject(function(_$compile_, _$rootScope_, _$mdProgressCircular_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    config = _$mdProgressCircular_;
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

  it('should set the size using percentage values',function() {
    var progress = buildIndicator('<md-progress-circular md-diameter="50%"></md-progress-circular>');
    var expectedSize = config.progressSize/2 + 'px';

    expect(progress.css('width')).toBe(expectedSize);
    expect(progress.css('height')).toBe(expectedSize);
  });

  it('should set scaling using pixel values', function() {
    var progress = buildIndicator('<md-progress-circular md-diameter="37px"></md-progress-circular>');

    expect(progress.css('width')).toBe('37px');
    expect(progress.css('height')).toBe('37px');
  });

  /**
   * Build a progressCircular
   */
  function buildIndicator(template) {
    element = $compile('<div>' + template + '</div>')($rootScope);
        $rootScope.$digest();

    return element.find('md-progress-circular');
  }

});
