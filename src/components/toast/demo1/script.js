
angular.module('app', ['ngMaterial'])

.controller('AppCtrl', function($scope, $materialToast, $animate) {
  
  $scope.toastPosition = {
    bottom: true,
    top: false,
    left: true,
    right: false,
    fit: false
  };

  $scope.getToastPosition = function() {
    return Object.keys($scope.toastPosition)
      .filter(function(pos) { return $scope.toastPosition[pos]; })
      .join(' ');
  };

  $scope.complexToastIt = function() {
    $materialToast({
      controller: 'ToastCtrl',
      templateUrl: 'toast-template.html',
      duration: 5000,
      position: $scope.getToastPosition()
    });
  };

  $scope.toastIt = function() {
    $materialToast({
      template: 'Hello, ' + Math.random(),
      duration: 2000,
      position: $scope.getToastPosition()
    });
  };

})

.controller('ToastCtrl', function($scope, $hideToast) {
  $scope.closeToast = function() {
    $hideToast();
  };
});
