describe('$mdBottomSheet service', function() {
  beforeEach(module('material.components.bottomSheet'));

  describe('#build()', function() {
    it('should escapeToClose == true', inject(function($mdBottomSheet, $rootScope, $rootElement, $timeout, $animate, $mdConstant) {
      var parent = angular.element('<div>');
      $mdBottomSheet.show({
        template: '<md-bottom-sheet>',
        parent: parent,
        escapeToClose: true
      });
      $rootScope.$apply();

      $animate.triggerCallbacks();

      expect(parent.find('md-bottom-sheet').length).toBe(1);

      $rootElement.triggerHandler({
        type: 'keyup',
        keyCode: $mdConstant.KEY_CODE.ESCAPE
      });

      $timeout.flush();
      expect(parent.find('md-bottom-sheet').length).toBe(0);
    }));

    it('should escapeToClose == false', inject(function($mdBottomSheet, $rootScope, $rootElement, $timeout, $animate, $mdConstant) {
      var parent = angular.element('<div>');
      $mdBottomSheet.show({
        template: '<md-bottom-sheet>',
        parent: parent,
        escapeToClose: false
      });
      $rootScope.$apply();

      $animate.triggerCallbacks();

      expect(parent.find('md-bottom-sheet').length).toBe(1);

      $rootElement.triggerHandler({type: 'keyup', keyCode: $mdConstant.KEY_CODE.ESCAPE});

      expect(parent.find('md-bottom-sheet').length).toBe(1);
    }));

    it('should focus child with md-autofocus', inject(function($rootScope, $animate, $document, $mdBottomSheet) {
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
      $animate.triggerCallbacks();

      var sheet = parent.find('md-bottom-sheet');
      expect(sheet.length).toBe(1);
      var focusEl = sheet.find('input');

      // Focus should be on the last md-autofocus element
      expect($document.activeElement).toBe(focusEl[1]);
    }));
  });
});
