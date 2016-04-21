fdescribe('mdTable', function () {
  var $scope;

  beforeEach(module('material.components.table'));

  beforeEach(inject(function ($rootScope) {
    $scope = {
      $new: function (properties) {
        return angular.extend($rootScope.$new(), properties);
      }
    };
  }));

  it('should not enabled row selection', inject(function ($compile) {
    var tables = [
      $compile('<md-table>')($scope.$new()),
      $compile('<md-table md-row-select="{{foo}}">')($scope.$new({foo: false})),
    ];

    tables.forEach(function (table) {
      expect(table.controller('mdTable').enableSelection()).toBe(false);
    });
  }));

  it('should enabled row selection', inject(function ($compile) {
    var tables = [
      $compile('<md-table md-row-select>')($scope.$new()),
      $compile('<md-table md-row-select="{{foo}}">')($scope.$new({foo: true})),
    ];

    tables.forEach(function (table) {
      expect(table.controller('mdTable').enableSelection()).toBe(true);
    });
  }));

});