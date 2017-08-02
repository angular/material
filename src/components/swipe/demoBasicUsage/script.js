angular.module('demoSwipe', ['ngMaterial'])
  .controller('demoSwipeCtrl', function($scope, $mdDialog, $log) {
    $scope.onSwipe = function onSwipe(direction, ev, target) {
      $log.log('Event Target: ', ev.target);
      $log.log('Event Current Target: ', ev.currentTarget);
      $log.log('Original Current Target: ', target.current);

      $mdDialog.show(
        $mdDialog
          .alert()
          .title('Swipe action')
          .textContent('You swiped ' + direction + '!!')
          .event(ev)
      );
    };
  });
