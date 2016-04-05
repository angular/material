angular
  .module('material.core')
  .factory('$$mdAPI', mdAPIFactory);

/**
 * @ngdoc service
 * @name $$mdAPI
 * @module material.core
 *
 * @description
 *
 * Factory that constructs a public API.
 * Used internally by ngMaterial to provide a public interface with restricted methods.
 * Once the factory generated the service, the service will allow an async lookup for instances and more.
 *
 * ### Basics
 * When creating a public API, then there must be an instance, which is stored into the `$mdComponentRegistry`.
 * It is recommended, to register the instance by using the `$$mdAPI` function, instead of the native
 * `$mdComponentRegistry`.
 *
 * ### Error Handling
 * An `$$mdAPI` generated service can also hold a `onError` function, which will be called when there is no instance
 * present yet.
 *
 * For example, when the user calls a registered method, but there is no instance found yet, then `onError` will be
 * called, and when a return value is present, then it will be used for the registered method's return value.
 *
 * **Notice**: The `onError` function is not working when using a stored configuration.
 *
 * ### Stored Configuration
 * When using a stored configuration, then the `$$mdAPI` factory will register the current configuration in the
 * component registry.
 *
 * That means, that the following variables will have another value:
 * - `this.instance`: The previous stored configuration
 *
 * ### Inside of provided functions
 * Every provided function will be called within a special context, which provides the following variables:
 *
 * - `this.instance`: The previous loaded instance
 * - `this.registryName`: The unique id of the instance.
 *
 * @usage
 * <hljs lang="js">
 *   function MdSidenavFactory($$mdAPI) {
 *     return $$mdAPI()
 *       .addMethod('open', openFn)
 *       .create();
 *
 *     function openFn() {
 *       // This call the instanceFn function, which is defined in the instance for the current componnent id.
 *       this.instance.instanceFn();
 *     }
 *   }
 * </hljs>
 *
 * This is how an instance object can be registered in the `$mdComponentRegistry`.
 * <hljs lang="js">
 *   function postLink(scope, element, attrs) {
 *     $$mdAPI.register({
 *       instanceFn: $scope.instanceFn
 *     }, 'leftSidenav');
 *   }
 * </hljs>
 *
 * The `$$mdAPI` factory can be also used without an instance object.
 * <hljs lang="js">
 *   function postLink($$mdAPI) {
 *     $$mdAPI()
 *       .addMethod('open', $scope.instanceFn)
 *       .store('leftSidenav')
 *   }
 *
 *   function $mdSidenavFactory($$mdAPI) {
 *     return $$mdAPI()
 *       // This loads the stored configuration which is responsible for the current component id.
 *       .load()
 *       .create()
 * </hljs>
 *
 */
function mdAPIFactory($mdComponentRegistry, $q) {

  function MdAPIService() {
    var API;
    var loadStoredConfig = false;
    var config = {
      methods: {}
    };

    return API = {
      onError: _setOnError,
      addMethod: _addMethod,
      create: _createFactory,
      store: _storeAsInstance,
      load: _setLoadStoredConfig
    };

    function _setOnError(fn) {
      config.onError = fn;
      return API;
    }

    function _addMethod(name, fn) {
      if (typeof fn !== 'function') {
        throw new Error('$$mdAPI: Error while registering the method ' + name + '. The value is not a function');
      }

      config.methods[name] = fn;
      return API;
    }

    function _storeAsInstance(componentId) {
      return $mdComponentRegistry.register(config, componentId);
    }

    function _setLoadStoredConfig() {
      loadStoredConfig = true;
      return API;
    }

    function _createFactory() {
      return function(registryName) {

        function FactoryFunction() {
          this.registryName = registryName;
          this.instance = $mdComponentRegistry.get(registryName);

          if (!this.instance && !loadStoredConfig) {
            $mdComponentRegistry.notFoundError(registryName);

          } else if (this.instance && loadStoredConfig) {
            if (!this.instance.methods) {
              throw new Error('$$mdAPI: No stored configuration found for name: ' + registryName);
            }

            applyConfigMethods(this.instance.methods);
          }
        }

        // This is a default function for every factory function.
        // It allows the user to asynchronously lookup for the instance.
        FactoryFunction.prototype.then = function(resolveFn) {
          var self = this;

          var result = this.instance ? $q.when(this.instance) :
            $mdComponentRegistry
              .when(this.registryName)
              .then(function(val) {
                self.instance = val;

                if (loadStoredConfig) {
                  applyConfigMethods(self.instance.methods);

                  // We return the configuration methods, because otherwise the async lookup
                  // is only returning the stored configuration. This allows the user to easily access
                  // the methods through the async instance.
                  return self.instance.methods;
                }

                return val;
              });

          return result.then(resolveFn || angular.noop);
        };

        // This registers our custom provided methods and applies them to the prototype of our
        // factory function.
        applyConfigMethods(config.methods);

        // This creates our object, we are not using a simple JSON object here, because we wan't to to take
        // advantage of the function context.
        return new FactoryFunction();

        function applyConfigMethods(methods) {
          angular.forEach(methods, function(value, key) {

            FactoryFunction.prototype[key] = function() {
              if (!this.instance) {
                var res = config.onError(this.registryName);
                // When the onError function returns a value, then it should be returned.
                if (res) return res;
              }

              return value.apply(this, arguments);
            };

          });
        }
      };
    }
  }

  // This is a public function, which allows the user to register its instance directly
  // by using the $$mdAPI service. This provides a flat API for creating public interfaces.
  MdAPIService.register = function(instance, id) {
    return $mdComponentRegistry.register(instance, id);
  };

  return MdAPIService;
}