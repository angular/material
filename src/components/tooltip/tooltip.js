/**
 * @ngdoc module
 * @name material.components.tooltip
 */
angular
    .module('material.components.tooltip', [ 'material.core' ])
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
 * <md-button class="md-fab md-accent" aria-label="Play">
 *   <md-tooltip>
 *     Play Music
 *   </md-tooltip>
 *   <md-icon icon="/img/icons/ic_play_arrow_24px.svg"></md-icon>
 * </md-button>
 * </hljs>
 *
 * @param {expression=} md-visible Boolean bound to whether the tooltip is
 * currently visible.
 * @param {number=} md-delay How many milliseconds to wait to show the tooltip after the user focuses, hovers, or touches the parent. Defaults to 400ms.
 * @param {string=} md-direction Which direction would you like the tooltip to go?  Supports left, right, top, and bottom.  Defaults to bottom.
 * @param {boolean=} md-autohide If present or provided with a boolean value, the tooltip will hide on mouse leave, regardless of focus
 */
function MdTooltipDirective($timeout, $window, $$rAF, $document, $mdUtil, $mdTheming, $rootElement, $animate, $q) {

  var TOOLTIP_SHOW_DELAY = 300;
  var TOOLTIP_WINDOW_EDGE_SPACE = 8;

  return {
    restrict: 'E',
    transclude: true,
    template: '\
        <div class="md-background"></div>\
        <div class="md-content" ng-transclude></div>',
    scope: {
      visible: '=?mdVisible',
      delay: '=?mdDelay',
      autohide: '=?mdAutohide'
    },
    link: postLink
  };

  function postLink(scope, element, attr) {

    $mdTheming(element);

    var parent        = getParentWithPointerEvents(),
        background    = angular.element(element[0].getElementsByClassName('md-background')[0]),
        content       = angular.element(element[0].getElementsByClassName('md-content')[0]),
        direction     = attr.mdDirection,
        current       = getNearestContentElement(),
        tooltipParent = angular.element(current || document.body),
        debouncedOnResize = $$rAF.throttle(function () { if (scope.visible) positionTooltip(); });

    return init();

    function init () {
      setDefaults();
      manipulateElement();
      bindEvents();
      configureWatchers();
    }

    function setDefaults () {
      if (!angular.isDefined(attr.mdDelay)) scope.delay = TOOLTIP_SHOW_DELAY;
    }

    function configureWatchers () {
      scope.$watch('visible', function (isVisible) {
        if (isVisible) showTooltip();
        else hideTooltip();
      });
      scope.$on('$destroy', function() {
        scope.visible = false;
        element.remove();
        angular.element($window).off('resize', debouncedOnResize);
      });
    }

    function manipulateElement () {
      element.detach();
      element.attr('role', 'tooltip');
      element.attr('id', attr.id || ('tooltip_' + $mdUtil.nextUid()));
    }

    function getParentWithPointerEvents () {
      var parent = element.parent();
      while ($window.getComputedStyle(parent[0])['pointer-events'] == 'none') {
        parent = parent.parent();
      }
      return parent;
    }

    function getNearestContentElement () {
      var current = element.parent()[0];
      // Look for the nearest parent md-content, stopping at the rootElement.
      while (current && current !== $rootElement[0] && current !== document.body) {
        if (current.tagName && current.tagName.toLowerCase() == 'md-content') break;
        current = current.parentNode;
      }
      return current;
    }

    function bindEvents () {
      var autohide = scope.hasOwnProperty('autohide') ? scope.autohide : attr.hasOwnProperty('mdAutohide');
      parent.on('focus mouseenter touchstart', function() { setVisible(true); });
      parent.on('blur mouseleave touchend touchcancel', function() { if ($document[0].activeElement !== parent[0] || autohide) setVisible(false); });
      angular.element($window).on('resize', debouncedOnResize);
    }

    function setVisible (value) {
      setVisible.value = !!value;
      if (!setVisible.queued) {
        if (value) {
          setVisible.queued = true;
          $timeout(function() {
            scope.visible = setVisible.value;
            setVisible.queued = false;
          }, scope.delay);
        } else {
          $timeout(function() { scope.visible = false; });
        }
      }
    }

    function showTooltip() {
      // Insert the element before positioning it, so we can get the position
      // and check if we should display it
      tooltipParent.append(element);

      // Check if we should display it or not.
      // This handles hide-* and show-* along with any user defined css
      var computedStyles = $window.getComputedStyle(element[0]);
      if (angular.isDefined(computedStyles.display) && computedStyles.display == 'none') {
        element.detach();
        return;
      }

      parent.attr('aria-describedby', element.attr('id'));

      positionTooltip();
      angular.forEach([element, background, content], function (element) {
        $animate.addClass(element, 'md-show');
      });
    }

    function hideTooltip() {
      parent.removeAttr('aria-describedby');
      $q.all([
        $animate.removeClass(content, 'md-show'),
        $animate.removeClass(background, 'md-show'),
        $animate.removeClass(element, 'md-show')
      ]).then(function () {
        if (!scope.visible) element.detach();
      });
    }

    function positionTooltip() {
      var tipRect = $mdUtil.offsetRect(element, tooltipParent);
      var parentRect = $mdUtil.offsetRect(parent, tooltipParent);
      var newPosition = getPosition(direction);

      // If the user provided a direction, just nudge the tooltip onto the screen
      // Otherwise, recalculate based on 'top' since default is 'bottom'
      if (direction) {
        newPosition = fitInParent(newPosition);
      } else if (newPosition.top > element.prop('offsetParent').scrollHeight - tipRect.height - TOOLTIP_WINDOW_EDGE_SPACE) {
        newPosition = fitInParent(getPosition('top'));
      }

      element.css({top: newPosition.top + 'px', left: newPosition.left + 'px'});

      positionBackground();

      function positionBackground () {
        var size = direction === 'left' || direction === 'right'
              ? Math.sqrt(Math.pow(tipRect.width, 2) + Math.pow(tipRect.height / 2, 2)) * 2
              : Math.sqrt(Math.pow(tipRect.width / 2, 2) + Math.pow(tipRect.height, 2)) * 2,
            position = direction === 'left' ? { left: 100, top: 50 }
              : direction === 'right' ? { left: 0, top: 50 }
              : direction === 'top' ? { left: 50, top: 100 }
              : { left: 50, top: 0 };
        background.css({
          width: size + 'px',
          height: size + 'px',
          left: position.left + '%',
          top: position.top + '%'
        });
      }

      function fitInParent (pos) {
        var newPosition = { left: pos.left, top: pos.top };
        newPosition.left = Math.min( newPosition.left, tooltipParent.prop('scrollWidth') - tipRect.width - TOOLTIP_WINDOW_EDGE_SPACE );
        newPosition.left = Math.max( newPosition.left, TOOLTIP_WINDOW_EDGE_SPACE );
        newPosition.top  = Math.min( newPosition.top,  tooltipParent.prop('scrollHeight') - tipRect.height - TOOLTIP_WINDOW_EDGE_SPACE );
        newPosition.top  = Math.max( newPosition.top,  TOOLTIP_WINDOW_EDGE_SPACE );
        return newPosition;
      }

      function getPosition (dir) {
        return dir === 'left'
          ? { left: parentRect.left - tipRect.width - TOOLTIP_WINDOW_EDGE_SPACE,
              top: parentRect.top + parentRect.height / 2 - tipRect.height / 2 }
          : dir === 'right'
          ? { left: parentRect.left + parentRect.width + TOOLTIP_WINDOW_EDGE_SPACE,
              top: parentRect.top + parentRect.height / 2 - tipRect.height / 2 }
          : dir === 'top'
          ? { left: parentRect.left + parentRect.width / 2 - tipRect.width / 2,
              top: parentRect.top - tipRect.height - TOOLTIP_WINDOW_EDGE_SPACE }
          : { left: parentRect.left + parentRect.width / 2 - tipRect.width / 2,
              top: parentRect.top + parentRect.height + TOOLTIP_WINDOW_EDGE_SPACE };
      }
    }

  }

}
