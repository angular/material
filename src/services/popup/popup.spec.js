describe('$materialPopup service', function() {
  beforeEach(module('material.services.popup', 'ngAnimateMock'));

  function setup(options) {
    var popup;
    inject(function($materialPopup, $rootScope) {
      $materialPopup(options).then(function(p) {
        popup = p;
      });
      $rootScope.$apply();
    });
    return popup;
  }

  describe('enter()', function() {

    it('should append to options.appendTo', inject(function($animate, $rootScope) {
      var parent = angular.element('<div id="parent">');
      var popup = setup({
        appendTo: parent,
        template: '<div id="element"></div>'
      });

      popup.enter();
      $rootScope.$digest();

      expect($animate.queue.shift().event).toBe('enter');
      expect(popup.element.parent()[0]).toBe(parent[0]); //fails
    }));

    it('should append to $rootElement by default', inject(function($rootScope, $document, $rootElement) {
      var popup = setup({
        template: '<div id="element"></div>'
      });

      popup.enter();
      $rootScope.$digest();

      expect(popup.element.parent()[0]).toBe($rootElement[0]);
    }));
  });

  describe('destroy()', function() {

    it('should leave and then destroy scope', inject(function($rootScope, $animate) {
      var popup = setup({
        template: '<div>'
      });

      popup.enter();
      $rootScope.$apply();

      var scope = popup.element.scope();
      spyOn($animate, 'leave').andCallFake(function(element, cb) { cb(); });
      spyOn(scope, '$destroy');

      popup.destroy();
      expect($animate.leave).toHaveBeenCalled();
      expect(scope.$destroy).toHaveBeenCalled();
    }));

  });
});
