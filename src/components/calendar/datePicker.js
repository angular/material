(function() {
  'use strict';

  angular.module('material.components.calendar')
      .directive('mdDatePicker', datePickerDirective);

  function datePickerDirective() {
    return {
      template:
        '<div>' +
          '<input ng-model="textValue"> <br>' +
          '<md-calendar ng-model="dateValue"></md-calendar>' +
        '</div>',
      require: ['ngModel', 'mdDatePicker'],
      scope: {},
      controller: DatePickerCtrl,
      controllerAs: 'ctrl'
    };
  }

  function DatePickerCtrl($$mdDateLocale) {
    /** @final */
    this.dateLocale = $$mdDateLocale;

    /** @type {!angular.NgModelController} */
    this.ngModelCtrl = null;

    /** @type {string} */
    this.textValue = '';

    /** @type {Date} */
    this.dateValue = null;
  }

  /**
   * Sets up the controller's reference to ngModelController.
   * @param {!angular.NgModelController} ngModelCtrl
   */
  DatePickerCtrl.prototype.configureNgModel = function(ngModelCtrl) {
    this.ngModelCtrl = ngModelCtrl;

    var self = this;
    ngModelCtrl.$render = function() {
      self.dateValue = self.ngModelCtrl.$viewValue
      self.textValue = self.dateLocale.format(self.ngModelCtrl.$viewValue);
    };
  }
})();
