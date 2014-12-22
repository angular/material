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
      var el = setup('md-is-open="show"');
      $rootScope.$apply('show = true');

      $animate.triggerCallbacks();
      expect(el.hasClass('md-closed')).toBe(false);
      expect(el.parent().find('md-backdrop').length).toBe(1);

      $rootScope.$apply('show = false');
      $animate.triggerCallbacks();
      expect(el.hasClass('md-closed')).toBe(true);
      expect(el.parent().find('md-backdrop').length).toBe(0);
    }));

    it('should close on escape', inject(function($rootScope, $animate, $mdConstant, $timeout) {
      var el = setup('md-is-open="show"');
      $rootScope.$apply('show = true');

      $animate.triggerCallbacks();
      el.parent().triggerHandler({
        type: 'keydown',
        keyCode: $mdConstant.KEY_CODE.ESCAPE
      });
      $timeout.flush();
      expect($rootScope.show).toBe(false);
    }));

    it('should close on backdrop click', inject(function($rootScope, $animate, $timeout) {
      var el = setup('md-is-open="show"');
      $rootScope.$apply('show = true');

      $animate.triggerCallbacks();
      el.parent().find('md-backdrop').triggerHandler('click');
      $timeout.flush();
      expect($rootScope.show).toBe(false);
    }));

    it('should focus sidenav on open', inject(function($rootScope, $animate, $document) {
      TestUtil.mockElementFocus(this);
      var el = setup('md-is-open="show"');
      $rootScope.$apply('show = true');

      $animate.triggerCallbacks();
      expect($document.activeElement).toBe(el[0]);
    }));

    it('should lock open when is-locked-open is true', inject(function($rootScope, $animate, $document) {
      var el = setup('md-is-open="show" md-is-locked-open="lock"');
      expect(el.hasClass('md-locked-open')).toBe(false);
      $rootScope.$apply('lock = true');
      expect(el.hasClass('md-locked-open')).toBe(true);
      $rootScope.$apply('show = true');
      $animate.triggerCallbacks();
      expect(el.parent().find('md-backdrop').hasClass('md-locked-open')).toBe(true);
    }));

    it('should expose $mdMedia service as $media local in is-locked-open attribute', function() {
      var mdMediaSpy = jasmine.createSpy('$mdMedia');
      module(function($provide) {
        $provide.value('$mdMedia', mdMediaSpy);
      });
      inject(function($rootScope, $animate, $document, $mdMedia) {
        var el = setup('md-is-locked-open="$media(123)"');
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

    it('should open and close and toggle', inject(function($timeout) {
      var el = setup('');
      var scope = el.isolateScope();
      var controller = el.controller('mdSidenav');

      // Should start closed
      expect(el.hasClass('md-closed')).toBe(true);

      controller.open();
      scope.$apply();

      expect(el.hasClass('md-closed')).toBe(false);

      controller.close();
      scope.$apply();

      expect(el.hasClass('md-closed')).toBe(true);

      controller.toggle();
      scope.$apply();

      expect(el.hasClass('md-closed')).toBe(false);
    }));

  });

  describe("controller Promise API", function() {
    var $animate, $rootScope;

      function flush() {
        if ( !$rootScope.$$phase) {
          $rootScope.$apply();
        }
        $animate.triggerCallbacks();
      }

    beforeEach( inject(function(_$animate_,_$rootScope_,_$timeout_) {
        $animate = _$animate_;
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
    }));


    it('should open(), close(), and toggle() with promises', function () {
      var el = setup('');
      var scope = el.isolateScope();
      var controller = el.controller('mdSidenav');

      var openDone = 0, closeDone = 0, toggleDone = 0;
      var onOpen = function() { openDone++; };
      var onClose = function() { closeDone++; };
      var onToggle = function() { toggleDone++; };

      controller
        .open()
        .then(onOpen)
        .then(controller.close)
        .then(onClose);

      flush();
      expect(openDone).toBe(1);
      flush();
      expect(closeDone).toBe(1);

      controller
        .close()
        .then(onClose);

      flush();
      expect(closeDone).toBe(2);
      expect(scope.isOpen).toBe(false);

      controller
        .toggle()
        .then(onToggle);

      flush();
      expect(toggleDone).toBe(1);
      expect(scope.isOpen).toBe(true);
    });


    it('should open() to work multiple times before close()', function () {
      var el = setup('');
      var controller = el.controller('mdSidenav');

      var openDone = 0, closeDone = 0;
      var onOpen = function() { openDone++; };
      var onClose = function() { closeDone++; };

      controller
        .open()
        .then(onOpen)
        .then(controller.open)
        .then(onOpen);

      flush();
      expect(openDone).toBe(2);
      expect(closeDone).toBe(0);
      expect(el.hasClass('md-closed')).toBe(false);

      controller
        .close()
        .then(onClose);

      flush();
      expect(openDone).toBe(2);
      expect(closeDone).toBe(1);
      expect(el.hasClass('md-closed')).toBe(true);
    });

  });

  describe('$mdSidenav Service', function() {
    it('should grab instance', inject(function($mdSidenav) {
      var el = setup('md-component-id="left"');
      var scope = el.isolateScope();

      var instance = $mdSidenav('left');
      expect(instance).toBeTruthy();

      instance.open();
      scope.$apply();

      expect(el.hasClass('md-closed')).toBe(false);

      instance.close();
      scope.$apply();

      expect(el.hasClass('md-closed')).toBe(true);

      instance.toggle();
      scope.$apply();

      expect(el.hasClass('md-closed')).toBe(false);

      instance.toggle();
      scope.$apply();

      expect(el.hasClass('md-closed')).toBe(true);
    }));
  });

  describe('$mdComponentRegistry', function() {

    it('should register component when element is created', inject(function($mdComponentRegistry) {
      var el = setup('md-component-id="left"');
      var instance = $mdComponentRegistry.get('left');

      expect(instance).toNotBe(null);
    }));

    it('should deregister component when element is destroyed', inject(function($mdComponentRegistry) {
      var el = setup('md-component-id="left"');
      el.triggerHandler('$destroy');

      var instance = $mdComponentRegistry.get('left');
      expect(instance).toBe(null);
    }));

    it('should wait for component registration', inject(function($mdComponentRegistry, $timeout) {
      var promise = $mdComponentRegistry.when('left');
      var el = setup('md-component-id="left"');
      var instance = $mdComponentRegistry.get('left');
      var resolved = false;

      promise.then(function(inst){   resolved = inst;  });
      $timeout.flush();

      expect(instance).toBe(resolved);
    }));

    it('should wait for next component registration', inject(function($mdComponentRegistry, $timeout) {
      var resolved, count = 0;
      var promise = $mdComponentRegistry.when('left');
      var el = setup('md-component-id="left"');

      promise.then(function(inst){ count += 1; });
      $timeout.flush();

      el.triggerHandler('$destroy');

      el = setup('md-component-id="left"');
      promise = $mdComponentRegistry.when('left');
      promise.then(function(inst){
        resolved = inst;
        count += 1;
      });

      $timeout.flush();

      expect(resolved).toBeDefined();
      expect(count).toBe(2);

    }));

    it('should not find a component without an id', inject(function($mdComponentRegistry, $timeout) {
      var el = setup();

      var resolved, count = 0;
      var promise = $mdComponentRegistry.when('left');
      var instance = $mdComponentRegistry.get('left');

      promise.then(function(inst){ resolved = inst; count += 1; });
      $timeout.flush();

      expect(count).toBe(0);
      expect(instance).toBe(null);
      expect(resolved).toBeUndefined();

    }));

    it('should properly destroy without a md-component-id', inject(function($mdComponentRegistry, $timeout) {
      var el = setup();

      el.triggerHandler('$destroy');

    }));

  });
});
