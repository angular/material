angular.module('datepickerValidations', ['ngMaterial', 'ngMessages'])
.controller('AppCtrl', function() {
  this.myDate = new Date();

  this.minDate = new Date(
    this.myDate.getFullYear(),
    this.myDate.getMonth() - 2,
    this.myDate.getDate()
  );

  this.maxDate = new Date(
    this.myDate.getFullYear(),
    this.myDate.getMonth() + 2,
    this.myDate.getDate()
  );

  /**
   * @param {Date} date
   * @returns {boolean}
   */
  this.onlyWeekendsPredicate = function(date) {
    var day = date.getDay();
    return day === 0 || day === 6;
  };

  /**
   * @param {Date} date
   * @returns {boolean} return false to disable all odd numbered months, true for even months
   */
  this.evenMonthsPredicate = function(date) {
    return date.getMonth() % 2 !== 0;
  };
});
