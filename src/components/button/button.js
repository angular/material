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
 * @param {boolean=} md-no-ink If present, disable ripple ink effects.
 * @param {expression=} ng-disabled En/Disable based on the expression
 * @param {string=} aria-label Adds alternative text to button for accessibility, useful for icon buttons.
 * If no default text is found, a warning will be logged.
 *
 * @usage
 * <hljs lang="html">
 *  <md-button>
 *    Button
 *  </md-button>
 *  <md-button href="http://google.com" class="md-button-colored">
 *    I'm a link
 *  </md-button>
 *  <md-button ng-disabled="true" class="md-colored">
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

  function postLink(scope, element, attr) {
    var node = element[0];
    var elementHasText = node.textContent.trim();

    $mdTheming(element);
    $mdInkRipple.attachButtonBehavior(scope, element);

    if (!elementHasText) {
      $mdAria.expect(element, 'aria-label');
    }

    updateTabIndex(scope, element, attr);

  }

  // ************************************************
  // Internal Methods
  // ************************************************

  /**
   * Publish either an <a/> or <button/> template
   * @returns {string}
   */
  function getTemplate(element, attr) {
    return isAnchor(attr) ?
           '<a class="md-button" ng-transclude></a>' :
           '<button class="md-button" ng-transclude></button>';
  }

  /**
   * Should we use an <a/> template
   * @returns {boolean|*}
   */
  function isAnchor(attr) {
    return angular.isDefined(attr.href) || angular.isDefined(attr.ngHref);
  }

  /**
   * Is this a simulate button ?
   * @returns {boolean}
   */
  function isButton(attr) {
    return !isAnchor(attr) && (attr.role == "button");
  }

  /**
   * Update the accessibility `tabindex` property
   */
  function updateTabIndex(scope, element, attr) {
    if ( isAnchor(attr) ) {

      // For anchor elements, we have to set tabindex manually
      // when the element is disabled

      if ( angular.isDefined(attr.ngDisabled) ) {

        scope.$watch(attr.ngDisabled, function(isDisabled) {
          element.attr('tabindex', isDisabled ? -1 : 0);
        });

      }

    } else if ( isButton(attr) ) {

      $mdAria.expect(element, 'tabindex', "0" );

    }
  }


}

})();
