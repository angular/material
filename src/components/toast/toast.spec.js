describe('$mdToast service', function() {
  beforeEach(module('material.components.toast', 'ngAnimateMock', function($provide) {
  }));

  function setup(options) {
    inject(function($mdToast, $rootScope, $animate) {
      $animate.triggerCallbacks();
      options = options || {};
      $mdToast.show(options);
      $rootScope.$apply();
      $animate.triggerCallbacks();
    });
  }

  describe('simple()', function() {
    hasConfigMethods(['content', 'action', 'capsule', 'highlightAction', 'theme']);

    it('supports a basic toast', inject(function($mdToast, $rootScope, $timeout, $animate) {
      var rejected = false;
      var parent = angular.element('<div>');
      $mdToast.show(
        $mdToast.simple({
          parent: parent,
          content: 'Do something',
          theme: 'some-theme',
          capsule: true
        })
      ).catch(function() {
        rejected = true;
      });
      $rootScope.$digest();
      expect(parent.find('span').text()).toBe('Do something');
      expect(parent.find('md-toast')).toHaveClass('md-capsule');
      expect(parent.find('md-toast').attr('md-theme')).toBe('some-theme');
      $animate.triggerCallbacks();
      $timeout.flush();
      $animate.triggerCallbacks();
      expect(rejected).toBe(true);
    }));

    it('supports dynamicly updating the content', inject(function($mdToast, $rootScope, $rootElement) {
      var parent = angular.element('<div>');
      $mdToast.showSimple('Hello world');
      $rootScope.$digest();
      $mdToast.updateContent('Goodbye world');
      $rootScope.$digest();
      expect($rootElement.find('span').text()).toBe('Goodbye world');
    }));

    it('supports an action toast', inject(function($mdToast, $rootScope, $animate) {
      var resolved = false;
      var parent = angular.element('<div>');
      $mdToast.show(
        $mdToast.simple({
          content: 'Do something',
          parent: parent
        })
          .action('Click me')
          .highlightAction(true)
      ).then(function() {
        resolved = true;
      });
      $rootScope.$digest();
      $animate.triggerCallbacks();
      var button = parent.find('button');
      expect(button.text()).toBe('Click me');
      button.triggerHandler('click');
      $rootScope.$digest();
      $animate.triggerCallbacks();
      expect(resolved).toBe(true);
    }));

    describe('when using custom interpolation symbols', function() {
      beforeEach(module(function($interpolateProvider) {
        $interpolateProvider.startSymbol('[[').endSymbol(']]');
      }));

      it('displays correctly', inject(function($mdToast, $rootScope) {
        var parent = angular.element('<div>');
        var toast = $mdToast.simple({
          content: 'Do something',
          parent: parent
        }).action('Click me');

        $mdToast.show(toast);
        $rootScope.$digest();

        var content = parent.find('span').eq(0);
        var button = parent.find('button');

        expect(content.text()).toBe('Do something');
        expect(button.text()).toBe('Click me');
      }));


      it('displays correctly with parent()', inject(function($mdToast, $rootScope) {
              var parent = angular.element('<div>');
              var toast = $mdToast.simple({
                content: 'Do something',
              })
              .parent(parent)
              .action('Click me');

              $mdToast.show(toast);
              $rootScope.$digest();

              var content = parent.find('span').eq(0);
              var button = parent.find('button');

              expect(content.text()).toBe('Do something');
              expect(button.text()).toBe('Click me');
            }));
    });

    function hasConfigMethods(methods) {
      angular.forEach(methods, function(method) {
        return it('supports config method #' + method, inject(function($mdToast) {
          var basic = $mdToast.simple();
          expect(typeof basic[method]).toBe('function');
          expect(basic[method]()).toBe(basic);
        }));
      });
    }
  });

  describe('build()', function() {
    describe('options', function() {
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
});
