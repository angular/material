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
       * @type {function(Date): string)}
       */
      this.formatDate = null;

      /**
       * Function that converts a date string to a Date object (the date portion)
       * @type {function(string): Date}
       */
      this.parseDate = null;
    }

    /**
     * Factory function that returns an instance of the dateLocale service.
     * @ngInject
     * @param $locale
     * @returns {DateLocale}
     */
    DateLocaleProvider.prototype.$get = function($locale, $filter) {
      /**
       * Default date-to-string formatting function.
       * @param {Date} date
       * @returns {string}
       */
      function defaultFormatDate(date) {
        return date.toLocaleDateString();
      }

      /**
       * Default string-to-date parsing function.
       * @param {string} dateString
       * @returns {Date}
       */
      function defaultParseDate(dateString) {
        return new Date(dateString);
      }

      // The default "short" day strings are the first character of each day.
      var defaultShortDays = $locale.DATETIME_FORMATS.DAY.map(function(day) {
        return day[0];
      });

      window.$locale = $locale;
      window.$filter = $filter;

      var dateLocale = {
        months: this.months || $locale.DATETIME_FORMATS.MONTH,
        shortMonths: this.shortMonths || $locale.DATETIME_FORMATS.SHORTMONTH,
        days: this.days || $locale.DATETIME_FORMATS.DAY,
        shortDays: this.shortDays || defaultShortDays,
        formatDate: defaultFormatDate,
        parseDate: defaultParseDate
      };
    };

    $provide.provider('$$mdDateLocale', new DateLocaleProvider());
  });
})();
