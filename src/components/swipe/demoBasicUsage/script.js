angular.module('demoSwipe', ['ngMaterial'])
  .controller('demoSwipeCtrl', function($scope) {
    $scope.onSwipeLeft = function(ev) {
      alert('You swiped left!!');
    };

    $scope.onSwipeRight = function(ev) {
      alert('You swiped right!!');
    };
  });
