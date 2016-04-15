angular.module('whiteframeDirectiveUsage', ['ngMaterial'])
    .controller('DemoCtrl', function($interval) {
      this.elevation = 1;
      this.showFrame = 3;
      
      this.nextElevation = function() {
        if (++this.elevation == 25) {
          this.elevation = 1;
        }
      };

      $interval(this.nextElevation.bind(this), 500);
      
      this.toggleFrame = function() {
        this.showFrame = this.showFrame == 3 ? -1 : 3;
      };
    });
