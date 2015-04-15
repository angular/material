describe('<md-tabs>', function() {

  beforeEach(module('material.components.tabs'));
  beforeEach(function() {
    TestUtil.mockElementFocus(this);

    jasmine.addMatchers({
      toBeActiveTab: function() {
        return {
          compare: function(actual, expected) {
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

            var results = { pass : fails.length === 0 };
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

  function setup(template) {
    var el; 
    inject(function($compile, $rootScope) {
      el = $compile(template)($rootScope.$new());
      $rootScope.$apply();
    });
    return el;
  }

  function triggerKeydown(el, keyCode) {
    return el.triggerHandler({
      type: 'keydown',
      keyCode: keyCode,
      preventDefault: angular.noop
    });
  }

  describe('activating tabs', function() {

    it('should select first tab by default', function() {
      var tabs = setup('<md-tabs>\
            <md-tab label="a">a</md-tab>\
            <md-tab label="b">b</md-tab>\
          </md-tabs>');
      expect(tabs.find('md-tab-item').eq(0)).toBeActiveTab();
    });

    it('should select & focus tab on click', inject(function($document, $rootScope) {
      var tabs = setup('<md-tabs>' +
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

    it('should focus tab on arrow if tab is enabled', inject(function($document, $mdConstant, $timeout) {
      var tabs = setup('<md-tabs>' +
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

    it('should select tab on space or enter', inject(function($mdConstant) {
      var tabs = setup('<md-tabs>' +
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

    it('should bind to selected', function() {
      var tabs = setup('<md-tabs md-selected="current">' +
                       '<md-tab></md-tab>' +
                       '<md-tab></md-tab>' +
                       '<md-tab></md-tab>' +
                       '</md-tabs>');
      var tabItems = tabs.find('md-tab-item');
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

    it('disabling active tab', function() {
      var tabs = setup('<md-tabs>' +
                       '<md-tab ng-disabled="disabled0"></md-tab>' +
                       '<md-tab ng-disabled="disabled1"></md-tab>' +
                       '</md-tabs>');
      var tabItems = tabs.find('md-tab-item');
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

    it('swiping tabs', function() {
      var tabs = setup('<md-tabs>' + 
                       '<md-tab></md-tab>' +
                       '<md-tab></md-tab>' +
                       '</md-tabs>');
      var tabItems = tabs.find('md-tab');

      return; //-- TODO: Wire up swipe logic

      tabItems.eq(0).isolateScope().onSwipe({
        type: 'swipeleft'
      });
      expect(tabItems.eq(1)).toBeActiveTab();

      tabItems.eq(1).isolateScope().onSwipe({
        type: 'swipeleft'
      });
      expect(tabItems.eq(1)).toBeActiveTab();

      tabItems.eq(1).isolateScope().onSwipe({
        type: 'swipeleft'
      });
      expect(tabItems.eq(1)).toBeActiveTab();

      tabItems.eq(1).isolateScope().onSwipe({
        type: 'swiperight'
      });
      expect(tabItems.eq(0)).toBeActiveTab();

      tabItems.eq(0).isolateScope().onSwipe({
        type: 'swiperight'
      });
      expect(tabItems.eq(0)).toBeActiveTab();
    });

  });

  describe('tab label & content DOM', function() {

    it('should support both label types', function() {
      var tabs1 = setup('<md-tabs>' +
                       '<md-tab label="super label"></md-tab>' +
                       '</md-tabs>');
      expect(tabs1.find('md-tab-item').text()).toBe('super label');
      
      var tabs2 = setup('<md-tabs>' +
                   '<md-tab><md-tab-label><b>super</b> label</md-tab-label></md-tab>' +
                   '</md-tabs>');
      expect(tabs2.find('md-tab-item').text()).toBe('super label');

    });

    it('should support content inside with each kind of label', function() {
      var tabs1 = setup('<md-tabs>' + 
                        '<md-tab label="label that!"><b>content</b> that!</md-tab>' +
                        '</md-tabs>');
      expect(tabs1.find('md-tab-item').text()).toBe('label that!');
      expect(tabs1[0].querySelector('md-tab-content').textContent).toBe('content that!');

      var tabs2 = setup('<md-tabs>\
        <md-tab>\
          <md-tab-label>label that!</md-tab-label>\
          <md-tab-body><b>content</b> that!</md-tab-body>\
        </md-tab>\
      </md-tabs>');
      expect(tabs1.find('md-tab-item').text()).toBe('label that!');
      expect(tabs1[0].querySelector('md-tab-content').textContent)
        .toBe('content that!');
    });

  });

  describe('aria', function() {

    it('should link tab content to tabItem with auto-generated ids', function() {
      var tabs = setup('<md-tabs>' +
                       '<md-tab label="label!">content!</md-tab>' +
                       '</md-tabs>');
      var tabItem = tabs.find('md-dummy-tab');
      var tabContent = angular.element(tabs[0].querySelector('md-tab-content'));

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

});
