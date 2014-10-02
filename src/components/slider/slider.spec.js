
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
  beforeEach(module('material.components.slider','material.decorators'));

  it('should set model on press', inject(function($compile, $rootScope, $timeout) {
    var slider = $compile('<md-slider ng-model="value" min="0" max="100">')($rootScope);
    $rootScope.$apply('value = 50');
    var sliderCtrl = slider.controller('mdSlider');

    spyOn(slider.find('.slider-track-container')[0], 'getBoundingClientRect').andReturn({
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

  it('should increment model on right arrow', inject(function($compile, $rootScope, $timeout, $mdConstant) {
    var slider = $compile(
      '<md-slider min="100" max="104" step="2" ng-model="model">'
    )($rootScope);

    $rootScope.$apply('model = 100');

    TestUtil.triggerEvent(slider, 'keydown', {
      keyCode: $mdConstant.KEY_CODE.RIGHT_ARROW
    });
    $timeout.flush();
    expect($rootScope.model).toBe(102);

    TestUtil.triggerEvent(slider, 'keydown', {
      keyCode: $mdConstant.KEY_CODE.RIGHT_ARROW
    });
    $timeout.flush();
    expect($rootScope.model).toBe(104);

    // Stays at max
    TestUtil.triggerEvent(slider, 'keydown', {
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

    TestUtil.triggerEvent(slider, 'keydown', {
      keyCode: $mdConstant.KEY_CODE.LEFT_ARROW
    });
    $timeout.flush();
    expect($rootScope.model).toBe(102);

    TestUtil.triggerEvent(slider, 'keydown', {
      keyCode: $mdConstant.KEY_CODE.LEFT_ARROW
    });
    $timeout.flush();
    expect($rootScope.model).toBe(100);

    // Stays at min
    TestUtil.triggerEvent(slider, 'keydown', {
      keyCode: $mdConstant.KEY_CODE.LEFT_ARROW
    });
    $timeout.flush();
    expect($rootScope.model).toBe(100);
  }));

  it('should warn developers they need a label', inject(function($compile, $rootScope, $timeout, $log) {
    spyOn($log, "warn");

    var element = $compile(
      '<div>' +
       '<md-slider min="100" max="104" step="2" ng-model="model"></md-slider>' +
       '<md-slider min="0" max="100" ng-model="model2" aria-label="some label"></md-slider>' +
      '</div>'
    )($rootScope);

    var sliders = element.find('md-slider');
    expect($log.warn).toHaveBeenCalledWith(sliders[0]);
    expect($log.warn).not.toHaveBeenCalledWith(sliders[1]);
  }));
});
