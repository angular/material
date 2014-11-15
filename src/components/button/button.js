(function() {
'use strict';

/**
 * @ngdoc module
 * @name material.components.button
 * @description
 *
 * Button
 */
angular.module('material.components.button', [
  'material.core'
])
  .directive('mdButton', MdButtonDirective);

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
 * If you supply a `href` or `ng-href` attribute, it will become an `<a>` element. Otherwise, it will
 * become a `<button>` element.
 *
 * @param {boolean=} noink If present, disable ripple ink effects.
 * @param {boolean=} disabled If present, disable selection.
 * @param {string=} aria-label Publish the button label used by screen-readers for accessibility. Defaults to the button's text.
 *
 * @usage
 * <hljs lang="html">
 *  <md-button>
 *    Button
 *  </md-button>
 *  <md-button href="http://google.com" class="md-button-colored">
 *    I'm a link
 *  </md-button>
 *  <md-button disabled class="md-colored">
 *    I'm a disabled button
 *  </md-button>
 * </hljs>
 */
function MdButtonDirective($mdInkRipple, $mdTheming, $mdAria) {

  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    template: getTemplate,
    link: postLink
  };

  function isAnchor(attr) {
    return angular.isDefined(attr.href) || angular.isDefined(attr.ngHref);
  }
  
  function getTemplate(element, attr) {
    var tag = isAnchor(attr) ? 'a' : 'button';
    //We need to manually pass disabled to the replaced element because
    //of a bug where it isn't always passed.
    var disabled = element[0].hasAttribute('disabled') ? ' disabled ' : ' ';

    return '<' + tag + disabled + 'class="md-button" ng-transclude></' + tag + '>';
  }

  function postLink(scope, element, attr) {
    var node = element[0];
    $mdTheming(element);
    $mdInkRipple.attachButtonBehavior(element);

    var elementHasText = node.textContent.trim();
    if (!elementHasText) {
      $mdAria.expect(element, 'aria-label');
    }

    // For anchor elements, we have to set tabindex manually when the 
    // element is disabled
    if (isAnchor(attr)) {
      scope.$watch(function() {
        return node.hasAttribute('disabled');
      }, function(isDisabled) {
        element.attr('tabindex', isDisabled ? -1 : 0);
      });
    }
  }

}
})();
