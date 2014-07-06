describe('$materialToast service', function() {
  beforeEach(module('material.components.toast', 'ngAnimateMock'));

  function setup(options) {
    var hideToast;
    inject(function($materialToast, $rootScope, $animate) {
      options = options || {};
      $materialToast(options).then(function(fn) {
        hideToast = fn;
      });
      $rootScope.$apply();
      $animate.triggerCallbacks();
    });
    return hideToast;
  }

  describe('options', function() {

    it('should hide after duration', inject(function($timeout, $animate) {
      var parent = angular.element('<div>');
      setup({
        duration: 1234,
        appendTo: parent
      });
      expect(parent[0].querySelector('material-toast')).toBeTruthy();
      $timeout.flush();
      expect(parent[0].querySelector('material-toast')).toBeFalsy();
    }));

    it('should have template', inject(function($timeout, $rootScope) {
      var parent = angular.element('<div>');
      setup({
        template: '{{1}}234',
        appendTo: parent
      });
      var toast = angular.element(parent[0].querySelector('material-toast'));
      expect(toast.children().text()).toBe('1234');
    }));

    it('should have templateUrl', inject(function($timeout, $rootScope, $templateCache) {
      var parent = angular.element('<div>');
      $templateCache.put('template.html', 'hello, {{1}}');
      setup({
        templateUrl: 'template.html',
        appendTo: parent
      });
      var toast = angular.element(parent[0].querySelector('material-toast'));
      expect(toast.children().text()).toBe('hello, 1');
    }));
  });

  describe('lifecycle', function() {

    it('should hide current toast when showing new one', function() {
      var parent = angular.element('<div>');
      setup({
        appendTo: parent,
        position: 'one'
      });
      expect(parent[0].querySelector('material-toast.one')).toBeTruthy();
      expect(parent[0].querySelector('material-toast.two')).toBeFalsy();
      expect(parent[0].querySelector('material-toast.three')).toBeFalsy();

      setup({
        appendTo: parent,
        position: 'two'
      });
      expect(parent[0].querySelector('material-toast.one')).toBeFalsy();
      expect(parent[0].querySelector('material-toast.two')).toBeTruthy();
      expect(parent[0].querySelector('material-toast.three')).toBeFalsy();

      setup({
        appendTo: parent,
        position: 'three'
      });
      expect(parent[0].querySelector('material-toast.one')).toBeFalsy();
      expect(parent[0].querySelector('material-toast.two')).toBeFalsy();
      expect(parent[0].querySelector('material-toast.three')).toBeTruthy();
    });
  });
});
