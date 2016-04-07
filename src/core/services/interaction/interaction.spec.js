describe("$mdInteraction service", function() {
  var $mdInteraction;

  beforeEach(module('material.core'));

  beforeEach(inject(function(_$mdInteraction_) {
    $mdInteraction = _$mdInteraction_;
  }));

  describe("last interaction type", function() {

    it("imitates a basic keyboard interaction and checks it", function() {

      var event = document.createEvent('Event');
      event.keyCode = 37;
      event.initEvent('keydown', false, true);
      document.body.dispatchEvent(event);

      expect($mdInteraction.getLastInteractionType()).toBe('keyboard');
    });

    it("dispatches a mousedown event on the document body and checks it", function() {

      var event = document.createEvent("MouseEvent");
      event.initMouseEvent("mousedown", true, true, window, null, 0, 0, 0, 0, false, false, false, false, 0, null);
      document.body.dispatchEvent(event);

      expect($mdInteraction.getLastInteractionType()).toBe("mouse");
    });

  });
});