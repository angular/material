describe('$mdTraversable', function() {
  var EVENT_DETAIL = 13;
  var TARGET = '_blank';
  var URL = 'https://google.com';

  var traversableService, proxyElement, dispatchedByIt;

  function logEvent(event) {
    dispatchedByIt = event.detail === EVENT_DETAIL;
  }

  function createMockEvent(detail) {
    return new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      detail: detail !== undefined ? detail : -1,
      view: window
    });
  }

  function preventDefault(event) {
    event.preventDefault();
  }

  beforeEach(module('material.core'));

  beforeEach(inject(function ($compile, $rootScope, $mdTraversable) {
    // Don’t actually navigate.
    proxyElement = document.getElementById('md-traversable-proxy');
    proxyElement.addEventListener('click', preventDefault, false);
    traversableService = $mdTraversable;
    dispatchedByIt = false;
  }));

  afterEach(function () {
    proxyElement.removeEventListener('click', preventDefault, false);
    proxyElement.removeEventListener('click', logEvent, false);
  });

  it('should append a hyperlink proxy element to the document body', function () {
    expect(proxyElement.nodeName.toLowerCase()).toBe('a');
  });

  it('should define a `traverse` method', function () {
    expect(traversableService.traverse).toEqual(jasmine.any(Function));
  });

  it('should set the hyperlink proxy href when `traverse` is called', function () {
    traversableService.traverse(createMockEvent(), URL);

    expect(angular.element(proxyElement).attr('href')).toBe(URL);
    expect(angular.element(proxyElement).attr('target')).toBeUndefined();
  });

  it('should set the hyperlink proxy target when `traverse` is called with a target', function () {
    traversableService.traverse(createMockEvent(), URL, TARGET);

    expect(angular.element(proxyElement).attr('target')).toBe(TARGET);
  });

  it('should dispatch an event to the proxy hyperlink element when `traverse` is called', function () {
    proxyElement.addEventListener('click', logEvent, false);

    traversableService.traverse(createMockEvent(EVENT_DETAIL), URL, TARGET);

    expect(dispatchedByIt).toBe(true);
  });

  describe('nested hyperlink', function () {
    var scope, element;
    var template =
      '<div href="https://google.com/" target="_blank">' +
        '<a href="http://arstechnica.com/" target="_blank">...</a>' +
      '</div>';

    beforeEach(inject(function ($compile, $rootScope) {
      scope = $rootScope.$new();
      element = $compile(template)(scope);
      angular.element(document.body).append(element);
    }));

    afterEach(function () {
      scope.$destroy();
      element.remove();
    });

    it('should be followed without triggering the parent hyperlink', inject(function () {
      var proxySpy = jasmine.createSpy('proxySpy');
      var childSpy = jasmine.createSpy('childSpy');
      var childElement = element.find('a');

      angular.element(proxyElement).on('click', proxySpy);
      childElement.on('click', childSpy);
      childElement.on('click', preventDefault);

      childElement[0].dispatchEvent(createMockEvent());

      expect(childSpy).toHaveBeenCalled();
      expect(proxySpy).not.toHaveBeenCalled();
    }));
  });
});
