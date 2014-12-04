angular.module('material.core')
    .factory('$mdMedia', mdMediaFactory);

/**
 * Exposes a function on the '$mdMedia' service which will return true or false,
 * whether the given media query matches. Re-evaluates on resize. Allows presets
 * for 'sm', 'md', 'lg'.
 *
 * @example $mdMedia('sm') == true if device-width <= sm
 * @example $mdMedia('(min-width: 1200px)') == true if device-width >= 1200px
 * @example $mdMedia('max-width: 300px') == true if device-width <= 300px (sanitizes input, adding parens)
 */
function mdMediaFactory($window, $mdUtil, $timeout, $mdConstant) {
    var cache = $mdUtil.cacheFactory('$mdMedia', { capacity: 15 });

    angular.element($window).on('resize', updateAll);

    return $mdMedia;

    function $mdMedia(query) {
        query = validate(query);
        var result;
        if (!angular.isDefined(result = cache.get(query)) ) {
            return add(query);
        }
        return result;
    }

    function validate(query) {
        return $mdConstant.MEDIA[query] || (
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
            // trigger a $digest()
            $timeout(angular.noop);
        }
    }

}
