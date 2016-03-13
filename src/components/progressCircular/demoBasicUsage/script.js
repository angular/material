angular
  .module('progressCircularDemo1', ['ngMaterial'])
  .controller('AppCtrl', ['$scope', '$interval',
    function($scope, $interval) {
      var self = this,  j= 0, counter = 0;

      self.showList = [ ];
      self.activated = true;
      self.determinateValue = 30;

      /**
       * Turn off or on the 5 themed loaders
       */
      self.toggleActivation = function() {
          if ( !self.activated ) self.showList = [ ];
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

        if ( (j < 5) && !self.showList[j] && self.activated ) {
          self.showList[j] = true;
        }
        if ( counter++ % 4 === 0 ) j++;

      }, 100, 0, true);
    }
  ]);
