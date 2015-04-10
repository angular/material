describe('md-slider', function() {

  beforeEach(module('ngAria'));
  beforeEach(module('material.components.slider'));

  function setup(attrs, dimensions) {
    var slider;
    inject(function($compile, $rootScope) { 
      slider = $compile('<md-slider ' + (attrs || '') + '>')($rootScope);
      spyOn(
        slider[0].querySelector('.md-track-container'), 
        'getBoundingClientRect'
      ).and.returnValue(angular.extend({
        width: 100,
        left: 0,
        right: 0
      }, dimensions || {}));
    });
    return slider;
  }

  it('should set model on press', inject(function($compile, $rootScope, $timeout) {
    var slider = setup('ng-model="value" min="0" max="100"');
    $rootScope.$apply('value = 50');

    slider.triggerHandler({type: '$md.pressdown', pointer: { x: 30 }});
    slider.triggerHandler({type: '$md.dragstart', pointer: { x: 30 } });
    $timeout.flush();
    expect($rootScope.value).toBe(30);

    //When going past max, it should clamp to max
    slider.triggerHandler({type: '$md.drag', pointer: { x: 150 } });
    $timeout.flush();
    expect($rootScope.value).toBe(100);

    slider.triggerHandler({type: '$md.drag', pointer: { x: 50 }});
    $timeout.flush();
    expect($rootScope.value).toBe(50);
  }));

  it('should increment model on right arrow', inject(function($compile, $rootScope, $timeout, $mdConstant) {
    var slider = setup('min="100" max="104" step="2" ng-model="model"');
    $rootScope.$apply('model = 100');

    slider.triggerHandler({
      type: 'keydown',
      keyCode: $mdConstant.KEY_CODE.RIGHT_ARROW
    });
    $timeout.flush();
    expect($rootScope.model).toBe(102);

    slider.triggerHandler({
      type: 'keydown',
      keyCode: $mdConstant.KEY_CODE.RIGHT_ARROW
    });
    $timeout.flush();
    expect($rootScope.model).toBe(104);

    // Stays at max
    slider.triggerHandler({
      type: 'keydown',
      keyCode: $mdConstant.KEY_CODE.RIGHT_ARROW
    });
    $timeout.flush();
    expect($rootScope.model).toBe(104);
  }));

  it('should decrement model on left arrow', inject(function($compile, $rootScope, $timeout, $mdConstant) {
    var slider = setup('min="100" max="104" step="2" ng-model="model"');
    $rootScope.$apply('model = 104');

    slider.triggerHandler({
      type: 'keydown',
      keyCode: $mdConstant.KEY_CODE.LEFT_ARROW
    });
    $timeout.flush();
    expect($rootScope.model).toBe(102);

    slider.triggerHandler({
      type: 'keydown',
      keyCode: $mdConstant.KEY_CODE.LEFT_ARROW
    });
    $timeout.flush();
    expect($rootScope.model).toBe(100);

    // Stays at min
    slider.triggerHandler({
      type: 'keydown',
      keyCode: $mdConstant.KEY_CODE.LEFT_ARROW
    });
    $timeout.flush();
    expect($rootScope.model).toBe(100);
  }));

  it('should update the thumb text', inject(function($compile, $rootScope, $timeout, $mdConstant) {
    var slider = setup('ng-model="value" md-discrete min="0" max="100" step="1"');

    $rootScope.$apply('value = 30');
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
  }));

  it('should update the thumb text with the model value when using ng-change', inject(function($compile, $rootScope, $timeout) {
    $rootScope.stayAt50 = function () {
      $rootScope.value = 50;
    };

    var slider = setup('ng-model="value" min="0" max="100" ng-change="stayAt50()"');
    var sliderCtrl = slider.controller('mdSlider');

    slider.triggerHandler({type: '$md.pressdown', pointer: { x: 30 }});
    $timeout.flush();
    expect($rootScope.value).toBe(50);
    expect(slider[0].querySelector('.md-thumb-text').textContent).toBe('50');
  }));

  it('should call $log.warn if aria-label isnt provided', inject(function($compile, $rootScope, $timeout, $log) {
    spyOn($log, "warn");
    var element = setup('min="100" max="104" step="2" ng-model="model"');
    expect($log.warn).toHaveBeenCalled();
  }));

  it('should not call $log.warn if aria-label is provided', inject(function($compile, $rootScope, $timeout, $log) {
    spyOn($log, "warn");
    var element = setup('aria-label="banana" min="100" max="104" step="2" ng-model="model"');
    expect($log.warn).not.toHaveBeenCalled();
  }));

  it('should add aria attributes', inject(function($compile, $rootScope, $timeout, $mdConstant){
    var slider = setup('min="100" max="104" step="2" ng-model="model"');

    $rootScope.$apply('model = 102');

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
  }));

  it('should ignore pressdown events when disabled', inject(function($compile, $rootScope, $timeout) {
    $rootScope.isDisabled = true;
    var slider = setup('ng-disabled="isDisabled"');

    // Doesn't add active class on pressdown when disabled
    slider.triggerHandler({
      type: '$md.pressdown',
      pointer: {}
    });
    expect(slider).not.toHaveClass('active');

    // Doesn't remove active class up on pressup when disabled
    slider.addClass('active');
    slider.triggerHandler({
      type: '$md.pressup',
      pointer: {}
    });
    expect(slider).toHaveClass('active');
  }));

  it('should add active class on pressdown and remove on pressup', inject(function($rootScope) {
    var slider = setup();

    expect(slider).not.toHaveClass('active');

    slider.triggerHandler({
      type: '$md.pressdown',
      pointer: {}
    });
    expect(slider).toHaveClass('active');

    slider.triggerHandler({
      type: '$md.pressup',
      pointer: {}
    });
    expect(slider).not.toHaveClass('active');
  }));

});
