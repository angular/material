(function() {
  angular
    .module('docsApp')
    .directive('h4', MdAnchorDirective)
    .directive('h3', MdAnchorDirective)
    .directive('h2', MdAnchorDirective)
    .directive('h1', MdAnchorDirective);

  function MdAnchorDirective($mdUtil, $compile, $rootScope) {

    /** @const @type {RegExp} */
    var unsafeCharRegex = /[&\s+$,:;=?@"#{}|^~[`%!'\]./()*\\]/g;

    return {
      restrict: 'E',
      scope: {},
      require: '^?mdContent',
      link: postLink
    };

    function postLink(scope, element, attr, ctrl) {

      // Only create anchors when being inside of a md-content.
      // Don't create anchors for menu headers as they have no associated content.
      if (!ctrl || element[0].classList && element[0].classList.contains('menu-heading')) {
        return;
      }

      var anchorEl = $compile('<a class="docs-anchor" ng-href="{{ href }}" name="{{ name }}"></a>')(scope);

      // Wrap contents inside of the anchor element.
      anchorEl.append(element.contents());

      // Append the anchor element to the directive element.
      element.append(anchorEl);

      // Delay the URL creation, because the inner text might be not interpolated yet.
      $mdUtil.nextTick(createContentURL);

      /**
       * Creates URL from the text content of the element and writes it into the scope.
       */
      function createContentURL() {
        var path = '';
        var name = element.text();
        // Use $window.location.pathname to get the path with the baseURL included.
        // $location.path() does not include the baseURL. This is important to support how the docs
        // are deployed with baseURLs like /latest, /HEAD, /1.1.13, etc.
        if (scope.$root.$window && scope.$root.$window.location) {
          path = scope.$root.$window.location.pathname;
        }
        name = name
          .trim()                           // Trim text due to browsers extra whitespace.
          .replace(/'/g, '')                // Transform apostrophes words to a single one.
          .replace(unsafeCharRegex, '-')    // Replace unsafe chars with a dash symbol.
          .replace(/-{2,}/g, '-')           // Remove repeating dash symbols.
          .replace(/^-|-$/g, '')            // Remove preceding or ending dashes.
          .toLowerCase();                   // Link should be lower-case for accessible URL.
        scope.name = name;
        scope.href = path + '#' + name;
      }
    }
  }

  // Manually specify $inject because Strict DI is enabled.
  MdAnchorDirective.$inject = ['$mdUtil', '$compile'];

})();
