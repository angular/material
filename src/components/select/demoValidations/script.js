angular.module('selectDemoValidation', ['ngMaterial', 'ngMessages'])
.controller('AppCtrl', function($scope, $mdDialog) {
  $scope.clearValue = function() {
    $scope.quest = undefined;
    $scope.favoriteColor = undefined;
    $scope.myForm.$setPristine();
  };
  $scope.save = function(event) {
    var valid = $scope.myForm.$valid;
    if (valid) {
      $scope.myForm.$setSubmitted();
    }

    $mdDialog.show(
      $mdDialog
        .alert()
        .title('Form submit attempt.')
        .textContent('Form was ' + valid ? 'valid' : 'invalid!')
    );
  };
});
