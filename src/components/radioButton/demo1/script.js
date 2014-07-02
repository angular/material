
angular.module('app', ['ngMaterial'])

.controller('AppCtrl', function($scope) {

  $scope.data = {
    group2 : '6',
    group1 : '2'
  };

  $scope.radioData = [
    { label: 'Label 4', value: '4' },
    { label: 'Label 5', value: '5' },
    { label: 'Label 6', value: '6' }
  ];

  $scope.addItem = function() {
    var r = Math.ceil(Math.random() * 1000);
    $scope.radioData.push({ label: 'Label ' + r, value: r });
  };

  $scope.removeItem = function() {
    $scope.radioData.pop();
  };

});
