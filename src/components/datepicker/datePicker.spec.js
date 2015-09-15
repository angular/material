
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

    var template = '<md-datepicker ' +
          'md-max-date="maxDate" ' +
          'md-min-date="minDate" ' +
          'ng-model="myDate" ' +
          'ng-disabled="isDisabled">' +
      '</md-datepicker>';
    ngElement = $compile(template)(pageScope);
    $rootScope.$apply();

    scope = ngElement.isolateScope();
    controller = ngElement.controller('mdDatepicker');
    element = ngElement[0];
  }));

  /**
   * Populates the inputElement with a value and triggers the input events.
   */
  function populateInputElement(inputString) {
    controller.ngInputElement.val(inputString).triggerHandler('input');
    $timeout.flush();
  }

  it('should set initial value from ng-model', function() {
    expect(controller.inputElement.value).toBe(dateLocale.formatDate(initialDate));
  });

  it('should set the ngModel value to null when the text input is emptied', function() {
    controller.inputElement.value = '';
    controller.ngInputElement.triggerHandler('input');
    $timeout.flush();

    expect(pageScope.myDate).toBeNull();
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
    controller.ngInputElement.triggerHandler({
      type: 'keydown',
      altKey: true,
      keyCode: keyCodes.DOWN_ARROW
    });
    $timeout.flush();

    expect(controller.calendarPane.offsetHeight).toBeGreaterThan(0);

    // Fake an escape event closing the calendar.
    pageScope.$broadcast('md-calendar-close');

  });

  it('should adjust the position of the floating pane if it would go off-screen', function() {
    // Absolutely position the picker near the edge of the screen.
    var bodyRect = document.body.getBoundingClientRect();
    element.style.position = 'absolute';
    element.style.top = bodyRect.bottom + 'px';
    element.style.left = bodyRect.right + 'px';
    document.body.appendChild(element);

    // Open the pane.
    element.querySelector('md-button').click();
    $timeout.flush();

    // Expect that the whole pane is on-screen.
    var paneRect = controller.calendarPane.getBoundingClientRect();
    expect(paneRect.right).toBeLessThan(bodyRect.right + 1);
    expect(paneRect.bottom).toBeLessThan(bodyRect.bottom + 1);
    expect(paneRect.top).toBeGreaterThan(0);
    expect(paneRect.left).toBeGreaterThan(0);

    document.body.removeChild(element);
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
      populateInputElement('6/1/2015');
      expect(controller.ngModelCtrl.$modelValue).toEqual(expectedDate);
    });

    it('should not update the model value when user enters an invalid date', function() {
      populateInputElement('7');
      expect(controller.ngModelCtrl.$modelValue).toEqual(initialDate);
    });

    it('should not update the model value when input is outside min/max bounds', function() {
      pageScope.minDate = new Date(2014, JUN, 1);
      pageScope.maxDate = new Date(2014, JUN, 3);
      pageScope.$apply();

      populateInputElement('5/30/2014');
      expect(controller.ngModelCtrl.$modelValue).toEqual(initialDate);

      populateInputElement('6/4/2014');
      expect(controller.ngModelCtrl.$modelValue).toEqual(initialDate);

      populateInputElement('6/2/2014');
      expect(controller.ngModelCtrl.$modelValue).toEqual(new Date(2014, JUN, 2));
    });

    it('should add and remove the invalid class', function() {
      populateInputElement('6/1/2015');
      expect(controller.inputContainer).not.toHaveClass('md-datepicker-invalid');

      populateInputElement('7');
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
      populateInputElement('7');
      expect(controller.inputContainer).toHaveClass('md-datepicker-invalid');

      controller.openCalendarPane({
        target: controller.inputElement
      });
      scope.$emit('md-calendar-change', new Date());
      expect(controller.inputContainer).not.toHaveClass('md-datepicker-invalid');
    });
  });
});
