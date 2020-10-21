angular.module('demoSwipe', ['ngMaterial'])
  .controller('demoSwipeCtrl', function($scope, $log) {
    $scope.onSwipeLeft = function(ev, target) {
      alert('You swiped left!!');

      $log.log('Event Target: ', ev.target);
      $log.log('Event Current Target: ', ev.currentTarget);
      $log.log('Original Current Target: ', target.current);
    };

    $scope.onSwipeRight = function(ev, target) {
      alert('You swiped right!!');

      $log.log('Event Target: ', ev.target);
      $log.log('Event Current Target: ', ev.currentTarget);
      $log.log('Original Current Target: ', target.current);
    };
    $scope.onSwipeUp = function(ev, target) {
      alert('You swiped up!!');

      $log.log('Event Target: ', ev.target);
      $log.log('Event Current Target: ', ev.currentTarget);
      $log.log('Original Current Target: ', target.current);
    };

    $scope.onSwipeDown = function(ev, target) {
      alert('You swiped down!!');

      $log.log('Event Target: ', ev.target);
      $log.log('Event Current Target: ', ev.currentTarget);
      $log.log('Original Current Target: ', target.current);
    };
  });
