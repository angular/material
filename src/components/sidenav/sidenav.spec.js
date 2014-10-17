describe('mdSidenav', function() {
  beforeEach(module('material.components.sidenav', 'ngAnimateMock', function($provide) {
    $provide.value('$$rAF', function(cb) { cb(); });
  }));

  function setup(attrs) {
    var el;
    inject(function($compile, $rootScope) {
      var parent = angular.element('<div>');
      el = angular.element('<md-sidenav ' + (attrs||'') + '>');
      parent.append(el);
      $compile(parent)($rootScope);
      $rootScope.$apply();
    });
    return el;
  }

  describe('directive', function() {

    it('should bind isOpen attribute', inject(function($rootScope, $animate) {
      var el = setup('is-open="show"');
      $rootScope.$apply('show = true');

      $animate.triggerCallbacks();
      expect(el.hasClass('closed')).toBe(false);
      expect(el.parent().find('md-backdrop').length).toBe(1);

      $rootScope.$apply('show = false');
      $animate.triggerCallbacks();
      expect(el.hasClass('closed')).toBe(true);
      expect(el.parent().find('md-backdrop').length).toBe(0);
    }));

    it('should close on escape', inject(function($rootScope, $animate, $mdConstant, $timeout) {
      var el = setup('is-open="show"');
      $rootScope.$apply('show = true');

      $animate.triggerCallbacks();
      TestUtil.triggerEvent(el, 'keydown', { keyCode: $mdConstant.KEY_CODE.ESCAPE });
      $timeout.flush();
      expect($rootScope.show).toBe(false);
    }));

    it('should close on backdrop click', inject(function($rootScope, $animate, $timeout) {
      var el = setup('is-open="show"');
      $rootScope.$apply('show = true');

      $animate.triggerCallbacks();
      el.parent().find('md-backdrop').triggerHandler('click');
      $timeout.flush();
      expect($rootScope.show).toBe(false);
    }));

    it('should focus sidenav on open', inject(function($rootScope, $animate, $document) {
      TestUtil.mockElementFocus(this);
      var el = setup('is-open="show"');
      $rootScope.$apply('show = true');

      $animate.triggerCallbacks();
      expect($document.activeElement).toBe(el[0]);
    }));

    it('should lock open when is-locked-open is true', inject(function($rootScope, $animate, $document) {
      var el = setup('is-open="show" is-locked-open="lock"');
      expect(el.hasClass('locked-open')).toBe(false);
      $rootScope.$apply('lock = true');
      expect(el.hasClass('locked-open')).toBe(true);
      $rootScope.$apply('show = true');
      $animate.triggerCallbacks();
      expect(el.parent().find('md-backdrop').hasClass('locked-open')).toBe(true);
    }));

    it('should expose $mdMedia service as $media local in is-locked-open attribute', function() {
      var mdMediaSpy = jasmine.createSpy('$mdMedia');
      module(function($provide) {
        $provide.value('$mdMedia', mdMediaSpy);
      });
      inject(function($rootScope, $animate, $document, $mdMedia) {
        var el = setup('is-locked-open="$media(123)"');
        expect($mdMedia).toHaveBeenCalledWith(123);
      });
    });

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
      expect(el.hasClass('closed')).toBe(true);

      controller.open();
      scope.$apply();

      expect(el.hasClass('closed')).toBe(false);

      controller.close();
      scope.$apply();

      expect(el.hasClass('closed')).toBe(true);

      controller.toggle();
      scope.$apply();

      expect(el.hasClass('closed')).toBe(false);
    });

  });

  describe('$mdSidenav Service', function() {
    it('should grab instance', inject(function($mdSidenav) {
      var el = setup('component-id="left"');
      var scope = el.isolateScope();

      var instance = $mdSidenav('left');
      expect(instance).toBeTruthy();

      instance.open();
      scope.$apply();

      expect(el.hasClass('closed')).toBe(false);

      instance.close();
      scope.$apply();

      expect(el.hasClass('closed')).toBe(true);

      instance.toggle();
      scope.$apply();

      expect(el.hasClass('closed')).toBe(false);

      instance.toggle();
      scope.$apply();

      expect(el.hasClass('closed')).toBe(true);
    }));
  });

});
