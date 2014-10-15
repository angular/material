angular.module('dialogDemo1', ['ngMaterial'])

.controller('AppCtrl', function($scope, $mdDialog) {
  $scope.alert = '';

  $scope.dialogBasic = function(ev) {
    $mdDialog.show({
      templateUrl: 'dialog1.tmpl.html',
      targetEvent: ev,
      controller: DialogController
    }).then(function() {
      $scope.alert = 'You said "Okay".';
    }, function() {
      $scope.alert = 'You cancelled the dialog.';
    });
  };

  $scope.dialogAdvanced = function(ev) {
    $mdDialog.show({
      templateUrl: 'dialog2.tmpl.html',
      targetEvent: ev,
      controller: DialogController
    }).then(function(answer) {
      $scope.alert = 'You said the information was "' + answer + '".';
    }, function() {
      $scope.alert = 'You cancelled the dialog.';
    });
  };
});

function DialogController($scope, $mdDialog) {
  $scope.hide = function() {
    $mdDialog.hide();
  };

  $scope.answer = function(answer) {
    $mdDialog.hide(answer);
  };
}
