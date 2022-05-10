angular.module('ngModelTimezoneUsage', ['ngMaterial', 'ngMessages'])
.controller('AppCtrl', function() {
  this.datepickerDate = new Date(0);
  this.datepickerDate.setUTCFullYear(2020, 5, 19);

  // represents isssue: https://github.com/angular/material/issues/12149 , when input box initial values do not takes into account passed timezone option.
  this.datepickerDate.setUTCHours(23, 0, 0, 0);

  this.calendarDate = new Date(0);
  this.calendarDate.setUTCFullYear(2020, 5, 19);

  // represents isssue: https://github.com/angular/material/issues/12149 , when input box initial values do not takes into account passed timezone option.
  this.datepickerDate.setUTCHours(23, 0, 0, 0);
});
