describe('$mdSideSheet service', function() {
  beforeEach(module('material.components.sideSheet'));

  describe('#build()', function() {
    it('should escapeToClose == true', inject(function($mdSideSheet, $rootScope, $rootElement, $timeout, $animate, $mdConstant) {
      var parent = angular.element('<div>');
      $mdSideSheet.show({
        template: '<md-side-sheet>',
        parent: parent,
        escapeToClose: true
      });
      $rootScope.$apply();

      $animate.triggerCallbacks();

      expect(parent.find('md-side-sheet').length).toBe(1);

      $rootElement.triggerHandler({type: 'keyup',
        keyCode: $mdConstant.KEY_CODE.ESCAPE
      });

      $timeout.flush();
      expect(parent.find('md-side-sheet').length).toBe(0);
    }));

    it('should escapeToClose == false', inject(function($mdSideSheet, $rootScope, $rootElement, $timeout, $animate, $mdConstant) {
      var parent = angular.element('<div>');
      $mdSideSheet.show({
        template: '<md-side-sheet>',
        parent: parent,
        escapeToClose: false
      });
      $rootScope.$apply();

      $animate.triggerCallbacks();

      expect(parent.find('md-side-sheet').length).toBe(1);

      $rootElement.triggerHandler({ type: 'keyup', keyCode: $mdConstant.KEY_CODE.ESCAPE });

      expect(parent.find('md-side-sheet').length).toBe(1);
    }));
  });
});
