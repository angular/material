(function() {
'use strict';

/**
 * @ngdoc module
 * @name material.components.popover
 */
angular.module('material.components.popover', [
  'material.core'
])
  .directive('mdPopover', MdPopoverDirective);

/**
 * @ngdoc directive
 * @name mdPopover
 * @module material.components.popover
 * @description
 * Popovers add a small overlay of content to any element for housing secondary information.
 *
 * Place a `<md-popover>` as a child of the element it relates to.
 *
 * A popover will be displayed when the user clicks the parent and close when the parent is clicked a second time.
 *
 * @usage
 * <hljs lang="html">
 * <md-button>
 *   <md-popover>
 *     Additional information
 *   </md-popover>
 * </md-button>
 * </hljs>
 *
 * @param {expression=?} md-visible Boolean bound to whether the popover is currently visible.
 * @param {expression=?} md-placement String bound to location of popover e.g. left, right, top or bottom (default).
 */
function MdPopoverDirective($timeout, $window, $$rAF, $document, $mdUtil,
                            $mdTheming, $rootElement, $mdAria, $mdConstant) {

  var POPOVER_SHOW_DELAY = 400;
  var POPOVER_WINDOW_EDGE_SPACE = 8;

  return {
    restrict: 'E',
    transclude: true,
    template:
      '<div class="md-arrow"></div>' +
      '<div class="md-background"></div>' +
      '<div class="md-content" ng-transclude></div>',
    scope: {
      visible: '=?mdVisible',
      placement: '=?mdPlacement'
    },
    link: postLink
  };

  function postLink(scope, element, attr, contentCtrl) {
    $mdTheming(element);
    var parent = element.parent();
    var documentBody = $document.find('body').eq(0);

    // check for aria label
    var elementHasText = element[0].textContent.trim();
    if (!elementHasText) {
        $mdAria.expect(element, 'aria-label');
    }

    // Look for the nearest parent md-content, stopping at the rootElement.
    var current = element.parent()[0];
    while (current && current !== $rootElement[0] && current !== documentBody) {
      if (current.tagName && current.tagName.toLowerCase() == 'md-content') break;
      current = current.parentNode;
    }
    var popoverParent = angular.element(current || documentBody);

    // We will re-attach popover when visible
    element.detach();
    element.attr('role', 'tooltip');
    element.attr('id', attr.id || ('popover_' + $mdUtil.nextUid()));

    parent.on('click', function() {
        setVisible(!scope.visible);
    });

    scope.$watch('visible', function(isVisible) {
      if (isVisible) showPopover();
      else hidePopover();
    });

    scope.$watch('placement', function (placement) {
        if (scope.visible) hidePopover();
        positionPopover();
        if (scope.visible) showPopover();
    });

    var debouncedOnResize = $$rAF.throttle(function windowResize() {
      // Reposition on resize
      if (scope.visible) positionPopover();
    });
    angular.element($window).on('resize', debouncedOnResize);

    var rootElementKeyupCallback = function (e) {
        if (e.keyCode === $mdConstant.KEY_CODE.ESCAPE) {
            if (scope.visible) setVisible(false);
        }
    };
    $rootElement.on('keyup', rootElementKeyupCallback);

    // Be sure to completely cleanup the element on destroy
    scope.$on('$destroy', function () {
      scope.visible = false;
      element.remove();
      angular.element($window).off('resize', debouncedOnResize);
      $rootElement.off('keyup', options.rootElementKeyupCallback);
    });

    // *******
    // Methods
    // *******

    // If setting visible to true, debounce to POPOVER_SHOW_DELAY ms
    // If setting visible to false and no timeout is active, instantly hide the popover.
    function setVisible(value) {
      setVisible.value = !!value;

      if (!setVisible.queued) {
        if (value) {
          setVisible.queued = true;
          $timeout(function() {
            scope.visible = setVisible.value;
            setVisible.queued = false;
          }, POPOVER_SHOW_DELAY);

        } else {
            $timeout(function () {
                scope.visible = false;
                parent.focus();
            });
        }
      }
    }

    function showPopover() {
      // Insert the element before positioning it, so we can get position
      // (popover is hidden by default)
      element.removeClass('md-hide');
      parent.attr('aria-describedby', element.attr('id'));
      popoverParent.append(element);

      // Wait until the element has been in the dom for two frames before
      // fading it in.
      // Additionally, we position the popover twice to avoid positioning bugs
      positionPopover();
      $$rAF(function() {

        $$rAF(function() {
          positionPopover();
          if (!scope.visible) return;
          element.addClass('md-show');
          $timeout(function () { element.focus(); });
        });

      });
    }

    function hidePopover() {
      element.removeClass('md-show').addClass('md-hide');
      parent.removeAttr('aria-describedby');
      $timeout(function() {
        if (scope.visible) return;
        element.detach();
      }, 200, false);
    }

    function positionPopover() {
      var popoverRect = $mdUtil.elementRect(element, popoverParent);
      var parentRect = $mdUtil.elementRect(parent, popoverParent);

      // Default placement to bottom if not set
      var popoverPlacement = scope.placement || 'bottom';
      var newPosition;

      switch (popoverPlacement) {
          case 'left':
              newPosition = {
                  left: parentRect.left - popoverRect.width,
                  top: parentRect.top + parentRect.height / 2 - popoverRect.height / 2,
              };
              break;

          case 'right':
              newPosition = {
                  left: parentRect.left + parentRect.width,
                  top: parentRect.top + parentRect.height / 2 - popoverRect.height / 2,
              };
              break;

          case 'top':
              newPosition = {
                  left: parentRect.left + parentRect.width / 2 - popoverRect.width / 2,
                  top: parentRect.top - popoverRect.height
              };
              break;

          default:
              // bottom
              newPosition = {
                  left: parentRect.left + parentRect.width / 2 - popoverRect.width / 2,
                  top: parentRect.top + parentRect.height
              };
      }

      // If element bleeds over left/right of the window, place it on the edge of the window.
      newPosition.left = Math.min(
        newPosition.left,
        popoverParent.prop('scrollWidth') - popoverRect.width - POPOVER_WINDOW_EDGE_SPACE
      );
      newPosition.left = Math.max(newPosition.left, POPOVER_WINDOW_EDGE_SPACE);

      // If element bleeds over the bottom of the window, place it above the parent.
      if (newPosition.top + popoverRect.height > popoverParent.prop('scrollHeight')) {
        newPosition.top = parentRect.top - popoverRect.height;
        popoverPlacement = 'top';
      }

      element.css({top: newPosition.top + 'px', left: newPosition.left + 'px'});
      // Tell the CSS the size of this popover, as a multiple of 32.
      element.attr('width-32', Math.ceil(popoverRect.width / 32));
      element.attr('md-placement', popoverPlacement);
    }
  }
}
})();