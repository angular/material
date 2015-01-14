(function() {
  'use strict';

  /**
   * @ngdoc module
   * @name material.components.calendar
   * @description Calendar
   */
  angular.module('material.components.calendar', ['material.core'])
      .directive('mdCalendar', calendarDirective);

  // TODO(jelbourn): i18n [month names, day names, days of month, date formatting]
  // TODO(jelbourn): Date cell IDs need to be unique per-calendar.

  // TODO(jelbourn): a11y (announcements and labels)

  // TODO(jelbourn): Update the selected date on [click, tap, enter]

  // TODO(jelbourn): Shown month transition on [swipe, scroll, keyboard, ngModel change]
  // TODO(jelbourn): Introduce free scrolling that works w/ mobile momemtum scrolling (+snapping)

  // TODO(jelbourn): Responsive
  // TODO(jelbourn): Themes
  // TODO(jelbourn); inkRipple (need UX input)

  // TODO(jelbourn): Minimum and maximum date
  // TODO(jelbourn): Make sure the *time* on the written date makes sense (probably midnight).
  // TODO(jelbourn): Refactor "sections" into separate files.
  // TODO(jelbourn): Highlight today.
  // TODO(jelbourn): Horizontal line between months (pending spec finalization)
  // TODO(jelbourn): Alt+down in date input to open calendar
  // TODO(jelbourn): Animations should use `.finally()` instead of `.then()`

  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  var fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
      'September', 'October', 'November', 'December'];
  var fullDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function calendarDirective() {
    return {
      template:
        '<div>' +
          '<table class="md-calendar-day-header"><thead><tr>' +
            '<th>S</th><th>M</th><th>T</th><th>W</th><th>T</th><th>F</th><th>S</th>' +
          '</tr></thead></table>' +
          '<div class="md-calendar-container">' +
            '<table class="md-calendar"></table>' +
          '</div>' +
          '<div aria-live="polite"></div>' +
        '</div>',
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

  /**
   * Catigorization of type of date changes that can occur.
   * @enum {number}
   */
  var DateChangeType = {
    SAME_MONTH: 0,
    NEXT_MONTH: 1,
    PREVIOUS_MONTH: 2,
    DISTANT_FUTURE: 3,
    DISTANT_PAST: 4
  };

  // TODO(jelbourn): Refactor this to core and share with other components.
  /** @enum {number} */
  var Keys = {
    ENTER: 13,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    END: 35,
    HOME: 36,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40
  };

  /** Class applied to the selected date cell/. */
  var SELECTED_DATE_CLASS = 'md-calendar-selected-date';

  /** Class applied to the cell for today. */
  var TODAY_CLASS = 'md-calendar-date-today';


  /**
   * Gets a unique identifier for a date for internal purposes. Not to be displayed.
   * @param {Date} date
   * @returns {string}
   */
  function getDateId(date) {
    return 'md-' + date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();
  }

  /**
   * Controller for the mdCalendar component.
   * @ngInject @constructor
   */
  function CalendarCtrl($element, $scope, $animate, $q, $$mdDateUtil, $$mdDateLocale, $mdInkRipple, $mdUtil) {
    /** @final {!angular.$animate} */
    this.$animate = $animate;

    /** @final {!angular.$q} */
    this.$q = $q;

    /** @final */
    this.$mdInkRipple = $mdInkRipple;

    /** @final */
    this.$mdUtil = $mdUtil;

    /** @final */
    this.dateUtil = $$mdDateUtil;

    /** @final {!angular.JQLite} */
    this.$element = $element;

    /** @final {!angular.Scope} */
    this.$scope = $scope;

    /** @final {HTMLElement} */
    this.calendarElement = $element[0].querySelector('.md-calendar');

    /** @final {HTMLElement} */
    this.ariaLiveElement = $element[0].querySelector('[aria-live]');

    /** @final {Date} */
    this.today = new Date();

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
      if (this.dataset.timestamp) {
        $scope.$apply(function() {
          self.ngModelCtrl.$setViewValue(new Date(Number(this.dataset.timestamp)));
          self.ngModelCtrl.$render();
        }.bind(this));
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
    this.displayDate = this.selectedDate || new Date();
    var nextMonth = this.dateUtil.getDateInNextMonth(this.displayDate);
    this.calendarElement.appendChild(this.buildCalendarForMonth(this.displayDate));
    this.calendarElement.appendChild(this.buildCalendarForMonth(nextMonth));

    this.isInitialized = true;
  };

  /**
   * Attach event listeners for the calendar.
   */
  CalendarCtrl.prototype.attachCalendarEventListeners = function() {
    var self = this;

    // Keyboard interaction.
    this.calendarElement.addEventListener('keydown', this.handleKeyEvent.bind(this));

    // EXPERIMENT: does this weel event work on all browsers?
    this.calendarElement.addEventListener('wheel', function(event) {
      event.preventDefault();
      self.$scope.$apply(self.$mdUtil.debounce(function() {
        var transitionToDate = event.deltaY > 0 ?
            self.dateUtil.getDateInNextMonth(self.displayDate) :
            self.dateUtil.getDateInPreviousMonth(self.displayDate);
        self.changeDisplayDate(transitionToDate);
      }, 100));
    });
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
      // Handled key events fall into two categories: selection and navigation.
      // Start by checking if this is a selection event.
      if (event.which === Keys.ENTER) {
        self.ngModelCtrl.$setViewValue(self.displayDate);
        self.ngModelCtrl.$render();
        event.preventDefault();
        return;
      }

      // Selection isn't occuring, so the key event is either navigation or nothing.
      var date = self.getFocusDateFromKeyEvent(event);

      // Prevent the default on the key event only if it triggered a date navigation.
      if (!self.dateUtil.isSameDay(date, self.displayDate)) {
        event.preventDefault();
      }

      // Since this is a keyboard interaction, actually give the newly focused date keyboard
      // focus after the been brought into view.
      self.changeDisplayDate(date).then(function() {
        self.focusDateElement(date);
      });
    })
  };

  /**
   * Gets the date to focus as the result of a key event.
   * @param {KeyboardEvent} event
   * @returns {Date}
   */
  CalendarCtrl.prototype.getFocusDateFromKeyEvent = function(event) {
    var dateUtil = this.dateUtil;

    switch (event.which) {
      case Keys.RIGHT: return dateUtil.incrementDays(this.displayDate, 1);
      case Keys.LEFT: return dateUtil.incrementDays(this.displayDate, -1);
      case Keys.DOWN: return dateUtil.incrementDays(this.displayDate, 7);
      case Keys.UP: return dateUtil.incrementDays(this.displayDate, -7);
      case Keys.PAGE_DOWN: return dateUtil.incrementMonths(this.displayDate, 1);
      case Keys.PAGE_UP: return dateUtil.incrementMonths(this.displayDate, -1);
      case Keys.HOME: return dateUtil.getFirstDateOfMonth(this.displayDate);
      case Keys.END: return dateUtil.getLastDateOfMonth(this.displayDate);
      default: return this.displayDate;
    }
  };

  /**
   * Focus the cell corresponding to the given date.
   * @param {Date} date
   */
  CalendarCtrl.prototype.focusDateElement = function(date) {
    var cellId = getDateId(date);
    var cell = this.calendarElement.querySelector('#' + cellId);
    cell.focus();
  };
  

  /*** Animation ***/

  /**
   * Animates the calendar to the next month.
   * @param date
   * @returns {angular.$q.Promise} The animation promise.
   */
  CalendarCtrl.prototype.animateToNextMonth = function(date) {
    var currentMonth = this.calendarElement.querySelector('tbody');
    var amountToMove = -(currentMonth.clientHeight) + 'px'; // todo: Why is this 2px off (Chrome)?

    var newMonthToShow = this.buildCalendarForMonth(this.dateUtil.getDateInNextMonth(date));
    this.calendarElement.appendChild(newMonthToShow);

    var animatePromise = this.$animate.animate(angular.element(this.calendarElement),
        {transform: 'translateY(0)'},
        {transform: 'translateY(' + amountToMove + ')'});

    var self = this;
    return animatePromise.then(function() {
      self.calendarElement.removeChild(currentMonth);
      self.calendarElement.style.transform = '';
    });
  };


  /**
   * Animates the calendar to the previous month.
   * @param date
   * @returns {angular.$q.Promise} The animation promise.
   */
  CalendarCtrl.prototype.animateToPreviousMonth = function(date) {
    var displayedMonths = this.calendarElement.querySelectorAll('tbody');
    var currentMonth = displayedMonths[0];
    var nextMonth = displayedMonths[1];

    var newMonthToShow = this.buildCalendarForMonth(date);
    this.calendarElement.insertBefore(newMonthToShow, currentMonth);
    var amountToMove = newMonthToShow.clientHeight + 'px';

    var animatePromise = this.$animate.animate(angular.element(this.calendarElement),
          {transform: 'translateY(-' + amountToMove + ')'},
          {transform: 'translateY(0)'});

    var self = this;
    return animatePromise.then(function() {
      self.calendarElement.removeChild(nextMonth);
      self.calendarElement.style.transform = '';
    });
  };


  /**
   * Animates the calendar to a date further than one month in the future.
   * @param date
   * @returns {angular.$q.Promise} The animation promise.
   */
  CalendarCtrl.prototype.animateToDistantFuture = function(date) {
    var displayedMonths = this.calendarElement.querySelectorAll('tbody');
    var currentMonth = displayedMonths[0];
    var nextMonth = displayedMonths[1];

    var midpointDate = this.dateUtil.getDateMidpoint(this.displayDate, date);
    var midpointMonth = this.buildCalendarForMonth(midpointDate);
    this.calendarElement.appendChild(midpointMonth);

    var amountToMove = -(currentMonth.clientHeight +
        nextMonth.clientHeight + midpointMonth.clientHeight) + 'px';

    var targetMonth = this.buildCalendarForMonth(date);
    this.calendarElement.appendChild(targetMonth);

    var monthAfterTargetMonth = this.buildCalendarForMonth(this.dateUtil.getDateInNextMonth(date));
    this.calendarElement.appendChild(monthAfterTargetMonth);

    var animatePromise = this.$animate.animate(angular.element(this.calendarElement),
        {transform: 'translateY(0)'},
        {transform: 'translateY(' + amountToMove + ')'});

    var self = this;
    return animatePromise.then(function() {
      self.calendarElement.removeChild(currentMonth);
      self.calendarElement.removeChild(nextMonth);
      self.calendarElement.removeChild(midpointMonth);
      self.calendarElement.style.transform = '';
    });
  };


  /**
   * Animates the calendar to a date further than one month in the past.
   * @param date
   * @returns {angular.$q.Promise} The animation promise.
   */
  CalendarCtrl.prototype.animateToDistantPast = function(date) {
    var displayedMonths = this.calendarElement.querySelectorAll('tbody');
    var currentMonth = displayedMonths[0];
    var nextMonth = displayedMonths[1];

    var midpointDate = this.dateUtil.getDateMidpoint(this.displayDate, date);
    var midpointMonth = this.buildCalendarForMonth(midpointDate);
    this.calendarElement.insertBefore(midpointMonth, currentMonth);

    var monthAfterTargetMonth = this.buildCalendarForMonth(this.dateUtil.getDateInNextMonth(date));
    this.calendarElement.insertBefore(monthAfterTargetMonth, midpointMonth);

    var targetMonth = this.buildCalendarForMonth(date);
    this.calendarElement.insertBefore(targetMonth, monthAfterTargetMonth);

    var amountToMove = -(targetMonth.clientHeight + midpointMonth.clientHeight +
        monthAfterTargetMonth.clientHeight) + 'px';

    var animatePromise = this.$animate.animate(angular.element(this.calendarElement),
          {transform: 'translateY(' + amountToMove + ')'},
          {transform: 'translateY(0)'});

    var self = this;
    return animatePromise.then(function() {
      self.calendarElement.removeChild(nextMonth);
      self.calendarElement.removeChild(currentMonth);
      self.calendarElement.removeChild(midpointMonth);
      self.calendarElement.style.transform = '';
    });
  };


  /**
   * Animates the transition from the calendar's current month to the given month.
   * @param date
   * @returns {angular.$q.Promise} The animation promise.
   */
  CalendarCtrl.prototype.animateDateChange = function(date) {
    var dateChangeType = this.getDateChangeType(date);
    switch (dateChangeType) {
      case DateChangeType.NEXT_MONTH: return this.animateToNextMonth(date);
      case DateChangeType.PREVIOUS_MONTH: return this.animateToPreviousMonth(date);
      case DateChangeType.DISTANT_FUTURE: return this.animateToDistantFuture(date);
      case DateChangeType.DISTANT_PAST: return this.animateToDistantPast(date);
      default: return this.$q.when();
    }
  };

  /**
   * Given a date, determines the type of transition that will occur from the currently shown date.
   * @param {Date} date
   * @returns {DateChangeType}
   */
  CalendarCtrl.prototype.getDateChangeType = function(date) {
    if (date && this.displayDate && !this.dateUtil.isSameMonthAndYear(date, this.displayDate)) {
      if (this.dateUtil.isInNextMonth(this.displayDate, date)) {
        return DateChangeType.NEXT_MONTH;
      }

      if (this.dateUtil.isInPreviousMonth(this.displayDate, date)) {
        return DateChangeType.PREVIOUS_MONTH;
      }

      if (date > this.displayDate) {
        return DateChangeType.DISTANT_FUTURE;
      }

      return DateChangeType.DISTANT_PAST;
    }

    return DateChangeType.SAME_MONTH;
  };


  /*** Updating the displayed / selected date ***/

  /**
   * Change the selected date in the calendar (ngModel value has already been changed).
   * @param {Date} date
   */
  CalendarCtrl.prototype.changeSelectedDate = function(date) {
    var self = this;
    this.changeDisplayDate(date).then(function() {

      // Remove the selected class from the previously selected date, if any.
      if (self.selectedDate) {
        var prevDateCell = self.calendarElement.querySelector('#' + getDateId(self.selectedDate));
        if (prevDateCell) {
          prevDateCell.classList.remove(SELECTED_DATE_CLASS);
        }
      }

      // Apply the select class to the new selected date if it is set.
      if (date) {
        var dateCell = self.calendarElement.querySelector('#' + getDateId(date));
        if (dateCell) {
          dateCell.classList.add(SELECTED_DATE_CLASS);
        }
      }

      self.selectedDate = date;
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

    // If trying to show a null or undefined date, do nothing.
    if (!date) {
      return this.$q.when();
    }


    // WORK IN PROGRESS: do nothing if animation is in progress.
    if (this.isMonthTransitionInProgress) {
      //return this.$q.when();
    }

    this.isMonthTransitionInProgress = true;
    var animationPromise = this.animateDateChange(date);

    this.announceDisplayDateChange(this.displayDate, date);
    this.displayDate = date;

    var self = this;
    animationPromise.then(function() {
      self.highlightToday();
      self.isMonthTransitionInProgress = false;
    });

    return animationPromise;
  };


  /**
   * Highlight the cell corresponding to today if it is on the screen.
   */
  CalendarCtrl.prototype.highlightToday = function() {
    var todayCell = this.calendarElement.querySelector('#' + getDateId(this.today));
    if (todayCell) {
      todayCell.classList.add(TODAY_CLASS);
    }
  };


  /**
   * Announces a change in date to the calendar's aria-live region.
   * @param {Date} previousDate
   * @param {Date} currentDate
   */
  CalendarCtrl.prototype.announceDisplayDateChange = function(previousDate, currentDate) {
    // PROOF OF CONCEPT: this obviously needs to be internationalized, but we can see if the idea
    // works.

    // If the date has not changed at all, do nothing.
    if (previousDate && this.dateUtil.isSameDay(previousDate, currentDate)) {
      return;
    }

    var annoucement = '';

    if (!previousDate || !this.dateUtil.isSameMonthAndYear(previousDate, currentDate)) {
      annoucement += currentDate.getFullYear() + '. ' + fullMonths[currentDate.getMonth()] + '. ';
    }

    if (previousDate.getDate() !== currentDate.getDate()) {
      annoucement += fullDays[currentDate.getDay()] + '. ' + currentDate.getDate() ;
    }

    this.ariaLiveElement.textContent = annoucement;
  };


  /*** Constructing the calendar table ***/

  /**
   * Creates a single cell to contain a date in the calendar with all appropriate
   * attributes and classes added. If a date is given, the cell content will be set
   * based on the date.
   * @param {Date=} opt_date
   * @returns {HTMLElement}
   */
  CalendarCtrl.prototype.buildDateCell = function(opt_date) {
    var cell = document.createElement('td');
    cell.classList.add('md-calendar-date');

    if (opt_date) {
      // Add a indicator for select, hover, and focus states.
      var selectionIndicator = document.createElement('span');
      cell.appendChild(selectionIndicator);
      selectionIndicator.classList.add('md-calendar-date-selection-indicator');
      selectionIndicator.textContent = opt_date.getDate();
      //selectionIndicator.setAttribute('aria-label', '');

      cell.setAttribute('tabindex', '-1');
      cell.id = getDateId(opt_date);
      cell.dataset.timestamp = opt_date.getTime();
      cell.addEventListener('click', this.cellClickHandler);
    }

    return cell;
  };


  /**
   * Builds a <tbody> element for the given date's month.
   * @param {Date=} opt_dateInMonth
   * @returns {HTMLTableSectionElement} A <tbody> containing the <tr> elements.
   */
  CalendarCtrl.prototype.buildCalendarForMonth = function(opt_dateInMonth) {
    var date = opt_dateInMonth || new Date();

    var firstDayOfMonth = this.dateUtil.getFirstDateOfMonth(date);
    var firstDayOfTheWeek = firstDayOfMonth.getDay();
    var numberOfDaysInMonth = this.dateUtil.getNumberOfDaysInMonth(date);

    // Store rows for the month in a document fragment so that we can append them all at once.
    var monthBody = document.createElement('tbody');
    monthBody.classList.add('md-calendar-month');
    monthBody.setAttribute('aria-hidden', 'true')

    var row = document.createElement('tr');
    monthBody.appendChild(row);

    // Add a label for the month. If the month starts on a Sunday or a Monday, the month label
    // goes on a row above the first of the month. Otherwise, the month label takes up the first
    // two cells of the first row.
    var blankCellOffset = 0;
    var monthLabelCell = document.createElement('td');
    monthLabelCell.classList.add('md-calendar-month-label');
    if (firstDayOfTheWeek <= 1) {
      monthLabelCell.setAttribute('colspan', '7');
      monthLabelCell.textContent = months[date.getMonth()];

      var monthLabelRow = document.createElement('tr');
      monthLabelRow.appendChild(monthLabelCell);
      monthBody.insertBefore(monthLabelRow, row);
    } else {
      blankCellOffset = 2;
      monthLabelCell.setAttribute('colspan', '2');
      monthLabelCell.textContent = months[date.getMonth()];

      row.appendChild(monthLabelCell);
    }

    // Add a blank cell for each day of the week that occurs before the first of the month.
    // For example, if the first day of the month is a Tuesday, add blank cells for Sun and Mon.
    // The blankCellOffset is needed in cases where the first N cells are used by the month label.
    for (var i = blankCellOffset; i < firstDayOfTheWeek; i++) {
      row.appendChild(this.buildDateCell());
    }

    // Add a cell for each day of the month, keeping track of the day of the week so that
    // we know when to start a new row.
    var dayOfWeek = firstDayOfTheWeek;
    var iterationDate = firstDayOfMonth;
    for (var d = 1; d <= numberOfDaysInMonth; d++) {
      // If we've reached the end of the week, start a new row.
      if (dayOfWeek === 7) {
        dayOfWeek = 0;
        row = document.createElement('tr');
        monthBody.appendChild(row);
      }

      iterationDate.setDate(d);
      var cell = this.buildDateCell(iterationDate);
      row.appendChild(cell);

      dayOfWeek++;
    }

    return monthBody;
  };
})();
