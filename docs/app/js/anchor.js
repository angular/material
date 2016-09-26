(function() {
  angular
    .module('docsApp')
    .directive('h4', MdAnchorDirective)
    .directive('h3', MdAnchorDirective)
    .directive('h2', MdAnchorDirective)
    .directive('h1', MdAnchorDirective);

  function MdAnchorDirective($mdUtil) {

    /** @const @type {RegExp} */
    var unsafeCharRegex = /[&\s+$,:;=?@"#{}|^~[`%!'\].\/()*\\]/g;

    return {
      restrict: 'E',
      scope: {},
      template: '<a class="docs-anchor" ng-href="#{{ name }}" name="{{ name }}" ng-transclude></a>',
      transclude: true,
      link: postLink
    };

    function postLink(scope, element) {

      // Delay the URL creation, because the inner text might be not interpolated yet.
      $mdUtil.nextTick(createContentURL);

      /**
       * Creates URL from the text content of the element and writes it into the scope.
       */
      function createContentURL() {
        scope.name = element.text()
          .trim()                           // Trim text due to browsers extra whitespace.
          .replace(/'/g, '')                // Transform apostrophes words to a single one.
          .replace(unsafeCharRegex, '-')    // Replace unsafe chars with a dash symbol.
          .replace(/-{2,}/g, '-')           // Remove repeating dash symbols.
          .replace(/^-|-$/g, '')            // Remove preceding or ending dashes.
          .toLowerCase();                   // Link should be lower-case for accessible URL.
      }
    }
  }

  // Manually specify $inject because Strict DI is enabled.
  MdAnchorDirective.$inject = ['$mdUtil'];

})();