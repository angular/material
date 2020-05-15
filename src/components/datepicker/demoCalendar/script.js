angular.module('calendarDemo', ['ngMaterial']).controller('AppCtrl', function() {
  this.startDate = new Date();
  this.endDate = new Date();
  this.endDate.setDate(this.endDate.getDate() + 5);
});
