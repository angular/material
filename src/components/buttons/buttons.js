/**
 * @ngdoc module
 * @name material.components.button
 *
 * @description
 * Button is CSS component.
 */
angular.module('material.components.button', [])
  .directive('materialButton', MaterialButtonDirective);

function MaterialButtonDirective() {
  return {
    restrict: 'E',
    transclude: true,
    template: '<material-ripple start="center" initial-opacity="0.25" opacity-decay-velocity="0.75"></material-ripple>',
    link: function(scope, element, attr, ctrl, transclude) {

      transclude(scope, function(clone) {
        element.append(clone);
      });
      configureInk( angular.isDefined(attr.disabled) );

      /**
       * If the inkRipple is disabled, then remove
       * the ripple area....
       *
       * @param inkParent
       * @param isDisabled
       */
      function configureInk(isDisabled) {
        if ( isDisabled ) {
          // Since <material-ripple/> directive replaces itself with `<canvas.material-ink-ripple />` element
          var elRipple = findInkCanvasIn(element);
          if (elRipple) {
            elRipple.remove();
          }

          // Propagate the `disabled` attribute to the button markup...
          var button = findButton(element);
          if ( button ) {
            button.attr("disabled", "");
          }
        }
      }

      /**
       *
       * @param element
       * @returns {*}
       */
      function findInkCanvasIn( element ){
        return angular.element(element[0].querySelector('.material-ink-ripple'));
      }

      function findButton(element) {
        var found = angular.element(element[0].querySelector('button'));
        return found.length ? angular.element(found[0]) : null;
      }

    }
  };

}
