describe('<md-tabs>', function() {

  beforeEach(module('material.components.tabs'));
  beforeEach(function() {
    TestUtil.mockElementFocus(this);
    this.addMatchers({
      toBeActiveTab: function(checkFocus) {
        var fails = [];
        var actual = this.actual;
        this.message = function() {
          return 'Expected ' + angular.mock.dump(actual) + (this.isNot ? ' not ' : ' ') + 
            'to be the active tab. Failures: ' + fails.join(', ');
        };

        if (!actual.hasClass('active')) {
          fails.push('does not have active class');
        }
        if (actual.attr('aria-selected') != 'true') {
          fails.push('aria-selected is not true');
        } 
        if (actual.attr('tabindex') != '0') {
          fails.push('tabindex is not 0');
        }
        return fails.length === 0;
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
      keyCode: keyCode
    });
  }

  describe('activating tabs', function() {

    it('should select first tab by default', function() {
      var tabs = setup('<md-tabs>' +
            '<md-tab></md-tab>' +
            '<md-tab></md-tab>' +
            '</md-tabs>');
      expect(tabs.find('md-tab').eq(0)).toBeActiveTab();
    });

    it('should select & focus tab on click', inject(function($document) {
      var tabs = setup('<md-tabs>' +
            '<md-tab></md-tab>' +
            '<md-tab></md-tab>' +
            '<md-tab ng-disabled="true"></md-tab>' +
            '</md-tabs>');
      var tabItems = tabs.find('md-tab');

      tabs.find('md-tab').eq(1).triggerHandler('click');
      expect(tabItems.eq(1)).toBeActiveTab();
      expect($document.activeElement).toBe(tabItems[1]);
      
      tabs.find('md-tab').eq(0).triggerHandler('click');
      expect(tabItems.eq(0)).toBeActiveTab();
      expect($document.activeElement).toBe(tabItems[0]);
    }));

    it('should focus tab on arrow if tab is enabled', inject(function($document, $mdConstant, $timeout) {
      var tabs = setup('<md-tabs>' +
                       '<md-tab></md-tab>' +
                       '<md-tab ng-disabled="true"></md-tab>' +
                       '<md-tab></md-tab>' +
                       '</md-tabs>');
      var tabItems = tabs.find('md-tab');
      expect(tabItems.eq(0)).toBeActiveTab();

      // Boundary case, do nothing
      triggerKeydown(tabItems.eq(0), $mdConstant.KEY_CODE.LEFT_ARROW);
      expect(tabItems.eq(0)).toBeActiveTab();

      // Tab 0 should still be active, but tab 2 focused (skip tab 1 it's disabled)
      triggerKeydown(tabItems.eq(0), $mdConstant.KEY_CODE.RIGHT_ARROW);
      expect(tabItems.eq(0)).toBeActiveTab();
      $timeout.flush();
      expect($document.activeElement).toBe(tabItems[2]);

      // Boundary case, do nothing
      triggerKeydown(tabItems.eq(0), $mdConstant.KEY_CODE.RIGHT_ARROW);
      expect(tabItems.eq(0)).toBeActiveTab();
      $timeout.flush();
      expect($document.activeElement).toBe(tabItems[2]);

      // Skip tab 1 again, it's disabled
      triggerKeydown(tabItems.eq(2), $mdConstant.KEY_CODE.LEFT_ARROW);
      expect(tabItems.eq(0)).toBeActiveTab();
      $timeout.flush();
      expect($document.activeElement).toBe(tabItems[0]);

    }));

    it('should select tab on space or enter', inject(function($mdConstant) {
      var tabs = setup('<md-tabs>' +
                       '<md-tab></md-tab>' +
                       '<md-tab></md-tab>' +
                       '</md-tabs>');
      var tabItems = tabs.find('md-tab');

      triggerKeydown(tabItems.eq(1), $mdConstant.KEY_CODE.ENTER);
      expect(tabItems.eq(1)).toBeActiveTab();

      triggerKeydown(tabItems.eq(0), $mdConstant.KEY_CODE.SPACE);
      expect(tabItems.eq(0)).toBeActiveTab();
    }));

    it('the active tab\'s content should always be connected', inject(function($timeout) {
      var tabs = setup('<md-tabs>' +
                       '<md-tab label="label1!">content1!</md-tab>' +
                       '<md-tab label="label2!">content2!</md-tab>' +
                       '</md-tabs>');
      var tabItems = tabs.find('md-tab');
      var contents = angular.element(tabs[0].querySelectorAll('.md-tab-content'));

      $timeout.flush();
      expect(contents.eq(0).scope().$$disconnected).toBeFalsy();
      expect(contents.eq(1).scope().$$disconnected).toBeTruthy();

      tabItems.eq(1).triggerHandler('click');
      expect(contents.eq(0).scope().$$disconnected).toBeTruthy();
      expect(contents.eq(1).scope().$$disconnected).toBeFalsy();
    }));

    it('should bind to selected', function() {
      var tabs = setup('<md-tabs md-selected="current">' +
                       '<md-tab></md-tab>' +
                       '<md-tab></md-tab>' +
                       '<md-tab></md-tab>' +
                       '</md-tabs>');
      var tabItems = tabs.find('md-tab');

      expect(tabItems.eq(0)).toBeActiveTab();
      expect(tabs.scope().current).toBe(0);

      tabs.scope().$apply('current = 1');
      expect(tabItems.eq(1)).toBeActiveTab();

      tabItems.eq(2).triggerHandler('click');
      expect(tabs.scope().current).toBe(2);
    });

    it('should use active binding', function() {
      var tabs = setup('<md-tabs>' +
                       '<md-tab md-active="active0"></md-tab>' +
                       '<md-tab md-active="active1"></md-tab>' +
                       '<md-tab md-active="active2"></md-tab>' +
                       '</md-tabs>');
      var tabItems = tabs.find('md-tab');

      tabs.scope().$apply('active2 = true');
      expect(tabItems.eq(2)).toBeActiveTab();
      tabs.scope().$apply('active1 = true');
      expect(tabItems.eq(1)).toBeActiveTab();
      tabs.scope().$apply('active1 = false');
      expect(tabItems.eq(1)).not.toBeActiveTab();
    });

    it('disabling active tab', function() {
      var tabs = setup('<md-tabs>' +
                       '<md-tab ng-disabled="disabled0"></md-tab>' +
                       '<md-tab ng-disabled="disabled1"></md-tab>' +
                       '</md-tabs>');
      var tabItems = tabs.find('md-tab');

      expect(tabItems.eq(0)).toBeActiveTab();

      tabs.scope().$apply('disabled0 = true');
      expect(tabItems.eq(1)).toBeActiveTab();
      expect(tabItems.eq(0).attr('aria-disabled')).toBe('true');
      expect(tabItems.eq(1).attr('aria-disabled')).not.toBe('true');

      tabs.scope().$apply('disabled0 = false; disabled1 = true');
      expect(tabItems.eq(0)).toBeActiveTab();
      expect(tabItems.eq(0).attr('aria-disabled')).not.toBe('true');
      expect(tabItems.eq(1).attr('aria-disabled')).toBe('true');
    });

    it('swiping tabs', function() {
      var tabs = setup('<md-tabs>' + 
                       '<md-tab></md-tab>' +
                       '<md-tab></md-tab>' +
                       '</md-tabs>');
      var tabItems = tabs.find('md-tab');

      tabItems.eq(0).triggerHandler('$md.swipeleft');
      expect(tabItems.eq(1)).toBeActiveTab();

      tabItems.eq(1).triggerHandler('$md.swipeleft');
      expect(tabItems.eq(1)).toBeActiveTab();

      tabItems.eq(1).triggerHandler('$md.swipeleft');
      expect(tabItems.eq(1)).toBeActiveTab();

      tabItems.eq(1).triggerHandler('$md.swiperight');
      expect(tabItems.eq(0)).toBeActiveTab();

      tabItems.eq(0).triggerHandler('$md.swiperight');
      expect(tabItems.eq(0)).toBeActiveTab();
    });

  });

  describe('tab label & content DOM', function() {

    it('should support all 3 label types', function() {
      var tabs1 = setup('<md-tabs>' +
                       '<md-tab label="<b>super</b> label"></md-tab>' +
                       '</md-tabs>');
      expect(tabs1.find('md-tab-label').html()).toBe('<b>super</b> label');
      
      var tabs2 = setup('<md-tabs>' +
                   '<md-tab><b>super</b> label</md-tab>' +
                   '</md-tabs>');
      expect(tabs2.find('md-tab-label').html()).toBe('<b>super</b> label');

      var tabs3 = setup('<md-tabs>' +
                   '<md-tab><md-tab-label><b>super</b> label</md-tab-label></md-tab>' +
                   '</md-tabs>');
      expect(tabs3.find('md-tab-label').html()).toBe('<b>super</b> label');
    });

    it('should support content inside with each kind of label', function() {
      var tabs1 = setup('<md-tabs>' + 
                        '<md-tab label="label that!"><b>content</b> that!</md-tab>' +
                        '</md-tabs>');
      expect(tabs1.find('md-tab-label').html()).toBe('label that!');
      expect(tabs1[0].querySelector('.md-tabs-content .md-tab-content').innerHTML)
        .toBe('<b>content</b> that!');

      var tabs2 = setup('<md-tabs>' + 
                        '<md-tab><md-tab-label>label that!</md-tab-label><b>content</b> that!</md-tab>' +
                        '</md-tabs>');
      expect(tabs1.find('md-tab-label').html()).toBe('label that!');
      expect(tabs1[0].querySelector('.md-tabs-content .md-tab-content').innerHTML)
        .toBe('<b>content</b> that!');
    });

    it('should connect content with child of the outside scope', function() {
      var tabs = setup('<md-tabs>' +
                       '<md-tab label="label!">content!</md-tab>' +
                       '</md-tabs>');
      var content = angular.element(tabs[0].querySelector('.md-tab-content'));
      expect(content.scope().$parent.$id).toBe(tabs.find('md-tab').scope().$id);
    });

  });

  describe('aria', function() {

    it('should link tab content to tabItem with auto-generated ids', function() {
      var tabs = setup('<md-tabs>' +
                       '<md-tab label="label!">content!</md-tab>' +
                       '</md-tabs>');
      var tabItem = tabs.find('md-tab');
      var tabContent = angular.element(tabs[0].querySelector('.md-tab-content'));

      expect(tabs.attr('role')).toBe('tablist');

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
