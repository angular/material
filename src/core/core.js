/**
 * Initialization function that validates environment
 * requirements.
 */
angular
  .module('material.core', [
    'ngAnimate',
    'material.animate',
    'material.core.gestures',
    'material.core.theming'
  ])
  .directive('mdTemplate', MdTemplateDirective)
  .config(MdCoreConfigure);

function MdCoreConfigure($provide, $mdThemingProvider) {

  $provide.decorator('$$rAF', ["$delegate", rAFDecorator]);

  $mdThemingProvider.theme('default')
    .primaryPalette('indigo')
    .accentPalette('pink')
    .warnPalette('red')
    .backgroundPalette('grey');
}

function MdTemplateDirective($compile) {
  return {
    restrict: 'A',
    scope: {
      template: '=mdTemplate'
    },
    link: function postLink(scope, element) {
      scope.$watch('template', assignSafeHTML);

      /**
       * To add safe HTML: assign and compile in
       * isolated scope.
       */
      function assignSafeHTML(value) {
        // when the 'compile' expression changes
        // assign it into the current DOM
        element.html(value);

        // Compile the new DOM and link it to the current scope.
        // NOTE: we only compile .childNodes so that we don't get
        //       into infinite loop compiling ourselves
        $compile(element.contents())(scope);
      }
    }
  };

}

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
