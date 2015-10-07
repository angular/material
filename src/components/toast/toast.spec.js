describe('$mdToast service', function() {

  beforeEach(module('material.components.toast'));

  afterEach(inject(function($material) {
    $material.flushOutstandingAnimations();
  }));

  function setup(options) {
    var promise;
    inject(function($mdToast, $material, $timeout) {
      options = options || {};
      promise = $mdToast.show(options);
      $material.flushOutstandingAnimations();
    });
    return promise;
  }

  describe('simple()', function() {
    hasConfigMethods(['content', 'action', 'capsule', 'highlightAction', 'theme']);

    it('supports a basic toast', inject(function($mdToast, $rootScope, $timeout, $material, $browser) {
      var openAndclosed = false;
      var parent = angular.element('<div>');
      $mdToast.show(
        $mdToast.simple({
          parent: parent,
          content: 'Do something',
          theme: 'some-theme',
          capsule: true
        })
      ).then(function() {
        openAndclosed = true;
      });

      $material.flushOutstandingAnimations();

      expect(parent.find('span').text()).toBe('Do something');
      expect(parent.find('md-toast')).toHaveClass('md-capsule');
      expect(parent.find('md-toast').attr('md-theme')).toBe('some-theme');

      $material.flushInterimElement();

      expect(openAndclosed).toBe(true);
    }));

    it('supports dynamicly updating the content', inject(function($mdToast, $rootScope, $rootElement) {
      var parent = angular.element('<div>');
      $mdToast.showSimple('Hello world');
      $rootScope.$digest();
      $mdToast.updateContent('Goodbye world');
      $rootScope.$digest();
      expect($rootElement.find('span').text()).toBe('Goodbye world');
    }));

    it('supports an action toast', inject(function($mdToast, $rootScope, $material) {
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
      $material.flushOutstandingAnimations();
      var button = parent.find('button');
      expect(button.text()).toBe('Click me');
      button.triggerHandler('click');
      $material.flushInterimElement();
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
  });

  describe('lifecycle', function() {

    describe('should hide',function() {
      it('current toast when showing new one', inject(function($rootElement, $material) {
        disableAnimations();

        setup({
          template: '<md-toast class="one">'
        });

        expect($rootElement[0].querySelector('md-toast.one')).toBeTruthy();
        expect($rootElement[0].querySelector('md-toast.two')).toBeFalsy();
        expect($rootElement[0].querySelector('md-toast.three')).toBeFalsy();

        $material.flushInterimElement();

        setup({
          template: '<md-toast class="two">'
        });

        expect($rootElement[0].querySelector('md-toast.one')).toBeFalsy();
        expect($rootElement[0].querySelector('md-toast.two')).toBeTruthy();
        expect($rootElement[0].querySelector('md-toast.three')).toBeFalsy();

        $material.flushInterimElement();

        setup({
          template: '<md-toast class="three">'
        });

        $material.flushOutstandingAnimations();

        expect($rootElement[0].querySelector('md-toast.one')).toBeFalsy();
        expect($rootElement[0].querySelector('md-toast.two')).toBeFalsy();
        expect($rootElement[0].querySelector('md-toast.three')).toBeTruthy();
      }));

      it('after duration', inject(function($timeout, $animate, $rootElement) {
        disableAnimations();

        var parent = angular.element('<div>');
        var hideDelay = 1234;
        setup({
          template: '<md-toast />',
          hideDelay: hideDelay
        });
        expect($rootElement.find('md-toast').length).toBe(1);
        $timeout.flush(hideDelay);
        expect($rootElement.find('md-toast').length).toBe(0);
      }));

      it('and resolve with default `true`', inject(function($timeout, $material, $mdToast) {
        disableAnimations();

        var hideDelay = 1234, result, fault;
        setup({
          template: '<md-toast />',
          hideDelay: 1234
        }).then(
          function(response){ result = response;  },
          function(error){ fault = error;  }
        );

        $mdToast.hide();

        $material.flushInterimElement();

        expect(result).toBe(undefined);
        expect(angular.isUndefined(fault)).toBe(true);

      }));

      it('and resolve with specified value', inject(function($timeout, $animate, $material, $mdToast) {
        disableAnimations();

        var hideDelay = 1234, result, fault;
        setup({
          template: '<md-toast />',
          hideDelay: 1234
        }).then(
          function(response){ result = response;  },
          function(error){ fault = error;  }
        );

        $mdToast.hide("secret");

        $material.flushInterimElement();

        expect(result).toBe("secret");
        expect(angular.isUndefined(fault)).toBe(true);

      }));

      it('and resolve `true` after timeout', inject(function($timeout, $material) {
        disableAnimations();

        var hideDelay = 1234, result, fault;
        setup({
          template: '<md-toast />',
          hideDelay: 1234
        }).then(
          function(response){ result = response;  },
          function(error){ fault = error;  }
        );

        $material.flushInterimElement();

        expect(result).toBe(undefined);
        expect(angular.isUndefined(fault)).toBe(true);

      }));

      it('and resolve `ok` with click on OK button', inject(function($mdToast, $rootScope, $timeout, $material, $browser) {
        var result, fault;
        var parent = angular.element('<div>');
        var toast = $mdToast.simple({
          parent: parent,
          content: 'Do something'
        }).action('Close with "ok" response');

        $mdToast
          .show(toast)
          .then(
            function(response){ result = response;  },
            function(error){ fault = error;  }
          );

        $material.flushOutstandingAnimations();

        parent.find('button').triggerHandler('click');

        $material.flushInterimElement();

        expect(result).toBe('ok');
        expect(angular.isUndefined(fault)).toBe(true);
      }));
    });

    it('should add class to toastParent', inject(function($rootElement, $material) {
      disableAnimations();

      setup({
        template: '<md-toast>'
      });
      expect($rootElement.hasClass('md-toast-open-bottom')).toBe(true);

      $material.flushInterimElement();

      setup({
        template: '<md-toast>',
        position: 'top'
      });
      expect($rootElement.hasClass('md-toast-open-top')).toBe(true);
    }));
  });

});
