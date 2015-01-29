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
function mdMediaFactory($mdConstant, $rootScope, $window) {
  var queries = {};
  var results = {};

  return $mdMedia;

  function $mdMedia(query) {
    var validated = queries[query];
    if (angular.isUndefined(validated)) {
      validated = queries[query] = validate(query);
    }

    var result = results[validated];
    if (angular.isUndefined(result)) {
      result = add(validated);
    }

    return result;
  }

  function validate(query) {
    return $mdConstant.MEDIA[query] ||
           ((query.charAt(0) !== '(') ? ('(' + query + ')') : query);
  }

  function add(query) {
    var result = $window.matchMedia(query);
    result.addListener(onQueryChange);
    return (results[result.media] = !!result.matches);
  }

  function onQueryChange() {
    var query = this;
    $rootScope.$evalAsync(function() {
      results[query.media] = !!query.matches;
    });
  }

}
