(function() {
  'use strict';

  /**
   * @ngdoc module
   * @name material.components.calendar
   * @description Calendar
   */
  angular.module('material.components.datepicker', [
    'material.core',
    'material.components.icon',
    'material.components.virtualRepeat'
  ]).directive('mdCalendar', calendarDirective);


  // POST RELEASE
  // TODO(jelbourn): Mac Cmd + left / right == Home / End
  // TODO(jelbourn): Refactor month element creation to use cloneNode (performance).
  // TODO(jelbourn): Define virtual scrolling constants (compactness) users can override.
  // TODO(jelbourn): Animated month transition on ng-model change (virtual-repeat)
  // TODO(jelbourn): Scroll snapping (virtual repeat)
  // TODO(jelbourn): Remove superfluous row from short months (virtual-repeat)
  // TODO(jelbourn): Month headers stick to top when scrolling.
  // TODO(jelbourn): Previous month opacity is lowered when partially scrolled out of view.
  // TODO(jelbourn): Support md-calendar standalone on a page (as a tabstop w/ aria-live
  //     announcement and key handling).
  // Read-only calendar (not just date-picker).

  function calendarDirective() {
    return {
      template:
        '<div ng-switch="calendarCtrl.currentView">' +
          '<md-calendar-year ng-switch-when="year"></md-calendar-year>' +
          '<md-calendar-month ng-switch-default></md-calendar-month>' +
        '</div>',
      scope: {
        minDate: '=mdMinDate',
        maxDate: '=mdMaxDate',
        dateFilter: '=mdDateFilter'
      },
      require: ['ngModel', 'mdCalendar'],
      controller: CalendarCtrl,
      controllerAs: 'calendarCtrl',
      bindToController: true,
      link: function(scope, element, attrs, controllers) {
        var ngModelCtrl = controllers[0];
        var mdCalendarCtrl = controllers[1];
        mdCalendarCtrl.configureNgModel(ngModelCtrl);
      }
    };
  }

  /** Next identifier for calendar instance. */
  var nextUniqueId = 0;

  /**
   * Controller for the mdCalendar component.
   * @ngInject @constructor
   */
  function CalendarCtrl($element, $scope, $$mdDateUtil, $mdConstant, $mdTheming, $attrs) {

    $mdTheming($element);

    /** @final {!angular.JQLite} */
    this.$element = $element;

    /** @final {!angular.Scope} */
    this.$scope = $scope;

    /** @final */
    this.dateUtil = $$mdDateUtil;

    /** @final */
    this.keyCode = $mdConstant.KEY_CODE;

    /** @final {Date} */
    this.today = this.dateUtil.createDateAtMidnight();

    /** @type {!angular.NgModelController} */
    this.ngModelCtrl = null;

    /** @type {String} The currently visible calendar view. */
    this.currentView = 'month';

    /** @type {String} Class applied to the selected date cell. */
    this.SELECTED_DATE_CLASS = 'md-calendar-selected-date';

    /** @type {String} Class applied to the cell for today. */
    this.TODAY_CLASS = 'md-calendar-date-today';

    /** @type {String} Class applied to the focused cell. */
    this.FOCUSED_DATE_CLASS = 'md-focus';

    /** @final {number} Unique ID for this calendar instance. */
    this.id = nextUniqueId++;

    /**
     * The date that is currently focused or showing in the calendar. This will initially be set
     * to the ng-model value if set, otherwise to today. It will be updated as the user navigates
     * to other months. The cell corresponding to the displayDate does not necesarily always have
     * focus in the document (such as for cases when the user is scrolling the calendar).
     * @type {Date}
     */
    this.displayDate = null;

    /**
     * The selected date. Keep track of this separately from the ng-model value so that we
     * can know, when the ng-model value changes, what the previous value was before it's updated
     * in the component's UI.
     *
     * @type {Date}
     */
    this.selectedDate = null;

    /**
     * Width of the calendar without any content. Used by the child
     * views to hide the scrollbar.
     * @type {number}
     */
    this.baseWidth = $element[0].querySelector('[ng-switch]').offsetWidth;

    // Unless the user specifies so, the calendar should not be a tab stop.
    // This is necessary because ngAria might add a tabindex to anything with an ng-model
    // (based on whether or not the user has turned that particular feature on/off).
    if (!$attrs.tabindex) {
      $element.attr('tabindex', '-1');
    }

    $element.on('keydown', angular.bind(this, this.handleKeyEvent));
  }

  /**
   * Sets up the controller's reference to ngModelController.
   * @param {!angular.NgModelController} ngModelCtrl
   */
  CalendarCtrl.prototype.configureNgModel = function(ngModelCtrl) {
    var self = this;

    self.ngModelCtrl = ngModelCtrl;

    ngModelCtrl.$render = function() {
      var value = this.$viewValue;

      // Notify the child scopes of any changes.
      self.$scope.$broadcast('md-calendar-parent-changed', value);

      // Set up the selectedDate if it hasn't been already.
      if (!self.selectedDate) {
        self.selectedDate = value;
      }

      // Also set up the displayDate.
      if (!self.displayDate) {
        self.displayDate = self.selectedDate || self.today;
      }
    };
  };

  /**
   * Sets the ng-model value for the calendar and emits a change event.
   * @param {Date} date
   */
  CalendarCtrl.prototype.setNgModelValue = function(date) {
    var value = this.dateUtil.createDateAtMidnight(date);
    this.$scope.$emit('md-calendar-change', value);
    this.ngModelCtrl.$setViewValue(value);
    this.ngModelCtrl.$render();
    return value;
  };

  /**
   * Sets the current view that should be visible in the calendar
   * @param {string} newView View name to be set.
   * @param {number|Date} time Date object or a timestamp for the new display date.
   */
  CalendarCtrl.prototype.setCurrentView = function(newView, time) {
    this.currentView = newView;

    if (time) {
      this.displayDate = angular.isDate(time) ? time : new Date(time);
    }
  };

  /**
   * Focus the cell corresponding to the given date.
   * @param {Date} date The date to be focused.
   */
  CalendarCtrl.prototype.focus = function(date) {
    if (this.dateUtil.isValidDate(date)) {
      var previousFocus = this.$element[0].querySelector('.md-focus');
      if (previousFocus) {
        previousFocus.classList.remove(this.FOCUSED_DATE_CLASS);
      }

      var cellId = this.getDateId(date, this.currentView);
      var cell = document.getElementById(cellId);
      if (cell) {
        cell.classList.add(this.FOCUSED_DATE_CLASS);
        cell.focus();
        this.displayDate = date;
      }
    } else {
      this.$element[0].focus();
    }
  };

  /**
   * Normalizes the key event into an action name. The action will be broadcast
   * to the child controllers.
   * @param {KeyboardEvent} event
   * @returns {String} The action that should be taken, or null if the key
   * does not match a calendar shortcut.
   */
  CalendarCtrl.prototype.getActionFromKeyEvent = function(event) {
    var keyCode = this.keyCode;

    switch (event.which) {
      case keyCode.ENTER: return 'select';

      case keyCode.RIGHT_ARROW: return 'move-right';
      case keyCode.LEFT_ARROW: return 'move-left';

      // TODO(crisbeto): Might want to reconsider using metaKey, because it maps
      // to the "Windows" key on PC, which opens the start menu or resizes the browser.
      case keyCode.DOWN_ARROW: return event.metaKey ? 'move-page-down' : 'move-row-down';
      case keyCode.UP_ARROW: return event.metaKey ? 'move-page-up' : 'move-row-up';

      case keyCode.PAGE_DOWN: return 'move-page-down';
      case keyCode.PAGE_UP: return 'move-page-up';

      case keyCode.HOME: return 'start';
      case keyCode.END: return 'end';

      default: return null;
    }
  };

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
      if (event.which == self.keyCode.ESCAPE || event.which == self.keyCode.TAB) {
        self.$scope.$emit('md-calendar-close');

        if (event.which == self.keyCode.TAB) {
          event.preventDefault();
        }

        return;
      }

      // Broadcast the action that any child controllers should take.
      var action = self.getActionFromKeyEvent(event);
      if (action) {
        event.preventDefault();
        event.stopPropagation();
        self.$scope.$broadcast('md-calendar-parent-action', action);
      }
    });
  };

  /**
   * Hides the vertical scrollbar on the calendar scroller of a child controller by
   * setting the width on the calendar scroller and the `overflow: hidden` wrapper
   * around the scroller, and then setting a padding-right on the scroller equal
   * to the width of the browser's scrollbar.
   *
   * This will cause a reflow.
   *
   * @param {object} childCtrl The child controller whose scrollbar should be hidden.
   */
  CalendarCtrl.prototype.hideVerticalScrollbar = function(childCtrl) {
    var scrollMask = childCtrl.$element[0].querySelector('.md-calendar-scroll-mask');
    var scroller = childCtrl.calendarScroller;

    var scrollbarWidth = scroller.offsetWidth - scroller.clientWidth;
    var baseWidth = this.baseWidth;

    scrollMask.style.width = baseWidth + 'px';
    scroller.style.width = (baseWidth + scrollbarWidth) + 'px';
    scroller.style.paddingRight = scrollbarWidth + 'px';
  };

  /**
   * Gets an identifier for a date unique to the calendar instance for internal
   * purposes. Not to be displayed.
   * @param {Date} date The date for which the id is being generated
   * @param {string} namespace Namespace for the id. (month, year etc.)
   * @returns {string}
   */
  CalendarCtrl.prototype.getDateId = function(date, namespace) {
    if (!namespace) {
      throw new Error('A namespace for the date id has to be specified.');
    }

    return [
      'md',
      this.id,
      namespace,
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ].join('-');
  };
})();
