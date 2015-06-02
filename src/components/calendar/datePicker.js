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
        '<div class="md-date-picker">' +
          '<input> <br>' +
          '<md-calendar ng-model="ctrl.date"></md-calendar>' +
        '</div>',
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

  function DatePickerCtrl($scope, $element, $$mdDateLocale, $$mdDateUtil) {
    /** @final */
    this.dateLocale = $$mdDateLocale;

    /** @final */
    this.dateUtil = $$mdDateUtil;

    /** @type {!angular.NgModelController} */
    this.ngModelCtrl = null;

    /** @type {HTMLInputElement} */
    this.inputElement = $element[0].querySelector('input');

    /** @type {Date} */
    this.date = null;

    /** @final {!angular.JQLite} */
    this.$element = $element;

    /** @final {!angular.Scope} */
    this.$scope = $scope;

    this.attachChangeListeners();
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
})();
