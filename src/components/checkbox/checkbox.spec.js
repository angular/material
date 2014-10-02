
describe('mdCheckbox', function() {
  var CHECKED_CSS = 'md-checked';

  beforeEach(module('material.components.checkbox'));
  beforeEach(module('ngAria'));
  beforeEach(TestUtil.mockRaf);

  it('should warn developers they need a label', inject(function($compile, $rootScope, $log){
    spyOn($log, "warn");

    var element = $compile('<div>' +
                             '<md-checkbox ng-model="blue">' +
                             '</md-checkbox>' +
                           '</div>')($rootScope);

    expect($log.warn).toHaveBeenCalled();
  }));

  it('should copy text content to aria-label', inject(function($compile, $rootScope){
    var element = $compile('<div>' +
                             '<md-checkbox ng-model="blue">' +
                             'Some text' +
                             '</md-checkbox>' +
                           '</div>')($rootScope);

    var cbElements = element.find('md-checkbox');
    expect(cbElements.eq(0).attr('aria-label')).toBe('Some text');
  }));

  it('should set checked css class and aria-checked attributes', inject(function($compile, $rootScope) {
    var element = $compile('<div>' +
                             '<md-checkbox ng-model="blue">' +
                             '</md-checkbox>' +
                             '<md-checkbox ng-model="green">' +
                             '</md-checkbox>' +
                           '</div>')($rootScope);

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

  it('should be disabled with disabled attr', inject(function($compile, $rootScope) {
    var element = $compile('<div>' +
                             '<md-checkbox disabled ng-model="blue">' +
                             '</md-checkbox>' +
                           '</div>')($rootScope);

    var checkbox = element.find('md-checkbox');

    $rootScope.$apply('blue = false');

    checkbox.triggerHandler('click');
    expect($rootScope.blue).toBe(false);

    checkbox.removeAttr('disabled');

    checkbox.triggerHandler('click');
    expect($rootScope.blue).toBe(true);


  }));

  describe('ng core checkbox tests', function() {

    var inputElm;
    var scope;
    var $compile;

    beforeEach(inject(function(_$compile_, _$rootScope_) {
      scope = _$rootScope_;
      $compile = _$compile_;
    }));

    function compileInput(html) {
      inputElm = $compile(html)(scope);
    }

    function isChecked(cbEl) {
      return cbEl.hasClass(CHECKED_CSS);
    }

    it('should format booleans', function() {
      compileInput('<md-checkbox ng-model="name" />');

      scope.$apply("name = false");
      expect(isChecked(inputElm)).toBe(false);

      scope.$apply("name = true");
      expect(isChecked(inputElm)).toBe(true);
    });


    it('should support type="checkbox" with non-standard capitalization', function() {
      compileInput('<md-checkbox ng-model="checkbox" />');

      inputElm.triggerHandler('click');
      expect(scope.checkbox).toBe(true);

      inputElm.triggerHandler('click');
      expect(scope.checkbox).toBe(false);
    });


    it('should allow custom enumeration', function() {
      compileInput('<md-checkbox ng-model="name" ng-true-value="\'y\'" ' +
          'ng-false-value="\'n\'">');

      scope.$apply("name = 'y'");
      expect(isChecked(inputElm)).toBe(true);

      scope.$apply("name = 'n'");
      expect(isChecked(inputElm)).toBe(false);

      scope.$apply("name = 'something else'");
      expect(isChecked(inputElm)).toBe(false);

      inputElm.triggerHandler('click');
      expect(scope.name).toEqual('y');

      inputElm.triggerHandler('click');
      expect(scope.name).toEqual('n');
    });


    it('should throw if ngTrueValue is present and not a constant expression', function() {
      expect(function() {
        compileInput('<md-checkbox ng-model="value" ng-true-value="yes" />');
      }).toThrow();
    });


    it('should throw if ngFalseValue is present and not a constant expression', function() {
      expect(function() {
        compileInput('<md-checkbox ng-model="value" ng-false-value="no" />');
      }).toThrow();
    });


    it('should not throw if ngTrueValue or ngFalseValue are not present', function() {
      expect(function() {
        compileInput('<md-checkbox ng-model="value" />');
      }).not.toThrow();
    });


    it('should be required if false', function() {
      compileInput('<md-checkbox ng:model="value" required />');

      inputElm.triggerHandler('click');
      expect(isChecked(inputElm)).toBe(true);
      expect(inputElm.hasClass('ng-valid')).toBe(true);

      inputElm.triggerHandler('click');
      expect(isChecked(inputElm)).toBe(false);
      expect(inputElm.hasClass('ng-invalid')).toBe(true);
    });

  });

});
