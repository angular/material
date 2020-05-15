describe('$mdToast service', function() {

  beforeEach(module('material.components.toast'));

  beforeEach(function () {
    module(function ($provide) {
      $provide.value('$mdMedia', function () {
        return true;
      });
    });
  });

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

    hasConfigMethods(['content', 'action', 'capsule', 'highlightAction', 'theme', 'toastClass']);

    it('should have `._md` class indicator', inject(function($mdToast, $material) {
      var parent = angular.element('<div>');

      $mdToast.show(
        $mdToast.simple({
          parent: parent,
          content: 'Do something',
          theme: 'some-theme',
          capsule: true
      }));
      $material.flushOutstandingAnimations();

      expect(parent.find('md-toast').hasClass('_md')).toBe(true);
    }));

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

      expect(parent.find('span').text().trim()).toContain('Do something');
      expect(parent.find('span')).toHaveClass('md-toast-text');
      expect(parent.find('md-toast')).toHaveClass('md-capsule');
      expect(parent.find('md-toast').attr('md-theme')).toBe('some-theme');

      $material.flushInterimElement();

      expect(openAndclosed).toBe(true);
    }));

    it('supports dynamically updating the content', inject(function($mdToast, $rootScope, $rootElement) {
      var parent = angular.element('<div>');
      $mdToast.showSimple('Hello world');
      $rootScope.$digest();
      $mdToast.updateTextContent('Goodbye world');
      $rootScope.$digest();
      expect($rootElement.find('span').text().trim()).toContain('Goodbye world');
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
      expect(button.text().trim()).toBe('Click me');
      button.triggerHandler('click');
      $material.flushInterimElement();
      expect(resolved).toBe(true);
    }));

    it('should apply the highlight class when using highlightAction', inject(function($mdToast, $rootScope, $material) {
      var parent = angular.element('<div>');

      $mdToast.show(
        $mdToast.simple({
            content: 'Marked as read',
            parent: parent
          })
          .action('UNDO')
          .highlightAction(true)
          .highlightClass('md-warn')
      );

      $material.flushOutstandingAnimations();

      var button = parent.find('button');

      expect(button.text().trim()).toBe('UNDO');
      expect(button).toHaveClass('md-highlight');
      expect(button).toHaveClass('md-warn');
    }));

    it('adds the specified class to md-toast when using toastClass', inject(function($mdToast, $material) {
      var parent = angular.element('<div>');

      $mdToast.show(
        $mdToast.simple()
          .parent(parent)
          .toastClass('test')
      );
      $material.flushOutstandingAnimations();

      expect(parent.find('md-toast').hasClass('test')).toBe(true);
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

        expect(content.text().trim()).toBe('Do something');
        expect(button.text().trim()).toBe('Click me');
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

              expect(content.text().trim()).toBe('Do something');
              expect(button.text().trim()).toBe('Click me');
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
        expect(toast.text().trim()).toBe('1234');
      }));

      it('should have templateUrl', inject(function($timeout, $rootScope, $templateCache, $rootElement) {
        $templateCache.put('template.html', '<md-toast>hello, {{1}}</md-toast>');
        setup({
          templateUrl: 'template.html',
        });
        var toast = $rootElement.find('md-toast');
        expect(toast.text().trim()).toBe('hello, 1');
      }));

      it('should not throw an error if template starts with comment', inject(function($timeout, $rootScope, $rootElement) {
        var parent = angular.element('<div>');
        setup({
          template: '<!-- COMMENT --><md-toast>{{1}}234</md-toast>',
          appendTo: parent
        });

        var toast = $rootElement.find('md-toast');
        $timeout.flush();

        expect(toast.length).not.toBe(0);
      }));

      it('should correctly wrap the custom template', inject(function($timeout, $rootScope, $rootElement) {
        var parent = angular.element('<div>');

        setup({
          template: '<md-toast>Message</md-toast>',
          appendTo: parent
        });

        var toast = $rootElement.find('md-toast');
        $timeout.flush();

        expect(toast[0].querySelector('.md-toast-content').textContent).toBe('Message');
      }));

      it('should add position class to toast', inject(function($rootElement, $timeout) {
        setup({
          template: '<md-toast>',
          position: 'top left'
        });
        var toast = $rootElement.find('md-toast');
        $timeout.flush();
        expect(toast.hasClass('md-top')).toBe(true);
        expect(toast.hasClass('md-left')).toBe(true);
      }));

      it('should wrap toast content with .md-toast-content', inject(function($rootElement, $timeout) {
        setup({
          template: '<md-toast><p>Charmander</p></md-toast>',
          position: 'top left'
        });
        var toast = $rootElement.find('md-toast')[0];
        $timeout.flush();

        expect(toast.children.length).toBe(1);
        var toastContent = toast.children[0];
        var contentSpan = toastContent.children[0];
        expect(toastContent.classList.contains('md-toast-content'));
        expect(toastContent.textContent).toMatch('Charmander');
        expect(contentSpan).not.toHaveClass('md-toast-text');
      }));



      describe('sm screen', function () {
        beforeEach(function () {
          module(function ($provide) {
            $provide.value('$mdMedia', function () {
              return false;
            });
          });
        });

        it('should always be on bottom', inject(function($rootElement, $material) {
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
          expect($rootElement.hasClass('md-toast-open-bottom')).toBe(true);
        }));
      });
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
