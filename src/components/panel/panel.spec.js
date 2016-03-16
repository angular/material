describe('$mdPanel', function() {
  var $mdPanel, $rootScope, $rootEl, $templateCache, $q;
  var panelRef;
  var attachedElements = [];
  var PANEL_EL = '.md-panel-outer-wrapper';

  /**
   * @param {!angular.$injector} $injector
   * @ngInject
   */
  var injectLocals = function($injector) {
    $mdPanel = $injector.get('$mdPanel');
    $rootScope = $injector.get('$rootScope');
    $rootEl = $injector.get('$rootElement');
    $templateCache = $injector.get('$templateCache');
    $q = $injector.get('$q');
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

    panelRef && panelRef.close();
  });

  it('should create a basic panel', function() {
    var openResolved = false;
    var closeResolved = false;
    var config = {};

    panelRef = $mdPanel.create(config);

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

  it('should create and open a basic panel', function() {
    var template = '<div>Hello World!</div>';
    var config = { template: template };

    openPanel(config);

    expect(PANEL_EL).toExist();
    expect(panelRef.isOpen).toEqual(true);

    closePanel();

    expect(PANEL_EL).not.toExist();
    expect(panelRef.isOpen).toEqual(false);
  });

  it('should add and remove a panel from the DOM', function() {
    var template = '<div>Hello World!</div>';
    var config = { template: template };

    panelRef = $mdPanel.create(config);

    expect(PANEL_EL).not.toExist();

    openPanel();

    expect(PANEL_EL).toExist();

    closePanel();

    expect(PANEL_EL).not.toExist();
  });

  describe('config options:', function() {
    it('should attach panel to a specific element', function() {
      var parentEl = document.createElement('div');
      parentEl.id = 'parent';
      attachToBody(parentEl);

      var template = '<div>Hello World!</div>';
      var config = {
        attachTo: angular.element(parentEl),
        template: template
      };

      openPanel(config);

      var panelEl = document.querySelector(PANEL_EL);
      expect(panelEl.parentElement).toBe(parentEl);

      closePanel();

      expect(parentEl.childElementCount).toEqual(0);
    });
  });

  describe('component logic: ', function() {
    it('should allow templateUrl to specify content', function() {
      var htmlContent = 'Puppies and Unicorns';
      var template = '<div>' + htmlContent + '</div>';
      $templateCache.put('template.html', template);

      var config = { templateUrl: 'template.html' };

      openPanel(config);

      expect(PANEL_EL).toContainHtml(htmlContent);
    });

    it('should allow template to specify content', function() {
      var htmlContent = 'Ice cream';
      var template = '<div>' + htmlContent + '</div>';
      var config = { template: template };

      openPanel(config);

      expect(PANEL_EL).toContainHtml(htmlContent);
    });

    it('should allow a controller to be specified', function() {
      var htmlContent = 'Cotton candy';
      var template = '<div>{{ content }}</div>';

      var config = {
        template: template,
        controller: function Ctrl($scope) {
          $scope['content'] = htmlContent;
        }
      };

      openPanel(config);

      expect(PANEL_EL).toContainHtml(htmlContent);
    });

    it('should allow controllerAs syntax', function() {
      var htmlContent = 'Cupcakes';
      var template = '<div>{{ ctrl.content }}</div>';

      var config = {
        template: template,
        controller: function Ctrl() {
          this.content = htmlContent;
        },
        controllerAs: 'ctrl'
      };

      openPanel(config);

      expect(PANEL_EL).toContainHtml(htmlContent);
    });

    it('should wait for resolve before creating the panel', function() {
      var htmlContent = 'Cheesecake';
      var template = '<div>{{ ctrl.content }}</div>';

      var deferred = $q.defer();

      var config = {
        template: template,
        controller: function Ctrl(content) {
          this.content = content;
        },
        controllerAs: 'ctrl',
        resolve: {
          content: function() {
            return deferred.promise.then(function(content) {
              return content;
            });
          }
        }
      };

      openPanel(config);

      expect(PANEL_EL).not.toExist();

      deferred.resolve(htmlContent);
      $rootScope.$apply();

      expect(PANEL_EL).toExist();
      expect(PANEL_EL).toContainHtml(htmlContent);
    });

    it('should bind resolve to the controller', function() {
      var htmlContent = 'Gummy bears';
      var template = '<div>{{ ctrl.content }}</div>';

      var config = {
        template: template,
        controller: function Ctrl() {
          this.content; // Populated via bindToController.
        },
        controllerAs: 'ctrl',
        resolve: {
          content: function($q) {
            return $q.when(htmlContent);
          }
        }
      };

      openPanel(config);

      expect(PANEL_EL).toContainHtml(htmlContent);
    });

    it('should allow locals to be injected in the controller', function() {
      var htmlContent = 'Tiramisu';
      var template = '<div>{{ ctrl.content }}</div>';

      var config = {
        template: template,
        controller: function Ctrl(content) {
          this.content = content;
        },
        controllerAs: 'ctrl',
        locals: { content: htmlContent },
        bindToController: false,
      };

      openPanel(config);

      expect(PANEL_EL).toContainHtml(htmlContent);
    });

    it('should bind locals to the controller', function() {
      var htmlContent = 'Apple Pie';
      var template = '<div>{{ ctrl.content }}</div>';

      var config = {
        template: template,
        controller: function Ctrl() {
          this.content; // Populated via bindToController.
        },
        controllerAs: 'ctrl',
        locals: { content: htmlContent }
      };

      openPanel(config);

      expect(PANEL_EL).toContainHtml(htmlContent);
    });
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

  /**
   * Opens the panel. If a config value is passed, creates a new panelRef
   * using $mdPanel.open(config); Otherwise, called open on the panelRef,
   * assuming one has already been created.
   * @param {!Object=} opt_config
   */
  function openPanel(opt_config) {
    if (opt_config) {
      panelRef = $mdPanel.open(opt_config);
    } else {
      panelRef && panelRef.open();
    }
    $rootScope.$apply();
  }

  /**
   * Closes the panel using an already created panelRef.
   */
  function closePanel() {
    panelRef && panelRef.close();
    $rootScope.$apply();
  }
});
