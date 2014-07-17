describe('materialSidenav', function() {
  beforeEach(module('material.components.sidenav'));

  function setup(attrs) {
    var el;
    inject(function($compile, $rootScope) {
      el = $compile('<material-sidenav '+(attrs || '')+'></material-sidenav>')($rootScope.$new());
      $rootScope.$apply();
    });
    return el;
  }

  describe('directive', function() {
  });

  describe('controller', function() {
    it('should create controller', function() {
      var el = setup('');
      var controller = el.controller('materialSidenav');
      expect(controller).not.toBe(undefined);
    });

    it('should open and close and toggle', function() {
      var el = setup('');
      var scope = el.isolateScope();
      var controller = el.controller('materialSidenav');

      // Should start closed
      expect(el.hasClass('open')).toBe(false);

      controller.open();
      scope.$apply();

      expect(el.hasClass('open')).toBe(true);

      controller.close();
      scope.$apply();

      expect(el.hasClass('open')).toBe(false);

      controller.toggle();
      scope.$apply();

      expect(el.hasClass('open')).toBe(true);

      controller.toggle();
      scope.$apply();

      expect(el.hasClass('open')).toBe(false);
    });

    it('should add body class', inject(function($document) {
      var el = setup('');
      var scope = el.isolateScope();
      var controller = el.controller('materialSidenav');

      controller.open();
      scope.$apply();

      expect($document[0].body.classList.contains('material-sidenav-open')).toBe(true);
    }));

    it('should close on body click', inject(function($document, $timeout) {
      var el = setup('');
      var scope = el.isolateScope();
      var controller = el.controller('materialSidenav');

      controller.open();
      scope.$apply();

      $timeout.flush();

      $($document[0].body).trigger('click');
      expect(controller.isOpen()).toBe(false);
      expect($document[0].body.classList.contains('material-sidenav-open')).toBe(false);
    }));
  });

  describe('$materialSidenav Service', function() {
    it('should grab instance', inject(function($materialSidenav) {
      var el = setup('component-id="left"');
      var scope = el.isolateScope();

      var instance = $materialSidenav('left');
      expect(instance).toBeTruthy();

      instance.open();
      scope.$apply();

      expect(el.hasClass('open')).toBe(true);

      instance.close();
      scope.$apply();

      expect(el.hasClass('open')).toBe(false);

      instance.toggle();
      scope.$apply();

      expect(el.hasClass('open')).toBe(true);

      instance.toggle();
      scope.$apply();

      expect(el.hasClass('open')).toBe(false);
    }));
  });

});
