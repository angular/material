describe('$mdBottomSheet service', function() {
  beforeEach(module('material.components.bottomSheet', 'ngAnimateMock'));

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

      $rootElement.triggerHandler({type: 'keyup',
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

      $rootElement.triggerHandler({ type: 'keyup', keyCode: $mdConstant.KEY_CODE.ESCAPE });

      expect(parent.find('md-bottom-sheet').length).toBe(1);
    }));
  });
});
