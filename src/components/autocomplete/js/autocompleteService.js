angular
  .module('material.components.autocomplete')
  .factory('$mdAutocomplete', MdAutocompleteService);

/**
 * @ngdoc service
 * @name $mdAutocomplete
 * @module material.components.autocomplete
 *
 * @description
 * `$mdAutocomplete` makes it easy to control your autocomplete directive.
 *
 * When you specified a `md-component-id` on the autocomplete, then you are able to use the `$mdAutocomplete` service.
 *
 * @usage
 * <hljs lang="js">
 * // Async lookup for autocomplete instance; will resolve when the instance is available
 * $mdAutocomplete(componentId).then(function(instance) {
 *   $log.debug( componentId + "is now ready" );
 * });
 *
 * // Clear the cache of the autocomplete
 * $mdAutocomplete(componentId).clearCache();
 * </hljs>
 */
function MdAutocompleteService($mdComponentRegistry, $q) {
  return function(handle) {

    // Lookup the controller instance for the specified autocomplete instance
    var instance = $mdComponentRegistry.get(handle);

    if (!instance) {
      $mdComponentRegistry.notFoundError(handle);
    }

    return {
      // -----------------
      // Sync methods
      // -----------------
      clearCache: function() {
        return instance && instance.clearCache();
      },
      // -----------------
      // Async methods
      // -----------------
      then: function(callbackFn) {
        var promise = instance ? $q.when(instance) : waitForInstance();
        return promise.then( callbackFn || angular.noop );
      }
    };

    /**
     * Deferred lookup of component instance using $component registry
     */
    function waitForInstance() {
      return $mdComponentRegistry
        .when(handle)
        .then(function(it) {
          instance = it;
          return it;
        });
    }
  };
}