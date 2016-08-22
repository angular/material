describe('$mdPanel', function() {
  var $mdPanel, $rootScope, $rootEl, $templateCache, $q, $material, $mdConstant,
      $mdUtil, $animate, $$rAF, $window;
  var panelRef;
  var attachedElements = [];
  var PANEL_WRAPPER_CLASS = '.md-panel-outer-wrapper';
  var PANEL_EL = '.md-panel';
  var HIDDEN_CLASS = '_md-panel-hidden';
  var FOCUS_TRAPS_CLASS = '._md-panel-focus-trap';
  var FULLSCREEN_CLASS = '_md-panel-fullscreen';
  var BACKDROP_CLASS = '._md-panel-backdrop';
  var DEFAULT_TEMPLATE = '<div>Hello World!</div>';
  var DEFAULT_CONFIG = { template: DEFAULT_TEMPLATE };
  var PANEL_ID_PREFIX = 'panel_';
  var SCROLL_MASK_CLASS = '.md-scroll-mask';

  /**
   * @param {!angular.$injector} $injector
   * @ngInject
   */
  var injectLocals = function($injector) {
    $mdPanel = $injector.get('$mdPanel');
    $rootScope = $injector.get('$rootScope');
    $rootEl = $injector.get('$rootElement');
    $templateCache = $injector.get('$templateCache');
    $q = $injector.get('$q');
    $material = $injector.get('$material');
    $mdConstant = $injector.get('$mdConstant');
    $mdUtil = $injector.get('$mdUtil');
    $animate = $injector.get('$animate');
    $window = $injector.get('$window');
    $$rAF = $injector.get('$$rAF');
  };

  beforeEach(function() {
    module('material.components.panel', 'ngSanitize');

    inject(injectLocals);
    $animate.enabled(false);

    // By default, the panel is attached to $rootElement, so add it to the DOM.
    attachToBody($rootEl);
  });

  // Add custom matchers.
  beforeEach(function() {
    jasmine.addMatchers({
      /**
       * Asserts that two values are within a range of each other. This is
       * used for testing relative positioning. If no range is set, defaults
       * to 1.
       *
       * Example Use:
       * expect(panelTop).toBeApproximately(buttonTop, 1);
       */
      toBeApproximately: function() {
        return {
          compare: function(actual, expected, opt_epsilon) {
            var epsilon = opt_epsilon || 1;

            var actualNumber = parseFloat(actual);
            var expectedNumber = parseFloat(expected);

            var pass = Math.abs(expectedNumber - actualNumber) < epsilon;
            var not = pass ? 'not ' : '';

            return {
              pass: pass,
              message: 'Expected ' + expected + not + ' to be within ' +
              epsilon + ' of ' + actual
            };
          }
        };
      }
    });
  });

  afterEach(function() {
    attachedElements.forEach(function(el) {
      el.remove();
    });
    attachedElements = [];

    if (panelRef && panelRef.isAttached) {
      panelRef.close();
    }

    // TODO(ErinCoughlan) - Remove when close destroys.
    panelRef = null;
    $animate.enabled(true);
  });

  it('should create and open a basic panel', function() {
    openPanel(DEFAULT_CONFIG);

    expect(PANEL_EL).toExist();
    expect(panelRef.isAttached).toEqual(true);

    closePanel();

    expect(PANEL_EL).not.toExist();
    expect(panelRef.isAttached).toEqual(false);
  });

  it('should add and remove a panel from the DOM', function() {
    expect(PANEL_EL).not.toExist();

    openPanel(DEFAULT_CONFIG);

    expect(PANEL_EL).toExist();

    closePanel();

    expect(PANEL_EL).not.toExist();
  });

  it('should hide and show a panel in the DOM', function() {
    openPanel(DEFAULT_CONFIG);

    expect(PANEL_EL).toExist();
    expect(PANEL_WRAPPER_CLASS).not.toHaveClass(HIDDEN_CLASS);

    hidePanel();

    expect(PANEL_EL).toExist();
    expect(PANEL_WRAPPER_CLASS).toHaveClass(HIDDEN_CLASS);

    showPanel();

    expect(PANEL_EL).toExist();
    expect(PANEL_WRAPPER_CLASS).not.toHaveClass(HIDDEN_CLASS);
  });

  it('destroy should clear the config locals on the panelRef', function () {
    openPanel(DEFAULT_CONFIG);

    expect(panelRef.config.locals).not.toEqual(null);

    panelRef.destroy();

    expect(panelRef.config.locals).toEqual(null);
  });

  it('destroy should destroy the panel scope', function () {
    openPanel(DEFAULT_CONFIG);

    expect(panelRef.config.scope.$$destroyed).toBe(false);

    panelRef.destroy();

    expect(panelRef.config.scope.$$destroyed).toBe(true);
  });

  describe('promises logic:', function() {
    var config;

    beforeEach(function() {
      config = {
        animation: $mdPanel.newPanelAnimation().withAnimation($mdPanel.animation.FADE)
      };

      panelRef = $mdPanel.create(config);
      expect(panelRef.isAttached).toEqual(false);
    });

    it('should resolve when opening/closing', function() {
      var openResolved = false;
      var closeResolved = false;

      expect(panelRef.id).toBeDefined();
      expect(panelRef.open).toBeOfType('function');
      expect(panelRef.close).toBeOfType('function');

      panelRef.open().then(function() { openResolved = true; });
      flushPanel();

      expect(openResolved).toBe(true);
      expect(PANEL_WRAPPER_CLASS).toExist();
      expect(panelRef.panelContainer).not.toHaveClass(HIDDEN_CLASS);
      expect(panelRef.isAttached).toEqual(true);

      panelRef.close().then(function() { closeResolved = true; });
      flushPanel();

      expect(closeResolved).toBe(true);
      expect(panelRef.isAttached).toEqual(false);
      expect(PANEL_WRAPPER_CLASS).not.toExist();
    });

    it('should reject on create when opening', function() {
      var openRejected = false;

      panelRef._createPanel = function() {
        return panelRef._$q.reject();
      };

      panelRef.open().catch(function() { openRejected = true; });
      flushPanel();

      expect(openRejected).toBe(true);
      expect(panelRef.isAttached).toEqual(false);
    });

    it('should reject on attach when opening', function() {
      var openRejected = false;

      panelRef.attach = function() {
        return panelRef._$q.reject();
      };

      panelRef.open().catch(function() { openRejected = true; });
      flushPanel();

      expect(openRejected).toBe(true);
      expect(panelRef.isAttached).toEqual(false);
    });

    it('should resolve on animate failure when opening', function() {
      var openResolved = false;

      panelRef.config.animation.animateOpen = function() {
        return panelRef._$q.reject();
      };

      panelRef.open().then(function() { openResolved = true; });
      flushPanel();

      expect(openResolved).toBe(true);
      expect(panelRef.isAttached).toEqual(true);
      expect(panelRef.panelContainer).not.toHaveClass(HIDDEN_CLASS);
    });

    it('should reject on show when opening', function() {
      var openRejected = false;

      panelRef.show = function() {
        return panelRef._$q.reject();
      };

      panelRef.open().catch(function() { openRejected = true; });
      flushPanel();

      expect(openRejected).toBe(true);
      expect(panelRef.isAttached).toEqual(true);
      expect(panelRef.panelContainer).toHaveClass(HIDDEN_CLASS);
    });

    it('should reject on hide when closing', function() {
      var closeRejected = false;

      openPanel();

      expect(panelRef.panelContainer).not.toHaveClass(HIDDEN_CLASS);
      expect(panelRef.isAttached).toEqual(true);

      panelRef.hide = function() {
        return panelRef._$q.reject();
      };

      panelRef.close().catch(function() { closeRejected = true; });
      flushPanel();

      expect(closeRejected).toBe(true);
      expect(panelRef.isAttached).toEqual(true);
    });

    it('should resolve on animate failure when closing', function() {
      var closeResolved = false;

      openPanel();

      expect(panelRef.panelContainer).not.toHaveClass(HIDDEN_CLASS);
      expect(panelRef.isAttached).toEqual(true);

      panelRef.config.animation.animateClose = function() {
        return panelRef._$q.reject();
      };

      panelRef.close().then(function() { closeResolved = true; });
      flushPanel();

      expect(closeResolved).toBe(true);
      expect(panelRef.isAttached).toEqual(false);
      expect(panelRef.panelContainer).toHaveClass(HIDDEN_CLASS);
    });

    it('should reject on detach when closing', function() {
      var closeRejected = false;

      openPanel();

      expect(panelRef.panelContainer).not.toHaveClass(HIDDEN_CLASS);
      expect(panelRef.isAttached).toEqual(true);

      panelRef.detach = function() {
        return panelRef._$q.reject();
      };

      panelRef.close().catch(function() { closeRejected = true; });
      flushPanel();

      expect(closeRejected).toBe(true);
      expect(panelRef.isAttached).toEqual(true);
    });

    it('should handle calling open multiple times', function() {
      var resolve1 = false;
      var resolve2 = false;
      var resolve3 = false;

      // Test twice in a row before flushing.
      panelRef.open().then(function() { resolve1 = true; });
      panelRef.open().then(function() { resolve2 = true; });

      flushPanel();

      // Test again after a flush.
      panelRef.open().then(function() { resolve3 = true; });

      flushPanel();

      expect(resolve1).toBe(true);
      expect(resolve2).toBe(true);
      expect(resolve3).toBe(true);
      expect(panelRef.isAttached).toEqual(true);
    });
  });

  describe('config options:', function() {

    it('should not recreate a panel that is tracked by a user-defined id',
        function() {
          var config = {
            id: 'custom-id'
          };

          var panel1 = $mdPanel.create(config);
          panel1.open();
          flushPanel();

          var panels = document.querySelectorAll(PANEL_EL);
          expect(panels.length).toEqual(1);

          var panel2 = $mdPanel.create(config);
          panel2.open();
          flushPanel();

          panels = document.querySelectorAll(PANEL_EL);
          expect(panels.length).toEqual(1);

          expect(panel1).toEqual(panel2);

          panel1.close();
        });

    it('should allow multiple panels', function() {
      var customClass = 'custom-class';

      var config1 = {
        panelClass: customClass,
        template: DEFAULT_TEMPLATE
      };

      var panel1 = $mdPanel.create(config1);
      var panel2 = $mdPanel.create(DEFAULT_CONFIG);

      panel1.open();
      panel2.open();
      flushPanel();

      var panels = document.querySelectorAll(PANEL_EL);
      expect(panels[0]).toHaveClass(customClass);
      expect(panels[1]).not.toHaveClass(customClass);

      panel1.close();
      panel2.close();
    });

    describe('should attach panel to a specific element', function() {
      var parentEl;

      beforeEach(function() {
        parentEl = document.createElement('div');
        parentEl.id = 'parent';
        attachToBody(parentEl);
      });

      it('using an Element', function() {
        var config = {
          attachTo: parentEl,
          template: DEFAULT_TEMPLATE
        };

        openPanel(config);

        var panelWrapperEl = document.querySelector(PANEL_WRAPPER_CLASS);
        expect(panelWrapperEl.parentElement).toBe(parentEl);

        closePanel();

        expect(parentEl.childElementCount).toEqual(0);
      });

      it('using an JQLite Object', function() {
        var config = {
          attachTo: angular.element(parentEl),
          template: DEFAULT_TEMPLATE
        };

        openPanel(config);

        var panelWrapperEl = document.querySelector(PANEL_WRAPPER_CLASS);
        expect(panelWrapperEl.parentElement).toBe(parentEl);

        closePanel();

        expect(parentEl.childElementCount).toEqual(0);
      });

      it('using a query selector', function() {
        var config = {
          attachTo: '#parent',
          template: DEFAULT_TEMPLATE
        };

        openPanel(config);

        var panelWrapperEl = document.querySelector(PANEL_WRAPPER_CLASS);
        expect(panelWrapperEl.parentElement).toBe(parentEl);

        closePanel();

        expect(parentEl.childElementCount).toEqual(0);
      });
    });

    describe('should cause the propagation of events', function() {
      var config, wrapper;

      it('to be stopped when propagateContainerEvents=false', function() {
        config = {
          propagateContainerEvents: false,
          template: DEFAULT_TEMPLATE
        };

        openPanel(config);

        wrapper = angular.element(document.querySelector(PANEL_WRAPPER_CLASS));
        expect(wrapper.css('pointer-events')).not.toEqual('none');
      });

      it('to NOT be stopped when propagateContainerEvents=true', function() {
        config = {
          propagateContainerEvents: true,
          template: DEFAULT_TEMPLATE
        };

        openPanel(config);

        wrapper = angular.element(document.querySelector(PANEL_WRAPPER_CLASS));
        expect(wrapper.css('pointer-events')).toEqual('none');
      });
    });

    it('should apply a custom css class to the panel', function() {
      var customClass = 'custom-class';

      var config = {
        panelClass: customClass,
        template: DEFAULT_TEMPLATE
      };

      openPanel(config);

      expect('.custom-class').toExist();
      expect(PANEL_EL).toHaveClass(customClass);
    });

    it('should set the z-index on the panel-container', function() {
      var zIndex = '150';

      var config = {
        template: DEFAULT_TEMPLATE,
        zIndex: zIndex
      };

      openPanel(config);

      // We have to use `toMatch` here, because IE11 is sometimes returning an integer instead of
      // an string.
      expect(document.querySelector(PANEL_WRAPPER_CLASS).style.zIndex)
          .toMatch(zIndex);
    });

    it('should set z-index to 0', function() {
      var zIndex = '0';

      var config = {
        template: DEFAULT_TEMPLATE,
        zIndex: zIndex
      };

      openPanel(config);

      // We have to use `toMatch` here, because IE11 is sometimes returning an integer instead of
      // an string.
      expect(document.querySelector(PANEL_WRAPPER_CLASS).style.zIndex)
          .toMatch(zIndex);
    });

    it('should not close when clickOutsideToClose set to false', function() {
      openPanel();

      clickPanelContainer();

      expect(PANEL_EL).toExist();
    });

    it('should close when clickOutsideToClose set to true', function() {
      var config = {
        clickOutsideToClose: true
      };

      openPanel(config);

      clickPanelContainer();

      // TODO(ErinCoughlan) - Add this when destroy is added.
      // expect(panelRef).toBeUndefined();
      expect(PANEL_EL).not.toExist();
    });

    it('should not close when escapeToClose set to false', function() {
      openPanel();

      pressEscape();

      expect(PANEL_EL).toExist();
    });

    it('should close when escapeToClose set to true', function() {
      var config = {
        escapeToClose: true
      };

      openPanel(config);

      pressEscape();

      // TODO(ErinCoughlan) - Add this when destroy is added.
      // expect(panelRef).toBeUndefined();
      expect(PANEL_EL).not.toExist();
    });

    it('should create and cleanup focus traps', function() {
      var config = { template: DEFAULT_TEMPLATE, trapFocus: true };

      openPanel(config);

      // It should add two focus traps to the document around the panel content.
      var focusTraps = document.querySelectorAll(FOCUS_TRAPS_CLASS);
      expect(focusTraps.length).toBe(2);

      var topTrap = focusTraps[0];
      var bottomTrap = focusTraps[1];

      var panel = panelRef.panelEl;
      var isPanelFocused = false;
      panel[0].addEventListener('focus', function() {
        isPanelFocused = true;
      });

      // Both of the focus traps should be in the normal tab order.
      expect(topTrap.tabIndex).toBe(0);
      expect(bottomTrap.tabIndex).toBe(0);

      // TODO(KarenParker): Find a way to test that focusing the traps redirects focus to the
      // md-dialog element. Firefox is problematic here, as calling element.focus() inside of
      // a focus event listener seems not to immediately update the document.activeElement.
      // This is a behavior better captured by an e2e test.

      closePanel();

      // All of the focus traps should be removed when the dialog is closed.
      focusTraps = document.querySelectorAll(FOCUS_TRAPS_CLASS);
      expect(focusTraps.length).toBe(0);
    });

    it('should not create focus traps when trapFocus=false', function() {
      openPanel(DEFAULT_CONFIG);

      // It should add two focus traps to the document around the panel content.
      var focusTraps = document.querySelectorAll(FOCUS_TRAPS_CLASS);
      expect(focusTraps.length).toBe(0);
    });

    it('should focus on open', function() {
      var template = '<button  id="donuts" md-autofocus>Donuts</button>';
      var config = { template: template };

      openPanel(config);

      expect(angular.element(document.activeElement).attr('id')).toBe('donuts');
    });

    it('should not focus on open when focusOnOpen=false', function() {
      var template = '<button id="donuts" md-autofocus>Donuts</button>';
      var config = {
        focusOnOpen: false,
        template: template
      };

      openPanel(config);

      expect(angular.element(document.activeElement).attr('id')).not.toBe('donuts');
    });

    it('should not be fullscreen by default', function() {
      openPanel();
      expect(PANEL_EL).not.toHaveClass(FULLSCREEN_CLASS);
    });

    it('should be fullscreen when fullscreen=true', function() {
      var config = { fullscreen: true };

      openPanel(config);
      expect(PANEL_EL).toHaveClass(FULLSCREEN_CLASS);
    });

    it('should default backdrop to false', function() {
      openPanel(DEFAULT_CONFIG);
      expect(BACKDROP_CLASS).not.toExist();
    });

    it('should show backdrop when hasBackdrop=true', function() {
      var config = { template: DEFAULT_TEMPLATE, hasBackdrop: true };

      openPanel(config);
      expect(BACKDROP_CLASS).toExist();

      closePanel();
      expect(BACKDROP_CLASS).not.toExist();
    });

    it('should close when clickOutsideToClose and hasBackdrop are set to true',
        function() {
          var config = {
            template: DEFAULT_TEMPLATE,
            clickOutsideToClose: true,
            hasBackdrop: true
          };

          openPanel(config);

          expect(PANEL_EL).toExist();
          expect(BACKDROP_CLASS).toExist();

          // Can't access the closePromise so mock it out.
          var closeCalled = false;
          panelRef.close = function() {
            closeCalled = true;
            return panelRef._$q.when(self);
          };

          clickPanelContainer();

          expect(closeCalled).toBe(true);
        });

    it('should disable scrolling when disableParentScroll is true', function() {
      var config = {
        template: DEFAULT_TEMPLATE,
        disableParentScroll: true,
      };
      spyOn($mdUtil, 'disableScrollAround').and.callThrough();

      openPanel(config);

      expect(PANEL_EL).toExist();
      expect(SCROLL_MASK_CLASS).toExist();

      closePanel();

      var scrollMaskEl = $rootEl[0].querySelector(SCROLL_MASK_CLASS);
      expect(scrollMaskEl).not.toExist();
      expect($mdUtil.disableScrollAround).toHaveBeenCalled();
    });

    describe('animation hooks: ', function() {
      it('should call onDomAdded if provided when adding the panel to the DOM',
          function() {
            var onDomAddedCalled = false;
            var onDomAdded = function() {
              onDomAddedCalled = true;
              return $q.when(this);
            };
            var config = angular.extend(
                {'onDomAdded': onDomAdded}, DEFAULT_CONFIG);

            panelRef = $mdPanel.create(config);
            panelRef.attach();
            flushPanel();

            expect(onDomAddedCalled).toBe(true);
            expect(PANEL_EL).toExist();
            expect(PANEL_WRAPPER_CLASS).toHaveClass(HIDDEN_CLASS);
          });

      it('should continue resolving when onDomAdded resolves', function() {
        var attachResolved = false;
        var onDomAddedCalled = false;
        var onDomAdded = function() {
          onDomAddedCalled = true;
          return $q.when(this);
        };
        var config = angular.extend(
            {'onDomAdded': onDomAdded}, DEFAULT_CONFIG);

        expect(PANEL_EL).not.toExist();

        panelRef = $mdPanel.create(config);
        panelRef.open().then(function() {
          attachResolved = true;
        });
        flushPanel();

        expect(onDomAddedCalled).toBe(true);
        expect(PANEL_EL).toExist();
        expect(attachResolved).toBe(true);
        expect(panelRef.isAttached).toEqual(true);
        expect(panelRef.panelContainer).not.toHaveClass(HIDDEN_CLASS);
      });

      it('should reject open when onDomAdded rejects', function() {
        var openRejected = false;
        var onDomAddedCalled = false;
        var onDomAdded = function() {
          onDomAddedCalled = true;
          return $q.reject();
        };
        var config = angular.extend(
            {'onDomAdded': onDomAdded}, DEFAULT_CONFIG);

        panelRef = $mdPanel.create(config);
        panelRef.open().catch(function() {
          openRejected = true;
        });
        flushPanel();

        expect(onDomAddedCalled).toBe(true);
        expect(openRejected).toBe(true);
        expect(panelRef.isAttached).toEqual(true);
        expect(panelRef.panelContainer).toHaveClass(HIDDEN_CLASS);
      });

      it('should call onOpenComplete if provided after adding the panel to the ' +
          'DOM and animating', function() {
            var onOpenCompleteCalled = false;
            var onOpenComplete = function() {
              onOpenCompleteCalled = true;
              return $q.when(this);
            };
            var config = angular.extend(
                {'onOpenComplete': onOpenComplete}, DEFAULT_CONFIG);

            openPanel(config);

            expect(onOpenCompleteCalled).toBe(true);
            expect(PANEL_EL).toExist();
            expect(PANEL_WRAPPER_CLASS).not.toHaveClass(HIDDEN_CLASS);
          });

      it('should call onRemoving if provided after hiding the panel but before ' +
          'the panel is removed', function() {
            var onRemovingCalled = false;
            var onDomRemovedCalled = false;
            var onRemoving = function() {
              onRemovingCalled = true;
              return $q.when(this);
            };
            var onDomRemoved = function() {
              onDomRemovedCalled = true;
              return $q.when(this);
            };
            var config = angular.extend({'onRemoving': onRemoving,
              'onDomRemoved': onDomRemoved}, DEFAULT_CONFIG);

            openPanel(config);
            hidePanel();

            expect(onRemovingCalled).toBe(true);
            expect(onDomRemovedCalled).toBe(false);
            expect(PANEL_EL).toExist();
          });

      it('should continue resolving when onRemoving resolves', function() {
        var hideResolved = false;
        var onRemovingCalled = false;
        var onRemoving = function() {
          onRemovingCalled = true;
          return $q.when(this);
        };
        var config = angular.extend({'onRemoving': onRemoving},
            DEFAULT_CONFIG);

        openPanel(config);
        panelRef.hide().then(function() {
          hideResolved = true;
        });
        flushPanel();

        expect(onRemovingCalled).toBe(true);
        expect(PANEL_EL).toExist();
        expect(hideResolved).toBe(true);
        expect(PANEL_WRAPPER_CLASS).toHaveClass(HIDDEN_CLASS);
      });

      it('should reject hide when onRemoving rejects', function() {
        var hideRejected = false;
        var onRemoving = function() {
          return $q.reject();
        };
        var config = angular.extend(
            {'onRemoving': onRemoving}, DEFAULT_CONFIG);

        openPanel(config);
        panelRef.hide().catch(function() {
          hideRejected = true;
        });
        flushPanel();

        expect(hideRejected).toBe(true);
        expect(PANEL_EL).toExist();
        expect(PANEL_WRAPPER_CLASS).not.toHaveClass(HIDDEN_CLASS);
      });

      it('should call onRemoving on escapeToClose', function() {
        var onRemovingCalled = false;
        var onRemoving = function() {
          onRemovingCalled = true;
          return $q.when(this);
        };
        var config = angular.extend({
          'onRemoving': onRemoving, escapeToClose: true},
          DEFAULT_CONFIG);

        openPanel(config);
        pressEscape();

        expect(PANEL_EL).not.toExist();
        expect(onRemovingCalled).toBe(true);
      });

      it('should call onRemoving on clickOutsideToClose', function() {
        var onRemovingCalled = false;
        var onRemoving = function() {
          onRemovingCalled = true;
          return $q.when(this);
        };
        var config = angular.extend({
          'onRemoving': onRemoving, clickOutsideToClose: true},
          DEFAULT_CONFIG);

        openPanel(config);
        clickPanelContainer();

        expect(PANEL_EL).not.toExist();
        expect(onRemovingCalled).toBe(true);
      });

      it('should call onDomRemoved if provided when removing the panel from ' +
          'the DOM', function() {
            var onDomRemovedCalled = false;
            var onDomRemoved = function() {
              onDomRemovedCalled = true;
              return $q.when(this);
            };
            var config = angular.extend(
                {'onDomRemoved': onDomRemoved}, DEFAULT_CONFIG);

            openPanel(config);
            closePanel();

            expect(onDomRemovedCalled).toBe(true);
            expect(PANEL_EL).not.toExist();
          });

      it('should call onDomRemoved on escapeToClose', function() {
        var onDomRemovedCalled = false;
        var onDomRemoved = function() {
          onDomRemovedCalled = true;
          return $q.when(this);
        };
        var config = angular.extend({
          'onDomRemoved': onDomRemoved, escapeToClose: true},
          DEFAULT_CONFIG);

        openPanel(config);
        pressEscape();

        expect(PANEL_EL).not.toExist();
        expect(onDomRemovedCalled).toBe(true);
      });

      it('should call onDomRemoved on clickOutsideToClose', function() {
        var onDomRemovedCalled = false;
        var onDomRemoved = function() {
          onDomRemovedCalled = true;
          return $q.when(this);
        };
        var config = angular.extend({
          'onDomRemoved': onDomRemoved, clickOutsideToClose: true},
          DEFAULT_CONFIG);

        openPanel(config);
        clickPanelContainer();

        expect(PANEL_EL).not.toExist();
        expect(onDomRemovedCalled).toBe(true);
      });
    });

    describe('CSS class logic:', function() {
      it('should add a class to the container/wrapper', function() {
        openPanel(DEFAULT_CONFIG);

        panelRef.panelContainer.addClass('my-class');

        expect(PANEL_WRAPPER_CLASS).toHaveClass('my-class');
        expect(PANEL_EL).not.toHaveClass('my-class');
      });

      it('should add a class to the element', function() {
        openPanel(DEFAULT_CONFIG);

        panelRef.panelEl.addClass('my-class');

        expect(PANEL_WRAPPER_CLASS).not.toHaveClass('my-class');
        expect(PANEL_EL).toHaveClass('my-class');
      });

      it('should remove a class from the container/wrapper', function() {
        openPanel(DEFAULT_CONFIG);

        panelRef.panelContainer.addClass('my-class');

        expect(PANEL_WRAPPER_CLASS).toHaveClass('my-class');
        expect(PANEL_EL).not.toHaveClass('my-class');

        panelRef.panelContainer.removeClass('my-class');

        expect(PANEL_WRAPPER_CLASS).not.toHaveClass('my-class');
        expect(PANEL_EL).not.toHaveClass('my-class');
      });

      it('should remove a class from the element', function() {
        openPanel(DEFAULT_CONFIG);

        panelRef.panelEl.addClass('my-class');

        expect(PANEL_WRAPPER_CLASS).not.toHaveClass('my-class');
        expect(PANEL_EL).toHaveClass('my-class');

        panelRef.panelEl.removeClass('my-class');

        expect(PANEL_WRAPPER_CLASS).not.toHaveClass('my-class');
        expect(PANEL_EL).not.toHaveClass('my-class');
      });

      it('should toggle a class on the container/wrapper', function() {
        openPanel(DEFAULT_CONFIG);

        panelRef.panelContainer.toggleClass('my-class');

        expect(PANEL_WRAPPER_CLASS).toHaveClass('my-class');
        expect(PANEL_EL).not.toHaveClass('my-class');

        panelRef.panelContainer.toggleClass('my-class');

        expect(PANEL_WRAPPER_CLASS).not.toHaveClass('my-class');
        expect(PANEL_EL).not.toHaveClass('my-class');
      });

      it('should toggle a class on the element', function() {
        openPanel(DEFAULT_CONFIG);

        panelRef.panelEl.toggleClass('my-class');

        expect(PANEL_WRAPPER_CLASS).not.toHaveClass('my-class');
        expect(PANEL_EL).toHaveClass('my-class');

        panelRef.panelEl.toggleClass('my-class');

        expect(PANEL_WRAPPER_CLASS).not.toHaveClass('my-class');
        expect(PANEL_EL).not.toHaveClass('n-class');
      });
    });

    describe('should focus on the origin element on', function() {
      var myButton;
      var detachFocusConfig;
      beforeEach(function() {
        attachToBody('<button id="donuts">Donuts</button>');

        myButton = angular.element(document.querySelector('#donuts'));

        detachFocusConfig = angular.extend({ origin: '#donuts' }, DEFAULT_CONFIG);
      });

      it('hide when provided', function () {
        openPanel(detachFocusConfig);

        expect(myButton).not.toBeFocused();

        hidePanel();

        expect(myButton).toBeFocused();
      });

      it('close when provided', function () {
        openPanel(detachFocusConfig);

        expect(myButton).not.toBeFocused();

        closePanel();

        expect(myButton).toBeFocused();
      });

      it('clickOutsideToClose', function() {
        detachFocusConfig.clickOutsideToClose = true;

        openPanel(detachFocusConfig);

        expect(myButton).not.toBeFocused();

        clickPanelContainer();

        expect(myButton).toBeFocused();
      });

      it('escapeToClose', function() {
        detachFocusConfig.escapeToClose = true;

        openPanel(detachFocusConfig);

        expect(myButton).not.toBeFocused();

        pressEscape();

        expect(myButton).toBeFocused();
      });
    });
  });

  describe('component logic: ', function() {
    it('should allow templateUrl to specify content', function() {
      var htmlContent = 'Puppies and Unicorns';
      var template = '<div>' + htmlContent + '</div>';
      $templateCache.put('template.html', template);

      var config = { templateUrl: 'template.html' };

      openPanel(config);

      expect(PANEL_EL).toContainHtml(htmlContent);
    });

    it('should allow template to specify content', function() {
      var htmlContent = 'Ice cream';
      var template = '<div>' + htmlContent + '</div>';
      var config = { template: template };

      openPanel(config);

      expect(PANEL_EL).toContainHtml(htmlContent);
    });

    it('should allow a controller to be specified', function() {
      var htmlContent = 'Cotton candy';
      var template = '<div>{{ content }}</div>';

      var config = {
        template: template,
        controller: function Ctrl($scope) {
          $scope['content'] = htmlContent;
        }
      };

      openPanel(config);

      expect(PANEL_EL).toContainHtml(htmlContent);
    });

    it('should allow controllerAs syntax', function() {
      var htmlContent = 'Cupcakes';
      var template = '<div>{{ ctrl.content }}</div>';

      var config = {
        template: template,
        controller: function Ctrl() {
          this.content = htmlContent;
        },
        controllerAs: 'ctrl'
      };

      openPanel(config);

      expect(PANEL_EL).toContainHtml(htmlContent);
    });

    it('should wait for resolve before creating the panel', function() {
      var htmlContent = 'Cheesecake';
      var template = '<div>{{ ctrl.content }}</div>';

      var deferred = $q.defer();

      var config = {
        template: template,
        controller: function Ctrl(content) {
          this.content = content;
        },
        controllerAs: 'ctrl',
        resolve: {
          content: function() {
            return deferred.promise.then(function(content) {
              return content;
            });
          }
        }
      };

      openPanel(config);

      expect(PANEL_EL).not.toExist();

      deferred.resolve(htmlContent);
      flushPanel();

      expect(PANEL_EL).toExist();
      expect(PANEL_EL).toContainHtml(htmlContent);
    });

    it('should bind resolve to the controller', function() {
      var htmlContent = 'Gummy bears';
      var template = '<div>{{ ctrl.content }}</div>';

      var config = {
        template: template,
        controller: function Ctrl() {
          this.content; // Populated via bindToController.
        },
        controllerAs: 'ctrl',
        resolve: {
          content: function($q) {
            return $q.when(htmlContent);
          }
        }
      };

      openPanel(config);

      expect(PANEL_EL).toContainHtml(htmlContent);
    });

    it('should allow locals to be injected in the controller', function() {
      var htmlContent = 'Tiramisu';
      var template = '<div>{{ ctrl.content }} {{ ctrl.myPanel.id }}</div>';

      var config = {
        template: template,
        controller: function Ctrl(content, mdPanelRef) {
          this.content = content;
          this.myPanel = mdPanelRef;
        },
        controllerAs: 'ctrl',
        locals: { content: htmlContent },
        bindToController: false,
      };

      openPanel(config);

      expect(PANEL_EL).toContainHtml(htmlContent);
      expect(PANEL_EL).toContainHtml(PANEL_ID_PREFIX);
    });

    it('should bind locals to the controller', function() {
      var htmlContent = 'Apple Pie';
      var template = '<div>{{ ctrl.content }} {{ ctrl.mdPanelRef.id }}</div>';

      var config = {
        template: template,
        controller: function Ctrl() {
          this.content; // Populated via bindToController.
          this.mdPanelRef;
        },
        controllerAs: 'ctrl',
        locals: { content: htmlContent }
      };

      openPanel(config);

      expect(PANEL_EL).toContainHtml(htmlContent);
      expect(PANEL_EL).toContainHtml(PANEL_ID_PREFIX);
    });

    it('should inject mdPanelRef to the controller', function() {
      var htmlContent = 'Cupcake';
      var template =
          '<button ng-click="ctrl.closeSelf()">{{ ctrl.content }}</button>';

      function Ctrl() {
        this.content; // Populated via bindToController.
        this.mdPanelRef;
      }

      Ctrl.prototype.closeSelf = function() {
        this.mdPanelRef.close();
      };

      var config = {
        template: template,
        controller: Ctrl,
        controllerAs: 'ctrl',
        locals: { content: htmlContent }
      };

      openPanel(config);

      expect(PANEL_EL).toContainHtml(htmlContent);

      document.querySelector(PANEL_EL + ' button').click();
      expect(PANEL_EL).not.toExist();
    });
  });

  describe('positioning logic', function() {
    var config;
    var mdPanelPosition;

    function setRTL() {
      mdPanelPosition._isRTL = true;
    }

    function disableRTL() {
      mdPanelPosition._isRTL = false;
    }

    beforeEach(function() {
      config = DEFAULT_CONFIG;
      mdPanelPosition = $mdPanel.newPanelPosition();
    });

    afterEach(function () {
      disableRTL();
    });

    describe('should update the position of an open panel', function() {
      var xPosition, yPosition, myButton, myButtonRect;

      beforeEach(function() {
        xPosition = $mdPanel.xPosition;
        yPosition = $mdPanel.yPosition;

        myButton = '<button>myButton</button>';
        attachToBody(myButton);
        myButton = angular.element(document.querySelector('button'));
        myButtonRect = myButton[0].getBoundingClientRect();
      });

      it('between two absolute positions', function() {
        var top = '50px';
        var left = '30px';
        var position = $mdPanel.newPanelPosition()
            .absolute()
            .top(top)
            .left(left);

        config['position'] = position;

        openPanel(config);

        var panelRect = document.querySelector(PANEL_EL)
            .getBoundingClientRect();
        expect(panelRect.top).toBeApproximately(parseInt(top));
        expect(panelRect.left).toBeApproximately(parseInt(left));

        var newTop = '500px';
        var newLeft = '300px';
        var newPosition = $mdPanel.newPanelPosition()
            .absolute()
            .top(newTop)
            .left(newLeft);

        panelRef.updatePosition(newPosition);

        var newPanelRect = document.querySelector(PANEL_EL)
            .getBoundingClientRect();
        expect(newPanelRect.top).toBeApproximately(parseInt(newTop));
        expect(newPanelRect.left).toBeApproximately(parseInt(newLeft));
      });

      it('between two relative positions', function() {
        var position = $mdPanel.newPanelPosition()
            .relativeTo(myButton[0])
            .addPanelPosition(xPosition.ALIGN_START, yPosition.ALIGN_TOPS);

        config['position'] = position;

        openPanel(config);

        var panelRect = document.querySelector(PANEL_EL)
            .getBoundingClientRect();
        expect(panelRect.top).toBeApproximately(myButtonRect.top);
        expect(panelRect.left).toBeApproximately(myButtonRect.left);

        var newPosition = $mdPanel.newPanelPosition()
            .relativeTo(myButton)
            .addPanelPosition(null, yPosition.ABOVE);

        panelRef.updatePosition(newPosition);

        var newPanelRect = document.querySelector(PANEL_EL)
            .getBoundingClientRect();
        expect(newPanelRect.bottom).toBeApproximately(myButtonRect.top);
      });

      it('from an absolute to a relative position', function() {
        var top = '250px';
        var left = '400px';
        var position = $mdPanel.newPanelPosition()
            .absolute()
            .top(top)
            .left(left);

        config['position'] = position;

        openPanel(config);

        var panelRect = document.querySelector(PANEL_EL)
            .getBoundingClientRect();
        expect(panelRect.top).toBeApproximately(parseInt(top));
        expect(panelRect.left).toBeApproximately(parseInt(left));

        var newPosition = $mdPanel.newPanelPosition()
            .relativeTo(myButton[0])
            .addPanelPosition(xPosition.ALIGN_START, yPosition.ALIGN_TOPS);

        panelRef.updatePosition(newPosition);

        var newPanelRect = document.querySelector(PANEL_EL)
            .getBoundingClientRect();
        expect(newPanelRect.top).toBeApproximately(myButtonRect.top);
        expect(newPanelRect.left).toBeApproximately(myButtonRect.left);
      });
    });

    describe('should offset the panel', function() {
      it('horizontally', function() {
        var left = '50px';
        var offset = '-15px';

        var position = mdPanelPosition
            .absolute()
            .left(left)
            .withOffsetX(offset);

        config['position'] = position;

        openPanel(config);

        var panelRect = document.querySelector(PANEL_EL)
            .getBoundingClientRect();

        expect(panelRect.left)
            .toBeApproximately(parseInt(left) + parseInt(offset));
      });

      it('horizontally with centering', function() {
        var offset = '15px';

        var position = mdPanelPosition
            .absolute()
            .centerHorizontally()
            .withOffsetX(offset);

        config['position'] = position;

        openPanel(config);

        var middleOfPage = 0.5 * window.innerWidth;

        var panelRect = document.querySelector(PANEL_EL)
            .getBoundingClientRect();
        var middleOfPanel = panelRect.left + 0.5 * panelRect.width;

        expect(middleOfPanel)
            .toBeApproximately(middleOfPage + parseInt(offset));
      });

      it('vertically', function() {
        var top = '50px';
        var offset = '-15px';

        var position = mdPanelPosition
            .absolute()
            .top(top)
            .withOffsetY(offset);

        config['position'] = position;

        openPanel(config);

        var panelRect = document.querySelector(PANEL_EL)
            .getBoundingClientRect();

        expect(panelRect.top)
            .toBeApproximately(parseInt(top) + parseInt(offset));
      });

      it('vertically with centering', function() {
        var offset = '15px';

        var position = mdPanelPosition
            .absolute()
            .centerVertically()
            .withOffsetY(offset);

        config['position'] = position;

        openPanel(config);

        var middleOfPage = 0.5 * window.innerHeight;

        var panelRect = document.querySelector(PANEL_EL)
            .getBoundingClientRect();
        var middleOfPanel = panelRect.top + 0.5 * panelRect.height;

        expect(middleOfPanel)
            .toBeApproximately(middleOfPage + parseInt(offset));
      });
    });

    describe('should absolutely position the panel at', function() {
      it('top', function() {
        var top = '50px';
        var position = mdPanelPosition.absolute().top(top);
        config['position'] = position;

        openPanel(config);

        var panelCss = document.querySelector(PANEL_EL).style;
        expect(panelCss.top).toEqual(top);
      });

      it('top with default 0', function() {
        var position = mdPanelPosition.absolute().top();
        config['position'] = position;

        openPanel(config);

        var panelCss = document.querySelector(PANEL_EL).style;
        expect(panelCss.top).toEqual('0px');
      });

      it('top with clearing previous vertical positioning', function() {
        var position = mdPanelPosition.absolute().bottom().top();
        config['position'] = position;

        openPanel(config);

        var panelCss = document.querySelector(PANEL_EL).style;
        expect(panelCss.bottom).toEqual('')
        expect(panelCss.top).toEqual('0px');
      });

      it('bottom', function() {
        var bottom = '50px';
        var position = mdPanelPosition.absolute().bottom(bottom);
        config['position'] = position;

        openPanel(config);

        var panelCss = document.querySelector(PANEL_EL).style;
        expect(panelCss.bottom).toEqual(bottom);
      });

      it('bottom with default 0', function() {
        var position = mdPanelPosition.absolute().bottom();
        config['position'] = position;

        openPanel(config);

        var panelCss = document.querySelector(PANEL_EL).style;
        expect(panelCss.bottom).toEqual('0px');
      });

      it('bottom with clearing previous vertical positioning', function() {
        var position = mdPanelPosition.absolute().top().bottom();
        config['position'] = position;

        openPanel(config);

        var panelCss = document.querySelector(PANEL_EL).style;
        expect(panelCss.top).toEqual('');
        expect(panelCss.bottom).toEqual('0px');
      });

      it('left', function() {
        var left = '50px';
        var position = mdPanelPosition.absolute().left(left);
        config['position'] = position;

        openPanel(config);

        var panelCss = document.querySelector(PANEL_EL).style;
        expect(panelCss.left).toEqual(left);
      });

      it('left with default 0', function() {
        var position = mdPanelPosition.absolute().left();
        config['position'] = position;

        openPanel(config);

        var panelCss = document.querySelector(PANEL_EL).style;
        expect(panelCss.left).toEqual('0px');
      });

      it('left with clearing previous horizontal positioning', function() {
        var position = mdPanelPosition.absolute().right().left();
        config['position'] = position;

        openPanel(config);

        var panelCss = document.querySelector(PANEL_EL).style;
        expect(panelCss.right).toEqual('');
        expect(panelCss.left).toEqual('0px');
      });

      it('right', function() {
        var right = '50px';
        var position = mdPanelPosition.absolute().right(right);
        config['position'] = position;

        openPanel(config);

        var panelCss = document.querySelector(PANEL_EL).style;
        expect(panelCss.right).toEqual(right);
      });

      it('right with default 0', function() {
        var position = mdPanelPosition.absolute().right();
        config['position'] = position;

        openPanel(config);

        var panelCss = document.querySelector(PANEL_EL).style;
        expect(panelCss.right).toEqual('0px');
      });

      it('right with clearing previous horizontal positioning', function() {
        var position = mdPanelPosition.absolute().left().right();
        config['position'] = position;

        openPanel(config);

        var panelCss = document.querySelector(PANEL_EL).style;
        expect(panelCss.left).toEqual('');
        expect(panelCss.right).toEqual('0px');
      });

      it('start in ltr', function() {
        var start = '50px';
        config['position'] = mdPanelPosition.absolute().start(start);

        openPanel(config);

        var panelCss = document.querySelector(PANEL_EL).style;
        expect(panelCss.left).toEqual(start);
      });

      it('start in rtl', function() {
        setRTL();

        var start = '50px';
        config['position'] = mdPanelPosition.absolute().start(start);

        openPanel(config);

        var panelCss = document.querySelector(PANEL_EL).style;
        expect(panelCss.right).toEqual(start);
      });

      it('end in ltr', function() {
        var end = '50px';
        config['position'] = mdPanelPosition.absolute().end(end);

        openPanel(config);

        var panelCss = document.querySelector(PANEL_EL).style;
        expect(panelCss.right).toEqual(end);
      });

      it('end in rtl', function() {
        setRTL();

        var end = '50px';
        config['position'] = mdPanelPosition.absolute().end(end);

        openPanel(config);

        var panelCss = document.querySelector(PANEL_EL).style;
        expect(panelCss.left).toEqual(end);
      });

      it('center horizontally', function() {
        var position = mdPanelPosition.absolute().centerHorizontally();
        config['position'] = position;

        openPanel(config);

        var middleOfPage = 0.5 * window.innerWidth;

        var panelRect = document.querySelector(PANEL_EL)
            .getBoundingClientRect();
        var middleOfPanel = panelRect.left + 0.5 * panelRect.width;

        expect(middleOfPanel).toBeApproximately(middleOfPage);
      });

      it('center vertically', function() {
        var position = mdPanelPosition.absolute().centerVertically();
        config['position'] = position;

        openPanel(config);

        var middleOfPage = 0.5 * window.innerHeight;

        var panelRect = document.querySelector(PANEL_EL)
            .getBoundingClientRect();
        var middleOfPanel = panelRect.top + 0.5 * panelRect.height;

        expect(middleOfPanel).toBeApproximately(middleOfPage);
      });

      it('center horizontally and vertically', function() {
        var position = mdPanelPosition.absolute().center();
        config['position'] = position;

        openPanel(config);

        var middleOfPageX = 0.5 * window.innerWidth;
        var middleOfPageY = 0.5 * window.innerHeight;

        var panelRect = document.querySelector(PANEL_EL)
            .getBoundingClientRect();
        var middleOfPanelX = panelRect.left + 0.5 * panelRect.width;
        var middleOfPanelY = panelRect.top + 0.5 * panelRect.height;

        expect(middleOfPanelX).toBeApproximately(middleOfPageX);
        expect(middleOfPanelY).toBeApproximately(middleOfPageY);
      });
    });

    describe('should relatively position the panel', function() {
      var myButton;
      var myButtonRect;
      var xPosition;
      var yPosition;

      beforeEach(function() {
        myButton = '<button>myButton</button>';
        attachToBody(myButton);
        myButton = angular.element(document.querySelector('button'));
        myButtonRect = myButton[0].getBoundingClientRect();

        xPosition = $mdPanel.xPosition;
        yPosition = $mdPanel.yPosition;
      });

      it('with respect to an element', function() {
        var position = mdPanelPosition
            .relativeTo(myButton[0])
            .addPanelPosition(xPosition.ALIGN_START, yPosition.ALIGN_TOPS);

        config['position'] = position;

        openPanel(config);

        var panelCss = document.querySelector(PANEL_EL).style;
        expect(panelCss.left).toBeApproximately(myButtonRect.left);
        expect(panelCss.top).toBeApproximately(myButtonRect.top);
      });

      it('with respect to a query selector', function() {
        var position = mdPanelPosition
            .relativeTo('button')
            .addPanelPosition(xPosition.ALIGN_START, yPosition.ALIGN_TOPS);

        config['position'] = position;

        openPanel(config);

        var panelCss = document.querySelector(PANEL_EL).style;
        expect(panelCss.left).toBeApproximately(myButtonRect.left);
        expect(panelCss.top).toBeApproximately(myButtonRect.top);
      });

      it('with respect to a JQLite object', function() {
        var position = mdPanelPosition
            .relativeTo(myButton)
            .addPanelPosition(xPosition.ALIGN_START, yPosition.ALIGN_TOPS);

        config['position'] = position;

        openPanel(config);

        var panelCss = document.querySelector(PANEL_EL).style;
        expect(panelCss.left).toBeApproximately(myButtonRect.left);
        expect(panelCss.top).toBeApproximately(myButtonRect.top);
      });

      it('rejects offscreen position left of target element', function() {
        var position = mdPanelPosition
            .relativeTo(myButton)
            .addPanelPosition(xPosition.OFFSET_START, yPosition.ALIGN_TOPS)
            .addPanelPosition(xPosition.ALIGN_START, yPosition.ALIGN_TOPS);

        config['position'] = position;

        openPanel(config);

        expect(position.getActualPosition()).toEqual({
          x: xPosition.ALIGN_START,
          y: yPosition.ALIGN_TOPS,
        });
        var panelCss = document.querySelector(PANEL_EL).style;
        expect(panelCss.left).toBeApproximately(myButtonRect.left);
        expect(panelCss.top).toBeApproximately(myButtonRect.top);
      });

      it('rejects offscreen position above target element', function() {
        var position = mdPanelPosition
            .relativeTo(myButton)
            .addPanelPosition(xPosition.ALIGN_START, yPosition.ABOVE)
            .addPanelPosition(xPosition.ALIGN_START, yPosition.ALIGN_TOPS);

        config['position'] = position;

        openPanel(config);

        expect(position.getActualPosition()).toEqual({
          x: xPosition.ALIGN_START,
          y: yPosition.ALIGN_TOPS,
        });
      });

      it('rejects offscreen position below target element', function() {
        // reposition button at the bottom of the screen
        $rootEl[0].style.height = "100%";
        myButton[0].style.position = 'absolute';
        myButton[0].style.bottom = '0px';
        myButtonRect = myButton[0].getBoundingClientRect();

        var position = mdPanelPosition
            .relativeTo(myButton)
            .addPanelPosition(xPosition.ALIGN_START, yPosition.BELOW)
            .addPanelPosition(xPosition.ALIGN_START, yPosition.ALIGN_TOPS);

        config['position'] = position;

        openPanel(config);

        expect(position.getActualPosition()).toEqual({
          x: xPosition.ALIGN_START,
          y: yPosition.ALIGN_TOPS,
        });
      });

      it('rejects offscreen position right of target element', function() {
        // reposition button at the bottom of the screen
        $rootEl[0].style.width = "100%";
        myButton[0].style.position = 'absolute';
        myButton[0].style.right = '0px';
        myButtonRect = myButton[0].getBoundingClientRect();

        var position = mdPanelPosition
            .relativeTo(myButton)
            .addPanelPosition(xPosition.OFFSET_END, yPosition.ALIGN_TOPS)
            .addPanelPosition(xPosition.ALIGN_START, yPosition.ALIGN_TOPS);

        config['position'] = position;

        openPanel(config);

        expect(position.getActualPosition()).toEqual({
          x: xPosition.ALIGN_START,
          y: yPosition.ALIGN_TOPS,
        });
      });

      it('should choose last position if none are on-screen', function() {
        var position = mdPanelPosition
            .relativeTo(myButton)
            // off-screen to the left
            .addPanelPosition(xPosition.OFFSET_START, yPosition.ALIGN_TOPS)
            // off-screen at the top
            .addPanelPosition(xPosition.ALIGN_START, yPosition.ALIGN_TOPS);

        config['position'] = position;

        openPanel(config);

        expect(position.getActualPosition()).toEqual({
          x: xPosition.ALIGN_START,
          y: yPosition.ALIGN_TOPS,
        });
      });

      describe('vertically', function() {
        it('above an element', function() {
          var position = mdPanelPosition
              .relativeTo(myButton)
              .addPanelPosition(null, yPosition.ABOVE);

          config['position'] = position;

          openPanel(config);

          var panelRect = document.querySelector(PANEL_EL)
              .getBoundingClientRect();
          expect(panelRect.bottom).toBeApproximately(myButtonRect.top);
        });

        it('top aligned with an element', function() {
          var position = mdPanelPosition
              .relativeTo(myButton)
              .addPanelPosition(null, yPosition.ALIGN_TOPS);

          config['position'] = position;

          openPanel(config);

          var panelRect = document.querySelector(PANEL_EL)
              .getBoundingClientRect();
          expect(panelRect.top).toBeApproximately(myButtonRect.top);
        });

        it('centered with an element', function() {
          var position = mdPanelPosition
              .relativeTo(myButton)
              .addPanelPosition(null, yPosition.CENTER);

          config['position'] = position;

          openPanel(config);

          var middleOfButton = myButtonRect.top + 0.5 * myButtonRect.height;
          var panelRect = document.querySelector(PANEL_EL)
              .getBoundingClientRect();
          var middleOfPanel = panelRect.top + 0.5 * panelRect.height;

          expect(middleOfPanel).toBeApproximately(middleOfButton);
        });

        it('bottom aligned with an element', function() {
          var position = mdPanelPosition
              .relativeTo(myButton)
              .addPanelPosition(null, yPosition.ALIGN_BOTTOMS);

          config['position'] = position;

          openPanel(config);

          var panelRect = document.querySelector(PANEL_EL)
              .getBoundingClientRect();
          expect(panelRect.bottom).toBeApproximately(myButtonRect.bottom);
        });

        it('below an element', function() {
          var position = mdPanelPosition
              .relativeTo(myButton)
              .addPanelPosition(null, yPosition.BELOW);

          config['position'] = position;

          openPanel(config);

          var panelRect = document.querySelector(PANEL_EL)
              .getBoundingClientRect();
          expect(panelRect.top).toBeApproximately(myButtonRect.bottom);
        });
      });

      describe('horizontally', function() {
        it('offset to the left of an element', function() {
          var position = mdPanelPosition
              .relativeTo(myButton)
              .addPanelPosition(xPosition.OFFSET_START, null);

          config['position'] = position;

          openPanel(config);

          var panelRect = document.querySelector(PANEL_EL)
              .getBoundingClientRect();
          expect(panelRect.right).toBeApproximately(myButtonRect.left);
        });

        it('right aligned with an element', function() {
          var position = mdPanelPosition
              .relativeTo(myButton)
              .addPanelPosition(xPosition.ALIGN_END, null);

          config['position'] = position;

          openPanel(config);

          var panelRect = document.querySelector(PANEL_EL)
              .getBoundingClientRect();
          expect(panelRect.right).toBeApproximately(myButtonRect.right);
        });

        it('centered with an element', function() {
          var position = mdPanelPosition
              .relativeTo(myButton)
              .addPanelPosition(xPosition.CENTER, null);

          config['position'] = position;

          openPanel(config);

          var middleOfButton = myButtonRect.left + 0.5 * myButtonRect.width;
          var panelRect = document.querySelector(PANEL_EL)
              .getBoundingClientRect();
          var middleOfPanel = panelRect.left + 0.5 * panelRect.width;

          expect(middleOfPanel).toBeApproximately(middleOfButton);
        });

        it('left aligned with an element', function() {
          var position = mdPanelPosition
              .relativeTo(myButton)
              .addPanelPosition(xPosition.ALIGN_START, null);

          config['position'] = position;

          openPanel(config);

          var panelRect = document.querySelector(PANEL_EL)
              .getBoundingClientRect();
          expect(panelRect.left).toBeApproximately(myButtonRect.left);
        });

        it('offset to the right of an element', function() {
          var position = mdPanelPosition
              .relativeTo(myButton)
              .addPanelPosition(xPosition.OFFSET_END, null);

          config['position'] = position;

          openPanel(config);

          var panelRect = document.querySelector(PANEL_EL)
              .getBoundingClientRect();
          expect(panelRect.left).toBeApproximately(myButtonRect.right);
        });

        describe('rtl', function () {
          beforeEach(function () {
            setRTL();
          });

          it('offset to the right of an element', function() {
            var position = mdPanelPosition
              .relativeTo(myButton)
              .addPanelPosition(xPosition.OFFSET_START, null);

            config['position'] = position;

            openPanel(config);

            var panelRect = document.querySelector(PANEL_EL)
              .getBoundingClientRect();
            expect(panelRect.left).toBeApproximately(myButtonRect.right);
          });

          it('left aligned with an element', function() {
            var position = mdPanelPosition
              .relativeTo(myButton)
              .addPanelPosition(xPosition.ALIGN_END, null);

            config['position'] = position;

            openPanel(config);

            var panelRect = document.querySelector(PANEL_EL)
              .getBoundingClientRect();
            expect(panelRect.left).toBeApproximately(myButtonRect.left);
          });

          it('right aligned with an element', function() {
            var position = mdPanelPosition
              .relativeTo(myButton)
              .addPanelPosition(xPosition.ALIGN_START, null);

            config['position'] = position;

            openPanel(config);

            var panelRect = document.querySelector(PANEL_EL)
              .getBoundingClientRect();
            expect(panelRect.right).toBeApproximately(myButtonRect.right);
          });

          it('offset to the right of an element', function() {
            var position = mdPanelPosition
              .relativeTo(myButton)
              .addPanelPosition(xPosition.OFFSET_END, null);

            config['position'] = position;

            openPanel(config);

            var panelRect = document.querySelector(PANEL_EL)
              .getBoundingClientRect();
            expect(panelRect.right).toBeApproximately(myButtonRect.left);
          });
        });
      });

      it('should throw if xPosition is not valid', function() {
        var expression = function() {
          mdPanelPosition
              .relativeTo(myButton)
              .addPanelPosition('fake-x-position', null);
        };

        expect(expression).toThrow();
      });

      it('should throw if yPosition is not valid', function() {
        var expression = function() {
          mdPanelPosition
              .relativeTo(myButton)
              .addPanelPosition(null, 'fake-y-position');
        };

        expect(expression).toThrow();
      });
    });
  });

  describe('animation logic', function() {
    var mdPanelAnimation;
    var myButton;

    beforeEach(function() {
      mdPanelAnimation = $mdPanel.newPanelAnimation();

      myButton = '<button>myButton</button>';
      attachToBody(myButton);
      myButton = angular.element(document.querySelector('button'));
    });

    it('should animate with default slide', function() {
      var config = DEFAULT_CONFIG;
      config['animation'] = mdPanelAnimation.openFrom('button')
          .withAnimation('md-panel-animate-slide');

      openPanel();
      // If animation dies, panel doesn't unhide.
      expect(panelRef.panelContainer).not.toHaveClass(HIDDEN_CLASS);

      closePanel();
      // If animation dies, panel doesn't hide.
      expect(panelRef.panelContainer).toHaveClass(HIDDEN_CLASS);
    });

    it('should animate with custom class', function() {
      var config = DEFAULT_CONFIG;
      config['animation'] = mdPanelAnimation.openFrom('button')
          .withAnimation('myClass');

      openPanel();
      // If animation dies, panel doesn't unhide.
      expect(panelRef.panelContainer).not.toHaveClass(HIDDEN_CLASS);

      closePanel();
      // If animation dies, panel doesn't hide.
      expect(panelRef.panelContainer).toHaveClass(HIDDEN_CLASS);
    });

    describe('should determine openFrom when', function() {
      it('provided a selector', function() {
        var animation = mdPanelAnimation.openFrom('button');

        expect(animation._openFrom.element[0]).toEqual(myButton[0]);
        expect(animation._openFrom.bounds).toEqual(myButton[0].getBoundingClientRect());
      });

      it('provided an element', function() {
        var animation = mdPanelAnimation.openFrom(myButton[0]);

        expect(animation._openFrom.element[0]).toEqual(myButton[0]);
        expect(animation._openFrom.bounds).toEqual(myButton[0].getBoundingClientRect());
      });

      it('provided an event', function() {
        var myEvent = { type: 'click', target: myButton };
        var animation = mdPanelAnimation.openFrom(myEvent);

        expect(animation._openFrom.element[0]).toEqual(myButton[0]);
        expect(animation._openFrom.bounds).toEqual(myButton[0].getBoundingClientRect());
      });

      it('provided a bounding rect', function() {
        var rect = myButton[0].getBoundingClientRect();
        var inputRect = { top: rect.top, left: rect.left };
        var animation = mdPanelAnimation.openFrom(inputRect);

        expect(animation._openFrom.element).toBeUndefined();
        expect(animation._openFrom.bounds).toEqual(inputRect);
      });
    });

    describe('should determine closeTo when', function() {
      it('provided a selector', function() {
        var animation = mdPanelAnimation.closeTo('button');

        expect(animation._closeTo.element).toEqual(myButton);
        expect(animation._closeTo.bounds).toEqual(myButton[0].getBoundingClientRect());
      });

      it('provided an element', function() {
        var animation = mdPanelAnimation.closeTo(myButton[0]);

        expect(animation._closeTo.element).toEqual(myButton);
        expect(animation._closeTo.bounds).toEqual(myButton[0].getBoundingClientRect());
      });

      it('provided a bounding rect', function() {
        var rect = myButton[0].getBoundingClientRect();
        var inputRect = { top: rect.top, left: rect.left };
        var animation = mdPanelAnimation.closeTo(inputRect);

        expect(animation._closeTo.element).toBeUndefined();
        expect(animation._closeTo.bounds).toEqual(inputRect);
      });
    });
  });

  /**
   * Attached an element to document.body. Keeps track of attached elements
   * so that they can be removed in an afterEach.
   * @param el
   */
  function attachToBody(el) {
    var element = angular.element(el);
    angular.element(document.body).append(element);
    attachedElements.push(element);
  }

  function clickPanelContainer() {
    if (!panelRef) {
      return;
    }

    var container = panelRef.panelContainer;

    container.triggerHandler({
      type: 'mousedown',
      target: container[0]
    });

    container.triggerHandler({
      type: 'mouseup',
      target: container[0]
    });

    flushPanel();
  }

  function pressEscape() {
    if (!panelRef) {
      return;
    }

    var container = panelRef.panelContainer;

    container.triggerHandler({
      type: 'keydown',
      keyCode: $mdConstant.KEY_CODE.ESCAPE
    });

    flushPanel();
  }

  /**
   * Opens the panel. If a config value is passed, creates a new panelRef
   * using $mdPanel.open(config); Otherwise, called open on the panelRef,
   * assuming one has already been created.
   * @param {!Object=} opt_config
   */
  function openPanel(opt_config) {
    // TODO(ErinCoughlan): Investigate why panelRef.open() doesn't return
    // panelRef.
    var openPromise;
    if (panelRef) {
      openPromise = panelRef.open();
    } else {
      openPromise = $mdPanel.open(opt_config);
    }

    openPromise.then(function(createdPanelRef) {
      panelRef = createdPanelRef;
      return panelRef;
    });

    flushPanel();
  }

  /**
   * Closes the panel using an already created panelRef.
   */
  function closePanel() {
    panelRef && panelRef.close();
    flushPanel();
  }

  function showPanel() {
    panelRef && panelRef.show();
    flushPanel();
  }

  function hidePanel() {
    panelRef && panelRef.hide();
    flushPanel();
  }

  function flushPanel() {
    $rootScope.$apply();
    $material.flushOutstandingAnimations();
  }
});
