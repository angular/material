angular.module('dialogDemo1', ['ngMaterial'])

.controller('AppCtrl', function($scope, $materialDialog) {
  $scope.dialogBasic = function(ev) {
    $materialDialog.show({
      templateUrl: 'dialog1.tmpl.html',
      targetEvent: ev,
      controller: DialogController
    });
  };

  $scope.dialogAdvanced = function(ev) {
    $materialDialog.show({
      templateUrl: 'dialog2.tmpl.html',
      targetEvent: ev,
      controller: DialogController
    });
  };
});

function DialogController($scope, $materialDialog) {
  $scope.hide = function() {
    $materialDialog.hide();
  };
}
