describe("$mdInteraction service", function() {
  var $mdInteraction;

  beforeEach(module('material.core'));

  beforeEach(inject(function($injector) {
    $mdInteraction = $injector.get('$mdInteraction');
  }));

  describe("last interaction type", function() {

    var bodyElement = null;

    beforeEach(function() {
      bodyElement = angular.element(document.body);
    });

    it("should detect a keyboard interaction", function() {

      bodyElement.triggerHandler('keydown');

      expect($mdInteraction.getLastInteractionType()).toBe('keyboard');
    });

    it("should detect a mouse interaction", function() {

      bodyElement.triggerHandler('mousedown');

      expect($mdInteraction.getLastInteractionType()).toBe("mouse");
    });

  });
});