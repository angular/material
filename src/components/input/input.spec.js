describe('md-input-container directive', function() {
  var $compile, pageScope;

  beforeEach(module('ngAria', 'material.components.input'));

  beforeEach(inject(function($injector) {
    $compile = $injector.get('$compile');

    pageScope = $injector.get('$rootScope').$new();
  }));

  function setup(attrs, isForm) {
    var container;

    var template =
        '<md-input-container>' +
          '<input ' + (attrs || '') + '>' +
          '<label></label>' +
        '</md-input-container>';

    if (isForm) {
      template = '<form>' + template + '</form>';
    }

    container = $compile(template)(pageScope);

    pageScope.$apply();
    return container;
  }

  it('should by default show error on $touched and $invalid', function() {
    var el = setup('ng-model="foo"');

    expect(el).not.toHaveClass('md-input-invalid');

    var model = el.find('input').controller('ngModel');
    model.$touched = model.$invalid = true;
    pageScope.$apply();

    expect(el).toHaveClass('md-input-invalid');

    model.$touched = model.$invalid = false;
    pageScope.$apply();
    expect(el).not.toHaveClass('md-input-invalid');
  });

  it('should show error with given md-is-error expression', function() {
    var el = $compile(
        '<md-input-container md-is-error="isError">' +
          '<input ng-model="foo">' +
        '</md-input-container>')(pageScope);

    pageScope.$apply();
    expect(el).not.toHaveClass('md-input-invalid');

    pageScope.$apply('isError = true');
    expect(el).toHaveClass('md-input-invalid');

    pageScope.$apply('isError = false');
    expect(el).not.toHaveClass('md-input-invalid');
  });

  it('should set focus class on container', function() {
    var el = setup();
    expect(el).not.toHaveClass('md-input-focused');

    el.find('input').triggerHandler('focus');
    expect(el).toHaveClass('md-input-focused');

    el.find('input').triggerHandler('blur');
    expect(el).not.toHaveClass('md-input-focused');
  });

  it('not should set focus class on container if readonly', function() {
    var el = setup('readonly');
    expect(el).not.toHaveClass('md-input-focused');

    el.find('input').triggerHandler('focus');
    expect(el).not.toHaveClass('md-input-focused');

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

  it('should set has-value class on container for ng-model input', function() {
    pageScope.value = 'test';
    var el = setup('ng-model="value"');
    expect(el).toHaveClass('md-input-has-value');

    pageScope.$apply('value = "3"');
    expect(el).toHaveClass('md-input-has-value');

    pageScope.$apply('value = null');
    expect(el).not.toHaveClass('md-input-has-value');
  });

  it('should match label to given input id', function() {
    var el = setup('id="foo"');
    expect(el.find('label').attr('for')).toBe('foo');
    expect(el.find('input').attr('id')).toBe('foo');
  });

  it('should match label to automatic input id', function() {
    var el = setup();
    expect(el.find('input').attr('id')).toBeTruthy();
    expect(el.find('label').attr('for')).toBe(el.find('input').attr('id'));
  });

  describe('md-maxlength', function() {
    function getCharCounter(el) {
      return angular.element(el[0].querySelector('.md-char-counter'));
    }

    it('should work with a constant', function() {
      var el = $compile(
          '<form name="form">' +
            '<md-input-container>' +
              '<input md-maxlength="5" ng-model="foo" name="foo">' +
            '</md-input-container>' +
          '</form>')(pageScope);

      pageScope.$apply();
      expect(pageScope.form.foo.$error['md-maxlength']).toBeFalsy();
      expect(getCharCounter(el).text()).toBe('0/5');

      pageScope.$apply('foo = "abcde"');
      expect(pageScope.form.foo.$error['md-maxlength']).toBeFalsy();
      expect(getCharCounter(el).text()).toBe('5/5');

      pageScope.$apply('foo = "abcdef"');
      el.find('input').triggerHandler('input');
      expect(pageScope.form.foo.$error['md-maxlength']).toBe(true);
      expect(getCharCounter(el).text()).toBe('6/5');

      pageScope.$apply('foo = "abc"');
      el.find('input').triggerHandler('input');
      expect(pageScope.form.foo.$error['md-maxlength']).toBeFalsy();
      expect(getCharCounter(el).text()).toBe('3/5');
    });

    it('should render correct character count when value is a number', function() {
      var template =
          '<md-input-container>' +
            '<input ng-model="item.numberValue" md-maxlength="6">' +
          '</md-input-container>';
      var element = $compile(template)(pageScope);
      pageScope.$apply();

      pageScope.item = {numberValue: 456};
      pageScope.$apply();

      expect(getCharCounter(element).text()).toBe('3/6');
    });

    it('should add and remove maxlength element & error with expression', function() {
      var el = $compile('<form name="form">' +
        ' <md-input-container>' +
        '   <input md-maxlength="max" ng-model="foo" name="foo">' +
        ' </md-input-container>' +
        '</form>')(pageScope);

      pageScope.$apply();
      expect(pageScope.form.foo.$error['md-maxlength']).toBeFalsy();
      expect(getCharCounter(el).length).toBe(0);

      pageScope.$apply('max = 5');
      pageScope.$apply('foo = "abcdef"');
      expect(pageScope.form.foo.$error['md-maxlength']).toBeTruthy();
      expect(getCharCounter(el).length).toBe(1);
      expect(getCharCounter(el).text()).toBe('6/5');

      pageScope.$apply('max = -1');
      pageScope.$apply('foo = "abcdefg"');
      expect(pageScope.form.foo.$error['md-maxlength']).toBeFalsy();
      expect(getCharCounter(el).length).toBe(0);
    });
  });

  it('should put placeholder into a label element', function() {
    var el = $compile('<md-input-container><input ng-model="foo" placeholder="some placeholder"></md-input-container>')(pageScope);
    var placeholder = el[0].querySelector('.md-placeholder');
    var label = el.find('label')[0];

    expect(el.find('input')[0].hasAttribute('placeholder')).toBe(false);
    expect(label).toBeTruthy();
    expect(label.textContent).toEqual('some placeholder');
  });

  it('should ignore placeholder when a label element is present', function() {
    var el = $compile(
      '<md-input-container>' +
      '  <label>Hello</label>' +
      '  <input ng-model="foo" placeholder="some placeholder" />' +
      '</md-input-container>'
    )(pageScope);

    var label = el.find('label')[0];

    expect(el.find('input')[0].hasAttribute('placeholder')).toBe(true);
    expect(label).toBeTruthy();
    expect(label.textContent).toEqual('Hello');
  });

  it('should put an aria-label on the input when no label is present', function() {
    var el = $compile('<form name="form">' +
      ' <md-input-container md-no-float>' +
      '   <input placeholder="baz" md-maxlength="max" ng-model="foo" name="foo">' +
      ' </md-input-container>' +
      '</form>')(pageScope);

    pageScope.$apply();

    var input = el.find('input');
    expect(input.attr('aria-label')).toBe('baz');
  });

  it('should put the container in "has value" state when input has a static value', function() {
    var scope = pageScope.$new();
    var template =
      '<md-input-container>' +
      '<label>Name</label>' +
      '<input value="Larry">' +
      '</md-input-container>';

    var element = $compile(template)(scope);
    scope.$apply();

    expect(element.hasClass('md-input-has-value')).toBe(true);
  });
});
