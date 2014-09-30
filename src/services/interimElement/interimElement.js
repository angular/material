/**
 * @ngdoc module
 * @name material.services.interimElement
 * @description InterimElement
 */

angular.module('material.services.interimElement', [
  'material.services.compiler'
])
.factory('$$interimElement', [
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
 * @name $$interimElement
 *
 * @description
 *
 * Factory that contructs `$$interimElement.$interimElementService` services. 
 * Used internally in material for elements that appear on screen temporarily.
 * The service provides a promise-like API for interacting with the temporary
 * elements.
 *
 * ```js
 * app.service('$materialToast', function($$interimElement) {
 *   var $materialToast = $$interimElement(toastDefaultOptions);
 *   return $materialToast;
 * });
 * ```
 * @param {object=} defaultOptions Options used by default for the `show` method on the service.
 *
 * @returns {InterimElement.interimElementService}
 *
 */

function InterimElementFactory($q, $rootScope, $timeout, $rootElement, $animate, $materialCompiler) {

  return function createInterimElementService(defaults) {

    /**
     * @ngdoc type
     * @name $$interimElement.$interimElement
     *
     * @description
     * A service used to control inserting and removing an element into the DOM.
     *
     */

    var InterimElementService = {};

    var stack = [];

    var parent = $rootElement.find('body');
    if (!parent.length) parent = $rootElement;

    InterimElementService.defaults = angular.extend({
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
     * @name $$interimElement.$interimElementService#show
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

    InterimElementService.show = function(options) {
      if (stack.length) {
        InterimElementService.hide();
      }

      var interimElement = new InterimElement(options);
      stack.push(interimElement);
      return interimElement.show().then(function() {
        return interimElement.dfd.promise;
      });
    };

    /**
     * @ngdoc method
     * @name $$interimElement.$interimElementService#hide
     * @kind function
     *
     * @description
     * Removes the `$interimElement` from the DOM and resolves the promise returned from `show`
     *
     * @param {*} resolveParam Data to resolve the promise with
     *
     * @returns {Promise} promise that resolves after the element has been removed.
     *
     */

    InterimElementService.hide = function(resolveParam) {
      var interimElement = stack.shift();
      return interimElement.destroy().then(function() {
        interimElement.dfd.resolve(resolveParam);
      });
    };

    /**
     * @ngdoc method
     * @name $$interimElement.$interimElementService#cancel
     * @kind function
     *
     * @description
     * Removes the `$interimElement` from the DOM and rejects the promise returned from `show`
     *
     * @param {*} rejectParam Data to reject the promise with
     *
     * @returns {Promise} promise that resolves after the element has been removed.
     *
     */

    InterimElementService.cancel = function(rejectParam) {
      var interimElement = stack.shift();
      return interimElement.destroy().then(function() {
        interimElement.dfd.reject(rejectParam);
      });
    };


    return InterimElementService;

    function InterimElement(options) {
      var self;
      var hideTimeout, element;

      options = options || {};

      options = angular.extend({
        scope: options.scope || $rootScope.$new(options.isolateScope)
      }, InterimElementService.defaults, options);

      self = {
        options: options,
        dfd: $q.defer(),
        show: function() {
          return $materialCompiler.compile(options).then(function(compiledData) {
            element = compiledData.link(options.scope);
            var ret = options.onShow(options.scope, element, options);
            return $q.when(ret)
              .then(startHideTimeout);

            function startHideTimeout() {
              if (options.hideDelay) {
                hideTimeout = $timeout(InterimElementService.hide, options.hideDelay) ;
              }
            }
          });
        },
        cancelTimeout: function() {
          if (hideTimeout) {
            $timeout.cancel(hideTimeout);
            hideTimeout = undefined;
          }
        },
        destroy: function() {
          var finish = $q.defer();
          self.cancelTimeout();
          var ret = options.onHide(options.scope, element, options);
          return $q.when(ret).then(function() {
            options.scope.$destroy();
            finish.resolve();
          });
        }
      };
      return self;
    }
  };
}

