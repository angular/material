(function() {
  'use strict';

  angular.module('material.components.datepicker')
    .directive('mdCalendarYear', calendarDirective);

  /**
   * Height of one calendar year tbody. This must be made known to the virtual-repeat and is
   * subsequently used for scrolling to specific years.
   */
  var TBODY_HEIGHT = 88;

  /** Private component, representing a list of years in the calendar. */
  function calendarDirective() {
    return {
      template:
        '<div class="md-calendar-scroll-mask">' +
          '<md-virtual-repeat-container class="md-calendar-scroll-container">' +
            '<table role="grid" tabindex="0" class="md-calendar" aria-readonly="true">' +
              '<tbody ' +
                  'md-calendar-year-body ' +
                  'role="rowgroup" ' +
                  'md-virtual-repeat="i in yearCtrl.items" ' +
                  'md-year-offset="$index" class="md-calendar-year" ' +
                  'md-start-index="yearCtrl.getFocusedYearIndex()" ' +
                  'md-item-size="' + TBODY_HEIGHT + '">' +
                // The <tr> ensures that the <tbody> will have the proper
                // height, even though it may be empty.
                '<tr aria-hidden="true" style="height:' + TBODY_HEIGHT + 'px;"></tr>' +
              '</tbody>' +
            '</table>' +
          '</md-virtual-repeat-container>' +
        '</div>',
      require: ['^^mdCalendar', 'mdCalendarYear'],
      controller: CalendarYearCtrl,
      controllerAs: 'yearCtrl',
      bindToController: true,
      link: function(scope, element, attrs, controllers) {
        var calendarCtrl = controllers[0];
        var yearCtrl = controllers[1];
        yearCtrl.initialize(calendarCtrl);
      }
    };
  }

  /**
   * Controller for the mdCalendar component.
   * @ngInject @constructor
   */
  function CalendarYearCtrl($element, $scope, $animate, $q, $$mdDateUtil) {

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
      self.calendarCtrl.setCurrentView('month', $$mdDateUtil.getTimestampFromNode(this));
    };
  }

  /**
   * Initialize the controller by saving a reference to the calendar and
   * setting up the object that will be iterated by the virtual repeater.
   */
  CalendarYearCtrl.prototype.initialize = function(calendarCtrl) {
    /**
     * Dummy array-like object for virtual-repeat to iterate over. The length is the total
     * number of years that can be viewed. We add 1 extra in order to include the current year.
     */
    this.items = {
      length: this.dateUtil.getYearDistance(
        calendarCtrl.firstRenderableDate,
        calendarCtrl.lastRenderableDate
      ) + 1
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
  CalendarYearCtrl.prototype.getFocusedYearIndex = function() {
    var calendarCtrl = this.calendarCtrl;

    return this.dateUtil.getYearDistance(
      calendarCtrl.firstRenderableDate,
      calendarCtrl.displayDate || calendarCtrl.selectedDate || calendarCtrl.today
    );
  };

  /**
   * Change the date that is highlighted in the calendar.
   * @param {Date} date
   */
  CalendarYearCtrl.prototype.changeDate = function(date) {
    // Initialization is deferred until this function is called because we want to reflect
    // the starting value of ngModel.
    if (!this.isInitialized) {
      this.calendarCtrl.hideVerticalScrollbar(this);
      this.isInitialized = true;
      return this.$q.when();
    } else if (this.dateUtil.isValidDate(date) && !this.isMonthTransitionInProgress) {
      var self = this;
      var animationPromise = this.animateDateChange(date);

      self.isMonthTransitionInProgress = true;
      self.calendarCtrl.displayDate = date;

      return animationPromise.then(function() {
        self.isMonthTransitionInProgress = false;
      });
    }
  };

  /**
   * Animates the transition from the calendar's current month to the given month.
   * @param {Date} date
   * @returns {angular.$q.Promise} The animation promise.
   */
  CalendarYearCtrl.prototype.animateDateChange = function(date) {
    if (this.dateUtil.isValidDate(date)) {
      var monthDistance = this.dateUtil.getYearDistance(this.calendarCtrl.firstRenderableDate, date);
      this.calendarScroller.scrollTop = monthDistance * TBODY_HEIGHT;
    }

    return this.$q.when();
  };

  /**
   * Handles the year-view-specific keyboard interactions.
   * @param {Object} event Scope event object passed by the calendar.
   * @param {String} action Action, corresponding to the key that was pressed.
   */
  CalendarYearCtrl.prototype.handleKeyEvent = function(event, action) {
    var calendarCtrl = this.calendarCtrl;
    var displayDate = calendarCtrl.displayDate;

    if (action === 'select') {
      this.changeDate(displayDate).then(function() {
        calendarCtrl.setCurrentView('month', displayDate);
        calendarCtrl.focus(displayDate);
      });
    } else {
      var date = null;
      var dateUtil = this.dateUtil;

      switch (action) {
        case 'move-right': date = dateUtil.incrementMonths(displayDate, 1); break;
        case 'move-left': date = dateUtil.incrementMonths(displayDate, -1); break;

        case 'move-row-down': date = dateUtil.incrementMonths(displayDate, 6); break;
        case 'move-row-up': date = dateUtil.incrementMonths(displayDate, -6); break;
      }

      if (date) {
        var min = calendarCtrl.minDate ? dateUtil.getFirstDateOfMonth(calendarCtrl.minDate) : null;
        var max = calendarCtrl.maxDate ? dateUtil.getFirstDateOfMonth(calendarCtrl.maxDate) : null;
        date = dateUtil.getFirstDateOfMonth(this.dateUtil.clampDate(date, min, max));

        this.changeDate(date).then(function() {
          calendarCtrl.focus(date);
        });
      }
    }
  };

  /**
   * Attaches listeners for the scope events that are broadcast by the calendar.
   */
  CalendarYearCtrl.prototype.attachScopeListeners = function() {
    var self = this;

    self.$scope.$on('md-calendar-parent-changed', function(event, value) {
      self.changeDate(value);
    });

    self.$scope.$on('md-calendar-parent-action', angular.bind(self, self.handleKeyEvent));
  };
})();
