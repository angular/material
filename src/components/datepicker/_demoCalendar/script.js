angular.module('calendarDemo1', ['ngMaterial'])
    .controller('AppCtrl', function($scope) {
      $scope.title = 'Calendar demo';
      $scope.myDate = new Date();

      $scope.adjustMonth = function(delta) {
        $scope.myDate = new Date(
            $scope.myDate.getFullYear(),
            $scope.myDate.getMonth() + delta,
            $scope.myDate.getDate());
      };
    });
