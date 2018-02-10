angular
  .module('tabsDemoStretchHeight', ['ngMaterial'])
  .controller('DemoStretchHeightCtrl', function ($scope, $mdDialog) {
    $scope.sampleAction = function (ev) {
      $mdDialog.show($mdDialog.alert()
        .title('Button clicked')
        .textContent('You were thoroughly impressed.')
        .ok('Great')
        .targetEvent(ev)
      );
    };
  });
