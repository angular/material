(function () {
  'use strict';

  angular
      .module('tabsDemoDynamicHeightTabs', ['ngMaterial'] )
      .controller('AppCtrl', AppCtrl);

  function AppCtrl ( $scope ) {
    $scope.animate = false;
  }
})();
