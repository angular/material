describe('$mdDialog', function() {
  var $mdDialog, $rootScope;
  var runAnimation;

  beforeEach(module('material.components.dialog', 'ngSanitize'));
  beforeEach(inject(function($$q, $animate, $injector) {
    $mdDialog = $injector.get('$mdDialog');
    $rootScope = $injector.get('$rootScope');

    // Spy on animation effects.
    spyOn($animate, 'leave').and.callFake(function(element) {
      element.remove();
      return $$q.when();
    });
    spyOn($animate, 'enter').and.callFake(function(element, parent) {
      parent.append(element);
      return $$q.when();
    });
  }));

  beforeEach(inject(function($material) {
    runAnimation = function() {
      $material.flushInterimElement();
    };
  }));

  describe('#alert()', function() {
    hasConfigurationMethods('alert', [
      'title', 'htmlContent', 'textContent', 'ariaLabel',
      'ok', 'targetEvent', 'theme'
    ]);

    it('shows a basic confirm dialog without content', inject(function($animate, $rootScope, $mdDialog) {
          var parent = angular.element('<div>');
          var resolved = false;

          $mdDialog.show(
            $mdDialog
              .confirm()
              .parent(parent)
              .title('')
              .css('someClass anotherClass')
              .ok('Next')
              .cancel("Back")
          ).then(function() {
              resolved = true;
            });

          $rootScope.$apply();
          runAnimation();

          var mdContainer = angular.element(parent[0].querySelector('.md-dialog-container'));
          var mdDialog = mdContainer.find('md-dialog');
          var mdContent = mdDialog.find('md-dialog-content');
          var title = mdContent.find('h2');
          var contentBody = mdContent[0].querySelector('.md-dialog-content-body');
          var buttons = parent.find('md-button');
          var css = mdDialog.attr('class').split(' ');

          expect(title.text()).toBe('');
          expect(contentBody.textContent).toBe('');
          expect(css).toContain('someClass');
          expect(css).toContain('anotherClass');

          buttons.eq(0).triggerHandler('click');

          $rootScope.$apply();
          runAnimation();

          expect(resolved).toBe(true);
        }));

    it('shows a basic alert dialog', inject(function($animate, $rootScope, $mdDialog) {
      var parent = angular.element('<div>');
      var resolved = false;

      $mdDialog.show(
        $mdDialog
          .alert()
          .parent(parent)
          .title('Title')
          .textContent('Hello world')
          .theme('some-theme')
          .css('someClass anotherClass')
          .ok('Next')
      ).then(function() {
          resolved = true;
        });

      $rootScope.$apply();
      runAnimation();

      var mdContainer = angular.element(parent[0].querySelector('.md-dialog-container'));
      var mdDialog = mdContainer.find('md-dialog');
      var mdContent = mdDialog.find('md-dialog-content');
      var title = mdContent.find('h2');
      var contentBody = mdContent[0].querySelector('.md-dialog-content-body');
      var buttons = parent.find('md-button');
      var theme = mdDialog.attr('md-theme');
      var css = mdDialog.attr('class').split(' ');

      expect(title.text()).toBe('Title');
      expect(contentBody.textContent).toBe('Hello world');
      expect(buttons.length).toBe(1);
      expect(buttons.eq(0).text()).toBe('Next');
      expect(theme).toBe('some-theme');
      expect(css).toContain('someClass');
      expect(css).toContain('anotherClass');
      expect(mdDialog.attr('role')).toBe('alertdialog');

      buttons.eq(0).triggerHandler('click');

      $rootScope.$apply();
      runAnimation();

      expect(resolved).toBe(true);
    }));

    it('should focus `md-dialog-content` on open', inject(function($mdDialog, $rootScope, $document) {
      jasmine.mockElementFocus(this);

      var parent = angular.element('<div>');

      $mdDialog.show(
        $mdDialog.alert({
          template: '<md-dialog>' +
          '<md-dialog-content tabIndex="0" md-autofocus>' +
          '<p>Muppets are the best</p>' +
          '</md-dialog-content>' +
          '</md-dialog>',
          parent: parent
        })
      );

      runAnimation(parent.find('md-dialog'));

      expect($document.activeElement).toBe(parent[0].querySelector('md-dialog-content'));
    }));

    it('should use the prefixed id from `md-dialog` for `md-dialog-content`', inject(function ($mdDialog, $rootScope, $document) {
      jasmine.mockElementFocus(this);

      var parent = angular.element('<div>');

      $mdDialog.show(
        $mdDialog.alert({
          template: '<md-dialog id="demoid">' +
          '<md-dialog-content>' +
          '<p>Muppets are the best</p>' +
          '</md-dialog-content>' +
          '</md-dialog>',
          parent: parent
        })
      );

      runAnimation();

      var dialog = parent.find('md-dialog');
      var content = parent[0].querySelector('md-dialog-content');

      expect(content.id).toBe('dialogContent_' + dialog[0].id);
    }));

    it('should apply a prefixed id for `md-dialog-content`', inject(function ($mdDialog, $rootScope, $document) {
      jasmine.mockElementFocus(this);

      var parent = angular.element('<div>');

      $mdDialog.show(
        $mdDialog.alert({
          template: '<md-dialog>' +
          '<md-dialog-content>' +
          '<p>Muppets are the best</p>' +
          '</md-dialog-content>' +
          '</md-dialog>',
          parent: parent
        })
      );

      runAnimation();

      var dialog = parent.find('md-dialog');
      var content = parent[0].querySelector('md-dialog-content');

      expect(content.id).toMatch(/dialogContent_.*/g);
    }));

    it('should remove `md-dialog-container` on mousedown mouseup and remove', inject(function($mdDialog, $rootScope, $timeout) {
      jasmine.mockElementFocus(this);
      var container, parent = angular.element('<div>');

      $mdDialog.show(
        $mdDialog.alert({
          template: '<md-dialog>' +
          '<md-dialog-content tabIndex="0">' +
          '<p>Muppets are the best</p>' +
          '</md-dialog-content>' +
          '</md-dialog>',
          parent: parent,
          clickOutsideToClose: true
        })
      );

      runAnimation();

      container = angular.element(parent[0].querySelector('.md-dialog-container'));
      container.triggerHandler({
        type: 'mousedown',
        target: container[0]
      });
      container.triggerHandler({
        type: 'mouseup',
        target: container[0]
      });

      $timeout.flush();
      runAnimation();

      container = angular.element(parent[0].querySelector('.md-dialog-container'));
      expect(container.length).toBe(0);
    }));

    it('should remove `md-dialog-container` on scope.$destroy()', inject(function($mdDialog, $rootScope, $timeout) {
      var container, parent = angular.element('<div>');

      $mdDialog.show(
        $mdDialog.alert({
          template: '' +
            '<md-dialog>' +
            '  <md-dialog-content tabIndex="0">' +
            '    <p>Muppets are the best</p>' +
            '  </md-dialog-content>' +
            '</md-dialog>',
          parent: parent
        })
      );

      runAnimation(parent.find('md-dialog'));
        $rootScope.$destroy();
      container = angular.element(parent[0].querySelector('.md-dialog-container'));

      expect(container.length).toBe(0);
    }));

  });

  describe('#confirm()', function() {
    hasConfigurationMethods('confirm', [
      'title', 'htmlContent', 'textContent', 'ariaLabel',
      'ok', 'cancel', 'targetEvent', 'theme'
    ]);

    it('shows a basic confirm dialog with simple text content', inject(function($rootScope, $mdDialog) {
      var parent = angular.element('<div>');
      var rejected = false;
      $mdDialog.show(
        $mdDialog.confirm({
          parent: parent
        })
          .title('Title')
          .textContent('Hello world')
          .ok('Next')
          .cancel('Forget it')
      ).catch(function() {
          rejected = true;
        });

      runAnimation();

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));
      var dialog = parent.find('md-dialog');
      var title = parent.find('h2');
      var contentBody = parent[0].querySelector('.md-dialog-content-body');
      var buttons = parent.find('md-button');

      expect(dialog.attr('role')).toBe('dialog');
      expect(title.text()).toBe('Title');
      expect(contentBody.textContent).toBe('Hello world');
      expect(buttons.length).toBe(2);
      expect(buttons.eq(0).text()).toBe('Next');
      expect(buttons.eq(1).text()).toBe('Forget it');

      buttons.eq(1).triggerHandler('click');
      runAnimation();

      expect(parent.find('h2').length).toBe(0);
      expect(rejected).toBe(true);
    }));

    it('should allow htmlContent with simple HTML tags', inject(function($mdDialog) {
      var parent = angular.element('<div>');

      $mdDialog.show(
        $mdDialog.confirm({
          parent: parent,
          ok: 'Next',
          cancel: 'Back',
          title: 'Which Way ',
          htmlContent: '<div class="mine">Choose</div>'
        })
      );

      runAnimation();

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));
      var content = angular.element(container[0].querySelector('.mine'));

      expect(content.text()).toBe('Choose');
    }));

    it('should support the deprecated `content` method as text', inject(function($mdDialog) {
      var parent = angular.element('<div>');

      $mdDialog.show(
        $mdDialog.confirm({
          parent: parent,
          ok: 'Next',
          cancel: 'Back',
          title: 'Which Way ',
          content: '<div class="mine">Choose</div>'
        })
      );

      runAnimation();

      var contentBody = parent[0].querySelector('.md-dialog-content-body');

      expect(contentBody.textContent).toBe('<div class="mine">Choose</div>');
    }));

    it('should NOT allow custom elements in confirm htmlContent', inject(function($mdDialog) {
      var parent = angular.element('<div>');

      $mdDialog.show(
        $mdDialog.confirm({
          parent: parent,
          ok: 'Next',
          cancel: 'Back',
          title: 'Which Way ',
          htmlContent: '<my-content class="mine">Choose</my-content> breakfast'
        })
      );

      runAnimation();

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));
      var contentBody = container[0].querySelector('.md-dialog-content-body');

      expect(contentBody.textContent).toBe('Choose breakfast');
    }));

    it('should NOT evaluate angular templates in confirm htmlContent', inject(function($mdDialog) {
      var parent = angular.element('<div>');

      $mdDialog.show(
        $mdDialog.confirm({
          parent: parent,
          ok: 'Next',
          cancel: 'Back',
          title: 'Which Way ',
          htmlContent: '{{1 + 1}}'
        })
      );

      runAnimation();

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));
      var contentBody = container[0].querySelector('.md-dialog-content-body');

      expect(contentBody.textContent).toBe('{{1 + 1}}');
    }));

    it('should focus `md-button.dialog-close` on open', inject(function($mdDialog, $rootScope, $document, $timeout, $mdConstant) {
      jasmine.mockElementFocus(this);

      var parent = angular.element('<div>');
      $mdDialog.show({
        template: '' +
          '<md-dialog>' +
          '  <md-dialog-actions>' +
          '    <button class="dialog-close">Close</button>' +
          '  </md-dialog-actions>' +
          '</md-dialog>',
        parent: parent
      });
      runAnimation();

      expect($document.activeElement).toBe(parent[0].querySelector('.dialog-close'));
    }));

    it('should remove `md-dialog-container` after mousedown mouseup outside', inject(function($mdDialog, $rootScope, $timeout, $animate) {
      jasmine.mockElementFocus(this);
      var container, parent = angular.element('<div>');

      $mdDialog.show(
        $mdDialog.confirm({
          template: '<md-dialog>' +
          '<md-dialog-content tabIndex="0">' +
          '<p>Muppets are the best</p>' +
          '</md-dialog-content>' +
          '</md-dialog>',
          parent: parent,
          clickOutsideToClose: true,
          ok: 'OK',
          cancel: 'CANCEL'
        })
      );
      runAnimation();

      container = angular.element(parent[0].querySelector('.md-dialog-container'));
      container.triggerHandler({
        type: 'mousedown',
        target: container[0]
      });
      container.triggerHandler({
        type: 'mouseup',
        target: container[0]
      });

      runAnimation();
      runAnimation();

      container = angular.element(parent[0].querySelector('.md-dialog-container'));
      expect(container.length).toBe(0);
    }));

    it('should not remove `md-dialog-container` after mousedown outside mouseup inside', inject(function($mdDialog, $rootScope, $timeout, $animate) {
      jasmine.mockElementFocus(this);
      var container, parent = angular.element('<div>');

      $mdDialog.show(
        $mdDialog.confirm({
          template: '<md-dialog>' +
          '<md-dialog-content tabIndex="0">' +
          '<p>Muppets are the best</p>' +
          '</md-dialog-content>' +
          '</md-dialog>',
          parent: parent,
          clickOutsideToClose: true,
          ok: 'OK',
          cancel: 'CANCEL'
        })
      );
      runAnimation();

      container = angular.element(parent[0].querySelector('.md-dialog-container'));
      var content = angular.element(parent[0].querySelector('md-dialog-content'));
      container.triggerHandler({
        type: 'mousedown',
        target: container[0]
      });
      content.triggerHandler({
        type: 'mouseup',
        target: content[0]
      });

      runAnimation();
      runAnimation();

      container = angular.element(parent[0].querySelector('.md-dialog-container'));
      expect(container.length).toBe(1);
    }));

    it('should not remove `md-dialog-container` after mousedown inside mouseup outside', inject(function($mdDialog, $rootScope, $timeout, $animate) {
      jasmine.mockElementFocus(this);
      var container, parent = angular.element('<div>');

      $mdDialog.show(
        $mdDialog.confirm({
          template: '<md-dialog>' +
          '<md-dialog-content tabIndex="0">' +
          '<p>Muppets are the best</p>' +
          '</md-dialog-content>' +
          '</md-dialog>',
          parent: parent,
          clickOutsideToClose: true,
          ok: 'OK',
          cancel: 'CANCEL'
        })
      );
      runAnimation();

      container = angular.element(parent[0].querySelector('.md-dialog-container'));
      var content = angular.element(parent[0].querySelector('md-dialog-content'));
      content.triggerHandler({
        type: 'mousedown',
        target: content[0]
      });
      container.triggerHandler({
        type: 'mouseup',
        target: container[0]
      });

      runAnimation();
      runAnimation();

      container = angular.element(parent[0].querySelector('.md-dialog-container'));
      expect(container.length).toBe(1);
    }));

    it('should remove `md-dialog-container` after ESCAPE key', inject(function($mdDialog, $rootScope, $timeout, $mdConstant) {
      jasmine.mockElementFocus(this);
      var container, parent = angular.element('<div>');
      var response;

      $mdDialog.show(
        $mdDialog.confirm({
          template: '<md-dialog>' +
          '<md-dialog-content tabIndex="0">' +
          '<p>Muppets are the best</p>' +
          '</md-dialog-content>' +
          '</md-dialog>',
          parent: parent,
          clickOutsideToClose: true,
          escapeToClose: true,
          ok: 'OK',
          cancel: 'CANCEL'
        })
      ).catch(function(reason) {
          response = reason;
        });
      runAnimation();

      parent.triggerHandler({
        type: 'keydown',
        keyCode: $mdConstant.KEY_CODE.ESCAPE
      });
      runAnimation();
      runAnimation();

      container = angular.element(parent[0].querySelector('.md-dialog-container'));
      expect(container.length).toBe(0);
      expect(response).toBe(undefined);
    }));
  });

  describe('#prompt()', function() {
    hasConfigurationMethods('prompt', ['title', 'htmlContent', 'textContent',
      'content', 'placeholder', 'ariaLabel', 'ok', 'cancel', 'theme', 'css'
    ]);

    it('shows a basic prompt dialog', inject(function($animate, $rootScope, $mdDialog) {
      var parent = angular.element('<div>');
      var resolved = false;
      var promptAnswer;

      $mdDialog.show(
        $mdDialog
          .prompt()
          .parent(parent)
          .title('Title')
          .textContent('Hello world')
          .placeholder('placeholder text')
          .theme('some-theme')
          .css('someClass anotherClass')
          .ok('Next')
          .cancel('Cancel')
      ).then(function(answer) {
          resolved = true;
          promptAnswer = answer;
        });

      $rootScope.$apply();
      runAnimation();

      var mdContainer = angular.element(parent[0].querySelector('.md-dialog-container'));
      var mdDialog = mdContainer.find('md-dialog');
      var mdContent = mdDialog.find('md-dialog-content');
      var title = mdContent.find('h2');
      var contentBody = mdContent[0].querySelector('.md-dialog-content-body');
      var inputElement = mdContent.find('input');
      var buttons = parent.find('md-button');
      var theme = mdDialog.attr('md-theme');
      var css = mdDialog.attr('class').split(' ');

      expect(title.text()).toBe('Title');
      expect(contentBody.textContent).toBe('Hello world');
      expect(inputElement[0].placeholder).toBe('placeholder text')
      expect(buttons.length).toBe(2);
      expect(buttons.eq(0).text()).toBe('Next');
      expect(theme).toBe('some-theme');
      expect(css).toContain('someClass');
      expect(css).toContain('anotherClass');
      expect(mdDialog.attr('role')).toBe('dialog');

      inputElement.eq(0).text('responsetext');
      inputElement.scope().$apply("dialog.result = 'responsetext'")

      buttons.eq(0).triggerHandler('click');

      $rootScope.$apply();
      runAnimation();

      expect(resolved).toBe(true);
      expect(promptAnswer).toBe('responsetext');
    }));

    it('should focus the input element on open', inject(function($mdDialog, $rootScope, $document) {
      jasmine.mockElementFocus(this);

      var parent = angular.element('<div>');

      $mdDialog.show(
        $mdDialog
          .prompt()
          .parent(parent)
          .textContent('Hello world')
          .placeholder('placeholder text')
      )

      runAnimation(parent.find('md-dialog'));

      expect($document.activeElement).toBe(parent[0].querySelector('input'));
    }));

    it('should submit after ENTER key', inject(function($mdDialog, $rootScope, $timeout, $mdConstant) {
      jasmine.mockElementFocus(this);
      var parent = angular.element('<div>');
      var response;

      $mdDialog.show(
        $mdDialog
          .prompt()
          .parent(parent)
          .textContent('Hello world')
          .placeholder('placeholder text')
      ).then(function(answer) {
          response = answer;
        });
      runAnimation();

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));
      var mdDialog = container.find('md-dialog');
      var mdContent = mdDialog.find('md-dialog-content');
      var inputElement = mdContent.find('input');

      inputElement.scope().$apply("dialog.result = 'responsetext'")

      inputElement.eq(0).triggerHandler({
        type: 'keypress',
        keyCode: $mdConstant.KEY_CODE.ENTER
      });
      runAnimation();
      runAnimation();

      expect(response).toBe('responsetext');
    }));
  });

  describe('#build()', function() {
    it('should support onShowing callbacks before `show()` starts', inject(function($mdDialog, $rootScope) {

      var template = '<md-dialog>Hello</md-dialog>';
      var parent = angular.element('<div>');
      var showing = false;

      $mdDialog.show({
        template: template,
        parent: parent,
        onShowing: onShowing
      });
      $rootScope.$apply();

      runAnimation();

      function onShowing(scope, element, options) {
        showing = true;
        container = angular.element(parent[0].querySelector('.md-dialog-container'));
        expect(container.length).toBe(0);
      }

      expect(showing).toBe(true);
    }));

    it('should support onComplete callbacks within `show()`', inject(function($mdDialog, $rootScope, $timeout, $mdConstant) {

      var template = '<md-dialog>Hello</md-dialog>';
      var parent = angular.element('<div>');
      var ready = false;

      $mdDialog.show({
        template: template,
        parent: parent,
        onComplete: function(scope, element, options) {
          ready = true;
        }
      });
      $rootScope.$apply();
      expect(ready).toBe(false);

      runAnimation();

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));
      expect(container.length).toBe(1);
      expect(ready).toBe(true);
    }));

    it('should support onRemoving callbacks when `hide()` starts', inject(function($mdDialog, $rootScope, $timeout, $mdConstant) {

      var template = '<md-dialog>Hello</md-dialog>';
      var parent = angular.element('<div>');
      var closing = false;

      $mdDialog.show({
        template: template,
        parent: parent,
        escapeToClose: true,
        onRemoving: function(scope, element) {
          expect(arguments.length).toEqual(2);
          closing = true;
        }
      });
      $rootScope.$apply();
      expect(closing).toBe(false);

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));
      runAnimation();

      parent.triggerHandler({
        type: 'keydown',
        keyCode: $mdConstant.KEY_CODE.ESCAPE
      });
      $timeout.flush();

      expect(closing).toBe(true);
    }));

    it('should support specifying a parent using a string selector', inject(function($mdDialog, $rootScope, $document) {
      var body = angular.element($document[0].querySelector("body"));
      var nodes = angular.element(''+
            '<div class="wrapper">' +
            '  <md-content> </md-content>' +
            '  <div id="owner">' +
            '  </div>' +
            '</div>'
      );

      body.append( nodes );
      $mdDialog.show({
        template: '<md-dialog>Hello</md-dialog>',
        parent: "#owner",
      });
      $rootScope.$apply();
      runAnimation();

      var owner = angular.element(body[0].querySelector('#owner'));
      var container = angular.element(body[0].querySelector('.md-dialog-container'));

      expect(container[0].parentNode === owner[0]).toBe(true);
      nodes.remove();
    }));

    describe('when autoWrap parameter is true (default)', function() {

      it('should not wrap content with existing md-dialog', inject(function($mdDialog, $rootScope) {

        var template = '<md-dialog><div id="rawContent">Hello</div></md-dialog>';
        var parent = angular.element('<div>');

        $mdDialog.show({
          template: template,
          parent: parent
        });

        $rootScope.$apply();

        var container = parent[0].querySelectorAll('md-dialog');
        expect(container.length).toBe(1);
      }));

      it('should wrap raw content with md-dialog', inject(function($mdDialog, $rootScope) {

        var template = '<div id="rawContent">Hello</div>';
        var parent = angular.element('<div>');

        $mdDialog.show({
          template: template,
          parent: parent
        });

        $rootScope.$apply();

        var container = parent[0].querySelectorAll('md-dialog');
        expect(container.length).toBe(1);
      }));
    });


    describe('when autoWrap parameter is false', function() {

      it('should not wrap raw content with md-dialog', inject(function($mdDialog, $rootScope) {

        var template = '<div id="rawContent">Hello</div>';
        var parent = angular.element('<div>');

        $mdDialog.show({
          template: template,
          parent: parent,
          autoWrap: false
        });

        $rootScope.$apply();

        var container = parent[0].querySelectorAll('md-dialog');
        expect(container.length).toBe(0);
      }));
    });

    it('should append dialog within a md-dialog-container', inject(function($mdDialog, $rootScope) {

      var template = '<md-dialog>Hello</md-dialog>';
      var parent = angular.element('<div>');

      $mdDialog.show({
        template: template,
        parent: parent
      });

      $rootScope.$apply();

      var container = parent[0].querySelectorAll('.md-dialog-container');
      expect(container.length).toBe(1);
    }));

    it('should escapeToClose == true', inject(function($mdDialog, $rootScope, $rootElement, $timeout, $animate, $mdConstant) {
      var parent = angular.element('<div>');
      $mdDialog.show({
        template: '<md-dialog></md-dialog>',
        parent: parent,
        escapeToClose: true
      });
      $rootScope.$apply();

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));
      runAnimation();

      expect(parent.find('md-dialog').length).toBe(1);

      parent.triggerHandler({
        type: 'keydown',
        keyCode: $mdConstant.KEY_CODE.ESCAPE
      });
      $timeout.flush();
      runAnimation();

      expect(parent.find('md-dialog').length).toBe(0);
    }));

    it('should escapeToClose == false', inject(function($mdDialog, $rootScope, $rootElement, $timeout, $animate, $mdConstant) {
      var parent = angular.element('<div>');
      $mdDialog.show({
        template: '',
        parent: parent,
        escapeToClose: false
      });
      $rootScope.$apply();

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));
      runAnimation();
      expect(parent.find('md-dialog').length).toBe(1);

      $rootElement.triggerHandler({type: 'keydown', keyCode: $mdConstant.KEY_CODE.ESCAPE});
      runAnimation();

      expect(parent.find('md-dialog').length).toBe(1);
    }));

    it('should clickOutsideToClose == true', inject(function($mdDialog, $rootScope, $timeout, $animate, $mdConstant) {

      var parent = angular.element('<div>');
      $mdDialog.show({
        template: '',
        parent: parent,
        clickOutsideToClose: true
      });
      $rootScope.$apply();

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));
      runAnimation();
      expect(parent.find('md-dialog').length).toBe(1);

      container.triggerHandler({
        type: 'mousedown',
        target: container[0]
      });
      container.triggerHandler({
        type: 'mouseup',
        target: container[0]
      });
      runAnimation();
      runAnimation();

      expect(parent.find('md-dialog').length).toBe(0);
    }));

    it('should clickOutsideToClose == false', inject(function($mdDialog, $rootScope, $timeout, $animate) {

      var parent = angular.element('<div>');
      $mdDialog.show({
        template: '',
        parent: parent,
        clickOutsideToClose: false
      });

      $rootScope.$apply();
      expect(parent.find('md-dialog').length).toBe(1);

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));

      container.triggerHandler({
        type: 'click',
        target: container[0]
      });

      runAnimation();

      expect(parent[0].querySelectorAll('md-dialog').length).toBe(1);
    }));

    it('should disableParentScroll == true', inject(function($mdDialog, $animate, $rootScope, $mdUtil) {
      spyOn($mdUtil, 'disableScrollAround');
      var parent = angular.element('<div>');
      $mdDialog.show({
        template: '',
        parent: parent,
        disableParentScroll: true
      });
      runAnimation();
      expect($mdUtil.disableScrollAround).toHaveBeenCalled();
    }));

    it('should hasBackdrop == true', inject(function($mdDialog, $animate, $rootScope) {
      var parent = angular.element('<div>');
      $mdDialog.show({
        template: '',
        parent: parent,
        hasBackdrop: true
      });

      runAnimation();
      expect(parent.find('md-dialog').length).toBe(1);
      expect(parent.find('md-backdrop').length).toBe(1);
    }));

    it('should hasBackdrop == false', inject(function($mdDialog, $rootScope) {
      var parent = angular.element('<div>');
      $mdDialog.show({
        template: '',
        parent: parent,
        hasBackdrop: false
      });

      $rootScope.$apply();
      expect(parent[0].querySelectorAll('md-dialog').length).toBe(1);
      expect(parent[0].querySelectorAll('md-backdrop').length).toBe(0);
    }));

    it('should focusOnOpen == true', inject(function($mdDialog, $rootScope, $document, $timeout, $mdConstant) {
      jasmine.mockElementFocus(this);
      var parent = angular.element('<div>');
      $mdDialog.show({
        focusOnOpen: true,
        parent: parent,
        template:
          '<md-dialog>' +
          '  <md-dialog-actions>' +
          '    <button id="a">A</md-button>' +
          '    <button id="focus-target">B</md-button>' +
          '  </md-dialog-actions>' +
          '</md-dialog>'
      });

      $rootScope.$apply();
      runAnimation();

      expect($document.activeElement).toBe(parent[0].querySelector('#focus-target'));
    }));

    it('should focusOnOpen == false', inject(function($mdDialog, $rootScope, $document, $timeout, $mdConstant) {
      jasmine.mockElementFocus(this);

      var parent = angular.element('<div>');
      $mdDialog.show({
        focusOnOpen: false,
        parent: parent,
        template:
          '<md-dialog>' +
            '<md-dialog-actions>' +
              '<button id="a">A</md-button>' +
              '<button id="focus-target">B</md-button>' +
            '</md-dialog-actions>' +
          '</md-dialog>',
      });

      $rootScope.$apply();
      runAnimation();

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));
      runAnimation();

      expect($document.activeElement).toBe(undefined);
    }));

    xit('should expand from and shrink to targetEvent element', inject(function($mdDialog, $rootScope, $timeout, $mdConstant, $$rAF) {
      // Create a targetEvent parameter pointing to a fake element with a
      // defined bounding rectangle.
      var fakeEvent = {
        target: {
          getBoundingClientRect: function() {
            return {top: 100, left: 200, bottom: 140, right: 280, height: 40, width: 80};
          }
        }
      };
      var parent = angular.element('<div>');
      $mdDialog.show({
        template: '<md-dialog>',
        parent: parent,
        targetEvent: fakeEvent,
        clickOutsideToClose: true
      });
      $rootScope.$apply();

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));
      var dialog = parent.find('md-dialog');

      $$rAF.flush();

      // The dialog's bounding rectangle is always zero size and position in
      // these tests, so the target of the CSS transform should be the midpoint
      // of the targetEvent element's bounding rect.
      verifyTransformCss(dialog, $mdConstant.CSS.TRANSFORM,
        'translate3d(240px, 120px, 0px) scale(0.5, 0.5)');

      // Clear the animation CSS so we can be sure it gets reset.
      dialog.css($mdConstant.CSS.TRANSFORM, '');

      // When the dialog is closed (here by an outside click), the animation
      // should shrink to the same point it expanded from.
      container.triggerHandler({
        type: 'click',
        target: container[0]
      });
      runAnimation();

      verifyTransformCss(dialog, $mdConstant.CSS.TRANSFORM,
        'translate3d(240px, 120px, 0px) scale(0.5, 0.5)');
    }));

    xit('should shrink to updated targetEvent element location', inject(function($mdDialog, $rootScope, $timeout, $mdConstant) {
      // Create a targetEvent parameter pointing to a fake element with a
      // defined bounding rectangle.
      var fakeEvent = {
        target: {
          getBoundingClientRect: function() {
            return {top: 100, left: 200, bottom: 140, right: 280, height: 40, width: 80};
          }
        }
      };

      var parent = angular.element('<div>');
      $mdDialog.show({
        template: '<md-dialog>',
        parent: parent,
        targetEvent: fakeEvent,
        clickOutsideToClose: true
      });
      $rootScope.$apply();

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));
      var dialog = parent.find('md-dialog');

      triggerTransitionEnd(dialog, false);

      verifyTransformCss(dialog, $mdConstant.CSS.TRANSFORM,
        'translate3d(240px, 120px, 0px) scale(0.5, 0.5)');

      // Simulate the event target element moving on the page. When the dialog
      // is closed, it should animate to the new midpoint.
      fakeEvent.target.getBoundingClientRect = function() {
        return {top: 300, left: 400, bottom: 360, right: 500, height: 60, width: 100};
      };
      container.triggerHandler({
        type: 'click',
        target: container[0]
      });
      $timeout.flush();

      verifyTransformCss(dialog, $mdConstant.CSS.TRANSFORM,
        'translate3d(450px, 330px, 0px) scale(0.5, 0.5)');
    }));

    xit('should shrink to original targetEvent element location if element is hidden', inject(function($mdDialog, $rootScope, $timeout, $mdConstant) {
      // Create a targetEvent parameter pointing to a fake element with a
      // defined bounding rectangle.
      var fakeEvent = {
        target: {
          getBoundingClientRect: function() {
            return {top: 100, left: 200, bottom: 140, right: 280, height: 40, width: 80};
          }
        }
      };

      var parent = angular.element('<div>');
      $mdDialog.show({
        template: '<md-dialog>',
        parent: parent,
        targetEvent: fakeEvent,
        clickOutsideToClose: true
      });
      $rootScope.$apply();

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));
      var dialog = parent.find('md-dialog');

      verifyTransformCss(dialog, $mdConstant.CSS.TRANSFORM,
        'translate3d(240px, 120px, 0px) scale(0.5, 0.5)');

      triggerTransitionEnd(dialog, false);

      // Clear the animation CSS so we can be sure it gets reset.
      dialog.css($mdConstant.CSS.TRANSFORM, '');

      // Simulate the event target element being hidden, which would cause
      // getBoundingClientRect() to return a rect with zero position and size.
      // When the dialog is closed, the animation should shrink to the point
      // it originally expanded from.
      fakeEvent.target.getBoundingClientRect = function() {
        return {top: 0, left: 0, bottom: 0, right: 0, height: 0, width: 0};
      };
      container.triggerHandler({
        type: 'click',
        target: container[0]
      });
      $timeout.flush();

      verifyTransformCss(dialog, $mdConstant.CSS.TRANSFORM,
        'translate3d(240px, 120px, 0px) scale(0.5, 0.5)');
    }));

    it('should focus the last `md-button` in md-dialog-actions open if no `.dialog-close`', inject(function($mdDialog, $rootScope, $document, $timeout, $mdConstant) {
      jasmine.mockElementFocus(this);

      var parent = angular.element('<div>');
      $mdDialog.show({
        template:
          '<md-dialog>' +
          '  <md-dialog-actions>' +
          '    <button id="a">A</md-button>' +
          '    <button id="focus-target">B</md-button>' +
          '  </md-dialog-actions>' +
          '</md-dialog>',
        parent: parent
      });

      runAnimation();

      expect($document.activeElement).toBe(parent[0].querySelector('#focus-target'));
    }));

    it('should warn if the deprecated .md-actions class is used', inject(function($mdDialog, $rootScope, $log, $timeout) {
       spyOn($log, 'warn');

      var parent = angular.element('<div>');
      $mdDialog.show({
        template:
          '<md-dialog>' +
            '<div class="md-actions">' +
              '<button class="md-button">Ok good</button>' +
            '</div>' +
          '</md-dialog>',
        parent: parent
      });

      runAnimation();

      expect($log.warn).toHaveBeenCalled();
    }));

    it('should only allow one open at a time', inject(function($mdDialog, $rootScope, $animate) {
      var parent = angular.element('<div>');
      $mdDialog.show({
        template: '<md-dialog class="one">',
        parent: parent
      });
      runAnimation();

      expect(parent[0].querySelectorAll('md-dialog.one').length).toBe(1);
      expect(parent[0].querySelectorAll('md-dialog.two').length).toBe(0);

      $mdDialog.show({
        template: '<md-dialog class="two">',
        parent: parent
      });
      runAnimation();

      expect(parent[0].querySelectorAll('md-dialog.one').length).toBe(0);
      expect(parent[0].querySelectorAll('md-dialog.two').length).toBe(1);
    }));

    it('should hide dialog', inject(function($mdDialog, $rootScope, $animate) {
      var parent = angular.element('<div>');
      $mdDialog.show({
        template: '<md-dialog class="one">',
        parent: parent
      });
      runAnimation();

      $mdDialog.hide();
      runAnimation();

      expect(parent[0].querySelectorAll('md-dialog.one').length).toBe(0);
    }));

    it('should allow opening new dialog after existing without corruption', inject(function($mdDialog, $rootScope, $animate) {
      var parent = angular.element('<div>');
      $mdDialog.show({
        template: '<md-dialog class="one">',
        parent: parent
      });
      runAnimation();
      $mdDialog.hide();
      runAnimation();

      $mdDialog.show({
        template: '<md-dialog class="two">',
        parent: parent
      });
      runAnimation();
      $mdDialog.hide();
      runAnimation();

      expect(parent[0].querySelectorAll('md-dialog.one').length).toBe(0);
      expect(parent[0].querySelectorAll('md-dialog.two').length).toBe(0);
    }));

    it('should allow opening new dialog from existing without corruption', inject(function($mdDialog, $rootScope, $animate) {
      var parent = angular.element('<div>');
      $mdDialog.show({
        template: '<md-dialog class="one">',
        parent: parent
      });
      runAnimation();

      $mdDialog.show({
        template: '<md-dialog class="two">',
        parent: parent
      });
      //First run is for the old dialog being hidden.
      runAnimation();
      //Second run is for the new dialog being shown.
      runAnimation();
      $mdDialog.hide();
      runAnimation();

      expect(parent[0].querySelectorAll('md-dialog.one').length).toBe(0);
      expect(parent[0].querySelectorAll('md-dialog.two').length).toBe(0);
    }));

    it('should have the dialog role', inject(function($mdDialog, $rootScope) {
      var template = '<md-dialog>Hello</md-dialog>';
      var parent = angular.element('<div>');

      $mdDialog.show({
        template: template,
        parent: parent
      });

      $rootScope.$apply();

      var dialog = angular.element(parent[0].querySelectorAll('md-dialog'));
      expect(dialog.attr('role')).toBe('dialog');
    }));

    it('should create an ARIA label if one is missing', inject(function($mdDialog, $rootScope, $$rAF) {
      var template = '<md-dialog>Hello</md-dialog>';
      var parent = angular.element('<div>');

      $mdDialog.show({
        template: template,
        parent: parent
      });
      runAnimation();

      var dialog = angular.element(parent[0].querySelector('md-dialog'));
      expect(dialog.attr('aria-label')).toEqual(dialog.text());
    }));

    it('should not modify an existing ARIA label', inject(function($mdDialog, $rootScope) {
      var template = '<md-dialog aria-label="Some Other Thing">Hello</md-dialog>';
      var parent = angular.element('<div>');

      $mdDialog.show({
        template: template,
        parent: parent
      });

      runAnimation();

      var dialog = angular.element(parent[0].querySelector('md-dialog'));
      expect(dialog.attr('aria-label')).not.toEqual(dialog.text());
      expect(dialog.attr('aria-label')).toEqual('Some Other Thing');
    }));

    it('should add an ARIA label if supplied through chaining', inject(function($mdDialog, $rootScope, $animate) {
      var parent = angular.element('<div>');

      $mdDialog.show(
        $mdDialog.alert({
          parent: parent
        })
          .ariaLabel('label')
      );

      runAnimation();

      var dialog = angular.element(parent[0].querySelector('md-dialog'));
      expect(dialog.attr('aria-label')).toEqual('label');
    }));

    it('should apply aria-hidden to siblings', inject(function($mdDialog, $rootScope, $timeout) {

      var template = '<md-dialog aria-label="Some Other Thing">Hello</md-dialog>';
      var parent = angular.element('<div>');
      parent.append('<div class="sibling"></div>');

      $mdDialog.show({
        template: template,
        parent: parent
      });

      runAnimation();

      var dialog = angular.element(parent.find('md-dialog'));
      expect(dialog.attr('aria-hidden')).toBe(undefined);
      expect(dialog.parent().attr('aria-hidden')).toBe(undefined);

      var sibling = angular.element(parent[0].querySelector('.sibling'));
      expect(sibling.attr('aria-hidden')).toBe('true');
    }));

    it('should trap focus inside of the dialog', function() {
      var template = '<md-dialog>Hello <input></md-dialog>';
      var parent = document.createElement('div');

      // Append the parent to the DOM so that we can test focus behavior.
      document.body.appendChild(parent);

      $mdDialog.show({template: template, parent: parent});
      $rootScope.$apply();

      // It should add two focus traps to the document around the dialog content.
      var focusTraps = parent.querySelectorAll('.md-dialog-focus-trap');
      expect(focusTraps.length).toBe(2);

      var topTrap = focusTraps[0];
      var bottomTrap = focusTraps[1];

      var dialog = parent.querySelector('md-dialog');
      var isDialogFocused = false;
      dialog.addEventListener('focus', function() {
        isDialogFocused = true;
      });

      // Both of the focus traps should be in the normal tab order.
      expect(topTrap.tabIndex).toBe(0);
      expect(bottomTrap.tabIndex).toBe(0);

      // TODO(jelbourn): Find a way to test that focusing the traps redirects focus to the
      // md-dialog element. Firefox is problematic here, as calling element.focus() inside of
      // a focus event listener seems not to immediately update the document.activeElement.
      // This is a behavior better captured by an e2e test.

      $mdDialog.hide();
      runAnimation();

      // All of the focus traps should be removed when the dialog is closed.
      focusTraps = document.querySelectorAll('.md-dialog-focus-trap');
      expect(focusTraps.length).toBe(0);

      // Clean up our modifications to the DOM.
      document.body.removeChild(parent);
    });
  });

  function hasConfigurationMethods(preset, methods) {
    angular.forEach(methods, function(method) {
      return it('supports config method #' + method, inject(function($mdDialog) {
        var dialog = $mdDialog[preset]();
        expect(typeof dialog[method]).toBe('function');
        expect(dialog[method]()).toEqual(dialog);
      }));
    });
  }

  /**
   * Verifies that an element has the expected CSS for its transform property.
   * Works by creating a new element, setting the expected CSS on that
   * element, and comparing to the element being tested. This convoluted
   * approach is needed because if jQuery is installed it can rewrite
   * 'translate3d' values to equivalent 'matrix' values, for example turning
   * 'translate3d(240px, 120px, 0px) scale(0.5, 0.5)' into
   * 'matrix(0.5, 0, 0, 0.5, 240, 120)'.
   */
  var verifyTransformCss = function(element, transformAttr, expectedCss) {
    var testDiv = angular.element('<div>');
    testDiv.css(transformAttr, expectedCss);
    expect(element.css(transformAttr)).toBe(testDiv.css(transformAttr));
  };

});

describe('$mdDialog with custom interpolation symbols', function() {
  beforeEach(module('material.components.dialog'));

  beforeEach(module(function($interpolateProvider) {
    $interpolateProvider.startSymbol('[[').endSymbol(']]');
  }));

  it('displays #alert() correctly', inject(function($mdDialog, $rootScope) {
    var parent = angular.element('<div>');
    var dialog = $mdDialog.
      alert({parent: parent}).
      ariaLabel('test alert').
      title('Title').
      textContent('Hello, world !').
      ok('OK');

    $mdDialog.show(dialog);
    $rootScope.$digest();

    var mdContainer = angular.element(parent[0].querySelector('.md-dialog-container'));
    var mdDialog = mdContainer.find('md-dialog');
    var mdContent = mdDialog.find('md-dialog-content');
    var title = mdContent.find('h2');
    var contentBody = mdContent[0].querySelector('.md-dialog-content-body');
    var mdActions = angular.element(mdDialog[0].querySelector('md-dialog-actions'));
    var buttons = mdActions.find('md-button');

    expect(mdDialog.attr('aria-label')).toBe('test alert');
    expect(title.text()).toBe('Title');
    expect(contentBody.textContent).toBe('Hello, world !');
    expect(buttons.eq(0).text()).toBe('OK');
  }));

  it('displays #confirm() correctly', inject(function($mdDialog, $rootScope) {
    var parent = angular.element('<div>');
    var dialog = $mdDialog.
      confirm({parent: parent}).
      ariaLabel('test alert').
      title('Title').
      textContent('Hello, world !').
      cancel('CANCEL').
      ok('OK');

    $mdDialog.show(dialog);
    $rootScope.$digest();

    var mdContainer = angular.element(parent[0].querySelector('.md-dialog-container'));
    var mdDialog = mdContainer.find('md-dialog');
    var mdContent = mdDialog.find('md-dialog-content');
    var title = mdContent.find('h2');
    var contentBody = mdContent[0].querySelector('.md-dialog-content-body');
    var mdActions = angular.element(mdDialog[0].querySelector('md-dialog-actions'));
    var buttons = mdActions.find('md-button');

    expect(mdDialog.attr('aria-label')).toBe('test alert');
    expect(title.text()).toBe('Title');
    expect(contentBody.textContent).toBe('Hello, world !');
    expect(buttons.eq(0).text()).toBe('CANCEL');
    expect(buttons.eq(1).text()).toBe('OK');
  }));
});

describe('$mdDialog without ngSanitize loaded', function() {
  var $mdDialog, $rootScope;

  beforeEach(module('material.components.dialog'));

  beforeEach(inject(function($injector) {
    $mdDialog = $injector.get('$mdDialog');
    $rootScope = $injector.get('$rootScope');
  }));

  it('should throw an error when trying to use htmlContent', function() {
    var parent = angular.element('<div>');
    var dialog = $mdDialog.
      alert({parent: parent}).
      title('Title').
      htmlContent('Hello, world !').
      ok('OK');

    expect(function() {
      $mdDialog.show(dialog);
      $rootScope.$digest();
    }).toThrowError(/ngSanitize/);
  });
});
