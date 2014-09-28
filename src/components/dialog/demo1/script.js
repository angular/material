angular.module('dialogDemo1', ['ngMaterial'])

.controller('AppCtrl', function($scope, $materialDialog) {
  $scope.dialog = function(e) {
    $materialDialog.show({
      templateUrl: 'my-dialog.tmpl.html',
      targetEvent: e,
      controller: ['$scope', function($scope) {
        $scope.close = function() {
          $materialDialog.hide();
        };
      }]
    });
  };
});
