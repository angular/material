describe('md-input-container animations', function() {
  var $rootScope, $compile, $animateCss, $material,
    el, pageScope, invalidAnimation, messagesAnimation, messageAnimation,
    cssTransitionsDisabled = false, lastAnimateCall;

  // Load our modules
  beforeEach(module('ngAnimate', 'ngMessages', 'material.components.input'));

  // Run pre-test setup
  beforeEach(decorateAnimateCss);
  beforeEach(injectGlobals);
  beforeEach(setupVariables);

  // Run after-test teardown
  afterEach(teardown);

  it('set the proper styles when showing messages', function() {
    compile(
      '<form name="testForm">' +
      '  <md-input-container>' +
      '    <input name="foo" ng-model="foo" required ng-pattern="/^1234$/" />' +
      '    <div class="errors" ng-messages="testForm.foo.$error">' +
      '      <div ng-message="required">required</div>' +
      '      <div ng-message="pattern">pattern</div>' +
      '    </div>' +
      '  </md-input-container>' +
      '</form>'
    );

    var container = el.find('md-input-container'),
      input = el.find('input'),
      doneSpy = jasmine.createSpy('done');

    // Mimic the real validations/animations that fire

    /*
     * 1. Set to an invalid pattern but don't blur (so it's not invalid yet)
     *
     * Expect nothing to happen ($animateCss called with no options)
     */

    setFoo('asdf');
    messageAnimation.enter(getError(), doneSpy);
    flush();

    expectError(getError(), 'pattern');
    expect(doneSpy).toHaveBeenCalled();
    expect(container).not.toHaveClass('md-input-invalid');
    expect(lastAnimateCall).toEqual({element: getError(), options: {}});

    /*
     * 2. Blur the input, which adds the md-input-invalid class
     *
     * Expect to animate in the pattern message
     */

    doneSpy.calls.reset();
    input.triggerHandler('blur');
    invalidAnimation.addClass(container, 'md-input-invalid', doneSpy);
    flush();

    expectError(getError(), 'pattern');
    expect(doneSpy).toHaveBeenCalled();
    expect(container).toHaveClass('md-input-invalid');
    expect(lastAnimateCall.element).toEqual(getError());
    expect(lastAnimateCall.options.event).toEqual('enter');
    expect(lastAnimateCall.options.to).toEqual({"opacity": 1, "margin-top": "0"});

    /*
     * 3. Clear the field
     *
     * Expect to animate away pattern message and animate in the required message
     */

    // Grab the pattern error before we change foo and it disappears
    var patternError = getError();

    doneSpy.calls.reset();
    messageAnimation.leave(patternError, doneSpy);
    flush();

    expect(doneSpy).toHaveBeenCalled();
    expect(lastAnimateCall.element).toEqual(patternError);
    expect(lastAnimateCall.options.event).toEqual('leave');
    expect(parseInt(lastAnimateCall.options.to["margin-top"])).toBeLessThan(0);

    setFoo('');
    expectError(getError(), 'required');

    doneSpy.calls.reset();
    messageAnimation.enter(getError(), doneSpy);
    flush();

    expect(doneSpy).toHaveBeenCalled();
    expect(container).toHaveClass('md-input-invalid');
    expect(lastAnimateCall.element).toEqual(getError());
    expect(lastAnimateCall.options.event).toEqual('enter');
    expect(lastAnimateCall.options.to).toEqual({"opacity": 1, "margin-top": "0"});
  });

  /*
   * Test Helper Functions
   */

  function compile(template) {
    el = $compile(template)(pageScope);
    angular.element(document.body).append(el);

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

  // Decorate the $animateCss service so we can spy on it and disable any CSS transitions
  function decorateAnimateCss() {
    module(function($provide) {
      $provide.decorator('$animateCss', function($delegate) {
        return jasmine.createSpy('$animateCss').and.callFake(function(element, options) {

          // Store the last call to $animateCss
          //
          // NOTE: We handle this manually because the actual code modifies the options
          // and can make the tests fail if it executes before the expect() fires
          lastAnimateCall = {
            element: element,
            options: angular.copy(options)
          };

          // Make sure any transitions happen immediately; NOTE: this is REQUIRED for the above
          // tests to pass without using window.setTimeout to wait for the animations
          if (cssTransitionsDisabled) {
            element.css('transition', '0s none');
          }

          return $delegate(element, options);
        });
      });
    });
  }

  // Setup/grab our variables
  function injectGlobals() {
    inject(function($injector) {
      $rootScope = $injector.get('$rootScope');
      $compile = $injector.get('$compile');
      $animateCss = $injector.get('$animateCss');
      $material = $injector.get('$material');

      // Grab our input animations
      invalidAnimation = $injector.get('mdInputInvalidAnimation');
      messagesAnimation = $injector.get('mdInputMessagesAnimation');
      messageAnimation = $injector.get('mdInputMessageAnimation');
    });
  }

  // Setup some custom variables for these tests
  function setupVariables() {
    pageScope = $rootScope.$new();
    cssTransitionsDisabled = true;
  }

  // Teardown our tests by resetting variables and removing our element
  function teardown() {
    cssTransitionsDisabled = false;

    el && el.remove && el.remove();
  }
});
