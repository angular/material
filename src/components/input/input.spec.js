describe('md-input-container directive', function() {
  var $rootScope, $compile, $timeout, pageScope, $material;

  var invalidAnimation, messagesAnimation, messageAnimation;
  var $animProvider;

  beforeEach(module('ngAria', 'material.components.input', 'ngMessages'));

  // Setup/grab our variables
  beforeEach(inject(function($injector) {
    $compile = $injector.get('$compile');
    $timeout = $injector.get('$timeout');
    $material = $injector.get('$material');

    $rootScope = $injector.get('$rootScope');
    pageScope = $rootScope.$new();
  }));

  function setup(attrs, isForm) {
    var container;

    var template =
      '<md-input-container>' +
      '  <label></label>' +
      '  <input ' + (attrs || '') + '>' +
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
      '  <div ng-form>' +
      '    <md-input-container>' +
      '      <input ng-model="foo">' +
      '      <label></label>' +
      '    </md-input-container>' +
      '  </div>' +
      '</form>';

    var parentForm = $compile(template)(pageScope).find('div');
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
      '  <input ng-model="foo">' +
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

    // Expect a slight delay (via $mdUtil.nextTick()) which fixes a tabbing issue in Safari, see
    // https://github.com/angular/material/issues/4203 for more info.
    expect(el).not.toHaveClass('md-input-focused');
    $timeout.flush();
    expect(el).toHaveClass('md-input-focused');

    el.find('input').triggerHandler('blur');

    // Again, expect the change to not be immediate
    expect(el).toHaveClass('md-input-focused');
    $timeout.flush();
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

  it('should skip a hidden input', function() {
    var container = setup('type="hidden"');
    var controller = container.controller('mdInputContainer');
    var textInput = angular.element('<input type="text">');

    expect(controller.input).toBeUndefined();

    container.append(textInput);
    $compile(textInput)(pageScope);

    expect(controller.input[0]).toBe(textInput[0]);
  });


  it('should set has-value class on container for non-ng-model input', function() {
    var el = setup();
    expect(el).not.toHaveClass('md-input-has-value');

    el.find('input').val('123').triggerHandler('input');
    expect(el).toHaveClass('md-input-has-value');

    el.find('input').val('').triggerHandler('input');
    expect(el).not.toHaveClass('md-input-has-value');
  });

  it('should set has-value class on container with ng-value', function() {
    var el = setup('ng-value="value"');

    pageScope.$apply('value = "My Value"');

    expect(el).toHaveClass('md-input-has-value');

    pageScope.$apply('value = ""');

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

  it('should set the "step" attribute to "any" if "min" and "max" are specified', function() {
    // check #7349 for more info
    var el = setup('type="number" min="1" max="999"');
    expect(el.find('input').attr('step')).toBe('any');
  });

  describe('md-no-asterisk', function() {

    it('should not show asterisk on required label if disabled', function() {
      var el = setup('md-no-asterisk required');
      var ctrl = el.controller('mdInputContainer');

      expect(ctrl.label).not.toHaveClass('md-required');
    });

    it('should not show an asterisk when attribute value is `true`', function() {
      var el = setup('md-no-asterisk="true" required');
      var ctrl = el.controller('mdInputContainer');

      expect(ctrl.label).not.toHaveClass('md-required');
    });

    it('should show an asterisk when attribute value is `false`', function() {
      var el = setup('md-no-asterisk="false" required');
      var ctrl = el.controller('mdInputContainer');

      expect(ctrl.label).toHaveClass('md-required');
    });

  });

  describe('md-maxlength', function() {
    function getCharCounter(el) {
      return angular.element(el[0].querySelector('.md-char-counter'));
    }

    it('should error with a constant and incorrect initial value', function() {
      var el = $compile(
        '<form name="form">' +
        '  <md-input-container>' +
        '    <input md-maxlength="2" ng-model="foo" name="foo">' +
        '  </md-input-container>' +
        '</form>')(pageScope);

      pageScope.$apply('foo = "ABCDEFGHIJ"');

      // Flush any pending $mdUtil.nextTick calls
      $timeout.flush();

      expect(pageScope.form.foo.$error['md-maxlength']).toBe(true);
      expect(getCharCounter(el).text()).toBe('10 / 2');
    });

    it('should work with a constant and correct initial value', function() {
      var el = $compile(
        '<form name="form">' +
        '  <md-input-container>' +
        '    <input md-maxlength="5" ng-model="foo" name="foo">' +
        '  </md-input-container>' +
        '</form>')(pageScope);

      pageScope.$apply('foo = "abcde"');

      // Flush any pending $mdUtil.nextTick calls
      $timeout.flush();

      expect(pageScope.form.foo.$error['md-maxlength']).toBeFalsy();
      expect(getCharCounter(el).text()).toBe('5 / 5');
    });

    it('should error with an interpolated value and incorrect initial value', function() {
      var el = $compile(
        '<form name="form">' +
        '  <md-input-container>' +
        '    <input md-maxlength="mymax" ng-model="foo" name="foo">' +
        '  </md-input-container>' +
        '</form>')(pageScope);

        pageScope.$apply('mymax = 8');
        pageScope.$apply('foo = "ABCDEFGHIJ"');

      // Flush any pending $mdUtil.nextTick calls
      $timeout.flush();

      expect(pageScope.form.foo.$error['md-maxlength']).toBe(true);
      expect(getCharCounter(el).text()).toBe('10 / 8');
    });

    it('should work with an interpolated value and correct initial value', function() {
      var el = $compile(
        '<form name="form">' +
        '  <md-input-container>' +
        '    <input md-maxlength="mymax" ng-model="foo" name="foo">' +
        '  </md-input-container>' +
        '</form>')(pageScope);

      pageScope.$apply('mymax = 5');
      pageScope.$apply('foo = "abcde"');

      // Flush any pending $mdUtil.nextTick calls
      $timeout.flush();

      expect(pageScope.form.foo.$error['md-maxlength']).toBeFalsy();
      expect(getCharCounter(el).text()).toBe('5 / 5');
    });

    it('should work with a constant', function() {
      var el = $compile(
        '<form name="form">' +
        '  <md-input-container>' +
        '    <input md-maxlength="5" ng-model="foo" name="foo">' +
        '  </md-input-container>' +
        '</form>')(pageScope);

      pageScope.$apply();

      // Flush any pending $mdUtil.nextTick calls
      $timeout.flush();

      expect(pageScope.form.foo.$error['md-maxlength']).toBeFalsy();
      expect(getCharCounter(el).text()).toBe('0 / 5');

      pageScope.$apply('foo = "abcde"');
      expect(pageScope.form.foo.$error['md-maxlength']).toBeFalsy();
      expect(getCharCounter(el).text()).toBe('5 / 5');

      pageScope.$apply('foo = "abcdef"');
      el.find('input').triggerHandler('input');
      expect(pageScope.form.foo.$error['md-maxlength']).toBe(true);
      expect(getCharCounter(el).text()).toBe('6 / 5');

      pageScope.$apply('foo = "abc"');
      el.find('input').triggerHandler('input');
      expect(pageScope.form.foo.$error['md-maxlength']).toBeFalsy();
      expect(getCharCounter(el).text()).toBe('3 / 5');
    });

    it('should render correct character count when value is a number', function() {
      var template =
        '<md-input-container>' +
        '  <input ng-model="item.numberValue" md-maxlength="6">' +
        '</md-input-container>';
      var element = $compile(template)(pageScope);
      pageScope.$apply();


      // Flush any pending $mdUtil.nextTick calls
      $timeout.flush();

      pageScope.item = {numberValue: 456};
      pageScope.$apply();

      expect(getCharCounter(element).text()).toBe('3 / 6');
    });

    it('should update correctly the counter, when deleting the model value', function() {
      var el = $compile(
        '<form name="form">' +
          '<md-input-container>' +
          '<input md-maxlength="5" ng-model="foo" name="foo">' +
          '</md-input-container>' +
        '</form>'
      )(pageScope);

      pageScope.$apply();

      // Flush any pending $mdUtil.nextTick calls
      $timeout.flush();

      expect(pageScope.form.foo.$error['md-maxlength']).toBeFalsy();
      expect(getCharCounter(el).text()).toBe('0 / 5');

      pageScope.$apply('foo = "abcdef"');
      expect(pageScope.form.foo.$error['md-maxlength']).toBe(true);
      expect(getCharCounter(el).text()).toBe('6 / 5');


      pageScope.$apply('foo = ""');
      expect(pageScope.form.foo.$error['md-maxlength']).toBeFalsy();
      expect(getCharCounter(el).text()).toBe('0 / 5');
    });

    it('should add and remove maxlength element & error with expression', function() {
      var el = $compile(
        '<form name="form">' +
        '  <md-input-container>' +
        '    <input md-maxlength="max" ng-model="foo" name="foo">' +
        '  </md-input-container>' +
        '</form>')(pageScope);

      pageScope.$apply('max = -1');

      // Flush any pending $mdUtil.nextTick calls
      $timeout.flush();
      expect(pageScope.form.foo.$error['md-maxlength']).toBeFalsy();
      expect(getCharCounter(el).length).toBe(0);

      pageScope.$apply('max = 5');
      pageScope.$apply('foo = "abcdef"');
      expect(pageScope.form.foo.$error['md-maxlength']).toBeTruthy();
      expect(getCharCounter(el).length).toBe(1);
      expect(getCharCounter(el).text()).toBe('6 / 5');

      pageScope.$apply('max = -1');
      pageScope.$apply('foo = "abcdefg"');
      expect(pageScope.form.foo.$error['md-maxlength']).toBeFalsy();
      expect(getCharCounter(el).length).toBe(0);
    });

    it('should not accept spaces for required inputs by default', function() {
      var el = $compile(
        '<form name="form">' +
        '  <md-input-container>' +
        '    <input md-maxlength="max" ng-model="foo" name="foo" required>' +
        '  </md-input-container>' +
        '</form>')(pageScope);
      var input = el.find('input');

      pageScope.$apply('foo = ""');
      pageScope.$apply('max = 1');

      // Flush any pending $mdUtil.nextTick calls
      $timeout.flush();

      expect(input.hasClass('ng-invalid')).toBe(true);
      expect(input.hasClass('ng-invalid-required')).toBe(true);
      expect(pageScope.form.foo.$error['md-maxlength']).toBeFalsy();

      pageScope.$apply('foo = "  "');
      expect(input.hasClass('ng-invalid')).toBe(true);
      expect(input.hasClass('ng-invalid-required')).toBe(true);
      expect(pageScope.form.foo.$error['required']).toBeTruthy();
      expect(pageScope.form.foo.$error['md-maxlength']).toBeFalsy();
    });

    it('should not trim spaces for required password inputs', function() {
      var el = $compile(
        '<form name="form">' +
        '  <md-input-container>' +
        '    <input md-maxlength="max" ng-model="foo" name="foo" type="password" required>' +
        '  </md-input-container>' +
        '</form>')(pageScope);
      var input = el.find('input');

      pageScope.$apply('foo = ""');
      pageScope.$apply('max = 1');

      // Flush any pending $mdUtil.nextTick calls
      $timeout.flush();

      expect(input.hasClass('ng-invalid')).toBe(true);
      expect(input.hasClass('ng-invalid-required')).toBe(true);
      expect(pageScope.form.foo.$error['md-maxlength']).toBeFalsy();

      pageScope.$apply('foo = "  "');
      expect(input.hasClass('ng-invalid')).toBe(true);
      expect(input.hasClass('ng-invalid-required')).toBe(false);
      expect(pageScope.form.foo.$error['required']).toBeFalsy();
      expect(pageScope.form.foo.$error['md-maxlength']).toBeTruthy();
    });

    it('should respect ng-trim="false"', function() {
      var el = $compile(
        '<form name="form">' +
        '  <md-input-container>' +
        '    <input md-maxlength="max" ng-model="foo" name="foo" ng-trim="false" required>' +
        '  </md-input-container>' +
        '</form>')(pageScope);

      pageScope.$apply('foo = ""');
      pageScope.$apply('max = 1');

      // Flush any pending $mdUtil.nextTick calls
      $timeout.flush();

      expect(pageScope.form.foo.$error['required']).toBeTruthy();
      expect(pageScope.form.foo.$error['md-maxlength']).toBeFalsy();

      pageScope.$apply('foo = "  "');
      expect(pageScope.form.foo.$error['required']).toBeFalsy();
      expect(pageScope.form.foo.$error['md-maxlength']).toBeTruthy();
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

  it('should not create a floating label from a placeholder if md-no-float is empty', function() {
    var el = compile(
      '<md-input-container md-no-float>' +
      '  <input placeholder="Foo" ng-model="foo">' +
      '</md-input-container>'
    );

    expect(el.find('label').length).toBe(0);
  });

  it('should not create a floating label from a placeholder if md-no-float is truthy', function() {
    pageScope.inputs = [{
      placeholder: 'Name',
      model: ''
    }, {
      placeholder: 'Email',
      model: ''
    }];

    var el = compile(
      '<div>' +
      '  <md-input-container ng-repeat="input in inputs" md-no-float="$index !== 0">' +
      '    <input placeholder="{{input.placeholder}}" ng-model="input.model">' +
      '  </md-input-container>' +
      '</div>'
    );

    var labels = el.find('label');

    expect(labels.length).toBe(1);
    expect(labels[0].textContent).toEqual('Name');
  });

  it('should create a floating label from a placeholder if md-no-float is falsey', function() {
    var el = compile(
      '<md-input-container md-no-float="false">' +
      '  <input placeholder="Foo" ng-model="foo">' +
      '</md-input-container>'
    );

    expect(el.find('label').length).toBe(1);
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

  it('should transfer the placeholder data binding to the newly-created label', function() {
    var el = $compile(
      '<md-input-container>' +
      '  <input ng-model="foo" placeholder="{{placeholder}}" />' +
      '</md-input-container>'
    )(pageScope);

    var label = el[0].querySelector('label');
    var input = el[0].querySelector('input');

    pageScope.placeholder = 'foo';
    pageScope.$digest();

    expect(label).toBeTruthy();

    expect(input.hasAttribute('placeholder')).toBe(false);
    expect(label.textContent).toEqual('foo');

    pageScope.placeholder = 'bar';
    pageScope.$digest();

    // We should check again to make sure that AngularJS didn't
    // re-add the placeholder attribute and cause double labels.
    expect(input.hasAttribute('placeholder')).toBe(false);
    expect(label.textContent).toEqual('bar');
  });

  it('should not copy placeholder text to aria-label on the input', inject(function($timeout) {
    var el = $compile(
      '<form name="form">' +
      '  <md-input-container md-no-float>' +
      '    <input placeholder="baz" ng-model="foo" name="foo">' +
      '  </md-input-container>' +
      '</form>')(pageScope);

    // Flushes the $mdUtil.nextTick
    $timeout.flush();

    var input = el.find('input');
    expect(input.attr('aria-label')).toBeUndefined();
  }));

  it('should put the container in "has value" state when input has a static value', function() {
    var scope = pageScope.$new();
    var template =
      '<md-input-container>' +
      '  <label>Name</label>' +
      '  <input value="Larry">' +
      '</md-input-container>';

    var element = $compile(template)(scope);
    scope.$apply();

    expect(element.hasClass('md-input-has-value')).toBe(true);
  });

  it('adds the md-auto-hide class to messages without a visiblity directive', function() {
    var el = compile(
      '<md-input-container><input ng-model="foo">' +
      '  <div ng-messages></div>' +
      '</md-input-container>'
    );

    expect(el[0].querySelector("[ng-messages]").classList.contains('md-auto-hide')).toBe(true);
  });

  it('does not add the md-auto-hide class with md-auto-hide="false" on the messages', function() {
    var el = compile(
      '<md-input-container><input ng-model="foo">' +
      '  <div ng-messages md-auto-hide="false">Test Message</div>' +
      '</md-input-container>'
    );

    expect(el[0].querySelector("[ng-messages]").classList.contains('md-auto-hide')).toBe(false);
  });

  describe('with ng-messages', function() {
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

    it('should set the animation class on the ngMessage properly', inject(function() {
      var element = compile(
        '<form name="myForm">' +
        '  <md-input-container>' +
        '    <input ng-model="inputVal" name="myModel" required>' +
        '    <div ng-messages="myForm.myModel.$error">' +
        '      <ng-message id="requiredMessage" when="required">Field required</ng-message>' +
        '    </div>' +
        '  </md-input-container>' +
        '</form>'
      );

      var ngMessage = element.find('ng-message');

      expect(ngMessage).toHaveClass('md-input-message-animation');
    }));

    // NOTE: I believe this test was erroneously passing since we did not properly include the
    // ngMessages module. After properly including this test now fails, so I have disabled it
    // until we can figure out if this is a valid test. - Topher - 7/26/2016
    xit('should set the animation class on a transcluded ngMessage', function() {
      // We can emulate the transclusion, by wrapping the ngMessage inside of a document fragment.
      // It is not necessary to add a *extra* component / directive for that, since we just
      // want to the test the DocumentFragment detection.
      var fragment = document.createDocumentFragment();

      var inputContainer = compile(
        '<md-input-container>' +
        '  <input ng-model="inputVal">' +
        '  <div ng-messages id="messageInsertion">' +
        '  </div>' +
        '</md-input-container>'
      );

      // We build our element, without compiling and linking it.
      // Because we invoke those steps manually during the tests.
      var messageElement = angular.element(
        '<ng-message id="requiredMessage" when="required">Field Required</ng-message>'
      );

      fragment.appendChild(messageElement[0]);

      // Only compile the element at this time, and link it to its scope later.
      // Normally the directive will add the animation class upon compile.
      var linkFn = $compile(messageElement);

      expect(messageElement).not.toHaveClass('md-input-message-animation');

      // Now we emulate the finish of the transclusion.
      // We move the element from the fragment into the correct input
      // container.
      inputContainer[0].appendChild(messageElement[0]);

      // Manually invoke the postLink function of the directive.
      linkFn($rootScope.$new());

      expect(messageElement).toHaveClass('md-input-message-animation');
    });

    it('should select the input value on focus', inject(function($timeout) {
      var input = $compile('<input md-select-on-focus value="Text">')($rootScope);

      document.body.appendChild(input[0]);

      expect(isTextSelected(input[0])).toBe(false);

      input.focus();
      input.triggerHandler('focus');
      $timeout.flush();

      expect(isTextSelected(input[0])).toBe(true);

      input.remove();


      function isTextSelected(input) {
        if (typeof input.selectionStart === "number") {
          return input.selectionStart === 0 && input.selectionEnd === input.value.length;
        } else if (typeof document.selection !== "undefined") {
          return document.selection.createRange().text === input.value;
        }
      }
    }));

    it('should not refocus the input after focus is lost', inject(function($document, $timeout) {
      var wrapper = $compile('<div><input md-select-on-focus value="Text"><input></div>')($rootScope),
          input1 = angular.element(wrapper[0].childNodes[0]),
          input2 = angular.element(wrapper[0].childNodes[1]);
      $document[0].body.appendChild(wrapper[0]);

      input1.focus();
      input1.triggerHandler('focus');
      input2.focus();
      input2.triggerHandler('focus');

      $timeout.flush();
      expect(input2).toBeFocused();

      wrapper.remove();
    }));

    describe('Textarea auto-sizing', function() {
      var ngElement, element, ngTextarea, textarea, scope, parentElement;

      function createAndAppendElement(attrs) {
        scope = $rootScope.$new();

        attrs = attrs || '';
        var template =
          '<div ng-hide="parentHidden">' +
          '  <md-input-container>' +
          '    <label>Biography</label>' +
          '    <textarea ' + attrs + '>Single line</textarea>' +
          '  </md-input-container>' +
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
        expect(textarea.offsetHeight).toBeGreaterThan(oldHeight);
      });

      it('should auto-size the textarea in response to an outside ngModel change', function() {
        createAndAppendElement('ng-model="model"');
        var oldHeight = textarea.offsetHeight;
        scope.model = '1\n2\n3\n';
        $timeout.flush();
        expect(textarea.offsetHeight).toBeGreaterThan(oldHeight);
      });

      it('should allow the textarea to shrink if text is being deleted', function() {
        createAndAppendElement();
        ngTextarea.val('Multiple\nlines\nof\ntext');
        ngTextarea.triggerHandler('input');
        var oldHeight = textarea.offsetHeight;

        ngTextarea.val('One line of text');
        ngTextarea.triggerHandler('input');

        expect(textarea.offsetHeight).toBeLessThan(oldHeight);
      });

      it('should not auto-size if md-no-autogrow is present', function() {
        createAndAppendElement('md-no-autogrow');
        var oldHeight = textarea.offsetHeight;
        ngTextarea.val('Multiple\nlines\nof\ntext');
        ngTextarea.triggerHandler('input');
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

        // Textarea should still be hidden.
        expect(textarea.offsetHeight).toBe(0);

        scope.parentHidden = false;
        scope.$apply();

        var newHeight = textarea.offsetHeight;
        expect(textarea.offsetHeight).toBeGreaterThan(oldHeight);
      });

      it('should set the rows attribute as the user types', function() {
        createAndAppendElement();
        expect(textarea.rows).toBe(1);

        ngTextarea.val('1\n2\n3');
        ngTextarea.triggerHandler('input');
        expect(textarea.rows).toBe(3);
      });

      it('should not allow the textarea rows to be less than the minimum number of rows', function() {
        createAndAppendElement('rows="5"');
        ngTextarea.val('1\n2\n3\n4\n5\n6\n7');
        ngTextarea.triggerHandler('input');
        expect(textarea.rows).toBe(7);

        ngTextarea.val('');
        ngTextarea.triggerHandler('input');
        expect(textarea.rows).toBe(5);
      });

      it('should not let a textarea grow past its maximum number of rows', function() {
        createAndAppendElement('max-rows="5"');
        ngTextarea.val('1\n2\n3');
        ngTextarea.triggerHandler('input');
        expect(textarea.rows).toBe(3);
        expect(ngTextarea.attr('md-no-autogrow')).toBeUndefined();

        ngTextarea.val('1\n2\n3\n4\n5\n6\n7\n8\n9');
        ngTextarea.triggerHandler('input');
        expect(textarea.rows).toBe(5);
        expect(ngTextarea.attr('md-no-autogrow')).toBeDefined();
      });

      it('should add a handle for resizing the textarea', function() {
        createAndAppendElement();
        expect(element.querySelector('.md-resize-handle')).toBeTruthy();
      });

      it('should disable auto-sizing if the handle gets dragged', function() {
        createAndAppendElement();
        var handle = angular.element(element.querySelector('.md-resize-handle'));

        ngTextarea.val('1\n2\n3');
        ngTextarea.triggerHandler('input');
        var oldHeight = textarea.offsetHeight;

        handle.triggerHandler('mousedown');
        ngElement.triggerHandler('$md.dragstart');
        ngTextarea.val('1\n2\n3\n4\n5\n6');
        ngTextarea.triggerHandler('input');
        expect(textarea.offsetHeight).toBe(oldHeight);
      });

      it('should not add the handle if md-no-resize is present', function() {
        createAndAppendElement('md-no-resize');
        expect(element.querySelector('.md-resize-handle')).toBeFalsy();
      });

      it('should reset the padding after measuring the line height', function() {
        createAndAppendElement();
        ngTextarea.triggerHandler('input');
        expect(textarea.style.padding).toBeFalsy();
      });

      it('should preserve the original inline padding', function() {
        createAndAppendElement('style="padding: 10px;"');
        ngTextarea.triggerHandler('input');
        expect(textarea.style.padding).toBe('10px');
      });
    });

    describe('icons', function() {
      it('should add md-icon-left class when md-icon is before the input', function() {
        var el = compile(
          '<md-input-container>' +
          '  <md-icon></md-icon>' +
          '  <input ng-model="foo">' +
          '</md-input-container>'
        );
        $material.flushOutstandingAnimations();
        expect(el.hasClass('md-icon-left')).toBeTruthy();
      });

      it('should add md-icon-left class when .md-icon is before the input', function() {
        var el = compile(
          '<md-input-container>' +
          '  <i class="md-icon"></i>' +
          '  <input ng-model="foo">' +
          '</md-input-container>'
        );
        $material.flushOutstandingAnimations();
        expect(el.hasClass('md-icon-left')).toBeTruthy();
      });

      it('should add md-icon-right class when md-icon is after the input', function() {
        var el = compile(
          '<md-input-container>' +
          '  <input ng-model="foo">' +
          '  <md-icon></md-icon>' +
          '</md-input-container>'
        );
        $material.flushOutstandingAnimations();
        expect(el.hasClass('md-icon-right')).toBeTruthy();

      });

      it('should add md-icon-right class when .md-icon is after the input', function() {
        var el = compile(
          '<md-input-container>' +
          '  <input ng-model="foo">' +
          '  <i class="md-icon"></i>' +
          '</md-input-container>'
        );
        $material.flushOutstandingAnimations();
        expect(el.hasClass('md-icon-right')).toBeTruthy();
      });
      it('should not add md-icon-left class when md-icon is before the input and ng-if="false"', function() {
        var el = compile(
          '<md-input-container>' +
          '  <md-icon ng-if="false"></md-icon>' +
          '  <input ng-model="foo">' +
          '</md-input-container>'
        );
        $material.flushOutstandingAnimations();
        expect(el.hasClass('md-icon-left')).toBeFalsy();
      });

      it('should not add md-icon-left class when .md-icon is before the input and ng-if="false"', function() {
        var el = compile(
          '<md-input-container>' +
          '  <i class="md-icon" ng-if="false"></i>' +
          '  <input ng-model="foo">' +
          '</md-input-container>'
        );
        $material.flushOutstandingAnimations();
        expect(el.hasClass('md-icon-left')).toBeFalsy();
      });

      it('should not add md-icon-right class when md-icon is after the input and ng-if="false"', function() {
        var el = compile(
          '<md-input-container>' +
          '  <input ng-model="foo">' +
          '  <md-icon ng-if="false"></md-icon>' +
          '</md-input-container>'
        );
        $material.flushOutstandingAnimations();
        expect(el.hasClass('md-icon-right')).toBeFalsy();

      });

      it('should not add md-icon-right class when .md-icon is after the input and ng-if="false"', function() {
        var el = compile(
          '<md-input-container>' +
          '  <input ng-model="foo">' +
          '  <i class="md-icon" ng-if="false"></i>' +
          '</md-input-container>'
        );
        $material.flushOutstandingAnimations();
        expect(el.hasClass('md-icon-right')).toBeFalsy();
      });

      it('should add md-icon-left and md-icon-right classes when md-icons are before and after the input', function() {
        var el = compile(
          '<md-input-container>' +
          '  <md-icon></md-icon>' +
          '  <input ng-model="foo">' +
          '  <md-icon></md-icon>' +
          '</md-input-container>'
        );
        $material.flushOutstandingAnimations();
        expect(el.hasClass('md-icon-left md-icon-right')).toBeTruthy();
      });

      it('should add md-icon-left and md-icon-right classes when .md-icons are before and after the input', function() {
        var el = compile(
          '<md-input-container>' +
          '  <i class="md-icon"></i>' +
          '  <input ng-model="foo">' +
          '  <i class="md-icon"></i>' +
          '</md-input-container>'
        );
        $material.flushOutstandingAnimations();
        expect(el.hasClass('md-icon-left md-icon-right')).toBeTruthy();
      });

      it('should not add md-icon-left and md-icon-right classes when md-icons are before and after the input and ng-if="false"', function() {
        var el = compile(
          '<md-input-container>' +
          '  <md-icon ng-if="false"></md-icon>' +
          '  <input ng-model="foo">' +
          '  <md-icon ng-if="false"></md-icon>' +
          '</md-input-container>'
        );
        $material.flushOutstandingAnimations();
        expect(el.hasClass('md-icon-left md-icon-right')).toBeFalsy();
      });

      it('should not add md-icon-left and md-icon-right classes when .md-icons are before and after the input and ng-if="false"', function() {
        var el = compile(
          '<md-input-container>' +
          '  <i class="md-icon" ng-if="false"></i>' +
          '  <input ng-model="foo">' +
          '  <i class="md-icon" ng-if="false"></i>' +
          '</md-input-container>'
        );
        $material.flushOutstandingAnimations();
        expect(el.hasClass('md-icon-left md-icon-right')).toBeFalsy();
      });

      it('should add md-icon-left class when md-icon is before select', function() {
        var el = compile(
          '<md-input-container>' +
          '  <md-icon></md-icon>' +
          '  <md-select ng-model="foo"></md-select>' +
          '</md-input-container>'
        );
        $material.flushOutstandingAnimations();
        expect(el.hasClass('md-icon-left')).toBeTruthy();
      });

      it('should add md-icon-right class when md-icon is before select', function() {
        var el = compile(
          '<md-input-container>' +
          '  <md-select ng-model="foo"></md-select>' +
          '  <md-icon></md-icon>' +
          '</md-input-container>'
        );
        $material.flushOutstandingAnimations();
        expect(el.hasClass('md-icon-right')).toBeTruthy();
      });

      it('should add md-icon-left class when md-icon is before textarea', function() {
        var el = compile(
          '<md-input-container>' +
          '  <md-icon></md-icon>' +
          '  <textarea ng-model="foo"></textarea>' +
          '</md-input-container>'
        );
        $material.flushOutstandingAnimations();
        expect(el.hasClass('md-icon-left')).toBeTruthy();
      });

      it('should add md-icon-right class when md-icon is before textarea', function() {
        var el = compile(
          '<md-input-container>' +
          '  <textarea ng-model="foo"></textarea>' +
          '  <md-icon></md-icon>' +
          '</md-input-container>'
        );
        $material.flushOutstandingAnimations();
        expect(el.hasClass('md-icon-right')).toBeTruthy();
      });

      it('should not add md-icon-left class when md-icon is before textarea and ng-if="false"', function() {
        var el = compile(
          '<md-input-container>' +
          '  <md-icon ng-if="false"></md-icon>' +
          '  <textarea ng-model="foo"></textarea>' +
          '</md-input-container>'
        );
        $material.flushOutstandingAnimations();
        expect(el.hasClass('md-icon-left')).toBeFalsy();
      });

      it('should not add md-icon-right class when md-icon is before textarea and ng-if="false"', function() {
        var el = compile(
          '<md-input-container>' +
          '  <textarea ng-model="foo"></textarea>' +
          '  <md-icon ng-if="false"></md-icon>' +
          '</md-input-container>'
        );
        $material.flushOutstandingAnimations();
        expect(el.hasClass('md-icon-right')).toBeFalsy();
      });
    });
  });
});
