angular.module('tooltipDemo1', ['ngMaterial'])
.controller('AppCtrl', function($scope) {
  $scope.demo = {
    showTooltip : false,
    tipDirection : ''
  };

  $scope.$watch('demo.tipDirection',function(val) {
    if (val && val.length ) {
      $scope.demo.showTooltip = true;
    }
  })
});
