
describe('material-slider', function() {

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

  beforeEach(module('material.components.slider','material.decorators'));

  it('should set model on press', inject(function($compile, $rootScope, $timeout) {
    var slider = $compile('<material-slider ng-model="value" min="0" max="100">')($rootScope);
    $rootScope.$apply('value = 50');
    var sliderCtrl = slider.controller('materialSlider');

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

  it('should increment model on right arrow', inject(function($compile, $rootScope, $timeout) {
    var slider = $compile(
      '<material-slider min="100" max="104" step="2" ng-model="model">'
    )($rootScope);

    $rootScope.$apply('model = 100');

    TestUtil.triggerEvent(slider, 'keydown', {
      keyCode: Constant.KEY_CODE.RIGHT_ARROW
    });
    $timeout.flush();
    expect($rootScope.model).toBe(102);

    TestUtil.triggerEvent(slider, 'keydown', {
      keyCode: Constant.KEY_CODE.RIGHT_ARROW
    });
    $timeout.flush();
    expect($rootScope.model).toBe(104);

    // Stays at max
    TestUtil.triggerEvent(slider, 'keydown', {
      keyCode: Constant.KEY_CODE.RIGHT_ARROW
    });
    $timeout.flush();
    expect($rootScope.model).toBe(104);
  }));

  it('should decrement model on left arrow', inject(function($compile, $rootScope, $timeout) {
    var slider = $compile(
      '<material-slider min="100" max="104" step="2" ng-model="model">'
    )($rootScope);

    $rootScope.$apply('model = 104');

    TestUtil.triggerEvent(slider, 'keydown', {
      keyCode: Constant.KEY_CODE.LEFT_ARROW
    });
    $timeout.flush();
    expect($rootScope.model).toBe(102);

    TestUtil.triggerEvent(slider, 'keydown', {
      keyCode: Constant.KEY_CODE.LEFT_ARROW
    });
    $timeout.flush();
    expect($rootScope.model).toBe(100);

    // Stays at min
    TestUtil.triggerEvent(slider, 'keydown', {
      keyCode: Constant.KEY_CODE.LEFT_ARROW
    });
    $timeout.flush();
    expect($rootScope.model).toBe(100);
  }));

});
