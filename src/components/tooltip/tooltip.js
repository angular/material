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
 * @param {expression=} md-visible Boolean bound to whether the tooltip is currently visible.
 * @param {number=} md-delay How many milliseconds to wait to show the tooltip after the user focuses, hovers, or touches the
 * parent. Defaults to 0ms on non-touch devices and 75ms on touch.
 * @param {boolean=} md-autohide If present or provided with a boolean value, the tooltip will hide on mouse leave, regardless of focus
 * @param {string=} md-direction Which direction would you like the tooltip to go?  Supports left, right, top, and bottom.  Defaults to bottom.
 */
function MdTooltipDirective($timeout, $window, $$rAF, $document, $mdUtil, $mdTheming, $rootElement,
                            $animate, $q, $interpolate) {

  var ENTER_EVENTS = 'focus touchstart mouseenter';
  var LEAVE_EVENTS = 'blur touchcancel mouseleave';
  var SHOW_CLASS = 'md-show';
  var TOOLTIP_SHOW_DELAY = 0;
  var TOOLTIP_WINDOW_EDGE_SPACE = 8;

  return {
    restrict: 'E',
    transclude: true,
    priority: 210, // Before ngAria
    template: '<div class="md-content _md" ng-transclude></div>',
    scope: {
      delay: '=?mdDelay',
      visible: '=?mdVisible',
      autohide: '=?mdAutohide',
      direction: '@?mdDirection'    // only expect raw or interpolated string value; not expression
    },
    compile: function(tElement, tAttr) {
      if (!tAttr.mdDirection) {
        tAttr.$set('mdDirection', 'bottom');
      }

      return postLink;
    }
  };

  function postLink(scope, element, attr) {

    $mdTheming(element);

    var parent        = $mdUtil.getParentWithPointerEvents(element),
        content       = angular.element(element[0].getElementsByClassName('md-content')[0]),
        tooltipParent = angular.element(document.body),
        showTimeout   = null,
        debouncedOnResize = $$rAF.throttle(function () { updatePosition(); });

    if ($animate.pin) $animate.pin(element, parent);

    // Initialize element

    setDefaults();
    manipulateElement();
    bindEvents();

    // Default origin transform point is 'center top'
    // positionTooltip() is always relative to center top
    updateContentOrigin();

    configureWatchers();
    addAriaLabel();


    function setDefaults () {
      scope.delay = scope.delay || TOOLTIP_SHOW_DELAY;
    }

    function updateContentOrigin() {
      var origin = 'center top';
      switch (scope.direction) {
        case 'left'  : origin =  'right center';  break;
        case 'right' : origin =  'left center';   break;
        case 'top'   : origin =  'center bottom'; break;
        case 'bottom': origin =  'center top';    break;
      }
      content.css('transform-origin', origin);
    }

    function onVisibleChanged (isVisible) {
      if (isVisible) showTooltip();
      else hideTooltip();
    }

    function configureWatchers () {
      if (element[0] && 'MutationObserver' in $window) {
        var attributeObserver = new MutationObserver(function(mutations) {
          mutations
            .forEach(function (mutation) {
              if (mutation.attributeName === 'md-visible') {
                if (!scope.visibleWatcher)
                  scope.visibleWatcher = scope.$watch('visible', onVisibleChanged );
              }
              if (mutation.attributeName === 'md-direction') {
                updatePosition(scope.direction);
              }
            });
        });

        attributeObserver.observe(element[0], { attributes: true });

        // build watcher only if mdVisible is being used
        if (attr.hasOwnProperty('mdVisible')) {
          scope.visibleWatcher = scope.$watch('visible', onVisibleChanged );
        }
      } else { // MutationObserver not supported
        scope.visibleWatcher = scope.$watch('visible', onVisibleChanged );
        scope.$watch('direction', updatePosition );
      }

      var onElementDestroy = function() {
        scope.$destroy();
      };

      // Clean up if the element or parent was removed via jqLite's .remove.
      // A couple of notes:
      // - In these cases the scope might not have been destroyed, which is why we
      // destroy it manually. An example of this can be having `md-visible="false"` and
      // adding tooltips while they're invisible. If `md-visible` becomes true, at some
      // point, you'd usually get a lot of inputs.
      // - We use `.one`, not `.on`, because this only needs to fire once. If we were
      // using `.on`, it would get thrown into an infinite loop.
      // - This kicks off the scope's `$destroy` event which finishes the cleanup.
      element.one('$destroy', onElementDestroy);
      parent.one('$destroy', onElementDestroy);
      scope.$on('$destroy', function() {
        setVisible(false);
        element.remove();
        attributeObserver && attributeObserver.disconnect();
      });

      // Updates the aria-label when the element text changes. This watch
      // doesn't need to be set up if the element doesn't have any data
      // bindings.
      if (element.text().indexOf($interpolate.startSymbol()) > -1) {
        scope.$watch(function() {
          return element.text().trim();
        }, addAriaLabel);
      }
    }

    function addAriaLabel (override) {
      if ((override || !parent.attr('aria-label')) && !parent.text().trim()) {
        var rawText = override || element.text().trim();
        var interpolatedText = $interpolate(rawText)(parent.scope());
        parent.attr('aria-label', interpolatedText);
      }
    }

    function manipulateElement () {
      element.detach();
      element.attr('role', 'tooltip');
    }

    function bindEvents () {
      var mouseActive = false;

      // add an mutationObserver when there is support for it
      // and the need for it in the form of viable host(parent[0])
      if (parent[0] && 'MutationObserver' in $window) {
        // use an mutationObserver to tackle #2602
        var attributeObserver = new MutationObserver(function(mutations) {
          if (mutations.some(function (mutation) {
              return (mutation.attributeName === 'disabled' && parent[0].disabled);
            })) {
              $mdUtil.nextTick(function() {
                setVisible(false);
              });
          }
        });

        attributeObserver.observe(parent[0], { attributes: true});
      }

      // Store whether the element was focused when the window loses focus.
      var windowBlurHandler = function() {
        elementFocusedOnWindowBlur = document.activeElement === parent[0];
      };
      var elementFocusedOnWindowBlur = false;

      function windowScrollHandler() {
        setVisible(false);
      }

      angular.element($window)
        .on('blur', windowBlurHandler)
        .on('resize', debouncedOnResize);

      document.addEventListener('scroll', windowScrollHandler, true);
      scope.$on('$destroy', function() {
        angular.element($window)
          .off('blur', windowBlurHandler)
          .off('resize', debouncedOnResize);

        parent
          .off(ENTER_EVENTS, enterHandler)
          .off(LEAVE_EVENTS, leaveHandler)
          .off('mousedown', mousedownHandler);

        // Trigger the handler in case any the tooltip was still visible.
        leaveHandler();
        document.removeEventListener('scroll', windowScrollHandler, true);
        attributeObserver && attributeObserver.disconnect();
      });

      var enterHandler = function(e) {
        // Prevent the tooltip from showing when the window is receiving focus.
        if (e.type === 'focus' && elementFocusedOnWindowBlur) {
          elementFocusedOnWindowBlur = false;
        } else if (!scope.visible) {
          parent.on(LEAVE_EVENTS, leaveHandler);
          setVisible(true);

          // If the user is on a touch device, we should bind the tap away after
          // the `touched` in order to prevent the tooltip being removed immediately.
          if (e.type === 'touchstart') {
            parent.one('touchend', function() {
              $mdUtil.nextTick(function() {
                $document.one('touchend', leaveHandler);
              }, false);
            });
          }
        }
      };
      var leaveHandler = function () {
        var autohide = scope.hasOwnProperty('autohide') ? scope.autohide : attr.hasOwnProperty('mdAutohide');

        if (autohide || mouseActive || $document[0].activeElement !== parent[0]) {
          // When a show timeout is currently in progress, then we have to cancel it.
          // Otherwise the tooltip will remain showing without focus or hover.
          if (showTimeout) {
            $timeout.cancel(showTimeout);
            setVisible.queued = false;
            showTimeout = null;
          }

          parent.off(LEAVE_EVENTS, leaveHandler);
          parent.triggerHandler('blur');
          setVisible(false);
        }
        mouseActive = false;
      };
      var mousedownHandler = function() {
        mouseActive = true;
      };

      // to avoid `synthetic clicks` we listen to mousedown instead of `click`
      parent.on('mousedown', mousedownHandler);
      parent.on(ENTER_EVENTS, enterHandler);
    }

    function setVisible (value) {
      // break if passed value is already in queue or there is no queue and passed value is current in the scope
      if (setVisible.queued && setVisible.value === !!value || !setVisible.queued && scope.visible === !!value) return;
      setVisible.value = !!value;

      if (!setVisible.queued) {
        if (value) {
          setVisible.queued = true;
          showTimeout = $timeout(function() {
            scope.visible = setVisible.value;
            setVisible.queued = false;
            showTimeout = null;

            if (!scope.visibleWatcher) {
              onVisibleChanged(scope.visible);
            }
          }, scope.delay);
        } else {
          $mdUtil.nextTick(function() {
            scope.visible = false;
            if (!scope.visibleWatcher)
              onVisibleChanged(false);
          });
        }
      }
    }

    function showTooltip() {
      //  Do not show the tooltip if the text is empty.
      if (!element[0].textContent.trim()) return;

      // Insert the element and position at top left, so we can get the position
      // and check if we should display it
      element.css({top: 0, left: 0});
      tooltipParent.append(element);

      // Check if we should display it or not.
      // This handles hide-* and show-* along with any user defined css
      if ( $mdUtil.hasComputedStyle(element, 'display', 'none')) {
        scope.visible = false;
        element.detach();
        return;
      }

      updatePosition();

      $animate.addClass(content, SHOW_CLASS).then(function() {
        element.addClass(SHOW_CLASS);
      });
    }

    function hideTooltip() {
      $animate.removeClass(content, SHOW_CLASS).then(function(){
        element.removeClass(SHOW_CLASS);
        if (!scope.visible) element.detach();
      });
    }

    function updatePosition() {
      if ( !scope.visible ) return;

      updateContentOrigin();
      positionTooltip();
    }

    function positionTooltip() {
      var tipRect = $mdUtil.offsetRect(element, tooltipParent);
      var parentRect = $mdUtil.offsetRect(parent, tooltipParent);
      var newPosition = getPosition(scope.direction);
      var offsetParent = element.prop('offsetParent');

      // If the user provided a direction, just nudge the tooltip onto the screen
      // Otherwise, recalculate based on 'top' since default is 'bottom'
      if (scope.direction) {
        newPosition = fitInParent(newPosition);
      } else if (offsetParent && newPosition.top > offsetParent.scrollHeight - tipRect.height - TOOLTIP_WINDOW_EDGE_SPACE) {
        newPosition = fitInParent(getPosition('top'));
      }

      element.css({
        left: newPosition.left + 'px',
        top: newPosition.top + 'px'
      });

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
