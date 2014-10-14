describe('mdSubheader', function() {
  var $mdStickyMock,
      basicHtml = '<md-subheader>Hello world!</md-header>';

  beforeEach(module('material.components.subheader', function($provide) {
    $mdStickyMock = function() {
      $mdStickyMock.args = Array.prototype.slice.call(arguments);
    };
    $provide.value('$mdSticky', $mdStickyMock);
  }));


  it('should preserve content', inject(function($compile, $rootScope) {
    var $scope = $rootScope.$new();
    $scope.to = 'world';
    var $el = $compile('<div><md-subheader>Hello {{ to }}!</md-subheader></div>')($scope);
    $scope.$digest();
    var $subHeader = $el.children();
    expect($subHeader.text()).toEqual('Hello world!');
  }));

  it('should implement $mdSticky', inject(function($compile, $rootScope) {
    var scope = $rootScope.$new();
    var $el = $compile(basicHtml)(scope);
    expect($mdStickyMock.args[0]).toBe(scope);
  }));

});
