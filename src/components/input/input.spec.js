describe('md-input-container directive', function() {
  beforeEach(module('material.components.input'));

  function setup(attrs, isForm) {
    var container;
    inject(function($rootScope, $compile) {
      container = $compile((isForm ? '<form>' : '') + 
          '<md-input-container><input ' +(attrs||'')+ '><label></label></md-input-container>' +
          (isForm ? '<form>' : ''))($rootScope);
      $rootScope.$apply();
    });
    return container;
  }

  it('should set focus class on container', function() {
    var el = setup();
    expect(el).not.toHaveClass('md-input-focused');

    el.find('input').triggerHandler('focus');
    expect(el).toHaveClass('md-input-focused');

    el.find('input').triggerHandler('blur');
    expect(el).not.toHaveClass('md-input-focused');
  });

  it('should set has-value class on container for non-ng-model input', function() {
    var el = setup();
    expect(el).not.toHaveClass('md-input-has-value');

    el.find('input').val('123').triggerHandler('input');
    expect(el).toHaveClass('md-input-has-value');

    el.find('input').val('').triggerHandler('input');
    expect(el).not.toHaveClass('md-input-has-value');
  });

  it('should set has-value class on container for ng-model input', inject(function($rootScope) {
    $rootScope.value = 'test';
    var el = setup('ng-model="$root.value"');
    expect(el).toHaveClass('md-input-has-value');

    $rootScope.$apply('value = "3"');
    expect(el).toHaveClass('md-input-has-value');

    $rootScope.$apply('value = null');
    expect(el).not.toHaveClass('md-input-has-value');
  }));

  it('should match label to given input id', inject(function($rootScope) {
    var el = setup('id="foo"');
    expect(el.find('label').attr('for')).toBe('foo');
    expect(el.find('input').attr('id')).toBe('foo');
  }));

  it('should match label to automatic input id', inject(function($rootScope) {
    var el = setup();
    expect(el.find('input').attr('id')).toBeTruthy();
    expect(el.find('label').attr('for')).toBe(el.find('input').attr('id'));
  }));

  describe('md-maxlength', function() {
    function getCharCounter(el) {
      return angular.element(el[0].querySelector('.md-char-counter'));
    }

    it('should work with a constant', inject(function($rootScope, $compile) {
      var el = $compile('<form name="form">' +
                          '<md-input-container>' +
                            '<input md-maxlength="5" ng-model="foo" name="foo">' +
                          '</md-input-container>' +
                        '</form>')($rootScope);
      $rootScope.$apply();
      expect($rootScope.form.foo.$error['md-maxlength']).toBeFalsy();
      expect(getCharCounter(el).text()).toBe('0/5');

      $rootScope.$apply('foo = "abcde"');
      expect($rootScope.form.foo.$error['md-maxlength']).toBeFalsy();
      expect(getCharCounter(el).text()).toBe('5/5');

      $rootScope.$apply('foo = "abcdef"');
      el.find('input').triggerHandler('input');
      expect($rootScope.form.foo.$error['md-maxlength']).toBe(true);
      expect(getCharCounter(el).text()).toBe('6/5');

      $rootScope.$apply('foo = "abc"');
      el.find('input').triggerHandler('input');
      expect($rootScope.form.foo.$error['md-maxlength']).toBeFalsy();
      expect(getCharCounter(el).text()).toBe('3/5');
    }));

    it('should add and remove maxlength element & error with expression', inject(function($rootScope, $compile) {
      var el = $compile('<form name="form">' +
                          '<md-input-container>' +
                            '<input md-maxlength="max" ng-model="foo" name="foo">' +
                          '</md-input-container>' +
                        '</form>')($rootScope);

      $rootScope.$apply();
      expect($rootScope.form.foo.$error['md-maxlength']).toBeFalsy();
      expect(getCharCounter(el).length).toBe(0);

      $rootScope.$apply('max = 5');
      $rootScope.$apply('foo = "abcdef"');
      expect($rootScope.form.foo.$error['md-maxlength']).toBeTruthy();
      expect(getCharCounter(el).length).toBe(1);
      expect(getCharCounter(el).text()).toBe('6/5');

      $rootScope.$apply('max = -1');
      $rootScope.$apply('foo = "abcdefg"');
      expect($rootScope.form.foo.$error['md-maxlength']).toBeFalsy();
      expect(getCharCounter(el).length).toBe(0);
    }));
  });
});
