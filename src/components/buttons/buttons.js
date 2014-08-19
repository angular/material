/**
 * @ngdoc module
 * @name material.components.buttons
 * @description
 *
 * Button
 */
angular.module('material.components.button', [
  'material.animations',
])
  .directive('materialButton', [
    'ngHrefDirective',
    MaterialButtonDirective
  ]);

/**
 * @ngdoc directive
 * @name materialButton
 * @order 0
 *
 * @restrict E
 *
 * @description
 * `<material-button>` is a button directive with optional ink ripples (default enabled).
 *
 * @param {boolean=} noink Flag indicates use of ripple ink effects
 * @param {boolean=} disabled Flag indicates if the tab is disabled: not selectable with no ink effects
 * @param {string=} type Optional attribute to specific button types (useful for forms); such as 'submit', etc.
 * @param {string=} ng-ref Optional attribute to support both ARIA and link navigation
 * @param {string=} href Optional attribute to support both ARIA and link navigation
 *
 * @usage
 * <hljs lang="html">
 *  <material-button>Button</material-button>
 *  <br/>
 *  <material-button noink class="material-button-colored">
 *    Button (noInk)
 *  </material-button>
 *  <br/>
 *  <material-button disabled class="material-button-colored">
 *    Colored (disabled)
 *  </material-button>
 * </hljs>
 */
function MaterialButtonDirective(ngHrefDirectives) {
  var ngHrefDirective = ngHrefDirectives[0];
  return {
    restrict: 'E',
    transclude: true,
    template: '<material-ripple start="center" initial-opacity="0.25" opacity-decay-velocity="0.75"></material-ripple>',
    compile: function(element, attr) {

      // Add an inner anchor if the element has a `href` or `ngHref` attribute,
      // so this element can be clicked like a normal `<a>`.
      var href = attr.ngHref || attr.href;
      var innerElement;
      if (href) {
        innerElement = angular.element('<a>')
          .attr('ng-href', href)
          .attr('rel', attr.rel)
          .attr('target', attr.target);

      // Otherwise, just add an inner button element (for form submission etc)
      } else {
        innerElement = angular.element('<button>')
          .attr('type', attr.type)
          .attr('disabled', attr.ngDisabled || attr.disabled)
          .attr('form', attr.form);
      }
      innerElement.addClass('material-button-inner');
      element.append(innerElement);

      return function postLink(scope, element, attr, ctrl, transclude) {
        // Put the content of the <material-button> inside after the ripple
        // and inner elements
        transclude(scope, function(clone) {
          element.append(clone);
        });
      };
    }
  };

}
