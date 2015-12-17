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
      newScope = $rootScope.$new();
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

    it('should select first tab by default', function () {
      var tabs = setup('<md-tabs>\
            <md-tab label="a">a</md-tab>\
            <md-tab label="b">b</md-tab>\
          </md-tabs>');
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
      var tabItems = tabs.find('md-tab-item');

      expect(tabItems.eq(0)).toBeActiveTab();

      // Boundary case, do nothing
      triggerKeydown(tabs.find('md-tabs-canvas').eq(0), $mdConstant.KEY_CODE.LEFT_ARROW);
      expect(tabItems.eq(0)).toBeActiveTab();

      // Tab 0 should still be active, but tab 2 focused (skip tab 1 it's disabled)
      triggerKeydown(tabs.find('md-tabs-canvas').eq(0), $mdConstant.KEY_CODE.RIGHT_ARROW);
      expect(tabItems.eq(0)).toBeActiveTab();

      triggerKeydown(tabs.find('md-tabs-canvas').eq(0), $mdConstant.KEY_CODE.ENTER);
      expect(tabItems.eq(2)).toBeActiveTab();

      // Boundary case, do nothing
      triggerKeydown(tabs.find('md-tabs-canvas').eq(0), $mdConstant.KEY_CODE.RIGHT_ARROW);
      expect(tabItems.eq(2)).toBeActiveTab();

      triggerKeydown(tabs.find('md-tabs-canvas').eq(0), $mdConstant.KEY_CODE.ENTER);
      expect(tabItems.eq(2)).toBeActiveTab();

      // Skip tab 1 again, it's disabled
      triggerKeydown(tabs.find('md-tabs-canvas').eq(0), $mdConstant.KEY_CODE.LEFT_ARROW);
      triggerKeydown(tabs.find('md-tabs-canvas').eq(0), $mdConstant.KEY_CODE.ENTER);
      expect(tabItems.eq(0)).toBeActiveTab();

    }));

    it('should select tab on space or enter', inject(function ($mdConstant) {
      var tabs     = setup('<md-tabs>' +
                           '<md-tab></md-tab>' +
                           '<md-tab></md-tab>' +
                           '</md-tabs>');
      var tabItems = tabs.find('md-tab-item');
      tabs.find('md-tab-item').eq(0).triggerHandler('click');

      triggerKeydown(tabs.find('md-tabs-canvas').eq(0), $mdConstant.KEY_CODE.RIGHT_ARROW);
      triggerKeydown(tabs.find('md-tabs-canvas').eq(0), $mdConstant.KEY_CODE.ENTER);
      expect(tabItems.eq(1)).toBeActiveTab();

      triggerKeydown(tabs.find('md-tabs-canvas').eq(0), $mdConstant.KEY_CODE.LEFT_ARROW);
      triggerKeydown(tabs.find('md-tabs-canvas').eq(0), $mdConstant.KEY_CODE.SPACE);
      expect(tabItems.eq(0)).toBeActiveTab();
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
      expect(dummyTabs.eq(0).attr('aria-selected')).toBe('true');

      tabs.scope().$apply('current = 1');
      expect(tabItems.eq(1)).toBeActiveTab();

      expect(tabItems.eq(0).attr('aria-selected')).toBe('false');
      expect(dummyTabs.eq(0).attr('aria-selected')).toBe('false');
      expect(dummyTabs.eq(1).attr('aria-selected')).toBe('true');

      tabItems.eq(2).triggerHandler('click');
      expect(tabs.scope().current).toBe(2);
    });

    it('disabling active tab', function () {
      var tabs      = setup('<md-tabs>' +
                            '<md-tab ng-disabled="disabled0"></md-tab>' +
                            '<md-tab ng-disabled="disabled1"></md-tab>' +
                            '</md-tabs>');
      var tabItems  = tabs.find('md-tab-item');
      var dummyTabs = tabs.find('md-dummy-tab');

      expect(tabItems.eq(0)).toBeActiveTab();
      expect(dummyTabs.eq(0).attr('aria-selected')).toBe('true');

      tabs.scope().$apply('disabled0 = true');
      expect(tabItems.eq(1)).toBeActiveTab();

      expect(tabItems.eq(0).attr('aria-disabled')).toBe('true');
      expect(dummyTabs.eq(0).attr('aria-disabled')).toBe('true');
      expect(tabItems.eq(1).attr('aria-disabled')).toBe('false');
      expect(dummyTabs.eq(1).attr('aria-disabled')).toBe('false');

      tabs.scope().$apply('disabled0 = false; disabled1 = true');
      expect(tabItems.eq(0)).toBeActiveTab();

      expect(tabItems.eq(0).attr('aria-disabled')).toBe('false');
      expect(dummyTabs.eq(0).attr('aria-disabled')).toBe('false');
      expect(tabItems.eq(1).attr('aria-disabled')).toBe('true');
      expect(dummyTabs.eq(1).attr('aria-disabled')).toBe('true');
    });

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

  });

  describe('aria', function () {

    it('should link tab content to tabItem with auto-generated ids', function () {
      var tabs       = setup('<md-tabs>' +
                             '<md-tab label="label!">content!</md-tab>' +
                             '</md-tabs>');
      var tabItem    = tabs.find('md-dummy-tab');
      var tabContent = angular.element(tabs[ 0 ].querySelector('md-tab-content'));

      expect(tabs.find('md-tabs-canvas').attr('role')).toBe('tablist');

      expect(tabItem.attr('id')).toBeTruthy();
      expect(tabItem.attr('role')).toBe('tab');
      expect(tabItem.attr('aria-controls')).toBe(tabContent.attr('id'));

      expect(tabContent.attr('id')).toBeTruthy();
      expect(tabContent.attr('role')).toBe('tabpanel');
      expect(tabContent.attr('aria-labelledby')).toBe(tabItem.attr('id'));

      //Unique ids check
      expect(tabContent.attr('id')).not.toEqual(tabItem.attr('id'));
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
});
