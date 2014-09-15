describe('$materialDialog', function() {
  
  beforeEach(module('material.components.dialog', 'ngAnimateMock'));

  beforeEach(inject(function spyOnMaterialEffects($materialEffects, $$q, $animate) {
    spyOn($materialEffects, 'popIn').andCallFake(function(element, parent, targetEvent) {
      parent.append(element);
      return $$q.when();
    });
    spyOn($animate, 'leave').andCallFake(function(element) {
      element.remove();
      return $$q.when();
    });
  }));

  it('should append dialog with container', inject(function($materialDialog, $rootScope) {

    var template = '<material-dialog>Hello</material-dialog>';
    var parent = angular.element('<div>');

    $materialDialog({
      template: template,
      appendTo: parent
    });

    $rootScope.$apply();

    var container = parent.find('.material-dialog-container');
    expect(container.length).toBe(1);
  }));

  it('should escapeToClose == true', inject(function($materialDialog, $rootScope, $rootElement, $timeout, $materialEffects, $animate) {
    var parent = angular.element('<div>');
    $materialDialog({
      template: '<material-dialog>',
      appendTo: parent,
      escapeToClose: true
    });

    $rootScope.$apply();
    $timeout.flush();
    expect(parent.find('material-dialog').length).toBe(1);

    TestUtil.triggerEvent($rootElement, 'keyup', {
      keyCode: Constant.KEY_CODE.ESCAPE 
    });

    $timeout.flush();
    expect(parent.find('material-dialog').length).toBe(0);
  }));

  it('should escapeToClose == false', inject(function($materialDialog, $rootScope, $rootElement, $timeout, $materialEffects, $animate) {
    var parent = angular.element('<div>');
    $materialDialog({
      template: '<material-dialog>',
      appendTo: parent,
      escapeToClose: false
    });

    $rootScope.$apply();
    expect(parent.find('material-dialog').length).toBe(1);

    TestUtil.triggerEvent($rootElement, 'keyup', { keyCode: Constant.KEY_CODE.ESCAPE });

    $timeout.flush();
    $animate.triggerCallbacks();
    expect(parent.find('material-dialog').length).toBe(1);
  }));

  it('should clickOutsideToClose == true', inject(function($materialDialog, $rootScope, $timeout, $materialEffects, $animate) {

    var parent = angular.element('<div>');
    $materialDialog({
      template: '<material-dialog>',
      appendTo: parent,
      clickOutsideToClose: true
    });

    $rootScope.$apply();
    expect(parent.find('material-dialog').length).toBe(1);
    $timeout.flush();

    var container = parent.find('.material-dialog-container');
    TestUtil.triggerEvent(container, 'click', {
      target: container[0]
    });
    $timeout.flush();

    expect(parent.find('material-dialog').length).toBe(0);
  }));

  it('should clickOutsideToClose == false', inject(function($materialDialog, $rootScope, $timeout, $materialEffects, $animate) {

    var parent = angular.element('<div>');
    $materialDialog({
      template: '<material-dialog>',
      appendTo: parent,
      clickOutsideToClose: false
    });

    $rootScope.$apply();
    expect(parent.find('material-dialog').length).toBe(1);

    var container = parent.find('.material-dialog-container');
    TestUtil.triggerEvent(container, 'click', {
      target: container[0]
    });
    $timeout.flush();
    $animate.triggerCallbacks();

    expect(parent.find('material-dialog').length).toBe(1);
  }));

  it('should hasBackdrop == true', inject(function($materialDialog, $rootScope) {
    var parent = angular.element('<div>');
    $materialDialog({
      template: '<material-dialog>',
      appendTo: parent,
      hasBackdrop: true
    });

    $rootScope.$apply();
    expect(parent.find('material-dialog').length).toBe(1);
    expect(parent.find('material-backdrop').length).toBe(1);
  }));

  it('should hasBackdrop == false', inject(function($materialDialog, $rootScope) {
    var parent = angular.element('<div>');
    $materialDialog({
      template: '<material-dialog>',
      appendTo: parent,
      hasBackdrop: false
    });

    $rootScope.$apply();
    expect(parent.find('material-dialog').length).toBe(1);
    expect(parent.find('material-backdrop').length).toBe(0);
  }));

  it('should focus `material-button.dialog-close` on open', inject(function($materialDialog, $rootScope, $document, $timeout) {
    TestUtil.mockElementFocus(this);

    var parent = angular.element('<div>');
    $materialDialog({
      template:
        '<material-dialog>' +
          '<div class="dialog-actions">' +
            '<button class="dialog-close">Close</button>' +
          '</div>' +
          '</material-dialog>',
      appendTo: parent
    });

    $rootScope.$apply();
    $timeout.flush();

    expect($document.activeElement).toBe(parent.find('.dialog-close')[0]);
  }));

  it('should focus the last `material-button` in dialog-actions open if no `.dialog-close`', inject(function($materialDialog, $rootScope, $document, $timeout) {
    TestUtil.mockElementFocus(this);

    var parent = angular.element('<div>');
    $materialDialog({
      template:
        '<material-dialog>' +
          '<div class="dialog-actions">' +
            '<button id="a">A</material-button>' +
            '<button id="focus-target">B</material-button>' +
          '</div>' +
        '</material-dialog>',
      appendTo: parent
    });

    $rootScope.$apply();
    $timeout.flush();

    expect($document.activeElement).toBe(parent.find('#focus-target')[0]);
  }));

  it('should only allow one open at a time', inject(function($materialDialog, $rootScope) {
    var parent = angular.element('<div>');
    $materialDialog({
      template: '<material-dialog class="one">',
      appendTo: parent
    });

    $rootScope.$apply();
    expect(parent.find('material-dialog.one').length).toBe(1);
    expect(parent.find('material-dialog.two').length).toBe(0);

    $materialDialog({
      template: '<material-dialog class="two">',
      appendTo: parent
    });

    $rootScope.$apply();
    expect(parent.find('material-dialog.one').length).toBe(0);
    expect(parent.find('material-dialog.two').length).toBe(1);
  }));

  it('should have the dialog role', inject(function($materialDialog, $rootScope) {
    var template = '<material-dialog>Hello</material-dialog>';
    var parent = angular.element('<div>');

    $materialDialog({
      template: template,
      appendTo: parent
    });

    $rootScope.$apply();

    var dialog = parent.find('material-dialog');
    expect(dialog.attr('role')).toBe('dialog');
  }));

  it('should create an ARIA label if one is missing', inject(function($materialDialog, $rootScope) {
    var template = '<material-dialog>Hello</material-dialog>';
    var parent = angular.element('<div>');

    $materialDialog({
      template: template,
      appendTo: parent
    });

    $rootScope.$apply();

    var dialog = parent.find('material-dialog');
    expect(dialog.attr('aria-label')).toEqual(dialog.text());
  }));

  it('should not modify an existing ARIA label', inject(function($materialDialog, $rootScope){
    var template = '<material-dialog aria-label="Some Other Thing">Hello</material-dialog>';
    var parent = angular.element('<div>');

    $materialDialog({
      template: template,
      appendTo: parent
    });

    $rootScope.$apply();

    var dialog = parent.find('material-dialog');
    expect(dialog.attr('aria-label')).not.toEqual(dialog.text());
    expect(dialog.attr('aria-label')).toEqual('Some Other Thing');
  }));
});
