describe('<md-virtual-repeat>', function() {
  beforeEach(module('ngMaterial-mock', 'material.components.virtualRepeat'));

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
  var container, repeater, component, $$rAF, $compile, $document, scope,
      scroller, sizer, offsetter;

  var NUM_ITEMS = 110,
      VERTICAL_PX = 100,
      HORIZONTAL_PX = 150,
      ITEM_SIZE = 10;

  beforeEach(inject(function(_$$rAF_, _$compile_, _$document_, $rootScope) {
    repeater = angular.element(REPEATER_HTML);
    container = angular.element(CONTAINER_HTML).append(repeater);
    component = null;
    $$rAF = _$$rAF_;
    $compile = _$compile_;
    $document = _$document_;
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

  /**
   * Facade to access transform properly even when jQuery is used;
   * since jQuery's css function is obtaining the computed style (not wanted)
   */
  function getTransform(target) {
    return target[0].style.webkitTransform || target.css('transform');
  }


});
