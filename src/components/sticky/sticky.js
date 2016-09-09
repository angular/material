/**
 * @ngdoc module
 * @name material.components.sticky
 * @description
 * Position sticky polyfill for browsers.
 *
 */
angular
  .module('material.components.sticky', ['material.core'])
  .factory('$mdSticky', MdStickyService)
  .directive('mdSticky', MdStickyDirective);

/**
 * @ngdoc service
 * @name $mdSticky
 * @module material.components.sticky
 *
 * @description
 * The `$mdSticky`service provides a `polyfill` to make elements sticky.
 *
 * Whenever the current browser supports stickiness natively, the `$mdSticky` service will just
 * use the native browser stickiness.
 *
 * The `$mdSticky` polyfill tries to follow the
 * [specification draft](https://drafts.csswg.org/css-position/#sticky-pos) as close as possible.
 *
 * There is also a <a ng-href="api/directive/mdSticky">shorthand directive</a> for the `$mdSticky` service.
 *
 * **Performance**
 *
 * To improve the performance the `$mdSticky` service will only recalculate the styles at
 * initialization and while changing its stickiness state.
 *
 * Another profit for the performance is the grouping of scroll events.<br/>
 * `$mdSticky` detects previous registered scroll events and does not create a second one.
 *
 * **Common Problems with Polyfill**
 * 1. The `md-sticky` attribute may not work properly when the element is hidden on load.
 *   <br/>
 *   This can be caused by having `ngCloak` applied or using the attribute inside of a `ngRepeat`.
 *
 * 2. A sticky element can leave its container when being placed inside of another scroll container.
 *   <br/>
 *   The solution would be to move the sticky element into only _one_ scroll container, and not having
 *   it inside of multiple scroll containers.
 *
 * @usage
 *
 * Register an element as sticky.
 *
 * <hljs lang="js">
 *   appModule.controller('AppCtrl', function($mdSticky) {
 *     // ...
 *     $mdSticky(myElement);
 *   });
 * </hljs>
 *
 * Access the `MdStickyElement` API for registered sticky elements.
 *
 * <hljs lang="js">
 *   appModule.controller('AppCtrl', function($mdSticky) {
 *     // ...
 *     var stickyEl = $mdSticky(myElement);
 *
 *     // Manually update the position with new calculated rectangles.
 *     stickyEl.updatePositions();
 *
 *     // Create a scope function to check whether the element is visible
 *     $scope.isVisible = stickyEl.isElementVisible;
 *
 *     // There could have been changes to the sticky element.
 *     // Let's run the normal check and update automatically if necessary.
 *     stickyEl.determineState();
 *   });
 * </hljs>
 *
 * @returns {MdStickyElement} TEST
 *
 *
 */
function MdStickyService($mdUtil, $mdConstant, $window) {

  /** @type {number} */
  var uidCounter = 0;

  /** @type {Object.<string, MdStickyElement>} */
  var stickyElementsMap = {};

  /** @type {string} */
  var stickyBrowserSupport = $mdUtil.checkStickySupport();

  // Register a global scroll listener with capturing enabled.
  $window.addEventListener('scroll', updateStickyElements, true);

  /**
   * Makes the specified element sticky by using the native behavior or applying a native-like
   * polyfill.
   * @param element {JQLite} Element to be sticky
   * @returns {MdStickyElement} Sticky element
   */
  return function registerElement(element) {

    if (stickyBrowserSupport) {
      element.css('position', stickyBrowserSupport);
    } else {
      // Temporary pass the vendor prefixed to the sticky element constructor.
      var stickyEl = new MdStickyElement(element, $mdConstant.CSS.TRANSFORM);
      var uniqueId = uidCounter++;

      // Initialize the sticky element without any listeners.
      stickyEl.initialize(true);

      // Apply the unique sticky ids to the element and all associated scroll parents.
      var scrollElements = stickyEl.scrollContainers.map(function(scrollContainer) {
        return angular.element(scrollContainer.element);
      });

      applyStickyIds(scrollElements, uniqueId);

      // Add the sticky element with the unique id to the listener map.
      stickyElementsMap[uniqueId] = stickyEl;

      return stickyEl;
    }
  };

  /**
   * Apply unique sticky ids to the specified elements.
   */
  function applyStickyIds(elements, uniqueId) {
    elements.forEach(function(el) {
      var stickyIds = el.data('$mdStickyId') || [];

      if (stickyIds.indexOf(uniqueId) === -1) {
        el.data('$mdStickyId', stickyIds.concat(uniqueId));
      }
    });
  }

  /**
   * Event listener to be called when anything in the document scrolls.
   * @param event {Event}
   */
  function updateStickyElements(event) {
    var target = angular.element(event.target);
    var stickyIds = target.data('$mdStickyId') || [];

    stickyIds.forEach(function(uniqueId) {
      stickyElementsMap[uniqueId].determineState();
    });

  }

}

/**
 * @ngdoc directive
 * @restrict A
 * @name mdSticky
 * @module material.components.sticky
 * @description
 *
 * Shorthand for the <a ng-href="api/service/$mdSticky">`$mdSticky`</a> service to register an
 * element as sticky.
 *
 * **Common Problems with the Polyfill**
 *  - Read more about <a ng-href="api/service/$mdSticky">common problems with the polyfill</a>
 *
 * @usage
 *
 * Single sticky element for scroll container.
 *
 * <hljs lang="html">
 *   <div md-sticky>Sticky Element</div>
 *   <content></content>
 * </hljs>
 *
 * Sticky elements will always stick at the end of its parent boundary.<br/>
 * This allows developers to have multiple sections with different sticky elements.
 *
 * > This will look the same as the <a ng-href="demo/subheader">Subheader demo</a>
 *
 * <hljs lang="html">
 *   <section>
 *     <div md-sticky>Section 1</div>
 *     <content></content>
 *   </section>
 *
 *   <section>
 *     <div md-sticky>Section 2</div>
 *     <content></content>
 *   </section>
 * </hljs>
 *
 */
function MdStickyDirective($mdSticky, $log) {
  return {
    restrict: 'A',
    link: function(scope, element) {

      if (!element[0].offsetParent) {
        $log.warn(
          'MdSticky: Applying the `md-sticky` attribute on a hidden element may not work.\n' +
          'A common problem is the use of the `ng-cloak` attribute. There is also the $mdSticky service ' +
          'for manual registration.'
        );
      }

      $mdSticky(element);
    }
  }
}

/**
 * Applies a native-like polyfill for the sticky position to the specified element.
 * The polyfill follows the specification draft from W3C for the sticky positioning.
 * > https://drafts.csswg.org/css-position/#sticky-pos
 *
 * @constructor
 * @name $mdSticky
 * @param element {JQLite} Element to be sticky
 * @param transformProp {?string} Transform property w/o prefix.
 */
function MdStickyElement(element, transformProp) {
  this.element = element;
  this.domElement = element[0];
  this.userRect = this.getUserPositionRect(this.domElement);

  this.scrollContainers = this.findScrollContainers();
  this.viewportContainer = this.scrollContainers[0];

  // TODO(devversion): remove this in the future
  this.transformProp = transformProp || 'transform';

  if (this.userRect.bottom > 0) {
    throw 'Sticky: It is currently not possible to stick element to the bottom.';
  }

  this.isSticky = false;
  this.offsetEl = null;

  // Initially update the rectangles.
  this.updateRectangles();
}

/**
 * Initializes the sticky element by triggering an initial position determination.
 */
MdStickyElement.prototype.initialize = function() {
  this.determineState();
  this.updateElementPosition();
};

/**
 * @ngdoc method
 * @name $mdSticky#updateRectangles
 * @description Recalculates all offsets and rectangles for all related elements.
 */
MdStickyElement.prototype.updateRectangles = function() {
  /* Basic Client Rectangles for related elements. */
  this.elementRect = this.domElement.getBoundingClientRect();
  this.parentRect = this.domElement.parentNode.getBoundingClientRect();
  this.viewportRect = this.viewportContainer.getClientRect();

  /* Offsets of the sticky element in relative to the viewport or scroll container. */
  this.initialScrollPos = this.viewportContainer.getScrollPosition();

  this.viewportTop = this.viewportRect.top + this.userRect.top;
  this.viewportBottom = this.viewportRect.bottom;

  // Offsets of the parent rectangle in relative to the viewport
  this.scrollTop = this.initialScrollPos + (this.parentRect.top - this.viewportRect.top);
  this.scrollBottom = this.scrollTop + this.parentRect.height;
};

/**
 * @ngdoc method
 * @name $mdSticky#determineState
 * @description
 * Determines the current state of the sticky element and triggers a position update if any
 * change was detected.
 */
MdStickyElement.prototype.determineState = function() {
  var isVisible = this.isElementVisible();

  if (isVisible && !this.isSticky) {
    this.isSticky = true;
    this.updatePositions();
  } else if (!isVisible && this.isSticky) {
    this.isSticky = false;
    this.updatePositions();
  }
};

/**
 * @ngdoc method
 * @name $mdSticky#updatePositions
 * @description
 * Updates the positions of the sticky element to the current state by using the updated
 * rectangles.
 */
MdStickyElement.prototype.updatePositions = function() {
  this.updateRectangles();

  if (this.isSticky) {
    this.createHeightOffset();

    this.element.css('position', 'fixed');
    this.element.css('top', this.viewportTop + 'px');
    this.element.css('max-width', this.parentRect.width + 'px');
    this.element.css(this.transformProp, 'translate3d(0, 0, 0)');
  } else {
    this.offsetEl.remove();

    /* Store the current position in a relative transform expression. */
    var positionTransform = this.buildPositionTransform();

    this.element.css('position', '');
    this.element.css('top', '');
    this.element.css('max-width', '');
    this.element.css(this.transformProp, positionTransform);
  }
};

/**
 * Determines from recalculated rectangles whether the fixed sticky element
 * is leaving the current scroll viewport.
 * @returns {boolean} Whether it left the scroll viewport or not.
 */
MdStickyElement.prototype.isLeavingViewport = function() {
  if (!this.isSticky) {
    return false;
  }

  // TODO: implement that logic.

  this.updateRectangles();

  return this.elementRect.top < this.viewportTop ||
         this.elementRect.bottom > this.viewportBottom;
};

/**
 * @ngdoc method
 * @name $mdSticky#isElementVisible
 * @description
 *
 * Determines from the scroll position and the scroll offsets whether
 * the sticky element is fully visible in the scroll container or not.
 *
 * @returns {boolean} Whether the sticky element is visible or not.
 */
MdStickyElement.prototype.isElementVisible = function() {
  var scrollY = this.viewportContainer.getScrollPosition();
  var scrollBottom = this.scrollBottom - this.elementRect.height;

  return scrollY >= this.scrollTop && scrollY <= scrollBottom;
};

/**
 * Creates an empty element to fill the missing height in the parent.
 * Necessary when the sticky element changes to a fixed position.
 */
MdStickyElement.prototype.createHeightOffset = function() {
  this.offsetEl = angular.element('<div>');

  this.offsetEl.css('height', this.elementRect.height + 'px');

  this.domElement.parentNode.insertBefore(this.offsetEl[0], this.domElement);
};

/**
 * Resolves the user specified values for the sticky boundary.
 * Sticky elements can be bound to the top or bottom.
 * @returns {{top: number, bottom: number}}
 */
MdStickyElement.prototype.getUserPositionRect = function(element) {
  var computedStyle = getComputedStyle(element);

  return {
    top: _getPositionValue(computedStyle.top),
    bottom: _getPositionValue(computedStyle.bottom)
  };

  function _getPositionValue(property) {
    return property !== 'auto' ? parseInt(property) : null;
  }
};

/**
 * Create a transform for sticky element to move at the correct position in the parent.
 * Determines the new static position from the current fixed position.
 * @returns {string} Transform expression for the static position.
 */
MdStickyElement.prototype.buildPositionTransform = function() {
  var offsetY = 0;

  if (this.parentRect.top < this.viewportTop) {
    offsetY = this.parentRect.height - this.elementRect.height;
  }

  return 'translate3d(0, ' + offsetY + 'px, 0)';
};

/**
 * If the current parent element is above the scroll container, the sticky elements need
 * to be moved down to the bottom. This is not necessary for parent elements below
 * the scroll container, because those are by default at the top.
 */
MdStickyElement.prototype.updateElementPosition = function() {
  if (this.isSticky) {
    return;
  }

  this.element.css(this.transformProp, this.buildPositionTransform());
};

/**
 * Walks the DOM tree up and searches for the nearest scroll parent.
 * If none could be found the browsers window will be used.
 * @returns {ScrollContainer[]} Sorted list of scroll containers.
 */
MdStickyElement.prototype.findScrollContainers = function() {
  var scrollRegex = /(scroll|auto)/;
  var parentEl = this.domElement;

  var scrollContainers = [];

  while ((parentEl = parentEl.parentNode) !== null && parentEl.nodeType === 1) {

    var style = getComputedStyle(parentEl);
    var overflowExpression = style.overflow + style.overflowX + style.overflowY;

    if (scrollRegex.test(overflowExpression)) {
      scrollContainers.push(new ScrollContainer(parentEl));
    }
  }

  scrollContainers.push(new ScrollContainer(window));

  return scrollContainers;
};

/**
 * Creates a wrapper for a given DOM node, which can be either the Window node or a normal
 * HTML element.
 * @constructor
 */
function ScrollContainer(element) {
  this.element = element;
}

/**
 * Determines the vertical scroll position of the scroll container.
 * @returns {number}
 */
ScrollContainer.prototype.getScrollPosition = function() {
  return this.element.scrollTop || this.element.scrollY || this.element.pageYOffset || 0;
};

/**
 * Returns a client rectangle for the scroll container.
 * @returns {ClientRect|Object} Rectangle-like object.
 */
ScrollContainer.prototype.getClientRect = function() {
  if (this.element.nodeType !== Node.ELEMENT_NODE) {
    return { top: 0, right: 0, bottom: 0, left: 0 }
  } else {
    return this.element.getBoundingClientRect();
  }
};