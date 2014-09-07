describe('materialSubheader', function() {
  beforeEach(module('material.components.subheader'));

  it('should set aria role', inject(function($compile, $rootScope) {
    var $el = $compile('<material-subheader>Hello world!</material-header>')($rootScope);
    expect($el.attr('role')).toEqual('heading');
  }));

  it('should preserve content', inject(function($compile, $rootScope) {
    var $scope = $rootScope.$new();
    $scope.to = 'world';
    var $el = $compile('<material-subheader>Hello {{ to }}!</material-subheader>')($scope);
    $scope.$digest();
    expect($el.html()).toEqual('Hello world!');
  }));

});
