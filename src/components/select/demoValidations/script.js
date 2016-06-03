angular.module('selectDemoValidation', ['ngMaterial', 'ngMessages'])
.controller('AppCtrl', function($scope) {
  $scope.clearValue = function() {
    $scope.quest = undefined;
    $scope.favoriteColor = undefined;
  };
  $scope.save = function() {
    if ($scope.myForm.$valid) {
      alert('Form was valid.');
    } else {
      $scope.myForm.$setSubmitted(true);
      alert('Form was invalid!');
    }
  };
});
