
describe('md-datepicker', function() {
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
         'ng-focus="focusHandler()" ' +
         'ng-blur="blurHandler()" ' +
         'ng-required="isRequired" ' +
         'ng-disabled="isDisabled">' +
    '</md-datepicker>';

  beforeEach(module('material.components.datepicker', 'material.components.input', 'ngAnimateMock'));

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

  afterEach(function() {
    controller.isAttached && controller.closeCalendarPane();
    pageScope.$destroy();
    ngElement.remove();
  });

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

  it('should set the element type as "date"', function() {
    expect(ngElement.attr('type')).toBe('date');
  });

  it('should pass the timezone to the formatting function', function() {
    spyOn(controller.locale, 'formatDate');

    createDatepickerInstance('<md-datepicker ng-model="myDate" ' +
      'ng-model-options="{ timezone: \'utc\' }"></md-datepicker>');

    expect(controller.locale.formatDate).toHaveBeenCalledWith(pageScope.myDate, 'utc');
  });

  it('should allow for the locale to be overwritten on a specific element', function() {
    pageScope.myDate = new Date(2015, SEP, 1);

    pageScope.customLocale = {
      formatDate: function() {
        return 'September First';
      }
    };

    spyOn(pageScope.customLocale, 'formatDate').and.callThrough();

    createDatepickerInstance(
      '<md-datepicker ng-model="myDate" md-date-locale="customLocale"></md-datepicker>'
    );

    expect(pageScope.customLocale.formatDate).toHaveBeenCalled();
    expect(ngElement.find('input').val()).toBe('September First');
  });

  describe('ngMessages support', function() {
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

      it('should add the invalid class when the form is submitted', function() {
        // This needs to be recompiled, in order to reproduce conditions where a form is
        // submitted, without the datepicker having being touched (usually it has it's value
        // set to `myDate` by default).
        ngElement && ngElement.remove();
        pageScope.myDate = null;
        pageScope.isRequired = true;

        createDatepickerInstance('<form>' + DATEPICKER_TEMPLATE + '</form>');

        var formCtrl = ngElement.controller('form');
        var inputContainer = ngElement.controller('mdDatepicker').inputContainer;

        expect(formCtrl.$invalid).toBe(true);
        expect(formCtrl.$submitted).toBe(false);
        expect(inputContainer).not.toHaveClass('md-datepicker-invalid');

        pageScope.$apply(function() {
          formCtrl.$setSubmitted(true);
        });

        expect(formCtrl.$submitted).toBe(true);
        expect(inputContainer).toHaveClass('md-datepicker-invalid');
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

    it('should toggle the invalid class when an external value causes the error state to change', function() {
      pageScope.isRequired = true;
      populateInputElement('');
      expect(controller.inputContainer).toHaveClass('md-datepicker-invalid');

      pageScope.$apply(function() {
        pageScope.isRequired = false;
      });
      expect(controller.inputContainer).not.toHaveClass('md-datepicker-invalid');
    });

    it('should not update the model when value is not enabled', function() {
      pageScope.dateFilter = function(date) {
        return date.getDay() === 1;
      };
      pageScope.$apply();

      populateInputElement('5/30/2014');
      expect(controller.ngModelCtrl.$modelValue).toEqual(initialDate);
    });

    it('should become touched from blurring closing the pane', function() {
      populateInputElement('17/1/2015');

      controller.openCalendarPane({
        target: controller.inputElement
      });
      controller.closeCalendarPane();

      expect(controller.ngModelCtrl.$touched).toBe(true);
    });

    it('should become touched from blurring the input', function() {
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

    it('should work with ngModelOptions.updateOn', function() {
      var expectedDate = new Date(2015, JAN, 17);

      createDatepickerInstance('<md-datepicker ng-model="myDate" ' +
        'ng-model-options="{ updateOn: \'blur\' }"></md-datepicker>');

      populateInputElement('01/17/2015');
      angular.element(element.querySelector('input')).triggerHandler('blur');

      expect(pageScope.myDate).toEqual(expectedDate);
    });
  });

  describe('floating calendar pane', function() {
    it('should open and close the floating calendar pane element', function() {
      // We can asset that the calendarPane is in the DOM by checking if it has a height.
      expect(controller.calendarPane.offsetHeight).toBe(0);

      element.querySelector('md-button').click();
      $timeout.flush();

      expect(controller.calendarPane.offsetHeight).toBeGreaterThan(0);
      expect(controller.inputMask[0].style.left).toBeTruthy();

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

    it('should open and close the floating calendar pane element via an expression on the scope', function() {
      pageScope.isOpen = false;
      createDatepickerInstance('<md-datepicker ng-model="myDate" md-is-open="isOpen"></md-datepicker>');

      expect(controller.calendarPane.offsetHeight).toBe(0);
      expect(controller.isCalendarOpen).toBe(false);

      pageScope.$apply(function() {
        pageScope.isOpen = true;
      });

      // Open the calendar externally
      expect(controller.calendarPane.offsetHeight).toBeGreaterThan(0);
      expect(controller.isCalendarOpen).toBe(true);

      // Close the calendar via the datepicker
      controller.$scope.$apply(function() {
        controller.closeCalendarPane();
      });
      expect(pageScope.isOpen).toBe(false);
      expect(controller.isCalendarOpen).toBe(false);
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

      // We expect the offset to be close to the exact height, because on IE there are some deviations.
      expect(controller.topMargin).toBeGreaterThan(0);
      expect(paneRect.top).toBeCloseTo(triggerRect.top - controller.topMargin, 0.5);

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

    it('should re-enable scrolling probably', function() {
      var maskLength = getMaskLength();

      controller.openCalendarPane({
        target: controller.inputElement
      });

      expect(getMaskLength()).toBe(maskLength + 1);

      controller.closeCalendarPane();

      expect(getMaskLength()).toBe(maskLength);

      controller.openCalendarPane({
        target: controller.inputElement
      });

      expect(getMaskLength()).toBe(maskLength + 1);

      // Trigger a scope destruction, like when a route changes.
      scope.$destroy();

      expect(getMaskLength()).toBe(maskLength);

      function getMaskLength() {
        return document.body.querySelectorAll('.md-scroll-mask').length;
      }
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

      expect(controller.inputElement.value).toEqual('6/1/2015');
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

  describe('mdOpenOnFocus attribute', function() {
    beforeEach(function() {
      createDatepickerInstance('<md-datepicker ng-model="myDate" md-open-on-focus></md-datepicker>');
    });

    it('should be able open the calendar when the input is focused', function() {
      controller.ngInputElement.triggerHandler('focus');
      expect(controller.isCalendarOpen).toBe(true);
    });

    it('should not reopen a closed calendar when the window is refocused', inject(function($timeout) {
      // Focus the input initially to open the calendar.
      // Note that the element needs to be appended to the DOM so it can be set as the activeElement.
      document.body.appendChild(element);
      controller.inputElement.focus();
      controller.ngInputElement.triggerHandler('focus');

      expect(document.activeElement).toBe(controller.inputElement);
      expect(controller.isCalendarOpen).toBe(true);

      // Close the calendar, but make sure that the input is still focused.
      controller.closeCalendarPane();
      $timeout.flush();
      expect(document.activeElement).toBe(controller.inputElement);
      expect(controller.isCalendarOpen).toBe(false);

      // Simulate the user tabbing away.
      angular.element(window).triggerHandler('blur');
      expect(controller.inputFocusedOnWindowBlur).toBe(true);

      // Try opening the calendar again.
      controller.ngInputElement.triggerHandler('focus');
      expect(controller.isCalendarOpen).toBe(false);

      // Clean up.
      document.body.removeChild(element);
    }));
  });

  describe('hiding the icons', function() {
    var calendarSelector = '.md-datepicker-button .md-datepicker-calendar-icon';
    var triangleSelector = '.md-datepicker-triangle-button';

    it('should be able to hide the calendar icon', function() {
      createDatepickerInstance('<md-datepicker ng-model="myDate" md-hide-icons="calendar"></md-datepicker>');
      expect(element.querySelector(calendarSelector)).toBeNull();
    });

    it('should be able to hide the triangle icon', function() {
      createDatepickerInstance('<md-datepicker ng-model="myDate" md-hide-icons="triangle"></md-datepicker>');
      expect(element.querySelector(triangleSelector)).toBeNull();
    });

    it('should be able to hide all icons', function() {
      createDatepickerInstance('<md-datepicker ng-model="myDate" md-hide-icons="all"></md-datepicker>');
      expect(element.querySelector(calendarSelector)).toBeNull();
      expect(element.querySelector(triangleSelector)).toBeNull();
    });
  });

  describe('md-input-container integration', function() {
    var element;

    it('should register the element with the mdInputContainer controller', function() {
      compileElement();

      var inputContainer = element.controller('mdInputContainer');

      expect(inputContainer.input[0]).toBe(element[0].querySelector('md-datepicker'));
      expect(inputContainer.element).toHaveClass('_md-datepicker-floating-label');
    });

    it('should notify the input container that the element has a placeholder', function() {
      compileElement('md-placeholder="Enter a date"');
      expect(element).toHaveClass('md-input-has-placeholder');
    });

    it('should add the asterisk if the element is required', function() {
      compileElement('ng-required="isRequired"');
      var label = element.find('label');

      expect(label).not.toHaveClass('md-required');
      pageScope.$apply('isRequired = true');
      expect(label).toHaveClass('md-required');
    });

    it('should not add the asterisk if the element has md-no-asterisk', function() {
      compileElement('required md-no-asterisk');
      expect(element.find('label')).not.toHaveClass('md-required');
    });

    it('should pass the error state to the input container', inject(function($material) {
      compileElement('required');

      var ngModelCtrl = element.find('md-datepicker').controller('ngModel');
      var invalidClass = 'md-input-invalid';

      expect(ngModelCtrl.$valid).toBe(true);
      expect(element).not.toHaveClass(invalidClass);

      ngModelCtrl.$setViewValue(null);
      ngModelCtrl.$setTouched(true);
      $material.flushOutstandingAnimations();

      expect(ngModelCtrl.$valid).toBe(false);
      expect(element).toHaveClass(invalidClass);
    }));

    afterEach(function() {
      element.remove();
    });

    function compileElement(attrs) {
      var template =
        '<md-input-container>' +
          '<label>Enter a date</label>' +
          '<md-datepicker ng-model="myDate" ' + attrs + '></md-datepicker>' +
        '</md-input-container>';

      element = $compile(template)(pageScope);
      pageScope.$digest();
    }
  });

  describe('ngFocus support', function() {
    beforeEach(function() {
      pageScope.focusHandler = jasmine.createSpy('ng-focus handler');
    });

    it('should trigger the ngFocus handler when the input is focused', function() {
      controller.ngInputElement.triggerHandler('focus');
      expect(pageScope.focusHandler).toHaveBeenCalled();
    });

    it('should trigger the ngFocus handler when the calendar is opened', function() {
      controller.openCalendarPane({});
      expect(pageScope.focusHandler).toHaveBeenCalled();
    });

    it('should only trigger once when mdOpenOnFocus is set', function() {
      createDatepickerInstance('<md-datepicker ng-model="myDate" ng-focus="focusHandler()" ' +
        'md-open-on-focus></md-datepicker>');

      controller.ngInputElement.triggerHandler('focus');
      expect(pageScope.focusHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('ngBlur support', function() {
    beforeEach(function() {
      pageScope.blurHandler = jasmine.createSpy('ng-blur handler');
    });

    it('should trigger the ngBlur handler when the input is blurred', function() {
      controller.ngInputElement.triggerHandler('blur');
      expect(pageScope.blurHandler).toHaveBeenCalled();
    });

    it('should trigger the ngBlur handler when the calendar is closed', function() {
      controller.openCalendarPane({
        target: controller.ngInputElement
      });
      controller.closeCalendarPane();
      expect(pageScope.blurHandler).toHaveBeenCalled();
    });

    it('should only trigger once when mdOpenOnFocus is set', function() {
      createDatepickerInstance('<md-datepicker ng-model="myDate" ng-blur="blurHandler()" ' +
        'md-open-on-focus></md-datepicker>');

      controller.ngInputElement.triggerHandler('focus');
      controller.closeCalendarPane();
      expect(pageScope.blurHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', function() {
    it('should forward the aria-label to the generated input', function() {
      ngElement && ngElement.remove();
      createDatepickerInstance('<md-datepicker ng-model="myDate" aria-label="Enter a date"></md-datepicker>');
      expect(controller.ngInputElement.attr('aria-label')).toBe('Enter a date');
    });

    it('should set the aria-owns value, corresponding to the id of the calendar pane', function() {
      var ariaAttr = ngElement.attr('aria-owns');

      expect(ariaAttr).toBeTruthy();
      expect(controller.calendarPane.id).toBe(ariaAttr);
    });

    it('should toggle the aria-expanded value', function() {
      expect(controller.ngInputElement.attr('aria-expanded')).toBe('false');

      controller.openCalendarPane({
        target: controller.inputElement
      });
      scope.$apply();

      expect(controller.ngInputElement.attr('aria-expanded')).toBe('true');

      controller.closeCalendarPane();
      scope.$apply();

      expect(controller.ngInputElement.attr('aria-expanded')).toBe('false');
    });

    describe('tabindex behavior', function() {
      beforeEach(function() {
        ngElement && ngElement.remove();
      });

      it('should remove the datepicker from the tab order, if no tabindex is specified', function() {
        createDatepickerInstance('<md-datepicker ng-model="myDate"></md-datepicker>');
        expect(ngElement.attr('tabindex')).toBe('-1');
      });

      it('should forward the tabindex to the input', function() {
        createDatepickerInstance('<md-datepicker ng-model="myDate" tabindex="1"></md-datepicker>');
        expect(ngElement.attr('tabindex')).toBeFalsy();
        expect(controller.ngInputElement.attr('tabindex')).toBe('1');
      });
    });

  });

});
