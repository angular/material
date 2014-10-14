describe('mdSidenav', function() {
  beforeEach(module('material.components.sidenav', function($provide) {
    $provide.value('$$rAF', function(cb) { cb(); });
  }));

  function setup(attrs) {
    var el;
    inject(function($compile, $rootScope) {
      el = $compile('<md-sidenav '+(attrs || '')+'></md-sidenav>')($rootScope.$new());
      $rootScope.$apply();
    });
    return el;
  }

  describe('directive', function() {
  });

  describe('controller', function() {
    it('should create controller', function() {
      var el = setup('');
      var controller = el.controller('mdSidenav');
      expect(controller).not.toBe(undefined);
    });

    it('should open and close and toggle', function() {
      var el = setup('');
      var scope = el.isolateScope();
      var controller = el.controller('mdSidenav');

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
    });

    it('should add backdrop', inject(function($timeout) {
      var el = setup('');
      var parent = angular.element('<div>').append(el);
      var scope = el.isolateScope();
      var ctrl = el.controller('mdSidenav');
      var backdrop;


      ctrl.open();
      scope.$apply();

      backdrop = parent.find('md-backdrop');
      expect(backdrop.length).toBe(1);

      backdrop.triggerHandler('click');
      $timeout.flush();
      expect(el.hasClass('open')).toBe(false);
      backdrop = parent.find('md-backdrop');
      expect(backdrop.length).toBe(0);
    }));

  });

  describe('$mdSidenav Service', function() {
    it('should grab instance', inject(function($mdSidenav) {
      var el = setup('component-id="left"');
      var scope = el.isolateScope();

      var instance = $mdSidenav('left');
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
