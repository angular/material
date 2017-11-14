angular.module('demoSwipe', ['ngMaterial'])
  .controller('demoSwipeCtrl', function($scope, $mdDialog) {
    $scope.onSwipe = function onSwipe(direction, ev) {
      $mdDialog.show(
        $mdDialog
          .alert()
          .title('Swipe action')
          .textContent('You swiped ' + direction + '!!')
          .event(ev)
      );
    };
  });
