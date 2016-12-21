describe('<md-truncate>', function() {
  var $compile, $rootScope;

  beforeEach(module('material.components.truncate'));
  beforeEach(inject(function(_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('works as an element', function() {
    var el = setup('<md-truncate>Test</md-truncate>');

    expect(el).toHaveClass('md-truncate');
  });

  it('works as an attribute', function() {
    var el = setup('<h2 md-truncate>Test</h2>');

    expect(el).toHaveClass('md-truncate');
  });

  function setup(template) {
    var element = $compile(template)($rootScope);

    $rootScope.$digest();

    return element;
  }
});