/**
 * @ngdoc module
 * @name material.services.interimElement
 * @description InterimElement
 */

angular.module('material.services.interimElement', ['material.services.compiler'])
      .factory('$$interimElement', [
        '$q',
        '$timeout',
        '$rootElement',
        '$rootScope',
        '$animate',
        '$materialCompiler',
        InterimElementFactory
      ]);

/**
 * @ngdoc service
 * @name $$interimElement
 *
 * @description
 *
 * InterimElementFactory constructs `$interimElement` services with captured options.
 * Used internally in material for elements that appear on screen temporarily.
 * The service provides a promise-like API for interacting with the temporary
 * elements.
 *
 * ```js
 * app.service('MaterialToastService', function( $$interimElement ) {
 *   var $materialToast = $$interimElement(toastDefaultOptions);
 *   return $materialToast;
 * })
 * ```
 * @param {object=} defaultOptions Options used by default for the `show` method on the service.
 *
 * @returns {$$interimElement.interimElement}
 *
 */
function InterimElementFactory( $q, $timeout, $rootElement, $rootScope, $animate, $materialCompiler) {

        /**
         * @ngdoc type
         * @name $$interimElement.$interimElement
         *
         * @description
         * A service used to control inserting and removing an element into the DOM.
         *
         */
  return function createInterimElement(defaults) {
    var items = [];

    var parent = $rootElement.find('body');
    if (!parent.length) parent = $rootElement;

    defaults = angular.extend({
      parent: parent,
      onShow: function(scope, $el, options) {
        return $animate.enter($el, options.parent);
      },
      onHide:  function(scope, $el, options) {
        return $animate.leave($el);
      }
    }, defaults || {});

    // Inject function used to auto-hide (if needed)
    defaults.hideElement = hideElement;

    // Publish API for this instance
    return {
      show: showElement,
      hide: hideElement,
      cancel: cancelElement
    };

    // ****************************************
    // Private Closures
    // ****************************************

    /**
     * Compiles and inserts an element into the DOM and then
     * returns a promise to respond later after hide() or cancel()
     *
     * @param {Object} options Options object to compile with.
     * @returns {Promise} Promise that will resolve when the service
     * has `:hide()` or `:cancel()` called.
     *
     */
    function showElement(options) {
      if ( items.length ) hideElement();

      var item = new InterimItem( options, defaults );
      items.push( item );

      return item.show()
                 .then( function() {
                   return item.dfd.promise;
                 });
    }

    /**
     * Removes the `$interimElement` from the DOM and resolves the promise returned from `show`
     *
     * @param {*} args Data to resolve the promise with
     * @returns {undefined}
     */
    function hideElement() {
      if ( !items.length ) return $q.when(true);

      var args = toArray(arguments);
      var item = items.shift();

      return item.hide()
                 .then(function() {
                   item.dfd.resolve.apply( null, args );
                   return item.dfd.promise;
                 });
    }

    /**
     * Removes the `$interimElement` from the DOM and rejects the promise returned from `show`
     *
     * @param {*} args Data to reject the promise with
     * @returns {undefined}
     */
    function cancelElement() {
      if ( !items.length ) return $q.when(true);

      var args = toArray(arguments);
      var item = items.shift();

      return item.hide()
                 .then(function() {
                   item.dfd.reject.apply( null, args );
                   return item.dfd.promise;
                 });
    }


    // *******************************************
    // Private Class: InterimItem
    // *******************************************

    /**
     * Constructor for wrapper class that manages compile
     * @constructor
     */
    function InterimItem(options, defaults) {
      var hideTimeout, element, scope;

      options = angular.extend( { }, defaults, options );
      if ( !options.scope ) {
        options.scope = $rootScope.$new(options.isolateScope);
      }

      return {
        dfd: $q.defer(),
        hide: function() { return cancelAutoHide().then( hide ); },
        show: function() { return show(); }
      };

      // **************************************************
      // Internal Methods
      // **************************************************

      /**
       * Start the show process on the element (which may return a promise)
       * then prepare a autoHide timeout if needed...
       * @returns Promise
       */
      function show() {
        return element ? $q.when(element) :
               compile().then(function(element){
                  var response = options.onShow(options.scope, element, options);
                  return $q.when(response).then( buildAutoHide );
                });

        // Only start hide timer after show animation...
        function buildAutoHide(result) {
          if (options.hideDelay) {
            hideTimeout = $timeout(options.hideElement, options.hideDelay) ;
          }
          return $q.when(result);
        }
      }

      /**
       *  Start the hide process on the element (which may return a promise)
       *  then $destroy() the scope.
       */
      function hide() {
        if (!element) return $q.when(true);

        var response = options.onHide(options.scope, element, options);
        return $q.when(response)
                 .then( function(result) {
                   options.scope.$destroy();
                   element = undefined;
                   return result;
                 });
      }

      /**
       * Compile (if needed the
       * @returns {*} Promise
       */
      function compile(){

        return $materialCompiler
                  .compile(options)
                  .then(function(compiledData) {
                    // Link element to scope...
                    return element = compiledData.link(options.scope);
                  });
      }

      /**
       * Cancel the autoHide if it is still pending
       * @returns Promise
       */
      function cancelAutoHide(){
        $timeout.cancel( hideTimeout );
        hideTimeout = undefined;
        return $q.when(true);
      }

    }


    /**
     * Utility to convert `arguments` map to formal Array list
     * @returns {Array}
     */
    function toArray(map)
    {
      return [].slice.call(map);
    }



  }
}

