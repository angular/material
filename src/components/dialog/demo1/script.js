angular.module('app', ['ngMaterial'])

.controller('AppCtrl', function($scope, $materialDialog) {

  $scope.dialog = function() {
    $materialDialog({
      templateUrl: 'my-dialog.html',
      controller: [
        '$scope', 
        '$hideDialog', 
        function($scope, $hideDialog) {
          $scope.close = function() {
            $hideDialog();
          };
        }
      ]
    });
  };

});
