(function () {
  'use strict';
  angular
      .module('selectDemoRemoteAPI', ['ngMaterial'])
      .controller('AppCtrl', function($scope, $mdComponentRegistry) {

        $scope.options = ['CA', 'NY'];
        
        $scope.openSelect = function() {
          $mdComponentRegistry.getAPI('remote-select').open();
        };
      });
})();
