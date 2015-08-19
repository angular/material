angular.module('switchDemo1', ['ngMaterial'])
.controller('SwitchDemoCtrl', function($scope) {
  $scope.data = {
    cb1: true,
    cb4: true,
    cb5: false
  };

  $scope.onChange = function(cbState) {
  	$scope.message = "The switch is now: " + cbState;
  };
});
