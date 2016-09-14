describe('material.components.menuBar', function() {
  var attachedMenuElements = [];

  beforeEach(module('material.components.menuBar'));

  afterEach(function() {
    attachedMenuElements.forEach(function(element) {
      element.remove();
    });
    attachedMenuElements = [];
  });

  describe('MenuBar', function() {
    describe('MenuBar Directive', function() {

      it('should have `._md` class indicator', function() {
        var element = setup();
        expect(element.hasClass('_md')).toBe(true);
      });

      it('sets md-position-mode to "bottom left" on nested menus', function() {
        var menuBar = setup();
        var nestedMenu = menuBar[0].querySelector('md-menu');

        expect(nestedMenu.getAttribute('md-position-mode')).toBe('left bottom');
      });

      it('should close when clicking on the wrapping toolbar', inject(function($compile, $rootScope, $timeout, $material) {
        var ctrl = null;
        var menuCtrl = null;
        var toolbar = $compile(
          '<md-toolbar>' +
            '<md-menu-bar>' +
              '<md-menu ng-repeat="i in [1, 2, 3]">' +
                '<button ng-click></button>' +
                '<md-menu-content></md-menu-content>' +
              '</md-menu>' +
            '</md-menu-bar>' +
          '</md-toolbar>'
        )($rootScope);

        $rootScope.$digest();
        attachedMenuElements.push(toolbar); // ensure it gets cleaned up

        ctrl = toolbar.find('md-menu-bar').controller('mdMenuBar');
        menuCtrl = toolbar.find('md-menu').eq(0).controller('mdMenu');

        menuCtrl.open();
        $timeout.flush();

        expect(toolbar).toHaveClass('md-has-open-menu');
        spyOn(menuCtrl, 'close').and.callThrough();

        toolbar.triggerHandler('click');
        $material.flushInterimElement(); // flush out the scroll mask

        expect(toolbar).not.toHaveClass('md-has-open-menu');
        expect(ctrl.getOpenMenuIndex()).toBe(-1);
        expect(menuCtrl.close).toHaveBeenCalledWith(true, {
          closeAll: true
        });
      }));

      describe('ARIA', function() {

        it('sets role="menubar" on the menubar', function() {
          var menuBar = setup();
          var ariaRole = menuBar[0].getAttribute('role');
          expect(ariaRole).toBe('menubar');
        });

        it('should set the role on the menu trigger correctly', inject(function($compile, $rootScope) {
          var el = $compile(
            '<md-menu-bar>' +
              '<md-menu ng-repeat="i in [1, 2, 3]">' +
                '<md-button id="triggerButton" ng-click="lastClicked = $index"></md-button>' +
                '<md-menu-content></md-menu-content>' +
              '</md-menu>' +
            '</md-menu-bar>'
          )($rootScope);

          $rootScope.$digest();

          expect(el[0].querySelector('#triggerButton').getAttribute('role')).toBe('menuitem');
        }));
      });

      describe('nested menus', function() {
        var menuBar, menus, subMenuOpen, ctrl;

        it('opens consecutive nested menus', function() {
          menuBar = setup();
          ctrl = menuBar.controller('mdMenuBar');
          menus = menuBar[0].querySelectorAll('md-menu md-menu');

          angular.element(document.body).append(menuBar);

          // Open the menu-bar menu
          ctrl.focusMenu(1);
          ctrl.openFocusedMenu();
          waitForMenuOpen();

          // Open the first nested menu
          openSubMenu(0);
          waitForMenuOpen();
          expect(getOpenSubMenu().text().trim()).toBe('Sub 1 - Content');

          // Open the second nested menu, the first menu should close
          openSubMenu(1);
          waitForMenuClose();

          // Then the second menu should become visible
          waitForMenuOpen();
          expect(getOpenSubMenu().text().trim()).toBe('Sub 2 - Content');

          menuBar.remove();
        });

        function openSubMenu(index) {
          // If a menu is already open, trigger the mouse leave to close it
          if (subMenuOpen) {
            subMenuOpen.triggerHandler({
              type: 'mouseleave',
              target: subMenuOpen[0],
              currentTarget: subMenuOpen[0]
            });
          }

          // Set the currently open sub-menu and trigger the mouse enter
          subMenuOpen = angular.element(menus[index]);
          subMenuOpen.triggerHandler({
            type: 'mouseenter',
            target: subMenuOpen[0],
            currentTarget: subMenuOpen[0]
          });
        }

        function getOpenSubMenu() {
          var containers = document.body.querySelectorAll('.md-open-menu-container.md-active');
          var lastContainer = containers.item(containers.length - 1);

          return angular.element(lastContainer.querySelector('md-menu-content'));
        }

        function setup(){
          var el;
          inject(function($compile, $rootScope) {
            el = $compile([
              '<md-menu-bar>',
              '  <md-menu>',
              '    <md-menu-item>',
              '      <button ng-click="clicked=true">Button {{i}}</button>',
              '    </md-menu-item>',
              '    <md-menu-content class="test-submenu">',
              '      <md-menu ng-repeat="i in [1, 2]">',
              '        <md-menu-item>',
              '          <button ng-click="subclicked=true">Sub Button{{i}}</button>',
              '        </md-menu-item>',
              '        <md-menu-content>Sub {{i}} - Content</md-menu-content>',
              '      </md-menu>',
              '    </md-menu-content>',
              '  </md-menu>',
              '</md-menu-bar>'
            ].join(''))($rootScope);
            $rootScope.$digest();
          });
          attachedMenuElements.push(el);

          return el;
        }
      });
    });

    describe('MenuBarCtrl', function() {
      var menuBar, ctrl;
      beforeEach(function() {
        menuBar = setup();
        ctrl = menuBar.controller('mdMenuBar');
      });
      describe('#getMenus', function() {
        it('gets the menus in the menubar', function() {
          var menus = ctrl.getMenus();
          expect(Array.isArray(menus)).toBe(true);
          expect(menus.length).toBe(3);
          expect(menus[0].nodeName).toBe('MD-MENU');
        });
      });

      describe('#getFocusedMenuIndex', function() {
        it('gets the focused menu index', function() {
          var menus = ctrl.getMenus();
          ctrl.$document = [{
            activeElement: menus[1].querySelector('button')
          }];
          expect(ctrl.getFocusedMenuIndex()).toBe(1);
        });
      });

      describe('#getFocusedMenu', function() {
        it('gets the menu at the focused index', function() {
          var menus = [{}, {}, {}];
          spyOn(ctrl, 'getFocusedMenuIndex').and.returnValue(1);
          spyOn(ctrl, 'getMenus').and.returnValue(menus);
          expect(ctrl.getFocusedMenu()).toBe(menus[1]);
        });
      });

      describe('#focusMenu', function() {
        var focused;
        beforeEach(function() { focused = false; });
        it('focuses the first menu if none is focused', function() {
          var menus = mockButtonAtIndex(0);
          spyOn(ctrl, 'getFocusedMenuIndex').and.returnValue(-1);
          spyOn(ctrl, 'getMenus').and.returnValue(menus);
          ctrl.focusMenu(1);
          expect(focused).toBe(true);
        });
        it('focuses the next menu', function() {
          var menus = mockButtonAtIndex(1);
          spyOn(ctrl, 'getFocusedMenuIndex').and.returnValue(0);
          spyOn(ctrl, 'getMenus').and.returnValue(menus);
          ctrl.focusMenu(1);
          expect(focused).toBe(true);
        });
        it('focuses the previous menu', function() {
          var menus = mockButtonAtIndex(1);
          spyOn(ctrl, 'getFocusedMenuIndex').and.returnValue(2);
          spyOn(ctrl, 'getMenus').and.returnValue(menus);
          ctrl.focusMenu(-1);
          expect(focused).toBe(true);
        });

        it('does not focus prev at the start of the array', function() {
          var menus = mockButtonAtIndex(0);
          spyOn(ctrl, 'getFocusedMenuIndex').and.returnValue(0);
          spyOn(ctrl, 'getMenus').and.returnValue(menus);
          ctrl.focusMenu(-1);
          expect(focused).toBe(false);
        });

        it('does not focus next at the end of the array', function() {
          var menus = mockButtonAtIndex(2);
          spyOn(ctrl, 'getFocusedMenuIndex').and.returnValue(2);
          spyOn(ctrl, 'getMenus').and.returnValue(menus);
          ctrl.focusMenu(1);
          expect(focused).toBe(false);
        });

        function mockButtonAtIndex(index) {
          var result = [];
          var mockButton = {
            querySelector: function() { return {
              focus: function() { focused = true; }
            }; },

            // TODO: This may need to become more complex if more of the tests use it
            classList: { contains: function() { return false; } }
          };
          for (var i = 0; i < 3; ++i) {
            if (i == index) {
              result.push(mockButton);
            } else {
              result.push({ classList: mockButton.classList });
            }
          }
          return result;
        }
      });

      describe('#openFocusedMenu', function() {
        it('clicks the focused menu', function() {
          var opened = false;
          spyOn(ctrl, 'getFocusedMenu').and.returnValue({
            querySelector: function() { return true; }
          });
          spyOn(angular, 'element').and.returnValue({
            controller: function() { return {
              open: function() { opened = true; }
            }; }
          });
          ctrl.openFocusedMenu();
          expect(opened).toBe(true);
        });
      });

      describe('#handleKeyDown', function() {
        var keyCodes, call, called, calledWith;
        beforeEach(inject(function($injector) {
          var $mdConstant = $injector.get('$mdConstant');
          keyCodes = $mdConstant.KEY_CODE;
          called = false;
          call = function(arg) { called = true; calledWith = arg; };
        }));
        describe('DOWN_ARROW', function() {
          it('opens the currently focused menu', function() {
            spyOn(ctrl, 'openFocusedMenu').and.callFake(call);
            ctrl.handleKeyDown({ keyCode: keyCodes.DOWN_ARROW });
            expect(called).toBe(true);
          });
        });
        describe('RIGHT_ARROW', function() {
          it('focuses the next menu', function() {
            spyOn(ctrl, 'focusMenu').and.callFake(call);
            ctrl.handleKeyDown({ keyCode: keyCodes.RIGHT_ARROW });
            expect(called).toBe(true);
            expect(calledWith).toBe(1);
          });
        });
        describe('LEFT_ARROW', function() {
          it('focuses the previous menu', function() {
            spyOn(ctrl, 'focusMenu').and.callFake(call);
            ctrl.handleKeyDown({ keyCode: keyCodes.LEFT_ARROW });
            expect(called).toBe(true);
            expect(calledWith).toBe(-1);
          });
        });
      });
    });

    function setup() {
      var el;
      inject(function($compile, $rootScope) {
        el = $compile([
          '<md-menu-bar>',
            '<md-menu ng-repeat="i in [1, 2, 3]">',
              '<button ng-click="lastClicked = $index"></button>',
              '<md-menu-content></md-menu-content>',
            '</md-menu>',
          '</md-menu-bar>'
        ].join(''))($rootScope);
        $rootScope.$digest();
      });
      attachedMenuElements.push(el);

      return el;
    }
  });

  describe('md-menu-divider directive', function() {

    it('sets role="separator"', function() {
      var el = setup();
      expect(el.attr('role')).toBe('separator');
    });
    function setup() {
      var divider;
      inject(function($compile, $rootScope) {
        divider = $compile('<md-menu-divider></md-menu-divider>')($rootScope);
      });
      return divider;
    }
  });

  describe('md-menu-item directive', function() {
    describe('type="checkbox"', function() {
      function setup(attrs) {
        return setupMenuItem(attrs + ' type="checkbox"');
      }

      it('compiles', function() {
        var menuItem = setup('ng-model="test"')[0];
        expect(menuItem.classList.contains('md-indent')).toBe(true);
        var children = menuItem.children;
        expect(children[0].nodeName).toBe('MD-ICON');
        expect(children[1].nodeName).toBe('MD-BUTTON');
      });
      it('compiles with ng-repeat', function() {
        var menuItem = setup('ng-repeat="i in [1, 2, 3]"')[0];
        expect(menuItem.classList.contains('md-indent')).toBe(true);
        var children = menuItem.children;
        expect(children[0].nodeName).toBe('MD-ICON');
        expect(children[1].nodeName).toBe('MD-BUTTON');
      });
      it('sets aria role', function() {
        var menuItem = setup()[0].querySelector('md-button');
        expect(menuItem.getAttribute('role')).toBe('menuitemcheckbox');
      });
      it('toggles on click', function() {
        var menuItem = setup('ng-model="test"')[0];
        var button = menuItem.querySelector('md-button');
        button.click();
        inject(function($rootScope) {
          expect($rootScope.test).toBe(true);
        });
      });
      it('does not toggle if disabled', function() {
        var menuItem = setup('ng-model="test" ng-disabled="true"')[0];
        var button = menuItem.querySelector('md-button');
        button.click();
        inject(function($rootScope) {
          expect($rootScope.test).toBeFalsy();
        });
      });
      it('reflects the ng-model value', inject(function($rootScope) {
        var menuItem = setup('ng-model="test"')[0];
        var button = menuItem.querySelector('md-button');
        expect(button.getAttribute('aria-checked')).toBe('false');
        expect(menuItem.children[0].style.display).toBe('none');
        $rootScope.test = true;
        $rootScope.$digest();
        expect(menuItem.children[0].style.display).toBe('');
        expect(button.getAttribute('aria-checked')).toBe('true');
      }));
    });

    describe('type="radio"', function() {
      function setup(attrs) {
        return setupMenuItem(attrs + ' type="radio"');
      }

      it('compiles', function() {
        var menuItem = setup('ng-model="test"')[0];
        expect(menuItem.classList.contains('md-indent')).toBe(true);
        var children = menuItem.children;
        expect(children[0].nodeName).toBe('MD-ICON');
        expect(children[1].nodeName).toBe('MD-BUTTON');
      });
      it('compiles with ng-repeat', function() {
        var menuItem = setup('ng-repeat="i in [1, 2, 3]"')[0];
        expect(menuItem.classList.contains('md-indent')).toBe(true);
        var children = menuItem.children;
        expect(children[0].nodeName).toBe('MD-ICON');
        expect(children[1].nodeName).toBe('MD-BUTTON');
      });
      it('sets aria role', function() {
        var menuItem = setup()[0].querySelector('md-button');
        expect(menuItem.getAttribute('role')).toBe('menuitemradio');
      });
      it('toggles on click', function() {
        var menuItem = setup('ng-model="test" value="hello"')[0];
        var button = menuItem.querySelector('md-button');
        button.click();
        inject(function($rootScope) {
          expect($rootScope.test).toBe("hello");
        });
      });

      it('does not toggle if disabled', function() {
        var menuItem = setup('ng-model="test" value="hello" ng-disabled="true"')[0];
        var button = menuItem.querySelector('md-button');
        button.click();
        inject(function($rootScope) {
          expect($rootScope.test).toBeFalsy();
        });
      });

      it('reflects the ng-model value', inject(function($rootScope) {
        $rootScope.test = 'apple';
        var menuItem = setup('ng-model="test" value="hello"')[0];
        var button = menuItem.querySelector('md-button');
        expect(button.getAttribute('aria-checked')).toBe('false');
        expect(menuItem.children[0].style.display).toBe('none');
        $rootScope.test = 'hello';
        $rootScope.$digest();
        expect(menuItem.children[0].style.display).toBeFalsy();
        expect(button.getAttribute('aria-checked')).toBe('true');
      }));
    });

    function setupMenuItem(attrs) {
      // We need to have a `md-menu-bar` as a parent of our menu item, because the menu-item
      // is only wrapping and indenting the content if it's inside of a menu bar.
      var menuBar;
      var template =
        '<md-menu-bar>' +
          '<md-menu-item ' + (attrs = attrs || '') + '>Test Item</md-menu-item>' +
        '</md-menu-bar>';

      inject(function($compile, $rootScope) {
        menuBar = $compile(template)($rootScope);
        $rootScope.$digest();
      });

      return menuBar.find('md-menu-item');
    }
  });

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
});

