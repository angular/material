describe('md-input-container directive', function() {
  var $rootScope, $compile, $timeout, pageScope;

  beforeEach(module('ngAria', 'material.components.input'));

  beforeEach(inject(function($injector) {
    $compile = $injector.get('$compile');

    pageScope = $injector.get('$rootScope').$new();
  }));

  beforeEach(inject(function($injector) {
    $rootScope = $injector.get('$rootScope');
    $compile = $injector.get('$compile');
    $timeout = $injector.get('$timeout');
  }));

  function setup(attrs, isForm) {
    var container;

    var template =
        '<md-input-container>' +
          '<label></label>' +
          '<input ' + (attrs || '') + '>' +
        '</md-input-container>';

    if (isForm) {
      template = '<form>' + template + '</form>';
    }

    container = $compile(template)(pageScope);

    pageScope.$apply();
    return container;
  }

  function compile(template) {
    var container;

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

  it('should show error on $submitted and $invalid', function() {
    var el = setup('ng-model="foo"', true);

    expect(el.find('md-input-container')).not.toHaveClass('md-input-invalid');

    var model = el.find('input').controller('ngModel');
    model.$invalid = true;

    var form = el.controller('form');
    form.$submitted = true;
    pageScope.$apply();

    expect(el.find('md-input-container')).toHaveClass('md-input-invalid');
  });

  it('should show error on $submitted and $invalid with nested forms', function() {
    var template =
      '<form>' +
      '<div ng-form>' +
      '<md-input-container>' +
      '<input ng-model="foo">' +
      '<label></label>' +
      '</md-input-container>' +
      '</div>' +
      '</form>';

    var parentForm = $compile(template)(pageScope);
    pageScope.$apply();

    expect(parentForm.find('md-input-container')).not.toHaveClass('md-input-invalid');

    var model = parentForm.find('input').controller('ngModel');
    model.$invalid = true;

    var form = parentForm.controller('form');
    form.$submitted = true;
    pageScope.$apply();

    expect(parentForm.find('md-input-container')).toHaveClass('md-input-invalid');
  });

  it('should not show error on $invalid and not $submitted', function() {
    var el = setup('ng-model="foo"', true);

    expect(el.find('md-input-container')).not.toHaveClass('md-input-invalid');

    var model = el.find('input').controller('ngModel');
    model.$invalid = true;

    pageScope.$apply();

    expect(el.find('md-input-container')).not.toHaveClass('md-input-invalid');
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

  it('should append an asterisk to the required label', function() {
    var el = setup('required');
    var label = el.find('label');

    expect(label).toHaveClass('md-required');
  });

  it('should not show asterisk on required label if disabled', function() {
    var el = setup('md-no-asterisk');
    var ctrl = el.controller('mdInputContainer');

    expect(ctrl.label).not.toHaveClass('md-required');
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

      // Flush any pending $mdUtil.nextTick calls
      $timeout.flush();

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


      // Flush any pending $mdUtil.nextTick calls
      $timeout.flush();

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

      // Flush any pending $mdUtil.nextTick calls
      $timeout.flush();

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

  it('should not add the md-input-has-placeholder class when the placeholder is transformed into a label', inject(function($rootScope, $compile) {
    var el = $compile(
      '<md-input-container><input ng-model="foo" placeholder="some placeholder"></md-input-container>'
    )($rootScope);

    expect(el.hasClass('md-input-has-placeholder')).toBe(false);
  }));


  it('should add the md-input-has-placeholder class when both the placeholder and label are provided', inject(function($rootScope, $compile) {
    var el = $compile(
      '<md-input-container>' +
      '  <label>Hello</label>' +
      '  <input ng-model="foo" placeholder="some placeholder" />' +
      '</md-input-container>'
    )($rootScope);

    expect(el.hasClass('md-input-has-placeholder')).toBe(true);
  }));

  it('should put placeholder into a label element', function() {
    var el = $compile('<md-input-container><input ng-model="foo" placeholder="some placeholder"></md-input-container>')(pageScope);
    var placeholder = el[0].querySelector('.md-placeholder');
    var label = el.find('label')[0];

    expect(el.find('input')[0].hasAttribute('placeholder')).toBe(false);
    expect(label).toBeTruthy();
    expect(label.textContent).toEqual('some placeholder');
  });

  it('should ignore placeholder when a label element is present', inject(function($rootScope, $compile) {
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
  }));

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

  it('adds the md-auto-hide class to messages without a visiblity directive', inject(function() {
    var el = compile(
      '<md-input-container><input ng-model="foo">' +
      '  <div ng-messages></div>' +
      '</md-input-container>'
    );

    expect(el[0].querySelector("[ng-messages]").classList.contains('md-auto-hide')).toBe(true);
  }));

  it('does not add the md-auto-hide class with md-auto-hide="false" on the messages', inject(function() {
    var el = compile(
      '<md-input-container><input ng-model="foo">' +
      '  <div ng-messages md-auto-hide="false">Test Message</div>' +
      '</md-input-container>'
    );

    expect(el[0].querySelector("[ng-messages]").classList.contains('md-auto-hide')).toBe(false);
  }));

  var visibilityDirectives = ['ng-if', 'ng-show', 'ng-hide'];
  visibilityDirectives.forEach(function(vdir) {
    it('does not add the md-auto-hide class with ' + vdir + ' on the messages', inject(function() {
      var el = compile(
        '<md-input-container><input ng-model="foo">' +
        '  <div ng-messages ' + vdir + '="true">Test Message</div>' +
        '</md-input-container>'
      );

      expect(el[0].querySelector("[ng-messages]").classList.contains('md-auto-hide')).toBe(false);
    }));
  });

  it('does not add the md-auto-hide class with ngSwitch on the messages', inject(function() {
    pageScope.switchVal = 1;

    var el = compile(
      '<md-input-container ng-switch="switchVal">' +
      '  <input ng-model="foo">' +
      '  <div ng-messages ng-switch-when="1">1</div>' +
      '  <div ng-messages ng-switch-when="2">2</div>' +
      '  <div ng-messages ng-switch-default>Other</div>' +
      '</md-input-container>'
    );

    expect(el[0].querySelector("[ng-messages]").classList.contains('md-auto-hide')).toBe(false);
  }));

  it('should select the input value on focus', inject(function() {
    var container = setup('md-select-on-focus');
    var input = container.find('input');
    input.val('Auto Text Select');

    document.body.appendChild(container[0]);

    expect(isTextSelected(input[0])).toBe(false);

    input.triggerHandler('focus');

    expect(isTextSelected(input[0])).toBe(true);

    document.body.removeChild(container[0]);

    function isTextSelected(input) {
      return input.selectionStart == 0 && input.selectionEnd == input.value.length
    }
  }));

  describe('Textarea auto-sizing', function() {
    var ngElement, element, ngTextarea, textarea, scope, parentElement;

    function createAndAppendElement(attrs) {
      scope = $rootScope.$new();

      attrs = attrs || '';
      var template =
        '<div ng-hide="parentHidden">' +
          '<md-input-container>' +
            '<label>Biography</label>' +
            '<textarea ' + attrs + '>Single line</textarea>' +
          '</md-input-container>' +
        '</div>';
      parentElement = $compile(template)(scope);
      ngElement = parentElement.find('md-input-container');
      element = ngElement[0];
      ngTextarea = ngElement.find('textarea');
      textarea = ngTextarea[0];
      document.body.appendChild(parentElement[0]);
    }

    afterEach(function() {
      document.body.removeChild(parentElement[0]);
    });

    it('should auto-size the textarea as the user types', function() {
      createAndAppendElement();
      var oldHeight = textarea.offsetHeight;
      ngTextarea.val('Multiple\nlines\nof\ntext');
      ngTextarea.triggerHandler('input');
      scope.$apply();
      $timeout.flush();
      var newHeight = textarea.offsetHeight;
      expect(newHeight).toBeGreaterThan(oldHeight);
    });

    it('should not auto-size if md-no-autogrow is present', function() {
      createAndAppendElement('md-no-autogrow');
      var oldHeight = textarea.offsetHeight;
      ngTextarea.val('Multiple\nlines\nof\ntext');
      ngTextarea.triggerHandler('input');
      scope.$apply();
      $timeout.flush();
      var newHeight = textarea.offsetHeight;
      expect(newHeight).toEqual(oldHeight);
    });

    it('should auto-size when revealed if md-detect-hidden is present', function() {
      createAndAppendElement('md-detect-hidden');

      var oldHeight = textarea.offsetHeight;

      scope.parentHidden = true;
      ngTextarea.val('Multiple\nlines\nof\ntext');
      ngTextarea.triggerHandler('input');
      scope.$apply();
      $timeout.flush();

      // Textarea should still be hidden.
      expect(textarea.offsetHeight).toBe(0);

      scope.parentHidden = false;
      scope.$apply();

      $timeout.flush();
      var newHeight = textarea.offsetHeight;
      expect(textarea.offsetHeight).toBeGreaterThan(oldHeight);
    });
  });

  describe('icons', function () {
    it('should add md-icon-left class when md-icon is before the input', function () {
      var el = compile(
        '<md-input-container>' +
        '  <md-icon></md-icon>' +
        '  <input ng-model="foo">' +
        '</md-input-container>'
      );

      expect(el.hasClass('md-icon-left')).toBeTruthy();

    });

    it('should add md-icon-left class when .md-icon is before the input', function () {
      var el = compile(
        '<md-input-container>' +
        '  <i class="md-icon"></i>' +
        '  <input ng-model="foo">' +
        '</md-input-container>'
      );
      expect(el.hasClass('md-icon-left')).toBeTruthy();
    });

    it('should add md-icon-right class when md-icon is after the input', function () {
      var el = compile(
        '<md-input-container>' +
        '  <input ng-model="foo">' +
        '  <md-icon></md-icon>' +
        '</md-input-container>'
      );

      expect(el.hasClass('md-icon-right')).toBeTruthy();

    });

    it('should add md-icon-right class when .md-icon is after the input', function () {
      var el = compile(
        '<md-input-container>' +
        '  <input ng-model="foo">' +
        '  <i class="md-icon"></i>' +
        '</md-input-container>'
      );
      expect(el.hasClass('md-icon-right')).toBeTruthy();
    });

    it('should add md-icon-left and md-icon-right classes when md-icons are before and after the input', function () {
      var el = compile(
        '<md-input-container>' +
        '  <md-icon></md-icon>' +
        '  <input ng-model="foo">' +
        '  <md-icon></md-icon>' +
        '</md-input-container>'
      );
      expect(el.hasClass('md-icon-left md-icon-right')).toBeTruthy();
    });

    it('should add md-icon-left and md-icon-right classes when .md-icons are before and after the input', function () {
      var el = compile(
        '<md-input-container>' +
        '  <i class="md-icon"></i>' +
        '  <input ng-model="foo">' +
        '  <i class="md-icon"></i>' +
        '</md-input-container>'
      );
      expect(el.hasClass('md-icon-left md-icon-right')).toBeTruthy();
    });

    it('should add md-icon-left class when md-icon is before select', function() {
      var el = compile(
        '<md-input-container>' +
          '<md-icon></md-icon>' +
          '<md-select ng-model="foo"></md-select>' +
        '</md-input-container>'
      );

      expect(el.hasClass('md-icon-left')).toBeTruthy();
    });

    it('should add md-icon-right class when md-icon is before select', function() {
      var el = compile(
        '<md-input-container>' +
          '<md-select ng-model="foo"></md-select>' +
          '<md-icon></md-icon>' +
        '</md-input-container>'
      );

      expect(el.hasClass('md-icon-right')).toBeTruthy();
    });

    it('should add md-icon-left class when md-icon is before textarea', function() {
      var el = compile(
        '<md-input-container>' +
          '<md-icon></md-icon>' +
          '<textarea ng-model="foo"></textarea>' +
        '</md-input-container>'
      );

      expect(el.hasClass('md-icon-left')).toBeTruthy();
    });

    it('should add md-icon-right class when md-icon is before textarea', function() {
      var el = compile(
        '<md-input-container>' +
          '<textarea ng-model="foo"></textarea>' +
          '<md-icon></md-icon>' +
        '</md-input-container>'
      );

      expect(el.hasClass('md-icon-right')).toBeTruthy();
    });
  });
});
