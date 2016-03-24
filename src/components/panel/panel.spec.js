describe('$mdPanel', function() {
  var $mdPanel, $rootScope, $rootEl, $templateCache, $q, $material;
  var panelRef;
  var attachedElements = [];
  var PANEL_WRAPPER_CLASS = '.md-panel-outer-wrapper';
  var PANEL_EL = '.md-panel';
  var HIDDEN_CLASS = '_md-panel-hidden';
  var FOCUS_TRAPS_CLASS = '._md-panel-focus-trap';
  var FULLSCREEN_CLASS = '_md-panel-fullscreen';
  var DEFAULT_TEMPLATE = '<div>Hello World!</div>';
  var DEFAULT_CONFIG = { template: DEFAULT_TEMPLATE };

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
  };

  beforeEach(function() {
    module('material.components.panel', 'ngSanitize');

    inject(injectLocals);

    // By default, the panel is attached to $rootElement, so add it to the DOM.
    attachToBody($rootEl);
  });

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
              message: 'Expected ' + expected + not + 'to be within ' +
                  epsilon + ' of ' + actual
            }
          }
        }
      }
    });
  });

  afterEach(function() {
    attachedElements.forEach(function(el) {
      el.remove();
    });
    attachedElements = [];

    panelRef && panelRef.close();

    // TODO(ErinCoughlan) - Remove when close destroys.
    panelRef = null;
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
    panelRef = $mdPanel.create(DEFAULT_CONFIG);

    expect(PANEL_EL).not.toExist();

    openPanel();

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

  describe('promises logic:', function() {
    var config;

    beforeEach(function() {
      config = {};

      panelRef = $mdPanel.create(config);
      expect(panelRef.isAttached).toEqual(false);
    });

    it('should resolve when opening/closing', function () {
      var openResolved = false;
      var closeResolved = false;

      expect(panelRef.id).toBeDefined();
      expect(panelRef.open).toBeOfType('function');
      expect(panelRef.close).toBeOfType('function');

      panelRef.open().then(function () {
        openResolved = true;
      });
      $rootScope.$apply();

      expect(openResolved).toBe(true);
      expect(panelRef._panelContainer).not.toHaveClass(HIDDEN_CLASS);
      expect(panelRef.isAttached).toEqual(true);

      panelRef.close().then(function () {
        closeResolved = true;
      });
      $rootScope.$apply();

      expect(closeResolved).toBe(true);
      expect(panelRef.isAttached).toEqual(false);
    });

    it('should reject on create when opening', function () {
      var openRejected = false;

      panelRef._createPanel = function() {
        return panelRef._$q.reject();
      };

      panelRef.open().then(function() {}, function () {
        openRejected = true;
      });
      $rootScope.$apply();

      expect(openRejected).toBe(true);
      expect(panelRef.isAttached).toEqual(false);
    });

    it('should reject on attach when opening', function () {
      var openRejected = false;

      panelRef.attachOnly = function() {
        return panelRef._$q.reject();
      };

      panelRef.open().then(function() {}, function () {
        openRejected = true;
      });
      $rootScope.$apply();

      expect(openRejected).toBe(true);
      expect(panelRef.isAttached).toEqual(false);
    });

    it('should reject on hide when closing', function () {
      var closeRejected = false;

      panelRef.open();
      $rootScope.$apply();

      expect(panelRef._panelContainer).not.toHaveClass(HIDDEN_CLASS);
      expect(panelRef.isAttached).toEqual(true);

      panelRef.hide = function() {
        return panelRef._$q.reject();
      };

      panelRef.close().then(function() {}, function () {
        closeRejected = true;
      });
      $rootScope.$apply();

      expect(closeRejected).toBe(true);
      expect(panelRef.isAttached).toEqual(true);
    });

    it('should reject on detach when closing', function () {
      var closeRejected = false;

      panelRef.open();
      $rootScope.$apply();

      expect(panelRef._panelContainer).not.toHaveClass(HIDDEN_CLASS);
      expect(panelRef.isAttached).toEqual(true);

      panelRef.detach = function() {
        return panelRef._$q.reject();
      };

      panelRef.close().then(function() {}, function () {
        closeRejected = true;
      });
      $rootScope.$apply();

      expect(closeRejected).toBe(true);
      expect(panelRef.isAttached).toEqual(true);
    });
  });

  describe('config options:', function() {
    it('should attach panel to a specific element', function() {
      var parentEl = document.createElement('div');
      parentEl.id = 'parent';
      attachToBody(parentEl);

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

      expect(document.querySelector(PANEL_WRAPPER_CLASS).style.zIndex)
          .toEqual(zIndex);
    });

    it('should set z-index to 0', function() {
      var zIndex = '0';

      var config = {
        template: DEFAULT_TEMPLATE,
        zIndex: zIndex
      };

      openPanel(config);

      expect(document.querySelector(PANEL_WRAPPER_CLASS).style.zIndex)
          .toEqual(zIndex);
    });

    it('should not close when clickOutsideToClose set to false', function() {
      openPanel();

      var container = panelRef._panelContainer;
      container.triggerHandler({
        type: 'mousedown',
        target: container[0]
      });
      container.triggerHandler({
        type: 'mouseup',
        target: container[0]
      });
      $rootScope.$apply();

      expect(PANEL_EL).toExist();
    });

    it('should close when clickOutsideToClose set to true', function() {
      var config = {
        clickOutsideToClose: true
      };

      openPanel(config);

      var container = panelRef._panelContainer;
      container.triggerHandler({
        type: 'mousedown',
        target: container[0]
      });
      container.triggerHandler({
        type: 'mouseup',
        target: container[0]
      });
      $rootScope.$apply();

      // TODO(ErinCoughlan) - Add this when destroy is added.
      // expect(panelRef).toBeUndefined();
      expect(PANEL_EL).not.toExist();
    });

    it('should not close when escapeToClose set to false', inject(function($mdConstant) {
      openPanel();

      var container = panelRef._panelContainer;
      container.triggerHandler({
        type: 'keydown',
        keyCode: $mdConstant.KEY_CODE.ESCAPE
      });
      $rootScope.$apply();

      expect(PANEL_EL).toExist();
    }));

    it('should close when escapeToClose set to true', inject(function($mdConstant) {
      var config = {
        escapeToClose: true
      };

      openPanel(config);

      var container = panelRef._panelContainer;
      container.triggerHandler({
        type: 'keydown',
        keyCode: $mdConstant.KEY_CODE.ESCAPE
      });
      $rootScope.$apply();

      // TODO(ErinCoughlan) - Add this when destroy is added.
      // expect(panelRef).toBeUndefined();
      expect(PANEL_EL).not.toExist();
    }));

    it('should create and cleanup focus traps', function() {
      var config = { template: DEFAULT_TEMPLATE, trapFocus: true };

      openPanel(config);

      // It should add two focus traps to the document around the panel content.
      var focusTraps = document.querySelectorAll(FOCUS_TRAPS_CLASS);
      expect(focusTraps.length).toBe(2);

      var topTrap = focusTraps[0];
      var bottomTrap = focusTraps[1];

      var panel = panelRef._panelEl;
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

    it('should not focus on open focusOnOpen=false', function() {
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
      $rootScope.$apply();

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
      var template = '<div>{{ ctrl.content }}</div>';

      var config = {
        template: template,
        controller: function Ctrl(content) {
          this.content = content;
        },
        controllerAs: 'ctrl',
        locals: { content: htmlContent },
        bindToController: false,
      };

      openPanel(config);

      expect(PANEL_EL).toContainHtml(htmlContent);
    });

    it('should bind locals to the controller', function() {
      var htmlContent = 'Apple Pie';
      var template = '<div>{{ ctrl.content }}</div>';

      var config = {
        template: template,
        controller: function Ctrl() {
          this.content; // Populated via bindToController.
        },
        controllerAs: 'ctrl',
        locals: { content: htmlContent }
      };

      openPanel(config);

      expect(PANEL_EL).toContainHtml(htmlContent);
    });
  });

  describe('positioning logic', function() {
    var config;
    var mdPanelPosition;

    beforeEach(function() {
      config = DEFAULT_CONFIG;
      mdPanelPosition = $mdPanel.newPanelPosition();
    });

    describe('should absolutely position the panel at', function() {
      it('top', function () {
        var top = '50px';
        var position = mdPanelPosition.absolute().top(top);
        config['position'] = position;

        openPanel(config);

        var panelCss = document.querySelector(PANEL_EL).style;
        expect(panelCss.position).toEqual('fixed');
        expect(panelCss.top).toEqual(top);
      });

      it('top with default 0', function () {
        var position = mdPanelPosition.absolute().top();
        config['position'] = position;

        openPanel(config);

        var panelCss = document.querySelector(PANEL_EL).style;
        expect(panelCss.position).toEqual('fixed');
        expect(panelCss.top).toEqual('0px');
      });

      it('bottom', function () {
        var bottom = '50px';
        var position = mdPanelPosition.absolute().bottom(bottom);
        config['position'] = position;

        openPanel(config);

        var panelCss = document.querySelector(PANEL_EL).style;
        expect(panelCss.position).toEqual('fixed');
        expect(panelCss.bottom).toEqual(bottom);
      });

      it('bottom with default 0', function () {
        var position = mdPanelPosition.absolute().bottom();
        config['position'] = position;

        openPanel(config);

        var panelCss = document.querySelector(PANEL_EL).style;
        expect(panelCss.position).toEqual('fixed');
        expect(panelCss.bottom).toEqual('0px');
      });

      it('left', function () {
        var left = '50px';
        var position = mdPanelPosition.absolute().left(left);
        config['position'] = position;

        openPanel(config);

        var panelCss = document.querySelector(PANEL_EL).style;
        expect(panelCss.position).toEqual('fixed');
        expect(panelCss.left).toEqual(left);
      });

      it('left with default 0', function () {
        var position = mdPanelPosition.absolute().left();
        config['position'] = position;

        openPanel(config);

        var panelCss = document.querySelector(PANEL_EL).style;
        expect(panelCss.position).toEqual('fixed');
        expect(panelCss.left).toEqual('0px');
      });

      it('right', function () {
        var right = '50px';
        var position = mdPanelPosition.absolute().right(right);
        config['position'] = position;

        openPanel(config);

        var panelCss = document.querySelector(PANEL_EL).style;
        expect(panelCss.position).toEqual('fixed');
        expect(panelCss.right).toEqual(right);
      });

      it('right with default 0', function () {
        var position = mdPanelPosition.absolute().right();
        config['position'] = position;

        openPanel(config);

        var panelCss = document.querySelector(PANEL_EL).style;
        expect(panelCss.position).toEqual('fixed');
        expect(panelCss.right).toEqual('0px');
      });
    });

    describe('should relatively position the panel', function() {
      var myButton;
      var myButtonRect;

      beforeEach(function() {
        myButton = '<button>myButton</button>';
        attachToBody(myButton);
        myButton = angular.element(document.querySelector('button'));
        myButtonRect = myButton[0].getBoundingClientRect();
      });

      it('with respect to an element', function() {
        var position = mdPanelPosition
            .relativeTo(myButton[0])
            .withPanelXPosition('align-start')
            .withPanelYPosition('align-tops');

        config['position'] = position;

        openPanel(config);

        var panelCss = document.querySelector(PANEL_EL).style;
        expect(panelCss.position).toEqual('fixed');
        expect(panelCss.left).toBeApproximately(myButtonRect.left);
        expect(panelCss.top).toBeApproximately(myButtonRect.top);
      });

      it('with respect to a query selector', function() {
        var position = mdPanelPosition
            .relativeTo('button')
            .withPanelXPosition('align-start')
            .withPanelYPosition('align-tops');

        config['position'] = position;

        openPanel(config);

        var panelCss = document.querySelector(PANEL_EL).style;
        expect(panelCss.position).toEqual('fixed');
        expect(panelCss.left).toBeApproximately(myButtonRect.left);
        expect(panelCss.top).toBeApproximately(myButtonRect.top);
      });

      it('with respect to a JQLite object', function() {
        var position = mdPanelPosition
            .relativeTo(myButton)
            .withPanelXPosition('align-start')
            .withPanelYPosition('align-tops');

        config['position'] = position;

        openPanel(config);

        var panelCss = document.querySelector(PANEL_EL).style;
        expect(panelCss.position).toEqual('fixed');
        expect(panelCss.left).toBeApproximately(myButtonRect.left);
        expect(panelCss.top).toBeApproximately(myButtonRect.top);
      });

      describe('vertically', function() {
        it('above an element', function() {
          var position = mdPanelPosition
              .relativeTo(myButton)
              .withPanelYPosition('above');

          config['position'] = position;

          openPanel(config);

          var panelCss = document.querySelector(PANEL_EL).style;
          expect(panelCss.bottom).toBeApproximately(myButtonRect.top);
        });

        it('top aligned with an element', function() {
          var position = mdPanelPosition
              .relativeTo(myButton)
              .withPanelYPosition('align-tops');

          config['position'] = position;

          openPanel(config);

          var panelCss = document.querySelector(PANEL_EL).style;
          expect(panelCss.top).toBeApproximately(myButtonRect.top);
        });

        it('centered with an element', function() {
          var position = mdPanelPosition
              .relativeTo(myButton)
              .withPanelYPosition('center');

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
              .withPanelYPosition('align-bottoms');

          config['position'] = position;

          openPanel(config);

          var panelCss = document.querySelector(PANEL_EL).style;
          expect(panelCss.bottom).toBeApproximately(myButtonRect.bottom);
        });

        it('below an element', function() {
          var position = mdPanelPosition
              .relativeTo(myButton)
              .withPanelYPosition('below');

          config['position'] = position;

          openPanel(config);

          var panelCss = document.querySelector(PANEL_EL).style;
          expect(panelCss.top).toBeApproximately(myButtonRect.bottom);
        });
      });

      describe('horizontally', function() {
        it('offset to the left of an element', function() {
          var position = mdPanelPosition
              .relativeTo(myButton)
              .withPanelXPosition('offset-start');

          config['position'] = position;

          openPanel(config);

          var panelCss = document.querySelector(PANEL_EL).style;
          expect(panelCss.right).toBeApproximately(myButtonRect.left);
        });

        it('right aligned with an element', function() {
          var position = mdPanelPosition
              .relativeTo(myButton)
              .withPanelXPosition('align-end');

          config['position'] = position;

          openPanel(config);

          var panelCss = document.querySelector(PANEL_EL).style;
          expect(panelCss.right).toBeApproximately(myButtonRect.right);
        });

        it('centered with an element', function() {
          var position = mdPanelPosition
              .relativeTo(myButton)
              .withPanelXPosition('center');

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
              .withPanelXPosition('align-start');

          config['position'] = position;

          openPanel(config);

          var panelCss = document.querySelector(PANEL_EL).style;
          expect(panelCss.left).toBeApproximately(myButtonRect.left);
        });

        it('offset to the right of an element', function() {
          var position = mdPanelPosition
              .relativeTo(myButton)
              .withPanelXPosition('offset-end');

          config['position'] = position;

          openPanel(config);

          var panelCss = document.querySelector(PANEL_EL).style;
          expect(panelCss.left).toBeApproximately(myButtonRect.right);
        });
      });
    });

    it('should throw if xPosition is not valid', function() {
      var myButton = '<button>myButton</button>';
      attachToBody(myButton);
      myButton = angular.element(document.querySelector('button'));

      var expression = function() {
        mdPanelPosition
            .relativeTo(myButton)
            .withPanelXPosition('fake-x-position');
      };

      expect(expression).toThrow();
    });

    it('should throw if yPosition is not valid', function() {
      var myButton = '<button>myButton</button>';
      attachToBody(myButton);
      myButton = angular.element(document.querySelector('button'));

      var expression = function() {
        mdPanelPosition
            .relativeTo(myButton)
            .withPanelYPosition('fake-y-position');
      }

      expect(expression).toThrow();
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
      expect(panelRef._panelContainer).not.toHaveClass(HIDDEN_CLASS);

      closePanel();
      // If animation dies, panel doesn't hide.
      expect(panelRef._panelContainer).toHaveClass(HIDDEN_CLASS);
    });

    it('should animate with custom class', function() {
      var config = DEFAULT_CONFIG;
      config['animation'] = mdPanelAnimation.openFrom('button')
          .withAnimation('myClass');

      openPanel();
      // If animation dies, panel doesn't unhide.
      expect(panelRef._panelContainer).not.toHaveClass(HIDDEN_CLASS);

      closePanel();
      // If animation dies, panel doesn't hide.
      expect(panelRef._panelContainer).toHaveClass(HIDDEN_CLASS);
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
        var myEvent = { type: 'click', target: myButton};
        var animation = mdPanelAnimation.openFrom(myEvent);

        expect(animation._openFrom.element[0]).toEqual(myButton[0]);
        expect(animation._openFrom.bounds).toEqual(myButton[0].getBoundingClientRect());
      });


      it('provided a bounding rect', function() {
        var rect = myButton[0].getBoundingClientRect();
        var inputRect = {top: rect.top, left: rect.left};
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
        var inputRect = {top: rect.top, left: rect.left};
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

  /**
   * Opens the panel. If a config value is passed, creates a new panelRef
   * using $mdPanel.open(config); Otherwise, called open on the panelRef,
   * assuming one has already been created.
   * @param {!Object=} opt_config
   */
  function openPanel(opt_config) {
    if (opt_config) {
      panelRef = $mdPanel.open(opt_config);
    } else if (panelRef) {
      panelRef.open();
    } else {
      panelRef = $mdPanel.open();
    }
    $rootScope.$apply();
    // Second $apply needed to account for the $applyAsync in attach. This
    // isn't always necessary, but is better to have here twice than sprinkled
    // through the tests.
    $rootScope.$apply();
    $material.flushOutstandingAnimations();
  }

  /**
   * Closes the panel using an already created panelRef.
   */
  function closePanel() {
    panelRef && panelRef.close();
    $rootScope.$apply();
    $material.flushOutstandingAnimations();
  }

  function showPanel() {
    panelRef && panelRef.show(HIDDEN_CLASS);
    $rootScope.$apply();
    $material.flushOutstandingAnimations();
  }

  function hidePanel() {
    panelRef && panelRef.hide(HIDDEN_CLASS);
    $rootScope.$apply();
    $material.flushOutstandingAnimations();
  }
});
