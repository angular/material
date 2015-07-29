angular.module('material.components.menu')
.provider('$mdMenu', MenuProvider);

/*
 * Interim element provider for the menu.
 * Handles behavior for a menu while it is open, including:
 *    - handling animating the menu opening/closing
 *    - handling key/mouse events on the menu element
 *    - handling enabling/disabling scroll while the menu is open
 *    - handling redrawing during resizes and orientation changes
 *
 */

function MenuProvider($$interimElementProvider) {
  var MENU_EDGE_MARGIN = 8;

  return $$interimElementProvider('$mdMenu')
    .setDefaults({
      methods: ['target'],
      options: menuDefaultOptions
    });

  /* @ngInject */
  function menuDefaultOptions($mdUtil, $mdTheming, $mdConstant, $document, $window, $q, $$rAF, $animateCss, $animate) {
    var animator = $mdUtil.dom.animator;

    return {
      parent: 'body',
      onShow: onShow,
      onRemove: onRemove,
      hasBackdrop: true,
      disableParentScroll: true,
      skipCompile: true,
      preserveScope: true,
      themable: true
    };

    /**
      * Show modal backdrop element...
      */
     function showBackdrop(scope, element, options) {

       if (options.hasBackdrop) {
         options.backdrop = $mdUtil.createBackdrop(scope, "md-menu-backdrop md-click-catcher");

         //options.parent.append(options.backdrop);
         $animate.enter(options.backdrop, options.parent);
       }

       // If we are not within a dialog...
       if (options.disableParentScroll && !$mdUtil.getClosest(options.target, 'MD-DIALOG')) {
         options.restoreScroll = $mdUtil.disableScrollAround(options.element,options.parent);
       } else {
         options.disableParentScroll = false;
       }

       /**
        * Hide modal backdrop element...
        */
       return function hideBackdrop() {
         if (options.backdrop) {
           //options.backdrop.remove();
           $animate.leave(options.backdrop);
         }
         if (options.disableParentScroll) {
           options.restoreScroll();
         }
       }
     }

    /**
     * Boilerplate interimElement onRemove function
     * Handles removing the menu from the DOM, cleaning up the element
     * and removing various listeners
     */
    function onRemove(scope, element, opts) {
      opts.cleanupInteraction();
      opts.cleanupResizing();

      return $animateCss(element, { addClass : 'md-leave' })
        .start()
        .then(function() {
          element.removeClass('md-active');
          opts.hideBackdrop();

          detachElement(element, opts);
          opts.alreadyOpen = false;
        });
    }

    /**
     * Boilerplate interimElement onShow function
     * Handles inserting the menu into the DOM, positioning it, and wiring up various interaction events
     */
    function onShow(scope, element, opts) {
      sanitizeAndConfigure(opts);

      // Wire up theming on our menu element
      $mdTheming.inherit(opts.menuContentEl, opts.target);

      // Register various listeners to move menu on resize/orientation change
      opts.cleanupResizing = activateResizing();
      opts.hideBackdrop = showBackdrop(scope,element,opts);

      // Return the promise for when our menu is done animating in
      return showMenu()
        .then( function(response) {
          opts.alreadyOpen = true;
          opts.cleanupInteraction = activateInteraction();
          return response;
        });

      /**
       * Place the menu into the DOM and call positioning related functions
       */
      function showMenu() {
        opts.parent.append(element);

        return $q(function(resolve){

          $animateCss(element, { removeClass: 'md-leave', duration:0 })
            .start()
            .then(function(){
              var position = calculateMenuPosition(element, opts);

              $animateCss(element, {
                addClass : 'md-active',
                from : animator.toCss( position ),
                to : animator.toCss( { transform : 'scale(1.0,1.0)' })
              })
              .start()
              .then( resolve );

             });
        });
      }

      /**
       * Check for valid opts and set some sane defaults
       */
      function sanitizeAndConfigure() {
        if (!opts.target) {
          throw new Error(
            '$mdMenu.show() expected a target to animate from in options.target'
          );
        }
        angular.extend(opts, {
          alreadyOpen: false,
          isRemoved: false,
          target: angular.element(opts.target), //make sure it's not a naked dom node
          parent: angular.element(opts.parent),
          menuContentEl: angular.element(element[0].querySelector('md-menu-content'))
        });
      }

      /**
       * Configure various resize listeners for screen changes
       */
      function activateResizing() {

        var debouncedOnResize = (function(target,options){
          return $$rAF.throttle(function () {
            if (opts.isRemoved) return;
            var position = calculateMenuPosition(target, options);

            target.css( animator.toCss(position) );
          });
        })(element,opts);

        var window = angular.element($window);
        
        window.on('resize', debouncedOnResize);
        window.on('orientationchange', debouncedOnResize);

         return function deactivateResizing() {

            // Disable resizing handlers
            window.off('resize', debouncedOnResize);
            window.off('orientationchange', debouncedOnResize);
          }
        }

      /**
       * Activate interaction on the menu. Wire up keyboard listerns for
       * clicks, keypresses, backdrop closing, etc.
       */
      function activateInteraction() {
        element.addClass('md-clickable');

        // close on backdrop click
        opts.backdrop && opts.backdrop.on('click', onBackdropClick );

        // Wire up keyboard listeners.
        // - Close on escape,
        // - focus next item on down arrow,
        // - focus prev item on up
        opts.menuContentEl.on('keydown', onMenuKeyDown);
        opts.menuContentEl[0].addEventListener('click', captureClickListener, true);

        // kick off initial focus in the menu on the first element
        var focusTarget = opts.menuContentEl[0].querySelector('[md-menu-focus-target]');
        if (!focusTarget) focusTarget = opts.menuContentEl[0].firstElementChild.firstElementChild;
        focusTarget.focus();

        return function cleanupInteraction() {
          element.removeClass('md-clickable');
          opts.backdrop && opts.backdrop.off('click', onBackdropClick);
          opts.menuContentEl.off('keydown', onMenuKeyDown);
          opts.menuContentEl[0].removeEventListener('click', captureClickListener, true);
        };

        // ************************************
        // Closure Functions
        // ************************************

        function onMenuKeyDown(ev) {
           scope.$apply(function() {
             switch (ev.keyCode) {
               case $mdConstant.KEY_CODE.ESCAPE: opts.mdMenuCtrl.close(); break;
               case $mdConstant.KEY_CODE.UP_ARROW: focusMenuItem(ev, opts.menuContentEl, opts, -1); break;
               case $mdConstant.KEY_CODE.DOWN_ARROW: focusMenuItem(ev, opts.menuContentEl, opts, 1); break;
             }
           });
        }

        function onBackdropClick(e) {
          e.preventDefault();
          e.stopPropagation();
          scope.$apply(function() {
            opts.mdMenuCtrl.close(true);
          });
        }

        // Close menu on menu item click, if said menu-item is not disabled
        function captureClickListener(e) {
          var target = e.target;
          // Traverse up the event until we get to the menuContentEl to see if
          // there is an ng-click and that the ng-click is not disabled
          do {
            if (target == opts.menuContentEl[0]) return;
            if (hasAnyAttribute(target, ['ng-click', 'ng-href', 'ui-sref'])) {
              if (!target.hasAttribute('disabled')) {
                close();
              }
              break;
            }
          } while (target = target.parentNode)

          function close() {
            scope.$apply(function() {
              opts.mdMenuCtrl.close();
            });
          }

          function hasAnyAttribute(target, attrs) {
            if (!target) return false;
            for (var i = 0, attr; attr = attrs[i]; ++i) {
              var altForms = [attr, 'data-' + attr, 'x-' + attr];
              for (var j = 0, rawAttr; rawAttr = altForms[j]; ++j) {
                if (target.hasAttribute(rawAttr)) {
                  return true;
                }
              }
            }
            return false;
          }
        }

      }
    }

    /**
      * Takes a keypress event and focuses the next/previous menu
      * item from the emitting element
      * @param {event} e - The origin keypress event
      * @param {angular.element} menuEl - The menu element
      * @param {object} opts - The interim element options for the mdMenu
      * @param {number} direction - The direction to move in (+1 = next, -1 = prev)
      */
    function focusMenuItem(e, menuEl, opts, direction) {
      var currentItem = $mdUtil.getClosest(e.target, 'MD-MENU-ITEM');

      var items = $mdUtil.nodesToArray(menuEl[0].children);
      var currentIndex = items.indexOf(currentItem);

      // Traverse through our elements in the specified direction (+/-1) and try to
      // focus them until we find one that accepts focus
      for (var i = currentIndex + direction; i >= 0 && i < items.length; i = i + direction) {
        var focusTarget = items[i].firstElementChild || items[i];
        var didFocus = attemptFocus(focusTarget);
        if (didFocus) {
          break;
        }
      }
    }

    /**
     * Attempts to focus an element. Checks whether that element is the currently
     * focused element after attempting.
     * @param {HTMLElement} el - the element to attempt focus on
     * @returns {bool} - whether the element was successfully focused
     */
    function attemptFocus(el) {
      if (el && el.getAttribute('tabindex') != -1) {
        el.focus();
        return  ($document[0].activeElement == el) ? true : false;
      }
    }

    /**
     * Use browser to remove this element without triggering a $destory event
     */
    function detachElement(element, opts) {
      if (element[0].parentNode === opts.parent[0]) {
        opts.parent[0].removeChild(element[0]);
      }
    }

    /**
     * Computes menu position and sets the style on the menu container
     * @param {HTMLElement} el - the menu container element
     * @param {object} opts - the interim element options object
     */
    function calculateMenuPosition(el, opts) {

      var containerNode = el[0],
          openMenuNode = el[0].firstElementChild,
          openMenuNodeRect = openMenuNode.getBoundingClientRect(),
          boundryNode = opts.parent[0],
          boundryNodeRect = boundryNode.getBoundingClientRect();

      var originNode = opts.target[0].querySelector('[md-menu-origin]') || opts.target[0],
          originNodeRect = originNode.getBoundingClientRect();


      var bounds = {
        left: boundryNodeRect.left + MENU_EDGE_MARGIN,
        top: Math.max(boundryNodeRect.top, 0) + MENU_EDGE_MARGIN,
        bottom: Math.max(boundryNodeRect.bottom, Math.max(boundryNodeRect.top, 0) + boundryNodeRect.height) - MENU_EDGE_MARGIN,
        right: boundryNodeRect.right - MENU_EDGE_MARGIN
      };


      var alignTarget, alignTargetRect, existingOffsets;
      var positionMode = opts.mdMenuCtrl.positionMode();

      if (positionMode.top == 'target' || positionMode.left == 'target' || positionMode.left == 'target-right') {
        // TODO: Allow centering on an arbitrary node, for now center on first menu-item's child
        alignTarget = firstVisibleChild();
        if (!alignTarget) {
          throw Error('Error positioning menu. No visible children.');
        }

        alignTarget = alignTarget.firstElementChild || alignTarget;
        alignTarget = alignTarget.querySelector('[md-menu-align-target]') || alignTarget;
        alignTargetRect = alignTarget.getBoundingClientRect();

        existingOffsets = {
          top: parseFloat(containerNode.style.top || 0),
          left: parseFloat(containerNode.style.left || 0)
        };
      }

      var position = { };
      var transformOrigin = 'top ';

      switch (positionMode.top) {
        case 'target':
          position.top = existingOffsets.top + originNodeRect.top - alignTargetRect.top;
          break;
        // Future support for mdMenuBar
        // case 'top':
        //   position.top = originNodeRect.top;
        //   break;
        case 'bottom':
          position.top = originNodeRect.top + originNodeRect.height;
          break;
        default:
          throw new Error('Invalid target mode "' + positionMode.top + '" specified for md-menu on Y axis.');
      }

      switch (positionMode.left) {
        case 'target':
          position.left = existingOffsets.left + originNodeRect.left - alignTargetRect.left;
          transformOrigin += 'left';
          break;
        case 'target-right':
          position.left = originNodeRect.right - openMenuNodeRect.width + (openMenuNodeRect.right - alignTargetRect.right);
          transformOrigin += 'right';
          break;
        // Future support for mdMenuBar
        case 'left':
          position.left = originNodeRect.left;
          transformOrigin += 'left';
          break;
        // case 'right':
        //   position.left = originNodeRect.right - containerNode.offsetWidth;
        //   transformOrigin += 'right';
        //   break;
        default:
          throw new Error('Invalid target mode "' + positionMode.left + '" specified for md-menu on X axis.');
      }

      var offsets = opts.mdMenuCtrl.offsets();
      position.top += offsets.top;
      position.left += offsets.left;

      clamp(position);

      var scaleX = Math.round(100 * Math.min(originNodeRect.width / containerNode.offsetWidth, 1.0))/100;
      var scaleY = Math.round(100 * Math.min(originNodeRect.height / containerNode.offsetHeight, 1.0))/100;

      return {
        top: Math.round(position.top),
        left: Math.round(position.left),

        // Animate a scale out if we aren't just repositioning
        transform : !opts.alreadyOpen ? $mdUtil.supplant('scale({0},{1})',[scaleX, scaleY]) : undefined,

        transformOrigin : transformOrigin
      };

      /**
       * Clamps the repositioning of the menu within the confines of
       * bounding element (often the screen/body)
       */
      function clamp(pos) {
        pos.top = Math.max(Math.min(pos.top, bounds.bottom - containerNode.offsetHeight), bounds.top);
        pos.left = Math.max(Math.min(pos.left, bounds.right - containerNode.offsetWidth), bounds.left);
      }

      /**
        * Gets the first visible child in the openMenuNode
        * Necessary incase menu nodes are being dynamically hidden
        */
      function firstVisibleChild() {
        for (var i = 0; i < openMenuNode.children.length; ++i) {
          if (window.getComputedStyle(openMenuNode.children[i]).display != 'none') {
            return openMenuNode.children[i];
          }
        }
      }
    }
  }
}
