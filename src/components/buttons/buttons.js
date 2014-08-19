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

      var href = attr.ngHref || attr.href;
      if (href) {
        var innerAnchor = angular.element('<a>')
          .addClass('material-button-inner')
          .attr('ng-href', href);
        element.append(innerAnchor);
      }

      return function postLink(scope, element, attr, ctrl, transclude) {

        // Put the content of the <material-button> inside after the ripple
        transclude(scope, function(clone) {
          element.append(clone);
        });

        element.attr({
          role: 'button',
          tabIndex: '0'
        });

        configureButton(attr.type);

        /**
         * If a type attribute is specified, dynamically insert a <button> element.
         * This is vital to allow <material-button> to be used as form buttons
         * @param type
         */
        function configureButton(type) {
          if (type) {
            var innerButton = angular.element('<button>')
              .attr('type', type)
              .addClass('material-button-inner');
            element.append(innerButton);
          }
        }

      };

    }
  };

}
