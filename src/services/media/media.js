angular.module('material.services.media', [
  'material.core'
])

.factory('$mdMedia', [
  '$window',
  '$mdUtil',
  '$timeout',
  mdMediaFactory
]);

function mdMediaFactory($window, $mdUtil, $timeout) {
  var cache = $mdUtil.cacheFactory('$mdMedia', { capacity: 15 });
  var presets = {
    sm: '(min-width: 600px)',
    md: '(min-width: 960px)',
    lg: '(min-width: 1200px)'
  };

  angular.element($window).on('resize', updateAll);

  return $mdMedia;

  function $mdMedia(query) {
    query = validate(query);
    var result;
    if ( !angular.isDefined(result = cache.get(query)) ) {
      return add(query);
    }
    return result;
  }

  function validate(query) {
    return presets[query] || (
      query.charAt(0) != '(' ?  ('(' + query + ')') : query
    );
  }

  function add(query) {
    return cache.put(query, !!$window.matchMedia(query).matches);
  }
  
  function updateAll() {
    var keys = cache.keys();
    if (keys.length) {
      for (var i = 0, ii = keys.length; i < ii; i++) {
        cache.put(keys[i], !!$window.matchMedia(keys[i]).matches);
      }
      // trigger an $digest()
      $timeout(angular.noop);
    }
  }

}
