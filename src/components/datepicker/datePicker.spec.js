
describe('md-date-picker', function() {
  // When constructing a Date, the month is zero-based. This can be confusing, since people are
  // used to seeing them one-based. So we create these aliases to make reading the tests easier.
  var JAN = 0, FEB = 1, MAR = 2, APR = 3, MAY = 4, JUN = 5, JUL = 6, AUG = 7, SEP = 8, OCT = 9,
      NOV = 10, DEC = 11;

  var initialDate = new Date(2015, FEB, 15);

  var ngElement, element, scope, pageScope, controller;
  var $compile, $timeout, $$rAF, $animate, $window, keyCodes, dateUtil, dateLocale;

  var DATEPICKER_TEMPLATE =
    '<md-datepicker name="birthday" ' +
         'md-max-date="maxDate" ' +
         'md-min-date="minDate" ' +
         'md-date-filter="dateFilter"' +
         'ng-model="myDate" ' +
         'ng-change="dateChangedHandler()" ' +
         'ng-required="isRequired" ' +
         'ng-disabled="isDisabled">' +
    '</md-datepicker>';

  var fakeInputModule = angular.module('fakeInputModule', [])
      .directive('mdInputContainer', function() {
        return {controller: angular.noop};
      });

  beforeEach(module('material.components.datepicker', 'ngAnimateMock', 'fakeInputModule'));

  beforeEach(inject(function($rootScope, $injector) {
    $compile = $injector.get('$compile');
    $$rAF = $injector.get('$$rAF');
    $animate = $injector.get('$animate');
    $window = $injector.get('$window');
    dateUtil = $injector.get('$$mdDateUtil');
    dateLocale = $injector.get('$mdDateLocale');
    $timeout = $injector.get('$timeout');
    keyCodes = $injector.get('$mdConstant').KEY_CODE;

    pageScope = $rootScope.$new();
    pageScope.myDate = initialDate;
    pageScope.isDisabled = false;
    pageScope.dateChangedHandler = jasmine.createSpy('ng-change handler');

    createDatepickerInstance(DATEPICKER_TEMPLATE);
    controller.closeCalendarPane();
  }));
  /**
   * Compile and link the given template and store values for element, scope, and controller.
   * @param {string} template
   * @returns {angular.JQLite} The root compiled element.
   */
  function createDatepickerInstance(template) {
    var outputElement = $compile(template)(pageScope);
    pageScope.$apply();

    ngElement = outputElement[0].tagName == 'MD-DATEPICKER' ?
        outputElement : outputElement.find('md-datepicker');
    element = ngElement[0];
    scope = ngElement.isolateScope();
    controller = ngElement.controller('mdDatepicker');

    return outputElement;
  }

  /** Populates the inputElement with a value and triggers the input events. */
  function populateInputElement(inputString) {
    controller.ngInputElement.val(inputString).triggerHandler('input');
    $timeout.flush();
    pageScope.$apply();
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

  it('should disable the internal inputs based on ng-disabled binding', function() {
    expect(controller.inputElement.disabled).toBe(false);
    expect(controller.calendarButton.disabled).toBe(false);

    pageScope.isDisabled = true;
    pageScope.$apply();

    expect(controller.inputElement.disabled).toBe(true);
    expect(controller.calendarButton.disabled).toBe(true);
  });

  it('should update the internal input placeholder', function() {
    expect(controller.inputElement.placeholder).toBeFalsy();
    controller.placeholder = 'Fancy new placeholder';

    expect(controller.inputElement.placeholder).toBe('Fancy new placeholder');
  });

  it('should throw an error when the model is not a date', function() {
    expect(function() {
      pageScope.myDate = '2015-01-01';
      pageScope.$apply();
    }).toThrowError('The ng-model for md-datepicker must be a Date instance. ' +
        'Currently the model is a: string');
  });

  it('should support null and undefined values', function() {
    expect(function() {
      pageScope.myDate = null;
      pageScope.$apply();

      pageScope.myDate = undefined;
      pageScope.$apply();

    }).not.toThrow();
  });

  it('should throw an error when inside of md-input-container', function() {
    var template =
        '<md-input-container>' +
          '<md-datepicker ng-model="myDate"></md-datepicker>' +
        '</md-input-container>';

    expect(function() {
      $compile(template)(pageScope);
    }).toThrowError('md-datepicker should not be placed inside md-input-container.');
  });

  describe('ngMessages suport', function() {
    it('should set the `required` $error flag', function() {
      pageScope.isRequired = true;
      populateInputElement('');

      expect(controller.ngModelCtrl.$error['required']).toBe(true);
    });

    it('should set the `mindate` $error flag', function() {
      pageScope.minDate = new Date(2015, JAN, 1);
      populateInputElement('2014-01-01');
      controller.ngModelCtrl.$render();

      expect(controller.ngModelCtrl.$error['mindate']).toBe(true);
    });

    it('should set the `maxdate` $error flag', function() {
      pageScope.maxDate = new Date(2015, JAN, 1);
      populateInputElement('2016-01-01');
      controller.ngModelCtrl.$render();

      expect(controller.ngModelCtrl.$error['maxdate']).toBe(true);
    });

    it('should ignore the time portion when comparing max-date', function() {
      // Given that selected date is the same day as maxdate but at a later time.
      pageScope.maxDate = new Date(2015, JAN, 1, 5, 30);
      pageScope.myDate = new Date(2015, JAN, 1, 7, 30);
      pageScope.$apply();

      expect(controller.ngModelCtrl.$error['maxdate']).toBeFalsy();
    });

    it('should ignore the time portion when comparing min-date', function() {
      // Given that selected date is the same day as mindate but at an earlier time.
      pageScope.minDate = new Date(2015, JAN, 1, 5, 30);
      pageScope.myDate = new Date(2015, JAN, 1);
      pageScope.$apply();

      expect(controller.ngModelCtrl.$error['mindate']).toBeFalsy();
    });

    it('should allow selecting a date exactly equal to the max-date', function() {
      pageScope.maxDate = new Date(2015, JAN, 1);
      pageScope.myDate = new Date(2015, JAN, 1);
      pageScope.$apply();

      expect(controller.ngModelCtrl.$error['maxdate']).toBeFalsy();
    });

    it('should allow selecting a date exactly equal to the min-date', function() {
      pageScope.minDate = new Date(2015, JAN, 1);
      pageScope.myDate = new Date(2015, JAN, 1);
      pageScope.$apply();

      expect(controller.ngModelCtrl.$error['mindate']).toBeFalsy();
    });

    it('should not enforce `required` when a min-date is set', function() {
      pageScope.isRequired = false;
      pageScope.minDate = new Date(2015, JAN, 1);
      pageScope.myDate = null;
      pageScope.$apply();

      expect(controller.ngModelCtrl.$error['mindate']).toBeFalsy();
    });

    it('should not enforce `required` when a max-date is set', function() {
      pageScope.isRequired = false;
      pageScope.maxDate = new Date(2015, JAN, 1);
      pageScope.myDate = null;
      pageScope.$apply();

      expect(controller.ngModelCtrl.$error['mindate']).toBeFalsy();
    });

    describe('inside of a form element', function() {
      var formCtrl;

      beforeEach(function() {
        createDatepickerInstance('<form>' + DATEPICKER_TEMPLATE + '</form>');
        formCtrl = ngElement.controller('form');
      });

      it('should set `required` $error flag on the form', function() {
        pageScope.isRequired = true;
        populateInputElement('');
        controller.ngModelCtrl.$render();

        expect(formCtrl.$error['required']).toBeTruthy();
      });

      it('should set `mindate` $error flag on the form', function() {
        pageScope.minDate = new Date(2015, JAN, 1);
        populateInputElement('2014-01-01');
        controller.ngModelCtrl.$render();

        expect(formCtrl.$error['mindate']).toBeTruthy();
      });

      it('should set `maxdate` $error flag on the form', function() {
        pageScope.maxDate = new Date(2015, JAN, 1);
        populateInputElement('2016-01-01');
        controller.ngModelCtrl.$render();

        expect(formCtrl.$error['maxdate']).toBeTruthy();
      });
      
      it('should set `filtered` $error flag on the form', function() {
        pageScope.dateFilter = function(date) {
          return date.getDay() === 1;
        };
        populateInputElement('2016-01-03');
        controller.ngModelCtrl.$render();

        expect(formCtrl.$error['filtered']).toBeTruthy();
      });
    });
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

    it('should apply ngMessages errors when the date changes from keyboard input', function() {
      pageScope.minDate = new Date(2014, JUN, 1);
      pageScope.$apply();

      populateInputElement('5/30/2012');

      expect(controller.ngModelCtrl.$error['mindate']).toBe(true);
    });

    it('should evaluate ngChange expression when date changes from keyboard input', function() {
      populateInputElement('2/14/1976');

      expect(pageScope.dateChangedHandler).toHaveBeenCalled();
    });

    it('should add and remove the invalid class', function() {
      populateInputElement('6/1/2015');
      expect(controller.inputContainer).not.toHaveClass('md-datepicker-invalid');

      populateInputElement('cheese');
      expect(controller.inputContainer).toHaveClass('md-datepicker-invalid');
    });
    
    it('should not update the model when value is not enabled', function() {
      pageScope.dateFilter = function(date) {
        return date.getDay() === 1;
      };
      pageScope.$apply();

      populateInputElement('5/30/2014');
      expect(controller.ngModelCtrl.$modelValue).toEqual(initialDate);
    });

    it('shoud become touched from bluring closing the pane', function() {
      populateInputElement('17/1/2015');

      controller.openCalendarPane({
        target: controller.inputElement
      });
      controller.closeCalendarPane();

      expect(controller.ngModelCtrl.$touched).toBe(true);
    });

    it('should become touch from bluring the input', function() {
      populateInputElement('17/1/2015');

      var input = angular.element(controller.inputElement);

      input.triggerHandler('focus');
      input.triggerHandler('blur');

      expect(controller.ngModelCtrl.$touched).toBe(true);
    });

    it('should not update the input string is not "complete"', function() {
      var date = new Date(2015, DEC, 1);
      pageScope.myDate = date;

      populateInputElement('7');
      expect(pageScope.myDate).toEqual(date);
    });
  });

  describe('floating calendar pane', function() {
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

    it('should adjust the pane position if it would go off-screen (w/ scrollable)', function() {
      // Make the body super huge.
      var superLongElement = document.createElement('div');
      superLongElement.style.height = '10000px';
      superLongElement.style.width = '1px';
      document.body.appendChild(superLongElement);

      // Absolutely position the picker near (say ~30px) the edge of the viewport.
      element.style.position = 'absolute';
      element.style.top = (window.innerHeight - 30) + 'px';
      element.style.left = '0';
      document.body.appendChild(element);

      // Open the pane.
      element.querySelector('md-button').click();
      $timeout.flush();

      // Expect that the pane is on-screen.
      var paneRect = controller.calendarPane.getBoundingClientRect();
      expect(paneRect.bottom).toBeLessThan(window.innerHeight + 1);

      document.body.removeChild(element);
      document.body.removeChild(superLongElement);
    });

    xit('should adjust the pane position if it would go off-screen if body is not scrollable',
        function() {
      // Make the body super huge and scroll down a bunch.
      var body = document.body;
      var superLongElement = document.createElement('div');
      superLongElement.style.height = '10000px';
      superLongElement.style.width = '1px';
      body.appendChild(superLongElement);
      body.scrollTop = 700;

      // Absolutely position the picker near (say ~30px) the edge of the viewport.
      element.style.position = 'absolute';
      element.style.top = (document.body.scrollTop + window.innerHeight - 30) + 'px';
      element.style.left = '0';
      body.appendChild(element);

      // Make the body non-scrollable.
      var previousBodyOverflow = body.style.overflow;
      body.style.overflow = 'hidden';

      // Open the pane.
      element.querySelector('md-button').click();
      $timeout.flush();

      // Expect that the pane is on-screen.
      var paneRect = controller.calendarPane.getBoundingClientRect();
      expect(paneRect.bottom).toBeLessThan(window.innerHeight + 1);

      // Restore body to pre-test state.
      body.removeChild(element);
      body.removeChild(superLongElement);
      body.style.overflow = previousBodyOverflow;
    });

    it('should keep the calendar pane in the right place with body scrolling disabled', function() {
      // Make the body super huge and scroll down a bunch.
      var body = document.body;
      var superLongElement = document.createElement('div');
      superLongElement.style.height = '10000px';
      superLongElement.style.width = '1px';
      body.appendChild(superLongElement);
      body.scrollTop = 700;

      // Absolutely position the picker such that the pane position doesn't need to be adjusted.
      // (1/10 of the way down the screen).
      element.style.position = 'absolute';
      element.style.top = (document.body.scrollTop + (window.innerHeight * 0.10)) + 'px';
      element.style.left = '0';
      body.appendChild(element);

      // Open the pane.
      element.querySelector('md-button').click();
      $timeout.flush();

      // Expect that the calendar pane is in the same position as the inline datepicker.
      var paneRect = controller.calendarPane.getBoundingClientRect();
      var triggerRect = controller.inputContainer.getBoundingClientRect();
      expect(paneRect.top).toBe(triggerRect.top);

      // Restore body to pre-test state.
      body.removeChild(superLongElement);
      body.removeChild(element);
    });

    it('should shink the calendar pane when it would otherwise not fit on the screen', function() {
      // Fake the window being very narrow so that the calendar pane won't fit on-screen.
      controller.$window = {innerWidth: 200, innherHeight: 800};

      // Open the calendar pane.
      controller.openCalendarPane({});

      // Expect the calendarPane to be scaled by an amount between zero and one.
      expect(controller.calendarPane.style.transform).toMatch(/scale\(0\.\d+\)/);
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

    it('should close the calendar pane on md-calendar-close', function() {
      controller.openCalendarPane({
        target: controller.inputElement
      });

      scope.$emit('md-calendar-close');
      scope.$apply();
      expect(controller.calendarPaneOpenedFrom).toBe(null);
      expect(controller.isCalendarOpen).toBe(false);
    });
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
      populateInputElement('cheese');
      expect(controller.inputContainer).toHaveClass('md-datepicker-invalid');

      controller.openCalendarPane({
        target: controller.inputElement
      });

      scope.$emit('md-calendar-change', new Date());
      expect(controller.inputContainer).not.toHaveClass('md-datepicker-invalid');
    });
  });
});
