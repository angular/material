(function() {

  var isDlgOpen;

  angular
    .module('toastDemo2', ['ngMaterial'])
    .controller('AppCtrl', function($scope, $mdToast) {
      $scope.showCustomToast = function() {
        $mdToast.show({
          hideDelay   : 3000,
          position    : 'top right',
          controller  : 'ToastCtrl',
          templateUrl : 'toast-template.html'
        });
      };
    })
    .controller('ToastCtrl', function($scope, $mdToast, $mdDialog) {

      $scope.closeToast = function() {
        if (isDlgOpen) return;

        $mdToast
          .hide()
          .then(function() {
            isDlgOpen = false;
          });
      };

      $scope.openMoreInfo = function(e) {
        if ( isDlgOpen ) return;
        isDlgOpen = true;

        $mdDialog
          .show($mdDialog
            .alert()
            .title('More info goes here.')
            .textContent('Something witty.')
            .ariaLabel('More info')
            .ok('Got it')
            .targetEvent(e)
          )
          .then(function() {
            isDlgOpen = false;
          });
      };
    });

})();
