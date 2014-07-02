/**
 * @ngdoc module
 * @name material.components.slider
 * @description Slider module!
 */
angular.module('material.components.slider', [])
  .directive('materialSlider', [ '$window', materialSliderDirective ]);

/**
 * @ngdoc directive
 * @name materialSlider
 * @module material.components.slider
 * @restrict E
 *
 * @description
 * Slider directive!
 *
 */
function materialSliderDirective($window) {

  var MIN_VALUE_CSS = 'material-slider-min';

  function rangeSettings(rangeEle) {
    return {
      min: parseInt( rangeEle.min !== "" ? rangeEle.min : 0, 10 ),
      max: parseInt( rangeEle.max !== "" ? rangeEle.max : 100, 10 ),
      step: parseInt( rangeEle.step !== "" ? rangeEle.step : 1, 10 )
    }
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

    if(!ngModelCtrl || input[0].type !== 'range') return;

    var rangeEle = input[0];
    var trackEle = angular.element( element[0].querySelector('.material-track') );

    trackEle.append('<div class="material-fill"><div class="material-thumb"></div></div>');
    var fillEle = trackEle[0].querySelector('.material-fill');

    var settings = rangeSettings(rangeEle);
    if(settings.step > 1) {
      var tickCount = (settings.max - settings.min) / settings.step;
      var tickMarkersEle = angular.element('<div class="material-tick-markers material-display-flex"></div>');
      for(var i=0; i<tickCount; i++) {
        tickMarkersEle.append('<div class="material-tick material-flex"></div>');
      }
      trackEle.append(tickMarkersEle);
    }

    function render() {
      var settings = rangeSettings(rangeEle);
      var adjustedValue = parseInt(ngModelCtrl.$viewValue, 10) - settings.min;
      var fillRatio = (adjustedValue / (settings.max - settings.min));

      fillEle.style.width = Math.min(fillRatio * rangeEle.clientWidth, rangeEle.clientWidth) + 'px';

      if(fillRatio <= 0) {
        element.addClass(MIN_VALUE_CSS);
      } else {
        element.removeClass(MIN_VALUE_CSS);
      }

    }

    scope.$watch( function () { return ngModelCtrl.$viewValue; }, render );
    $window.addEventListener('resize', render, false);

  }

}


