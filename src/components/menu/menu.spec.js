describe('material.components.menu', function() {
  var attachedElements = [];
  var $mdMenu, $timeout, menuActionPerformed, $mdUtil;

  beforeEach(module('material.components.menu'));
  beforeEach(inject(function(_$mdUtil_, _$mdMenu_, _$timeout_, $document) {
    $mdUtil = _$mdUtil_;
    $mdMenu = _$mdMenu_;
    $timeout = _$timeout_;
    var abandonedMenus = $document[0].querySelectorAll('.md-open-menu-container');
    angular.element(abandonedMenus).remove();
  }));
  afterEach(function() {
    menuActionPerformed = false;
    attachedElements.forEach(function(element) {
      element.remove();
    });
    attachedElements = [];
  });

  describe('md-menu directive', function() {

    it('errors on invalid markup', inject(function($compile, $rootScope) {
      function buildBadMenu() {
        $compile('<md-menu></md-menu>')($rootScope);
      }

      expect(buildBadMenu).toThrow();
    }));

    it('specifies button type', inject(function($compile, $rootScope) {
      var menu = setup()[0];
      expect(menu.firstElementChild.getAttribute('type')).toBe('button');
    }));

    it('opens on click', function () {
      var menu = setup();
      openMenu(menu);
      expect(getOpenMenuContainer(menu).length).toBe(1);
      closeMenu(menu);
      expect(getOpenMenuContainer(menu).length).toBe(0);
    });

    it('cleans up an open menu when the element leaves the DOM', function() {
      var menu = setup();
      openMenu(menu);
      menu.remove();
      expect(getOpenMenuContainer(menu).length).toBe(0);
    });

    it('sets up proper aria-owns and aria-haspopup relations between the button and the container', function() {
      var menu = setup();
      var button = menu[0].querySelector('button');
      expect(button.hasAttribute('aria-haspopup')).toBe(true);
      expect(button.hasAttribute('aria-owns')).toBe(true);
      var ownsId = button.getAttribute('aria-owns');
      openMenu(menu);
      expect(getOpenMenuContainer(menu).attr('id')).toBe(ownsId);
    });

    it('opens on click without $event', function() {
      var noEvent = true;
      var menu = setup('ng-click', noEvent);
      openMenu(menu);
      expect(getOpenMenuContainer(menu).length).toBe(1);
      closeMenu(menu);
      expect(getOpenMenuContainer(menu).length).toBe(0);
    });

    it('opens on mouseEnter', function() {
        var menu = setup('ng-mouseenter');
        openMenu(menu, 'mouseenter');
        expect(getOpenMenuContainer(menu).length).toBe(1);
        closeMenu(menu);
        expect(getOpenMenuContainer(menu).length).toBe(0);
      });

    it('opens on mouseEnter without $event', function() {
        var noEvent = true;
        var menu = setup('ng-mouseenter', noEvent);
        openMenu(menu, 'mouseenter');
        expect(getOpenMenuContainer(menu).length).toBe(1);
        closeMenu(menu);
        expect(getOpenMenuContainer(menu).length).toBe(0);
      });

    it('should not propagate the click event', function() {
      var clickDetected = false, menu = setup();
      menu.on('click', function() {
        clickDetected = true;
      });

      openMenu(menu);
      expect(clickDetected).toBe(false);
      closeMenu(menu);
      expect(clickDetected).toBe(false);
    });

    it('should remove the backdrop if container got destroyed', inject(function($document) {
      var menu = setup();
      openMenu(menu);

      expect($document.find('md-backdrop').length).not.toBe(0);

      menu.remove();

      expect($document.find('md-backdrop').length).toBe(0);
    }));

    it('closes on backdrop click', inject(function($document) {

      var menu = setup();
      openMenu(menu);

      expect(getOpenMenuContainer(menu).length).toBe(1);

      $document.find('md-backdrop').triggerHandler('click');
      waitForMenuClose();

      expect(getOpenMenuContainer(menu).length).toBe(0);
    }));


    it('closes on escape', inject(function($document, $mdConstant) {
      var menu = setup();
      openMenu(menu);
      expect(getOpenMenuContainer(menu).length).toBe(1);

      var openMenuEl = $document[0].querySelector('md-menu-content');

      pressKey(openMenuEl, $mdConstant.KEY_CODE.ESCAPE);
      waitForMenuClose();

      expect(getOpenMenuContainer(menu).length).toBe(0);
    }));

    describe('closes with -', function() {
      it('closes on normal option click', function() {

        var menu = setup();
        expect(getOpenMenuContainer(menu).length).toBe(0);
        openMenu(menu);

        expect(menuActionPerformed).toBeFalsy();
        expect(getOpenMenuContainer(menu).length).toBe(1);

        var btn = getOpenMenuContainer(menu)[0].querySelector('md-button');
        btn.click();

        waitForMenuClose();

        expect(menuActionPerformed).toBeTruthy();

        expect(getOpenMenuContainer(menu).length).toBe(0);
      });

      itClosesWithAttributes([
        'data-ng-click', 'x-ng-click',
        'ui-sref', 'data-ui-sref', 'x-ui-sref',
        'ng-href', 'data-ng-href', 'x-ng-href'
      ]);

      function itClosesWithAttributes(types) {
        for (var i = 0; i < types.length; ++i) {
          it('closes with ' + types[i], testAttribute(types[i]));
        }

        function testAttribute(attr) {
          return inject(function($rootScope, $compile, $timeout, $browser) {
            var template = '' +
              '<md-menu>' +
              ' <button ng-click="$mdOpenMenu($event)">Hello World</button>' +
              ' <md-menu-content>' +
              '  <md-menu-item>' +
              '    <md-button ' + attr + '=""></md-button>' +
              '  </md-menu-item>' +
              ' </md-menu-content>' +
              '</md-menu>';


            var menu = $compile(template)($rootScope);
            openMenu(menu);

            expect(getOpenMenuContainer(menu).length).toBe(1);

            $timeout.flush();
            var btn = getOpenMenuContainer(menu)[0].querySelector('md-button');
            btn.click();

            waitForMenuClose();

            expect(getOpenMenuContainer(menu).length).toBe(0);
          });
        }
      }
    });

    function setup(triggerType, noEvent, scope) {
      var menu,
        template = $mdUtil.supplant('' +
          '<md-menu>' +
          ' <button {0}="$mdOpenMenu({1})">Hello World</button>' +
          ' <md-menu-content>' +
          '  <md-menu-item>' +
          '    <md-button ng-click="doSomething($event)"></md-button>' +
          '  </md-menu-item>' +
          ' </md-menu-content>' +
          '</md-menu>',[ triggerType || 'ng-click', noEvent ? '' : "$event" ]);

      inject(function($compile, $rootScope) {
        $rootScope.doSomething = function($event) {
          menuActionPerformed = true;
        };
        menu = $compile(template)(scope || $rootScope);
      });

      attachedElements.push(menu);
      return menu;
    }
  });


  // ********************************************
  // Internal methods
  // ********************************************

  function getOpenMenuContainer(el) {
    var res;
    el = (el instanceof angular.element) ? el[0] : el;
    inject(function($document) {
      var container = $document[0].querySelector('.md-open-menu-container');
      if (container && container.style.display == 'none') {
        res = [];
      } else {
        res = angular.element(container);
      }
    });
    return res;
  }

  function openMenu(el, triggerType) {
    el.children().eq(0).triggerHandler(triggerType || 'click');
    waitForMenuOpen();
  }

  function closeMenu() {
    inject(function($document) {
      $document.find('md-backdrop');
      $document.find('md-backdrop').triggerHandler('click');
      waitForMenuClose();
    });
  }

  function waitForMenuOpen() {
    inject(function($material) {
      $material.flushInterimElement();
    });
  }

  function waitForMenuClose() {
    inject(function($material) {
      $material.flushInterimElement();
    });
  }

  function pressKey(el, code) {
    if (!(el instanceof angular.element)) {
      el = angular.element(el);
    }
    el.triggerHandler({
      type: 'keydown',
      keyCode: code
    });
  }
});
