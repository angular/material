describe('mdSidenav', function() {
  beforeEach(module('material.components.sidenav'));

  function setup(attrs, skipInitialDigest) {
    var el;
    inject(function($compile, $rootScope) {
      var parent = angular.element('<div>');
      el = angular.element('<md-sidenav ' + (attrs || '') + '>');
      parent.append(el);
      $compile(parent)($rootScope);
      !skipInitialDigest && $rootScope.$apply();
    });
    return el;
  }

  describe('directive', function() {

    it('should have `._md` class indicator', inject(function($rootScope) {
      var element = setup('md-is-open="show"');

      $rootScope.$apply('show = true');
      expect(element.hasClass('_md')).toBe(true);
    }));

    it('should bind isOpen attribute', inject(function($rootScope, $material) {
      var el = setup('md-is-open="show"');
      $rootScope.$apply('show = true');

      $material.flushOutstandingAnimations();
      expect(el.hasClass('md-closed')).toBe(false);
      expect(el.parent().find('md-backdrop').length).toBe(1);

      $rootScope.$apply('show = false');
      $material.flushOutstandingAnimations();
      expect(el.hasClass('md-closed')).toBe(true);
      expect(el.parent().find('md-backdrop').length).toBe(0);
    }));

    it('should close on escape', inject(function($rootScope, $material, $mdConstant, $timeout) {
      var el = setup('md-is-open="show"');
      $rootScope.$apply('show = true');

      $material.flushOutstandingAnimations();
      el.parent().triggerHandler({
        type: 'keydown',
        keyCode: $mdConstant.KEY_CODE.ESCAPE
      });
      $timeout.flush();
      expect($rootScope.show).toBe(false);
    }));

    it('should close on backdrop click', inject(function($rootScope, $material, $timeout) {
      var el = setup('md-is-open="show"');
      $rootScope.$apply('show = true');

      $material.flushOutstandingAnimations();
      el.parent().find('md-backdrop').triggerHandler('click');
      $timeout.flush();
      expect($rootScope.show).toBe(false);
    }));

    it('should show a backdrop by default', inject(function($rootScope, $material) {
      var el = setup('md-is-open="show"');
      $rootScope.$apply('show = true');

      $material.flushOutstandingAnimations();

      var backdrop = el.parent().find('md-backdrop');
      expect(backdrop.length).toBe(1);
    }));

    it('should not show a backdrop if md-disable-backdrop is set to true', inject(function($rootScope, $material) {
      var el = setup('md-is-open="show" md-disable-backdrop');
      $rootScope.$apply('show = true');

      $material.flushOutstandingAnimations();

      var backdrop = el.parent().find('md-backdrop');
      expect(backdrop.length).toBe(0);
    }));

    it('should focus sidenav on open', inject(function($rootScope, $material, $document) {
      jasmine.mockElementFocus(this);
      var el = setup('md-is-open="show"');
      $rootScope.$apply('show = true');

      $material.flushOutstandingAnimations();
      expect($document.activeElement).toBe(el[0]);
    }));

    it('should focus child with md-sidenav-focus', inject(function($rootScope, $material, $document, $compile) {
      jasmine.mockElementFocus(this);
      var parent = angular.element('<div>');
      var markup = '<md-sidenav md-is-open="show">' +
                   '    <md-input-container><label>Label</label>' +
                   '      <input type="text" md-sidenav-focus>' +
                   '    </md-input-container>' +
                   '<md-sidenav>';
      var sidenavEl = angular.element(markup);
      parent.append(sidenavEl);
      $compile(parent)($rootScope);
      $rootScope.$apply('show = true');

      var focusEl = sidenavEl.find('input');
      $material.flushOutstandingAnimations();
      expect($document.activeElement).toBe(focusEl[0]);
    }));

    it('should focus child with md-autofocus', inject(function($rootScope, $material, $document, $compile) {
      jasmine.mockElementFocus(this);
      var parent = angular.element('<div>');
      var markup = '<md-sidenav md-is-open="show">' +
        '<md-input-container><label>Label</label>' +
        '<input type="text" md-autofocus>' +
        '</md-input-container>' +
        '<md-sidenav>';
      var sidenavEl = angular.element(markup);
      parent.append(sidenavEl);
      $compile(parent)($rootScope);
      $rootScope.$apply('show = true');

      var focusEl = sidenavEl.find('input');
      $material.flushOutstandingAnimations();
      expect($document.activeElement).toBe(focusEl[0]);
    }));

    it('should focus on last md-sidenav-focus element', inject(function($rootScope, $material, $document, $compile) {
      jasmine.mockElementFocus(this);
      var parent = angular.element('<div>');
      var markup = '<md-sidenav md-is-open="show">' +
        '<md-button md-sidenav-focus>Button</md-button>' +
        '<md-input-container><label>Label</label>' +
        '<input type="text" md-sidenav-focus>' +
        '</md-input-container>' +
        '<md-sidenav>';
      var sidenavEl = angular.element(markup);
      parent.append(sidenavEl);
      $compile(parent)($rootScope);
      $rootScope.$apply('show = true');

      $material.flushOutstandingAnimations();
      var focusEl = sidenavEl.find('input');
      expect($document.activeElement).toBe(focusEl[0]);
    }));

    it('should lock open when is-locked-open is true', inject(function($rootScope, $material, $document) {
      var el = setup('md-is-open="show" md-is-locked-open="lock"');
      expect(el.hasClass('md-locked-open')).toBe(false);
      $rootScope.$apply('lock = true');
      expect(el.hasClass('md-locked-open')).toBe(true);
      $rootScope.$apply('show = true');
      $material.flushOutstandingAnimations();
      expect(el.parent().find('md-backdrop').hasClass('md-locked-open')).toBe(true);
    }));

    it('should expose $mdMedia service as $media local in is-locked-open attribute', function() {
      var mdMediaSpy = jasmine.createSpy('$mdMedia');
      module(function($provide) {
        $provide.value('$mdMedia', mdMediaSpy);
      });
      inject(function($rootScope, $animate, $document, $mdMedia) {
        var el = setup('md-is-locked-open="$mdMedia(123)"');
        expect($mdMedia).toHaveBeenCalledWith(123);
      });
    });

    it('should trigger a resize event when opening',
      inject(function($rootScope, $animate, $$rAF, $window) {
        var el = setup('md-is-open="show"');
        var obj = { callback: function() {} };

        spyOn(obj, 'callback');
        angular.element($window).on('resize', obj.callback);

        $rootScope.$apply('show = true');
        $animate.flush();
        $$rAF.flush();

        expect(obj.callback).toHaveBeenCalled();
        angular.element($window).off('resize', obj.callback);
      })
    );

    describe('parent scroll prevention', function() {
      it('should prevent scrolling on the parent element', inject(function($rootScope) {
        var parent = setup('md-is-open="isOpen"').parent()[0];

        expect(parent.style.overflow).toBeFalsy();
        $rootScope.$apply('isOpen = true');
        expect(parent.style.overflow).toBe('hidden');
      }));

      it('should prevent scrolling on a custom element', inject(function($compile, $rootScope) {
        var preventScrollTarget = angular.element('<div id="prevent-scroll-target"></div>');
        var parent = angular.element(
          '<div>' +
            '<md-sidenav md-disable-scroll-target="#prevent-scroll-target" md-is-open="isOpen"></md-sidenav>' +
          '</div>'
        );

        preventScrollTarget.append(parent);
        angular.element(document.body).append(preventScrollTarget);
        $compile(preventScrollTarget)($rootScope);

        expect(preventScrollTarget[0].style.overflow).toBeFalsy();
        expect(parent[0].style.overflow).toBeFalsy();

        $rootScope.$apply('isOpen = true');
        expect(preventScrollTarget[0].style.overflow).toBe('hidden');
        expect(parent[0].style.overflow).toBeFalsy();
        preventScrollTarget.remove();
      }));

      it('should log a warning and fall back to the parent if the custom scroll target does not exist',
        inject(function($rootScope, $log) {
          spyOn($log, 'warn');
          var parent = setup('md-is-open="isOpen" md-disable-scroll-target="does-not-exist"').parent()[0];

          $rootScope.$apply('isOpen = true');
          expect($log.warn).toHaveBeenCalled();
          expect(parent.style.overflow).toBe('hidden');
        }));
    });

  });

  describe('controller', function() {
    it('should create controller', function() {
      var el = setup();
      var controller = el.controller('mdSidenav');
      expect(controller).not.toBe(undefined);
    });

    it('should open and close and toggle', inject(function($timeout) {
      var el = setup();
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

  describe("focus", function() {

    var $material, $mdInteraction, $mdConstant;
    var triggerElement;

    beforeEach(inject(function($injector) {
      $material = $injector.get('$material');
      $mdInteraction = $injector.get('$mdInteraction');
      $mdConstant = $injector.get('$mdInteraction');

      triggerElement = angular.element('<button>Trigger Element</button>');
      document.body.appendChild(triggerElement[0]);
    }));

    afterEach(function() {
      triggerElement.remove();
    });

    function dispatchEvent(eventName) {
      angular.element(document.body).triggerHandler(eventName);
    }

    function flush() {
      $material.flushInterimElement();
    }

    function blur() {
      if ('documentMode' in document) {
        document.body.focus();
      } else {
        triggerElement.blur();
      }
    }

    it("should restore after sidenav triggered by keyboard", function() {
      var sidenavEl = setup('');
      var controller = sidenavEl.controller('mdSidenav');

      triggerElement.focus();

      dispatchEvent('keydown');

      controller.$toggleOpen(true);
      flush();

      blur();

      controller.$toggleOpen(false);
      flush();

      expect($mdInteraction.getLastInteractionType()).toBe("keyboard");
      expect(document.activeElement).toBe(triggerElement[0]);
    });

    it("should not restore after sidenav triggered by mouse", function() {
      var sidenavEl = setup('');
      var controller = sidenavEl.controller('mdSidenav');

      triggerElement.focus();

      dispatchEvent('mousedown');

      controller.$toggleOpen(true);
      flush();

      blur();

      controller.$toggleOpen(false);
      flush();

      expect($mdInteraction.getLastInteractionType()).toBe("mouse");
      expect(document.activeElement).not.toBe(triggerElement[0]);
    });

  });

  describe("controller Promise API", function() {
    var $material, $rootScope, $timeout;

    function flush() {
      $material.flushInterimElement();
    }

    beforeEach(inject(function(_$material_, _$rootScope_, _$timeout_) {
      $material = _$material_;
      $rootScope = _$rootScope_;
      $timeout = _$timeout_;
    }));

    it('should open(), close(), and toggle() with promises', function() {
      var el = setup();
      var scope = el.isolateScope();
      var controller = el.controller('mdSidenav');

      var openDone = 0, closeDone = 0, toggleDone = 0;
      var onOpen = function() {
        openDone++;
      };
      var onClose = function() {
        closeDone++;
      };
      var onToggle = function() {
        toggleDone++;
      };

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

    it('should open() to work multiple times before close()', function() {
      var el = setup();
      var controller = el.controller('mdSidenav');

      var openDone = 0, closeDone = 0;
      var onOpen = function() {
        openDone++;
      };
      var onClose = function() {
        closeDone++;
      };

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
    var $rootScope, $timeout;

    beforeEach(inject(function(_$rootScope_, _$timeout_) {
      $rootScope = _$rootScope_;
      $timeout = _$timeout_;
    }));

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

    it('exposes state', inject(function($mdSidenav) {
      var el = setup('md-component-id="stateTest" md-is-open="shouldOpen" md-is-locked-open="shouldLockOpen"');
      var scope = el.scope();

      var instance = $mdSidenav('stateTest');
      expect(instance.isOpen()).toBe(false);
      expect(instance.isLockedOpen()).toBe(false);

      scope.shouldOpen = true;
      scope.shouldLockOpen = true;
      scope.$digest();
      expect(instance.isOpen()).toBe(true);
      expect(instance.isLockedOpen()).toBe(true);

      scope.shouldOpen = false;
      scope.shouldLockOpen = true;
      scope.$digest();
      expect(instance.isOpen()).toBe(false);
      expect(instance.isLockedOpen()).toBe(true);
    }));

  });

  describe('$mdSidenav lookups', function() {
    var $rootScope, $timeout, $mdSidenav;

    beforeEach(inject(function(_$rootScope_, _$timeout_, _$mdSidenav_) {
      $rootScope = _$rootScope_;
      $timeout = _$timeout_;
      $mdSidenav = _$mdSidenav_;
    }));

    it('should find an instantiation using `$mdSidenav(id)`', function() {
      var el = setup('md-component-id="left"');
      $timeout.flush();

      // Lookup instance still available in the component registry
      var instance = $mdSidenav('left');
      expect(instance).toBeTruthy();
    });

    it('should support data bindings', function() {
      // It should work on init.
      $rootScope.leftComponentId = 'left';
      setup('md-component-id="{{ leftComponentId }}"', true);
      expect($mdSidenav($rootScope.leftComponentId, false)).toBeTruthy();

      // It should also work if the data binding has changed.
      $rootScope.$apply('leftComponentId = "otherLeft"');
      expect($mdSidenav($rootScope.leftComponentId, false)).toBeTruthy();
    });

    it('should find a deferred instantiation using `$mdSidenav(id, true)`', function() {
      var instance;

      // Lookup deferred (not existing) instance
      $mdSidenav('left', true).then(function(inst) {
        instance = inst;
      });
      expect(instance).toBeUndefined();

      // Instantiate `left` sidenav component
      var el = setup('md-component-id="left"');
      $timeout.flush();

      expect(instance).toBeDefined();
      expect(instance.isOpen()).toBeFalsy();

      // Lookup instance still available in the component registry
      instance = $mdSidenav('left', true);
      expect(instance).toBeTruthy();
    });

    it('should find a deferred instantiation using `$mdSidenav().waitFor(id)` ', function() {
      var instance;

      // Lookup deferred (not existing) instance
      $mdSidenav().waitFor('left').then(function(inst) {
        instance = inst;
      });
      expect(instance).toBeUndefined();

      // Instantiate `left` sidenav component
      var el = setup('md-component-id="left"');
      $timeout.flush();

      expect(instance).toBeDefined();
      expect(instance.isOpen()).toBeFalsy();

      // Lookup instance still available in the component registry
      instance = undefined;
      instance = $mdSidenav('left');

      expect(instance).toBeTruthy();
    });

    it('should not find a lazy instantiation without waiting `$mdSidenav(id)`', function() {
      var instance = $mdSidenav('left');
      expect(instance.isOpen).toBeDefined();    // returns legacy API with noops

      instance = $mdSidenav('left', false);     // since enableWait == false, return false
      expect(instance).toBeFalsy();

      // Instantiate `left` sidenav component
      var el = setup('md-component-id="left"');
      $timeout.flush();

      instance = $mdSidenav('left');            // returns instance
      expect(instance).toBeDefined();
      expect(instance.isOpen()).toBeFalsy();
    });

    it('should not find a lazy instantiation without waiting `$mdSidenav().find(id)`', function() {
      var instance = $mdSidenav().find('left');
      expect(instance).toBeUndefined();

      // Instantiate `left` sidenav component
      var el = setup('md-component-id="left"');
      $timeout.flush();

      instance = $mdSidenav().find('left');
      expect(instance).toBeDefined();
      expect(instance.isOpen()).toBeFalsy();
    });

    describe('onClose', function () {
      it('should call callback on escape', inject(function($mdSidenav, $rootScope, $material, $mdConstant, $timeout) {
        var el = setup('md-component-id="left" md-is-open="show"');
        var callback = jasmine.createSpy("callback spy");

        $mdSidenav('left')
          .onClose(callback);

        $rootScope.$apply('show = true');

        $material.flushOutstandingAnimations();
        el.parent().triggerHandler({
          type: 'keydown',
          keyCode: $mdConstant.KEY_CODE.ESCAPE
        });
        $timeout.flush();
        expect($rootScope.show).toBe(false);
        expect(callback).toHaveBeenCalled();
      }));

      it('should call callback on backdrop click', inject(function($mdSidenav, $rootScope, $material, $timeout) {
        var el = setup('md-component-id="left" md-is-open="show"');
        var callback = jasmine.createSpy("callback spy");

        $mdSidenav('left')
          .onClose(callback);

        $rootScope.$apply('show = true');

        $material.flushOutstandingAnimations();
        el.parent().find('md-backdrop').triggerHandler('click');
        $timeout.flush();
        expect($rootScope.show).toBe(false);
        expect(callback).toHaveBeenCalled();
      }));

      it('should call callback on close', inject(function($mdSidenav, $rootScope, $material, $timeout) {
        var el = setup('md-component-id="left"');
        var callback = jasmine.createSpy("callback spy");

        $mdSidenav('left')
          .onClose(callback)
          .open();

        $timeout.flush();

        expect(el.hasClass('md-closed')).toBe(false);

        $mdSidenav('left')
          .close();

        $timeout.flush();

        expect(callback).toHaveBeenCalled();
      }));
    });
  });


});
