
angular.module('toastDemo1', ['ngMaterial'])

.controller('AppCtrl', function($mdToast) {
  var $ctrl = this;

  this.delay = 3000;
  this.topBottomOptions = ['top', 'bottom'];
  this.positionOptions = ['left', 'right', 'start', 'end'];

  this.topBottom = 'top';
  this.position = 'left';

  this.getToastPosition = function() {
    return this.topBottom + ' ' + this.position;
  };

  this.showSimpleToast = function() {
    var pinTo = $ctrl.getToastPosition();

    $mdToast.show(
      $mdToast.simple()
        .textContent('Simple Toast!')
        .position(pinTo)
        .hideDelay($ctrl.delay)
    );
  };

  this.showActionToast = function() {
    var pinTo = $ctrl.getToastPosition();
    var toast = $mdToast.simple()
      .textContent('Marked as read')
      .action('UNDO')
      .highlightAction(true)
      .highlightClass('md-accent')// Accent is used by default, this just demonstrates the usage.
      .position(pinTo);

    $mdToast.show(toast).then(function(response) {
      if ( response == 'ok' ) {
        alert('You clicked the \'UNDO\' action.');
      }
    });
  };

})

.controller('ToastCtrl', function($scope, $mdToast) {
  $scope.closeToast = function() {
    $mdToast.hide();
  };
});
