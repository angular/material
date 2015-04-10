describe('$mdDialog', function() {

  beforeEach(module('material.components.dialog', 'ngAnimateMock'));

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
      container.find('md-dialog').triggerHandler('transitionend');
      $rootScope.$apply();

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
      dialog.triggerHandler('transitionend');
      expect(dialog.attr('role')).toBe('alertdialog');

      $rootScope.$apply();
      expect(parent.find('h2').length).toBe(0);
      expect(resolved).toBe(true);
    }));


    it('should focus `md-content` on open', inject(function($mdDialog, $rootScope, $document, $timeout, $mdConstant) {
      TestUtil.mockElementFocus(this);

      var parent = angular.element('<div>');

      $mdDialog.show(
        $mdDialog.alert({
          template:
            '<md-dialog>' +
              '<md-content tabIndex="0">' +
                '<p>Muppets are the best</p>' +
              '</md-content>' +
              '</md-dialog>',
          parent: parent
        })
      );

      $rootScope.$apply();
      $timeout.flush();

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));
      container.triggerHandler('transitionend');
      $rootScope.$apply();

      parent.find('md-dialog').triggerHandler('transitionend');
      $rootScope.$apply();

      expect($document.activeElement).toBe(parent[0].querySelector('md-content'));
    }));
  });

  describe('#confirm()', function() {
    hasConfigurationMethods('confirm', [
      'title', 'content', 'ariaLabel',
      'ok', 'cancel', 'targetEvent', 'theme'
    ]);

    it('shows a basic confirm dialog', inject(function($rootScope, $mdDialog, $animate, $mdConstant) {
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
      container.find('md-dialog').triggerHandler('transitionend');
      $rootScope.$apply();
      $animate.triggerCallbacks();

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
      dialog.triggerHandler('transitionend');
      expect(dialog.attr('role')).toBe('dialog');
      $rootScope.$digest();
      $animate.triggerCallbacks();

      expect(parent.find('h2').length).toBe(0);
      expect(rejected).toBe(true);
    }));

    it('should focus `md-button.dialog-close` on open', inject(function($mdDialog, $rootScope, $document, $timeout, $mdConstant) {
      TestUtil.mockElementFocus(this);

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
      $timeout.flush();

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));
      container.triggerHandler('transitionend');
      $rootScope.$apply();

      parent.find('md-dialog').triggerHandler('transitionend');
      $rootScope.$apply();

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
      parent.find('md-dialog').triggerHandler('transitionend');
      $rootScope.$apply();

      container = angular.element(parent[0].querySelector('.md-dialog-container'));
      expect(container.length).toBe(1);
      expect(ready).toBe( true );
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
      parent.find('md-dialog').triggerHandler('transitionend');
      $rootScope.$apply();

      expect(parent.find('md-dialog').length).toBe(1);

      $rootElement.triggerHandler({type: 'keyup',
        keyCode: $mdConstant.KEY_CODE.ESCAPE
      });

      $timeout.flush();
      parent.find('md-dialog').triggerHandler('transitionend');
      $rootScope.$apply();
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
      container.triggerHandler('transitionend');
      $rootScope.$apply();

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
      parent.find('md-dialog').triggerHandler('transitionend');
      $rootScope.$apply();

      expect(parent.find('md-dialog').length).toBe(1);

      container.triggerHandler({
        type: 'click',
        target: container[0]
      });
      $timeout.flush();
      parent.find('md-dialog').triggerHandler('transitionend');
      $rootScope.$apply();

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

    it('should disableParentScroll == true', inject(function($mdDialog, $animate, $rootScope) {
      var parent = angular.element('<div>');
      $mdDialog.show({
        template: '<md-dialog>',
        parent: parent,
        disableParentScroll: true
      });
      $rootScope.$apply();
      $animate.triggerCallbacks();
      $rootScope.$apply();
      expect(parent.css('overflow')).toBe('hidden');
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
      TestUtil.mockElementFocus(this);
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
      $timeout.flush();

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));
      container.triggerHandler('transitionend');
      $rootScope.$apply();
      parent.find('md-dialog').triggerHandler('transitionend');
      $rootScope.$apply();

      expect($document.activeElement).toBe(parent[0].querySelector('#focus-target'));
    }));

    it('should focusOnOpen == false', inject(function($mdDialog, $rootScope, $document, $timeout, $mdConstant) {
      TestUtil.mockElementFocus(this);

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
      container.triggerHandler('transitionend');
      $rootScope.$apply();
      parent.find('md-dialog').triggerHandler('transitionend');
      $rootScope.$apply();

      expect($document.activeElement).toBe(undefined);
    }));

    it('should focus the last `md-button` in md-actions open if no `.dialog-close`', inject(function($mdDialog, $rootScope, $document, $timeout, $mdConstant) {
      TestUtil.mockElementFocus(this);

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
      $timeout.flush();

      var container = angular.element(parent[0].querySelector('.md-dialog-container'));
      container.triggerHandler('transitionend');
      $rootScope.$apply();
      parent.find('md-dialog').triggerHandler('transitionend');
      $rootScope.$apply();

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
      $animate.triggerCallbacks();
      parent.find('md-dialog').triggerHandler('transitionend');
      $rootScope.$apply();
      $animate.triggerCallbacks();

      parent.find('md-dialog').triggerHandler('transitionend');
      $rootScope.$apply();
      $animate.triggerCallbacks();
      $rootScope.$apply();
      $animate.triggerCallbacks();
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

    it('should create an ARIA label if one is missing', inject(function($mdDialog, $rootScope) {
      var template = '<md-dialog>Hello</md-dialog>';
      var parent = angular.element('<div>');

      $mdDialog.show({
        template: template,
        parent: parent
      });

      $rootScope.$apply();
      angular.element(parent[0].querySelector('.md-dialog-container')).triggerHandler('transitionend');
      $rootScope.$apply();

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
      angular.element(parent[0].querySelector('.md-dialog-container')).triggerHandler('transitionend');
      $rootScope.$apply();

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
      $timeout.flush();

      parent.find('md-dialog').triggerHandler('transitionend');
      $rootScope.$apply();

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
});

describe('$mdDialog with custom interpolation symbols', function() {
  beforeEach(module('material.components.dialog', 'ngAnimateMock'));

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
    var mdContent = mdDialog.find('md-content');
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
    var mdContent = mdDialog.find('md-content');
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

