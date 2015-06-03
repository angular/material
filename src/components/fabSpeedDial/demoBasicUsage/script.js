(function() {
  'use strict';

  angular.module('fabSpeedDialBasicUsageDemo', ['ngMaterial'])
    .controller('AppCtrl', function($scope) {
      $scope.demo = {
        topDirections: ['left', 'up'],
        bottomDirections: ['down', 'right'],

        isOpen: false,

        availableModes: ['md-fling', 'md-scale'],
        selectedMode: 'md-fling',

        availableDirections: ['up', 'down', 'left', 'right'],
        selectedDirection: 'up'
      };
    });
})();
