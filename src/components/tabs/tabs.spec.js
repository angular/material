describe('<md-tabs>', function () {

  beforeEach(module('material.components.tabs'));
  beforeEach(function () {
    jasmine.mockElementFocus(this);

    jasmine.addMatchers({
      toBeActiveTab: function () {
        return {
          compare: function (actual, expected) {
            var fails = [];

            if (!actual.length) {
              fails.push('element not found');
            } else {
              if (!actual.hasClass('md-active')) {
                fails.push('does not have active class');
              }
              if (actual.attr('aria-selected') != 'true') {
                fails.push('aria-selected is not true');
              }
            }

            var results  = { pass: fails.length === 0 };
            var negation = !results.pass ? "" : " not ";

            results.message = "";
            results.message += "Expected '";
            results.message += angular.mock.dump(actual);
            results.message += negation + "' to be the active tab. Failures: " + fails.join(', ');

            return results;
          }
        };
      }
    });
  });

  function setup (template, scope) {
    var el;
    inject(function ($compile, $rootScope) {
      var newScope = $rootScope.$new();
      for (var key in scope || {}) newScope[key] = scope[key];
      el = $compile(template)(newScope);
      newScope.$apply();
    });
    return el;
  }

  function triggerKeydown (el, keyCode) {
    return el.triggerHandler({
      type:           'keydown',
      keyCode:        keyCode,
      preventDefault: angular.noop
    });
  }

  describe('activating tabs', function () {

    it('should have `._md` class indicator', inject(function() {
      var tabs = setup(
        '<md-tabs> ' +
        '   <md-tab label="a">a</md-tab>' +
        '   <md-tab label="b">b</md-tab>' +
        '</md-tabs>'
      );

      expect(tabs.find('md-tabs-content-wrapper').hasClass('_md')).toBe(true);
    }));

    it('should select first tab by default', function () {
      var tabs = setup(
              '<md-tabs> ' +
              '   <md-tab label="a">a</md-tab>' +
              '   <md-tab label="b">b</md-tab>' +
              '</md-tabs>'
          );
      expect(tabs.find('md-tab-item').eq(0)).toBeActiveTab();
    });

    it('should select & focus tab on click', inject(function ($document, $rootScope) {
      var tabs     = setup('<md-tabs>' +
                           '<md-tab></md-tab>' +
                           '<md-tab></md-tab>' +
                           '<md-tab ng-disabled="true"></md-tab>' +
                           '</md-tabs>');
      var tabItems = tabs.find('md-tab-item');

      tabs.find('md-tab-item').eq(1).triggerHandler('click');
      $rootScope.$apply();
      expect(tabItems.eq(1)).toBeActiveTab();

      tabs.find('md-tab-item').eq(0).triggerHandler('click');
      expect(tabItems.eq(0)).toBeActiveTab();
    }));

    it('should focus tab on arrow if tab is enabled', inject(function ($document, $mdConstant, $timeout) {
      var tabs     = setup('<md-tabs>' +
                           '<md-tab></md-tab>' +
                           '<md-tab ng-disabled="true"></md-tab>' +
                           '<md-tab></md-tab>' +
                           '</md-tabs>');
      var ctrl = tabs.controller('mdTabs');
      var tabItems = tabs.find('md-tab-item');

      expect(tabItems.eq(0)).toBeActiveTab();

      // Focus should move to the last tab if left arrow is pressed
      triggerKeydown(tabs.find('md-tabs-canvas').eq(0), $mdConstant.KEY_CODE.LEFT_ARROW);
      expect(ctrl.getFocusedTabId()).toBe(tabItems.eq(2).attr('id'));

      // Focus should move to the first tab if right arrow is pressed
      triggerKeydown(tabs.find('md-tabs-canvas').eq(0), $mdConstant.KEY_CODE.RIGHT_ARROW);
      expect(ctrl.getFocusedTabId()).toBe(tabItems.eq(0).attr('id'));

      // Tab 0 should still be active, but tab 2 focused (skip tab 1 it's disabled)
      triggerKeydown(tabs.find('md-tabs-canvas').eq(0), $mdConstant.KEY_CODE.RIGHT_ARROW);
      expect(tabItems.eq(0)).toBeActiveTab();

      triggerKeydown(tabs.find('md-tabs-canvas').eq(0), $mdConstant.KEY_CODE.ENTER);
      expect(tabItems.eq(2)).toBeActiveTab();

      triggerKeydown(tabs.find('md-tabs-canvas').eq(0), $mdConstant.KEY_CODE.ENTER);
      expect(tabItems.eq(2)).toBeActiveTab();

      // Skip tab 1 again, it's disabled
      triggerKeydown(tabs.find('md-tabs-canvas').eq(0), $mdConstant.KEY_CODE.LEFT_ARROW);
      triggerKeydown(tabs.find('md-tabs-canvas').eq(0), $mdConstant.KEY_CODE.ENTER);
      expect(tabItems.eq(0)).toBeActiveTab();

    }));

    it('should select tab on space or enter', inject(function ($document, $mdConstant) {
      var tabs     = setup('<md-tabs>' +
                           '<md-tab></md-tab>' +
                           '<md-tab></md-tab>' +
                           '</md-tabs>');
      var tabItems = tabs.find('md-tab-item');
      tabs.find('md-tab-item').eq(0).triggerHandler('click');

      triggerKeydown(tabs.find('md-tabs-canvas').eq(0), $mdConstant.KEY_CODE.RIGHT_ARROW);
      triggerKeydown(tabs.find('md-tabs-canvas').eq(0), $mdConstant.KEY_CODE.ENTER);
      expect(tabItems.eq(1)).toBeActiveTab();
      expect(tabItems.eq(1).attr('tabindex')).toBe('0');

      triggerKeydown(tabs.find('md-tabs-canvas').eq(0), $mdConstant.KEY_CODE.LEFT_ARROW);
      triggerKeydown(tabs.find('md-tabs-canvas').eq(0), $mdConstant.KEY_CODE.SPACE);
      expect(tabItems.eq(0)).toBeActiveTab();
      // Active tab should be added to the tab order as per ARIA practices.
      expect(tabItems.eq(0).attr('tabindex')).toBe('0');
      // Deactivated tab should be removed from the tab order.
      expect(tabItems.eq(1).attr('tabindex')).toBe('-1');
    }));

    it('should bind to selected', function () {
      var tabs      = setup('<md-tabs md-selected="current">' +
                            '<md-tab></md-tab>' +
                            '<md-tab></md-tab>' +
                            '<md-tab></md-tab>' +
                            '</md-tabs>');
      var tabItems  = tabs.find('md-tab-item');
      var dummyTabs = tabs.find('md-dummy-tab');

      expect(tabItems.eq(0)).toBeActiveTab();
      expect(tabs.scope().current).toBe(0);

      tabs.scope().$apply('current = 1');
      expect(tabItems.eq(1)).toBeActiveTab();

      expect(tabItems.eq(0).attr('aria-selected')).toBe('false');

      tabItems.eq(2).triggerHandler('click');
      expect(tabs.scope().current).toBe(2);
    });

    it('disabling active tab', function () {
      var tabs      = setup('<md-tabs>' +
                            '<md-tab ng-disabled="disabled0"></md-tab>' +
                            '<md-tab ng-disabled="disabled1"></md-tab>' +
                            '</md-tabs>');
      var tabItems  = tabs.find('md-tab-item');

      expect(tabItems.eq(0)).toBeActiveTab();
      expect(tabItems.eq(0).attr('aria-selected')).toBe('true');

      tabs.scope().$apply('disabled0 = true');
      expect(tabItems.eq(1)).toBeActiveTab();

      expect(tabItems.eq(0).attr('aria-disabled')).toBe('true');
      expect(tabItems.eq(1).attr('aria-disabled')).toBe('false');

      tabs.scope().$apply('disabled0 = false; disabled1 = true');
      expect(tabItems.eq(0)).toBeActiveTab();

      expect(tabItems.eq(0).attr('aria-disabled')).toBe('false');
      expect(tabItems.eq(1).attr('aria-disabled')).toBe('true');
    });

    it('should reconcile focused and active tabs', inject(function($mdConstant) {
      var tabs = setup('<md-tabs>' +
                       '<md-tab label="super label"></md-tab>' +
                       '<md-tab label="super label two"></md-tab>' +
                       '</md-tabs>' +
                       '<div tabindex="0">Focusable element</div>');
      var ctrl = tabs.controller('mdTabs');
      var tabItems = tabs.find('md-tab-item');
      triggerKeydown(tabs.find('md-tabs-canvas').eq(0), $mdConstant.KEY_CODE.RIGHT_ARROW);
      expect(tabItems.eq(0)).toBeActiveTab();
      expect(ctrl.getFocusedTabId()).toBe(tabItems.eq(1).attr('id'));

      triggerKeydown(tabs.find('md-tabs-canvas').eq(0), $mdConstant.KEY_CODE.TAB);
      expect(tabItems.eq(0)).toBeActiveTab();
      expect(ctrl.getFocusedTabId()).toBe(tabItems.eq(0).attr('id'));
    }));

  });

  describe('tab label & content DOM', function () {

    it('should support both label types', function () {
      var tabs1 = setup('<md-tabs>' +
                        '<md-tab label="super label"></md-tab>' +
                        '</md-tabs>');
      expect(tabs1.find('md-tab-item').text()).toBe('super label');

      var tabs2 = setup('<md-tabs>' +
                        '<md-tab><md-tab-label><b>super</b> label</md-tab-label></md-tab>' +
                        '</md-tabs>');
      expect(tabs2.find('md-tab-item').text()).toBe('super label');

    });

    it('should support content inside with each kind of label', function () {
      var tabs1 = setup('<md-tabs>' +
                        '<md-tab label="label that!"><b>content</b> that!</md-tab>' +
                        '</md-tabs>');
      expect(tabs1.find('md-tab-item').text()).toBe('label that!');
      expect(tabs1[ 0 ].querySelector('md-tab-content').textContent.trim()).toBe('content that!');

      var tabs2 = setup('<md-tabs>\
        <md-tab>\
          <md-tab-label>label that!</md-tab-label>\
          <md-tab-body><b>content</b> that!</md-tab-body>\
        </md-tab>\
      </md-tabs>');
      expect(tabs1.find('md-tab-item').text()).toBe('label that!');
      expect(tabs1[ 0 ].querySelector('md-tab-content').textContent.trim()).toBe('content that!');
    });

    it('updates pagination and ink styles when string labels change', function(done) {
      inject(function($rootScope, $timeout) {
        // Setup our initial label
        $rootScope.$apply('label = "Some Label"');

        // Init our variables
        var template = '<md-tabs><md-tab label="{{label}}"></md-tab></md-tabs>';
        var tabs = setup(template);
        var ctrl = tabs.controller('mdTabs');

        // Flush the tabs controller timeout for initialization.
        $timeout.flush();

        // After the first timeout the mutation observer should have been fired once, because
        // the initialization of the dummy tabs, already causes some mutations.
        // Use setTimeout to add our expectations to the end of the call stack, after the
        // MutationObservers have already fired
        setTimeout(function() {
          // Setup spies
          spyOn(ctrl, 'updatePagination');
          spyOn(ctrl, 'updateInkBarStyles');

          // Update the label to trigger a new update of the pagination and InkBar styles.
          $rootScope.$apply('label = "Another Label"');

          // Use setTimeout to add our expectations to the end of the call stack, after the
          // MutationObservers have already fired
          setTimeout(function() {
            expect(ctrl.updatePagination).toHaveBeenCalledTimes(1);
            expect(ctrl.updateInkBarStyles).toHaveBeenCalledTimes(1);

            done();
          });
        });
      })
    });

    it('updates pagination and ink styles when content label changes', function(done) {
      inject(function($rootScope, $timeout) {
        // Setup our initial label
        $rootScope.$apply('label = "Default Label"');

        // Init our variables
        var template = '' +
          '<md-tabs>' +
            '<md-tab>' +
              '<md-tab-label>{{ label }}</md-tab-label>' +
            '</md-tab>' +
          '</md-tabs>';

        var tabs = setup(template);
        var ctrl = tabs.controller('mdTabs');

        // Flush the tabs controller timeout for initialization.
        $timeout.flush();

        // After the first timeout the mutation observer should have been fired once, because
        // the initialization of the dummy tabs, already causes some mutations.
        // Use setTimeout to add our expectations to the end of the call stack, after the
        // MutationObservers have already fired
        setTimeout(function() {
          // Setup spies
          spyOn(ctrl, 'updatePagination');
          spyOn(ctrl, 'updateInkBarStyles');

          // Update the label to trigger a new update of the pagination and InkBar styles.
          $rootScope.$apply('label = "New Label"');

          // Use setTimeout to add our expectations to the end of the call stack, after the
          // MutationObservers have already fired
          setTimeout(function() {
            expect(ctrl.updatePagination).toHaveBeenCalledTimes(1);
            expect(ctrl.updateInkBarStyles).toHaveBeenCalledTimes(1);

            done();
          });
        });
      })
    });

    it('updates pagination and ink styles when HTML labels change', function(done) {
      inject(function($rootScope) {
        // Setup our initial label
        $rootScope.$apply('label = "Some Label"');

        // Init our variables
        var template = '<md-tabs><md-tab><md-tab-label>{{label}}</md-tab-label></md-tab></md-tabs>';
        var tabs = setup(template);
        var ctrl = tabs.controller('mdTabs');

        // Setup spies
        spyOn(ctrl, 'updatePagination');
        spyOn(ctrl, 'updateInkBarStyles');

        // Change the label
        $rootScope.$apply('label="Another Label"');

        // Use window.setTimeout to add our expectations to the end of the call stack, after the
        // MutationObservers have already fired
        window.setTimeout(function() {
          // Fire expectations
          expect(ctrl.updatePagination.calls.count()).toBe(1);
          expect(ctrl.updateInkBarStyles.calls.count()).toBe(1);

          done();
        });
      });
    });
  });

  describe('aria', function () {
    var $timeout;

    beforeEach(inject(function(_$timeout_) {
      $timeout = _$timeout_;
    }));

    it('should link tab content to tabItem with auto-generated ids', function () {
      var tabs       = setup('<md-tabs>' +
                             '<md-tab label="label!">content!</md-tab>' +
                             '</md-tabs>');
      var tabItem    = tabs.find('md-tab-item');
      var tabContent = angular.element(tabs[ 0 ].querySelector('md-tab-content'));

      $timeout.flush();

      expect(tabs.find('md-pagination-wrapper').attr('role')).toBe('tablist');

      expect(tabItem.attr('id')).toBeTruthy();
      expect(tabItem.attr('aria-controls')).toBe(tabContent.attr('id'));

      expect(tabContent.attr('id')).toBeTruthy();
      expect(tabContent.attr('role')).toBe('tabpanel');
      expect(tabContent.attr('aria-labelledby')).toBe(tabItem.attr('id'));

      //Unique ids check
      expect(tabContent.attr('id')).not.toEqual(tabItem.attr('id'));
    });

    it('should not assign role to dummy tabs', function () {
      var tabs       = setup('<md-tabs>' +
                             '<md-tab label="label!">content!</md-tab>' +
                             '</md-tabs>');
      var tabItem    = tabs.find('md-dummy-tab');

      expect(tabItem.attr('role')).toBeFalsy();
    });

    it('should assign role to visible tabs', function () {
      var tabs       = setup('<md-tabs>' +
                             '<md-tab label="label!">content!</md-tab>' +
                             '</md-tabs>');
      var tabItem    = tabs.find('md-tab-item');

      expect(tabItem.attr('role')).toBe('tab');
    });

    it('should not set `aria-controls` if the tab does not have content', function () {
      var tabs = setup(
        '<md-tabs>' +
          '<md-tab label="label!"></md-tab>' +
        '</md-tabs>'
      );

      $timeout.flush();

      expect(tabs.find('md-dummy-tab').attr('aria-controls')).toBeFalsy();
    });
  });

  describe('<md-tab>', function () {
    it('should use its contents as the label if there is no label attribute or label/body tags', function () {
      var tab = setup('<md-tab>test</md-tab>');
      expect(tab[ 0 ].tagName).toBe('MD-TAB');
      expect(tab.find('md-tab-label').length).toBe(1);
      expect(tab.find('md-tab-label').text()).toBe('test');
      expect(tab.find('md-tab-body').length).toBe(0);
    });
    it('should use its contents as the body if there is a label attribute', function () {
      var tab = setup('<md-tab label="test">content</md-tab>');
      expect(tab[ 0 ].tagName).toBe('MD-TAB');
      expect(tab.find('md-tab-label').length).toBe(1);
      expect(tab.find('md-tab-body').length).toBe(1);
      expect(tab.find('md-tab-label').html()).toBe('test');
      expect(tab.find('md-tab-body').html()).toBe('content');
    });
    it('should convert a label attribute to a label tag', function () {
      var tab = setup('<md-tab label="test"><md-tab-body>content</md-tab-body></md-tab>');
      expect(tab[ 0 ].tagName).toBe('MD-TAB');
      expect(tab.find('md-tab-label').length).toBe(1);
      expect(tab.find('md-tab-body').length).toBe(1);
      expect(tab.find('md-tab-label').html()).toBe('test');
      expect(tab.find('md-tab-body').html()).toBe('content');
    });
    it('should not insert a body if there is no content', function () {
      var tab = setup('<md-tab>' +
                      '<md-tab-label>test</md-tab-label>' +
                      '</md-tab>');
      expect(tab[ 0 ].tagName).toBe('MD-TAB');
      expect(tab.find('md-tab-label').length).toBe(1);
      expect(tab.find('md-tab-label').text()).toBe('test');
      expect(tab.find('md-tab-body').length).toBe(0);
    });
    it('should apply tab class on the associated md-tab-item', function () {
      var template = '\
        <md-tabs md-selected="selectedTab">\
          <md-tab label="a" md-tab-class="tester-class"></md-tab>\
        </md-tabs>';
      var element  = setup(template);
      var tab      = element.find('md-tab-item');

      expect(tab[ 0 ].className.indexOf('tester-class')).toBeGreaterThan(-1);
    });
  });

  describe('internal scope', function () {
    it('should have the same internal scope as external', function () {
      var template = '\
        <md-tabs md-selected="selectedTab">\
          <md-tab label="a">\
            <md-button ng-click="data = false">Set data to false</md-button>\
          </md-tab>\
        </md-tabs>\
      ';
      var element  = setup(template);
      var button   = element.find('md-button');

      expect(button[ 0 ].tagName).toBe('MD-BUTTON');

      button.triggerHandler('click');

      expect(element.scope().data).toBe(false);
    });
  });

  describe('no tab selected', function () {
    it('should allow cases where no tabs are selected', inject(function () {
      var template = '\
        <md-tabs md-selected="selectedIndex">\
          <md-tab label="a">tab content</md-tab>\
          <md-tab label="b">tab content</md-tab>\
        </md-tabs>\
      ';
      var element  = setup(template, { selectedIndex: -1 });
      var scope = element.scope();

      expect(scope.selectedIndex).toBe(-1);
      expect(element.find('md-tab-item').eq(0).hasClass('md-active')).toBe(false);
      expect(element.find('md-tab-item').eq(1).hasClass('md-active')).toBe(false);
      expect(element.find('md-tabs-content-wrapper').hasClass('ng-hide')).toBe(true);

      element.find('md-tab-item').eq(0).triggerHandler('click');

      expect(element.find('md-tab-item').eq(0).hasClass('md-active')).toBe(true);
      expect(element.find('md-tab-item').eq(1).hasClass('md-active')).toBe(false);
      expect(scope.selectedIndex).toBe(0);

      element.find('md-tab-item').eq(1).triggerHandler('click');

      expect(element.find('md-tab-item').eq(0).hasClass('md-active')).toBe(false);
      expect(element.find('md-tab-item').eq(1).hasClass('md-active')).toBe(true);
      expect(scope.selectedIndex).toBe(1);

      scope.$apply('selectedIndex = -1');

      expect(scope.selectedIndex).toBe(-1);
      expect(element.find('md-tab-item').eq(0).hasClass('md-active')).toBe(false);
      expect(element.find('md-tab-item').eq(1).hasClass('md-active')).toBe(false);
      expect(element.find('md-tabs-content-wrapper').hasClass('ng-hide')).toBe(true);
    }));
  });

  describe('nested tabs', function () {
    it('should properly nest tabs', inject(function () {
      var template = '' +
          '<md-tabs>' +
          ' <md-tab label="one">' +
          '   <md-tabs>' +
          '     <md-tab><md-tab-label>a</md-tab-label></md-tab>' +
          '     <md-tab><md-tab-label>b</md-tab-label></md-tab>' +
          '     <md-tab><md-tab-label>c</md-tab-label></md-tab>' +
          '   </md-tabs>' +
          ' </md-tab>' +
          ' <md-tab label="two">two</md-tab>' +
          '</md-tabs>';
      var element = setup(template);
      // first item should be 'one'
      expect(element.find('md-tab-item').eq(0).text()).toBe('one');
      // first item in nested tabs should be 'a'
      expect(element.find('md-tabs').find('md-tab-item').eq(0).text()).toBe('a');
    }));
  });

  describe('no element content', function() {
    it('should not add the `md-no-tab-content` class if the element has content', function() {
      var tabs = setup(
        '<md-tabs>' +
           '<md-tab label="label!">content!</md-tab>' +
        '</md-tabs>'
      );

      expect(tabs).not.toHaveClass('md-no-tab-content');
    });

    it('should add the `md-no-tab-content` class if the element does not have content', function() {
      var tabs = setup(
        '<md-tabs>' +
           '<md-tab label="label!"></md-tab>' +
        '</md-tabs>'
      );

      expect(tabs).toHaveClass('md-no-tab-content');
    });

    it('should trim before determining whether the element has content', function() {
      var tabs = setup(
        '<md-tabs>' +
           '<md-tab label="label!">\n\n\n</md-tab>' +
        '</md-tabs>'
      );

      expect(tabs).toHaveClass('md-no-tab-content');
    });
  });
});
