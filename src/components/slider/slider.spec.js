describe('md-slider', function() {
  var $compile, $timeout, $log, $mdConstant, pageScope;

  beforeEach(module('ngAria'));
  beforeEach(module('material.components.slider'));

  beforeEach(inject(function($injector) {
    var $rootScope = $injector.get('$rootScope');
    pageScope = $rootScope.$new();

    $compile = $injector.get('$compile');
    $timeout = $injector.get('$timeout');
    $mdConstant = $injector.get('$mdConstant');
    $log = $injector.get('$log');
  }));

  function setup(attrs, dimensions) {
    var slider;

    slider = $compile('<md-slider ' + (attrs || '') + '>')(pageScope);
    spyOn(
      slider[0].querySelector('.md-track-container'),
      'getBoundingClientRect'
    ).and.returnValue(angular.extend({
      width: 100,
      left: 0,
      right: 0
    }, dimensions || {}));

    return slider;
  }

  it('should not set model below the min', function() {
    var slider = setup('ng-model="value" min="0" max="100"');
    pageScope.$apply('value = -50');
    expect(slider.attr('aria-valuenow')).toEqual('0');
  });

  it('should not set model above the max', function() {
    var slider = setup('ng-model="value" min="0" max="100"');
    pageScope.$apply('value = 150');
    expect(slider.attr('aria-valuenow')).toEqual('100');
  });

  it('should set model on press', function() {
    var slider = setup('ng-model="value" min="0" max="100"');
    pageScope.$apply('value = 50');

    slider.triggerHandler({type: '$md.pressdown', pointer: { x: 30 }});
    slider.triggerHandler({type: '$md.dragstart', pointer: { x: 30 }});
    $timeout.flush();
    expect(pageScope.value).toBe(30);

    // When going past max, it should clamp to max.
    slider.triggerHandler({type: '$md.drag', pointer: { x: 150 }});
    $timeout.flush();
    expect(pageScope.value).toBe(100);

    slider.triggerHandler({type: '$md.drag', pointer: { x: 50 }});
    $timeout.flush();
    expect(pageScope.value).toBe(50);
  });

  it('should increment model on right arrow', function() {
    var slider = setup('min="100" max="104" step="2" ng-model="model"');
    pageScope.$apply('model = 100');

    slider.triggerHandler({
      type: 'keydown',
      keyCode: $mdConstant.KEY_CODE.RIGHT_ARROW
    });
    $timeout.flush();
    expect(pageScope.model).toBe(102);

    slider.triggerHandler({
      type: 'keydown',
      keyCode: $mdConstant.KEY_CODE.RIGHT_ARROW
    });
    $timeout.flush();
    expect(pageScope.model).toBe(104);

    // Stays at max.
    slider.triggerHandler({
      type: 'keydown',
      keyCode: $mdConstant.KEY_CODE.RIGHT_ARROW
    });
    $timeout.flush();
    expect(pageScope.model).toBe(104);
  });

  it('should decrement model on left arrow', function() {
    var slider = setup('min="100" max="104" step="2" ng-model="model"');
    pageScope.$apply('model = 104');

    slider.triggerHandler({
      type: 'keydown',
      keyCode: $mdConstant.KEY_CODE.LEFT_ARROW
    });
    $timeout.flush();
    expect(pageScope.model).toBe(102);

    slider.triggerHandler({
      type: 'keydown',
      keyCode: $mdConstant.KEY_CODE.LEFT_ARROW
    });
    $timeout.flush();
    expect(pageScope.model).toBe(100);

    // Stays at min.
    slider.triggerHandler({
      type: 'keydown',
      keyCode: $mdConstant.KEY_CODE.LEFT_ARROW
    });
    $timeout.flush();
    expect(pageScope.model).toBe(100);
  });

  it('should update the thumb text', function() {
    var slider = setup('ng-model="value" md-discrete min="0" max="100" step="1"');

    pageScope.$apply('value = 30');
    expect(slider[0].querySelector('.md-thumb-text').textContent).toBe('30');

    slider.triggerHandler({
      type: 'keydown',
      keyCode: $mdConstant.KEY_CODE.LEFT_ARROW
    });
    $timeout.flush();
    expect(slider[0].querySelector('.md-thumb-text').textContent).toBe('29');

    slider.triggerHandler({type: '$md.pressdown', pointer: { x: 30 }});
    expect(slider[0].querySelector('.md-thumb-text').textContent).toBe('30');

    slider.triggerHandler({type: '$md.dragstart', pointer: { x: 31 }});
    slider.triggerHandler({type: '$md.drag', pointer: { x: 31 }});
    expect(slider[0].querySelector('.md-thumb-text').textContent).toBe('31');
  });

  it('should update the thumb text with the model value when using ng-change', function() {
    pageScope.stayAt50 = function () {
      pageScope.value = 50;
    };

    var slider = setup('ng-model="value" min="0" max="100" ng-change="stayAt50()"');

    slider.triggerHandler({type: '$md.pressdown', pointer: { x: 30 }});
    $timeout.flush();
    expect(pageScope.value).toBe(50);
    expect(slider[0].querySelector('.md-thumb-text').textContent).toBe('50');
  });

  it('should call $log.warn if aria-label isn\'t provided', function() {
    spyOn($log, "warn");
    setup('min="100" max="104" step="2" ng-model="model"');
    expect($log.warn).toHaveBeenCalled();
  });

  it('should not call $log.warn if aria-label is provided', function() {
    spyOn($log, "warn");
    setup('aria-label="banana" min="100" max="104" step="2" ng-model="model"');
    expect($log.warn).not.toHaveBeenCalled();
  });

  it('should add aria attributes', function() {
    var slider = setup('min="100" max="104" step="2" ng-model="model"');

    pageScope.$apply('model = 102');

    expect(slider.attr('role')).toEqual('slider');
    expect(slider.attr('aria-valuemin')).toEqual('100');
    expect(slider.attr('aria-valuemax')).toEqual('104');
    expect(slider.attr('aria-valuenow')).toEqual('102');

    slider.triggerHandler({
      type: 'keydown',
      keyCode: $mdConstant.KEY_CODE.LEFT_ARROW
    });
    $timeout.flush();
    expect(slider.attr('aria-valuenow')).toEqual('100');
  });

  it('should ignore pressdown events when disabled', function() {
    pageScope.isDisabled = true;
    var slider = setup('ng-disabled="isDisabled"');

    // Doesn't add active class on pressdown when disabled
    slider.triggerHandler({
      type: '$md.pressdown',
      pointer: {}
    });
    expect(slider).not.toHaveClass('md-active');

    // Doesn't remove active class up on pressup when disabled
    slider.addClass('md-active');
    slider.triggerHandler({
      type: '$md.pressup',
      pointer: {}
    });
    expect(slider).toHaveClass('md-active');
  });

  it('should disable via the `disabled` attribute', function() {
    var slider = setup('disabled');

    // Check for disabled state by triggering the pressdown handler and asserting that
    // the slider is not active.
    slider.triggerHandler({
      type: '$md.pressdown',
      pointer: {}
    });
    expect(slider).not.toHaveClass('md-active');
  });

  it('should add active class on pressdown and remove on pressup', function() {
    var slider = setup();

    expect(slider).not.toHaveClass('md-active');

    slider.triggerHandler({
      type: '$md.pressdown',
      pointer: {}
    });
    expect(slider).toHaveClass('md-active');

    slider.triggerHandler({
      type: '$md.pressup',
      pointer: {}
    });
    expect(slider).not.toHaveClass('md-active');
  });

  it('should add md-min class only when at min value', function() {
    var slider = setup('ng-model="model" min="0" max="30"');
    pageScope.$apply('model = 0');
    expect(slider).toHaveClass('md-min');

    slider.triggerHandler({type: '$md.dragstart', pointer: {x: 0}});
    slider.triggerHandler({type: '$md.drag', pointer: {x: 10}});
    $timeout.flush();
    expect(slider).not.toHaveClass('md-min');
  });

  it('should add md-max class only when at max value', function() {
    var slider = setup('ng-model="model" min="0" max="30"');
    pageScope.$apply('model = 30');
    expect(slider).toHaveClass('md-max');

    slider.triggerHandler({type: '$md.dragstart', pointer: {x: 30}});
    slider.triggerHandler({type: '$md.drag', pointer: {x: 10}});
    $timeout.flush();
    expect(slider).not.toHaveClass('md-max');
  });

  it('should increment at a predictable step', function() {

    buildSlider(0.1, 0, 1).drag({x:70});
    expect(pageScope.value).toBe(0.7);

    buildSlider(0.25, 0, 1).drag({x:45});
    expect(pageScope.value).toBe(0.5);

    buildSlider(0.25, 0, 1).drag({x:35});
    expect(pageScope.value).toBe(0.25);

    buildSlider(1, 0, 100).drag({x:90});
    expect(pageScope.value).toBe(90);

    buildSlider(20, 5, 45).drag({x:50});
    expect(pageScope.value).toBe(25);

    function buildSlider(step, min, max) {
      var slider = setup('ng-model="value" min="' + min + '" max="' + max + '" step="' + step + '"');
          pageScope.$apply('value = 0.5');

      return {
        drag : function simulateDrag(drag) {

          slider.triggerHandler({type: '$md.pressdown', pointer: drag });
          slider.triggerHandler({type: '$md.dragstart', pointer: drag });

          $timeout.flush();
        }
      };
    }

  });

  it('should set a default tabindex', function() {
    var slider = setup();
    expect(slider.attr('tabindex')).toBe('0');
  });

  it('should not overwrite tabindex attribute', function() {
    var slider = setup('tabindex="2"');
    expect(slider.attr('tabindex')).toBe('2');
  });

});
