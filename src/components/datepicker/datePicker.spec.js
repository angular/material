
describe('md-date-picker', function() {
  // When constructing a Date, the month is zero-based. This can be confusing, since people are
  // used to seeing them one-based. So we create these aliases to make reading the tests easier.
  var JAN = 0, FEB = 1, MAR = 2, APR = 3, MAY = 4, JUN = 5, JUL = 6, AUG = 7, SEP = 8, OCT = 9,
      NOV = 10, DEC = 11;

  var initialDate = new Date(2015, FEB, 15);

  var ngElement, element, scope, pageScope, controller;
  var $timeout, $$rAF, $animate, keyCodes, dateUtil, dateLocale;

  beforeEach(module('material.components.datepicker', 'ngAnimateMock'));

  beforeEach(inject(function($compile, $rootScope, $injector) {
    $$rAF = $injector.get('$$rAF');
    $animate = $injector.get('$animate');
    dateUtil = $injector.get('$$mdDateUtil');
    dateLocale = $injector.get('$mdDateLocale');
    $timeout = $injector.get('$timeout');
    keyCodes = $injector.get('$mdConstant').KEY_CODE;

    pageScope = $rootScope.$new();
    pageScope.myDate = initialDate;
    pageScope.isDisabled = false;

    var template = '<md-datepicker ng-model="myDate" ng-disabled="isDisabled"></md-datepicker>';
    ngElement = $compile(template)(pageScope);
    $rootScope.$apply();

    scope = ngElement.isolateScope();
    controller = ngElement.controller('mdDatepicker');
    element = ngElement[0];
  }));

  it('should set initial value from ng-model', function() {
    expect(controller.inputElement.value).toBe(dateLocale.formatDate(initialDate));
  });

  it('should open and close the floating calendar pane element', function() {
    // We can asset that the calendarPane is in the DOM by checking if it has a height.
    expect(controller.calendarPane.offsetHeight).toBe(0);

    element.querySelector('md-button').click();
    $timeout.flush();

    expect(controller.calendarPane.offsetHeight).toBeGreaterThan(0);
    expect(controller.inputMask.style.left).toBe(controller.inputContainer.clientWidth + 'px');

    // Click off of the calendar.
    document.body.click();
    expect(controller.calendarPane.offsetHeight).toBe(0);
  });

  it('should open and close the floating calendar pane element via keyboard', function() {
    angular.element(controller.inputElement).triggerHandler({
      type: 'keydown',
      altKey: true,
      keyCode: keyCodes.DOWN_ARROW
    });
    $timeout.flush();

    expect(controller.calendarPane.offsetHeight).toBeGreaterThan(0);

    // Fake an escape event closing the calendar.
    pageScope.$broadcast('md-calendar-close');

  });

  it('should disable the internal inputs based on ng-disabled binding', function() {
    expect(controller.inputElement.disabled).toBe(false);
    expect(controller.calendarButton.disabled).toBe(false);

    pageScope.isDisabled = true;
    pageScope.$apply();

    expect(controller.inputElement.disabled).toBe(true);
    expect(controller.calendarButton.disabled).toBe(true);
  });

  it('should not open the calendar pane if disabled', function() {
    controller.setDisabled(true);
    controller.openCalendarPane({
      target: controller.inputElement
    });
    scope.$apply();
    expect(controller.isCalendarOpen).toBeFalsy();
    expect(controller.calendarPane.offsetHeight).toBe(0);
  });

  it('should update the internal input placeholder', function() {
    expect(controller.inputElement.placeholder).toBeFalsy();
    controller.placeholder = 'Fancy new placeholder';

    expect(controller.inputElement.placeholder).toBe('Fancy new placeholder');
  });

  describe('input event', function() {
    it('should update the model value when user enters a valid date', function() {
      var expectedDate = new Date(2015, JUN, 1);
      controller.inputElement.value = '6/1/2015';
      angular.element(controller.inputElement).triggerHandler('input');
      $timeout.flush();
      expect(controller.ngModelCtrl.$modelValue).toEqual(expectedDate);
    });

    it('should not update the model value when user enters an invalid date', function() {
      controller.inputElement.value = '7';
      angular.element(controller.inputElement).triggerHandler('input');
      $timeout.flush();
      expect(controller.ngModelCtrl.$modelValue).toEqual(initialDate);
    });

    it('should add and remove the invalid class', function() {
      controller.inputElement.value = '6/1/2015';
      angular.element(controller.inputElement).triggerHandler('input');
      $timeout.flush();
      expect(controller.inputContainer).not.toHaveClass('md-datepicker-invalid');

      controller.inputElement.value = '7';
      angular.element(controller.inputElement).triggerHandler('input');
      $timeout.flush();
      expect(controller.inputContainer).toHaveClass('md-datepicker-invalid');
    });
  });

  it('should close the calendar pane on md-calendar-close', function() {
    controller.openCalendarPane({
      target: controller.inputElement
    });

    scope.$emit('md-calendar-close');
    scope.$apply();
    expect(controller.calendarPaneOpenedFrom).toBe(null);
    expect(controller.isCalendarOpen).toBe(false);
  });

  describe('md-calendar-change', function() {
    it('should update the model value and close the calendar pane', function() {
      var date = new Date(2015, JUN, 1);
      controller.openCalendarPane({
        target: controller.inputElement
      });
      scope.$emit('md-calendar-change', date);
      scope.$apply();
      expect(pageScope.myDate).toEqual(date);
      expect(controller.ngModelCtrl.$modelValue).toEqual(date);

      expect(controller.inputElement.value).toEqual(date.toLocaleDateString());
      expect(controller.calendarPaneOpenedFrom).toBe(null);
      expect(controller.isCalendarOpen).toBe(false);
    });

    it('should remove the invalid state if present', function() {
      controller.inputElement.value = '7';
      angular.element(controller.inputElement).triggerHandler('input');
      $timeout.flush();
      expect(controller.inputContainer).toHaveClass('md-datepicker-invalid');

      controller.openCalendarPane({
        target: controller.inputElement
      });
      scope.$emit('md-calendar-change', new Date());
      expect(controller.inputContainer).not.toHaveClass('md-datepicker-invalid');
    });
  });
});
