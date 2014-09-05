describe('$materialDialog', function() {
  
  beforeEach(module('material.components.dialog'));

  beforeEach(inject(function spyOnMaterialEffects($materialEffects) {
    spyOn($materialEffects, 'popIn').andCallFake(function(element, parent, targetEvent, cb) {
      parent.append(element);
      cb();
    });
    spyOn($materialEffects, 'popOut').andCallFake(function(element, parent, cb) {
      cb();
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

  it('should have valid ARIA attributes', inject(function($materialDialog, $rootScope) {
    var template = '<material-dialog>Hello</material-dialog>';
    var parent = angular.element('<div>');

    $materialDialog({
      template: template,
      appendTo: parent
    });

    $rootScope.$apply();

    var dialog = parent.find('material-dialog');
    expect(dialog.attr('role')).toBe('dialog');
    expect(dialog.attr('aria-label')).toEqual(dialog.text());
  }));

  it('should escapeToClose == true', inject(function($materialDialog, $rootScope, $rootElement, $timeout, $materialEffects) {
    var parent = angular.element('<div>');
    $materialDialog({
      template: '<material-dialog>',
      appendTo: parent,
      escapeToClose: true
    });

    $rootScope.$apply();
    expect(parent.find('material-dialog').length).toBe(1);

    TestUtil.triggerEvent($rootElement, 'keyup', { keyCode: Constant.KEY_CODE.ESCAPE });

    $timeout.flush();
    expect($materialEffects.popOut).toHaveBeenCalled();
    expect(parent.find('material-dialog').length).toBe(0);
  }));

  it('should escapeToClose == false', inject(function($materialDialog, $rootScope, $rootElement, $timeout, $materialEffects) {
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
    expect($materialEffects.popOut).not.toHaveBeenCalled();
    expect(parent.find('material-dialog').length).toBe(1);
  }));

  it('should clickOutsideToClose == true', inject(function($materialDialog, $rootScope, $timeout, $materialEffects) {

    var parent = angular.element('<div>');
    $materialDialog({
      template: '<material-dialog>',
      appendTo: parent,
      clickOutsideToClose: true
    });

    $rootScope.$apply();
    expect(parent.find('material-dialog').length).toBe(1);

    var container = parent.find('.material-dialog-container');
    TestUtil.triggerEvent(container, 'click', {
      target: container[0]
    });
    $timeout.flush();

    expect($materialEffects.popOut).toHaveBeenCalled();
    expect(parent.find('material-dialog').length).toBe(0);
  }));

  it('should clickOutsideToClose == false', inject(function($materialDialog, $rootScope, $timeout, $materialEffects) {

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

    expect($materialEffects.popOut).not.toHaveBeenCalled();
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

  it('should focus `material-button.dialog-close` on open', inject(function($materialDialog, $rootScope, $document) {
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

    expect($document.activeElement).toBe(parent.find('.dialog-close')[0]);
  }));

  it('should focus the last `material-button` in dialog-actions open if no `.dialog-close`', inject(function($materialDialog, $rootScope, $document) {
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
});
