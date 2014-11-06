describe('$mdToast service', function() {
  beforeEach(module('material.components.toast', 'ngAnimateMock', function($provide) {
  }));

  function setup(options) {
    inject(function($mdToast, $rootScope, $animate) {
      options = options || {};
      $mdToast.show(options);
      $rootScope.$apply();
      $animate.triggerCallbacks();
    });
  }

  describe('options', function() {

    it('should hide after duration', inject(function($timeout, $animate, $rootElement) {
      var parent = angular.element('<div>');
      setup({
        template: '<md-toast />',
        hideTimeout: 1234
      });
      expect($rootElement.find('md-toast').length).toBe(1);
      $timeout.flush();
      expect($rootElement.find('md-toast').length).toBe(0);
    }));

    it('should have template', inject(function($timeout, $rootScope, $rootElement) {
      var parent = angular.element('<div>');
      setup({
        template: '<md-toast>{{1}}234</md-toast>',
        appendTo: parent
      });
      var toast = $rootElement.find('md-toast');
      $timeout.flush();
      expect(toast.text()).toBe('1234');
    }));

    it('should have templateUrl', inject(function($timeout, $rootScope, $templateCache, $rootElement) {
      $templateCache.put('template.html', '<md-toast>hello, {{1}}</md-toast>');
      setup({
        templateUrl: 'template.html',
      });
      var toast = $rootElement.find('md-toast');
      expect(toast.text()).toBe('hello, 1');
    }));

    it('should add position class to tast', inject(function($rootElement, $timeout) {
      setup({
        template: '<md-toast>',
        position: 'top left'
      });
      var toast = $rootElement.find('md-toast');
      $timeout.flush();
      expect(toast.hasClass('md-top')).toBe(true);
      expect(toast.hasClass('md-left')).toBe(true);
    }));
  });

  describe('lifecycle', function() {

    it('should hide current toast when showing new one', inject(function($rootElement) {
      setup({
        template: '<md-toast class="one">'
      });
      expect($rootElement[0].querySelector('md-toast.one')).toBeTruthy();
      expect($rootElement[0].querySelector('md-toast.two')).toBeFalsy();
      expect($rootElement[0].querySelector('md-toast.three')).toBeFalsy();

      setup({
        template: '<md-toast class="two">'
      });
      expect($rootElement[0].querySelector('md-toast.one')).toBeFalsy();
      expect($rootElement[0].querySelector('md-toast.two')).toBeTruthy();
      expect($rootElement[0].querySelector('md-toast.three')).toBeFalsy();

      setup({
        template: '<md-toast class="three">'
      });
      expect($rootElement[0].querySelector('md-toast.one')).toBeFalsy();
      expect($rootElement[0].querySelector('md-toast.two')).toBeFalsy();
      expect($rootElement[0].querySelector('md-toast.three')).toBeTruthy();
    }));

    it('should add class to toastParent', inject(function($rootElement) {
      setup({
        template: '<md-toast>'
      });
      expect($rootElement.hasClass('md-toast-open-bottom')).toBe(true);

      setup({
        template: '<md-toast>',
        position: 'top'
      });
      expect($rootElement.hasClass('md-toast-open-top')).toBe(true);
    }));

  });
});
