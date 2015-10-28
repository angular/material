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
 *   <md-icon icon="img/icons/ic_play_arrow_24px.svg"></md-icon>
 * </md-button>
 * </hljs>
 *
 * @param {expression=} md-visible Boolean bound to whether the tooltip is
 * currently visible.
 * @param {number=} md-delay How many milliseconds to wait to show the tooltip after the user focuses, hovers, or touches the parent. Defaults to 300ms.
 * @param {string=} md-direction Which direction would you like the tooltip to go?  Supports left, right, top, and bottom.  Defaults to bottom.
 * @param {boolean=} md-autohide If present or provided with a boolean value, the tooltip will hide on mouse leave, regardless of focus
 */
function MdTooltipDirective($timeout, $window, $$rAF, $document, $mdUtil, $mdTheming, $rootElement,
                            $animate, $q) {

  var TOOLTIP_SHOW_DELAY = 0;
  var TOOLTIP_WINDOW_EDGE_SPACE = 8;

  return {
    restrict: 'E',
    transclude: true,
    priority:210, // Before ngAria
    template: '<div class="md-content" ng-transclude></div>',
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
        content       = angular.element(element[0].getElementsByClassName('md-content')[0]),
        direction     = attr.mdDirection,
        current       = getNearestContentElement(),
        tooltipParent = angular.element(current || document.body),
        debouncedOnResize = $$rAF.throttle(function () { if (scope.visible) positionTooltip(); });

    // Observing for tooltip direction changes
    attr.$observe('mdDirection', function (val) {
      direction = val;

      if (scope.visible) {
        positionTooltip();
      }
    });

    // Initialize element

    setDefaults();
    manipulateElement();
    bindEvents();
    configureWatchers();
    addAriaLabel();

    function setDefaults () {
      if (!angular.isDefined(attr.mdDelay)) scope.delay = TOOLTIP_SHOW_DELAY;
    }

    function getTransformOrigin (direction) {
      switch (direction) {
        case 'left': return 'right center';
        case 'right': return 'left center';
        case 'top': return 'center bottom';
        case 'bottom': return 'center top';
      }
    }

    function setTransformOrigin (direction) {
      content.css('transform-origin', getTransformOrigin(direction));
    }

    function configureWatchers () {
      scope.$on('$destroy', function() {
        scope.visible = false;
        element.remove();
        angular.element($window).off('resize', debouncedOnResize);
      });
      scope.$watch('visible', function (isVisible) {
        if (isVisible) showTooltip();
        else hideTooltip();
      });
    }

    function addAriaLabel () {
      if (!parent.attr('aria-label') && !parent.text().trim()) {
        parent.attr('aria-label', element.text().trim());
      }
    }

    function manipulateElement () {
      element.detach();
      element.attr('role', 'tooltip');
    }

    /**
     * Scan up dom hierarchy for enabled parent;
     */
    function getParentWithPointerEvents () {
      var parent = element.parent();

      // jqLite might return a non-null, but still empty, parent; so check for parent and length
      while (hasComputedStyleValue('pointer-events','none', parent)) {
        parent = parent.parent();
      }

      return parent;
    }

     function getNearestContentElement () {
       var current = element.parent()[0];
       // Look for the nearest parent md-content, stopping at the rootElement.
       while (current && current !== $rootElement[0] && current !== document.body && current.nodeName !== 'MD-CONTENT') {
         current = current.parentNode;
       }
       return current;
     }


    function hasComputedStyleValue(key, value, target) {
      var hasValue = false;

      if ( target && target.length  ) {
        key    = attr.$normalize(key);
        target = target[0] || element[0];

        var computedStyles = $window.getComputedStyle(target);
        hasValue = angular.isDefined(computedStyles[key]) && (computedStyles[key] == value);
      }

      return hasValue;
    }

    function bindEvents () {
      var mouseActive = false;

      var ngWindow = angular.element($window);

      // Store whether the element was focused when the window loses focus.
      var windowBlurHandler = function() {
        elementFocusedOnWindowBlur = document.activeElement === parent[0];
      };
      var elementFocusedOnWindowBlur = false;
      ngWindow.on('blur', windowBlurHandler);
      scope.$on('$destroy', function() {
        ngWindow.off('blur', windowBlurHandler);
      });

      var enterHandler = function(e) {
        // Prevent the tooltip from showing when the window is receiving focus.
        if (e.type === 'focus' && elementFocusedOnWindowBlur) {
          elementFocusedOnWindowBlur = false;
          return;
        }
        parent.on('blur mouseleave touchend touchcancel', leaveHandler );
        setVisible(true);
      };
      var leaveHandler = function () {
        var autohide = scope.hasOwnProperty('autohide') ? scope.autohide : attr.hasOwnProperty('mdAutohide');
        if (autohide || mouseActive || ($document[0].activeElement !== parent[0]) ) {
          parent.off('blur mouseleave touchend touchcancel', leaveHandler );
          parent.triggerHandler("blur");
          setVisible(false);
        }
        mouseActive = false;
      };

      // to avoid `synthetic clicks` we listen to mousedown instead of `click`
      parent.on('mousedown', function() { mouseActive = true; });
      parent.on('focus mouseenter touchstart', enterHandler );


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
          $mdUtil.nextTick(function() { scope.visible = false; });
        }
      }
    }

    function showTooltip() {
      // Insert the element before positioning it, so we can get the position
      // and check if we should display it
      tooltipParent.append(element);

      setTransformOrigin(direction);

      // Check if we should display it or not.
      // This handles hide-* and show-* along with any user defined css
      if ( hasComputedStyleValue('display','none') ) {
        scope.visible = false;
        element.detach();
        return;
      }

      positionTooltip();
      angular.forEach([element, content], function (element) {
        $animate.addClass(element, 'md-show');
      });
    }

    function hideTooltip() {
        var promises = [];
        angular.forEach([element, content], function (it) {
          if (it.parent() && it.hasClass('md-show')) {
            promises.push($animate.removeClass(it, 'md-show'));
          }
        });

        $q.all(promises)
          .then(function () {
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
