
angular.module('checkboxDemo2', ['ngMaterial'])

.controller('AppCtrl', function($scope) {

    $scope.items = [1,2,3,4,5];
      $scope.selected = [];

      $scope.toggle = function (item, list) {
        var idx = list.indexOf(item);
        if (idx > -1) {
          list.splice(idx, 1);
        }
        else {
          list.push(item);
        }
      };

      $scope.exists = function (item, list) {
        return list.indexOf(item) > -1;
      };
});
