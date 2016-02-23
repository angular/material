"use strict";

/**
 * @ngdoc service
 * @name $mdProgressCircular
 * @module material.components.progressCircular
 *
 * @description
 * Allows the user to specify the default options for the `progressCircular` directive.
 *
 * @property {number} progressSize Diameter of the progress circle in pixels.
 * @property {number} strokeWidth Width of the circle's stroke in pixels.
 * @property {number} animationDuration Length of the circle animation in milliseconds.
 * @property {function} easeFn Default easing animation function.
 * @property {object} easingPresets Collection of pre-defined easing functions.
 * @property {(function(object): object)} configure Used to modify the default options.
 *
 * @usage
 * <hljs lang="js">
 *   myAppModule.config(function($mdProgressCircular) {
 *
 *     // Example of changing the default progress options.
 *     $mdProgressCircular.configure({
 *       progressSize: 100,
 *       strokeWidth: 20,
 *       animationDuration: 800
 *     });
 * });
 * </hljs>
 *
 */

angular
  .module('material.components.progressCircular')
  .provider("$mdProgressCircular", MdProgressCircularProvider);

function MdProgressCircularProvider() {
  var progressConfig = {
    progressSize: 50,
    strokeWidth: 5,
    animationDuration: 100,

    easeFn: linearEase,
    easingPresets: {
      linearEase: linearEase,
      materialEase: materialEase
    }
  };

  return {
    configure : function(options){
      progressConfig = angular.extend(progressConfig, options || {});
      return progressConfig;
    },
    $get : function() { return progressConfig; }
  };

  function linearEase(t, b, c, d) { return c * t / d + b; }
  function materialEase(t, b, c, d) {
    // via http://www.timotheegroleau.com/Flash/experiments/easing_function_generator.htm
    // with settings of [0, 0, 1, 1]
    var ts=(t/=d)*t;
    var tc=ts*t;
    return b+c*(6*tc*ts + -15*ts*ts + 10*tc);
  }
}
