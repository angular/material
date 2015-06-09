(function() {
  'use strict';

  /**
   * Provider that allows the user to specify messages, formatters, and parsers for date
   * internationalization.
   */
  angular.module('material.components.calendar').config(function($provide) {
    // TODO(jelbourn): Assert provided values are correctly formatted. Need assertions.

    /** @constructor */
    function DateLocaleProvider() {
      /** Array of full month names. E.g., ['January', 'Febuary', ...] */
      this.months = null;

      /** Array of abbreviated month names. E.g., ['Jan', 'Feb', ...] */
      this.shortMonths = null;

      /** Array of full day of the week names. E.g., ['Monday', 'Tuesday', ...] */
      this.days = null;

      /** Array of abbreviated dat of the week names. E.g., ['M', 'T', ...] */
      this.shortDays = null;

      /** Array of dates of a month (1 - 31). Characters might be different in some locales. */
      this.dates = null;

      /**
       * Function that converts the date portion of a Date to a string.
       * @type {(function(Date): string)}
       */
      this.formatDate = null;

      /**
       * Function that converts a date string to a Date object (the date portion)
       * @type {function(string): Date}
       */
      this.parseDate = null;

      /**
       * Function that formats a Date into a month header string.
       * @type {function(Date): string}
       */
      this.monthHeaderFormatter = null;

      /**
       * Function that formats a date into a short aria-live announcement that is read when
       * the focused date changes within the same month.
       * @type {function(Date): string}
       */
      this.shortAnnounceFormatter = null;

      /**
       * Function that formats a date into a long aria-live announcement that is read when
       * the focused date changes to a date in a different month.
       * @type {function(Date): string}
       */
      this.longAnnounceFormatter = null;
    }

    /**
     * Factory function that returns an instance of the dateLocale service.
     * @ngInject
     * @param $locale
     * @returns {DateLocale}
     */
    DateLocaleProvider.prototype.$get = function($locale) {
      /**
       * Default date-to-string formatting function.
       * @param {!Date} date
       * @returns {string}
       */
      function defaultFormatDate(date) {
        return date.toLocaleDateString();
      }

      /**
       * Default string-to-date parsing function.
       * @param {string} dateString
       * @returns {!Date}
       */
      function defaultParseDate(dateString) {
        return new Date(dateString);
      }

      /**
       * Default date-to-string formatter to get a month header.
       * @param {!Date} date
       * @returns {string}
       */
      function defaultMonthHeaderFormatter(date) {
        return service.shortMonths[date.getMonth()] + ' ' + date.getFullYear();
      }

      /**
       * Default formatter for short aria-live announcements.
       * @param {!Date} date
       * @returns {string}
       */
      function defaultShortAnnounceFormatter(date) {
        // Example: 'Tuesday 12'
        return service.days[date.getDay()] + ' ' + service.dates[date.getDate()];
      }

      /**
       * Default formatter for long aria-live announcements.
       * @param {!Date} date
       * @returns {string}
       */
      function defaultLongAnnounceFormatter(date) {
        // Example: '2015 June Thursday 18'
        return [
          date.getFullYear(),
          service.months[date.getMonth()],
          service.days[date.getDay()],
          service.dates[date.getDate()]
        ].join(' ');
      }

      // The default "short" day strings are the first character of each day,
      // e.g., "Monday" => "M".
      var defaultShortDays = $locale.DATETIME_FORMATS.DAY.map(function(day) {
        return day[0];
      });

      // The default dates are simply the numbers 1 through 31.
      var defaultDates = Array(32);
      for (var i = 1; i <= 31; i++) {
        defaultDates[i] = i;
      }

      // TODO(jelbourn): Freeze this object.
      var service = {
        months: this.months || $locale.DATETIME_FORMATS.MONTH,
        shortMonths: this.shortMonths || $locale.DATETIME_FORMATS.SHORTMONTH,
        days: this.days || $locale.DATETIME_FORMATS.DAY,
        shortDays: this.shortDays || defaultShortDays,
        dates: this.dates || defaultDates,
        formatDate: this.formatDate || defaultFormatDate,
        parseDate: this.parseDate || defaultParseDate,
        monthHeaderFormatter: this.monthHeaderFormatter || defaultMonthHeaderFormatter,
        shortAnnounceFormatter: this.shortAnnounceFormatter || defaultShortAnnounceFormatter,
        longAnnounceFormatter: this.longAnnounceFormatter || defaultLongAnnounceFormatter
      };

      return service;
    };

    $provide.provider('$$mdDateLocale', new DateLocaleProvider());
  });
})();
