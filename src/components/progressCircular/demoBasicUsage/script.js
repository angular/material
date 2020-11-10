angular
  .module('progressCircularDemo1', ['ngMaterial'], function($mdThemingProvider) {
    $mdThemingProvider.theme('docs-dark', 'default')
      .primaryPalette('yellow')
      .dark();
  })
  .controller('AppCtrl', ['$interval',
    function($interval) {
      var self = this;

      self.activated = true;
      self.determinateValue = 30;

      // Iterate every 100ms, non-stop and increment
      // the Determinate loader.
      $interval(function() {

        self.determinateValue += 1;
        if (self.determinateValue > 100) {
          self.determinateValue = 30;
        }

      }, 100);
    }
  ]);
