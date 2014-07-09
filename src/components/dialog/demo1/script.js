angular.module('app', ['ngMaterial'])

.controller('AppCtrl', function($scope, $materialDialog) {

  $scope.dialog = function(e) {
    $materialDialog({
      templateUrl: 'my-dialog.html',
      targetEvent: e,
      controller: ['$scope', '$hideDialog', function($scope, $hideDialog) {
        $scope.close = function() {
          $hideDialog();
        };
      }]
    });
  };

});
