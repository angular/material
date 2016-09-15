angular.module('tooltipDemo', ['ngMaterial'])
    .controller('AppCtrl', AppCtrl);

function AppCtrl($scope) {
  $scope.demo = {
    showTooltip: false,
    tipDirection: 'bottom'
  };

  $scope.demo.delayTooltip = undefined;
  $scope.$watch('demo.delayTooltip', function(val) {
    $scope.demo.delayTooltip = parseInt(val, 10) || 0;
  });
}
