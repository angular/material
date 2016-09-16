(function () {
  'use strict';

  angular
      .module('tabsDemoIconTabs', ['ngMaterial'] )
      .config(function($mdIconProvider) {
        $mdIconProvider
          .iconSet('communication', 'img/icons/sets/communication-icons.svg')
          .icon('favorite', 'img/icons/favorite.svg');
      })
      .controller('AppCtrl', AppCtrl);

  function AppCtrl ( $scope ) {
    $scope.data = {
      selectedIndex: 0,
      secondLocked:  true,
      secondLabel:   "Item Two",
      bottom:        false
    };
    $scope.next = function() {
      $scope.data.selectedIndex = Math.min($scope.data.selectedIndex + 1, 2) ;
    };
    $scope.previous = function() {
      $scope.data.selectedIndex = Math.max($scope.data.selectedIndex - 1, 0);
    };
  }
})();
