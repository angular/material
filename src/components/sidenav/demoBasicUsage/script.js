
angular.module('sidenavDemo1', ['ngMaterial'])

.controller('AppCtrl', function($scope, $timeout, $mdSidenav, $log) {
    
    
$scope.$on('$mdSideNavOpen', function(e, navname){
    
    $log.debug('broadcast for open on: ' +navname);
    
});
    
    $scope.$on('$mdSideNavClose', function(e, navname){
    
    $log.debug('broadcast for close on: ' +navname);
    
    
});
    
  $scope.toggleLeft = function() {
    $mdSidenav('left').toggle()
                      .then(function(){
                          $log.debug("toggle left is done");
                      });
  };
  $scope.toggleRight = function() {
    $mdSidenav('right').toggle()
                        .then(function(){
                          $log.debug("toggle RIGHT is done");
                        });
  };
})

.controller('LeftCtrl', function($scope, $timeout, $mdSidenav, $log) {
  $scope.close = function() {
    $mdSidenav('left').close()
                      .then(function(){
                        $log.debug("close LEFT is done");
                      });

  };
})

.controller('RightCtrl', function($scope, $timeout, $mdSidenav, $log) {
  $scope.close = function() {
    $mdSidenav('right').close()
                        .then(function(){
                          $log.debug("close RIGHT is done");
                        });
  };
});
