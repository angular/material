/**
 * @ngdoc module
 * @name material.components.slider
 */
angular.module('material.components.slider', [
  'material.animations',
  'material.services.aria'
])
.directive('materialSlider', [
  SliderDirective
]);

/**
 * @ngdoc directive
 * @name materialSlider
 * @module material.components.slider
 * @restrict E
 * @description
 * The `<material-slider>` component allows the user to choose from a range of
 * values.
 *
 * It has two modes: 'normal' mode, where the user slides between a wide range
 * of values, and 'discrete' mode, where the user slides between only a few
 * select values.
 *
 * To enable discrete mode, add the `discrete` attribute to a slider,
 * and use the `step` attribute to change the distance between
 * values the user is allowed to pick.
 *
 * @usage
 * <h4>Normal Mode</h4>
 * <hljs lang="html">
 * <material-slider ng-model="myValue" min="5" max="500">
 * </material-slider>
 * </hljs>
 * <h4>Discrete Mode</h4>
 * <hljs lang="html">
 * <material-slider discrete ng-model="myDiscreteValue" step="10" min="10" max="130">
 * </material-slider>
 * </hljs>
 *
 * @param {boolean=} discrete Whether to enable discrete mode.
 * @param {number=} step The distance between values the user is allowed to pick. Default 1.
 * @param {number=} min The minimum value the user is allowed to pick. Default 0.
 * @param {number=} max The maximum value the user is allowed to pick. Default 100.
 */
function SliderDirective() {
  return {
    scope: {},
    require: ['?ngModel', 'materialSlider'],
    controller: [
      '$scope',
      '$element',
      '$attrs',
      '$$rAF',
      '$timeout',
      '$window',
      '$materialEffects',
      '$aria',
      SliderController
    ],
    template:
      '<div class="slider-track-container">' +
        '<div class="slider-track"></div>' +
        '<div class="slider-track slider-track-fill"></div>' +
        '<div class="slider-track-ticks"></div>' +
      '</div>' +
      '<div class="slider-thumb-container">' +
        '<div class="slider-thumb"></div>' +
        '<div class="slider-focus-thumb"></div>' +
        '<div class="slider-focus-ring"></div>' +
        '<div class="slider-sign">' +
          '<span class="slider-thumb-text" ng-bind="modelValue"></span>' +
        '</div>' +
        '<div class="slider-disabled-thumb"></div>' +
      '</div>',
    link: postLink
  };

  function postLink(scope, element, attr, ctrls) {
    var ngModelCtrl = ctrls[0] || {
      // Mock ngModelController if it doesn't exist to give us
      // the minimum functionality needed
      $setViewValue: function(val) {
        this.$viewValue = val;
        this.$viewChangeListeners.forEach(function(cb) { cb(); });
      },
      $parsers: [],
      $formatters: [],
      $viewChangeListeners: []
    };

    var sliderCtrl = ctrls[1];
    sliderCtrl.init(ngModelCtrl);
  }
}

/**
 * We use a controller for all the logic so that we can expose a few
 * things to unit tests
 */
function SliderController(scope, element, attr, $$rAF, $timeout, $window, $materialEffects, $aria) {

  this.init = function init(ngModelCtrl) {
    var thumb = angular.element(element[0].querySelector('.slider-thumb'));
    var thumbContainer = thumb.parent();
    var trackContainer = angular.element(element[0].querySelector('.slider-track-container'));
    var activeTrack = angular.element(element[0].querySelector('.slider-track-fill'));
    var tickContainer = angular.element(element[0].querySelector('.slider-track-ticks'));

    // Default values, overridable by attrs
    attr.min ? attr.$observe('min', updateMin) : updateMin(0);
    attr.max ? attr.$observe('max', updateMax) : updateMax(100);
    attr.step ? attr.$observe('step', updateStep) : updateStep(1);

    // We have to manually stop the $watch on ngDisabled because it exists
    // on the parent scope, and won't be automatically destroyed when
    // the component is destroyed.
    var stopDisabledWatch = angular.noop;
    if (attr.ngDisabled) {
      stopDisabledWatch = scope.$parent.$watch(attr.ngDisabled, updateAriaDisabled);
    } else {
      updateAriaDisabled(!!attr.disabled);
    }

    $aria.expect(element, 'aria-label');
    element.attr('tabIndex', 0);
    element.attr('role', 'slider');
    element.on('keydown', keydownListener);

    var hammertime = new Hammer(element[0], {
      recognizers: [
        [Hammer.Pan, { direction: Hammer.DIRECTION_HORIZONTAL }]
      ]
    });
    hammertime.on('hammer.input', onInput);
    hammertime.on('panstart', onPanStart);
    hammertime.on('pan', onPan);

    // On resize, recalculate the slider's dimensions and re-render
    var updateAll = $$rAF.debounce(function() {
      refreshSliderDimensions();
      ngModelRender();
      redrawTicks();
    });
    updateAll();
    angular.element($window).on('resize', updateAll);

    scope.$on('$destroy', function() {
      angular.element($window).off('resize', updateAll);
      hammertime.destroy();
      stopDisabledWatch();
    });

    ngModelCtrl.$render = ngModelRender;
    ngModelCtrl.$viewChangeListeners.push(ngModelRender);
    ngModelCtrl.$formatters.push(minMaxValidator);
    ngModelCtrl.$formatters.push(stepValidator);

    /**
     * Attributes
     */
    var min;
    var max;
    var step;
    function updateMin(value) {
      min = parseFloat(value);
      element.attr('aria-valuemin', value);
    }
    function updateMax(value) {
      max = parseFloat(value);
      element.attr('aria-valuemax', value);
    }
    function updateStep(value) {
      step = parseFloat(value);
      redrawTicks();
    }
    function updateAriaDisabled(isDisabled) {
      element.attr('aria-disabled', !!isDisabled);
    }

    // Draw the ticks with canvas.
    // The alternative to drawing ticks with canvas is to draw one element for each tick,
    // which could quickly become a performance bottleneck.
    var tickCanvas, tickCtx;
    function redrawTicks() {
      if (!angular.isDefined(attr.discrete)) return;

      var numSteps = Math.floor( (max - min) / step );
      if (!tickCanvas) {
        tickCanvas = angular.element('<canvas style="position:absolute;">');
        tickCtx = tickCanvas[0].getContext('2d');
        tickCtx.fillStyle = 'black';
        tickContainer.append(tickCanvas);
      }
      var dimensions = getSliderDimensions();
      tickCanvas[0].width = dimensions.width;
      tickCanvas[0].height = dimensions.height;

      var distance;
      for (var i = 0; i <= numSteps; i++) {
        distance = Math.floor(dimensions.width * (i / numSteps));
        tickCtx.fillRect(distance - 1, 0, 2, dimensions.height);
      }
    }


    /**
     * Refreshing Dimensions
     */
    var sliderDimensions = {};
    var debouncedRefreshDimensions = Util.debounce(refreshSliderDimensions, 5000);
    refreshSliderDimensions();
    function refreshSliderDimensions() {
      sliderDimensions = trackContainer[0].getBoundingClientRect();
    }
    function getSliderDimensions() {
      debouncedRefreshDimensions();
      return sliderDimensions;
    }

    /**
     * left/right arrow listener
     */
    function keydownListener(ev) {
      var changeAmount;
      if (ev.which === Constant.KEY_CODE.LEFT_ARROW) {
        changeAmount = -step;
      } else if (ev.which === Constant.KEY_CODE.RIGHT_ARROW) {
        changeAmount = step;
      }
      if (changeAmount) {
        if (ev.metaKey || ev.ctrlKey || ev.altKey) {
          changeAmount *= 4;
        }
        ev.preventDefault();
        ev.stopPropagation();
        scope.$evalAsync(function() {
          setModelValue(ngModelCtrl.$viewValue + changeAmount);
        });
      }
    }

    /**
     * ngModel setters and validators
     */
    function setModelValue(value) {
      ngModelCtrl.$setViewValue( minMaxValidator(stepValidator(value)) );
    }
    function ngModelRender() {
      var percent = (ngModelCtrl.$viewValue - min) / (max - min);
      scope.modelValue = ngModelCtrl.$viewValue;
      element.attr('aria-valuenow', ngModelCtrl.$viewValue);
      setSliderPercent(percent);
    }

    function minMaxValidator(value) {
      if (angular.isNumber(value)) {
        return Math.max(min, Math.min(max, value));
      }
    }
    function stepValidator(value) {
      if (angular.isNumber(value)) {
        return Math.round(value / step) * step;
      }
    }

    /**
     * @param percent 0-1
     */
    function setSliderPercent(percent) {
      activeTrack.css('width', (percent * 100) + '%');
      thumbContainer.css(
        $materialEffects.TRANSFORM,
        'translate3d(' + getSliderDimensions().width * percent + 'px,0,0)'
      );
      element.toggleClass('slider-min', percent === 0);
    }


    /**
     * Slide listeners
     */
    var isSliding = false;
    function onInput(ev) {
      if (!isSliding && ev.eventType === Hammer.INPUT_START &&
          !element[0].hasAttribute('disabled')) {

        isSliding = true;
        element.addClass('active');
        element[0].focus();
        refreshSliderDimensions();
        doSlide(ev.center.x);

      } else if (isSliding && ev.eventType === Hammer.INPUT_END) {
        isSliding = false;
        element.removeClass('panning active');
      }
    }
    function onPanStart() {
      if (!isSliding) return;
      element.addClass('panning');
    }
    function onPan(ev) {
      if (!isSliding) return;
      doSlide(ev.center.x);
      ev.preventDefault();
    }

    /**
     * Expose for testing
     */
    this._onInput = onInput;
    this._onPanStart = onPanStart;
    this._onPan = onPan;

    function doSlide(x) {
      var percent = (x - sliderDimensions.left) / (sliderDimensions.width);
      scope.$evalAsync(function() { setModelValue(min + percent * (max - min)); });
    }

  };
}
