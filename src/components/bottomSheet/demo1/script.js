angular.module('bottomSheetDemo1', ['ngMaterial'])

.controller('BottomSheetExample', function($scope, $timeout, $materialBottomSheet) {
  $scope.showListBottomSheet = function($event) {
    $materialBottomSheet.show({
      templateUrl: 'bottom-sheet-list-template.html',
      controller: 'BottomSheetCtrl',
      targetEvent: $event
    }).then(function(clickedItem) {
      alert(clickedItem.name + ' clicked!');
    });
  };

  $scope.showGridBottomSheet = function($event) {
    $materialBottomSheet.show({
      templateUrl: 'bottom-sheet-grid-template.html',
      controller: 'BottomSheetCtrl',
      targetEvent: $event
    }).then(function(clickedItem) {
      alert(clickedItem.name + ' clicked!');
    });
  };
})

.controller('BottomSheetCtrl', function($scope, $materialBottomSheet) {

  $scope.items = [
    { name: 'Facebook' },
    { name: 'Twitter' },
    { name: 'Print' },
    { name: 'Email' },
  ];

  $scope.listItemClick = function($index) {
    var clickedItem = $scope.items[$index];
    $materialBottomSheet.hide(clickedItem);
  };
});
