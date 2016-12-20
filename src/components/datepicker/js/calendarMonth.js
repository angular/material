(function() {
  'use strict';

  angular.module('material.components.datepicker')
    .directive('mdCalendarMonth', calendarDirective);

  /**
   * Height of one calendar month tbody. This must be made known to the virtual-repeat and is
   * subsequently used for scrolling to specific months.
   */
  var TBODY_HEIGHT = 265;

  /**
   * Height of a calendar month with a single row. This is needed to calculate the offset for
   * rendering an extra month in virtual-repeat that only contains one row.
   */
  var TBODY_SINGLE_ROW_HEIGHT = 45;

  /** Private directive that represents a list of months inside the calendar. */
  function calendarDirective() {
    return {
      template:
        '<table aria-hidden="true" class="md-calendar-day-header"><thead></thead></table>' +
        '<div class="md-calendar-scroll-mask">' +
        '<md-virtual-repeat-container class="md-calendar-scroll-container" ' +
              'md-offset-size="' + (TBODY_SINGLE_ROW_HEIGHT - TBODY_HEIGHT) + '">' +
            '<table role="grid" tabindex="0" class="md-calendar" aria-readonly="true">' +
              '<tbody ' +
                  'md-calendar-month-body ' +
                  'role="rowgroup" ' +
                  'md-virtual-repeat="i in monthCtrl.items" ' +
                  'md-month-offset="$index" ' +
                  'class="md-calendar-month" ' +
                  'md-start-index="monthCtrl.getSelectedMonthIndex()" ' +
                  'md-item-size="' + TBODY_HEIGHT + '">' +

                // The <tr> ensures that the <tbody> will always have the
                // proper height, even if it's empty. If it's content is
                // compiled, the <tr> will be overwritten.
                '<tr aria-hidden="true" style="height:' + TBODY_HEIGHT + 'px;"></tr>' +
              '</tbody>' +
            '</table>' +
          '</md-virtual-repeat-container>' +
        '</div>',
      require: ['^^mdCalendar', 'mdCalendarMonth'],
      controller: CalendarMonthCtrl,
      controllerAs: 'monthCtrl',
      bindToController: true,
      link: function(scope, element, attrs, controllers) {
        var calendarCtrl = controllers[0];
        var monthCtrl = controllers[1];
        monthCtrl.initialize(calendarCtrl);
      }
    };
  }

  /**
   * Controller for the calendar month component.
   * @ngInject @constructor
   */
  function CalendarMonthCtrl($element, $scope, $animate, $q,
    $$mdDateUtil, $mdDateLocale) {

    /** @final {!angular.JQLite} */
    this.$element = $element;

    /** @final {!angular.Scope} */
    this.$scope = $scope;

    /** @final {!angular.$animate} */
    this.$animate = $animate;

    /** @final {!angular.$q} */
    this.$q = $q;

    /** @final */
    this.dateUtil = $$mdDateUtil;

    /** @final */
    this.dateLocale = $mdDateLocale;

    /** @final {HTMLElement} */
    this.calendarScroller = $element[0].querySelector('.md-virtual-repeat-scroller');

    /** @type {boolean} */
    this.isInitialized = false;

    /** @type {boolean} */
    this.isMonthTransitionInProgress = false;

    var self = this;

    /**
     * Handles a click event on a date cell.
     * Created here so that every cell can use the same function instance.
     * @this {HTMLTableCellElement} The cell that was clicked.
     */
    this.cellClickHandler = function() {
      var timestamp = $$mdDateUtil.getTimestampFromNode(this);
      self.$scope.$apply(function() {
        self.calendarCtrl.setNgModelValue(timestamp);
      });
    };

    /**
     * Handles click events on the month headers. Switches
     * the calendar to the year view.
     * @this {HTMLTableCellElement} The cell that was clicked.
     */
    this.headerClickHandler = function() {
      self.calendarCtrl.setCurrentView('year', $$mdDateUtil.getTimestampFromNode(this));
    };
  }

  /*** Initialization ***/

  /**
   * Initialize the controller by saving a reference to the calendar and
   * setting up the object that will be iterated by the virtual repeater.
   */
  CalendarMonthCtrl.prototype.initialize = function(calendarCtrl) {
    /**
     * Dummy array-like object for virtual-repeat to iterate over. The length is the total
     * number of months that can be viewed. We add 2 months: one to include the current month
     * and one for the last dummy month.
     *
     * This is shorter than ideal because of a (potential) Firefox bug
     * https://bugzilla.mozilla.org/show_bug.cgi?id=1181658.
     */

    this.items = {
      length: this.dateUtil.getMonthDistance(
        calendarCtrl.firstRenderableDate,
        calendarCtrl.lastRenderableDate
      ) + 2
    };

    this.calendarCtrl = calendarCtrl;
    this.attachScopeListeners();
    calendarCtrl.updateVirtualRepeat();

    // Fire the initial render, since we might have missed it the first time it fired.
    calendarCtrl.ngModelCtrl && calendarCtrl.ngModelCtrl.$render();
  };

  /**
   * Gets the "index" of the currently selected date as it would be in the virtual-repeat.
   * @returns {number}
   */
  CalendarMonthCtrl.prototype.getSelectedMonthIndex = function() {
    var calendarCtrl = this.calendarCtrl;

    return this.dateUtil.getMonthDistance(
      calendarCtrl.firstRenderableDate,
      calendarCtrl.displayDate || calendarCtrl.selectedDate || calendarCtrl.today
    );
  };

  /**
   * Change the selected date in the calendar (ngModel value has already been changed).
   * @param {Date} date
   */
  CalendarMonthCtrl.prototype.changeSelectedDate = function(date) {
    var self = this;
    var calendarCtrl = self.calendarCtrl;
    var previousSelectedDate = calendarCtrl.selectedDate;
    calendarCtrl.selectedDate = date;

    this.changeDisplayDate(date).then(function() {
      var selectedDateClass = calendarCtrl.SELECTED_DATE_CLASS;
      var namespace = 'month';

      // Remove the selected class from the previously selected date, if any.
      if (previousSelectedDate) {
        var prevDateCell = document.getElementById(calendarCtrl.getDateId(previousSelectedDate, namespace));
        if (prevDateCell) {
          prevDateCell.classList.remove(selectedDateClass);
          prevDateCell.setAttribute('aria-selected', 'false');
        }
      }

      // Apply the select class to the new selected date if it is set.
      if (date) {
        var dateCell = document.getElementById(calendarCtrl.getDateId(date, namespace));
        if (dateCell) {
          dateCell.classList.add(selectedDateClass);
          dateCell.setAttribute('aria-selected', 'true');
        }
      }
    });
  };

  /**
   * Change the date that is being shown in the calendar. If the given date is in a different
   * month, the displayed month will be transitioned.
   * @param {Date} date
   */
  CalendarMonthCtrl.prototype.changeDisplayDate = function(date) {
    // Initialization is deferred until this function is called because we want to reflect
    // the starting value of ngModel.
    if (!this.isInitialized) {
      this.buildWeekHeader();
      this.calendarCtrl.hideVerticalScrollbar(this);
      this.isInitialized = true;
      return this.$q.when();
    }

    // If trying to show an invalid date or a transition is in progress, do nothing.
    if (!this.dateUtil.isValidDate(date) || this.isMonthTransitionInProgress) {
      return this.$q.when();
    }

    this.isMonthTransitionInProgress = true;
    var animationPromise = this.animateDateChange(date);

    this.calendarCtrl.displayDate = date;

    var self = this;
    animationPromise.then(function() {
      self.isMonthTransitionInProgress = false;
    });

    return animationPromise;
  };

  /**
   * Animates the transition from the calendar's current month to the given month.
   * @param {Date} date
   * @returns {angular.$q.Promise} The animation promise.
   */
  CalendarMonthCtrl.prototype.animateDateChange = function(date) {
    if (this.dateUtil.isValidDate(date)) {
      var monthDistance = this.dateUtil.getMonthDistance(this.calendarCtrl.firstRenderableDate, date);
      this.calendarScroller.scrollTop = monthDistance * TBODY_HEIGHT;
    }

    return this.$q.when();
  };

  /**
   * Builds and appends a day-of-the-week header to the calendar.
   * This should only need to be called once during initialization.
   */
  CalendarMonthCtrl.prototype.buildWeekHeader = function() {
    var firstDayOfWeek = this.dateLocale.firstDayOfWeek;
    var shortDays = this.dateLocale.shortDays;

    var row = document.createElement('tr');
    for (var i = 0; i < 7; i++) {
      var th = document.createElement('th');
      th.textContent = shortDays[(i + firstDayOfWeek) % 7];
      row.appendChild(th);
    }

    this.$element.find('thead').append(row);
  };

  /**
   * Attaches listeners for the scope events that are broadcast by the calendar.
   */
  CalendarMonthCtrl.prototype.attachScopeListeners = function() {
    var self = this;

    self.$scope.$on('md-calendar-parent-changed', function(event, value) {
      self.changeSelectedDate(value);
    });

    self.$scope.$on('md-calendar-parent-action', angular.bind(this, this.handleKeyEvent));
  };

  /**
   * Handles the month-specific keyboard interactions.
   * @param {Object} event Scope event object passed by the calendar.
   * @param {String} action Action, corresponding to the key that was pressed.
   */
  CalendarMonthCtrl.prototype.handleKeyEvent = function(event, action) {
    var calendarCtrl = this.calendarCtrl;
    var displayDate = calendarCtrl.displayDate;

    if (action === 'select') {
      calendarCtrl.setNgModelValue(displayDate);
    } else {
      var date = null;
      var dateUtil = this.dateUtil;

      switch (action) {
        case 'move-right': date = dateUtil.incrementDays(displayDate, 1); break;
        case 'move-left': date = dateUtil.incrementDays(displayDate, -1); break;

        case 'move-page-down': date = dateUtil.incrementMonths(displayDate, 1); break;
        case 'move-page-up': date = dateUtil.incrementMonths(displayDate, -1); break;

        case 'move-row-down': date = dateUtil.incrementDays(displayDate, 7); break;
        case 'move-row-up': date = dateUtil.incrementDays(displayDate, -7); break;

        case 'start': date = dateUtil.getFirstDateOfMonth(displayDate); break;
        case 'end': date = dateUtil.getLastDateOfMonth(displayDate); break;
      }

      if (date) {
        date = this.dateUtil.clampDate(date, calendarCtrl.minDate, calendarCtrl.maxDate);

        this.changeDisplayDate(date).then(function() {
          calendarCtrl.focus(date);
        });
      }
    }
  };
})();
