describe('md-input-container animations', function() {
  var $rootScope, $compile, $material, $$mdInput, $window, $animate, $rootElement, $document, $timeout,
    el, root, body, pageScope, computedStyle, invalidAnimation, messagesAnimation, messageAnimation;

  // Load our modules
  beforeEach(module('ngAnimate', 'ngMessages', 'material.components.input', 'material.components.checkbox'));

  // Run pre-test setup
  beforeEach(injectGlobals);
  beforeEach(setupVariables);

  // Run after-test teardown
  afterEach(teardown);

  it('set the proper styles when showing messages on an input', performInputAnimationTests);
  it('set the proper styles when showing messages on an input with animations disabled', function() {
    $animate.enabled(false);
    performInputAnimationTests();
    $animate.enabled(true);
  });

  function performInputAnimationTests() {
    compile(
      '<form name="testForm">' +
      '  <md-input-container>' +
      '    <input name="foo" ng-model="foo" required ng-pattern="/^1234$/" />' +
      '    <div class="errors" ng-messages="testForm.foo.$error">' +
      '      <div ng-message="required" style="transition: 0s none">required</div>' +
      '      <div ng-message="pattern" style="transition: 0s none">pattern</div>' +
      '    </div>' +
      '  </md-input-container>' +
      '</form>'
    );

    var container = el.find('md-input-container'),
      input = el.find('input'),
      errors;
      

    // Mimic the real validations/animations that fire

    /*
     * 1. Set to an invalid pattern but don't blur (so it's not invalid yet)
     *
     * Expect nothing to happen (message is hidden)
     */

    setFoo('asdf');
    flush();
    errors = getError();
    expectError(errors, 'pattern');
    expect(container).not.toHaveClass('md-input-invalid');
    computedStyle = $window.getComputedStyle(errors[0]);
    expect(parseInt(computedStyle.opacity)).toEqual(0);
    expect(parseInt(computedStyle.marginTop)).toBeLessThan(0);

    /*
     * 2. Blur the input, which adds the md-input-invalid class
     *
     * Expect to animate in the pattern message
     */

    input.triggerHandler('blur');
    flush();
    errors = getError();
    expectError(errors, 'pattern');
    expect(container).toHaveClass('md-input-invalid');
    computedStyle = $window.getComputedStyle(errors[0]);
    expect(parseInt(computedStyle.opacity)).toEqual(1);
    expect(parseInt(computedStyle.marginTop)).toEqual(0);

    /*
     * 3. Clear the field
     *
     * Expect to animate away pattern message and animate in the required message
     */

    // Grab the pattern error before we change foo and it disappears

    setFoo('');
    expectError(getError(), 'required');

    flush();

    expect(container).toHaveClass('md-input-invalid');
    computedStyle = $window.getComputedStyle(getError()[0]);
    expect(parseInt(computedStyle.opacity)).toEqual(1);
    expect(parseInt(computedStyle.marginTop)).toEqual(0);
  }

  describe('method tests', function() {

    describe('#getMessagesElement', function() {

      it('finds the messages element itself', function() {
        var template = '<div class="md-input-messages-animation"></div>';
        var dom = angular.element(template);
        var messages = $$mdInput.messages.getElement(dom);

        expect(dom).toEqual(messages);
      });

      it('finds a child element', function(){
        var template = '<div><div class="md-input-messages-animation"></div></div>';
        var dom = angular.element(template);
        var realMessages = angular.element(dom[0].querySelector('.md-input-messages-animation'));
        var messages = $$mdInput.messages.getElement(dom);

        expect(realMessages).toEqual(messages);
      });

      it('finds the parent of a message animation element', function() {
        var template =
              '<div class="md-input-messages-animation">' +
              '  <div class="md-input-message-animation"></div>' +
              '</div>';
        var dom = angular.element(template);
        var message = angular.element(dom[0].querySelector('.md-input-message-animation'));
        var messages = $$mdInput.messages.getElement(message);

        expect(dom).toEqual(messages);
      });
    });
  });

  it('set the proper styles when showing messages on an md-checkbox', performCheckboxAnimationTests);
  it('set the proper styles when showing messages on an md-checkbox with animations disabled', function() {
    $animate.enabled(false);
    performCheckboxAnimationTests();
    $animate.enabled(true);
  });

  function performCheckboxAnimationTests() {
    compile(
      '<form name="testForm">' +
      '  <md-input-container>' +
      '    <md-checkbox name="cb" ng-model="foo" required>Test</md-checkbox>' +
      '    <div class="errors" ng-messages="testForm.cb.$error">' +
      '      <div ng-message="required" style="transition: 0s none">required</div>' +
      '    </div>' +
      '  </md-input-container>' +
      '</form>'
    );

    var container = el.find('md-input-container'),
      checkbox = el.find('md-checkbox');

    // Mimic the real validations/animations that fire

    /*
     * 1. Uncheck the checkbox but don't blur (so it's not invalid yet)
     *
     * Expect nothing to happen (message is hidden)
     */

    setFoo(true);
    checkbox.triggerHandler('click');
    flush();

    expectError(getError(), 'required');
    expect(container).not.toHaveClass('md-input-invalid');
    computedStyle = $window.getComputedStyle(getError()[0]);
    expect(parseInt(computedStyle.opacity)).toEqual(0);
    expect(parseInt(computedStyle.marginTop)).toBeLessThan(0);

    /*
     * 2. Blur the checkbox, which adds the md-input-invalid class
     *
     * Expect to animate in the required message
     */

    checkbox.triggerHandler('blur');
    flush();

    expectError(getError(), 'required');
    expect(container).toHaveClass('md-input-invalid');
    computedStyle = $window.getComputedStyle(getError()[0]);
    expect(parseInt(computedStyle.opacity)).toEqual(1);
    expect(parseInt(computedStyle.marginTop)).toEqual(0);

    /*
     * 3. Clear the field
     *
     * Expect to animate away required message
     */

    setFoo(true);
    flush();

    expect(getError().length).toBe(0);

  }

  /*
   * Test Helper Functions
   */

  function compile(template) {
    el = $compile(template)(pageScope);
    root = $rootElement.append(el)[0];
    body = $document[0].body;
    body.appendChild(root);

    pageScope.$apply();

    return el;
  }

  function setFoo(value) {
    pageScope.foo = value;
    pageScope.$digest();
  }

  function getError() {
    return angular.element(el[0].querySelector('.errors div'));
  }

  function expectError(element, message) {
    expect(element.text().trim()).toBe(message);
  }

  function flush() {
    // Note: we use flushInterimElement() because it actually calls everything 3 times which seems
    // to be enough to actually flush the animations
    $material.flushInterimElement();
  }

  /*
   * before/afterEach Helper Functions
   */

  // Setup/grab our variables
  function injectGlobals() {
    inject(function($injector) {
      $rootScope = $injector.get('$rootScope');
      $compile = $injector.get('$compile');
      $material = $injector.get('$material');
      $$mdInput = $injector.get('$$mdInput');
      $window = $injector.get('$window');
      $animate = $injector.get('$animate');
      $rootElement = $injector.get('$rootElement');
      $document = $injector.get('$document');

      // Grab our input animations (we MUST use the injector to setup dependencies)
      invalidAnimation = $injector.get('mdInputInvalidAnimation');
      messagesAnimation = $injector.get('mdInputMessagesAnimation');
      messageAnimation = $injector.get('mdInputMessageAnimation');
    });
  }

  // Setup some custom variables for these tests
  function setupVariables() {
    pageScope = $rootScope.$new();
  }

  // Teardown our tests by resetting variables and removing our element
  function teardown() {
    el && el.remove && el.remove();
  }
});
