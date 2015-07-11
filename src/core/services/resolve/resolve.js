angular.module('material.core')
  .service('$mdResolve', ResolveService);

/*
 * @ngdoc service
 * @name $mdResolve
 * @module material.core
 *
 * @description
 * The $mdResolve service helps to resolve acyclic dependencies.
 * Used internally in $mdCompiler service.
 *
 * ```js
 * var locals = {
 *   value: 'my value'
 * };
 * var resolve = {
 *   asyncService: function(value, $q) {
 *     return $q.when(value);
 *   },
 *   service: function(value, asyncService) {
 *     return value == asyncService;
 *   }
 * };
 * $mdResolve(resolve, locals).then(function(resolved) {
 *   assert(resolved.value == 'my value');
 *   assert(resolved.asyncService == 'my value');
 *   assert(resolved.service === true);
 * });
 * ```
 */

/* @ngInject */
function ResolveService($q, $injector) {
  /**
   * Resolve dependencies
   * @param {object} [resolve] hash of values that have to be resolved
   * @param {object} [locals] locals
   * @returns {object=} promise A promise, which will be resolved with a `resolved` object.
   */
  return function mdResolve(resolve, locals) {
    var resolved = angular.isObject(locals) ? angular.copy(locals) : {};

    if (angular.isObject(resolve)) {
      for (var name in resolve) {
        if (!resolve.hasOwnProperty(name)) continue;
        invoke(name, resolve, resolved);
      }
    }

    return $q.all(resolved);
  };

  /**
   * Take resolve value by name and invoke it.
   * Value can either be a string (value: 'MyRegisteredAngularConst'),
   * or an invokable 'factory' of sorts: (value: function ValueGetter($dependency) {}),
   * or Promise (value: $http.get(url).then(...)).
   */
  function invoke(name, resolve, resolved) {
    if (resolved.hasOwnProperty(name)) return resolved[name];
    if (!resolve.hasOwnProperty(name)) return;

    var value = resolve[name];

    if (angular.isString(value)) {
      resolved[name] = $injector.get(value);
    } else if (isPromise(value)) {
      resolved[name] = value;
    } else {
      var promises = {};
      $injector.annotate(value).forEach(function (name) {
        var value = invoke(name, resolve, resolved);
        if (!angular.isUndefined(value)) promises[name] = value;
      });

      resolved[name] = $q.all(promises).then(angular.bind($injector, $injector.invoke, value, null));
    }

    return resolved[name];
  }

  /**
   * Check is value Promise.
   */
  function isPromise(value) {
    return angular.isObject(value) && angular.isFunction(value.then);
  }
}
