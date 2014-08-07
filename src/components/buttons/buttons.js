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
 * `<material-button type="" disabled noink>` is a button directive with optional ink ripples (default enabled).
 *
 * @param {boolean=} noink Flag indicates use of ripple ink effects
 * @param {boolean=} disabled Flag indicates if the tab is disabled: not selectable with no ink effects
 * @param {string=} type Optional attribute to specific button types (useful for forms); such as 'submit', etc.
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
function MaterialButtonDirective() {
  return {
    restrict: 'E',
    transclude: true,
    template: '<material-ripple start="center" initial-opacity="0.25" opacity-decay-velocity="0.75"></material-ripple>',
    link: function(scope, element, attr, ctrl, transclude) {

      // Put the content of the <material-button> inside after the ripple

      transclude(scope, function(clone) {
        element.append(clone);
      });

      //

      configureInk(attr.noink);
      configureButton(attr.type);

      /**
       * If the inkRipple is disabled, then remove the ripple area....
       * NOTE: <material-ripple/> directive replaces itself with `<canvas.material-ink-ripple />` element
       * @param isDisabled
       */
      function configureInk(noInk) {
        if ( noInk ) {
          element.find('canvas').remove();
        }
      }

      /**
       * If a type attribute is specified, dynamically insert a <button> element.
       * This is vital to allow <material-button> to be used as form buttons
       * @param type
       */
      function configureButton(type) {
        var hasButton = !!element.find('button');
        if (type && !hasButton) {
          var innerButton = angular.element('<button>')
                .attr('type', type)
                .addClass('material-inner-button');
          element.append(innerButton);
        }
      }
    }
  };

}
