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
    locals = angular.extend({}, locals);
    var resolved = {};

    if (angular.isObject(resolve)) {
      for (var name in resolve) {
        if (!resolve.hasOwnProperty(name)) continue;
        invoke(name, resolve, locals, resolved);
      }
    }

    return $q.all(resolved).then(function (resolved) {
      return angular.extend(resolved, locals);
    });
  };

  /**
   * Take resolve value by name and invoke it.
   * Value can either be a string (value: 'MyRegisteredAngularConst'),
   * or an invokable 'factory' of sorts: (value: function ValueGetter($dependency) {}),
   * or Promise (value: $http.get(url).then(...)).
   */
  function invoke(name, resolve, locals, resolved) {
    if (locals.hasOwnProperty(name) ||
      resolved.hasOwnProperty(name) || !resolve.hasOwnProperty(name)) return;

    var value = resolve[name];

    if (angular.isString(value)) {
      locals[name] = $injector.get(value);
    } else if (isPromise(value)) {
      resolved[name] = value;
    } else {
      var _resolved = {}, _locals = {};
      $injector.annotate(value).forEach(function (name) {
        invoke(name, resolve, locals, resolved);
        if (locals.hasOwnProperty(name)) {
          _locals[name] = locals[name];
        } else if (resolved.hasOwnProperty(name)) {
          _resolved[name] = resolved[name];
        }
      });

      resolved[name] = $q.all(_resolved).then(function (resolved) {
        return $injector.invoke(value, null, angular.extend(resolved, _locals));
      });
    }
  }

  /**
   * Check is value Promise.
   */
  function isPromise(value) {
    return angular.isObject(value) && angular.isFunction(value.then);
  }
}
