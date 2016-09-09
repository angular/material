describe('$mdSticky service', function() {

  var $mdSticky, $timeout, $rootScope, $compile = null;
  var parent, element = null;

  beforeEach(module('material.components.sticky', function($provide) {
    $provide.decorator('$mdUtil', function($delegate) {

      // We always return nothing on the checkStickySupport method to test the polyfill.
      $delegate.checkStickySupport = angular.noop;

      return $delegate;
    })
  }));

  beforeEach(inject(function($injector) {
    $mdSticky = $injector.get('$mdSticky');
    $timeout = $injector.get('$timeout');
    $rootScope = $injector.get('$rootScope');
    $compile = $injector.get('$compile');
  }));

  afterEach(function() {
    parent && parent.remove();
  });

  describe('with service', function() {

    it('should create a offset element with the height of the sticky element', function() {
      createBasicElement('<div style="height: 20px">Sticky</div>');

      $mdSticky(element);

      // When the sticky element turns into a fixed position, a offset element will be added.
      var offsetElement = parent.children().eq(0);

      expect(element.css('position')).toBe('fixed');
      expect(offsetElement.css('height')).toBe('20px');
    });

    it('should limit the max width for the fixed sticky element', function() {
      createBasicElement('<div>Sticky</div>');

      $mdSticky(element);

      var scrollRect = parent[0].getBoundingClientRect();

      expect(element.css('position')).toBe('fixed');
      expect(element.css('max-width')).toBe(scrollRect.width + 'px');
    });

    it('should properly set position for hidden sticky elements', function() {
      var elements = createSectionElements('<div>Sticky</div>', '<div style="height: 200px">', 2);

      // Make elements inside of the sections sticky
      elements.forEach($mdSticky);

      expect(elements[0].css('position')).toBe('fixed');
      expect(elements[1].css('position')).toBe('');
    });

    it('should update the position when scrolling', function() {
      var elements = createSectionElements('<div>Sticky</div>', '<div style="height: 200px">', 2);

      // Emulate scrolling for the parent and only one section fits into the viewport.
      parent.css({
        height: '200px',
        overflowY: 'scroll'
      });

      // Make elements inside of the sections sticky
      elements.forEach($mdSticky);

      expect(elements[0].css('position')).toBe('fixed');
      expect(elements[1].css('position')).toBe('');

      parent[0].scrollTop = 200;
      parent.triggerHandler('scroll');

      expect(elements[0].css('position')).toBe('');
      expect(elements[1].css('position')).toBe('fixed');

      parent[0].scrollTop = 0;
      parent.triggerHandler('scroll');

      expect(elements[0].css('position')).toBe('fixed');
      expect(elements[1].css('position')).toBe('');
    });

    it('should leave the sticky element at the bottom when scrolling down', function() {
      var elements = createSectionElements(
        '<div style="height: 20px">Sticky</div>',
        '<div style="height: 200px">',
        2
      );

      console.log(parent[0].outerHTML);

      // Emulate scrolling for the parent and only one section fits into the viewport.
      parent.css({
        height: '200px',
        overflowY: 'scroll'
      });

      // Make elements inside of the sections sticky
      elements.forEach($mdSticky);

      expect(elements[0].css('position')).toBe('fixed');
      expect(elements[1].css('position')).toBe('');

      // Second hidden sticky element should align at the start.
      expect(getTopOffset(elements[1])).toBe(0);

      parent[0].scrollTop = 200;
      parent.triggerHandler('scroll');

      expect(elements[0].css('position')).toBe('');
      expect(elements[1].css('position')).toBe('fixed');

      // First hidden sticky element should align at the end.
      expect(getTopOffset(elements[0])).toBe(180);

      parent[0].scrollTop = 0;
      parent.triggerHandler('scroll');

      expect(elements[0].css('position')).toBe('fixed');
      expect(elements[1].css('position')).toBe('');

      // Second hidden sticky element should align at the start.
      console.log(elements[1].css('transform'));
      expect(getTopOffset(elements[1])).toBe(0);
    });

    it('should update the elements to a static position when being partly visible', function() {
      var elements = createSectionElements(
        '<div style="height: 20px">Sticky</div>',
        '<div style="height: 200px">',
        2
      );

      // Emulate scrolling for the parent and only one section fits into the viewport.
      parent.css({
        height: '200px',
        overflowY: 'scroll'
      });

      // Make elements inside of the sections sticky
      elements.forEach($mdSticky);

      parent[0].scrollTop = 190;
      parent.triggerHandler('scroll');

      expect(elements[0].css('position')).toBe('');
      expect(elements[1].css('position')).toBe('');

      // The first should align at the end and the second at the beginning.
      expect(getTopOffset(elements[0])).toBe(180);
      expect(getTopOffset(elements[1])).toBe(0);

      parent[0].scrollTop = 200;
      parent.triggerHandler('scroll');

      expect(elements[0].css('position')).toBe('');
      expect(elements[1].css('position')).toBe('fixed');

      // The first should align at the end and the second at the beginning.
      expect(getTopOffset(elements[0])).toBe(180);
      expect(getTopOffset(elements[1])).toBe(0);
    });

    it('should update the sticky element position when being partly visible at init', function() {
      var elements = createSectionElements(
        '<div style="height: 20px">Sticky</div>',
        '<div style="height: 200px">',
        2
      );

      // Emulate scrolling for the parent and only one section fits into the viewport.
      parent.css({
        height: '200px',
        overflowY: 'scroll'
      });

      // Set the scroll position to partly show the first sticky element.
      parent[0].scrollTop = 190;
      parent.triggerHandler('scroll');

      // Make elements inside of the sections sticky
      elements.forEach($mdSticky);

      console.log(parent[0]);

      expect(elements[0].css('position')).toBe('');
      expect(elements[1].css('position')).toBe('');

      // The first should align at the end and the second at the beginning.
      expect(getTopOffset(elements[0])).toBe(180);
      expect(getTopOffset(elements[1])).toBe(0);

      parent[0].scrollTop = 200;
      parent.triggerHandler('scroll');

      expect(elements[0].css('position')).toBe('');
      expect(elements[1].css('position')).toBe('fixed');

      // The first should align at the end and the second at the beginning.
      expect(getTopOffset(elements[0])).toBe(180);
      expect(getTopOffset(elements[1])).toBe(0);
    });

  });

  function createBasicElement(template) {
    parent = angular.element('<div>');
    element = $compile(template)($rootScope);

    parent.append(element);
    document.body.appendChild(parent[0]);

    return element;
  }

  function createSectionElements(stickyTemplate, sectionTemplate, amount) {
    parent = angular.element('<div>');

    var stickyElements = [];

    for (var i = 0; i < amount; i++) {
      var section = $compile(sectionTemplate)($rootScope);
      var element = $compile(stickyTemplate)($rootScope);

      stickyElements.push(element);
      section.append(element);
      parent.append(section);
    }

    document.body.appendChild(parent[0]);

    return stickyElements;
  }

  function getTopOffset(element) {
    var parentRect = element[0].parentNode.getBoundingClientRect();
    var elementTop = element[0].getBoundingClientRect().top;

    return elementTop - parentRect.top;
  }

});