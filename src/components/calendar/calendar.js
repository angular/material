console.log('calendar');
(function() {
  'use strict';

  /**
   * @ngdoc module
   * @name material.components.calendar
   * @description Calendar
   */
  angular.module('material.components.calendar')
      .directive('mdCalendar', calendarDirective);

  // TODO(jelbourn): internationalize a11y announcements.

  // TODO(jelbourn): Update the selected date on [click, tap, enter]
  // TODO(jelbourn): Shown month transition on [swipe, scroll, keyboard, ngModel change]
  // TODO(jelbourn): Introduce free scrolling that works w/ mobile momemtum scrolling (+snapping)

  // TODO(jelbourn): Responsive
  // TODO(jelbourn): Themes
  // TODO(jelbourn); inkRipple (need UX input)

  // TODO(jelbourn): Minimum and maximum date
  // TODO(jelbourn): Make sure the *time* on the written date makes sense (probably midnight).
  // TODO(jelbourn): Refactor "sections" into separate files.
  // TODO(jelbourn): Horizontal line between months (pending spec finalization)
  // TODO(jelbourn): Alt+down in date input to open calendar
  // TODO(jelbourn): Animations should use `.finally()` instead of `.then()`
  // TODO(jelbourn): improve default date parser in locale provider.
  // TODO(jelbourn): read-only state.
  // TODO(jelbourn): make aria-live element visibly hidden (but still present on the page).

  function calendarDirective() {
    return {
      template:
        '<div>' +
          '<table class="md-calendar-day-header"><thead></thead></table>' +
          '<md-virtual-repeat-container class="md-calendar-container">' +
            '<table class="md-calendar">' +
              '<tbody md-virtual-repeat="i in ctrl.items" md-calendar-month ' +
                  'md-month-offset="$index" class="md-calendar-month" aria-hidden="true" ' +
                  'md-size="288"></tbody>' +
            '</table>' +
          '</md-virtual-repeat-container>' +
          '<div aria-live="polite"></div>' +
        '</div>',
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

  /** Class applied to the selected date cell/. */
  var SELECTED_DATE_CLASS = 'md-calendar-selected-date';

  /** Class applied to the cell for today. */
  var TODAY_CLASS = 'md-calendar-date-today';

  /** Next idientifier for calendar instance. */
  var nextUniqueId = 0;

  var dummyArray = Array(200000);
  for (var dummyArrayIndex = 0; dummyArrayIndex < dummyArray.length; dummyArrayIndex++) {
    dummyArray[dummyArrayIndex] = dummyArrayIndex - (dummyArray.length / 2);
  }

  /**
   * Controller for the mdCalendar component.
   * @ngInject @constructor
   */
  function CalendarCtrl($element, $scope, $animate, $q, $mdConstant,
      $$mdDateUtil, $$mdDateLocale, $mdInkRipple, $mdUtil) {


    this.items = dummyArray;

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

    /** @final {Date} */
    this.today = new Date();

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
          self.setNgModelValue(new Date(Number(this.dataset.timestamp)));
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

    this.displayDate = this.selectedDate || new Date(Date.now());
    this.isInitialized = true;
  };

  /**
   * Attach event listeners for the calendar.
   */
  CalendarCtrl.prototype.attachCalendarEventListeners = function() {
    // Keyboard interaction.
    this.calendarElement.addEventListener('keydown', this.handleKeyEvent.bind(this));
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
      // Capture escape and emit back up so that a wrapping component (such as a date-picker)
      // can decide to close.
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

      // Prevent the default on the key event only if it triggered a date navigation.
      if (!self.dateUtil.isSameDay(date, self.displayDate)) {
        event.preventDefault();
      }

      // Since this is a keyboard interaction, actually give the newly focused date keyboard
      // focus after the been brought into view.
      self.changeDisplayDate(date).then(function() {
        self.focusDateElement(date);
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
   *
   * @param {Date} date
   */
  CalendarCtrl.prototype.setNgModelValue = function(date) {
    this.$scope.$emit('md-calendar-change', date);
    this.ngModelCtrl.$setViewValue(date);
    this.ngModelCtrl.$render();
  };

  /**
   * Focus the cell corresponding to the given date.
   * @param {Date} date
   */
  CalendarCtrl.prototype.focusDateElement = function(date) {
    var cellId = this.getDateId(date);
    var cell = this.calendarElement.querySelector('#' + cellId);
    cell.focus();
  };

  /** Focus the calendar. */
  CalendarCtrl.prototype.focus = function() {
    this.focusDateElement(this.selectedDate);
  };

  /*** Animation ***/

  /**
   * Animates the transition from the calendar's current month to the given month.
   * @param date
   * @returns {angular.$q.Promise} The animation promise.
   */
  CalendarCtrl.prototype.animateDateChange = function(date) {
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
      this.highlightToday();
      return this.$q.when();
    }

    // If trying to show an invalid date, do nothing.
    if (!this.dateUtil.isValidDate(date)) {
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
    var todayCell = this.calendarElement.querySelector('#' + this.getDateId(this.today));
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
      annoucement += currentDate.getFullYear() +
          '. ' +
          this.dateLocale.months[currentDate.getMonth()] + '. ';
    }

    if (previousDate.getDate() !== currentDate.getDate()) {
      annoucement += this.dateLocale.days[currentDate.getDay()] + '. ' + currentDate.getDate() ;
    }

    this.ariaLiveElement.textContent = annoucement;
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
   * @private
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
