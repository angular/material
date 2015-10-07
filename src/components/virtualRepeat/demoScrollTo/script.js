(function () {
  'use strict';

    angular
      .module('virtualRepeatScrollToDemo', ['ngMaterial'])
      .controller('AppCtrl', function($scope) {
        this.selectedYear = 0;
        this.years = [];
        this.items = [];
        var currentYear = new Date().getFullYear();
        var monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'];
        // Build a list of months over 20 years
        for (var y = currentYear; y >= (currentYear-20); y--) {
          this.years.push(y);
          this.items.push({year: y, text: y, header: true});
          for (var m = 11; m >= 0; m--) {
            this.items.push({year: y, month: m, text: monthNames[m]});
          }
        }
        // Whenever a different year is selected, scroll to that year
        $scope.$watch('ctrl.selectedYear', angular.bind(this, function(yearIndex) {
          var scrollYear = Math.floor(this.topIndex / 13);
          if(scrollYear !== yearIndex) {
            this.topIndex = yearIndex * 13;
          }
        }));
        // The selected year should follow the year that is at the top of the scroll container
        $scope.$watch('ctrl.topIndex', angular.bind(this, function(topIndex) {
          var scrollYear = Math.floor(topIndex / 13);
          this.selectedYear = scrollYear;
        }));
      });

})();
