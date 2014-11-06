describe('$mdDialog', function() {
  
  beforeEach(TestUtil.mockRaf);
  beforeEach(module('material.components.dialog', 'ngAnimateMock'));

  beforeEach(inject(function spyOnMdEffects($mdEffects, $$q, $animate) {
    spyOn($mdEffects, 'popIn').andCallFake(function(element, parent, targetEvent) {
      parent.append(element);
      return $$q.when();
    });
    spyOn($animate, 'leave').andCallFake(function(element) {
      element.remove();
      return $$q.when();
    });

    spyOn($animate, 'enter').andCallFake(function(element, parent) {
      parent.append(element);
      return $$q.when();
    });
  }));

  it('should support onComplete callbacks within `show()`', inject(function($mdDialog, $rootScope, $timeout) {

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

      expect( ready ).toBe( false );

    $timeout.flush();

    var container = angular.element(parent[0].querySelector('.md-dialog-container'));
    expect(container.length).toBe(1);
    expect( ready ).toBe( true );

  }));

  it('should append dialog with container', inject(function($mdDialog, $rootScope) {

    var template = '<md-dialog>Hello</md-dialog>';
    var parent = angular.element('<div>');

    $mdDialog.show({
      template: template,
      parent: parent
    });

    $rootScope.$apply();

    var container = angular.element(parent[0].querySelector('.md-dialog-container'));
    expect(container.length).toBe(1);
  }));

  it('should escapeToClose == true', inject(function($mdDialog, $rootScope, $rootElement, $timeout, $mdEffects, $animate, $mdConstant) {
    var parent = angular.element('<div>');
    $mdDialog.show({
      template: '<md-dialog>',
      parent: parent,
      escapeToClose: true
    });

    $rootScope.$apply();
    $timeout.flush();
    expect(parent.find('md-dialog').length).toBe(1);

    $rootElement.triggerHandler({
      type: 'keyup',
      keyCode: $mdConstant.KEY_CODE.ESCAPE 
    });

    $timeout.flush();
    expect(parent.find('md-dialog').length).toBe(0);
  }));

  it('should escapeToClose == false', inject(function($mdDialog, $rootScope, $rootElement, $timeout, $mdEffects, $animate, $mdConstant) {
    var parent = angular.element('<div>');
    $mdDialog.show({
      template: '<md-dialog>',
      parent: parent,
      escapeToClose: false
    });

    $rootScope.$apply();
    expect(parent.find('md-dialog').length).toBe(1);

    $rootElement.triggerHandler({
      type: 'keyup',
      keyCode: $mdConstant.KEY_CODE.ESCAPE 
    });

    $timeout.flush();
    $animate.triggerCallbacks();
    expect(parent.find('md-dialog').length).toBe(1);
  }));

  it('should clickOutsideToClose == true', inject(function($mdDialog, $rootScope, $timeout, $mdEffects, $animate) {

    var parent = angular.element('<div>');
    $mdDialog.show({
      template: '<md-dialog>',
      parent: parent,
      clickOutsideToClose: true
    });

    $rootScope.$apply();
    expect(parent.find('md-dialog').length).toBe(1);
    $timeout.flush();

    var container = angular.element(parent[0].querySelector('.md-dialog-container'));
    container.triggerHandler({
      type: 'click',
      target: container[0]
    });
    $timeout.flush();

    expect(parent.find('md-dialog').length).toBe(0);
  }));

  it('should clickOutsideToClose == false', inject(function($mdDialog, $rootScope, $timeout, $mdEffects, $animate) {

    var parent = angular.element('<div>');
    $mdDialog.show({
      template: '<md-dialog>',
      parent: parent,
      clickOutsideToClose: false
    });

    $rootScope.$apply();
    expect(parent.find('md-dialog').length).toBe(1);

    var container = angular.element(parent[0].querySelectorAll('.md-dialog-container'));
    container.triggerHandler({
      type: 'click',
      target: container[0]
    });
    $timeout.flush();
    $animate.triggerCallbacks();

    expect(parent.find('md-dialog').length).toBe(1);
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
    expect(parent.find('md-dialog').length).toBe(1);
    expect(parent.find('md-backdrop').length).toBe(0);
  }));

  it('should focus `md-button.dialog-close` on open', inject(function($mdDialog, $rootScope, $document, $timeout) {
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

    expect($document.activeElement).toBe(parent[0].querySelector('.dialog-close'));
  }));

  it('should focus the last `md-button` in md-actions open if no `.dialog-close`', inject(function($mdDialog, $rootScope, $document, $timeout) {
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

    expect($document.activeElement).toBe(parent[0].querySelector('#focus-target'));
  }));

  it('should only allow one open at a time', inject(function($mdDialog, $rootScope) {
    var parent = angular.element('<div>');
    $mdDialog.show({
      template: '<md-dialog class="one">',
      parent: parent
    });

    $rootScope.$apply();
    expect(angular.element(parent[0].querySelectorAll('md-dialog.one')).length).toBe(1);
    expect(angular.element(parent[0].querySelectorAll('md-dialog.two')).length).toBe(0);

    $mdDialog.show({
      template: '<md-dialog class="two">',
      parent: parent
    });

    $rootScope.$apply();
    expect(angular.element(parent[0].querySelectorAll('md-dialog.one')).length).toBe(0);
    expect(angular.element(parent[0].querySelectorAll('md-dialog.two')).length).toBe(1);
  }));

  it('should have the dialog role', inject(function($mdDialog, $rootScope) {
    var template = '<md-dialog>Hello</md-dialog>';
    var parent = angular.element('<div>');

    $mdDialog.show({
      template: template,
      parent: parent
    });

    $rootScope.$apply();

    var dialog = parent.find('md-dialog');
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

    var dialog = parent.find('md-dialog');
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

    var dialog = parent.find('md-dialog');
    expect(dialog.attr('aria-label')).not.toEqual(dialog.text());
    expect(dialog.attr('aria-label')).toEqual('Some Other Thing');
  }));
});
