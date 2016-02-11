(function() {

  var PREFIX_REGEXP = /^((?:x|data)[\:\-_])/i;
  var SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
  var DIRECTIVE_PREFIX = "md-media-";
  var BREAKPOINTS = ["xs", "gt-xs", "sm", "gt-sm", "md", "gt-md", "lg", "gt-lg", "xl", "print"];

  /**
   * @ngdoc module
   * @name material.components.media
   * @description
   * Media module
   */
  registerMediaDirectives(angular.module('material.components.media', ['material.core']));

  function registerMediaDirectives(module) {

    angular.forEach(BREAKPOINTS, function (breakpoint) {
      var directiveName = directiveNormalize(DIRECTIVE_PREFIX + breakpoint);
      module.directive(directiveName, registerBreakpointDirective(breakpoint));
    });
  }

  /**
   * @ngdoc directive
   * @name mdMedia
   * @module material.components.media
   *
   * @restrict A
   *
   * @description
   * The `md-media` directive is a wrapper for the `$mdMedia` service.</br>
   * It allows you to add classes on a specific screen size using breakpoints.
   *
   * <h3>Available breakpoints</h3>
   <table class="md-api-table">
   *    <thead>
   *    <tr>
   *      <th>Attribute</th>
   *      <th>Media Query</th>
   *    </tr>
   *    </thead>
   *    <tbody>
   *    <tr>
   *      <td>md-media-xs</td>
   *      <td>(max-width: 599px)</td>
   *    </tr>
   *    <tr>
   *      <td>md-media-gt-xs</td>
   *      <td>(min-width: 600px)</td>
   *    </tr>
   *    <tr>
   *      <td>md-media-sm</td>
   *      <td>(min-width: 600px) and (max-width: 959px)</td>
   *    </tr>
   *    <tr>
   *      <td>md-media-gt-sm</td>
   *      <td>(min-width: 960px)</td>
   *    </tr>
   *    <tr>
   *      <td>md-media-md</td>
   *      <td>(min-width: 960px) and (max-width: 1279px)</td>
   *    </tr>
   *    <tr>
   *      <td>md-media-gt-md</td>
   *      <td>(min-width: 1280px)</td>
   *    </tr>
   *    <tr>
   *      <td>md-media-lg</td>
   *      <td>(min-width: 1280px) and (max-width: 1919px)</td>
   *    </tr>
   *    <tr>
   *      <td>md-media-gt-lg</td>
   *      <td>(min-width: 1920px)</td>
   *    </tr>
   *    <tr>
   *      <td>md-media-xl</td>
   *      <td>(min-width: 1920px)</td>
   *    </tr>
   *    <tr>
   *      <td>md-media-print</td>
   *      <td>print</td>
   *    </tr>
   *    </tbody>
   *  </table>
   *
   * @usage
   * <hljs lang="html">
   *   <div class="red" md-media-sm="blue" md-media-gt-sm="orange">
   *     This Box changes its color on specific screen sizes.
   *   </div>
   * </hljs>
   */
  function registerBreakpointDirective(breakpoint) {

    return ['$mdMedia', function ($mdMedia) {
      return {
        restrict: 'A',
        link: postLink
      };

      function postLink(scope, element, attr) {
        var classes = [];

        attr.$observe(directiveNormalize(DIRECTIVE_PREFIX + breakpoint), function (value) {
          classes = parseClasses(value);
        });

        scope.$watch(function () {
          return $mdMedia(breakpoint);
        }, function (value) {
          toggleClasses(value);
        });

        function toggleClasses(value) {
          for (var i = 0; i < classes.length; i++) {
            element.toggleClass(classes[i], value);
          }
        }

        function parseClasses(value) {
          return value.split(/ /g);
        }
      }
    }];
  }

  /**
   * Converts snake_case to camelCase.
   * Also there is special case for Moz prefix starting with upper case letter.
   * @param name Name to normalize
   */
  function directiveNormalize(name) {
    return name
      .replace(PREFIX_REGEXP, '')
      .replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset) {
        return offset ? letter.toUpperCase() : letter;
      });
  }

})();