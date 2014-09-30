describe('materialCircularProgress', function() {
  beforeEach(module('material.components.circularProgress'));

  it('should update aria-valuenow', inject(function($compile, $rootScope) {
    var element = $compile('<div>' +
      '<material-circular-progress value="{{progress}}">' +
      '</material-circular-progress>' +
      '</div>')($rootScope);

    $rootScope.$apply(function() {
      $rootScope.progress = 50;
    });

    var progress = element.find('material-circular-progress');

    expect(progress.eq(0).attr('aria-valuenow')).toEqual('50');
  }));
});