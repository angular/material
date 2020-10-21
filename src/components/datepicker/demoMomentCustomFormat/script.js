(function () {
  'use strict';

  angular.module('customDatepickerMoment', ['ngMaterial']).config(function($mdDateLocaleProvider) {
    /**
     * @param date {Date}
     * @returns {string} string representation of the provided date
     */
    $mdDateLocaleProvider.formatDate = function(date) {
      return date ? moment(date).format('M/D') : '';
    };

    /**
     * @param dateString {string} string that can be converted to a Date
     * @returns {Date} JavaScript Date object created from the provided dateString
     */
    $mdDateLocaleProvider.parseDate = function(dateString) {
      var m = moment(dateString, 'M/D', true);
      return m.isValid() ? m.toDate() : new Date(NaN);
    };

    /**
     * Check if the date string is complete enough to parse. This avoids calls to parseDate
     * when the user has only typed in the first digit or two of the date.
     * Allow only a day and month to be specified.
     * @param dateString {string} date string to evaluate for parsing
     * @returns {boolean} true if the date string is complete enough to be parsed
     */
    $mdDateLocaleProvider.isDateComplete = function(dateString) {
      dateString = dateString.trim();
      // Look for two chunks of content (either numbers or text) separated by delimiters.
      var re = /^(([a-zA-Z]{3,}|[0-9]{1,4})([ .,]+|[/-]))([a-zA-Z]{3,}|[0-9]{1,4})/;
      return re.test(dateString);
    };
  })
  .controller("AppCtrl", function($log) {
    this.myDate = new Date();

    this.onDateChanged = function() {
      $log.log('Updated Date: ', this.myDate);
    };
  });
})();
