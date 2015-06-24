(function() {
  'use strict';

  angular.module('fabSpeedDialDemoMoreOptions', ['ngMaterial'])
    .controller('DemoCtrl', function($mdDialog) {
      var self = this;

      self.hidden = false;

      self.items = [
        {name: "Twitter", icon: "img/icons/twitter.svg", direction: "left" },
        {name: "Facebook", icon: "img/icons/facebook.svg", direction: "right" },
        {name: "Google Hangout", icon: "img/icons/hangout.svg", direction: "left" }
      ];

      self.openDialog = function($event, item) {
        // Show the dialog
        $mdDialog.show({
          clickOutsideToClose: true,
          controller: function($mdDialog) {
            // Save the clicked item
            this.item = item;

            // Setup some handlers
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
