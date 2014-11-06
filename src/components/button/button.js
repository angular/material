/**
 * @ngdoc module
 * @name material.components.button
 * @description
 *
 * Button
 */
angular.module('material.components.button', [
  'material.core',
  'material.animations',
  'material.services.aria',
  'material.services.theming'
])
  .directive('mdButton', [
    '$mdInkRipple',
    '$mdAria',
    '$mdTheming',
    MdButtonDirective
  ]);

/**
 * @ngdoc directive
 * @name mdButton
 * @module material.components.button
 *
 * @restrict E
 *
 * @description
 * `<md-button>` is a button directive with optional ink ripples (default enabled).
 *
 * @param {boolean=} noink If present, disable ripple ink effects.
 * @param {boolean=} disabled If present, disable tab selection.
 * @param {string=} type Optional attribute to specific button types (useful for forms); such as 'submit', etc.
 * @param {string=} ng-href Optional attribute to support both ARIA and link navigation
 * @param {string=} href Optional attribute to support both ARIA and link navigation
 * @param {string=} ariaLabel Publish the button label used by screen-readers for accessibility. Defaults to the button's text.
 *
 * @usage
 * <hljs lang="html">
 *  <md-button>Button</md-button>
 *  <br/>
 *  <md-button noink class="md-button-colored">
 *    Button (noInk)
 *  </md-button>
 *  <br/>
 *  <md-button disabled class="md-button-colored">
 *    Colored (disabled)
 *  </md-button>
 * </hljs>
 */
function MdButtonDirective($mdInkRipple, $mdAria, $mdTheming) {

  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    template: getTemplate,
    link: postLink
  };
  
  function getTemplate(element, attr) {
    if (angular.isDefined(attr.href) || angular.isDefined(attr.ngHref)) {
      return '<a class="md-button" ng-transclude></a>';
    } else {
      return '<button class="md-button" ng-transclude></button>';
    }
  }
  function postLink(scope, element, attr) {
    $mdTheming(element);
    $mdAria.expect(element, 'aria-label', true);
    $mdInkRipple.attachButtonBehavior(element);
  }

}
