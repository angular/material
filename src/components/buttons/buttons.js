/**
 * @ngdoc module
 * @name material.components.buttons
 * @description
 *
 * Button
 */
angular.module('material.components.button', [
  'material.animations',
  'material.services.aria'
])
  .directive('materialButton', [
    'ngHrefDirective',
    '$materialInkRipple',
    '$aria',
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
 * @param {string=} ng-href Optional attribute to support both ARIA and link navigation
 * @param {string=} href Optional attribute to support both ARIA and link navigation
 * @param {string=} ariaLabel Publish the button label used by screen-readers for accessibility. Defaults to the radio button's text.
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
function MaterialButtonDirective(ngHrefDirectives, $materialInkRipple, $aria ) {
  var ngHrefDirective = ngHrefDirectives[0];

  return {
    restrict: 'E',
    compile: function(element, attr) {
      var innerElement;
      var attributesToCopy;

      // Add an inner anchor if the element has a `href` or `ngHref` attribute,
      // so this element can be clicked like a normal `<a>`.
      if (attr.ngHref || attr.href) {
        innerElement = angular.element('<a>');
        attributesToCopy = ['ng-href', 'href', 'rel', 'target'];
      // Otherwise, just add an inner button element (for form submission etc)
      } else {
        innerElement = angular.element('<button>');
        attributesToCopy = ['type', 'disabled', 'ng-disabled', 'form'];
      }

      angular.forEach(attributesToCopy, function(name) {
        var camelCaseName = Util.camelCase(name);
        if (attr.hasOwnProperty(camelCaseName)) {
          innerElement.attr(name, attr[camelCaseName]);
        }
      });

      innerElement
        .addClass('material-button-inner')
        .append(element.contents())
        // Since we're always passing focus to the inner element,
        // add a focus class to the outer element so we can still style
        // it with focus.
        .on('focus', function() {
          element.addClass('focus');
        })
        .on('blur', function() {
          element.removeClass('focus');
        });

      element.
        append(innerElement)
        .attr('tabIndex', -1)
        //Always pass focus to innerElement
        .on('focus', function() {
          innerElement.focus();
        });

      return function postLink(scope, element, attr) {
        $aria.expect(element, 'aria-label', element.text());
        $materialInkRipple.attachButtonBehavior(element);
      };
    }
  };

}
