
angular.module('app', ['ngMaterial'])

.controller('AppCtrl', function($scope) {

  $scope.data = {};
  $scope.data.group1 = '2';
  $scope.data.group2 = '6';

  $scope.radioData = [
    { label: 'Label 1', value: '1' },
    { label: 'Label 2', value: '2' },
    { label: 'Label 3', value: '3' }
  ];

  $scope.addItem = function() {
    var r = Math.ceil(Math.random() * 1000);
    $scope.radioData.push({ label: 'Label ' + r, value: r });
  };

  $scope.removeItem = function() {
    $scope.radioData.pop();
  };

});
