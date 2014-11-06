
angular.module('toastDemo1', ['ngMaterial'])

.controller('AppCtrl', function($scope, $mdToast, $animate) {
  
  $scope.toastPosition = {
    bottom: false,
    top: true,
    left: false,
    right: true
  };

  $scope.getToastPosition = function() {
    return Object.keys($scope.toastPosition)
      .filter(function(pos) { return $scope.toastPosition[pos]; })
      .join(' ');
  };

  $scope.complexToastIt = function() {
    $mdToast.show({
      controller: 'ToastCtrl',
      templateUrl: 'toast-template.html',
      hideDelay: 6000,
      position: $scope.getToastPosition()
    });
  };

  $scope.toastIt = function() {
    $mdToast.show({
      template: '<md-toast>Hello, ' + Math.random() + '</md-toast>',
      hideDelay: 2000,
      position: $scope.getToastPosition()
    });
  };

})

.controller('ToastCtrl', function($scope, $mdToast) {
  $scope.closeToast = function() {
    $mdToast.hide();
  };
});
