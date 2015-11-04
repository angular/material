describe('<md-virtual-repeat>', function() {
  beforeEach(module('material.components.virtualRepeat'));

  var VirtualRepeatController = { NUM_EXTRA : 3 };

  var CONTAINER_HTML =
      '<md-virtual-repeat-container style="height:100px; width:150px">'+
      '</md-virtual-repeat-container>';
  var REPEATER_HTML = ''+
      '<div md-virtual-repeat="i in items" ' +
      '     md-item-size="10" ' +
      '     md-start-index="startIndex" ' +
      '     style="height: 10px; width: 10px; box-sizing: border-box;">' +
      '       {{i}} {{$index}}' +
      '</div>';
  var container, repeater, component, $$rAF, $compile, $document, $window, scope,
      scroller, sizer, offsetter;

  var NUM_ITEMS = 110,
      VERTICAL_PX = 100,
      HORIZONTAL_PX = 150,
      ITEM_SIZE = 10;

  beforeEach(inject(function(_$$rAF_, _$compile_, _$document_, $rootScope, _$window_, _$material_) {
    repeater = angular.element(REPEATER_HTML);
    container = angular.element(CONTAINER_HTML).append(repeater);
    component = null;
    $$rAF = _$$rAF_;
    $material = _$material_;
    $compile = _$compile_;
    $document = _$document_;
    $window = _$window_;
    scope = $rootScope.$new();
    scope.startIndex = 0;
    scroller = null;
    sizer = null;
    offsetter = null;
  }));

  afterEach(function() {
    container.remove();
    component && component.remove();
    scope.$destroy();
  });

  function createRepeater() {
    angular.element($document[0].body).append(container);

    component = $compile(container)(scope);

    scroller  = angular.element(component[0].querySelector('.md-virtual-repeat-scroller'));
    sizer     = angular.element(component[0].querySelector('.md-virtual-repeat-sizer'));
    offsetter = angular.element(component[0].querySelector('.md-virtual-repeat-offsetter'));

    $material.flushOutstandingAnimations();

    return component;
  }

  function createItems(num) {
    var items = [];

    for (var i = 0; i < num; i++) {
      items.push('s' + (i * 2) + 's');
    }

    return items;
  }

  function getRepeated() {
    return component[0].querySelectorAll('[md-virtual-repeat]');
  }

  it('should render only enough items to fill the viewport + 3 (vertical)', function() {
    createRepeater();
    scope.items = createItems(NUM_ITEMS);
    scope.$apply();
    $$rAF.flush();

    var numItemRenderers = VERTICAL_PX / ITEM_SIZE + VirtualRepeatController.NUM_EXTRA;

    expect(getRepeated().length).toBe(numItemRenderers);
    expect(sizer[0].offsetHeight).toBe(NUM_ITEMS * ITEM_SIZE);
  });

  it('should render only enough items to fill the viewport + 3 (horizontal)', function() {
    container.attr('md-orient-horizontal', '');
    createRepeater();
    scope.items = createItems(NUM_ITEMS);
    scope.$apply();
    $$rAF.flush();

    var numItemRenderers = HORIZONTAL_PX / ITEM_SIZE + VirtualRepeatController.NUM_EXTRA;

    expect(getRepeated().length).toBe(numItemRenderers);
    expect(sizer[0].offsetWidth).toBe(NUM_ITEMS * ITEM_SIZE);
  });

  it('should render only enough items to fill the viewport + 3 (vertical, no md-item-size)', function() {
    repeater.removeAttr('md-item-size');
    createRepeater();
    scope.items = createItems(NUM_ITEMS);
    $material.flushInterimElement();

    var numItemRenderers = VERTICAL_PX / ITEM_SIZE + VirtualRepeatController.NUM_EXTRA;

    expect(getRepeated().length).toBe(numItemRenderers);
    expect(sizer[0].offsetHeight).toBe(NUM_ITEMS * ITEM_SIZE);
  });

  it('should render only enough items to fill the viewport + 3 (horizontal, no md-item-size)', function() {

    container.attr('md-orient-horizontal', '');
    repeater.removeAttr('md-item-size');
    createRepeater();
    scope.items = createItems(NUM_ITEMS);
    scope.$digest();
    $$rAF.flush();
    $$rAF.flush();

    var numItemRenderers = HORIZONTAL_PX / ITEM_SIZE + VirtualRepeatController.NUM_EXTRA;

    expect(getRepeated().length).toBe(numItemRenderers);
    expect(sizer[0].offsetWidth).toBe(NUM_ITEMS * ITEM_SIZE);
  });

  it('should reposition and swap items on scroll (vertical)', function() {
    createRepeater();
    scope.items = createItems(NUM_ITEMS);
    scope.$apply();
    $$rAF.flush();

    var repeated;

    // Don't quite scroll past the first item.
    scroller[0].scrollTop = ITEM_SIZE - 1;
    scroller.triggerHandler('scroll');
    expect(getTransform(offsetter)).toBe('translateY(0px)');
    repeated = getRepeated();
    expect(repeated.length).toBe(VERTICAL_PX / ITEM_SIZE + VirtualRepeatController.NUM_EXTRA);
    expect(repeated[0].textContent.trim()).toBe('s0s 0');

    // Scroll past the first item.
    // Expect that one new item is created.
    scroller[0].scrollTop = ITEM_SIZE;
    scroller.triggerHandler('scroll');
    expect(getTransform(offsetter)).toBe('translateY(0px)');
    repeated = getRepeated();
    expect(repeated.length).toBe(VERTICAL_PX / ITEM_SIZE + VirtualRepeatController.NUM_EXTRA + 1);
    expect(repeated[0].textContent.trim()).toBe('s0s 0');

    // Scroll past the fourth item.
    // Expect that we now have the full set of extra items above and below.
    scroller[0].scrollTop = ITEM_SIZE * (VirtualRepeatController.NUM_EXTRA + 1);
    scroller.triggerHandler('scroll');
    expect(getTransform(offsetter)).toBe('translateY(10px)');
    repeated = getRepeated();
    expect(repeated.length).toBe(VERTICAL_PX / ITEM_SIZE + VirtualRepeatController.NUM_EXTRA * 2);
    expect(repeated[0].textContent.trim()).toBe('s2s 1');

    // Scroll to the end.
    // Expect the bottom extra items to be removed (pooled).
    scroller[0].scrollTop = 1000;
    scroller.triggerHandler('scroll');
    expect(getTransform(offsetter)).toBe('translateY(970px)');
    repeated = getRepeated();
    expect(repeated.length).toBe(VERTICAL_PX / ITEM_SIZE + VirtualRepeatController.NUM_EXTRA);
    expect(repeated[0].textContent.trim()).toBe('s194s 97');
  });

  it('should reposition and swap items on scroll (horizontal)', function() {
    container.attr('md-orient-horizontal', '');
    createRepeater();
    scope.items = createItems(NUM_ITEMS);
    scope.$apply();
    $$rAF.flush();

    var repeated;

    // Don't quite scroll past the first item.
    scroller[0].scrollLeft = ITEM_SIZE - 1;
    scroller.triggerHandler('scroll');
    expect(getTransform(offsetter)).toBe('translateX(0px)');
    repeated = getRepeated();
    expect(repeated.length).toBe(HORIZONTAL_PX / ITEM_SIZE + VirtualRepeatController.NUM_EXTRA);
    expect(repeated[0].textContent.trim()).toBe('s0s 0');

    // Scroll past the first item.
    // Expect that we now have the full set of extra items above and below.
    scroller[0].scrollLeft = ITEM_SIZE;
    scroller.triggerHandler('scroll');
    expect(getTransform(offsetter)).toBe('translateX(0px)');
    repeated = getRepeated();
    expect(repeated.length)
        .toBe(HORIZONTAL_PX / ITEM_SIZE + VirtualRepeatController.NUM_EXTRA + 1);
    expect(repeated[0].textContent.trim()).toBe('s0s 0');

    // Scroll past the fourth item.
    // Expect that one new item is created.
    scroller[0].scrollLeft = ITEM_SIZE * (VirtualRepeatController.NUM_EXTRA + 1);;
    scroller.triggerHandler('scroll');
    expect(getTransform(offsetter)).toBe('translateX(10px)');
    repeated = getRepeated();
    expect(repeated.length)
        .toBe(HORIZONTAL_PX / ITEM_SIZE + VirtualRepeatController.NUM_EXTRA * 2);
    expect(repeated[0].textContent.trim()).toBe('s2s 1');

    // Scroll to the end.
    // Expect the bottom extra items to be removed (pooled).
    scroller[0].scrollLeft = 950;
    scroller.triggerHandler('scroll');
    expect(getTransform(offsetter)).toBe('translateX(920px)');
    repeated = getRepeated();
    expect(repeated.length).toBe(HORIZONTAL_PX / ITEM_SIZE + VirtualRepeatController.NUM_EXTRA);
    expect(repeated[0].textContent.trim()).toBe('s184s 92');
  });

  it('should dirty-check only the swapped scope on scroll', function() {
    createRepeater();
    scope.items = createItems(NUM_ITEMS);
    scope.$apply();
    $$rAF.flush();
    scroller[0].scrollTop = 100;
    scroller.triggerHandler('scroll');

    var scopes = Array.prototype.map.call(getRepeated(), function(elem) {
      var s = angular.element(elem).scope();
      spyOn(s, '$digest').and.callThrough();
      return s;
    });

    // Scroll up by one.
    // Expect only the last (index 15) scope to have $digested.
    scroller[0].scrollTop = 90;
    scroller.triggerHandler('scroll');
    expect(scopes[15].$digest).toHaveBeenCalled();
    expect(scopes[14].$digest).not.toHaveBeenCalled();

    // Scroll down by two.
    // Expect only the first scope to have $digested.
    scroller[0].scrollTop = 110;
    scroller.triggerHandler('scroll');
    expect(scopes[0].$digest).toHaveBeenCalled();
    expect(scopes[1].$digest).not.toHaveBeenCalled();
  });

  it('should update when the watched array changes', function() {
    createRepeater();
    scope.items = createItems(NUM_ITEMS);
    scope.$apply();
    $$rAF.flush();
    scroller[0].scrollTop = 100;
    scroller.triggerHandler('scroll');

    scope.items = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
    scope.$apply();

    expect(scroller[0].scrollTop).toBe(0);
    expect(getRepeated()[0].textContent.trim()).toBe('a 0');
  });

  it('should cap individual element size for the sizer in large item sets', function() {
    // Copy max element size because we don't have a good way to reference it.
    var maxElementSize = 1533917;

    // Create a much larger number of items than will fit in one maximum element size.
    var numItems = 2000000;
    createRepeater();
    scope.items = createItems(numItems);
    scope.$apply();
    $$rAF.flush();

    // Expect that the sizer as a whole is still exactly the height it should be.
    expect(sizer[0].offsetHeight).toBe(numItems * ITEM_SIZE);

    // Expect that sizer only adds as many children as it needs to.
    var numChildren = sizer[0].childNodes.length;
    expect(numChildren).toBe(Math.ceil(numItems * ITEM_SIZE / maxElementSize));

    // Expect that every child of sizer does not exceed the maximum element size.
    for (var i = 0; i < numChildren; i++) {
      expect(sizer[0].childNodes[i].offsetHeight).toBeLessThan(maxElementSize + 1);
    }
  });

  it('should start at the given scroll position', function() {
    scope.startIndex = 10;
    scope.items = createItems(200);
    createRepeater();
    scope.$apply();
    $$rAF.flush();

    expect(scroller[0].scrollTop).toBe(10 * ITEM_SIZE);
  });

  it('should shrink the container when the number of items goes down (vertical)', function() {
    container.attr('md-auto-shrink', '');
    createRepeater();
    scope.items = createItems(NUM_ITEMS);
    scope.$apply();
    $$rAF.flush();

    expect(container[0].offsetHeight).toBe(100);

    // With 5 items...
    scope.items = createItems(5);
    scope.$apply();
    expect(container[0].offsetHeight).toBe(5 * ITEM_SIZE);

    // With 0 items...
    scope.items = [];
    scope.$apply();
    expect(container[0].offsetHeight).toBe(0);

    // With lots of items again...
    scope.items = createItems(NUM_ITEMS);
    scope.$apply();
    expect(container[0].offsetHeight).toBe(100);
  });

  it('should shrink the container when the number of items goes down (horizontal)', function() {
    container.attr({
      'md-auto-shrink': '',
      'md-orient-horizontal': ''
    });
    createRepeater();
    scope.items = createItems(NUM_ITEMS);
    scope.$apply();
    $$rAF.flush();

    expect(container[0].offsetWidth).toBe(150);

    // With 5 items...
    scope.items = createItems(5);
    scope.$apply();
    expect(container[0].offsetWidth).toBe(5 * ITEM_SIZE);

    // With 0 items...
    scope.items = [];
    scope.$apply();
    expect(container[0].offsetWidth).toBe(0);

    // With lots of items again...
    scope.items = createItems(NUM_ITEMS);
    scope.$apply();
    expect(container[0].offsetWidth).toBe(150);
  });

  it('should not shrink below the specified md-auto-shrink-min (vertical)', function() {
    container.attr({
      'md-auto-shrink': '',
      'md-auto-shrink-min': '2'
    });
    createRepeater();
    scope.items = createItems(NUM_ITEMS);
    scope.$apply();
    $$rAF.flush();

    expect(container[0].offsetHeight).toBe(100);

    // With 5 items...
    scope.items = createItems(5);
    scope.$apply();
    expect(container[0].offsetHeight).toBe(5 * ITEM_SIZE);

    // With 0 items...
    scope.items = [];
    scope.$apply();
    expect(container[0].offsetHeight).toBe(2 * ITEM_SIZE);
  });

  it('should not shrink below the specified md-auto-shrink-min (horizontal)', function() {
    container.attr({
      'md-auto-shrink': '',
      'md-auto-shrink-min': '2',
      'md-orient-horizontal': ''
    });
    createRepeater();
    scope.items = createItems(NUM_ITEMS);
    scope.$apply();
    $$rAF.flush();

    expect(container[0].offsetWidth).toBe(150);

    // With 5 items...
    scope.items = createItems(5);
    scope.$apply();
    expect(container[0].offsetWidth).toBe(5 * ITEM_SIZE);

    // With 0 items...
    scope.items = [];
    scope.$apply();
    expect(container[0].offsetWidth).toBe(2 * ITEM_SIZE);
  });

  it('should measure item size after data has loaded (no md-item-size)', function() {
    repeater.removeAttr('md-item-size');
    createRepeater();
    scope.$apply();
    $$rAF.flush();

    expect(getRepeated().length).toBe(0);

    scope.items = createItems(NUM_ITEMS);
    scope.$apply();
    $$rAF.flush();

    var numItemRenderers = VERTICAL_PX / ITEM_SIZE + VirtualRepeatController.NUM_EXTRA;
    expect(getRepeated().length).toBe(numItemRenderers);
  });

  it('should resize the scroller correctly when item length changes (vertical)', function() {
    scope.items = createItems(200);
    createRepeater();
    scope.$apply();
    $$rAF.flush();
    expect(sizer[0].offsetHeight).toBe(200 * ITEM_SIZE);

    // Scroll down half way
    scroller[0].scrollTop = 100 * ITEM_SIZE;
    scroller.triggerHandler('scroll');
    scope.$apply();
    $$rAF.flush();

    // Remove some items
    scope.items = createItems(20);
    scope.$apply();
    $$rAF.flush();
    expect(scroller[0].scrollTop).toBe(0);
    expect(sizer[0].offsetHeight).toBe(20 * ITEM_SIZE);

    // Scroll down half way
    scroller[0].scrollTop = 10 * ITEM_SIZE;
    scroller.triggerHandler('scroll');
    scope.$apply();
    $$rAF.flush();

    // Add more items
    scope.items = createItems(250);
    scope.$apply();
    $$rAF.flush();
    expect(scroller[0].scrollTop).toBe(100);
    expect(sizer[0].offsetHeight).toBe(250 * ITEM_SIZE);
  });

  it('should resize the scroller correctly when item length changes (horizontal)', function() {
    container.attr({'md-orient-horizontal': ''});
    scope.items = createItems(200);
    createRepeater();
    scope.$apply();
    $$rAF.flush();
    expect(sizer[0].offsetWidth).toBe(200 * ITEM_SIZE);

    // Scroll right half way
    scroller[0].scrollLeft = 100 * ITEM_SIZE;
    scroller.triggerHandler('scroll');
    scope.$apply();
    $$rAF.flush();

    // Remove some items
    scope.items = createItems(20);
    scope.$apply();
    $$rAF.flush();
    expect(scroller[0].scrollLeft).toBe(0);
    expect(sizer[0].offsetWidth).toBe(20 * ITEM_SIZE);

    // Scroll right half way
    scroller[0].scrollLeft = 10 * ITEM_SIZE;
    scroller.triggerHandler('scroll');
    scope.$apply();
    $$rAF.flush();

    // Add more items
    scope.items = createItems(250);
    scope.$apply();
    $$rAF.flush();
    expect(sizer[0].offsetWidth).toBe(250 * ITEM_SIZE);
  });

  it('should update topIndex when scrolling', function() {
    container.attr({'md-top-index': 'topIndex'});
    scope.items = createItems(NUM_ITEMS);
    createRepeater();

    scope.$apply();
    expect(scope.topIndex).toBe(0);

    scroller[0].scrollTop = ITEM_SIZE * 50;
    scroller.triggerHandler('scroll');
    scope.$apply();
    expect(scope.topIndex).toBe(50);

    scroller[0].scrollTop = 25 * ITEM_SIZE;
    scroller.triggerHandler('scroll');
    scope.$apply();
    expect(scope.topIndex).toBe(25);
  });

  it('should start at the given topIndex position', function() {
    container.attr({'md-top-index': 'topIndex'});
    repeater.removeAttr('md-start-index');
    scope.topIndex = 10;
    scope.items = createItems(200);
    createRepeater();
    scope.$apply();

    expect(scroller[0].scrollTop).toBe(10 * ITEM_SIZE);
  });

  it('should scroll when topIndex is updated', function() {
    container.attr({'md-top-index': 'topIndex'});
    scope.items = createItems(200);
    createRepeater();

    scope.topIndex = 50;
    scope.$apply();
    expect(scroller[0].scrollTop).toBe(50 * ITEM_SIZE);

    scope.topIndex = 25;
    scope.$apply();
    expect(scroller[0].scrollTop).toBe(25 * ITEM_SIZE);
  });

  it('should recheck container size on window resize', function() {
    scope.items = createItems(100);
    createRepeater();
    // Expect 13 children (10 + 3 extra).
    expect(offsetter.children().length).toBe(13);
    
    container.css('height', '400px');
    angular.element($window).triggerHandler('resize');

    // Expect 43 children (40 + 3 extra).
    expect(offsetter.children().length).toBe(43);
  });

  it('should recheck container size on $md-resize scope event', function() {
    scope.items = createItems(100);
    createRepeater();
    // Expect 13 children (10 + 3 extra).
    expect(offsetter.children().length).toBe(13);
    
    container.css('height', '400px');
    scope.$parent.$broadcast('$md-resize');

    // Expect 43 children (40 + 3 extra).
    expect(offsetter.children().length).toBe(43);
  });

  /**
   * Facade to access transform properly even when jQuery is used;
   * since jQuery's css function is obtaining the computed style (not wanted)
   */
  function getTransform(target) {
    return target[0].style.webkitTransform || target.css('transform');
  }


});
