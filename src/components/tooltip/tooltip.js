var MdTooltipComponent = {
  controller: MdTooltipController,
  bindings: {
    mdDelay: '<?',
    mdVisible: '<?',
    mdAutohide: '<?',
    mdDirection: '<?'
  }
};


/**
 * @ngdoc module
 * @name material.components.tooltip
 */
angular
    .module('material.components.tooltip', [
      'material.core',
      'material.components.panel'
    ])
    .component('mdTooltip', MdTooltipComponent)
    .service('$$mdTooltipRegistry', MdTooltipRegistry);


/**
 * @ngdoc directive
 * @name mdTooltip
 * @module material.components.tooltip
 * @description
 * Tooltips are used to describe elements that are interactive and primarily
 * graphical (not textual).
 *
 * Place a `<md-tooltip>` as a child of the element it describes.
 *
 * A tooltip will activate when the user hovers over, focuses, or touches the
 * parent element.
 *
 * @usage
 * <hljs lang="html">
 *   <md-button class="md-fab md-accent" aria-label="Play">
 *     <md-tooltip>Play Music</md-tooltip>
 *     <md-icon md-svg-src="img/icons/ic_play_arrow_24px.svg"></md-icon>
 *   </md-button>
 * </hljs>
 *
 * @param {expression=} md-visible Boolean bound to whether the tooltip is
 *     currently visible.
 * @param {number=} md-delay How many milliseconds to wait to show the tooltip
 *     after the user hovers over, focuses, or touches the parent element.
 *     Defaults to 0ms on non-touch devices and 75ms on touch.
 * @param {boolean=} md-autohide If present or provided with a boolean value,
 *     the tooltip will hide on mouse leave, regardless of focus.
 * @param {string=} md-direction The direction that the tooltip is shown,
 *     relative to the parent element. Supports top, right, bottom, and left.
 *     Defaults to bottom.
 */
function MdTooltipController($element, $window, $document, $interpolate,
    $$rAF, $timeout, $mdUtil, $mdTheming, $mdPanel, $$mdTooltipRegistry) {
      var $ctrl = this;


      $ctrl.$onInit = onInit;
      $ctrl.$onChanges = onChanges;
      $ctrl.$onDestroy = onDestroy;


      var ENTER_EVENTS = 'focus touchstart mouseenter';
      var LEAVE_EVENTS = 'blur touchcancel mouseleave';
      var TOOLTIP_SHOW_DELAY = 0;
      var TOOLTIP_DIRECTION = 'bottom';

      var parent = $mdUtil.getParentWithPointerEvents($element);
      var attachTo = angular.element(document.body);
      var origin = null;
      var position = null;
      var panelPosition = null;
      var panelAnimation = null;
      var panelConfig = null;
      var panelRef = null;
      var mouseActive = false;
      var attributeObserver = null;
      var showTimeout = null;
      var elementFocusedOnWindowBlur = null;
      var debouncedOnResize = $$rAF.throttle(updatePosition);


      function onInit() {
        // Initialize the theming of the tooltip.
        $mdTheming($element);

        // Set parent aria-label.
        addAriaLabel();

        // Remove the element from its current DOM position.
        $element.detach();
        $element.attr('role', 'tooltip');

        $mdUtil.nextTick(function() {
          // Set default controller values.
          $ctrl.mdDelay = $ctrl.mdDelay || TOOLTIP_SHOW_DELAY;
          $ctrl.mdDirection = $ctrl.mdDirection || TOOLTIP_DIRECTION;

          updatePosition();
          bindEvents();
        });
      }

      function onChanges(changes) {
        if (angular.isDefined(changes.mdVisible)) {
          onVisibleChanged(changes.mdVisible.currentValue);
        } else if (angular.isDefined(changes.mdDirection)) {
          updatePosition();
        }
      }

      function onDestroy() {
        angular.element($window)
            .off('blur', windowBlurEventHandler)
            .off('resize', debouncedOnResize);

        $$mdTooltipRegistry.deregister('scroll', windowScrollEventHandler, true);
        $$mdTooltipRegistry.deregister('blur', windowBlurEventHandler);
        $$mdTooltipRegistry.deregister('resize', debouncedOnResize);

        parent
            .off(ENTER_EVENTS, enterEventHandler)
            .off(LEAVE_EVENTS, leaveEventHandler)
            .off('mousedown', mousedownEventHandler);

        setVisible(false);
        $element.remove();

        // Trigger the handler in case the tooltip was still visible.
        leaveEventHandler();
        document.removeEventListener('scroll', windowScrollEventHandler, true);
        attributeObserver && attributeObserver.disconnect();
      }

      function updatePosition() {
        // If the panel has already been created, remove the current origin
        // class from the panel element.
        if (panelRef) {
          panelRef.panelEl.removeClass(origin);
        }

        // Set the panel element origin class based off of the current
        // mdDirection.
        origin = 'md-origin-' + $ctrl.mdDirection;

        // Create the position of the panel based off of the mdDirection.
        switch ($ctrl.mdDirection) {
          case 'top':
            position = {
              x: 'CENTER',
              y: 'ABOVE'
            };
            break;
          case 'right':
            position = {
              x: 'OFFSET_END',
              y: 'CENTER'
            };
            break;
          case 'bottom':
            position = {
              x: 'CENTER',
              y: 'BELOW'
            };
            break;
          case 'left':
            position = {
              x: 'OFFSET_START',
              y: 'CENTER'
            };
            break;
        }

        // Using the newly created position object, use the MdPanel
        // panelPosition API to build the panel's position.
        panelPosition = $mdPanel.newPanelPosition()
            .relativeTo(parent)
            .addPanelPosition(
              $mdPanel.xPosition[position.x],
              $mdPanel.yPosition[position.y]
            );

        // If the panel has already been created, add the new origin class to
        // the panel element and update it's position with the panelPosition.
        if (panelRef) {
          panelRef.panelEl.addClass(origin);
          panelRef.updatePosition(panelPosition);
        }
      }

      function windowBlurEventHandler() {
        elementFocusedOnWindowBlur = document.activeElement === parent[0];
      }

      function windowScrollEventHandler() {
        setVisible(false);
      }

      function mousedownEventHandler() {
        mouseActive = true;
      }

      function enterEventHandler($event) {
        // Prevent the tooltip from showing when the window is receiving focus.
        if ($event.type === 'focus' && elementFocusedOnWindowBlur) {
          elementFocusedOnWindowBlur = false;
        } else if (!$ctrl.mdVisible) {
          parent.on(LEAVE_EVENTS, leaveEventHandler);
          setVisible(true);

          // If the user is on a touch device, we should bind the tap away after
          // the 'touched' in order to prevent the tooltip being removed
          // immediately.
          if ($event.type === 'touchstart') {
            parent.one('touchend', function() {
              $mdUtil.nextTick(function() {
                $document.one('touchend', leaveEventHandler);
              }, false);
            });
          }
        }
      }

      function leaveEventHandler() {
        if ($ctrl.mdAutohide ||
            mouseActive ||
            $document[0].activeElement !== parent[0]) {
              // When a show timeout is currently in progress, then we have to
              // cancel it, otherwise the tooltip will remain showing without
              // focus or hover.
              if (showTimeout) {
                $timeout.cancel(showTimeout);
                setVisible.queued = false;
                showTimeout = null;
              }

              parent.off(LEAVE_EVENTS, leaveEventHandler);
              parent.triggerHandler('blur');
              setVisible(false);
            }
        mouseActive = false;
      }

      function bindEvents() {
        // Add a mutationObserver where there is support for it and then need
        // for it in the form of viable hose(parent[0]).
        if (parent[0] && 'MutationObserver' in $window) {
          // Use a mutationObserver to tackle #2602.
          attributeObserver = new MutationObserver(function(mutations) {
            if (mutations.some(function(mutation) {
              return (mutation.attributeName === 'disabled' &&
                  parent[0].disabled);
            })) {
              $mdUtil.nextTick(function() {
                setVisible(true);
              });
            }
          });

          attributeObserver.observe(parent[0], {
            attributes: true
          });
        }

        elementFocusedOnWindowBlur = false;

        $$mdTooltipRegistry.register('scroll', windowScrollEventHandler, true);
        $$mdTooltipRegistry.register('blur', windowBlurEventHandler);
        $$mdTooltipRegistry.register('resize', debouncedOnResize);

        // To avoid 'synthetic clicks', we listen to mousedown instead of
        // 'click'
        parent.on('mousedown', mousedownEventHandler);
        parent.on(ENTER_EVENTS, enterEventHandler);
      }

      function setVisible(value) {
        // Break if passed value is already in queue or there is no queue and
        // passed value is current in the controller.
        if (setVisible.queued && setVisible.value === !!value ||
            !setVisible.queued && $ctrl.mdVisible === !!value) {
              return;
            }
        setVisible.value = !!value;

        if (!setVisible.queued) {
          if (value) {
            setVisible.queued = true;
            showTimeout = $timeout(function() {
              $ctrl.mdVisible = setVisible.value;
              setVisible.queued = false;
              showTimeout = null;
              onVisibleChanged($ctrl.mdVisible);
            }, $ctrl.mdDelay);
          } else {
            $mdUtil.nextTick(function() {
              $ctrl.mdVisible = false;
              onVisibleChanged(false);
            });
          }
        }
      }

      function onVisibleChanged(isVisible) {
        if (isVisible) {
          showTooltip();
        } else {
          hideTooltip();
        }
      }

      function addAriaLabel(override) {
        if ((override || !parent.attr('aria-label')) && !parent.text().trim()) {
          var rawText = override || $element.text().trim();
          var interpolatedText = $interpolate(rawText)(parent.scope());
          parent.attr('aria-label', interpolatedText);
        }
      }

      function showTooltip() {
        // Do not show the tooltip if the text is empty.
        if (!$element[0].textContent.trim()) {
          throw new Error('Text for the tooltip has not been provided. ' +
              'Please include text within the mdTooltip element.');
        }

        panelAnimation = $mdPanel.newPanelAnimation()
            .openFrom(parent)
            .closeTo(parent)
            .withAnimation({
              open: 'md-show',
              close: 'md-hide'
            });

        panelConfig = {
          attachTo: attachTo,
          template: $element.html(),
          propagateContainerEvents: true,
          panelClass: 'md-tooltip ' + origin,
          animation: panelAnimation,
          position: panelPosition,
          zIndex: 100,
          focusOnOpen: false
        };

        panelRef = $mdPanel.create(panelConfig);
        // We are creating the panelRef before opening it due to the issue of
        // having to wait for the open to completely finish before assigning
        // it to the panelRef variable. If you have to wait, then there is a
        // possibility of the panelRef not being defined before you need to
        // close it, and this causes the panel to remain open.
        panelRef.open();
      }

      function hideTooltip() {
        panelRef && panelRef.close();
      }
    }


/**
 * Service that is used to reduce the amount of listeners that are being
 * registered on the `window` by the tooltip component. Works by collecting
 * the individual event handlers and dispatching them from a global handler.
 *
 * @ngInject
 */
function MdTooltipRegistry() {
  var listeners = {};
  var ngWindow = angular.element(window);

  return {
    register: register,
    deregister: deregister
  };

  /**
   * Global event handler that dispatches the registered handlers in the
   * service.
   * @param {Event} event Event object passed in by the browser
   */
  function globalEventHandler(event) {
    if (listeners[event.type]) {
      listeners[event.type].forEach(function(currentHandler) {
        currentHandler.call(this, event);
      }, this);
    }
  }

  /**
   * Registers a new handler with the service.
   * @param {string} type Type of event to be registered.
   * @param {function} handler Event handler.
   * @param {boolean} useCapture Whether to use event capturing.
   */
  function register(type, handler, useCapture) {
    var array = listeners[type] = listeners[type] || [];

    if (!array.length) {
      if (useCapture) {
        window.addEventListener(type, globalEventHandler, true);
      } else {
        ngWindow.on(type, globalEventHandler);
      }
    }

    if (array.indexOf(handler) === -1) {
      array.push(handler);
    }
  }

  /**
   * Removes an event handler from the service.
   * @param {string} type Type of event handler.
   * @param {function} handler The event handler itself.
   * @param {boolean} useCapture Whether the event handler used event capturing.
   */
  function deregister(type, handler, useCapture) {
    var array = listeners[type];
    var index = array ? array.indexOf(handler) : -1;

    if (index > -1) {
      array.splice(index, 1);

      if (array.length === 0) {
        if (useCapture) {
          window.removeEventListener(type, globalEventHandler, true);
        } else {
          ngWindow.off(type, globalEventHandler);
        }
      }
    }
  }
}
