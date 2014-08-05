/**
 * @ngdoc module
 * @name material.components.buttons
 * @description
 *
 * Button
 */
angular.module('material.components.button', [])
  .directive('materialButton', MaterialButtonDirective);

/**
 * @ngdoc directive
 * @name materialButton
 * @order 0
 *
 * @restrict E
 *
 * @description
 * `material-button` is either a standard `<button>` markup with `material-button`
 * CSS or a `<material-button>` directive with optional ink ripples.
 *
 * @usage
 * <hljs lang="html">
 *  <material-button>
 *    <button class="material-button">Button</button>
 *  </material-button>
 *  <br>
 *  <material-button noink>
 *    <button class="material-button material-button-colored">Button</button>
 *  </material-button>
 *  <br>
 *  <material-button disabled>
 *    <button class="material-button material-button-colored">Colored</button>
 *  </material-button>
 *  <br>
 *  <button class="material-button">Button</button>
 *  <br>
 *  <button class="material-button material-button-colored">Button</button>
 *  <br>
 *  <button disabled class="material-button material-button-colored">Colored</button>
 * </hljs>
 */
function MaterialButtonDirective() {
  return {
    restrict: 'E',
    transclude: true,
    template: '<material-ripple start="center" initial-opacity="0.25" opacity-decay-velocity="0.75"></material-ripple>',
    link: function(scope, element, attr, ctrl, transclude) {
      var isDisabled = angular.isDefined(attr.disabled),
          noInk = angular.isDefined(attr.noink);

      transclude(scope, function(clone) {
        element.append(clone);
      });

      configureInk( isDisabled || noInk );
      configureButton( isDisabled );

      /**
       * If the inkRipple is disabled, then remove the ripple area....
       * NOTE: <material-ripple/> directive replaces itself with `<canvas.material-ink-ripple />` element
       * @param isDisabled
       */
      function configureInk(isDisabled) {
        if ( isDisabled ) {
          var elRipple = findNode(element, '.material-ink-ripple');
          if (elRipple) {
            elRipple.remove();
          }
        }
      }

      /**
       * Propagate the `disabled` attribute to the button markup...
       * @param isDisabled
       */
      function configureButton( isDisabled ) {
        if (isDisabled ){
          var button = findNode(element, 'button');
          if ( button ) {
            button.attr("disabled", "");
          }
        }
      }

      /**
       * Find child angular element based on selector
       * @param element
       * @returns jqLite-wrapped DOM reference
       */
      function findNode( element, selector ) {
        var found = angular.element(element[0].querySelector(selector));
        return found.length ? angular.element(found[0]) : null;
      }

    }
  };

}
