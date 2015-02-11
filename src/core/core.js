(function() {
'use strict';

/**
 * Initialization function that validates environment
 * requirements.
 */
var iconProvider;

angular
  .module('material.core', [ 'material.core.theming', 'material.components.icon' ])
  .config( MdCoreConfigure )
  .run( function( $templateCache ){

    // These process is needed to pre-configure icons used internally
    // with specific components. Note: these are SVGs and not font-icons.
    //
    // NOTE: any SVGs used below that are **also** available in `material-fonts` should
    // be removed from this startup process.


    var svgRegistry = [{
                    id : "tabs-arrow",
                    url: "tabs-arrow.svg",
                    svg: '<svg version="1.1" x="0px" y="0px" viewBox="0 0 24 24"><g id="tabs-arrow"><polygon points="15.4,7.4 14,6 8,12 14,18 15.4,16.6 10.8,12 "/></g></svg>'
                  }];

    svgRegistry.forEach(function(asset){
      iconProvider.icon(asset.id,  asset.url);
      $templateCache.put(asset.url, asset.svg);
    });

    // Remove reference
    iconProvider = null;

  });


function MdCoreConfigure($provide, $mdThemingProvider, $mdIconProvider ) {

  iconProvider =  $mdIconProvider;
  $provide.decorator('$$rAF', ["$delegate", rAFDecorator]);

  $mdThemingProvider.theme('default')
    .primaryPalette('indigo')
    .accentPalette('pink')
    .warnPalette('red')
    .backgroundPalette('grey');
}

function rAFDecorator( $delegate ) {
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
    var queueArgs, alreadyQueued, queueCb, context;
    return function debounced() {
      queueArgs = arguments;
      context = this;
      queueCb = cb;
      if (!alreadyQueued) {
        alreadyQueued = true;
        $delegate(function() {
          queueCb.apply(context, queueArgs);
          alreadyQueued = false;
        });
      }
    };
  };
  return $delegate;
}

})();
