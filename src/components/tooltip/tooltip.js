/*!
 * Angular Material Design
 * https://github.com/angular/material
 * @license MIT
 * v0.7.0-rc3
 */
(function () {
'use strict';

/**
 * @ngdoc module
 * @name material.components.tooltip
 */
angular.module('material.components.tooltip', [
  'material.core'
])
  .directive('mdTooltip', MdTooltipDirective);

/**
 * @ngdoc directive
 * @name mdTooltip
 * @module material.components.tooltip
 * @description
 * Tooltips are used to describe elements that are interactive and primarily graphical (not textual).
 *
 * Place a `<md-tooltip>` as a child of the element it describes.
 *
 * A tooltip will activate when the user focuses, hovers over, or touches the parent.
 *
 * @usage
 * <hljs lang="html">
 * <md-icon icon="/img/icons/ic_play_arrow_24px.svg">
 *   <md-tooltip>
 *     Play Music
 *   </md-tooltip>
 * </md-icon>
 * </hljs>
 *
 * @param {string=} md-direction String bound to the direction the tooltip should open. Accepted values are 'top', 'bottom', 'left', 'right'. Defaults to 'bottom'.
 * @param {expression=} md-visible Boolean bound to whether the tooltip is
 * currently visible.
 * @param {number=} md-delay How many milliseconds to wait to show the tooltip after the user focuses, hovers, or touches the parent. Defaults to 400ms.
 */
function MdTooltipDirective($timeout, $window, $$rAF, $document, $mdUtil, $mdTheming, $rootElement) {

  var TOOLTIP_DIRECTION = 'bottom';
  var TOOLTIP_SHOW_DELAY = 400;
  var TOOLTIP_WINDOW_EDGE_SPACE = 8;

  return {
    restrict: 'E',
    transclude: true,
    template:
      '<div class="md-background"></div>' +
      '<div class="md-content" ng-transclude></div>',
    scope: {
      direction: '=?mdDirection',
      visible: '=?mdVisible',
      delay: '=?mdDelay'
    },
    link: postLink
  };

  function postLink(scope, element, attr, contentCtrl) {
    $mdTheming(element);
    var parent = element.parent();

    // Look for the nearest parent md-content, stopping at the rootElement.
    var current = element.parent()[0];
    while (current && current !== $rootElement[0] && current !== document.body) {
      if (current.tagName && current.tagName.toLowerCase() == 'md-content') break;
      current = current.parentNode;
    }
    var tooltipParent = angular.element(current || document.body);

    if (angular.isDefined(attr.mdDirection)) {
      attr.mdDirection = attr.mdDirection.toLowerCase();
      var validDirections = ['top', 'right', 'bottom', 'left'];
      if (validDirections.indexOf(attr.mdDirection) > -1) {
        scope.direction = attr.mdDirection;
      } else {
        scope.direction = TOOLTIP_DIRECTION;
      }
    } else {
      scope.direction = TOOLTIP_DIRECTION;
    }

    if (!angular.isDefined(attr.mdDelay)) {
      scope.delay = TOOLTIP_SHOW_DELAY;
    }

    // We will re-attach tooltip when visible
    element.detach();
    element.attr('role', 'tooltip');
    element.attr('id', attr.id || ('tooltip_' + $mdUtil.nextUid()));

    parent.on('focus mouseenter touchstart', function () {
      setVisible(true);
    });
    parent.on('blur mouseleave touchend touchcancel', function () {
      // Don't hide the tooltip if the parent is still focused.
      if ($document[0].activeElement === parent[0]) return;
      setVisible(false);
    });

    scope.$watch('visible', function (isVisible) {
      if (isVisible) showTooltip();
      else hideTooltip();
    });

    var debouncedOnResize = $$rAF.debounce(function windowResize() {
      // Reposition on resize
      if (scope.visible) positionTooltip();
    });
    angular.element($window).on('resize', debouncedOnResize);

    // Be sure to completely cleanup the element on destroy
    scope.$on('$destroy', function () {
      scope.visible = false;
      element.remove();
      angular.element($window).off('resize', debouncedOnResize);
    });

    // *******
    // Methods
    // *******

    // If setting visible to true, debounce to scope.delay ms
    // If setting visible to false and no timeout is active, instantly hide the tooltip.
    function setVisible(value) {
      setVisible.value = !!value;

      if (!setVisible.queued) {
        if (value) {
          setVisible.queued = true;
          $timeout(function () {
            scope.visible = setVisible.value;
            setVisible.queued = false;
          }, scope.delay);

        } else {
          $timeout(function () { scope.visible = false; });
        }
      }
    }

    function showTooltip() {
      // Insert the element before positioning it, so we can get position
      // (tooltip is hidden by default)
      element.removeClass('md-hide');
      parent.attr('aria-describedby', element.attr('id'));
      tooltipParent.append(element);

      // Wait until the element has been in the dom for two frames before
      // fading it in.
      // Additionally, we position the tooltip twice to avoid positioning bugs
      positionTooltip();
      $$rAF(function () {

        $$rAF(function () {
          positionTooltip();
          if (!scope.visible) return;
          element.addClass('md-show');
        });

      });
    }

    function hideTooltip() {
      element.removeClass('md-show').addClass('md-hide');
      parent.removeAttr('aria-describedby');
      $timeout(function () {
        if (scope.visible) return;
        element.detach();
      }, 200, false);
    }

    function positionTooltip() {

      var tipRect = $mdUtil.elementRect(element, tooltipParent);
      var parentRect = $mdUtil.elementRect(parent, tooltipParent);
      var tipDirection = 'bottom';
      var newPosition = { left: 0, top: 0 }

      if (scope.direction === 'top') {

        tipDirection = 'top';

        newPosition = {
          left: parentRect.left + parentRect.width / 2 - tipRect.width / 2,
          //top: parentRect.top - parentRect.height - TOOLTIP_WINDOW_EDGE_SPACE
          top: parentRect.top - tipRect.height - TOOLTIP_WINDOW_EDGE_SPACE
        };

        // If element bleeds over the top of the window, place it below the parent
        if (newPosition.top < $window.pageYOffset) {
          tipDirection = 'bottom';
          newPosition.top = parentRect.top + parentRect.height;
        }

        // If element bleeds over left/right of the window, place it on the edge of the window.
        newPosition.left = Math.min(newPosition.left, tooltipParent.prop('scrollWidth') - tipRect.width - TOOLTIP_WINDOW_EDGE_SPACE);
        newPosition.left = Math.max(newPosition.left, TOOLTIP_WINDOW_EDGE_SPACE);

      } else if (scope.direction === 'right') {

        tipDirection = 'right';

        newPosition = {
          left: parentRect.left + parentRect.width,
          top: parentRect.top + parentRect.height / 2 - tipRect.height / 2
        };

        // If element bleeds over the right of the window, place it to the left of the parent
        if (newPosition.left + tipRect.width + TOOLTIP_WINDOW_EDGE_SPACE > tooltipParent.prop('scrollWidth')) {
          tipDirection = 'left';
          newPosition.left = parentRect.left - tipRect.width - TOOLTIP_WINDOW_EDGE_SPACE;
        }

      } else if (scope.direction === 'left') {

        tipDirection = 'left';

        newPosition = {
          left: parentRect.left - tipRect.width - TOOLTIP_WINDOW_EDGE_SPACE,  // TOOLTIP_WINDOW_EDGE_SPACE replaces margin-right in CSS
          top: parentRect.top + parentRect.height / 2 - tipRect.height / 2
        };

        // If element bleeds over the right of the window, place it to the right of the parent
        if (newPosition.left - TOOLTIP_WINDOW_EDGE_SPACE < 0) {
          tipDirection = 'right';
          newPosition.left = parentRect.left + parentRect.width + TOOLTIP_WINDOW_EDGE_SPACE;
        }

      } else {  // direction = 'bottom'

        newPosition = {
          left: parentRect.left + parentRect.width / 2 - tipRect.width / 2,
          top: parentRect.top + parentRect.height
        };

        // If element bleeds over the bottom of the window, place it above the parent
        if (newPosition.top + tipRect.height + TOOLTIP_WINDOW_EDGE_SPACE * 2 > $window.innerHeight + $window.pageYOffset) {
          tipDirection = 'top';
          newPosition.top = parentRect.top - tipRect.height - TOOLTIP_WINDOW_EDGE_SPACE;
        }

        // If element bleeds over left/right of the window, place it on the edge of the window.
        newPosition.left = Math.min(newPosition.left, tooltipParent.prop('scrollWidth') - tipRect.width - TOOLTIP_WINDOW_EDGE_SPACE);
        newPosition.left = Math.max(newPosition.left, TOOLTIP_WINDOW_EDGE_SPACE);
      }

      element.css({ top: newPosition.top + 'px', left: newPosition.left + 'px' });
      // Tell the CSS the size of this tooltip, as a multiple of 32.
      element.attr('width-32', Math.ceil(tipRect.width / 32));
      element.attr('md-direction', tipDirection);
    }

  }

}
MdTooltipDirective.$inject = ["$timeout", "$window", "$$rAF", "$document", "$mdUtil", "$mdTheming", "$rootElement"];
})();
