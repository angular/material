(function() {
  'use strict';

  angular.module('fabToolbarBasicUsageDemo', ['ngMaterial'])
    .controller('AppCtrl', function($scope) {
      $scope.isOpen = false;

      $scope.demo = {
        isOpen: false,
        count: 0,
        selectedDirection: 'left'
      };
    });
})();