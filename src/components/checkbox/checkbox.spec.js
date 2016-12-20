
describe('mdCheckbox', function() {
  var CHECKED_CSS = 'md-checked';
  var INDETERMINATE_CSS = 'md-indeterminate';
  var $compile, $log, pageScope, $mdConstant;

  beforeEach(module('ngAria', 'material.components.checkbox'));

  beforeEach(inject(function($injector) {
    $compile = $injector.get('$compile');
    $log = $injector.get('$log');
    $mdConstant = $injector.get('$mdConstant');

    var $rootScope = $injector.get('$rootScope');
    pageScope = $rootScope.$new();
  }));

  function compileAndLink(template, opt_scope) {
    var element = $compile(template)(opt_scope || pageScope);
    pageScope.$apply();

    return element;
  }

  it('should warn developers they need a label', function() {
    spyOn($log, "warn");

    compileAndLink('<md-checkbox ng-model="blue"></md-checkbox>');

    expect($log.warn).toHaveBeenCalled();
  });

  it('should copy text content to aria-label', function() {
    var element = compileAndLink(
        '<div>' +
          '<md-checkbox ng-model="blue">Some text</md-checkbox>' +
        '</div>');

    var checkboxElement = element.find('md-checkbox').eq(0);
    expect(checkboxElement.attr('aria-label')).toBe('Some text');
  });

  it('should set checked css class and aria-checked attributes', function() {
    var element = compileAndLink(
        '<div>' +
          '<md-checkbox ng-model="blue"></md-checkbox>' +
          '<md-checkbox ng-model="green"></md-checkbox>' +
        '</div>');

    pageScope.$apply(function() {
      pageScope.blue = false;
      pageScope.green = true;
    });

    var checkboxElements = element.find('md-checkbox');
    var blueCheckbox = checkboxElements.eq(0);
    var greenCheckbox = checkboxElements.eq(1);

    expect(blueCheckbox.hasClass(CHECKED_CSS)).toEqual(false);
    expect(greenCheckbox.hasClass(CHECKED_CSS)).toEqual(true);

    expect(blueCheckbox.attr('aria-checked')).toEqual('false');
    expect(greenCheckbox.attr('aria-checked')).toEqual('true');

    expect(blueCheckbox.attr('role')).toEqual('checkbox');
  });

  it('should be disabled with ngDisabled attr', function() {
    var element = compileAndLink(
        '<div>' +
          '<md-checkbox ng-disabled="isDisabled" ng-model="blue"></md-checkbox>' +
        '</div>');

    var checkbox = element.find('md-checkbox');

    pageScope.isDisabled = true;
    pageScope.blue = false;
    pageScope.$apply();

    checkbox.triggerHandler('click');
    expect(pageScope.blue).toBe(false);

    pageScope.isDisabled = false;
    pageScope.$apply();

    checkbox.triggerHandler('click');
    expect(pageScope.blue).toBe(true);
  });

  it('should prevent click handlers from firing when disabled', function() {
    pageScope.toggle = jasmine.createSpy('toggle');

    var checkbox = compileAndLink(
        '<md-checkbox disabled ng-click="toggle()">On</md-checkbox>')[0];

    checkbox.click();

    expect(pageScope.toggle).not.toHaveBeenCalled();
  });

  it('should preserve existing tabindex', function() {
    var element = compileAndLink(
        '<md-checkbox ng-model="blue" tabindex="2"></md-checkbox>');

    expect(element.attr('tabindex')).toBe('2');
  });

  it('should disable with tabindex="-1" ', function() {
    var checkbox = compileAndLink(
        '<md-checkbox ng-disabled="isDisabled" ng-model="blue"></md-checkbox>');

    pageScope.isDisabled = true;
    pageScope.$apply();

    expect(checkbox.attr('tabindex')).toBe('-1');

    pageScope.isDisabled = false;
    pageScope.$apply();
    expect(checkbox.attr('tabindex')).toBe('0');
  });

  it('should not set focus state on mousedown', function() {
    var checkbox = compileAndLink(
        '<md-checkbox ng-model="blue"></md-checkbox>');

    checkbox.triggerHandler('mousedown');
    expect(checkbox[0]).not.toHaveClass('md-focused');
  });

  it('should apply focus effect with keyboard interaction', function() {
    var checkbox = compileAndLink('<md-checkbox ng-model="blue"></md-checkbox>');
    var body = angular.element(document.body);

    // Fake a keyboard interaction for the $mdInteraction service.
    body.triggerHandler('keydown');
    checkbox.triggerHandler('focus');

    expect(checkbox[0]).toHaveClass('md-focused');

    checkbox.triggerHandler('blur');
    expect(checkbox[0]).not.toHaveClass('md-focused');
  });

  it('should not apply focus effect with mouse interaction', function() {
    var checkbox = compileAndLink('<md-checkbox ng-model="blue"></md-checkbox>');
    var body = angular.element(document.body);

    // Fake a mouse interaction for the $mdInteraction service.
    body.triggerHandler('mouse');
    checkbox.triggerHandler('focus');

    expect(checkbox[0]).not.toHaveClass('md-focused');

    checkbox.triggerHandler('blur');
    expect(checkbox[0]).not.toHaveClass('md-focused');
  });

  it('should redirect focus of container to the checkbox element', function() {
    var checkbox = compileAndLink('<md-checkbox ng-model="blue"></md-checkbox>');

    document.body.appendChild(checkbox[0]);

    var container = checkbox.children().eq(0);
    expect(container[0]).toHaveClass('md-container');

    // We simulate IE11's focus bug, which always focuses an unfocusable div
    // https://connect.microsoft.com/IE/feedback/details/1028411/
    container[0].tabIndex = -1;

    container.triggerHandler('focus');

    expect(document.activeElement).toBe(checkbox[0]);

    checkbox.remove();
  });

  it('should set focus state on keyboard interaction after clicking', function() {
    var checkbox = compileAndLink('<md-checkbox ng-model="blue"></md-checkbox>');

    checkbox.triggerHandler('mousedown');
    checkbox.triggerHandler({
      type: 'keypress',
      keyCode: $mdConstant.KEY_CODE.SPACE
    });
    expect(checkbox[0]).toHaveClass('md-focused');
  });

  describe('ng core checkbox tests', function() {

    function isChecked(checkboxElement) {
      return checkboxElement.hasClass(CHECKED_CSS);
    }

    it('should format booleans', function() {
      var inputElement = compileAndLink('<md-checkbox ng-model="name"></md-checkbox>');

      pageScope.name = false;
      pageScope.$apply();
      expect(isChecked(inputElement)).toBe(false);

      pageScope.name = true;
      pageScope.$apply();
      expect(isChecked(inputElement)).toBe(true);
    });

    it('should support type="checkbox" with non-standard capitalization', function() {
      var inputElm = compileAndLink('<md-checkbox ng-model="checkbox"></md-checkbox>');

      inputElm.triggerHandler('click');
      expect(pageScope.checkbox).toBe(true);

      inputElm.triggerHandler('click');
      expect(pageScope.checkbox).toBe(false);
    });

    it('should allow custom enumeration', function() {
      var checkbox = compileAndLink(
          '<md-checkbox ng-model="name" ng-true-value="\'y\'" ng-false-value="\'n\'">');

      pageScope.name = 'y';
      pageScope.$apply();
      expect(isChecked(checkbox)).toBe(true);

      pageScope.name ='n';
      pageScope.$apply();
      expect(isChecked(checkbox)).toBe(false);

      pageScope.name = 'something else';
      pageScope.$apply();
      expect(isChecked(checkbox)).toBe(false);

      checkbox.triggerHandler('click');
      expect(pageScope.name).toEqual('y');

      checkbox.triggerHandler('click');
      expect(pageScope.name).toEqual('n');
    });

    it('should throw if ngTrueValue is present and not a constant expression', function() {
      expect(function() {
        compileAndLink('<md-checkbox ng-model="value" ng-true-value="yes"></md-checkbox>');
      }).toThrow();
    });

    it('should throw if ngFalseValue is present and not a constant expression', function() {
      expect(function() {
        compileAndLink('<md-checkbox ng-model="value" ng-false-value="no"></md-checkbox>');
      }).toThrow();
    });

    it('should not throw if ngTrueValue or ngFalseValue are not present', function() {
      expect(function() {
        compileAndLink('<md-checkbox ng-model="value"></md-checkbox>');
      }).not.toThrow();
    });

    it('should be required if false', function() {
      var checkbox = compileAndLink('<md-checkbox ng:model="value" required></md-checkbox>');

      checkbox.triggerHandler('click');
      expect(isChecked(checkbox)).toBe(true);
      expect(checkbox.hasClass('ng-valid')).toBe(true);

      checkbox.triggerHandler('click');
      expect(isChecked(checkbox)).toBe(false);
      expect(checkbox.hasClass('ng-invalid')).toBe(true);
    });

    it('properly unsets the md-checked CSS if ng-checked is undefined', function() {
      var checkbox = compileAndLink('<md-checkbox ng-checked="value"></md-checkbox>');

      expect(checkbox.hasClass(CHECKED_CSS)).toBe(false);
    });

    it('should mark the checkbox as selected on load with ng-checked', function() {
      pageScope.isChecked = function() { return true; };

      var checkbox = compileAndLink('<md-checkbox ng-model="checked" ng-checked="isChecked()"></md-checkbox>');

      expect(checkbox).toHaveClass(CHECKED_CSS);
    });

    describe('with the md-indeterminate attribute', function() {

      it('should set md-indeterminate attr to true by default', function() {
        var checkbox = compileAndLink('<md-checkbox md-indeterminate></md-checkbox>');

        expect(checkbox).toHaveClass(INDETERMINATE_CSS);
      });

      it('should be set "md-indeterminate" class according to a passed in function', function() {
        pageScope.isIndeterminate = function() { return true; };

        var checkbox = compileAndLink('<md-checkbox md-indeterminate="isIndeterminate()"></md-checkbox>');

        expect(checkbox).toHaveClass(INDETERMINATE_CSS);
      });

      it('should set aria-checked attr to "mixed"', function() {
        var checkbox = compileAndLink('<md-checkbox md-indeterminate></md-checkbox>');

        expect(checkbox.attr('aria-checked')).toEqual('mixed');
      });

      it('should never have both the "md-indeterminate" and "md-checked" classes at the same time', function() {
        pageScope.isChecked = function() { return true; };

        var checkbox = compileAndLink('<md-checkbox md-indeterminate ng-checked="isChecked()"></md-checkbox>');

        expect(checkbox).toHaveClass(INDETERMINATE_CSS);
        expect(checkbox).not.toHaveClass(CHECKED_CSS);
      });

      it('should change from the indeterminate to checked state correctly', function() {
        var checked = false;
        pageScope.isChecked = function() { return checked; };
        pageScope.isIndet = function() { return !checked; };

        var checkbox = compileAndLink('<md-checkbox md-indeterminate="isIndet()" ng-checked="isChecked()"></md-checkbox>');

        expect(checkbox).toHaveClass(INDETERMINATE_CSS);
        expect(checkbox).not.toHaveClass(CHECKED_CSS);

        checked = true;
        pageScope.$apply();

        expect(checkbox).not.toHaveClass(INDETERMINATE_CSS);
        expect(checkbox).toHaveClass(CHECKED_CSS);
      });

      it('should mark the checkbox as selected, if the model is true and "md-indeterminate" is false', function() {
        pageScope.checked = true;
        var checkbox = compileAndLink('<md-checkbox ng-model="checked" md-indeterminate="false"></md-checkbox>');

        expect(checkbox).toHaveClass(CHECKED_CSS);
        expect(checkbox).not.toHaveClass(INDETERMINATE_CSS);
      });

    });
  });
});
