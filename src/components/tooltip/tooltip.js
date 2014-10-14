/**
 * @ngdoc module
 * @name material.components.tooltip
 */
angular.module('material.components.tooltip', ['material.core'])

.directive('mdTooltip', [
  '$timeout',
  '$window',
  '$$rAF',
  '$document',
  '$mdUtil',
  MdTooltipDirective
]);

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
 * @param {expression=} visible Boolean bound to whether the tooltip is 
 * currently visible.
 */
function MdTooltipDirective($timeout, $window, $$rAF, $document, $mdUtil) {

  var TOOLTIP_SHOW_DELAY = 400;
  var TOOLTIP_WINDOW_EDGE_SPACE = 8;
  // We have to append tooltips to the body, because we use
  // getBoundingClientRect().
  // to find where to append the tooltip.
  var tooltipParent = angular.element(document.body);

  return {
    restrict: 'E',
    transclude: true,
    require: '^?mdContent',
    template: 
      '<div class="tooltip-background"></div>' +
      '<div class="tooltip-content" ng-transclude></div>',
    scope: {
      visible: '=?'
    },
    link: postLink
  };

  function postLink(scope, element, attr, contentCtrl) {
    var parent = element.parent();

    // We will re-attach tooltip when visible
    element.detach();
    element.attr('role', 'tooltip');
    element.attr('id', attr.id || ('tooltip_' + $mdUtil.nextUid()));

    parent.on('focus mouseenter touchstart', function() {
      setVisible(true);
    });
    parent.on('blur mouseleave touchend touchcancel', function() {
      // Don't hide the tooltip if the parent is still focused.
      if (document.activeElement === parent[0]) return;
      setVisible(false);
    });

    scope.$watch('visible', function(isVisible) {
      if (isVisible) showTooltip();
      else hideTooltip();
    });
    
    var debouncedOnResize = $$rAF.debounce(onWindowResize);
    angular.element($window).on('resize', debouncedOnResize);
    function onWindowResize() {
      // Reposition on resize
      if (scope.visible) positionTooltip();
    }

    // Be sure to completely cleanup the element on destroy
    scope.$on('$destroy', function() {
      scope.visible = false;
      element.remove();
      angular.element($window).off('resize', debouncedOnResize);
    });

    // *******
    // Methods
    // *******

    // If setting visible to true, debounce to TOOLTIP_SHOW_DELAY ms
    // If setting visible to false and no timeout is active, instantly hide the tooltip.
    function setVisible(value) {
      setVisible.value = !!value;

      if (!setVisible.queued) {
        if (value) {
          setVisible.queued = true;
          $timeout(function() {
            scope.visible = setVisible.value;
            setVisible.queued = false;
          }, TOOLTIP_SHOW_DELAY);

        } else {
          $timeout(function() { scope.visible = false; });
        }
      }
    }

    function showTooltip() {
      // Insert the element before positioning it, so we can get position
      // (tooltip is hidden by default)
      element.removeClass('tooltip-hide');
      parent.attr('aria-describedby', element.attr('id'));
      tooltipParent.append(element);

      // Wait until the element has been in the dom for two frames before 
      // fading it in.
      // Additionally, we position the tooltip twice to avoid positioning bugs
      //positionTooltip();
      $$rAF(function() {

        $$rAF(function() {
          positionTooltip();
          if (!scope.visible) return;
          element.addClass('tooltip-show');
        });

      });
    }

    function hideTooltip() {
      element.removeClass('tooltip-show').addClass('tooltip-hide');
      parent.removeAttr('aria-describedby');
      $timeout(function() {
        if (scope.visible) return;
        element.detach();
      }, 200, false);
    }

    function positionTooltip(rerun) {
      var tipRect = element[0].getBoundingClientRect();
      var parentRect = parent[0].getBoundingClientRect();

      if (contentCtrl) {
        parentRect.top += contentCtrl.$element.prop('scrollTop');
        parentRect.left += contentCtrl.$element.prop('scrollLeft');
      }

      // Default to bottom position if possible
      var tipDirection = 'bottom';
      var newPosition = {
        left: parentRect.left + parentRect.width / 2 - tipRect.width / 2,
        top: parentRect.top + parentRect.height
      };

      // If element bleeds over left/right of the window, place it on the edge of the window.
      newPosition.left = Math.min(
        newPosition.left, 
        $window.innerWidth - tipRect.width - TOOLTIP_WINDOW_EDGE_SPACE
      );
      newPosition.left = Math.max(newPosition.left, TOOLTIP_WINDOW_EDGE_SPACE);

      // If element bleeds over the bottom of the window, place it above the parent.
      if (newPosition.top + tipRect.height > $window.innerHeight) {
        newPosition.top = parentRect.top - tipRect.height;
        tipDirection = 'top';
      }

      element.css({top: newPosition.top + 'px', left: newPosition.left + 'px'});
      // Tell the CSS the size of this tooltip, as a multiple of 32.
      element.attr('width-32', Math.ceil(tipRect.width / 32));
      element.attr('tooltip-direction', tipDirection);
    }

  }

}
