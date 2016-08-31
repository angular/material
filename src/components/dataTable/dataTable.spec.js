describe('mdTable', function () {
  var $rootScope, $document;

  beforeEach(module('material.components.table'));

  beforeEach(inject(function($injector) {
    $rootScope = $injector.get('$rootScope');
    $document = $injector.get('$document');
  }));

  it('should correctly detect the row selection', inject(function ($compile) {
    var basicTable = $compile('<table md-table>')($rootScope);
    var selectableTable = $compile('<table md-table md-table md-row-select="">')($rootScope);

    expect(basicTable.controller('mdTable').enableSelection()).toBe(false);
    expect(selectableTable.controller('mdTable').enableSelection()).toBe(true);
  }));

});