describe('mdNavBar', function() {
  var el, $compile, $scope, $timeout, ctrl, tabContainer, $material, $mdConstant;

  /** @ngInject */
  var injectLocals = function(
      _$compile_, $rootScope, _$timeout_, _$material_, _$mdConstant_) {
    $compile = _$compile_;
    $scope = $rootScope.$new();
    $timeout = _$timeout_;
    $material = _$material_;
    $mdConstant = _$mdConstant_;
  };

  beforeEach(function() {
    module('material.components.navBar', 'ngAnimateMock');

    inject(injectLocals);
  });

  afterEach(function() {
    el && el.remove();
  });

  function create(template) {
    el = $compile(template)($scope);
    angular.element(document.body).append(el);
    $scope.$apply();
    ctrl = el.controller('mdNavBar');
    tabContainer = angular.element(el[0].querySelector('._md-nav-bar-list'));
    $timeout.flush();
    $material.flushOutstandingAnimations();
  }

  function createTabs() {
    create(
        '<md-nav-bar md-selected-nav-item="selectedTabRoute" ' +
        '            md-no-ink-bar="noInkBar" ' +
        '            nav-bar-aria-label="{{ariaLabel}}">' +
        '  <md-nav-item md-nav-href="#1" name="tab1">' +
        '    tab1' +
        '  </md-nav-item>' +
        '  <md-nav-item md-nav-href="#2" name="tab2">' +
        '    tab2' +
        '  </md-nav-item>' +
        '  <md-nav-item md-nav-href="#3" name="tab3" aria-label="foo">' +
        '    tab3' +
        '  </md-nav-item>' +
        '</md-nav-bar>');
  }

  describe('tabs', function() {
    it('shows current tab as selected', function() {
      $scope.selectedTabRoute = 'tab1';
      createTabs();

      var tab1 = getTab('tab1');

      expect(tab1).toHaveClass('md-active');
      expect(tab1).toHaveClass('md-primary');
    });

    it('shows non-selected tabs as unselected', function() {
      $scope.selectedTabRoute = 'tab1';
      createTabs();

      expect(getTab('tab2')).toHaveClass('md-unselected');
      expect(getTab('tab3')).toHaveClass('md-unselected');
    });

    it('changes current tab when selectedTabRoute changes', function() {
      $scope.selectedTabRoute = 'tab1';
      createTabs();

      updateSelectedTabRoute('tab2');

      expect(getTab('tab2')).toHaveClass('md-active');
      expect(getTab('tab2')).toHaveClass('md-primary');
      expect(getTab('tab1')).not.toHaveClass('md-active');
      expect(getTab('tab1')).not.toHaveClass('md-primary');
    });

    it('does not select tabs when selectedTabRoute is empty', function() {
      $scope.selectedTabRoute = 'tab1';
      createTabs();

      updateSelectedTabRoute('');

      expect(getTab('tab3')).not.toHaveClass('md-active');
      expect(getTab('tab3')).not.toHaveClass('md-primary');
      expect(getTab('tab2')).not.toHaveClass('md-active');
      expect(getTab('tab2')).not.toHaveClass('md-primary');
      expect(getTab('tab1')).not.toHaveClass('md-active');
      expect(getTab('tab1')).not.toHaveClass('md-primary');

      expect(getInkbarEl().style.display).toBe('none');

      updateSelectedTabRoute('tab1');

      expect(getTab('tab3')).not.toHaveClass('md-active');
      expect(getTab('tab3')).not.toHaveClass('md-primary');
      expect(getTab('tab2')).not.toHaveClass('md-active');
      expect(getTab('tab2')).not.toHaveClass('md-primary');
      expect(getTab('tab1')).toHaveClass('md-active');
      expect(getTab('tab1')).toHaveClass('md-primary');

      expect(getInkbarEl().style.display).toBe('');

    });

    it('requires navigation attribute to be present', function() {
      expect(function() {
        create('<md-nav-item name="fooo">footab</md-nav-item>');
      }).toThrow();
    });

    it('does not allow multiple navigation attributes', function() {
      expect(function() {
        create(
            '<md-nav-item md-nav-href="a" md-nav-sref="b" name="fooo">' +
            'footab</md-nav-item>');
      }).toThrow();
    });

    it('allows empty navigation attribute', function() {
      // be permissive; this helps with test writing
      expect(function() {
        create(
          '<md-nav-bar>' +
            '<md-nav-item md-nav-href="" name="fooo">' + 'footab</md-nav-item>' +
          '<md-nav-bar>');
      }).not.toThrow();
    });

    it('uses nav item text for name if no name supplied', function() {
      create(
        '<md-nav-bar md-selected-nav-item="selectedTabRoute" nav-bar-aria-label="{{ariaLabel}}">' +
        '  <md-nav-item md-nav-href="#1">' +
        '    footab ' +
        '  </md-nav-item>' +
        '  <md-nav-item md-nav-href="#2" name="tab2">' +
        '    tab2' +
        '  </md-nav-item>' +
        '  <md-nav-item md-nav-href="#3" name="tab3">' +
        '    tab3' +
        '  </md-nav-item>' +
        '</md-nav-bar>');

      expect(getTab('footab').length).toBe(1);
    });

    it('updates md-selected-nav-item on tab change', function() {
      $scope.selectedTabRoute = 'tab1';
      createTabs();

      var tab2Ctrl = getTabCtrl('tab2');
      tab2Ctrl.getButtonEl().click();
      $scope.$apply();

      expect($scope.selectedTabRoute).toBe('tab2');
    });

    it('adds ui-sref-opts attribute to nav item when sref-opts attribute is ' +
        'defined', function() {
          create(
            '<md-nav-bar md-selected-nav-item="selected" nav-bar-aria-label="nav">' +
              '<md-nav-item md-nav-sref="page1">' +
                'tab1' +
              '</md-nav-item>' +
              '<md-nav-item md-nav-sref="page2" sref-opts="{reload:true,notify:true}">' +
                'tab2' +
              '</md-nav-item>' +
            '</md-nav-bar>'
          );

          expect(getTab('tab2').attr('ui-sref-opts'))
              .toBe('{"reload":true,"notify":true}');
        });

    it('does not update tabs if tab controller is undefined', function() {
      $scope.selectedTabRoute = 'tab1';

      spyOn(Object.getPrototypeOf(ctrl), '_updateInkBarStyles');
      spyOn(Object.getPrototypeOf(ctrl), '_getTabs').and.returnValue(null);
      createTabs();

      expect(ctrl._updateInkBarStyles)
        .not.toHaveBeenCalled();
    });
  });

  describe('inkbar', function() {
    it('moves to new tab', function() {
      $scope.selectedTabRoute = 'tab1';
      createTabs();

      // b/c there is no css in the karma test, we have to interrogate the
      //   inkbar style property directly
      expect(parseInt(getInkbarEl().style.left))
          .toBeCloseTo(getTab('tab1')[0].offsetLeft, 0.1);

      updateSelectedTabRoute('tab3');

      expect(parseInt(getInkbarEl().style.left))
          .toBeCloseTo(getTab('tab3')[0].offsetLeft, 0.1);
    });

    it('should hide if md-no-ink-bar is enabled', function() {
      $scope.noInkBar = false;
      $scope.selectedTabRoute = 'tab1';

      createTabs();

      expect(getInkbarEl().offsetParent).toBeTruthy();

      $scope.$apply('noInkBar = true');
      expect(getInkbarEl().offsetParent).not.toBeTruthy();

      $scope.$apply('noInkBar = false');
      expect(getInkbarEl().offsetParent).toBeTruthy();
    });
  });

  describe('a11y', function() {
    it('sets aria-checked on the selected tab', function() {
      $scope.selectedTabRoute = 'tab1';
      createTabs();

      expect(getTab('tab1').parent().attr('aria-selected')).toBe('true');
      expect(getTab('tab2').parent().attr('aria-selected')).toBe('false');
      expect(getTab('tab3').parent().attr('aria-selected')).toBe('false');

      updateSelectedTabRoute('tab3');

      expect(getTab('tab1').parent().attr('aria-selected')).toBe('false');
      expect(getTab('tab2').parent().attr('aria-selected')).toBe('false');
      expect(getTab('tab3').parent().attr('aria-selected')).toBe('true');
    });

    it('sets aria-label on the listbox', function() {
      var label = 'top level navigation for my site';
      $scope.ariaLabel = label;
      $scope.selectedTabRoute = 'tab1';
      createTabs();

      expect(tabContainer[0].getAttribute('aria-label')).toBe(label);
    });

    it('sets focus on the selected tab when the navbar receives focus',
       function() {
         $scope.selectedTabRoute = 'tab2';
         createTabs();

         expect(getTab('tab2')).not.toHaveClass('md-focused');
         ctrl.onFocus();
         $scope.$apply();

         expect(getTab('tab2')).toHaveClass('md-focused');
         expect(document.activeElement).toBe(getTab('tab2')[0]);
       });

    it('removes tab focus when the tab blurs', function() {
      $scope.selectedTabRoute = 'tab2';
      createTabs();

      tabContainer.triggerHandler('focus');
      expect(getTab('tab2')).toHaveClass('md-focused');

      getTab('tab2').triggerHandler('blur');
      expect(getTab('tab2')).not.toHaveClass('md-focused');
    });

    it('up/left moves focus back', function() {
      $scope.selectedTabRoute = 'tab3';
      createTabs();

      tabContainer.triggerHandler('focus');
      tabContainer.triggerHandler({
        type: 'keydown',
        keyCode: $mdConstant.KEY_CODE.UP_ARROW,
      });
      tabContainer.triggerHandler({
        type: 'keydown',
        keyCode: $mdConstant.KEY_CODE.LEFT_ARROW,
      });
      $scope.$apply();

      expect(getTab('tab1')).toHaveClass('md-focused');
      expect(document.activeElement).toBe(getTab('tab1')[0]);
      expect(getTab('tab2')).not.toHaveClass('md-focused');
      expect(getTab('tab3')).not.toHaveClass('md-focused');
    });

    it('down/right moves focus forward', function() {
      $scope.selectedTabRoute = 'tab1';
      createTabs();

      tabContainer.triggerHandler('focus');
      tabContainer.triggerHandler({
        type: 'keydown',
        keyCode: $mdConstant.KEY_CODE.DOWN_ARROW,
      });
      tabContainer.triggerHandler({
        type: 'keydown',
        keyCode: $mdConstant.KEY_CODE.RIGHT_ARROW,
      });
      $scope.$apply();

      expect(getTab('tab1')).not.toHaveClass('md-focused');
      expect(getTab('tab2')).not.toHaveClass('md-focused');
      expect(getTab('tab3')).toHaveClass('md-focused');
      expect(document.activeElement).toBe(getTab('tab3')[0]);
    });

    it('enter selects a tab', function() {
      $scope.selectedTabRoute = 'tab2';
      createTabs();
      var tab2Ctrl = getTabCtrl('tab2');
      spyOn(tab2Ctrl.getButtonEl(), 'click');

      tabContainer.triggerHandler('focus');
      tabContainer.triggerHandler({
        type: 'keydown',
        keyCode: $mdConstant.KEY_CODE.ENTER,
      });

      $scope.$apply();
      $timeout.flush();

      expect(tab2Ctrl.getButtonEl().click).toHaveBeenCalled();
    });

    it('automatically adds label to nav items', function() {
      createTabs();
      expect(getTab('tab1').parent().attr('aria-label')).toBe('tab1');
      expect(getTab('tab2').parent().attr('aria-label')).toBe('tab2');
    });

    it('does not change aria-label on nav items', function() {
      createTabs();
      expect(getTab('tab3').parent().attr('aria-label')).toBe('foo');
    });
  });

  function getTab(tabName) {
    return angular.element(getTabCtrl(tabName).getButtonEl());
  }

  function getTabCtrl(tabName) {
    return ctrl._getTabByName(tabName);
  }

  function getInkbarEl() {
    return el.find('md-nav-ink-bar')[0];
  }

  function updateSelectedTabRoute(newRoute) {
    $scope.selectedTabRoute = newRoute;
    $scope.$apply();
    $timeout.flush();
  }
});
