angular.module( 'app', [ 'ngMaterial' ] )

.controller('AppCtrl', function( $scope, $timeout ) {
  var scrollID;

  $scope.selected = 0;
  $scope.enableAutoScroll = suspendAutoScroll;

  autoScrollTabs();

  /**
   * Auto select next tab every 4 secs...
   */
  function autoScrollTabs() {
//    scrollID = $timeout(function(){
//      $scope.selected = ($scope.selected + 1)%3;
//      autoScrollTabs();
//    },4000);
  }

  /**
   * Suspend auto scrolling while mouse is over the footer
   * area.
   *
   * @param enabled
   */
  function suspendAutoScroll(enabled) {
    if ( !enabled ) {
      $timeout.cancel( scrollID );
    } else {
      autoScrollTabs();
    }
  }

});
