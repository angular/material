(function() {
  'use strict';

  // TODO(jelbourn): md-calendar shown in floating panel.
  // TODO(jelbourn): little calendar icon next to input
  // TODO(jelbourn): only one open md-calendar panel at a time per application


  angular.module('material.components.calendar')
      .directive('mdDatePicker', datePickerDirective);

  function datePickerDirective() {
    return {
      template:
          '<input><button type="button" ng-click="ctrl.openCalendarPane()">📅</button>' +
          '<div class="md-date-calendar-pane">' +
            '<md-calendar ng-model="ctrl.date" ng-if="ctrl.isCalendarOpen"></md-calendar>' +
          '</div>',
      // <md-calendar ng-model="ctrl.date"></md-calendar>
      require: ['ngModel', 'mdDatePicker'],
      scope: {},
      controller: DatePickerCtrl,
      controllerAs: 'ctrl',
      link: function(scope, element, attr, controllers) {
        var ngModelCtrl = controllers[0];
        var mdDatePickerCtrl = controllers[1];

        mdDatePickerCtrl.configureNgModel(ngModelCtrl);
      }
    };
  }

  /**
   * Controller for md-date-picker.
   *
   * @ngInject @constructor
   */
  function DatePickerCtrl($scope, $element, $compile, $timeout, $mdConstant, $mdUtil,
      $$mdDateLocale, $$mdDateUtil) {
    /** @final */
    this.$compile = $compile;

    /** @final */
    this.$timeout = $timeout;

    /** @final */
    this.dateLocale = $$mdDateLocale;

    /** @final */
    this.dateUtil = $$mdDateUtil;

    /** @final */
    this.$mdConstant = $mdConstant;

    /* @final */
    this.$mdUtil = $mdUtil;

    /** @type {!angular.NgModelController} */
    this.ngModelCtrl = null;

    /** @type {HTMLInputElement} */
    this.inputElement = $element[0].querySelector('input');

    /** @type {HTMLElement} Floating calendar pane (instantiated lazily) */
    this.calendarPane = $element[0].querySelector('.md-date-calendar-pane');

    /** @type {Date} */
    this.date = null;

    /** @final {!angular.JQLite} */
    this.$element = $element;

    /** @final {!angular.Scope} */
    this.$scope = $scope;

    /** @type {boolean} Whether the date-picker's calendar pane is open. */
    this.isCalendarOpen = false;

    /** Pre-bound click handler is saved so that the event listener can be removed. */
    this.bodyClickHandler = this.handleBodyClick.bind(this);

    this.attachChangeListeners();
    this.attachInterationListeners();

    var self = this;
    $scope.$on('$destroy', function() {
      self.detachCalendarPane();
    });
  }

  /**
   * Sets up the controller's reference to ngModelController.
   * @param {!angular.NgModelController} ngModelCtrl
   */
  DatePickerCtrl.prototype.configureNgModel = function(ngModelCtrl) {
    this.ngModelCtrl = ngModelCtrl;

    var self = this;
    ngModelCtrl.$render = function() {
      self.date = self.ngModelCtrl.$viewValue;
      self.inputElement.value = self.dateLocale.formatDate(self.date);
    };
  };

  /**
   * Attach event listeners for both the text input and the md-calendar.
   * Events are used instead of ng-model so that updates don't infinitely update the other
   * on a change. This should also be more performant than using a $watch.
   */
  DatePickerCtrl.prototype.attachChangeListeners = function() {
    var self = this;

    self.$scope.$on('md-calendar-change', function(event, date) {
      self.ngModelCtrl.$setViewValue(date);
      self.inputElement.value = self.dateLocale.formatDate(date);
      self.closeCalendarPane();
    });

    // TODO(jelbourn): debounce
    self.inputElement.addEventListener('input', function() {
      var parsedDate = self.dateLocale.parseDate(self.inputElement.value);
      if (self.dateUtil.isValidDate(parsedDate)) {
        self.date = parsedDate;
        self.$scope.$apply();
      }
    });
  };

  /** Attach event listeners for user interaction. */
  DatePickerCtrl.prototype.attachInterationListeners = function() {
    var self = this;
    var $scope = this.$scope;
    var keyCodes = this.$mdConstant.KEY_CODE;

    self.inputElement.addEventListener('keydown', function(event) {
      $scope.$apply(function() {
        if (event.altKey && event.keyCode == keyCodes.DOWN_ARROW) {
          self.openCalendarPane();
        }
      });
    });

    self.$scope.$on('md-calendar-escape', function() {
      self.closeCalendarPane();
    });
  };

  /** Position and attach the floating calendar to the document. */
  DatePickerCtrl.prototype.attachCalendarPane = function() {
    var elementRect = this.$element[0].getBoundingClientRect();

    this.calendarPane.style.left = elementRect.left + 'px';
    this.calendarPane.style.top = elementRect.bottom + 'px';
    document.body.appendChild(this.calendarPane);
  };

  /** Detach the floating calendar pane from the document. */
  DatePickerCtrl.prototype.detachCalendarPane = function() {
    // Use native DOM removal because we do not want any of the angular state of this element
    // to be disposed.
    this.calendarPane.parentNode.removeChild(this.calendarPane);
  };

  /** Open the floating calendar pane. */
  DatePickerCtrl.prototype.openCalendarPane = function() {
    if (!this.isCalendarOpen) {
      this.isCalendarOpen = true;
      this.attachCalendarPane();
      // TODO(jelbourn): dispatch to tell other date pickers to close.
      this.focusCalendar();

      // Attach click listener inside of a timeout because, if this open call was triggered by a
      // click, we don't want it to be immediately propogated up to the body and handled.
      var self = this;
      this.$timeout(function() {
        document.body.addEventListener('click', self.bodyClickHandler);
      }, 0, false);
    }
  };

  /** Close the floating calendar pane. */
  DatePickerCtrl.prototype.closeCalendarPane = function() {
    this.isCalendarOpen = false;
    this.detachCalendarPane();
    this.inputElement.focus();
    document.body.removeEventListener('click', this.bodyClickHandler);
  };

  /** Gets the controller instance for the calendar in the floating pane. */
  DatePickerCtrl.prototype.getCalendarCtrl = function() {
    return angular.element(this.calendarPane.querySelector('md-calendar')).controller('mdCalendar');
  };

  /** Focus the calendar in the floating pane. */
  DatePickerCtrl.prototype.focusCalendar = function() {
    // Use a timeout in order to allow the calendar to be rendered, as it is gated behind an ng-if.
    var self = this;
    this.$timeout(function() {
      self.getCalendarCtrl().focus();
    }, 0, false);
  };

  /**
   * Handles a click on the document body when the floating calendar pane is open.
   * Closes the floating calendar pane if the click is not inside of it.
   * @param {MouseEvent} event
   */
  DatePickerCtrl.prototype.handleBodyClick = function(event) {
    if (this.isCalendarOpen) {
      var isInCalendar = this.$mdUtil.getClosest(event.target, 'md-calendar');
      if (!isInCalendar) {
        this.closeCalendarPane();
      }
    }
  };
})();
