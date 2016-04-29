
angular.module('toastDemo1', ['ngMaterial'])

.controller('AppCtrl', function($scope, $mdToast) {
  $scope.verticalPosition = 'top';
  $scope.horizontalPosition = 'right';

  $scope.getToastPosition = function() {
    return $scope.verticalPosition + ' ' + $scope.horizontalPosition;
  };

  $scope.showSimpleToast = function() {
    var pinTo = $scope.getToastPosition();

    $mdToast.show(
      $mdToast.simple()
        .textContent('Simple Toast!')
        .position(pinTo )
        .hideDelay(3000)
    );
  };

  $scope.showActionToast = function() {
    var pinTo = $scope.getToastPosition();
    var toast = $mdToast.simple()
      .textContent('Marked as read')
      .action('UNDO')
      .highlightAction(true)
      .highlightClass('md-accent')// Accent is used by default, this just demonstrates the usage.
      .position(pinTo);

    $mdToast.show(toast).then(function(response) {
      if ( response == 'ok' ) {
        alert('You clicked the \'UNDO\' action.');
      }
    });
  };

})

.controller('ToastCtrl', function($scope, $mdToast) {
  $scope.closeToast = function() {
    $mdToast.hide();
  };
});
