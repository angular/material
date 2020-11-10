angular.module('selectDemoValidation', ['ngMaterial', 'ngMessages'])
.controller('AppCtrl', function($scope) {
  $scope.clearValue = function() {
    $scope.quest = undefined;
    $scope.favoriteColor = undefined;
    $scope.myForm.$setPristine();
  };
  $scope.save = function() {
    if ($scope.myForm.$valid) {
      $scope.myForm.$setSubmitted();
      alert('Form was valid.');
    } else {
      alert('Form was invalid!');
    }
  };
});
