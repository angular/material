/**
 * @ngdoc module
 * @name material.components.tooltipMdPanel
 */
angular
  .module('material.components.tooltipMdPanel', [ 'material.core' ])
  .directive('mdTooltipMdPanel', MdTooltipDirective);

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
function MdTooltipDirective($$rAF, $timeout, $window, $document, $q, $interpolate, $rootElement,
  $mdTheming, $mdUtil, $mdPanel) {

  var ENTER_EVENTS = 'focus touchstart mouseenter';
  var LEAVE_EVENTS = 'blur touchcancel mouseleave';
  var TOOLTIP_SHOW_DELAY = 0;

  return {
    restrict: 'E',
    transclude: true,
    priority: 210, // Before ngAria
    template: '<div class="_md-content _md" ng-transclude></div>',
    scope: {
      delay: '=?mdDelay',
      visible: '=?mdVisible',
      autohide: '=?mdAutoHide',
      direction: '@?mdDirection' // Only expect raw or interpolated string value; not expression
    },
    link: linkFunc
  };

  function linkFunc(scope, element, attr) {

    $mdTheming(element);

    var parent = $mdUtil.getParentWithPointerEvents(element),
        attachTo = angular.element(document.body),
        showTimeout = null,
        debouncedOnResize = $$rAF.throttle(function() {
          updatePosition();
        }),
        origin = null,
        position = null,
        panelPosition = null,
        panelAnimation = null,
        panelConfig = null,
        panelRef = null;

    // Initialize element
    setDefaults();
    manipulateElement();
    updatePosition();
    bindEvents();
    configureWatchers();
    addAriaLabel();


    function setDefaults() {
      scope.delay = scope.delay || TOOLTIP_SHOW_DELAY;
    }

    function manipulateElement() {
      element.detach();
      element.attr('role', 'tooltip');
    }

    function updatePosition() {
      var direction = scope.direction || 'bottom';

      if (panelRef) panelRef.removeClass(origin, true);

      origin = '_md-origin-' + direction;

      switch (direction) {
        case 'top'    : position = { x: 'CENTER',       y: 'ABOVE' };   break;
        case 'right'  : position = { x: 'OFFSET_END',   y: 'CENTER' };  break;
        case 'bottom' : position = { x: 'CENTER',       y: 'BELOW' };   break;
        case 'left'   : position = { x: 'OFFSET_START', y: 'CENTER' };  break;
      }

      panelPosition = $mdPanel.newPanelPosition()
        .relativeTo(parent)
        .addPanelPosition($mdPanel.xPosition[position.x], $mdPanel.yPosition[position.y]);

      if (panelRef) {
        panelRef.addClass(origin, true);
        panelRef.updatePosition(panelPosition);
      }
    }

    function bindEvents() {
      var mouseActive = false;

      // Add an mutationObserver when there is support for it
      // and the need for it in the form of viable host(parent[0])
      if (parent[0] && 'MutationObserver' in $window) {
        // Use an mutationObserver to tackle #2602
        var attributeObserver = new MutationObserver(function(mutations) {
          if (mutations.some(function(mutation) {
            return (mutation.attributeName === 'disabled' && parent[0].disabled);
          })) {
            $mdUtil.nextTick(function() {
              setVisible(false);
            });
          }
        });

        attributeObserver.observe(parent[0], { attributes: true });
      }

      // Store whether the element was focused when the window loses focus
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

        // Trigger the handler in case the tooltip was still visible.
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
          // the 'touched' in order to prevent the tooltip being removed immediately
          if (e.type === 'touchstart') {
            parent.one('touchend', function() {
              $mdUtil.nextTick(function() {
                $document.one('touchend', leaveHandler);
              });
            });
          }
        }
      };

      var leaveHandler = function() {
        var autohide = scope.hasOwnProperty('autohide') ? scope.autohide : attr.hasOwnProperty('mdAutoHide');

        if (autohide || mouseActive || $document[0].activeElement !== parent[0]) {
          // When a show timeout is currently in progress, then we have to cancel it,
          // otherwise the tooltip will remain showing without focus or hover.
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

      // To avoid 'synthetic clicks' we listen to mousedown instead of 'click'
      parent.on('mousedown', mousedownHandler);
      parent.on(ENTER_EVENTS, enterHandler);
    }

    function onVisibleChanged(isVisible) {
      if (isVisible) showTooltip();
      else hideTooltip();
    }

    function configureWatchers() {
      if (element[0] && 'MutationObserver' in $window) {
        var attributeObserver = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'md-visible') {
              if (!scope.visibleWatcher) scope.visibleWatcher = scope.$watch('visible', onVisibleChanged);
            }
            if (mutation.attributeName === 'md-direction') {
              updatePosition();
            }
          });
        });

        attributeObserver.observe(element[0], { attributes: true });

        // Build watcher only if mdVisible is being used
        if (attr.hasOwnProperty('mdVisible')) {
          scope.visibleWatcher = scope.$watch('visible', onVisibleChanged);
        }
      } else { // MutationObserver not supported
        scope.visibleWatcher = scope.$watch('visible', onVisibleChanged);
        scope.$watch('direction', updatePosition);
      }

      var onElementDestroy = function() {
        scope.$destroy();
      };

      // Clean up if the element or parent was removed via jqLite's .remove.
      // A couple of notes:
      // - In these cases the scope might not have been destroyed, which is why we
      // destroy it manually. An example of this can be having 'md-visible="false"' and
      // adding tooltips while they're invisible. If 'md-visible' become true, at some
      // point, you'd usually get a lot of inputs.
      // - We use '.one', not '.on', because this only needs to fire once. If we were
      // using '.on', it would get thrown into an infinite loop.
      // - This kicks off the scope's '$destroy' event which finishes the cleanup.
      element.one('$destroy', onElementDestroy);
      parent.one('$destroy', onElementDestroy);
      scope.$on('$destroy', function() {
        setVisible(false);
        element.remove();
        attributeObserver && attributeObserver.disconnect();
      });

      // Updates the aria-label when the element text changes. This watch doesn't
      // need to be set up if the element doesn't have any data bindings.
      if (element.text().indexOf($interpolate.startSymbol()) > -1) {
        scope.$watch(function() {
          return element.text().trim();
        }, addAriaLabel);
      }
    }

    function addAriaLabel(override) {
      if ((override || !parent.attr('aria-label')) && !parent.text().trim()) {
        var rawText = override || element.text().trim();
        var interpolatedText = $interpolate(rawText)(parent.scope());
        parent.attr('aria-label', interpolatedText);
      }
    }

    function setVisible(value) {
      // Break if passed value is already in queue or there is no queue and
      // passed value is current in the scope
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
            if (!scope.visibleWatcher) onVisibleChanged(false);
          });
        }
      }
    }

    function showTooltip() {
      // Do not show the tooltip if the text is empty.
      if (!element[0].textContent.trim()) return;

      panelAnimation = $mdPanel.newPanelAnimation()
        .openFrom(parent)
        .closeTo(parent)
        .withAnimation({
          open: '_md-show',
          close: '_md-hide'
        });

      panelConfig = {
        attachTo: attachTo,
        template: element.html().replace(' ng-transclude=""', '').replace(' class="ng-scope"', ''),
        propagateContainerEvents: true,
        panelClass: 'md-tooltip-md-panel ' + origin,
        animation: panelAnimation,
        position: panelPosition,
        zIndex: 100,
        focusOnOpen: false
      };

      panelRef = $mdPanel.create(panelConfig);
      // We are creating the panelRef before opening it due to the issue of having to wait for the open
      // to completely finish before assigning it to the panelRef variable. If you have to wait, then
      // there is a possibility of the panelRef not being defined before you need to close it, and this
      // causes the panel to remain open.
      panelRef.open();
    }

    function hideTooltip() {
      panelRef && panelRef.close();
    }

  }

}
