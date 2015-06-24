(function() {
  'use strict';

  angular.module('fabSpeedDialModalDemo', ['ngMaterial'])
    .controller('DemoCtrl', function($mdDialog) {
      this.openDialog = function($event) {
        $mdDialog.show({
          clickOutsideToClose: true,
          controller: function($mdDialog) {
            this.close = function() {
              $mdDialog.cancel();
            };
            this.submit = function() {
              $mdDialog.hide();
            };
          },
          controllerAs: 'dialog',
          templateUrl: 'dialog.html',
          targetEvent: $event
        });
      }
    });
})();
