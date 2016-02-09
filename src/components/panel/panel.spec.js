describe('$mdPanel', function() {
  var $mdPanel, $rootScope, $rootEl, $templateCache, $q;
  var panelRef;
  var attachedElements = [];

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
    var template = '<div id="panel">Hello World!</div>';
    var config = { template: template };

    panelRef = $mdPanel.open(config);
    $rootScope.$apply();

    expect('#panel').toExist();
    expect(panelRef.isOpen).toEqual(true);

    panelRef.close();
    $rootScope.$apply();

    expect('#panel').not.toExist();
    expect(panelRef.isOpen).toEqual(false);
  });

  it('should add and remove a panel from the DOM', function() {
    var template = '<div id="panel">Hello World!</div>';
    var config = { template: template };

    panelRef = $mdPanel.create(config);

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

    panelRef = $mdPanel.create(config);
    panelRef.open();
    $rootScope.$apply();

    var panelEl = document.querySelector('#panel');
    expect(panelEl.parentElement).toBe(parentEl);

    panelRef.close();
    $rootScope.$apply();

    expect(parentEl.childElementCount).toEqual(0);
  });

  describe('component logic: ', function() {
    it('should allow templateUrl to specify content', function() {
      var htmlContent = 'Puppies and Unicorns';
      var template = '<div id="panel">' + htmlContent + '</div>';
      $templateCache.put('template.html', template);

      var config = { templateUrl: 'template.html' };

      panelRef = $mdPanel.open(config);
      $rootScope.$apply();

      expect('#panel').toContainHtml(htmlContent);
    });

    it('should allow template to specify content', function() {
      var htmlContent = 'Ice cream';
      var template = '<div id="panel">' + htmlContent + '</div>';
      var config = { template: template };

      panelRef = $mdPanel.open(config);
      $rootScope.$apply();

      expect('#panel').toContainHtml(htmlContent);
    });

    it('should allow a controller to be specified', function() {
      var htmlContent = 'Cotton candy';
      var template = '<div id="panel">{{ content }}</div>';

      var config = {
        template: template,
        controller: function Ctrl($scope) {
          $scope['content'] = htmlContent;
        }
      };

      panelRef = $mdPanel.open(config);
      $rootScope.$apply();

      expect('#panel').toContainHtml(htmlContent);
    });

    it('should allow controllerAs syntax', function() {
      var htmlContent = 'Cupcakes';
      var template = '<div id="panel">{{ ctrl.content }}</div>';

      var config = {
        template: template,
        controller: function Ctrl() {
          this.content = htmlContent;
        },
        controllerAs: 'ctrl'
      };

      panelRef = $mdPanel.open(config);
      $rootScope.$apply();

      expect('#panel').toContainHtml(htmlContent);
    });

    it('should wait for resolve before creating the panel', function() {
      var htmlContent = 'Cheesecake';
      var template = '<div id="panel">{{ ctrl.content }}</div>';

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

      panelRef = $mdPanel.open(config);
      $rootScope.$apply();

      expect('#panel').not.toExist();

      deferred.resolve(htmlContent);
      $rootScope.$apply();

      expect('#panel').toExist();
      expect('#panel').toContainHtml(htmlContent);
    });

    it('should bind resolve to the controller', function() {
      var htmlContent = 'Gummy bears';
      var template = '<div id="panel">{{ ctrl.content }}</div>';

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

      panelRef = $mdPanel.open(config);
      $rootScope.$apply();

      expect('#panel').toContainHtml(htmlContent);
    });

    it('should allow locals to be injected in the controller', function() {
      var htmlContent = 'Tiramisu';
      var template = '<div id="panel">{{ ctrl.content }}</div>';

      var config = {
        template: template,
        controller: function Ctrl(content) {
          this.content = content;
        },
        controllerAs: 'ctrl',
        locals: { content: htmlContent },
        bindToController: false,
      };

      panelRef = $mdPanel.open(config);
      $rootScope.$apply();

      expect('#panel').toContainHtml(htmlContent);
    });

    it('should bind locals to the controller', function() {
      var htmlContent = 'Apple Pie';
      var template = '<div id="panel">{{ ctrl.content }}</div>';

      var config = {
        template: template,
        controller: function Ctrl() {
          this.content; // Populated via bindToController.
        },
        controllerAs: 'ctrl',
        locals: { content: htmlContent }
      };

      panelRef = $mdPanel.open(config);
      $rootScope.$apply();

      expect('#panel').toContainHtml(htmlContent);
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
});
