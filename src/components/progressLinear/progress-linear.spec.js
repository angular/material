describe('mdProgressLinear', function() {

  beforeEach(module('material.components.progressLinear'));

  it('should set transform based on value', inject(function($compile, $rootScope, $mdConstant) {
    var element = $compile('<div>' +
      '<md-progress-linear value="{{progress}}">' +
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
      '<md-progress-linear value="{{progress}}" md-buffer-value="{{progress2}}">' +
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
