(function() {
  'use strict';

  /**
   * @ngdoc service
   * @name $mdDateLocaleProvider
   * @module material.components.datepicker
   *
   * @description
   * The `$mdDateLocaleProvider` is the provider that creates the `$mdDateLocale` service.
   * This provider that allows the user to specify messages, formatters, and parsers for date
   * internationalization. The `$mdDateLocale` service itself is consumed by Angular Material
   * components that deal with dates.
   *
   * @property {(Array<string>)=} months Array of month names (in order).
   * @property {(Array<string>)=} shortMonths Array of abbreviated month names.
   * @property {(Array<string>)=} days Array of the days of the week (in order).
   * @property {(Array<string>)=} shortDays Array of abbreviated dayes of the week.
   * @property {(Array<string>)=} dates Array of dates of the month. Only necessary for locales
   *     using a numeral system other than [1, 2, 3...].
   * @property {(Array<string>)=} firstDayOfWeek The first day of the week. Sunday = 0, Monday = 1,
   *    etc.
   * @property {(function(string): Date)=} parseDate Function to parse a date object from a string.
   * @property {(function(Date, string): string)=} formatDate Function to format a date object to a
   *     string. The datepicker directive also provides the time zone, if it was specified.
   * @property {(function(Date): string)=} monthHeaderFormatter Function that returns the label for
   *     a month given a date.
   * @property {(function(Date): string)=} monthFormatter Function that returns the full name of a month
   *     for a giben date.
   * @property {(function(number): string)=} weekNumberFormatter Function that returns a label for
   *     a week given the week number.
   * @property {(string)=} msgCalendar Translation of the label "Calendar" for the current locale.
   * @property {(string)=} msgOpenCalendar Translation of the button label "Open calendar" for the
   *     current locale.
   * @property {Date=} firstRenderableDate The date from which the datepicker calendar will begin
   * rendering. Note that this will be ignored if a minimum date is set. Defaults to January 1st 1880.
   * @property {Date=} lastRenderableDate The last date that will be rendered by the datepicker
   * calendar. Note that this will be ignored if a maximum date is set. Defaults to January 1st 2130.
   *
   * @usage
   * <hljs lang="js">
   * myAppModule.config(function($mdDateLocaleProvider) {
   *
   *     // Example of a French localization.
   *     $mdDateLocaleProvider.months = ['janvier', 'février', 'mars', ...];
   *     $mdDateLocaleProvider.shortMonths = ['janv', 'févr', 'mars', ...];
   *     $mdDateLocaleProvider.days = ['dimanche', 'lundi', 'mardi', ...];
   *     $mdDateLocaleProvider.shortDays = ['Di', 'Lu', 'Ma', ...];
   *
   *     // Can change week display to start on Monday.
   *     $mdDateLocaleProvider.firstDayOfWeek = 1;
   *
   *     // Optional.
   *     $mdDateLocaleProvider.dates = [1, 2, 3, 4, 5, 6, ...];
   *
   *     // Example uses moment.js to parse and format dates.
   *     $mdDateLocaleProvider.parseDate = function(dateString) {
   *       var m = moment(dateString, 'L', true);
   *       return m.isValid() ? m.toDate() : new Date(NaN);
   *     };
   *
   *     $mdDateLocaleProvider.formatDate = function(date) {
   *       var m = moment(date);
   *       return m.isValid() ? m.format('L') : '';
   *     };
   *
   *     $mdDateLocaleProvider.monthHeaderFormatter = function(date) {
   *       return myShortMonths[date.getMonth()] + ' ' + date.getFullYear();
   *     };
   *
   *     // In addition to date display, date components also need localized messages
   *     // for aria-labels for screen-reader users.
   *
   *     $mdDateLocaleProvider.weekNumberFormatter = function(weekNumber) {
   *       return 'Semaine ' + weekNumber;
   *     };
   *
   *     $mdDateLocaleProvider.msgCalendar = 'Calendrier';
   *     $mdDateLocaleProvider.msgOpenCalendar = 'Ouvrir le calendrier';
   *
   *     // You can also set when your calendar begins and ends.
   *     $mdDateLocaleProvider.firstRenderableDate = new Date(1776, 6, 4);
   *     $mdDateLocaleProvider.lastRenderableDate = new Date(2012, 11, 21);
   * });
   * </hljs>
   *
   */
  angular.module('material.components.datepicker').config(function($provide) {
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

      /** Index of the first day of the week. 0 = Sunday, 1 = Monday, etc. */
      this.firstDayOfWeek = 0;

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
       * Function that formats a week number into a label for the week.
       * @type {function(number): string}
       */
      this.weekNumberFormatter = null;

      /**
       * Function that formats a date into a long aria-label that is read
       * when the focused date changes.
       * @type {function(Date): string}
       */
      this.longDateFormatter = null;

      /**
       * ARIA label for the calendar "dialog" used in the datepicker.
       * @type {string}
       */
      this.msgCalendar = '';

      /**
       * ARIA label for the datepicker's "Open calendar" buttons.
       * @type {string}
       */
      this.msgOpenCalendar = '';
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
       * @param {!Date} date
       * @param {string=} timezone
       * @returns {string}
       */
      function defaultFormatDate(date, timezone) {
        if (!date) {
          return '';
        }

        // All of the dates created through ng-material *should* be set to midnight.
        // If we encounter a date where the localeTime shows at 11pm instead of midnight,
        // we have run into an issue with DST where we need to increment the hour by one:
        // var d = new Date(1992, 9, 8, 0, 0, 0);
        // d.toLocaleString(); // == "10/7/1992, 11:00:00 PM"
        var localeTime = date.toLocaleTimeString();
        var formatDate = date;
        if (date.getHours() === 0 &&
            (localeTime.indexOf('11:') !== -1 || localeTime.indexOf('23:') !== -1)) {
          formatDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 1, 0, 0);
        }

        return $filter('date')(formatDate, 'M/d/yyyy', timezone);
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
       * Default function to determine whether a string makes sense to be
       * parsed to a Date object.
       *
       * This is very permissive and is just a basic sanity check to ensure that
       * things like single integers aren't able to be parsed into dates.
       * @param {string} dateString
       * @returns {boolean}
       */
      function defaultIsDateComplete(dateString) {
        dateString = dateString.trim();

        // Looks for three chunks of content (either numbers or text) separated
        // by delimiters.
        var re = /^(([a-zA-Z]{3,}|[0-9]{1,4})([ \.,]+|[\/\-])){2}([a-zA-Z]{3,}|[0-9]{1,4})$/;
        return re.test(dateString);
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
       * Default formatter for a month.
       * @param {!Date} date
       * @returns {string}
       */
      function defaultMonthFormatter(date) {
        return service.months[date.getMonth()] + ' ' + date.getFullYear();
      }

      /**
       * Default week number formatter.
       * @param number
       * @returns {string}
       */
      function defaultWeekNumberFormatter(number) {
        return 'Week ' + number;
      }

      /**
       * Default formatter for date cell aria-labels.
       * @param {!Date} date
       * @returns {string}
       */
      function defaultLongDateFormatter(date) {
        // Example: 'Thursday June 18 2015'
        return [
          service.days[date.getDay()],
          service.months[date.getMonth()],
          service.dates[date.getDate()],
          date.getFullYear()
        ].join(' ');
      }

      // The default "short" day strings are the first character of each day,
      // e.g., "Monday" => "M".
      var defaultShortDays = $locale.DATETIME_FORMATS.SHORTDAY.map(function(day) {
        return day.substring(0, 1);
      });

      // The default dates are simply the numbers 1 through 31.
      var defaultDates = Array(32);
      for (var i = 1; i <= 31; i++) {
        defaultDates[i] = i;
      }

      // Default ARIA messages are in English (US).
      var defaultMsgCalendar = 'Calendar';
      var defaultMsgOpenCalendar = 'Open calendar';

      // Default start/end dates that are rendered in the calendar.
      var defaultFirstRenderableDate = new Date(1880, 0, 1);
      var defaultLastRendereableDate = new Date(defaultFirstRenderableDate.getFullYear() + 250, 0, 1);

      var service = {
        months: this.months || $locale.DATETIME_FORMATS.MONTH,
        shortMonths: this.shortMonths || $locale.DATETIME_FORMATS.SHORTMONTH,
        days: this.days || $locale.DATETIME_FORMATS.DAY,
        shortDays: this.shortDays || defaultShortDays,
        dates: this.dates || defaultDates,
        firstDayOfWeek: this.firstDayOfWeek || 0,
        formatDate: this.formatDate || defaultFormatDate,
        parseDate: this.parseDate || defaultParseDate,
        isDateComplete: this.isDateComplete || defaultIsDateComplete,
        monthHeaderFormatter: this.monthHeaderFormatter || defaultMonthHeaderFormatter,
        monthFormatter: this.monthFormatter || defaultMonthFormatter,
        weekNumberFormatter: this.weekNumberFormatter || defaultWeekNumberFormatter,
        longDateFormatter: this.longDateFormatter || defaultLongDateFormatter,
        msgCalendar: this.msgCalendar || defaultMsgCalendar,
        msgOpenCalendar: this.msgOpenCalendar || defaultMsgOpenCalendar,
        firstRenderableDate: this.firstRenderableDate || defaultFirstRenderableDate,
        lastRenderableDate: this.lastRenderableDate || defaultLastRendereableDate
      };

      return service;
    };

    $provide.provider('$mdDateLocale', new DateLocaleProvider());
  });
})();
