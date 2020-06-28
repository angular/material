angular.module('ngModelTimezoneUsage', ['ngMaterial', 'ngMessages'])
.controller('AppCtrl', function() {
  this.datepickerDate = new Date(0);
  this.datepickerDate.setUTCFullYear(2020, 5, 19);

  this.calendarDate = new Date(0);
  this.calendarDate.setUTCFullYear(2020, 5, 19);
});
