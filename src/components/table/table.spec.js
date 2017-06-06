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

  var SORTABLE_NUMBER_TEMPLATE =
    '<table data-md-table>' +
      '<thead>' +
        '<tr>' +
          '<th md-sortable>Column Head</th>' +
        '</tr>' +
      '</thead>' +
      '<tbody>' +
        '<tr>' +
          '<td>1</td>' +
        '</tr>' +
        '<tr>' +
          '<td>3</td>' +
        '</tr>' +
        '<tr>' +
          '<td>2</td>' +
        '</tr>' +
      '</tbody>' +
    '</table>';

  var SORTABLE_STRING_TEMPLATE =
    '<table data-md-table>' +
      '<thead>' +
        '<tr>' +
          '<th md-sortable>Column Head</th>' +
        '</tr>' +
      '</thead>' +
      '<tbody>' +
        '<tr>' +
          '<td>Google</td>' +
        '</tr>' +
        '<tr>' +
          '<td>Angular</td>' +
        '</tr>' +
        '<tr>' +
          '<td>Material</td>' +
        '</tr>' +
      '</tbody>' +
    '</table>';

  it('should detect the numeric cell value', function() {
    var template = '<table data-md-table>' +
        '<td>10%</td>' +
      '</table>';
    element = $compile(template)($rootScope);

    var td = element.find('td');
    expect(td.hasClass('numeric')).toBe(true);
  });

  it('should enable sorting', function() {
    element = $compile(SORTABLE_NUMBER_TEMPLATE)($rootScope);

    var th = element.find('th');
    th.triggerHandler('click');

    expect(th.hasClass('md-is-sorting')).toBe(true);
  });

  it('should sort numbers correctly', function() {
    element = $compile(SORTABLE_NUMBER_TEMPLATE)($rootScope);

    var th = element.find('th');
    th.triggerHandler('click');

    var rows = element.find('tr');
    rows = Array.prototype.slice.call(rows, 1, rows.length);

    for (var i = 0; i < rows.length; i++) {
      expect(rows[i].children[0].innerHTML).toBe((i + 1).toString());
    }
  });

  it('should sort strings alphabetical', function() {
    element = $compile(SORTABLE_STRING_TEMPLATE)($rootScope);

    var th = element.find('th');
    th.triggerHandler('click');

    var rows = element.find('tr');
    rows = Array.prototype.slice.call(rows, 1, rows.length);

    var items = ['Angular', 'Google', 'Material'];
    for (var i = 0; i < rows.length; i++) {
      expect(rows[i].children[0].innerHTML).toBe(items[i]);
    }
  });

  it('should allow reverse sorting', function() {
    element = $compile(SORTABLE_STRING_TEMPLATE)($rootScope);

    var th = element.find('th');
    th.triggerHandler('click');
    // second click for reverse
    th.triggerHandler('click');

    var rows = element.find('tr');
    rows = Array.prototype.slice.call(rows, 1, rows.length);

    var items = ['Material', 'Google', 'Angular'];
    for (var i = 0; i < rows.length; i++) {
      expect(rows[i].children[0].innerHTML).toBe(items[i]);
    }
  });

  it('should add an arrow icon if sorting is allowed', function() {
    element = $compile(SORTABLE_NUMBER_TEMPLATE)($rootScope);

    var icon = element.find('md-icon');

    expect(icon.length).toBe(1);
  });

  it('should add aria attributes to cells and rows', function() {
    element = $compile(SORTABLE_NUMBER_TEMPLATE)($rootScope);

    var rows = element.find('tr');
    var cells = element.find('td');

    for (var i = 0; i < rows.length; i++) {
      expect(rows[i].getAttribute('role')).toBe('row');
    }

    for (i = 0; i < cells.length; i++) {
      expect(cells[i].getAttribute('role')).toBe('gridcell');
    }
  });
  
});