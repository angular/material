describe('mdProgressCircular', function() {
  beforeEach(module('material.components.progressCircular'));

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
});
