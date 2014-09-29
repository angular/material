describe('materialLinearProgress', function() {

  beforeEach(module('material.components.linearProgress'));

  it('should set transform based on value', inject(function($compile, $rootScope, $materialEffects) {
    var element = $compile('<div>' +
      '<material-linear-progress value="{{progress}}">' +
      '</material-linear-progress>' +
      '</div>')($rootScope);

    $rootScope.$apply(function() {
      $rootScope.progress = 50;
    });

    var progress = element.find('material-linear-progress'),
      bar2 = progress.find('.bar2')[0];

    expect(bar2.style[$materialEffects.TRANSFORM]).toEqual('translateX(-25%) scale(0.5, 1)');
  }));

  it('should update aria-valuenow', inject(function($compile, $rootScope) {
    var element = $compile('<div>' +
      '<material-linear-progress value="{{progress}}">' +
      '</material-linear-progress>' +
      '</div>')($rootScope);

    $rootScope.$apply(function() {
      $rootScope.progress = 50;
    });

    var progress = element.find('material-linear-progress');

    expect(progress.eq(0).attr('aria-valuenow')).toEqual('50');
  }));

  it('should set transform based on secondaryvalue', inject(function($compile, $rootScope, $materialEffects) {
    var element = $compile('<div>' +
      '<material-linear-progress value="{{progress}}" secondaryvalue="{{progress2}}">' +
      '</material-linear-progress>' +
      '</div>')($rootScope);

    $rootScope.$apply(function() {
      $rootScope.progress = 50;
      $rootScope.progress2 = 75;
    });

    var progress = element.find('material-linear-progress'),
      bar1 = progress.find('.bar1')[0];

    expect(bar1.style[$materialEffects.TRANSFORM]).toEqual('translateX(-12.5%) scale(0.75, 1)');
  }));

  it('should not set transform in query mode', inject(function($compile, $rootScope, $materialEffects) {
    var element = $compile('<div>' +
      '<material-linear-progress mode="query" value="{{progress}}">' +
      '</material-linear-progress>' +
      '</div>')($rootScope);

    $rootScope.$apply(function() {
      $rootScope.progress = 80;
    });

    var progress = element.find('material-linear-progress'),
      bar2 = progress.find('.bar2')[0];

    expect(bar2.style[$materialEffects.TRANSFORM]).toBeFalsy();
  }));
});
