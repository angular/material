(function() {
  'use strict';

  angular.module('navBarDemoBasicUsage', ['ngMaterial'])
      .controller('AppCtrl', AppCtrl);

  function AppCtrl($scope) {
    $scope.currentLink = 'page1';
    $scope.goto = function(hash) { $scope.currentLink = hash; };
  }
})();
