
describe('materialCheckbox', function() {
  var CHECKED_CSS = 'material-checked';

  beforeEach(module('material.components.checkbox'));

  it('should set checked css class and aria-checked attributes', inject(function($compile, $rootScope) {
    var element = $compile('<div>' +
                             '<material-checkbox ng-model="blue">' +
                             '</material-checkbox>' +
                             '<material-checkbox ng-model="green">' +
                             '</material-checkbox>' +
                           '</div>')($rootScope);

    $rootScope.$apply(function(){
      $rootScope.blue = false;
      $rootScope.green = true;
    });

    var cbElements = element.find('material-checkbox');

    expect(cbElements.eq(0).hasClass(CHECKED_CSS)).toEqual(false);
    expect(cbElements.eq(1).hasClass(CHECKED_CSS)).toEqual(true);
    expect(cbElements.eq(0).attr('aria-checked')).toEqual('false');
    expect(cbElements.eq(1).attr('aria-checked')).toEqual('true');
    expect(cbElements.eq(0).attr('role')).toEqual('checkbox');
  }));

  it('should be disabled with disabled attr', inject(function($compile, $rootScope) {
    var element = $compile('<div>' +
                             '<material-checkbox disabled ng-model="blue">' +
                             '</material-checkbox>' +
                           '</div>')($rootScope);

    var checkbox = element.find('material-checkbox');

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
      compileInput('<material-checkbox ng-model="name" />');

      scope.$apply("name = false");
      expect(isChecked(inputElm)).toBe(false);

      scope.$apply("name = true");
      expect(isChecked(inputElm)).toBe(true);
    });


    it('should support type="checkbox" with non-standard capitalization', function() {
      compileInput('<material-checkbox ng-model="checkbox" />');

      inputElm.triggerHandler('click');
      expect(scope.checkbox).toBe(true);

      inputElm.triggerHandler('click');
      expect(scope.checkbox).toBe(false);
    });


    it('should allow custom enumeration', function() {
      compileInput('<material-checkbox ng-model="name" ng-true-value="\'y\'" ' +
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
        compileInput('<material-checkbox ng-model="value" ng-true-value="yes" />');
      }).toThrow();
    });


    it('should throw if ngFalseValue is present and not a constant expression', function() {
      expect(function() {
        compileInput('<material-checkbox ng-model="value" ng-false-value="no" />');
      }).toThrow();
    });


    it('should not throw if ngTrueValue or ngFalseValue are not present', function() {
      expect(function() {
        compileInput('<material-checkbox ng-model="value" />');
      }).not.toThrow();
    });


    it('should be required if false', function() {
      compileInput('<material-checkbox ng:model="value" required />');

      inputElm.triggerHandler('click');
      expect(isChecked(inputElm)).toBe(true);
      expect(inputElm.hasClass('ng-valid')).toBe(true);

      inputElm.triggerHandler('click');
      expect(isChecked(inputElm)).toBe(false);
      expect(inputElm.hasClass('ng-invalid')).toBe(true);
    });

  });

});
