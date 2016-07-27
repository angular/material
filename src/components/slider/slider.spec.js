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
      height: 100,
      left: 0,
      right: 0,
      bottom: 0,
      top: 0
    }, dimensions || {}));

    return slider;
  }

  function setupContainer(attrs, sliderAttrs) {
    return $compile('<md-slider-container ' + (attrs || '') + '>' +
      '<md-slider ' + (sliderAttrs || '') + '></md-slider>' +
      '</md-slider-container>')(pageScope);
  }

  function getWrapper(slider) {
    return angular.element(slider[0].querySelector('.md-slider-wrapper'));
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

    var wrapper = getWrapper(slider);

    wrapper.triggerHandler({type: '$md.pressdown', pointer: { x: 30 }});
    wrapper.triggerHandler({type: '$md.dragstart', pointer: { x: 30 }});
    $timeout.flush();
    expect(pageScope.value).toBe(30);

    // When going past max, it should clamp to max.
    wrapper.triggerHandler({type: '$md.drag', pointer: { x: 150 }});
    $timeout.flush();
    expect(pageScope.value).toBe(100);

    wrapper.triggerHandler({type: '$md.drag', pointer: { x: 50 }});
    $timeout.flush();
    expect(pageScope.value).toBe(50);
  });

  it('should increment model on right arrow', function() {
    var slider = setup('min="100" max="104" step="2" ng-model="model"');
    pageScope.$apply('model = 100');

    var wrapper = getWrapper(slider);

    wrapper.triggerHandler({
      type: 'keydown',
      keyCode: $mdConstant.KEY_CODE.RIGHT_ARROW
    });
    $timeout.flush();
    expect(pageScope.model).toBe(102);

    wrapper.triggerHandler({
      type: 'keydown',
      keyCode: $mdConstant.KEY_CODE.RIGHT_ARROW
    });
    $timeout.flush();
    expect(pageScope.model).toBe(104);

    // Stays at max.
    wrapper.triggerHandler({
      type: 'keydown',
      keyCode: $mdConstant.KEY_CODE.RIGHT_ARROW
    });
    $timeout.flush();
    expect(pageScope.model).toBe(104);
  });

  it('should decrement model on left arrow', function() {
    var slider = setup('min="100" max="104" step="2" ng-model="model"');
    pageScope.$apply('model = 104');

    var wrapper = getWrapper(slider);

    wrapper.triggerHandler({
      type: 'keydown',
      keyCode: $mdConstant.KEY_CODE.LEFT_ARROW
    });
    $timeout.flush();
    expect(pageScope.model).toBe(102);

    wrapper.triggerHandler({
      type: 'keydown',
      keyCode: $mdConstant.KEY_CODE.LEFT_ARROW
    });
    $timeout.flush();
    expect(pageScope.model).toBe(100);

    // Stays at min.
    wrapper.triggerHandler({
      type: 'keydown',
      keyCode: $mdConstant.KEY_CODE.LEFT_ARROW
    });
    $timeout.flush();
    expect(pageScope.model).toBe(100);
  });

  it('should update the thumb text', function() {
    var slider = setup('ng-model="value" md-discrete min="0" max="100" step="1"');
    var wrapper = getWrapper(slider);

    pageScope.$apply('value = 30');
    expect(slider[0].querySelector('.md-thumb-text').textContent).toBe('30');

    wrapper.triggerHandler({
      type: 'keydown',
      keyCode: $mdConstant.KEY_CODE.LEFT_ARROW
    });
    $timeout.flush();
    expect(slider[0].querySelector('.md-thumb-text').textContent).toBe('29');

    wrapper.triggerHandler({type: '$md.pressdown', pointer: { x: 30 }});
    expect(slider[0].querySelector('.md-thumb-text').textContent).toBe('30');

    wrapper.triggerHandler({type: '$md.dragstart', pointer: { x: 31 }});
    wrapper.triggerHandler({type: '$md.drag', pointer: { x: 31 }});
    expect(slider[0].querySelector('.md-thumb-text').textContent).toBe('31');
  });

  it('should update the thumb text with the model value when using ng-change', function() {
    pageScope.stayAt50 = function () {
      pageScope.value = 50;
    };

    var slider = setup('ng-model="value" min="0" max="100" ng-change="stayAt50()"');
    var wrapper = getWrapper(slider);

    wrapper.triggerHandler({type: '$md.pressdown', pointer: { x: 30 }});
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
    var wrapper = getWrapper(slider);

    pageScope.$apply('model = 102');

    expect(wrapper.attr('role')).toEqual('slider');
    expect(slider.attr('aria-valuemin')).toEqual('100');
    expect(slider.attr('aria-valuemax')).toEqual('104');
    expect(slider.attr('aria-valuenow')).toEqual('102');

    wrapper.triggerHandler({
      type: 'keydown',
      keyCode: $mdConstant.KEY_CODE.LEFT_ARROW
    });
    $timeout.flush();
    expect(slider.attr('aria-valuenow')).toEqual('100');
  });

  it('should ignore pressdown events when disabled', function() {
    pageScope.isDisabled = true;
    var slider = setup('ng-disabled="isDisabled"');
    var wrapper = getWrapper(slider);

    pageScope.$digest();

    // Doesn't add active class on pressdown when disabled
    wrapper.triggerHandler({
      type: '$md.pressdown',
      pointer: {}
    });
    expect(slider).not.toHaveClass('md-active');

    // Doesn't remove active class up on pressup when disabled
    slider.addClass('md-active');
    wrapper.triggerHandler({
      type: '$md.pressup',
      pointer: {}
    });
    expect(slider).toHaveClass('md-active');
  });

  it('should disable via the `disabled` attribute', function() {
    var slider = setup('disabled');
    var wrapper = getWrapper(slider);

    pageScope.$digest();

    // Check for disabled state by triggering the pressdown handler and asserting that
    // the slider is not active.
    wrapper.triggerHandler({
      type: '$md.pressdown',
      pointer: {}
    });
    expect(slider).not.toHaveClass('md-active');
  });

  it('should add active class on pressdown and remove on blur', function() {
    var slider = setup();
    var wrapper = getWrapper(slider);

    expect(slider).not.toHaveClass('md-active');

    wrapper.triggerHandler({
      type: '$md.pressdown',
      pointer: {}
    });
    expect(slider).toHaveClass('md-active');

    wrapper.triggerHandler({
      type: 'blur',
      pointer: {}
    });
    expect(slider).not.toHaveClass('md-active');
  });

  it('should add md-min class only when at min value', function() {
    var slider = setup('ng-model="model" min="0" max="30"');
    var wrapper = getWrapper(slider);

    pageScope.$apply('model = 0');
    expect(slider).toHaveClass('md-min');

    wrapper.triggerHandler({type: '$md.dragstart', pointer: {x: 0}});
    wrapper.triggerHandler({type: '$md.drag', pointer: {x: 10}});
    $timeout.flush();
    expect(slider).not.toHaveClass('md-min');
  });

  it('should add md-max class only when at max value', function() {
    var slider = setup('ng-model="model" min="0" max="30"');
    var wrapper = getWrapper(slider);

    pageScope.$apply('model = 30');
    expect(slider).toHaveClass('md-max');

    wrapper.triggerHandler({type: '$md.dragstart', pointer: {x: 30}});
    wrapper.triggerHandler({type: '$md.drag', pointer: {x: 10}});
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

      var wrapper = getWrapper(slider);

      return {
        drag : function simulateDrag(drag) {

          wrapper.triggerHandler({type: '$md.pressdown', pointer: drag });
          wrapper.triggerHandler({type: '$md.dragstart', pointer: drag });

          $timeout.flush();
        }
      };
    }

  });

  describe('vertical', function () {
    it('should set model on press', function() {
      var slider = setup('md-vertical ng-model="value" min="0" max="100"');
      pageScope.$apply('value = 50');

      var wrapper = getWrapper(slider);

      wrapper.triggerHandler({type: '$md.pressdown', pointer: { y: 70 }});
      wrapper.triggerHandler({type: '$md.dragstart', pointer: { y: 70 }});
      $timeout.flush();
      expect(pageScope.value).toBe(30);

      // When going past max, it should clamp to max.
      wrapper.triggerHandler({type: '$md.drag', pointer: { y: 0 }});
      $timeout.flush();
      expect(pageScope.value).toBe(100);

      wrapper.triggerHandler({type: '$md.drag', pointer: { y: 50 }});
      $timeout.flush();
      expect(pageScope.value).toBe(50);
    });

    it('should increment model on up arrow', function() {
      var slider = setup('md-vertical min="100" max="104" step="2" ng-model="model"');
      pageScope.$apply('model = 100');

      var wrapper = getWrapper(slider);

      wrapper.triggerHandler({
        type: 'keydown',
        keyCode: $mdConstant.KEY_CODE.UP_ARROW
      });
      $timeout.flush();
      expect(pageScope.model).toBe(102);

      wrapper.triggerHandler({
        type: 'keydown',
        keyCode: $mdConstant.KEY_CODE.UP_ARROW
      });
      $timeout.flush();
      expect(pageScope.model).toBe(104);

      // Stays at max.
      wrapper.triggerHandler({
        type: 'keydown',
        keyCode: $mdConstant.KEY_CODE.UP_ARROW
      });
      $timeout.flush();
      expect(pageScope.model).toBe(104);
    });

    it('should decrement model on down arrow', function() {
      var slider = setup('md-vertical min="100" max="104" step="2" ng-model="model"');
      pageScope.$apply('model = 104');

      var wrapper = getWrapper(slider);

      wrapper.triggerHandler({
        type: 'keydown',
        keyCode: $mdConstant.KEY_CODE.DOWN_ARROW
      });
      $timeout.flush();
      expect(pageScope.model).toBe(102);

      wrapper.triggerHandler({
        type: 'keydown',
        keyCode: $mdConstant.KEY_CODE.DOWN_ARROW
      });
      $timeout.flush();
      expect(pageScope.model).toBe(100);

      // Stays at min.
      wrapper.triggerHandler({
        type: 'keydown',
        keyCode: $mdConstant.KEY_CODE.DOWN_ARROW
      });
      $timeout.flush();
      expect(pageScope.model).toBe(100);
    });

    it('should update the thumb text', function() {
      var slider = setup('md-vertical ng-model="value" md-discrete min="0" max="100" step="1"');
      var wrapper = getWrapper(slider);

      pageScope.$apply('value = 30');
      expect(slider[0].querySelector('.md-thumb-text').textContent).toBe('30');

      wrapper.triggerHandler({
        type: 'keydown',
        keyCode: $mdConstant.KEY_CODE.DOWN_ARROW
      });
      $timeout.flush();
      expect(slider[0].querySelector('.md-thumb-text').textContent).toBe('29');

      wrapper.triggerHandler({type: '$md.pressdown', pointer: { y: 70 }});
      expect(slider[0].querySelector('.md-thumb-text').textContent).toBe('30');

      wrapper.triggerHandler({type: '$md.dragstart', pointer: { y: 93 }});
      wrapper.triggerHandler({type: '$md.drag', pointer: { y: 93 }});
      expect(slider[0].querySelector('.md-thumb-text').textContent).toBe('7');
    });

    it('should add md-min class only when at min value', function() {
      var slider = setup('md-vertical ng-model="model" min="0" max="30"');
      var wrapper = getWrapper(slider);

      pageScope.$apply('model = 0');
      expect(slider).toHaveClass('md-min');

      wrapper.triggerHandler({type: '$md.dragstart', pointer: {y: 0}});
      wrapper.triggerHandler({type: '$md.drag', pointer: {y: 10}});
      $timeout.flush();
      expect(slider).not.toHaveClass('md-min');
    });

    it('should add md-max class only when at max value', function() {
      var slider = setup('md-vertical ng-model="model" min="0" max="30"');
      var wrapper = getWrapper(slider);

      pageScope.$apply('model = 30');
      expect(slider).toHaveClass('md-max');

      wrapper.triggerHandler({type: '$md.dragstart', pointer: {y: 30}});
      wrapper.triggerHandler({type: '$md.drag', pointer: {y: 10}});
      $timeout.flush();
      expect(slider).not.toHaveClass('md-max');
    });

    it('should increment at a predictable step', function() {

      buildSlider(0.1, 0, 1).drag({y:30});
      expect(pageScope.value).toBe(0.7);

      buildSlider(0.25, 0, 1).drag({y:45});
      expect(pageScope.value).toBe(0.5);

      buildSlider(0.25, 0, 1).drag({y:75});
      expect(pageScope.value).toBe(0.25);

      buildSlider(1, 0, 100).drag({y:10});
      expect(pageScope.value).toBe(90);

      buildSlider(20, 5, 45).drag({y:50});
      expect(pageScope.value).toBe(25);

      function buildSlider(step, min, max) {
        var slider = setup('md-vertical ng-model="value" min="' + min + '" max="' + max + '" step="' + step + '"');
        pageScope.$apply('value = 0.5');

        var wrapper = getWrapper(slider);

        return {
          drag : function simulateDrag(drag) {

            wrapper.triggerHandler({type: '$md.pressdown', pointer: drag });
            wrapper.triggerHandler({type: '$md.dragstart', pointer: drag });

            $timeout.flush();
          }
        };
      }

    });
  });

  describe('slider container', function () {

    it('should have `._md` class indicator', inject(function() {
      var element = setupContainer('disabled="disabled"');
      expect(element.hasClass('_md')).toBe(true);
    }));

    it('should disable via the `disabled` attribute', function() {
      var container = setupContainer('disabled="disabled"');
      var slider = angular.element(container[0].querySelector('md-slider'));
      var wrapper = getWrapper(container);

      // Check for disabled state by triggering the pressdown handler and asserting that
      // the slider is not active.
      wrapper.triggerHandler({
        type: '$md.pressdown',
        pointer: {}
      });
      expect(slider).not.toHaveClass('md-active');
    });

    it('should disable via the `ngDisabled` attribute', function() {
      var container = setupContainer('ng-disabled="isDisabled"');
      var slider = angular.element(container[0].querySelector('md-slider'));
      var wrapper = getWrapper(container);

      // Check for disabled state by triggering the pressdown handler and asserting that
      // the slider is not active.
      wrapper.triggerHandler({
        type: '$md.pressdown',
        pointer: {}
      });
      expect(slider).toHaveClass('md-active');

      // Removing focus from the slider
      wrapper.triggerHandler({
        type: 'blur',
        pointer: {}
      });

      pageScope.$apply('isDisabled = true');

      wrapper.triggerHandler({
        type: '$md.pressdown',
        pointer: {}
      });
      expect(slider).not.toHaveClass('md-active');
    });

    it('should disable related inputs', inject(function($compile) {
      var container = setupContainer('ng-disabled="isDisabled"');
      var slider = angular.element(container[0].querySelector('md-slider'));

      var inputContainer = $compile('<md-input-container><input /></md-input-container>')(pageScope);
      var input = angular.element(inputContainer[0].querySelector('input'));

      container.append(input);

      expect(input.attr('disabled')).toEqual(undefined);

      pageScope.$apply('isDisabled = true');

      expect(input.attr('disabled')).toEqual('disabled');
    }));

  });

  describe('invert', function () {
    it('should set model on press', function() {
      var slider = setup('md-vertical md-invert ng-model="value" min="0" max="100"');
      pageScope.$apply('value = 50');

      var wrapper = getWrapper(slider);

      wrapper.triggerHandler({type: '$md.pressdown', pointer: { y: 70 }});
      wrapper.triggerHandler({type: '$md.dragstart', pointer: { y: 70 }});
      $timeout.flush();
      expect(pageScope.value).toBe(70);

      // When going past max, it should clamp to max.
      wrapper.triggerHandler({type: '$md.drag', pointer: { y: 0 }});
      $timeout.flush();
      expect(pageScope.value).toBe(0);

      wrapper.triggerHandler({type: '$md.drag', pointer: { y: 50 }});
      $timeout.flush();
      expect(pageScope.value).toBe(50);
    });

    it('should decrement model on up arrow', function() {
      var slider = setup('md-vertical md-invert min="100" max="104" step="2" ng-model="model"');
      pageScope.$apply('model = 104');

      var wrapper = getWrapper(slider);

      wrapper.triggerHandler({
        type: 'keydown',
        keyCode: $mdConstant.KEY_CODE.UP_ARROW
      });
      $timeout.flush();
      expect(pageScope.model).toBe(102);

      wrapper.triggerHandler({
        type: 'keydown',
        keyCode: $mdConstant.KEY_CODE.UP_ARROW
      });
      $timeout.flush();
      expect(pageScope.model).toBe(100);

      // Stays at min.
      wrapper.triggerHandler({
        type: 'keydown',
        keyCode: $mdConstant.KEY_CODE.UP_ARROW
      });
      $timeout.flush();
      expect(pageScope.model).toBe(100);

    });

    it('should increment model on down arrow', function() {
      var slider = setup('md-vertical md-invert min="100" max="104" step="2" ng-model="model"');
      pageScope.$apply('model = 100');

      var wrapper = getWrapper(slider);

      wrapper.triggerHandler({
        type: 'keydown',
        keyCode: $mdConstant.KEY_CODE.DOWN_ARROW
      });
      $timeout.flush();
      expect(pageScope.model).toBe(102);

      wrapper.triggerHandler({
        type: 'keydown',
        keyCode: $mdConstant.KEY_CODE.DOWN_ARROW
      });
      $timeout.flush();
      expect(pageScope.model).toBe(104);

      // Stays at max.
      wrapper.triggerHandler({
        type: 'keydown',
        keyCode: $mdConstant.KEY_CODE.DOWN_ARROW
      });
      $timeout.flush();
      expect(pageScope.model).toBe(104);
    });

    it('should update the thumb text', function() {
      var slider = setup('md-vertical md-invert ng-model="value" md-discrete min="0" max="100" step="1"');
      var wrapper = getWrapper(slider);

      pageScope.$apply('value = 30');
      expect(slider[0].querySelector('.md-thumb-text').textContent).toBe('30');

      wrapper.triggerHandler({
        type: 'keydown',
        keyCode: $mdConstant.KEY_CODE.DOWN_ARROW
      });
      $timeout.flush();
      expect(slider[0].querySelector('.md-thumb-text').textContent).toBe('31');

      wrapper.triggerHandler({type: '$md.pressdown', pointer: { y: 70 }});
      expect(slider[0].querySelector('.md-thumb-text').textContent).toBe('70');

      wrapper.triggerHandler({type: '$md.dragstart', pointer: { y: 93 }});
      wrapper.triggerHandler({type: '$md.drag', pointer: { y: 93 }});
      expect(slider[0].querySelector('.md-thumb-text').textContent).toBe('93');
    });

    it('should add md-min class only when at min value', function() {
      var slider = setup('md-vertical md-invert ng-model="model" min="0" max="30"');
      var wrapper = getWrapper(slider);

      pageScope.$apply('model = 0');
      expect(slider).toHaveClass('md-min');

      wrapper.triggerHandler({type: '$md.dragstart', pointer: {y: 0}});
      wrapper.triggerHandler({type: '$md.drag', pointer: {y: 10}});
      $timeout.flush();
      expect(slider).not.toHaveClass('md-min');
    });

    it('should add md-max class only when at max value', function() {
      var slider = setup('md-vertical md-invert ng-model="model" min="0" max="30"');
      var wrapper = getWrapper(slider);

      pageScope.$apply('model = 30');
      expect(slider).toHaveClass('md-max');

      wrapper.triggerHandler({type: '$md.dragstart', pointer: {y: 30}});
      wrapper.triggerHandler({type: '$md.drag', pointer: {y: 10}});
      $timeout.flush();
      expect(slider).not.toHaveClass('md-max');
    });

    it('should increment at a predictable step', function() {

      buildSlider(0.1, 0, 1).drag({y:30});
      expect(pageScope.value).toBe(0.3);

      buildSlider(0.25, 0, 1).drag({y:45});
      expect(pageScope.value).toBe(0.5);

      buildSlider(0.25, 0, 1).drag({y:75});
      expect(pageScope.value).toBe(0.75);

      buildSlider(1, 0, 100).drag({y:10});
      expect(pageScope.value).toBe(10);

      buildSlider(20, 5, 45).drag({y:50});
      expect(pageScope.value).toBe(25);

      function buildSlider(step, min, max) {
        var slider = setup('md-vertical md-invert ng-model="value" min="' + min + '" max="' + max + '" step="' + step + '"');
        pageScope.$apply('value = 0.5');

        var wrapper = getWrapper(slider);

        return {
          drag : function simulateDrag(drag) {

            wrapper.triggerHandler({type: '$md.pressdown', pointer: drag });
            wrapper.triggerHandler({type: '$md.dragstart', pointer: drag });

            $timeout.flush();
          }
        };
      }

    });

    it('should increment model on left arrow', function() {
      var slider = setup('md-invert min="100" max="104" step="2" ng-model="model"');
      pageScope.$apply('model = 100');

      var wrapper = getWrapper(slider);

      wrapper.triggerHandler({
        type: 'keydown',
        keyCode: $mdConstant.KEY_CODE.LEFT_ARROW
      });
      $timeout.flush();
      expect(pageScope.model).toBe(102);

      wrapper.triggerHandler({
        type: 'keydown',
        keyCode: $mdConstant.KEY_CODE.LEFT_ARROW
      });
      $timeout.flush();
      expect(pageScope.model).toBe(104);

      // Stays at max.
      wrapper.triggerHandler({
        type: 'keydown',
        keyCode: $mdConstant.KEY_CODE.LEFT_ARROW
      });
      $timeout.flush();
      expect(pageScope.model).toBe(104);
    });

    it('should decrement model on right arrow', function() {
      var slider = setup('md-invert min="100" max="104" step="2" ng-model="model"');
      pageScope.$apply('model = 104');

      var wrapper = getWrapper(slider);

      wrapper.triggerHandler({
        type: 'keydown',
        keyCode: $mdConstant.KEY_CODE.RIGHT_ARROW
      });
      $timeout.flush();
      expect(pageScope.model).toBe(102);

      wrapper.triggerHandler({
        type: 'keydown',
        keyCode: $mdConstant.KEY_CODE.RIGHT_ARROW
      });
      $timeout.flush();
      expect(pageScope.model).toBe(100);

      // Stays at min.
      wrapper.triggerHandler({
        type: 'keydown',
        keyCode: $mdConstant.KEY_CODE.RIGHT_ARROW
      });
      $timeout.flush();
      expect(pageScope.model).toBe(100);
    });

  });

  
  it('should set a default tabindex', function() {
    var slider = setup();
    var wrapper = getWrapper(slider);

    expect(wrapper.attr('tabindex')).toBe('0');
  });

  it('should set a -1 tabindex to disabled slider', function() {
    var slider = setup('ng-disabled="isDisabled"');
    var wrapper = getWrapper(slider);

    expect(wrapper.attr('tabindex')).toBe('-1');
  });

  it('should not overwrite tabindex attribute', function() {
    var slider = setup('tabindex="2"');
    var wrapper = getWrapper(slider);

    expect(wrapper.attr('tabindex')).toBe('2');
  });

});
