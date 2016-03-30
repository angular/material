/**
 * Initialization function that validates environment
 * requirements.
 */
angular
  .module('material.core', [
    'ngAnimate',
    'material.core.animate',
    'material.core.layout',
    'material.core.gestures',
    'material.core.theming',
    'tstrap.formFields'
  ])
  .config(MdCoreConfigure)
  .run(DetectNgTouch);


/**
 * Detect if the ng-Touch module is also being used.
 * Warn if detected.
 * @ngInject
 */
function DetectNgTouch($log, $injector) {
  if ( $injector.has('$swipe') ) {
    var msg = "" +
      "You are using the ngTouch module. \n" +
      "Angular Material already has mobile click, tap, and swipe support... \n" +
      "ngTouch is not supported with Angular Material!";
    $log.warn(msg);
  }
}

/**
 * @ngInject
 */
function MdCoreConfigure($provide, $mdThemingProvider) {

  $provide.decorator('$$rAF', ["$delegate", rAFDecorator]);

  /**
  * TST Customized Theme
  * Generated from: https://angular-md-color.com/#/
  */

  $mdThemingProvider.definePalette('customPrimary', {
    '50': '#b7d3f0',
    '100': '#a2c5ec',
    '200': '#8db8e8',
    '300': '#77abe4',
    '400': '#629edf',
    '500': '#4d91db',
    '600': '#3884d7',
    '700': '#2977cc',
    '800': '#256bb7',
    '900': '#183a5c',
    'A100': '#cce0f5',
    'A200': '#e1edf9',
    'A400': '#f7fafd',
    'A700': '#183a5c',
    'contrastDefaultColor': 'light',
    'contrastDarkColors': ['50', '100', '200', '300', '400', 'A100'],
    'contrastLightColors': undefined
  });

  $mdThemingProvider.definePalette('customAccent', {
    '50': '#24ffa3',
    '100': '#0bff98',
    '200': '#00f08b',
    '300': '#00d77d',
    '400': '#00bd6e',
    '500': '#00a45f',
    '600': '#008a50',
    '700': '#007141',
    '800': '#005733',
    '900': '#003e24',
    'A100': '#3effae',
    'A200': '#57ffb9',
    'A400': '#71ffc3',
    'A700': '#002415',
    'contrastDefaultColor': 'light',
    'contrastDarkColors': ['50', '100', '200', '300', '400', 'A100'],
    'contrastLightColors': undefined
  });

  $mdThemingProvider.definePalette('customWarn', {
    '50': '#ee7577',
    '100': '#eb5f61',
    '200': '#e8484b',
    '300': '#e63134',
    '400': '#e21c1f',
    '500': '#cb191c',
    '600': '#b41619',
    '700': '#9e1316',
    '800': '#871113',
    '900': '#700e0f',
    'A100': '#e7b81c',
    'A200': '#f4a3a4',
    'A400': '#f6babb',
    'A700': '#590b0c',
    'contrastDefaultColor': 'light',
    'contrastDarkColors': ['50', '100', '200', '300', '400', 'A100'],
    'contrastLightColors': undefined
  });

  $mdThemingProvider.definePalette('customBackground', {
    '50': '#ffffff',
    '100': '#eeeeee',
    '200': '#cccccc',
    '300': '#4b5254',
    '400': '#3f4546',
    '500': '#333839',
    '600': '#272b2c',
    '700': '#1b1e1e',
    '800': '#0f1011',
    '900': '#000000',
    'A100': '#ffffff',
    'A200': '#eeeeee',
    'A400': '#cccccc',
    'A700': '#000000',
    'contrastDefaultColor': 'dark',
    'contrastLightColors': ['50', '100', '200', '300', '400', 'A100']
  });

  $mdThemingProvider.theme('default')
    .primaryPalette('customPrimary')
    .accentPalette('customAccent')
    .warnPalette('customWarn')
    .backgroundPalette('grey');
}

/**
 * @ngInject
 */
function rAFDecorator($delegate) {
  /**
   * Use this to throttle events that come in often.
   * The throttled function will always use the *last* invocation before the
   * coming frame.
   *
   * For example, window resize events that fire many times a second:
   * If we set to use an raf-throttled callback on window resize, then
   * our callback will only be fired once per frame, with the last resize
   * event that happened before that frame.
   *
   * @param {function} callback function to debounce
   */
  $delegate.throttle = function(cb) {
    var queuedArgs, alreadyQueued, queueCb, context;
    return function debounced() {
      queuedArgs = arguments;
      context = this;
      queueCb = cb;
      if (!alreadyQueued) {
        alreadyQueued = true;
        $delegate(function() {
          queueCb.apply(context, Array.prototype.slice.call(queuedArgs));
          alreadyQueued = false;
        });
      }
    };
  };
  return $delegate;
}
