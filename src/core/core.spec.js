describe('material.core', function() {

  describe("detect if ng-touch module is loaded", function() {
    beforeEach(module('ngTouch', 'material.core'));

    it('should find ngTouch $swipe instance', inject(function($injector) {
      // This is check in core.js#L22
      expect($injector.has('$swipe')).toBe(true);
    }));

  });

  describe("if ng-touch module is NOT loaded", function() {
    beforeEach(module('material.core'));

    it('should find not find the ngTouch $swipe instance', inject(function($injector) {
      // This is check in core.js#L22
      expect($injector.has('$swipe')).toBe(false);
    }));

  });


});

