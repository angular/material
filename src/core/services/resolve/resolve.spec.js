describe('$mdResolve service', function () {
  beforeEach(module('material.core'));

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

  describe('resolve', function () {
    beforeEach(function () {
      module(function ($provide) {
        $provide.constant('ONE', 'one');
        $provide.constant('TWO', 'two');
        $provide.constant('THREE', 'three');
        $provide.constant('FOUR', 'four');
        $provide.constant('FIVE', 'five');
        $provide.constant('SIX', 'six');
      });
    });

    it('should resolve', inject(function ($q) {
      var resolve = {
        one: function () {
          return 'one';
        },
        two: function () {
          return $q.when('two');
        },
        three: 'THREE',
        four: $q.when('four')
      };

      var resolved = mdResolve(resolve);

      expect(resolved.one).toBe('one');
      expect(resolved.two).toBe('two');
      expect(resolved.three).toBe('three');
      expect(resolved.four).toBe('four');
    }));

    it('should locals', inject(function () {
      var locals = {
        one: 'one',
        two: 'TWO'
      };

      var resolved = mdResolve(null, locals);

      expect(resolved.one).toBe('one');
      expect(resolved.two).toBe('TWO');
    }));

    it('should resolve dependencies', inject(function ($q) {
      var locals = {
        one: 'one'
      };

      var resolve = {
        two: function (TWO) {
          return $q.when(TWO);
        },
        three: function (one, two, THREE) {
          return one == 'one' && two == 'two' && THREE;
        },
        four: 'FOUR',
        five: $q.when('five'),
        six: function (one, two, three, four, five, SIX) {
          return one == 'one' && two == 'two' && three == 'three' && four == 'four' && five == 'five' && SIX;
        }
      };

      var resolved = mdResolve(resolve, locals);

      expect(resolved.one).toBe('one');
      expect(resolved.two).toBe('two');
      expect(resolved.three).toBe('three');
      expect(resolved.four).toBe('four');
      expect(resolved.five).toBe('five');
      expect(resolved.six).toBe('six');
    }));

    it('should replace global', inject(function () {
      var locals = {
        ONE: 'locals one'
      };

      var resolve = {
        TWO: function () {
          return 'resolve two';
        }
      };

      var resolved = mdResolve(resolve, locals);

      expect(resolved.ONE).toBe('locals one');
      expect(resolved.TWO).toBe('resolve two');
    }));

    it('should not overwrite the original values', function () {
      var locals = {
        one: 'one'
      };

      var resolve = {
        two: function () {
          return 'two'
        }
      };

      var localsCopy = angular.copy(locals);
      var resolveCopy = angular.copy(resolve);

      mdResolve(resolve, locals);

      expect(locals).toEqual(localsCopy);
      expect(resolve).toEqual(resolveCopy);
    });
  });
});
