describe('mdTable', function() {
  var $compile, $rootScope, element;

  beforeEach(module('material.components.table'));
  beforeEach(inject(function(_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  afterEach(function() {
    element.remove();
  });

  it('should detect the numeric cell value', function() {
    var template = '<table data-md-table>' +
        '<td>10%</td>' +
      '</table>';
    element = $compile(template)($rootScope);

    var td = element.find('td');
    expect(td.hasClass('numeric')).toBe(true);
  });
  
});