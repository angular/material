
angular.module('toastDemo2', ['ngMaterial'])

.controller('AppCtrl', function($scope, $mdToast, $document) {
  $scope.showCustomToast = function() {
    $mdToast.show({
      controller: 'ToastCtrl',
      templateUrl: 'toast-template.html',
      hideDelay: 6000,
      position: 'top right'
    });
  };
})

.controller('ToastCtrl', function($scope, $mdToast, $mdDialog) {
  $scope.closeToast = function() {
    $mdToast.hide();
  };

  $scope.openMoreInfo = function(e) {
    $mdDialog.show($mdDialog
        .alert()
        .title('More info goes here.')
        .textContent('Something witty.')
        .ariaLabel('More info')
        .ok('Got it')
        .targetEvent(e)
    );
  };
});
