
describe('md-slider', function() {

  function simulateEventAt( centerX, eventType ) {
    return {
      eventType: eventType,
      center: { x: centerX },
      preventDefault: angular.noop,
      srcEvent : {
        stopPropagation : angular.noop
      }
    };
  }

  beforeEach(TestUtil.mockRaf);
  beforeEach(module('ngAria'));
  beforeEach(module('material.components.slider'));

  it('should set model on press', inject(function($compile, $rootScope, $timeout) {
    var slider = $compile('<md-slider ng-model="value" min="0" max="100">')($rootScope);
    $rootScope.$apply('value = 50');
    var sliderCtrl = slider.controller('mdSlider');

    spyOn(slider[0].querySelector('.md-track-container'), 'getBoundingClientRect').andReturn({
      width: 100,
      left: 0,
      right: 0
    });

    sliderCtrl._onInput( simulateEventAt( 30, Hammer.INPUT_START ));
    $timeout.flush();
    expect($rootScope.value).toBe(30);

    //When going past max, it should clamp to max
    sliderCtrl._onPan( simulateEventAt( 500 ));
    $timeout.flush();
    expect($rootScope.value).toBe(100);

    sliderCtrl._onPan( simulateEventAt( 50 ));
    $timeout.flush();
    expect($rootScope.value).toBe(50);
  }));

  it('should set model on drag', inject(function($compile, $rootScope, $timeout) {
    var slider = $compile('<md-slider ng-model="value" min="0" max="100" md-discrete>')($rootScope);
    $rootScope.$apply('value = 50');
    var sliderCtrl = slider.controller('mdSlider');

    spyOn(slider[0].querySelector('.md-track-container'), 'getBoundingClientRect').andReturn({
      width: 100,
      left: 0,
      right: 0
    });

    sliderCtrl._onInput( simulateEventAt( 30, Hammer.INPUT_START ));
    $timeout.flush();

    sliderCtrl._onPan( simulateEventAt( 80 ));
    expect(slider[0].querySelector('.md-thumb-text').textContent).toBe('80');
  }));

  it('should increment model on right arrow', inject(function($compile, $rootScope, $timeout, $mdConstant) {
    var slider = $compile(
      '<md-slider min="100" max="104" step="2" ng-model="model">'
    )($rootScope);

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
    var slider = $compile(
      '<md-slider min="100" max="104" step="2" ng-model="model">'
    )($rootScope);

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
    var slider = $compile('<md-slider ng-model="value" min="0" max="100">')($rootScope);
    var sliderCtrl = slider.controller('mdSlider');

    spyOn(slider[0].querySelector('.md-track-container'), 'getBoundingClientRect').andReturn({
      width: 100,
      left: 0,
      right: 0
    });

    sliderCtrl._onInput( simulateEventAt( 30, Hammer.INPUT_START ));
    $timeout.flush();
    expect(slider[0].querySelector('.md-thumb-text').textContent).toBe('30');

    slider.triggerHandler({
      type: 'keydown',
      keyCode: $mdConstant.KEY_CODE.LEFT_ARROW
    });
    $timeout.flush();
    expect(slider[0].querySelector('.md-thumb-text').textContent).toBe('29');

    sliderCtrl._onPan( simulateEventAt( 30 ));
    $timeout.flush();
    expect(slider[0].querySelector('.md-thumb-text').textContent).toBe('30');
  }));

  it('should update the thumb text with the model value when using ng-change', inject(function($compile, $rootScope, $timeout) {
    $scope = $rootScope.$new();

    $scope.stayAt50 = function () {
      $scope.value = 50;
    };

    var slider = $compile('<md-slider ng-model="value" min="0" max="100" ng-change="stayAt50()">')($scope);
    var sliderCtrl = slider.controller('mdSlider');

    spyOn(slider[0].querySelector('.md-track-container'), 'getBoundingClientRect').andReturn({
      width: 100,
      left: 0,
      right: 0
    });

    sliderCtrl._onInput( simulateEventAt( 30, Hammer.INPUT_START ));
    $timeout.flush();
    expect($scope.value).toBe(50);
    expect(slider[0].querySelector('.md-thumb-text').textContent).toBe('50');
  }));

  it('should call $log.warn if aria-label isnt provided', inject(function($compile, $rootScope, $timeout, $log) {
    spyOn($log, "warn");
    var element = $compile(
     '<md-slider min="100" max="104" step="2" ng-model="model"></md-slider>' 
    )($rootScope);
    expect($log.warn).toHaveBeenCalled();
  }));

  it('should not call $log.warn if aria-label is provided', inject(function($compile, $rootScope, $timeout, $log) {
    spyOn($log, "warn");
    var element = $compile(
     '<md-slider aria-label="banana" min="100" max="104" step="2" ng-model="model"></md-slider>' 
    )($rootScope);
    expect($log.warn).not.toHaveBeenCalled();
  }));

  it('should add aria attributes', inject(function($compile, $rootScope, $timeout, $mdConstant){
    var slider = $compile(
      '<md-slider min="100" max="104" step="2" ng-model="model">'
    )($rootScope);

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
});
