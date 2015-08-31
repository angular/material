angular
  .module('progressCircularDemo1', ['ngMaterial'])
  .controller('AppCtrl', ['$scope', '$interval',
    function($scope, $interval) {
      var self = this,  j= 0, counter = 0;

      self.modes = [ ];
      self.activated = true;
      self.determinateValue = 30;

      /**
       * Turn off or on the 5 themed loaders
       */
      self.toggleActivation = function() {
          if ( !self.activated ) self.modes = [ ];
          if (  self.activated ) j = counter = 0;
      };

      // Iterate every 100ms, non-stop
      $interval(function() {

        // Increment the Determinate loader

        self.determinateValue += 1;
        if (self.determinateValue > 100) {
          self.determinateValue = 30;
        }

        // Incrementally start animation the five (5) Indeterminate,
        // themed progress circular bars

        if ( (j < 5) && !self.modes[j] && self.activated ) {
          self.modes[j] = 'indeterminate';
        }
        if ( counter++ % 4 == 0 ) j++;

      }, 100, 0, true);
    }
  ]);
