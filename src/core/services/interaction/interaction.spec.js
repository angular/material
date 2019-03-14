describe("$mdInteraction service", function() {

  var $mdInteraction = null;
  var $rootScope = null;
  var bodyElement = null;
  var $timeout = null;

  beforeEach(module('material.core'));

  beforeEach(inject(function($injector) {
    $mdInteraction = $injector.get('$mdInteraction');
    $rootScope = $injector.get('$rootScope');
    $timeout = $injector.get('$timeout');

    bodyElement = angular.element(document.body);
  }));

  describe("last interaction type", function() {


    it("should detect a keyboard interaction", function() {

      bodyElement.triggerHandler('keydown');

      expect($mdInteraction.getLastInteractionType()).toBe('keyboard');
    });

    it("should detect a mouse interaction", function() {

      bodyElement.triggerHandler('mousedown');

      expect($mdInteraction.getLastInteractionType()).toBe("mouse");
    });

  });

  describe('isUserInvoked', function() {

    var element = null;

    beforeEach(function() {
      element = angular.element('<button>Click</button>');

      bodyElement.append(element);
    });

    afterEach(function() {
      element.remove();
    });

    it('should be true when programmatically focusing an element', function() {
      element.focus();

      expect($mdInteraction.isUserInvoked()).toBe(false);
    });

    it('should be false when focusing an element through keyboard', function() {

      // Fake a focus event triggered by a keyboard interaction.
      bodyElement.triggerHandler('keydown');
      element.focus();

      expect($mdInteraction.isUserInvoked()).toBe(true);
    });

    it('should allow passing a custom check delay', function(done) {
      bodyElement.triggerHandler('keydown');

      // The keyboard interaction is still in the same tick, so the interaction happened earlier than 15ms (as default)
      expect($mdInteraction.isUserInvoked()).toBe(true);

      setTimeout(function() {
        // Expect the keyboard interaction to be older than 5ms (safer than exactly 10ms) as check time.
        expect($mdInteraction.isUserInvoked(5)).toBe(false);

        done();
      }, 10);
    });

  });

  describe('when $rootScope is destroyed', function () {

    var _initialTouchStartEvent = document.documentElement.ontouchstart;

    beforeAll(function () {
      document.documentElement.ontouchstart = function () {};
    });

    beforeEach(function () {
      $mdInteraction.lastInteractionType = 'initial';
      $rootScope.$destroy();
    });

    afterAll(function () {
      document.documentElement.ontouchstart = _initialTouchStartEvent;
    });

    it('should remove mousedown events', function () {
      bodyElement.triggerHandler('mousedown');
      expect($mdInteraction.getLastInteractionType()).toEqual('initial');
    });

    it('should remove keydown events', function () {
      bodyElement.triggerHandler('keydown');
      expect($mdInteraction.getLastInteractionType()).toEqual('initial');
    });

    it('should remove touchstart events', function () {
      bodyElement.triggerHandler('touchstart');
      expect($mdInteraction.getLastInteractionType()).toEqual('initial');
    });

  });

});
