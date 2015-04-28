
describe('mdCheckbox', function() {
  var CHECKED_CSS = 'md-checked';
  var $compile, $rootScope;

  beforeEach(module('ngAria'));
  beforeEach(module('material.components.checkbox'));

  beforeEach( inject(function(_$compile_, _$rootScope_){
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  function buildInstance (template, scope){
    var element = $compile(template)(scope || $rootScope);
    $rootScope.$apply();

    return element;
  }

  it('should warn developers they need a label', inject(function($compile, $rootScope, $log){
    spyOn($log, "warn");

    var element = buildInstance('<div>' +
                             '<md-checkbox ng-model="blue">' +
                             '</md-checkbox>' +
                           '</div>');

    expect($log.warn).toHaveBeenCalled();
  }));

  it('should copy text content to aria-label', inject(function($compile, $rootScope){
    var element = buildInstance('<div>' +
                             '<md-checkbox ng-model="blue">' +
                             'Some text' +
                             '</md-checkbox>' +
                           '</div>');

    var cbElements = element.find('md-checkbox');
    expect(cbElements.eq(0).attr('aria-label')).toBe('Some text');
  }));

  it('should set checked css class and aria-checked attributes', inject(function($compile, $rootScope) {
    var element = buildInstance('<div>' +
                             '<md-checkbox ng-model="blue">' +
                             '</md-checkbox>' +
                             '<md-checkbox ng-model="green">' +
                             '</md-checkbox>' +
                           '</div>');

    $rootScope.$apply(function(){
      $rootScope.blue = false;
      $rootScope.green = true;
    });

    var cbElements = element.find('md-checkbox');

    expect(cbElements.eq(0).hasClass(CHECKED_CSS)).toEqual(false);
    expect(cbElements.eq(1).hasClass(CHECKED_CSS)).toEqual(true);
    expect(cbElements.eq(0).attr('aria-checked')).toEqual('false');
    expect(cbElements.eq(1).attr('aria-checked')).toEqual('true');
    expect(cbElements.eq(0).attr('role')).toEqual('checkbox');
  }));

  it('should be disabled with ngDisabled attr', inject(function($compile, $rootScope) {
    var element = buildInstance('<div>' +
                             '<md-checkbox ng-disabled="isDisabled" ng-model="blue">' +
                             '</md-checkbox>' +
                           '</div>');

    var checkbox = element.find('md-checkbox');

    $rootScope.$apply('isDisabled = true');
    $rootScope.$apply('blue = false');

    checkbox.triggerHandler('click');
    expect($rootScope.blue).toBe(false);

    $rootScope.$apply('isDisabled = false');

    checkbox.triggerHandler('click');
    expect($rootScope.blue).toBe(true);
  }));

  it('should preserve existing tabindex', inject(function($compile, $rootScope) {
    var element = buildInstance('<div>' +
                             '<md-checkbox ng-model="blue" tabindex="2">' +
                             '</md-checkbox>' +
                           '</div>');

    var checkbox = element.find('md-checkbox');
    expect(checkbox.attr('tabindex')).toBe('2');
  }));

  it('should disable with tabindex=-1', inject(function($compile, $rootScope) {
    var element = buildInstance('<div>' +
                             '<md-checkbox ng-disabled="isDisabled" ng-model="blue">' +
                             '</md-checkbox>' +
                           '</div>');

    var checkbox = element.find('md-checkbox');

    $rootScope.$apply('isDisabled = true');
    expect(checkbox.attr('tabindex')).toBe('-1');

    $rootScope.$apply('isDisabled = false');
    expect(checkbox.attr('tabindex')).toBe('0');
  }));

  it('should not set focus state on mousedown', inject(function($compile, $rootScope) {
    var checkbox = buildInstance('<md-checkbox ng-model="blue">',$rootScope.$new());

    checkbox.triggerHandler('mousedown');
    expect(checkbox[0]).not.toHaveClass('md-focused');
  }));

  it('should set focus state on focus and remove on blur', inject(function($compile, $rootScope) {
    var checkbox = buildInstance('<md-checkbox ng-model="blue">',$rootScope.$new());

    checkbox.triggerHandler('focus');
    expect(checkbox[0]).toHaveClass('md-focused');
    checkbox.triggerHandler('blur');
    expect(checkbox[0]).not.toHaveClass('md-focused');
  }));

  it('should set focus state on keyboard interaction after clicking', inject(function($compile, $rootScope, $mdConstant) {
    var checkbox = buildInstance('<md-checkbox ng-model="blue">',$rootScope.$new());

    checkbox.triggerHandler('mousedown');
    checkbox.triggerHandler({
      type: 'keypress',
      keyCode: $mdConstant.KEY_CODE.SPACE
    });
    expect(checkbox[0]).toHaveClass('md-focused');
  }));

  describe('ng core checkbox tests', function() {

    function isChecked(cbEl) {
      return cbEl.hasClass(CHECKED_CSS);
    }

    it('should format booleans', function() {
      var inputElm = buildInstance('<md-checkbox ng-model="name" />');

      $rootScope.$apply("name = false");
      expect(isChecked(inputElm)).toBe(false);

      $rootScope.$apply("name = true");
      expect(isChecked(inputElm)).toBe(true);
    });


    it('should support type="checkbox" with non-standard capitalization', function() {
      var inputElm = buildInstance('<md-checkbox ng-model="checkbox" />');

      inputElm.triggerHandler('click');
      expect($rootScope.checkbox).toBe(true);

      inputElm.triggerHandler('click');
      expect($rootScope.checkbox).toBe(false);
    });


    it('should allow custom enumeration', function() {
      var inputElm = buildInstance('<md-checkbox ng-model="name" ng-true-value="\'y\'" ' +
          'ng-false-value="\'n\'">');

      $rootScope.$apply("name = 'y'");
      expect(isChecked(inputElm)).toBe(true);

      $rootScope.$apply("name = 'n'");
      expect(isChecked(inputElm)).toBe(false);

      $rootScope.$apply("name = 'something else'");
      expect(isChecked(inputElm)).toBe(false);

      inputElm.triggerHandler('click');
      expect($rootScope.name).toEqual('y');

      inputElm.triggerHandler('click');
      expect($rootScope.name).toEqual('n');
    });


    it('should throw if ngTrueValue is present and not a constant expression', function() {
      expect(function() {
        buildInstance('<md-checkbox ng-model="value" ng-true-value="yes" />');
      }).toThrow();
    });


    it('should throw if ngFalseValue is present and not a constant expression', function() {
      expect(function() {
        buildInstance('<md-checkbox ng-model="value" ng-false-value="no" />');
      }).toThrow();
    });


    it('should not throw if ngTrueValue or ngFalseValue are not present', function() {
      expect(function() {
        buildInstance('<md-checkbox ng-model="value" />');
      }).not.toThrow();
    });


    it('should be required if false', function() {
      var inputElm = buildInstance('<md-checkbox ng:model="value" required />');

      inputElm.triggerHandler('click');
      expect(isChecked(inputElm)).toBe(true);
      expect(inputElm.hasClass('ng-valid')).toBe(true);

      inputElm.triggerHandler('click');
      expect(isChecked(inputElm)).toBe(false);
      expect(inputElm.hasClass('ng-invalid')).toBe(true);
    });

  });

});
