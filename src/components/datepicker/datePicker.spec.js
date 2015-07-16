
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
    dateLocale = $injector.get('$$mdDateLocale');
    $timeout = $injector.get('$timeout');
    keyCodes = $injector.get('$mdConstant').KEY_CODE;

    pageScope = $rootScope.$new();
    pageScope.myDate = initialDate;
    pageScope.isDisabled = false;

    var template = '<md-datepicker ng-model="myDate" ng-disabled="isDisabled"></md-datepicker>';
    ngElement = $compile(template)(pageScope);
    $rootScope.$apply();

    scope = ngElement.scope();
    controller = ngElement.controller('mdDatepicker');
    element = ngElement[0];
  }));

  it('should set initial value from ng-model', function() {
    expect(controller.inputElement.value).toBe(dateLocale.formatDate(initialDate));
  });

  it('should open and close the floating calendar pane (with shadow)', function() {
    // We can asset that the calendarPane is in the DOM by checking if it has a height.
    expect(controller.calendarPane.offsetHeight).toBe(0);

    element.querySelector('md-button').click();
    $timeout.flush();

    expect(controller.calendarPane.offsetHeight).toBeGreaterThan(0);

    // Click off of the calendar.
    document.body.click();
    expect(controller.calendarPane.offsetHeight).toBe(0);
  });

  it('should open and close the floating calendar pane via keyboard', function() {
    angular.element(controller.inputElement).triggerHandler({
      type: 'keydown',
      altKey: true,
      keyCode: keyCodes.DOWN_ARROW
    });
    $timeout.flush();

    expect(controller.calendarPane.offsetHeight).toBeGreaterThan(0);

    // Fake an escape event coming the the calendar.
    pageScope.$broadcast('md-calendar-close');

  });

  it('should disable the internal input based on ng-disabled binding', function() {
    expect(controller.inputElement.disabled).toBe(false);

    pageScope.isDisabled = true;
    pageScope.$apply();

    expect(controller.inputElement.disabled).toBe(true);
  });

});
