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
  });

  describe('lifecycle', function() {

    it('should hide current toast when showing new one', inject(function($rootElement) {
      setup({
        template: '<md-toast class="one">'
      });
      expect($rootElement.find('md-toast.one').length).toBe(1);
      expect($rootElement.find('md-toast.two').length).toBe(0);
      expect($rootElement.find('md-toast.three').length).toBe(0);

      setup({
        template: '<md-toast class="two">'
      });
      expect($rootElement.find('md-toast.one').length).toBe(0);
      expect($rootElement.find('md-toast.two').length).toBe(1);
      expect($rootElement.find('md-toast.three').length).toBe(0);

      setup({
        template: '<md-toast class="three">'
      });
      expect($rootElement.find('md-toast.one').length).toBe(0);
      expect($rootElement.find('md-toast.two').length).toBe(0);
      expect($rootElement.find('md-toast.three').length).toBe(1);
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
