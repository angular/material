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

  return function createInterimElement(defaults) {

    /**
     * @ngdoc type
     * @name $$interimElementFactory.$interimElement
     *
     * @description
     * A service used to control inserting and removing an element into the DOM.
     *
     */

    var InterimElement = {};

    var itemStack = [];

    var parent = $rootElement.find('body');
    if (!parent.length) parent = $rootElement;

    InterimElement.defaults = angular.extend({
      parent: parent,
      enter: function(scope, $el, options) {
        return $animate.enter($el, options.parent);
      },
      leave: function(scope, $el, options) {
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
      if (itemStack.length) {
        InterimElement.hide();
      }

      var item = new InterimItem(options);
      itemStack.push(item);
      item.show();

      return item.dfd.promise;
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
      var item = itemStack.shift();
      var args = [].slice.call(arguments);
      item.destroy().then(function() {
        item.dfd.resolve.apply(item.dfd, args);
      });
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
      var item = itemStack.shift();
      var args = [].slice.call(arguments);
      item.destroy().then(function() {
        item.dfd.reject.apply(item.dfd, args);
      });
    };


    return InterimElement;

    function InterimItem(options) {
      var self;
      var dfd = $q.defer();
      var hideTimeout;

      options = options || {};

      options = angular.extend({
        scope: options.scope || $rootScope.$new(options.isolateScope)
      }, InterimElement.defaults, options);

      self = {
        options: options,
        dfd: dfd,
        compile: function() {
          if (self.element) { return true; }
          return $materialCompiler.compile(options).then(function(compiledData) {
            self.element = compiledData.link(options.scope);
          });
        },
        show: function() {
          $q.when(self.compile()).then(function() {
            var ret = options.enter(options.scope, self.element, options);
            $q.when(ret)
              .then(function() {
                if (options.hideDelay) {
                  // Only start hide timer after show animation...
                  hideTimeout = $timeout(InterimElement.hide, options.hideDelay) ;
                }
            });
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
          var ret = options.leave(options.scope, self.element, options);
          return $q.when(ret).then(function() {
            options.scope.$destroy();
            finish.resolve();
          });
        }
      };
      return self;
    }
  }

}

