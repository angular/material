describe('$mdResolve service', function () {
  beforeEach(module('material.core'));

  function isPromise(value) {
    return angular.isObject(value) && angular.isFunction(value.then);
  }

  describe('resolve', function () {
    function mdResolve(resolve, locals) {
      var resolved;
      inject(function ($mdResolve, $rootScope) {
        $mdResolve(resolve, locals).then(function (locals) {
          resolved = locals;
        });
        $rootScope.$apply();
      });
      return resolved;
    }

    it('should resolve without arguments', inject(function () {
      var resolved = mdResolve();

      expect(resolved).toEqual({});
    }));

    it('should resolve', module(function ($provide) {
      $provide.constant('VALUE', 'value');
      $provide.service('PROMISE', function ($q) {
        return $q.when('promise');
      });

      inject(function ($q, VALUE, PROMISE) {
        var resolve = {
          first: function () {
            return 'first';
          },
          second: function () {
            return $q.when('second');
          },
          third: $q.when('third'),
          providerValue: 'VALUE',
          providerPromise: 'PROMISE'
        };

        var resolved = mdResolve(resolve);

        expect(resolved.first).toBe('first');
        expect(isPromise(resolved.second)).toBe(false);
        expect(resolved.second).toBe('second');
        expect(isPromise(resolved.third)).toBe(false);
        expect(resolved.third).toBe('third');
        expect(resolved.providerValue).toBe(VALUE);
        expect(isPromise(resolved.providerPromise)).toBe(true);
        expect(resolved.providerPromise).toBe(PROMISE);
      });
    }));

    it('should resolve locals', inject(function ($q) {
      var value = 'value';
      var promise = $q.when('promise');

      var locals = {
        value: value,
        promise: promise
      };

      var resolved = mdResolve(null, locals);

      expect(resolved.value).toBe(value);
      expect(isPromise(resolved.promise)).toBe(true);
      expect(resolved.promise).toBe(promise);
    }));

    it('should resolve dependencies', module(function ($provide) {
      $provide.constant('PR_VALUE', 'VALUE');
      $provide.service('PR_PROMISE', function ($q) {
        return $q.when('PROMISE');
      });

      inject(function ($q, PR_VALUE, PR_PROMISE) {
        var VALUE = PR_VALUE;
        var PROMISE = PR_PROMISE;
        var value = 'value';
        var promise = $q.when('promise');

        var locals = {
          locValue: value,
          locPromise: promise
        };

        var resolve = {
          resValue: 'PR_VALUE',
          resPromise: 'PR_PROMISE',
          resolved: $q.when('resolved'),
          first: function ($q, PR_VALUE, PR_PROMISE, locValue, locPromise, resValue, resPromise, resolved) {
            return $q.when(PR_VALUE == VALUE && isPromise(PR_PROMISE) && PR_PROMISE == PROMISE &&
              locValue == value && isPromise(locPromise) && locPromise == promise &&
              resValue == VALUE && isPromise(resPromise) && resPromise == PROMISE && !isPromise(resolved) && resolved == 'resolved' &&
              'first');
          },
          second: function (PR_VALUE, PR_PROMISE, locValue, locPromise, resValue, resPromise, resolved, first) {
            return PR_VALUE == VALUE && isPromise(PR_PROMISE) && PR_PROMISE == PROMISE &&
              locValue == value && isPromise(locPromise) && locPromise == promise &&
              resValue == VALUE && isPromise(resPromise) && resPromise == PROMISE && !isPromise(resolved) && resolved == 'resolved' && !isPromise(first) && 'second'
          }
        };

        var resolved = mdResolve(resolve, locals);

        expect(resolved.locValue).toBe(value);
        expect(isPromise(resolved.locPromise)).toBe(true);
        expect(resolved.locPromise).toBe(promise);
        expect(resolved.resValue).toBe(VALUE);
        expect(isPromise(resolved.resPromise)).toBe(true);
        expect(resolved.resPromise).toBe(PROMISE);
        expect(isPromise(resolved.resolved)).toBe(false);
        expect(resolved.resolved).toBe('resolved');
        expect(isPromise(resolved.first)).toBe(false);
        expect(resolved.first).toBe('first');
        expect(resolved.second).toBe('second');
      });
    }));

    it('should priority', module(function ($provide) {
      $provide.constant('first', false);
      $provide.constant('third', true);

      inject(function () {
        var locals = {
          first: true,
          second: true
        };

        var resolve = {
          second: function () {
            return false;
          },
          _first: 'first',
          _second: 'second',
          _third: function (first, _first, second, _second, third) {
            return first && _first &&
              second && _second &&
              third;
          }
        };

        var resolved = mdResolve(resolve, locals);

        expect(resolved.first).toBe(true);
        expect(resolved._first).toBe(true);
        expect(resolved.second).toBe(true);
        expect(resolved._second).toBe(true);
        expect(resolved.third).toBe(true);
        expect(resolved._third).toBe(true);
      });
    }));

    it('should not overwrite the original values', function () {
      var locals = {
        first: true
      };

      var resolve = {
        second: function () {
          return true;
        }
      };

      var localsCopy = angular.copy(locals);
      var resolveCopy = angular.copy(resolve);

      mdResolve(resolve, locals);

      expect(locals).toEqual(localsCopy);
      expect(resolve).toEqual(resolveCopy);
    });

    it('should pass locals by reference', inject(function () {
      var value = {};

      var locals = {
        value: value
      };

      var resolved = mdResolve(null, locals);

      expect(resolved.value).toBe(value);
    }));
  });
});
