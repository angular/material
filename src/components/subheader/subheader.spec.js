describe('materialSubheader', function() {
  var $materialStickyMock,
      basicHtml = '<material-subheader>Hello world!</material-header>';

  beforeEach(module('material.components.subheader', function($provide) {
    $materialStickyMock = function() {
      $materialStickyMock.args = Array.prototype.slice.call(arguments);
    };
    $provide.value('$materialSticky', $materialStickyMock);
  }));


  it('should preserve content', inject(function($compile, $rootScope) {
    var $scope = $rootScope.$new();
    $scope.to = 'world';
    var $el = $compile('<div><material-subheader>Hello {{ to }}!</material-subheader></div>')($scope);
    $scope.$digest();
    var $subHeader = $el.children();
    expect($subHeader.text()).toEqual('Hello world!');
  }));

  it('should implement $materialSticky', inject(function($compile, $rootScope) {
    var scope = $rootScope.$new();
    var $el = $compile(basicHtml)(scope);
    expect($materialStickyMock.args[0]).toBe(scope);
  }));

});
