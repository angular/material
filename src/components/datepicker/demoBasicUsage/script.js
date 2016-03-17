angular.module('datepickerBasicUsage',
    ['ngMaterial', 'ngMessages']).controller('AppCtrl', function($scope) {

  $scope.beginDate = new Date();
  $scope.endDate = new Date(
      $scope.beginDate.getFullYear(),
      $scope.beginDate.getMonth() + 2,
      $scope.beginDate.getDate()
  );

  $scope.myDate = new Date();

  $scope.minDate = new Date(
      $scope.beginDate.getFullYear(),
      $scope.beginDate.getMonth() - 2,
      $scope.beginDate.getDate());

  $scope.maxDate = new Date(
      $scope.endDate.getFullYear(),
      $scope.endDate.getMonth() + 2,
      $scope.endDate.getDate());

  $scope.onlyWeekendsPredicate = function(date) {
    var day = date.getDay();
    return day === 0 || day === 6;
  }
});
