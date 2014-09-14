describe('materialSubheader', function() {
  var $materialStickyMock,
      basicHtml = '<material-subheader>Hello world!</material-header>';

  beforeEach(module('material.components.subheader', function($provide) {
    $materialStickyMock = function() {
      $materialStickyMock.args = Array.prototype.slice.call(arguments);
    };
    $provide.value('$materialSticky', $materialStickyMock);
  }));


  it('should set default aria role', inject(function($compile, $rootScope) {
    var $el = $compile(basicHtml)($rootScope);
    expect($el.attr('role')).toEqual('heading');
  }));

  it('should respect a custom set aria role', inject(function($compile, $rootScope) {
    var $el = $compile('<material-subheader role="button">Hello world!</material-header>')($rootScope);
    expect($el.attr('role')).toEqual('button');
  }));

  it('should preserve content', inject(function($compile, $rootScope) {
    var $scope = $rootScope.$new();
    $scope.to = 'world';
    var $el = $compile('<material-subheader>Hello {{ to }}!</material-subheader>')($scope);
    $scope.$digest();
    expect($el.children(0).html()).toEqual('Hello world!');
  }));

  it('should implement $materialSticky', inject(function($compile, $rootScope) {
    var $el = $compile(basicHtml)($rootScope);
    expect($materialStickyMock.args[0]).toBe($rootScope);
    expect($materialStickyMock.args[1][0]).toBe($el.children(0)[0]);
  }));

});
