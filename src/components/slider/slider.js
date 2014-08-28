/**
 * @ngdoc module
 * @name material.components.slider
 * @description Slider module!
 */
angular.module('material.components.slider', [])
  .directive('materialSlider', [
    '$window', 
    materialSliderDirective 
  ]);

/**
 * @ngdoc directive
 * @name materialSlider
 * @module material.components.slider
 * @restrict E
 *
 * @description
 * The `material-slider` directive creates a slider bar that you can use.
 *
 * Simply put a native `<input type="range">` element inside of a
 * `<material-slider>` container.
 *
 * On the range input, all HTML5 range attributes are supported.
 *
 * @usage
 * <hljs lang="html">
 * <material-slider>
 *   <input type="range" ng-model="slideValue" min="0" max="100">
 * </material-slider>
 * </hljs>
 */
function materialSliderDirective($window) {

  var MIN_VALUE_CSS = 'material-slider-min';
  var ACTIVE_CSS = 'material-active';

  function rangeSettings(rangeEle) {
    return {
      min: parseInt( rangeEle.min !== "" ? rangeEle.min : 0, 10 ),
      max: parseInt( rangeEle.max !== "" ? rangeEle.max : 100, 10 ),
      step: parseInt( rangeEle.step !== "" ? rangeEle.step : 1, 10 )
    };
  }

  return {
    restrict: 'E',
    scope: true,
    transclude: true,
    template: '<div class="material-track" ng-transclude></div>',
    link: link
  };

  // **********************************************************
  // Private Methods
  // **********************************************************

  function link(scope, element, attr) {
    var input = element.find('input');
    var ngModelCtrl = angular.element(input).controller('ngModel');

    if(!input || !ngModelCtrl || input[0].type !== 'range') return;

    var rangeEle = input[0];
    var trackEle = angular.element( element[0].querySelector('.material-track') );

    trackEle.append('<div class="material-fill"><div class="material-thumb" tabIndex="0" role="slider"></div></div>');
    var fillEle = trackEle[0].querySelector('.material-fill'),
        thumbEle = trackEle.find('.material-thumb');

    var settings = rangeSettings(rangeEle);

    if(input.attr('step')) {
      var tickCount = (settings.max - settings.min) / settings.step;
      var tickMarkersEle = angular.element('<div class="material-tick-markers"></div>');
      for(var i=0; i<tickCount; i++) {
        tickMarkersEle.append('<div class="material-tick"></div>');
      }
      if (tickCount > 0) {
        tickMarkersEle.addClass('visible');
      }
      trackEle.append(tickMarkersEle);
    }

    thumbEle.attr(Constant.ARIA.PROPERTY.VALUE_MIN, settings.min);
    thumbEle.attr(Constant.ARIA.PROPERTY.VALUE_MAX, settings.max);

    input.on('mousedown touchstart', function(e){
      trackEle.addClass(ACTIVE_CSS);
    });

    input.on('mouseup touchend', function(e){
      trackEle.removeClass(ACTIVE_CSS);
    });


    function render() {
      var settings = rangeSettings(rangeEle);
      var adjustedValue = parseInt(ngModelCtrl.$viewValue, 10) - settings.min;
      var fillRatio = (adjustedValue / (settings.max - settings.min));

      fillEle.style.width = (fillRatio * 100) + '%';

      if(fillRatio <= 0) {
        element.addClass(MIN_VALUE_CSS);
      } else {
        element.removeClass(MIN_VALUE_CSS);
      }
      thumbEle.attr(Constant.ARIA.PROPERTY.VALUE_NOW, Math.round(fillRatio * 100));
    }

    scope.$watch( function () { return ngModelCtrl.$viewValue; }, render );

  }

}

