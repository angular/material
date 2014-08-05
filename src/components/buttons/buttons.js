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
      var noInk = angular.isDefined(attr.noink);

      // Put the content of the <material-button> inside after the ripple
      transclude(scope, function(clone) {
        element.append(clone);
      });

      configureInk(noInk);
      configureButton(attr.type);

      /**
       * If the inkRipple is disabled, then remove the ripple area....
       * NOTE: <material-ripple/> directive replaces itself with `<canvas.material-ink-ripple />` element
       * @param isDisabled
       */
      function configureInk(isDisabled) {
        if ( isDisabled ) {
          element.find('canvas').remove();
        }
      }

      function configureButton(type) {
        if (type) {
          var innerButton = angular.element('<button>')
            .attr('type', type)
            .addClass('material-inner-button');
          element.append(innerButton);
        }
      }
    }
  };

}
