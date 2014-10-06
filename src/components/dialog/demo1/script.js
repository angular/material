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
    }).then(function(answer) {
      alert('You said the information was "' + answer + '".');
    }, function() {
      alert('You cancelled the dialog.');
    });
  };
});

function DialogController($scope, $materialDialog) {
  $scope.hide = function() {
    $materialDialog.hide();
  };

  $scope.answer = function(answer) {
    $materialDialog.hide(answer);
  };
}
