describe('mdProgressLinear', function() {

  beforeEach(module('material.components.progressLinear'));

  it('should auto-set the md-mode to "indeterminate" if not specified', inject(function($compile, $rootScope, $mdConstant) {
    var element = $compile('<div>' +
      '<md-progress-linear></md-progress-linear>' +
      '</div>')($rootScope);

    $rootScope.$apply(function() {
      $rootScope.progress = 50;
      $rootScope.mode = "";
    });

    var progress = element.find('md-progress-linear');
    expect(progress.attr('md-mode')).toEqual('indeterminate');
  }));

  it('should trim the md-mode value', inject(function($compile, $rootScope, $mdConstant) {
    element = $compile('<div>' +
          '<md-progress-linear md-mode=" indeterminate"></md-progress-linear>' +
          '</div>')($rootScope);

    $rootScope.$apply(function() {
    });

    var progress = element.find('md-progress-linear');
    expect(progress.attr('md-mode')).toEqual('indeterminate');
  }));

  it('should auto-set the md-mode to "determinate" if not specified but has value', inject(function($compile, $rootScope, $mdConstant) {
    var element = $compile('<div>' +
      '<md-progress-linear value="{{progress}}"></md-progress-linear>' +
      '</div>')($rootScope);

    $rootScope.$apply(function() {
      $rootScope.progress = 50;
      $rootScope.mode = "";
    });

    var progress = element.find('md-progress-linear');
    expect(progress.attr('md-mode')).toEqual('determinate');
  }));

  it('should set not transform if mode is undefined', inject(function($compile, $rootScope, $mdConstant) {
    var element = $compile('<div>' +
      '<md-progress-linear value="{{progress}}" md-mode="{{mode}}">' +
      '</md-progress-linear>' +
      '</div>')($rootScope);

    $rootScope.$apply(function() {
      $rootScope.progress = 50;
      $rootScope.mode = "";
    });

    var progress = element.find('md-progress-linear'),
      bar2 = angular.element(progress[0].querySelectorAll('.md-bar2'))[0];

    expect(bar2.style[$mdConstant.CSS.TRANSFORM]).toEqual('');
  }));

  it('should set transform based on value', inject(function($compile, $rootScope, $mdConstant) {
    var element = $compile('<div>' +
      '<md-progress-linear value="{{progress}}" md-mode="determinate">' +
      '</md-progress-linear>' +
      '</div>')($rootScope);

    $rootScope.$apply(function() {
      $rootScope.progress = 50;
    });

    var progress = element.find('md-progress-linear'),
      bar2 = angular.element(progress[0].querySelectorAll('.md-bar2'))[0];

    expect(bar2.style[$mdConstant.CSS.TRANSFORM]).toEqual('translateX(-25%) scale(0.5, 1)');
  }));

  it('should update aria-valuenow', inject(function($compile, $rootScope) {
    var element = $compile('<div>' +
      '<md-progress-linear value="{{progress}}">' +
      '</md-progress-linear>' +
      '</div>')($rootScope);

    $rootScope.$apply(function() {
      $rootScope.progress = 50;
    });

    var progress = element.find('md-progress-linear');

    expect(progress.eq(0).attr('aria-valuenow')).toEqual('50');
  }));

  it('should set transform based on buffer value', inject(function($compile, $rootScope, $mdConstant) {
    var element = $compile('<div>' +
      '<md-progress-linear value="{{progress}}" md-buffer-value="{{progress2}}" md-mode="buffer">' +
      '</md-progress-linear>' +
      '</div>')($rootScope);

    $rootScope.$apply(function() {
      $rootScope.progress = 50;
      $rootScope.progress2 = 75;
    });

    var progress = element.find('md-progress-linear'),
        bar1 = angular.element(progress[0].querySelectorAll('.md-bar1'))[0];

    expect(bar1.style[$mdConstant.CSS.TRANSFORM]).toEqual('translateX(-12.5%) scale(0.75, 1)');
  }));

  it('should not set transform in query mode', inject(function($compile, $rootScope, $mdConstant) {
    var element = $compile('<div>' +
      '<md-progress-linear md-mode="query" value="{{progress}}">' +
      '</md-progress-linear>' +
      '</div>')($rootScope);

    $rootScope.$apply(function() {
      $rootScope.progress = 80;
    });

    var progress = element.find('md-progress-linear'),
      bar2 = angular.element(progress[0].querySelectorAll('.md-bar2'))[0];

    expect(bar2.style[$mdConstant.CSS.TRANSFORM]).toBeFalsy();
  }));
});
