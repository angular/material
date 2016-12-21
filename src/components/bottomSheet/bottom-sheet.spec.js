describe('$mdBottomSheet service', function () {
  beforeEach(module('material.components.bottomSheet'));

  describe('#build()', function () {
    it('should have `._md` class indicator',
      inject(function ($mdBottomSheet, $rootElement, $material) {
        var parent = angular.element('<div>');
        $mdBottomSheet.show({
          template: '<md-bottom-sheet>',
          parent: parent
        });
        $material.flushOutstandingAnimations();

        var sheet = parent.find('md-bottom-sheet');
        expect(sheet.hasClass('_md')).toBe(true);
    }));

    it('should close when `clickOutsideToClose == true`',
      inject(function ($mdBottomSheet, $rootElement, $material) {
        var parent = angular.element('<div>');
        $mdBottomSheet.show({
          template: '<md-bottom-sheet>',
          parent: parent,
          clickOutsideToClose: true
        });

        $material.flushOutstandingAnimations();

        expect(parent.find('md-bottom-sheet').length).toBe(1);

        var backdrop = parent.find('md-backdrop');

        backdrop.triggerHandler({
          type: 'click',
          target: backdrop[0]
        });

        $material.flushInterimElement();
        expect(parent.find('md-bottom-sheet').length).toBe(0);
      }));

    it('should not close when `clickOutsideToClose == false`',
      inject(function ($mdBottomSheet, $rootElement, $material) {
        var parent = angular.element('<div>');
        $mdBottomSheet.show({
          template: '<md-bottom-sheet>',
          parent: parent,
          clickOutsideToClose: false
        });

        $material.flushOutstandingAnimations();

        expect(parent.find('md-bottom-sheet').length).toBe(1);

        var backdrop = parent.find('md-backdrop');

        backdrop.triggerHandler({
          type: 'click',
          target: backdrop[0]
        });

        $material.flushInterimElement();
        expect(parent.find('md-bottom-sheet').length).toBe(1);
      }));

    it('should warn if the template contains a `ng-cloak`', inject(function($mdBottomSheet, $material, $log) {
      var parent = angular.element('<div>');

      // Enable spy on $log.warn
      spyOn($log, 'warn');

      $mdBottomSheet.show({
        template: '<md-bottom-sheet ng-cloak>',
        parent: parent,
        clickOutsideToClose: false
      });

      $material.flushOutstandingAnimations();

      expect(parent.find('md-bottom-sheet').length).toBe(1);

      expect($log.warn).toHaveBeenCalled();
    }));

    it('should not append any backdrop when `disableBackdrop === true`',
      inject(function($mdBottomSheet, $rootElement, $material) {
        var parent = angular.element('<div>');
        $mdBottomSheet.show({
          template: '<md-bottom-sheet>',
          parent: parent,
          disableBackdrop: true
        });

        $material.flushOutstandingAnimations();

        expect(parent.find('md-bottom-sheet').length).toBe(1);

        var backdrop = parent.find('md-backdrop');
        expect(backdrop.length).toBe(0);
      }));

    it('should append a backdrop by default to the bottomsheet',
      inject(function($mdBottomSheet, $rootElement, $material) {
        var parent = angular.element('<div>');
        $mdBottomSheet.show({
          template: '<md-bottom-sheet>',
          parent: parent
        });

        $material.flushOutstandingAnimations();

        expect(parent.find('md-bottom-sheet').length).toBe(1);

        var backdrop = parent.find('md-backdrop');
        expect(backdrop.length).toBe(1);
      }));

    it('should close when `escapeToClose == true`',
      inject(function ($mdBottomSheet, $rootElement, $material, $mdConstant) {
        var parent = angular.element('<div>');
        $mdBottomSheet.show({
          template: '<md-bottom-sheet>',
          parent: parent,
          escapeToClose: true
        });

        $material.flushOutstandingAnimations();

        expect(parent.find('md-bottom-sheet').length).toBe(1);

        $rootElement.triggerHandler({
          type: 'keyup',
          keyCode: $mdConstant.KEY_CODE.ESCAPE
        });

        $material.flushInterimElement();
        expect(parent.find('md-bottom-sheet').length).toBe(0);
      }));

    it('should not close when `escapeToClose == false`',
      inject(function ($mdBottomSheet, $rootScope, $rootElement, $timeout, $animate, $mdConstant) {
        var parent = angular.element('<div>');
        $mdBottomSheet.show({
          template: '<md-bottom-sheet>',
          parent: parent,
          escapeToClose: false
        });
        $rootScope.$apply();

        expect(parent.find('md-bottom-sheet').length).toBe(1);

        $rootElement.triggerHandler({type: 'keyup', keyCode: $mdConstant.KEY_CODE.ESCAPE});

        expect(parent.find('md-bottom-sheet').length).toBe(1);
      }));

    it('should close when navigation fires `scope.$destroy()`',
      inject(function ($mdBottomSheet, $rootScope, $rootElement, $timeout, $material) {
        var parent = angular.element('<div>');
        $mdBottomSheet.show({
          template: '<md-bottom-sheet>',
          parent: parent,
          escapeToClose: false
        });

        $rootScope.$apply();
        $material.flushOutstandingAnimations();

        expect(parent.find('md-bottom-sheet').length).toBe(1);

        $rootScope.$destroy();
        $material.flushInterimElement();
        expect(parent.find('md-bottom-sheet').length).toBe(0);
      }));

    it('should focus child with md-autofocus',
      inject(function ($rootScope, $animate, $document, $mdBottomSheet) {
        jasmine.mockElementFocus(this);
        var parent = angular.element('<div>');
        var markup = '' +
          '<md-bottom-sheet>' +
          '  <md-input-container><label>Label</label>' +
          '    <input type="text" md-autofocus>' +
          '  </md-input-container>' +
          '  <md-input-container><label>Label</label>' +
          '    <input type="text" md-autofocus>' +
          '  </md-input-container>' +
          '<md-bottom-sheet>';

        $mdBottomSheet.show({
          template: '<md-bottom-sheet>',
          parent: parent,
          escapeToClose: false
        });
        $rootScope.$apply();

        var sheet = parent.find('md-bottom-sheet');
        expect(sheet.length).toBe(1);
        var focusEl = sheet.find('input');

        // Focus should be on the last md-autofocus element
        expect($document.activeElement).toBe(focusEl[1]);
      }));

    // This test is mainly for touch devices as the -webkit-overflow-scrolling causes z-index issues
    // if the scroll mask is appended to the body element
    it('appends the scroll mask to the same parent',
      inject(function ($mdBottomSheet, $rootScope) {
        var parent = angular.element('<div>');

        $mdBottomSheet.show({
          template: '<md-bottom-sheet>',
          parent: parent
        });

        $rootScope.$apply();

        var scrollMask = parent[0].querySelector('.md-scroll-mask');

        expect(scrollMask).not.toBeNull();
      }));
  });
});
