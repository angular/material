describe('$mdDialog', function() {
  var triggerTransitionEnd;

  beforeEach(module('material.components.dialog'));
  beforeEach(inject(function spyOnMdEffects($$q, $animate) {

    spyOn($animate, 'leave').and.callFake(function(element) {
      element.remove();
      return $$q.when();
    });
    spyOn($animate, 'enter').and.callFake(function(element, parent) {
      parent.append(element);
      return $$q.when();
    });
  }));
  beforeEach(inject(function($mdConstant, $rootScope, $animate, $timeout){
    triggerTransitionEnd = function(element, applyFlush) {
      // Defaults to 'true'... must explicitly set 'false'
      if (angular.isUndefined(applyFlush)) applyFlush = true;

      $mdConstant.CSS.TRANSITIONEND.split(" ")
                     .forEach(function(eventType){
                        element.triggerHandler(eventType);
                     });

      $rootScope.$apply();

      applyFlush && $animate.triggerCallbacks();
      applyFlush && $timeout.flush();
    }
  }));

  describe('#alert()', function() {
    hasConfigurationMethods('alert', [
      'title', 'content', 'ariaLabel',
      'ok', 'targetEvent', 'theme'
    ]);

    it('shows a basic alert dialog', inject(function($animate, $rootScope, $mdDialog, $mdConstant) {
      var parent = angular.element('<div>');
      var resolved = false;
      $mdDialog.show(
        $mdDialog
          .alert()
          .parent( parent )
          .title('Title')
          .content('Hello world')
          .theme('some-theme')
          .ok('Next')
      ).then(function() {
        resolved = true;
      });
      $rootScope.$apply();
      $animate.triggerCallbacks();

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));
      triggerTransitionEnd( container.find('md-dialog') );

      var title = angular.element(parent[0].querySelector('h2'));
      expect(title.text()).toBe('Title');

      var content = parent.find('p');
      expect(content.text()).toBe('Hello world');

      var buttons = parent.find('md-button');
      expect(buttons.length).toBe(1);
      expect(buttons.eq(0).text()).toBe('Next');

      var theme = parent.find('md-dialog').attr('md-theme');
      expect(theme).toBe('some-theme');

      buttons.eq(0).triggerHandler('click');
      $rootScope.$apply();

      var dialog = parent.find('md-dialog');
      triggerTransitionEnd( dialog );
      expect(dialog.attr('role')).toBe('alertdialog');

      $rootScope.$apply();
      expect(parent.find('h2').length).toBe(0);
      expect(resolved).toBe(true);
    }));


    it('should focus `md-dialog-content` on open', inject(function($mdDialog, $rootScope, $document) {
      jasmine.mockElementFocus(this);

      var parent = angular.element('<div>');

      $mdDialog.show(
        $mdDialog.alert({
          template:
            '<md-dialog>' +
              '<md-dialog-content tabIndex="0">' +
                '<p>Muppets are the best</p>' +
              '</md-dialog-content>' +
              '</md-dialog>',
          parent: parent
        })
      );

      $rootScope.$apply();
      triggerTransitionEnd( parent.find('md-dialog') );

      expect($document.activeElement).toBe(parent[0].querySelector('md-dialog-content'));
    }));
  });

  describe('#confirm()', function() {
    hasConfigurationMethods('confirm', [
      'title', 'content', 'ariaLabel',
      'ok', 'cancel', 'targetEvent', 'theme'
    ]);

    it('shows a basic confirm dialog', inject(function($rootScope, $mdDialog, $animate) {
      var parent = angular.element('<div>');
      var rejected = false;
      $mdDialog.show(
        $mdDialog.confirm({
          parent: parent
        })
          .title('Title')
          .content('Hello world')
          .ok('Next')
          .cancel('Forget it')
      ).catch(function() {
        rejected = true;
      });

      $rootScope.$apply();
      $animate.triggerCallbacks();

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));
      triggerTransitionEnd( container.find('md-dialog') );

      var title = parent.find('h2');
      expect(title.text()).toBe('Title');

      var content = parent.find('p');
      expect(content.text()).toBe('Hello world');

      var buttons = parent.find('md-button');
      expect(buttons.length).toBe(2);
      expect(buttons.eq(0).text()).toBe('Next');
      expect(buttons.eq(1).text()).toBe('Forget it');

      buttons.eq(1).triggerHandler('click');
      $rootScope.$digest();
      $animate.triggerCallbacks();

      var dialog = parent.find('md-dialog');
      triggerTransitionEnd( dialog );
      expect(dialog.attr('role')).toBe('dialog');

      expect(parent.find('h2').length).toBe(0);
      expect(rejected).toBe(true);
    }));

    it('should focus `md-button.dialog-close` on open', inject(function($mdDialog, $rootScope, $document, $timeout, $mdConstant) {
      jasmine.mockElementFocus(this);

      var parent = angular.element('<div>');
      $mdDialog.show({
        template:
          '<md-dialog>' +
            '<div class="md-actions">' +
              '<button class="dialog-close">Close</button>' +
            '</div>' +
            '</md-dialog>',
        parent: parent
      });

      $rootScope.$apply();
      triggerTransitionEnd( parent.find('md-dialog') );

      expect($document.activeElement).toBe(parent[0].querySelector('.dialog-close'));
    }));
  });

  describe('#build()', function() {
    it('should support onComplete callbacks within `show()`', inject(function($mdDialog, $rootScope, $timeout, $mdConstant) {

      var template = '<md-dialog>Hello</md-dialog>';
      var parent = angular.element('<div>');
      var ready = false;

      $mdDialog.show({
        template: template,
        parent: parent,
        onComplete: function(scope, element, options) {
          expect( arguments.length ).toEqual( 3 );
          ready = true;
        }
      });
      $rootScope.$apply();

      expect(ready).toBe( false );

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));
      triggerTransitionEnd( parent.find('md-dialog') );

      container = angular.element(parent[0].querySelector('.md-dialog-container'));
      expect(container.length).toBe(1);
      expect(ready).toBe( true );
    }));

    it('should support onRemoving callbacks when `hide()` starts', inject(function($mdDialog, $rootScope, $timeout, $mdConstant ) {

      var template = '<md-dialog>Hello</md-dialog>';
      var parent = angular.element('<div>');
      var closing = false;

      $mdDialog.show({
        template: template,
        parent: parent,
        escapeToClose: true,
        onRemoving: function(scope, element) {
          expect( arguments.length ).toEqual( 2 );
          closing = true;
        }
      });
      $rootScope.$apply();
      expect(closing).toBe( false );

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));
      triggerTransitionEnd( parent.find('md-dialog') );

       parent.triggerHandler({type: 'keyup',
         keyCode: $mdConstant.KEY_CODE.ESCAPE
       });
       $timeout.flush();

       expect(closing).toBe( true );

    }));


    it('should append dialog with container', inject(function($mdDialog, $rootScope) {

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
        template: '<md-dialog>',
        parent: parent,
        escapeToClose: true
      });
      $rootScope.$apply();

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));
      triggerTransitionEnd( parent.find('md-dialog') );

      expect(parent.find('md-dialog').length).toBe(1);

      parent.triggerHandler({type: 'keyup',
        keyCode: $mdConstant.KEY_CODE.ESCAPE
      });
      $timeout.flush();
      triggerTransitionEnd( parent.find('md-dialog') );

      expect(parent.find('md-dialog').length).toBe(0);
    }));

    it('should escapeToClose == false', inject(function($mdDialog, $rootScope, $rootElement, $timeout, $animate, $mdConstant) {
      var parent = angular.element('<div>');
      $mdDialog.show({
        template: '<md-dialog>',
        parent: parent,
        escapeToClose: false
      });
      $rootScope.$apply();

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));
      triggerTransitionEnd( container );
      expect(parent.find('md-dialog').length).toBe(1);

      $rootElement.triggerHandler({ type: 'keyup', keyCode: $mdConstant.KEY_CODE.ESCAPE });

      $timeout.flush();
      $animate.triggerCallbacks();
      expect(parent.find('md-dialog').length).toBe(1);
    }));

    it('should clickOutsideToClose == true', inject(function($mdDialog, $rootScope, $timeout, $animate, $mdConstant) {

      var parent = angular.element('<div>');
      $mdDialog.show({
        template: '<md-dialog>',
        parent: parent,
        clickOutsideToClose: true
      });
      $rootScope.$apply();

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));
      triggerTransitionEnd( parent.find('md-dialog') );
      expect(parent.find('md-dialog').length).toBe(1);

      container.triggerHandler({
        type: 'click',
        target: container[0]
      });
      $timeout.flush();
      triggerTransitionEnd( parent.find('md-dialog') );
      expect(parent.find('md-dialog').length).toBe(0);
    }));

    it('should clickOutsideToClose == false', inject(function($mdDialog, $rootScope, $timeout, $animate) {

      var parent = angular.element('<div>');
      $mdDialog.show({
        template: '<md-dialog>',
        parent: parent,
        clickOutsideToClose: false
      });

      $rootScope.$apply();
      expect(parent.find('md-dialog').length).toBe(1);

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));

      container.triggerHandler('click');
      $timeout.flush();
      $animate.triggerCallbacks();

      expect(parent[0].querySelectorAll('md-dialog').length).toBe(1);
    }));

    it('should disableParentScroll == true', inject(function($mdDialog, $animate, $rootScope, $mdUtil) {
      spyOn($mdUtil, 'disableScrollAround');
      var parent = angular.element('<div>');
      $mdDialog.show({
        template: '<md-dialog>',
        parent: parent,
        disableParentScroll: true
      });
      $rootScope.$apply();
      $animate.triggerCallbacks();
      $rootScope.$apply();
      expect($mdUtil.disableScrollAround).toHaveBeenCalled();
    }));

    it('should hasBackdrop == true', inject(function($mdDialog, $animate, $rootScope) {
      var parent = angular.element('<div>');
      $mdDialog.show({
        template: '<md-dialog>',
        parent: parent,
        hasBackdrop: true
      });

      $rootScope.$apply();
      $animate.triggerCallbacks();
      $rootScope.$apply();
      expect(parent.find('md-dialog').length).toBe(1);
      expect(parent.find('md-backdrop').length).toBe(1);
    }));

    it('should hasBackdrop == false', inject(function($mdDialog, $rootScope) {
      var parent = angular.element('<div>');
      $mdDialog.show({
        template: '<md-dialog>',
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
            '<div class="md-actions">' +
              '<button id="a">A</md-button>' +
              '<button id="focus-target">B</md-button>' +
            '</div>' +
          '</md-dialog>'
      });

      $rootScope.$apply();
      triggerTransitionEnd( parent.find('md-dialog') );

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
            '<div class="md-actions">' +
              '<button id="a">A</md-button>' +
              '<button id="focus-target">B</md-button>' +
            '</div>' +
          '</md-dialog>',
      });

      $rootScope.$apply();
      $timeout.flush();

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));
      triggerTransitionEnd( container );
      triggerTransitionEnd( parent.find('md-dialog') );

      expect($document.activeElement).toBe(undefined);
    }));

    it('should expand from and shrink to targetEvent element', inject(function($mdDialog, $rootScope, $timeout, $mdConstant) {
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

      triggerTransitionEnd( dialog, false );

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
      $timeout.flush();

      verifyTransformCss(dialog, $mdConstant.CSS.TRANSFORM,
          'translate3d(240px, 120px, 0px) scale(0.5, 0.5)');
    }));

    it('should shrink to updated targetEvent element location', inject(function($mdDialog, $rootScope, $timeout, $mdConstant) {
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

      triggerTransitionEnd( dialog, false );

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

    it('should shrink to original targetEvent element location if element is hidden', inject(function($mdDialog, $rootScope, $timeout, $mdConstant) {
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

      triggerTransitionEnd( dialog, false );

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

    it('should focus the last `md-button` in md-actions open if no `.dialog-close`', inject(function($mdDialog, $rootScope, $document, $timeout, $mdConstant) {
      jasmine.mockElementFocus(this);

      var parent = angular.element('<div>');
      $mdDialog.show({
        template:
          '<md-dialog>' +
            '<div class="md-actions">' +
              '<button id="a">A</md-button>' +
              '<button id="focus-target">B</md-button>' +
            '</div>' +
          '</md-dialog>',
        parent: parent
      });

      $rootScope.$apply();
      triggerTransitionEnd( parent.find('md-dialog') );

      expect($document.activeElement).toBe(parent[0].querySelector('#focus-target'));
    }));

    it('should only allow one open at a time', inject(function($mdDialog, $rootScope, $animate) {
      var parent = angular.element('<div>');
      $mdDialog.show({
        template: '<md-dialog class="one">',
        parent: parent
      });
      $rootScope.$apply();
      $animate.triggerCallbacks();

      expect(parent[0].querySelectorAll('md-dialog.one').length).toBe(1);
      expect(parent[0].querySelectorAll('md-dialog.two').length).toBe(0);

      $mdDialog.show({
        template: '<md-dialog class="two">',
        parent: parent
      });
      $rootScope.$apply();
      triggerTransitionEnd(parent.find('md-dialog'), false );

      triggerTransitionEnd( parent.find('md-dialog') );
      expect(parent[0].querySelectorAll('md-dialog.one').length).toBe(0);
      expect(parent[0].querySelectorAll('md-dialog.two').length).toBe(1);
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

      $rootScope.$apply();
      triggerTransitionEnd( angular.element(parent[0].querySelector('.md-dialog-container')) );
      $$rAF.flush();

      var dialog = angular.element(parent[0].querySelector('md-dialog'));
      expect(dialog.attr('aria-label')).toEqual(dialog.text());
    }));

    it('should not modify an existing ARIA label', inject(function($mdDialog, $rootScope){
      var template = '<md-dialog aria-label="Some Other Thing">Hello</md-dialog>';
      var parent = angular.element('<div>');

      $mdDialog.show({
        template: template,
        parent: parent
      });

      $rootScope.$apply();

      var dialog = angular.element(parent[0].querySelector('md-dialog'));
      expect(dialog.attr('aria-label')).not.toEqual(dialog.text());
      expect(dialog.attr('aria-label')).toEqual('Some Other Thing');
    }));

    it('should add an ARIA label if supplied through chaining', inject(function($mdDialog, $rootScope, $animate){
      var parent = angular.element('<div>');

      $mdDialog.show(
        $mdDialog.alert({
          parent: parent
        })
        .ariaLabel('label')
      );

      $rootScope.$apply();
      triggerTransitionEnd( angular.element(parent[0].querySelector('.md-dialog-container')) );

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

      $rootScope.$apply();
      triggerTransitionEnd( parent.find('md-dialog')  );

      var dialog = angular.element(parent.find('md-dialog'));
      expect(dialog.attr('aria-hidden')).toBe(undefined);
      expect(dialog.parent().attr('aria-hidden')).toBe(undefined);

      var sibling = angular.element(parent[0].querySelector('.sibling'));
      expect(sibling.attr('aria-hidden')).toBe('true');
    }));
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
        content('Hello, world !').
        ok('OK');

    $mdDialog.show(dialog);
    $rootScope.$digest();

    var mdContainer = angular.element(parent[0].querySelector('.md-dialog-container'));
    var mdDialog = mdContainer.find('md-dialog');
    var mdContent = mdDialog.find('md-dialog-content');
    var title = mdContent.find('h2');
    var content = mdContent.find('p');
    var mdActions = angular.element(mdDialog[0].querySelector('.md-actions'));
    var buttons = mdActions.find('md-button');

    expect(mdDialog.attr('aria-label')).toBe('test alert');
    expect(title.text()).toBe('Title');
    expect(content.text()).toBe('Hello, world !');
    expect(buttons.eq(0).text()).toBe('OK');
  }));

  it('displays #confirm() correctly', inject(function($mdDialog, $rootScope) {
    var parent = angular.element('<div>');
    var dialog = $mdDialog.
        confirm({parent: parent}).
        ariaLabel('test alert').
        title('Title').
        content('Hello, world !').
        cancel('CANCEL').
        ok('OK');

    $mdDialog.show(dialog);
    $rootScope.$digest();

    var mdContainer = angular.element(parent[0].querySelector('.md-dialog-container'));
    var mdDialog = mdContainer.find('md-dialog');
    var mdContent = mdDialog.find('md-dialog-content');
    var title = mdContent.find('h2');
    var content = mdContent.find('p');
    var mdActions = angular.element(mdDialog[0].querySelector('.md-actions'));
    var buttons = mdActions.find('md-button');

    expect(mdDialog.attr('aria-label')).toBe('test alert');
    expect(title.text()).toBe('Title');
    expect(content.text()).toBe('Hello, world !');
    expect(buttons.eq(0).text()).toBe('CANCEL');
    expect(buttons.eq(1).text()).toBe('OK');
  }));
});

