angular
    .module('selectDemoSelectedText', ['ngMaterial'])
    .controller('SelectedTextController', function($scope) {
      $scope.items = [1, 2, 3, 4, 5, 6, 7];
      $scope.selectedItem;
      $scope.getSelectedText = function() {
        if ($scope.selectedItem !== undefined) {
          return "You have selected: Item " + $scope.selectedItem;
        } else {
          return "Please select an item";
        }
      };
    });
