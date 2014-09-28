/**
 * @ngdoc module
 * @name material.services.interimElement
 * @description InterimElement
 */

angular.module('material.services.interimElement', [
  'material.services.compiler'
])
.factory('$$interimElementFactory', [
  '$q',
  '$rootScope',
  '$timeout',
  '$rootElement',
  '$animate',
  '$materialCompiler',
  InterimElementFactory
]);

/**
 * @ngdoc service
 * @name $$interimElementFactory
 *
 * @description
 *
 * Factory that contructs `$$interimElementFactory.$interimElement` services. 
 * Used internally in material for elements that appear on screen temporarily.
 * The service provides a promise-like API for interacting with the temporary
 * elements.
 *
 * ```js
 * app.service('myInterimElementService', function($$interimElementFactory) {
 *   var myInterimElementService = $$interimElementFactory(toastDefaultOptions);
 *   return myInterimElementService;
 * });
 * ```
 * @param {object=} defaultOptions Options used by default for the `show` method on the service.
 *
 * @returns {InterimElementFactory.interimElement}
 *
 */

function InterimElementFactory($q, $rootScope, $timeout, $rootElement, $animate, $materialCompiler) {

  return createInterimElement;

  function createInterimElement(defaults) {

    /**
     * @ngdoc type
     * @name $$interimElementFactory.$interimElement
     *
     * @description
     * A service used to control inserting and removing an element into the DOM.
     *
     */

    var InterimElement = {};

    var deferred = [];
    var hideTimeouts = [];
    var elementStack = [];
    var optionsStack = [];

    var parent = $rootElement.find('body');
    if (!parent.length) parent = $rootElement;

    InterimElement.defaults = angular.extend({
      parent: parent,
      onShow: function(scope, $el, options) {
        return $animate.enter($el, options.parent);
      },
      onHide: function(scope, $el, options) {
        return $animate.leave($el);
      },
    }, defaults || {});

    /**
     * @ngdoc method
     * @name $$interimElementFactory.$interimElement#show
     * @kind function
     *
     * @description
     * Compiles and inserts an element into the DOM.
     *
     * @param {Object} options Options object to compile with.
     *
     * @returns {Promise} Promise that will resolve when the service
     * has `#close()` or `#cancel()` called.
     *
     */

    InterimElement.show = function(options) {
      if (deferred.length) {
        InterimElement.hide();
      }

      var defer = $q.defer();
      deferred.push(defer);

      options = options || {};

      options = angular.extend({
        scope: options.scope || $rootScope.$new(options.isolateScope)
      }, InterimElement.defaults, options);

      optionsStack.push(options);

      $materialCompiler.compile(options).then(function(compiledData) {
        var currentEl = compiledData.link(options.scope);
        elementStack.push(currentEl);

        var ret = options.onShow(options.scope, currentEl, options);
        $q.when(ret).then(function() {
          if (options.hideTimeout) {
            hideTimeout = $timeout(InterimElement.hide, options.hideTimeout);
          }
        });
      });
      return defer.promise;
    };

    /**
     * @ngdoc method
     * @name $$interimElementFactory.$interimElement#hide
     * @kind function
     *
     * @description
     * Removes the `$interimElement` from the DOM and resolves the promise returned from `show`
     *
     * @param {*} args Data to resolve the promise with
     *
     * @returns {undefined}
     *
     */

    InterimElement.hide = function() {
      var args = [].slice.call(arguments);
      var def = deferred.shift();
      if(def) {
        destroy().then(function() {
          def.resolve.apply(def, args);
        });
      }
    };

    /**
     * @ngdoc method
     * @name $$interimElementFactory.$interimElement#cancel
     * @kind function
     *
     * @description
     * Removes the `$interimElement` from the DOM and rejects the promise returned from `show`
     *
     * @param {*} args Data to reject the promise with
     *
     * @returns {undefined}
     *
     */

    InterimElement.cancel = function() {
      var args = [].slice.call(arguments);
      var def = deferred.shift();
      if(def) {
        destroy().then(function() {
          def.reject.apply(def, args);
        });
      }
    };

    function destroy() {
      var finish = $q.defer();
      if (hideTimeouts.length) {
        $timeout.cancel(hideTimeouts.shift());
      }

      var options = optionsStack.shift();
      var ret = options.onHide(options.scope, elementStack.shift(), options);
      return $q.when(ret).then(function() {
        options.scope.$destroy();
        finish.resolve();
      });
    }

    return InterimElement;
  }
}

