describe('$mdPanel', function() {
  var $mdPanel, $rootScope, $rootEl;
  var attachedElements = [];

  /**
   * @param {!angular.$injector} $injector
   * @ngInject
   */
  var injectLocals = function($injector) {
    $mdPanel = $injector.get('$mdPanel');
    $rootScope = $injector.get('$rootScope');
    $rootEl = $injector.get('$rootElement');
  };

  beforeEach(function() {
    module('material.components.panel', 'ngSanitize');

    inject(injectLocals);

    // By default, the panel is attached to $rootElement, so add it to the DOM.
    attachToBody($rootEl);
  });

  afterEach(function() {
    attachedElements.forEach(function(el) {
      el.remove();
    });
    attachedElements = [];
  });

  it('should create a basic panel', function() {
    var openResolved = false;
    var closeResolved = false;
    var config = {};

    var panelRef = $mdPanel.create(config);

    expect(panelRef.id).toBeDefined();
    expect(panelRef.open).toBeOfType('function');
    expect(panelRef.close).toBeOfType('function');
    expect(panelRef.isOpen).toEqual(false);

    panelRef.open().then(function() {
      openResolved = true;
    });
    $rootScope.$apply();

    expect(openResolved).toBe(true);
    expect(panelRef.isOpen).toEqual(true);

    panelRef.close().then(function() {
      closeResolved = true;
    });
    $rootScope.$apply();

    expect(closeResolved).toBe(true);
    expect(panelRef.isOpen).toEqual(false);
  });

  it('should add and remove a panel from the DOM', function() {
    var template = '<div id="panel">Hello World!</div>';
    var config = { template: template };

    var panelRef = $mdPanel.create(config);

    expect('#panel').not.toExist();

    panelRef.open();
    $rootScope.$apply();

    expect('#panel').toExist();

    panelRef.close();
    $rootScope.$apply();

    expect('#panel').not.toExist();
  });

  it('should attach panel to a specific element', function() {
    var parentEl = document.createElement('div');
    parentEl.id = 'parent';
    attachToBody(parentEl);

    var template = '<div id="panel">Hello World!</div>';
    var config = {
      attachTo: angular.element(parentEl),
      template: template
    };

    var panelRef = $mdPanel.create(config);
    panelRef.open();
    $rootScope.$apply();

    var panelEl = document.querySelector('#panel');
    expect(panelEl.parentElement).toBe(parentEl);

    panelRef.close();
    $rootScope.$apply();

    expect(parentEl.childElementCount).toEqual(0);
  });

  /**
   * Attached an element to document.body. Keeps track of attached elements
   * so that they can be removed in an afterEach.
   * @param el
   */
  function attachToBody(el) {
    var element = angular.element(el);
    angular.element(document.body).append(element);
    attachedElements.push(element);
  }
});
