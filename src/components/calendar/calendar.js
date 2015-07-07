(function() {
  'use strict';

  /**
   * @ngdoc module
   * @name material.components.calendar
   * @description Calendar
   */
  angular.module('material.components.calendar', [
    'material.core', 'material.components.virtualRepeat',
    'material.core', 'material.components.icon'
  ]).directive('mdCalendar', calendarDirective);


  // PRE RELEASE
  // TODO(jelbourn): Base colors on the theme
  // TODO(jelbourn): read-only state.
  // TODO(jelbourn): Date "isComplete" logic
  // TODO(jelbourn): Apple + up / down == PgDown and PgUp
  // TODO(jelbourn): Fix NVDA stealing key presses (IE) ???

  // POST RELEASE
  // TODO(jelbourn): Animated month transition on ng-model change (virtual-repeat)
  // TODO(jelbourn): Scroll snapping (virtual repeat)
  // TODO(jelbourn): Remove superfluous row from short months (virtual-repeat)
  // TODO(jelbourn): Month headers stick to top when scrolling.
  // TODO(jelbourn): Previous month opacity is lowered when partially scrolled out of view.
  // TODO(jelbourn): Support md-calendar standalone on a page (as a tabstop w/ aria-live
  //     announcement and key handling).

  // COULD GO EITHER WAY
  // TODO(jelbourn): Clicking on the month label opens the month-picker.
  // TODO(jelbourn): Minimum and maximum date
  // TODO(jelbourn): Define virtual scrolling constants (compactness).

  /**
   * Height of one calendar month tbody. This must be made known to the virtual-repeat and is
   * subsequently used for scrolling to specific months.
   */
  var TBODY_HEIGHT = 265;

  function calendarDirective() {
    return {
      template:
          '<table class="md-calendar-day-header"><thead></thead></table>' +
          '<div class="md-calendar-scroll-mask">' +
            '<md-virtual-repeat-container class="md-calendar-scroller">' +
              '<table role="grid" class="md-calendar">' +
                '<tbody role="rowgroup" md-virtual-repeat="i in ctrl.items" md-calendar-month ' +
                    'md-month-offset="$index" class="md-calendar-month" aria-hidden="true" ' +
                    'md-start-index="ctrl.getSelectedMonthIndex()" ' +
                    'md-item-size="' + TBODY_HEIGHT + '"></tbody>' +
              '</table>' +
            '</md-virtual-repeat-container>' +
          '</div>' +
          '<div aria-live="assertive" aria-atomic="true" class="md-visually-hidden"></div>',
      scope: {},
      restrict: 'E',
      require: ['ngModel', 'mdCalendar'],
      controller: CalendarCtrl,
      controllerAs: 'ctrl',
      bindToController: true,
      link: function(scope, element, attrs, controllers) {
        var ngModelCtrl = controllers[0];
        var mdCalendarCtrl = controllers[1];
        mdCalendarCtrl.configureNgModel(ngModelCtrl);
      }
    };
  }

  /** Class applied to the selected date cell/. */
  var SELECTED_DATE_CLASS = 'md-calendar-selected-date';

  /** Next identifier for calendar instance. */
  var nextUniqueId = 0;

  /** The first renderable date in the virtual-scrolling calendar (for all instances). */
  var firstRenderableDate = null;

  /**
   * Controller for the mdCalendar component.
   * @ngInject @constructor
   */
  function CalendarCtrl($element, $attrs, $scope, $animate, $q, $mdConstant,
      $$mdDateUtil, $$mdDateLocale, $mdInkRipple, $mdUtil) {

    /** @type {Array<number>} Dummy array-like object for virtual-repeat to iterate over. */
    this.items = {length: 2000 * 12};

    /** @final {!angular.$animate} */
    this.$animate = $animate;

    /** @final {!angular.$q} */
    this.$q = $q;

    /** @final */
    this.$mdInkRipple = $mdInkRipple;

    /** @final */
    this.$mdUtil = $mdUtil;

    /** @final */
    this.keyCode = $mdConstant.KEY_CODE;

    /** @final */
    this.dateUtil = $$mdDateUtil;

    /** @final */
    this.dateLocale = $$mdDateLocale;

    /** @final {!angular.JQLite} */
    this.$element = $element;

    /** @final {!angular.Scope} */
    this.$scope = $scope;

    /** @final {HTMLElement} */
    this.calendarElement = $element[0].querySelector('.md-calendar');

    /** @final {HTMLElement} */
    this.ariaLiveElement = $element[0].querySelector('[aria-live]');

    /** @final {HTMLElement} */
    this.calendarScroller = $element[0].querySelector('.md-virtual-repeat-scroller');

    /** @final {Date} */
    this.today = this.dateUtil.createDateAtMidnight();

    // Set the first renderable date once for all calendar instances.
    firstRenderableDate =
        firstRenderableDate || this.dateUtil.incrementMonths(this.today, -this.items.length / 2);

    /** @final {number} Unique ID for this calendar instance. */
    this.id = nextUniqueId++;

    /** @type {!angular.NgModelController} */
    this.ngModelCtrl = null;

    /**
     * The selected date. Keep track of this separately from the ng-model value so that we
     * can know, when the ng-model value changes, what the previous value was before its updated
     * in the component's UI.
     *
     * @type {Date}
     */
    this.selectedDate = null;

    /**
     * The date that is currently focused or showing in the calendar. This will initially be set
     * to the ng-model value if set, otherwise to today. It will be updated as the user navigates
     * to other months. The cell corresponding to the displayDate does not necesarily always have
     * focus in the document (such as for cases when the user is scrolling the calendar).
     * @type {Date}
     */
    this.displayDate = null;

    /**
     * The date that has or should have browser focus.
     * @type {Date}
     */
    this.focusDate = null;

    /** @type {boolean} */
    this.isInitialized = false;

    /** @type {boolean} */
    this.isMonthTransitionInProgress = false;

    // Unless the user specifies so, the calendar should not be a tab stop.
    // This is necessary because ngAria might add a tabindex to anything with an ng-model
    // (based on whether or not the user has turned that particular feature on/off).
    if (!$attrs['tabindex']) {
      $element.attr('tabindex', '-1');
    }

    var self = this;

    /**
     * Handles a click event on a date cell.
     * Created here so that every cell can use the same function instance.
     * @this {HTMLTableCellElement} The cell that was clicked.
     */
    this.cellClickHandler = function() {
      if (this.hasAttribute('data-timestamp')) {
        $scope.$apply(function() {
          var timestamp = Number(this.getAttribute('data-timestamp'));
          self.setNgModelValue(self.dateUtil.createDateAtMidnight(timestamp));
        }.bind(this)); // The `this` here is the cell element.
      }
    };

    this.attachCalendarEventListeners();

    // DEBUG
    window.ctrl = this;
  }


  /*** Initialization ***/

  /**
   * Sets up the controller's reference to ngModelController.
   * @param {!angular.NgModelController} ngModelCtrl
   */
  CalendarCtrl.prototype.configureNgModel = function(ngModelCtrl) {
    this.ngModelCtrl = ngModelCtrl;

    var self = this;
    ngModelCtrl.$render = function() {
      self.changeSelectedDate(self.ngModelCtrl.$viewValue);
    };
  };

  /**
   * Initialize the calendar by building the months that are initially visible.
   * Initialization should occur after the ngModel value is known.
   */
  CalendarCtrl.prototype.buildInitialCalendarDisplay = function() {
    this.buildWeekHeader();
    this.hideVerticalScrollbar();

    this.displayDate = this.selectedDate || this.today;
    this.isInitialized = true;
  };

  /**
   * Gets the "index" of the currently selected date as it would be in the virtual-repeat.
   * @returns {number}
   */
  CalendarCtrl.prototype.getSelectedMonthIndex = function() {
    return this.dateUtil.getMonthDistance(firstRenderableDate, this.selectedDate || this.today);
  };

  /**
   * Hides the vertical scrollbar on the calendar scroller by setting the width on the
   * calendar scroller and the `overflow: hidden` wrapper around the scroller, and then setting
   * a padding-right on the scroller equal to the width of the browser's scrollbar.
   *
   * This will cause a reflow.
   */
  CalendarCtrl.prototype.hideVerticalScrollbar = function() {
    var element = this.$element[0];

    var scrollMask = element.querySelector('.md-calendar-scroll-mask');
    var scroller = this.calendarScroller;

    var headerWidth = element.querySelector('.md-calendar-day-header').clientWidth;
    var scrollbarWidth = scroller.offsetWidth - scroller.clientWidth;

    scrollMask.style.width = headerWidth + 'px';
    scroller.style.width = (headerWidth + scrollbarWidth) + 'px';
    scroller.style.paddingRight = scrollbarWidth + 'px';
  };

  /**
   * Scrolls to the month of the given date.
   * @param {Date} date
   */
  CalendarCtrl.prototype.scrollToMonth = function(date) {
    if (!this.dateUtil.isValidDate(date)) {
      return;
    }

    var monthDistance = this.dateUtil.getMonthDistance(firstRenderableDate, date);
    this.calendarScroller.scrollTop = monthDistance * TBODY_HEIGHT;
  };

  /**
   * Attach event listeners for the calendar.
   */
  CalendarCtrl.prototype.attachCalendarEventListeners = function() {
    // Keyboard interaction.
    this.$element.on('keydown', this.handleKeyEvent.bind(this));
  };
  
  /*** User input handling ***/

  /**
   * Handles a key event in the calendar with the appropriate action. The action will either
   * be to select the focused date or to navigate to focus a new date.
   * @param {KeyboardEvent} event
   */
  CalendarCtrl.prototype.handleKeyEvent = function(event) {
    var self = this;
    this.$scope.$apply(function() {
      // Capture escape and emit back up so that a wrapping component
      // (such as a date-picker) can decide to close.
      if (event.which == self.keyCode.ESCAPE) {
        self.$scope.$emit('md-calendar-escape');
        return;
      }

      // Remaining key events fall into two categories: selection and navigation.
      // Start by checking if this is a selection event.
      if (event.which === self.keyCode.ENTER) {
        self.setNgModelValue(self.displayDate);
        event.preventDefault();
        return;
      }

      // Selection isn't occuring, so the key event is either navigation or nothing.
      var date = self.getFocusDateFromKeyEvent(event);
      event.preventDefault();

      // Since this is a keyboard interaction, actually give the newly focused date keyboard
      // focus after the been brought into view.
      self.changeDisplayDate(date).then(function() {
        self.focus(date);
      });
    });
  };

  /**
   * Gets the date to focus as the result of a key event.
   * @param {KeyboardEvent} event
   * @returns {Date}
   */
  CalendarCtrl.prototype.getFocusDateFromKeyEvent = function(event) {
    var dateUtil = this.dateUtil;
    var keyCode = this.keyCode;

    switch (event.which) {
      case keyCode.RIGHT_ARROW: return dateUtil.incrementDays(this.displayDate, 1);
      case keyCode.LEFT_ARROW: return dateUtil.incrementDays(this.displayDate, -1);
      case keyCode.DOWN_ARROW: return dateUtil.incrementDays(this.displayDate, 7);
      case keyCode.UP_ARROW: return dateUtil.incrementDays(this.displayDate, -7);
      case keyCode.PAGE_DOWN: return dateUtil.incrementMonths(this.displayDate, 1);
      case keyCode.PAGE_UP: return dateUtil.incrementMonths(this.displayDate, -1);
      case keyCode.HOME: return dateUtil.getFirstDateOfMonth(this.displayDate);
      case keyCode.END: return dateUtil.getLastDateOfMonth(this.displayDate);
      default: return this.displayDate;
    }
  };

  /**
   * Sets the ng-model value for the calendar and emits a change event.
   * @param {Date} date
   */
  CalendarCtrl.prototype.setNgModelValue = function(date) {
    this.$scope.$emit('md-calendar-change', date);
    this.ngModelCtrl.$setViewValue(date);
    this.ngModelCtrl.$render();
  };

  /**
   * Focus the cell corresponding to the given date.
   * @param {Date=} opt_date
   */
  CalendarCtrl.prototype.focus = function(opt_date) {
    var date = opt_date || this.selectedDate;
    var cellId = this.getDateId(date);
    var cell = this.calendarElement.querySelector('#' + cellId);
    if (cell) {
      cell.focus();
    } else {
      this.focusDate = date;
    }
  };

  /*** Animation ***/

  /**
   * Animates the transition from the calendar's current month to the given month.
   * @param date
   * @returns {angular.$q.Promise} The animation promise.
   */
  CalendarCtrl.prototype.animateDateChange = function(date) {
    this.scrollToMonth(date);
    return this.$q.when();
  };


  /*** Updating the displayed / selected date ***/

  /**
   * Change the selected date in the calendar (ngModel value has already been changed).
   * @param {Date} date
   */
  CalendarCtrl.prototype.changeSelectedDate = function(date) {
    var self = this;
    var previousSelectedDate = this.selectedDate;
    this.selectedDate = date;
    this.changeDisplayDate(date).then(function() {

      // Remove the selected class from the previously selected date, if any.
      if (previousSelectedDate) {
        var prevDateCell =
            self.calendarElement.querySelector('#' + self.getDateId(previousSelectedDate));
        if (prevDateCell) {
          prevDateCell.classList.remove(SELECTED_DATE_CLASS);
        }
      }

      // Apply the select class to the new selected date if it is set.
      if (date) {
        var dateCell = self.calendarElement.querySelector('#' + self.getDateId(date));
        if (dateCell) {
          dateCell.classList.add(SELECTED_DATE_CLASS);
        }
      }
    });
  };


  /**
   * Change the date that is being shown in the calendar. If the given date is in a different
   * month, the displayed month will be transitioned.
   * @param {Date} date
   */
  CalendarCtrl.prototype.changeDisplayDate = function(date) {
    // Initialization is deferred until this function is called because we want to reflect
    // the starting value of ngModel.
    if (!this.isInitialized) {
      this.buildInitialCalendarDisplay();
      return this.$q.when();
    }

    // If trying to show an invalid date, do nothing.
    if (!this.dateUtil.isValidDate(date)) {
      return this.$q.when();
    }

    // WORK IN PROGRESS: do nothing if animation is in progress.
    if (this.isMonthTransitionInProgress) {
      return this.$q.when();
    }

    this.isMonthTransitionInProgress = true;
    var animationPromise = this.animateDateChange(date);

    this.announceDisplayDateChange(this.displayDate, date);
    this.displayDate = date;

    var self = this;
    animationPromise.then(function() {
      self.isMonthTransitionInProgress = false;
    });

    return animationPromise;
  };

  /**
   * Announces a change in date to the calendar's aria-live region.
   * @param {Date} previousDate
   * @param {Date} currentDate
   */
  CalendarCtrl.prototype.announceDisplayDateChange = function(previousDate, currentDate) {
    // If the date has not changed at all, do nothing.
    if (previousDate && this.dateUtil.isSameDay(previousDate, currentDate)) {
      return;
    }

    // If the date has changed to another date within the same month and year, make a short
    // announcement.
    if (previousDate && this.dateUtil.isSameMonthAndYear(previousDate, currentDate)) {
      this.ariaLiveElement.textContent = this.dateLocale.shortAnnounceFormatter(currentDate);
      return;
    }

    // If the date has changed to another date in a different month and/or year, make a long
    // announcement.
    if (!previousDate || previousDate.getDate() !== currentDate.getDate()) {
      this.ariaLiveElement.textContent = this.dateLocale.longAnnounceFormatter(currentDate);
    }
  };


  /*** Constructing the calendar table ***/

  /**
   * Builds and appends a day-of-the-week header to the calendar.
   * This should only need to be called once during initialization.
   */
  CalendarCtrl.prototype.buildWeekHeader = function() {
    var row = document.createElement('tr');
    for (var i = 0; i < 7; i++) {
      var th = document.createElement('th');
      th.textContent = this.dateLocale.shortDays[i];
      row.appendChild(th);
    }

    this.$element.find('thead').append(row);
  };

    /**
   * Gets an identifier for a date unique to the calendar instance for internal
   * purposes. Not to be displayed.
   * @param {Date} date
   * @returns {string}
   */
  CalendarCtrl.prototype.getDateId = function(date) {
    return [
      'md',
      this.id,
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ].join('-');
  };
})();
