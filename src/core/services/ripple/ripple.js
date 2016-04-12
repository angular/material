/**
 * @ngdoc module
 * @name material.core.ripple
 * @description
 * Ripple
 */
angular.module('material.core')
    .factory('$mdInkRipple', InkRippleService)
    .directive('mdInkRipple', InkRippleDirective)
    .directive('mdNoInk', attrNoDirective)
    .directive('mdNoBar', attrNoDirective)
    .directive('mdNoStretch', attrNoDirective);

var DURATION = 450;

/**
 * @ngdoc directive
 * @name mdInkRipple
 * @module material.core.ripple
 *
 * @description
 * The `md-ink-ripple` directive allows you to specify the ripple color or id a ripple is allowed.
 *
 * @param {string|boolean} md-ink-ripple A color string `#FF0000` or boolean (`false` or `0`) for preventing ripple
 *
 * @usage
 * ### String values
 * <hljs lang="html">
 *   <ANY md-ink-ripple="#FF0000">
 *     Ripples in red
 *   </ANY>
 *
 *   <ANY md-ink-ripple="false">
 *     Not rippling
 *   </ANY>
 * </hljs>
 *
 * ### Interpolated values
 * <hljs lang="html">
 *   <ANY md-ink-ripple="{{ randomColor() }}">
 *     Ripples with the return value of 'randomColor' function
 *   </ANY>
 *
 *   <ANY md-ink-ripple="{{ canRipple() }}">
 *     Ripples if 'canRipple' function return value is not 'false' or '0'
 *   </ANY>
 * </hljs>
 */
function InkRippleDirective ($mdButtonInkRipple, $mdCheckboxInkRipple) {
  return {
    controller: angular.noop,
    link:       function (scope, element, attr) {
      attr.hasOwnProperty('mdInkRippleCheckbox')
          ? $mdCheckboxInkRipple.attach(scope, element)
          : $mdButtonInkRipple.attach(scope, element);
    }
  };
}

/**
 * @ngdoc service
 * @name $mdInkRipple
 * @module material.core.ripple
 *
 * @description
 * `$mdInkRipple` is a service for adding ripples to any element
 *
 * @usage
 * <hljs lang="js">
 * app.factory('$myElementInkRipple', function($mdInkRipple) {
 *   return {
 *     attach: function (scope, element, options) {
 *       return $mdInkRipple.attach(scope, element, angular.extend({
 *         center: false,
 *         dimBackground: true
 *       }, options));
 *     }
 *   };
 * });
 *
 * app.controller('myController', function ($scope, $element, $myElementInkRipple) {
 *   $scope.onClick = function (ev) {
 *     $myElementInkRipple.attach($scope, angular.element(ev.target), { center: true });
 *   }
 * });
 * </hljs>
 */

/**
 * @ngdoc method
 * @name $mdInkRipple#attach
 *
 * @description
 * Attaching given scope, element and options to inkRipple controller
 *
 * @param {object=} scope Scope within the current context
 * @param {object=} element The element the ripple effect should be applied to
 * @param {object=} options (Optional) Configuration options to override the defaultRipple configuration
 * * `center` -  Whether the ripple should start from the center of the container element
 * * `dimBackground` - Whether the background should be dimmed with the ripple color
 * * `colorElement` - The element the ripple should take its color from, defined by css property `color`
 * * `fitRipple` - Whether the ripple should fill the element
 */
function InkRippleService ($injector) {
  return { attach: attach };
  function attach (scope, element, options) {
    if (element.controller('mdNoInk')) return angular.noop;
    return $injector.instantiate(InkRippleCtrl, {
      $scope:        scope,
      $element:      element,
      rippleOptions: options
    });
  }
}

/**
 * Controller used by the ripple service in order to apply ripples
 * @ngInject
 */
function InkRippleCtrl ($scope, $element, rippleOptions, $window, $document, $timeout, $mdUtil, $mdConstant) {
  this.$window         = $window;
  this.$document       = $document;
  this.$timeout        = $timeout;
  this.$mdUtil         = $mdUtil;
  this.$mdConstant     = $mdConstant;
  this.$scope          = $scope;
  this.options         = rippleOptions;
  this.explode         = rippleOptions.inkExplode || false;
  this.$element        = $element;
  this.containerParent = null;
  this.updateContainerParent(); //initialize containerParent
  this.mousedown  = false;
  this.ripples    = [];
  this.timeout    = null; // Stores a reference to the most-recent ripple timeout
  this.lastRipple = null;
  this.duration   = null;
  this.updateDuration(); //initialize duration


  $mdUtil.valueOnUse(this, 'container', this.createContainer);

  this.$element.addClass('md-ink-ripple');

  // attach method for unit tests
  var ctrl                   = this.$element.controller('mdInkRipple') || this.$element.controller('mdInkExplode') || {};
  ctrl.createRipple          = angular.bind(this, this.createRipple);
  ctrl.setColor              = angular.bind(this, this.color);
  ctrl.createRippleFromEvent = angular.bind(this, createRippleFromEvent, this);

  this.bindEvents();
}


/**
 * Either remove or unlock any remaining ripples when the user mouses off of the element (either by
 * mouseup or mouseleave event)
 */
function autoCleanup (self, cleanupFn) {

  if ( self.mousedown || self.lastRipple ) {
    self.mousedown = false;
    self.$mdUtil.nextTick( angular.bind(self, cleanupFn), false);
  }

}


/**
 * Returns the color that the ripple should be (either based on CSS or hard-coded)
 * @returns {string}
 */
InkRippleCtrl.prototype.color = function (value) {
  var self = this;

  // If assigning a color value, apply it to background and the ripple color
  if (angular.isDefined(value)) {
    self._color = self._parseColor(value);
  }

  if (self.explode) {
    return self._color || self._parseColor( this.$element.attr('md-ink-explode-color') )
           || self._parseColor( self.inkRipple() ) || self._parseColor( getElementColor() );
  }
  // If color lookup, use assigned, defined, or inherited
  return self._color || self._parseColor( self.inkRipple() ) || self._parseColor( getElementColor() );

  /**
   * Finds the color element and returns its text color for use as default ripple color
   * @returns {string}
   */
  function getElementColor () {
    var items = self.options && self.options.colorElement ? self.options.colorElement : [];
    var elem  = items.length ? items[ 0 ] : self.containerParent[ 0 ];

    return elem ? self.$window.getComputedStyle(elem).color : 'rgb(0,0,0)';
  }
};

/**
 * Updating the ripple colors based on the current inkRipple value
 * or the element's computed style color
 */
InkRippleCtrl.prototype.calculateColor = function () {
  return this.color();
};


/**
 * Takes a string color and converts it to RGBA format
 * @param color {string}
 * @param [multiplier] {int}
 * @returns {string}
 */

InkRippleCtrl.prototype._parseColor = function parseColor (color, multiplier) {
  multiplier = multiplier || 1;

  if (!color) return;
  if (color.indexOf('rgba') === 0) return color.replace(/\d?\.?\d*\s*\)\s*$/, (0.1 * multiplier).toString() + ')');
  if (color.indexOf('rgb') === 0) return rgbToRGBA(color);
  if (color.indexOf('#') === 0) return hexToRGBA(color);

  /**
   * Converts hex value to RGBA string
   * @param color {string}
   * @returns {string}
   */
  function hexToRGBA (color) {
    var hex   = color[ 0 ] === '#' ? color.substr(1) : color,
      dig   = hex.length / 3,
      red   = hex.substr(0, dig),
      green = hex.substr(dig, dig),
      blue  = hex.substr(dig * 2);
    if (dig === 1) {
      red += red;
      green += green;
      blue += blue;
    }
    return 'rgba(' + parseInt(red, 16) + ',' + parseInt(green, 16) + ',' + parseInt(blue, 16) + ',0.1)';
  }

  /**
   * Converts an RGB color to RGBA
   * @param color {string}
   * @returns {string}
   */
  function rgbToRGBA (color) {
    return color.replace(')', ', 0.1)').replace('(', 'a(');
  }

};

/**
 * Binds events to the root element for
 */
InkRippleCtrl.prototype.bindEvents = function () {
  this.$element.on('mousedown', angular.bind(this, this.handleMousedown));
  this.$element.on('mouseup touchend', angular.bind(this, this.handleMouseup));
  this.$element.on('mouseleave', angular.bind(this, this.handleMouseleave));
  this.$element.on('touchmove', angular.bind(this, this.handleTouchmove));
};

/**
 * Create a new ripple on every mousedown event from the root element
 * @param event {MouseEvent}
 */
InkRippleCtrl.prototype.handleMousedown = function (event) {
  if ( this.mousedown ) return;
  this.mousedown = true;
  //Return and wait until mouseup if this is an explode ripple
  if (this.explode) return;
  createRippleFromEvent(this, event);
};

/**
 * If this instance is an explode create the ripple, otherwise,
 * Either remove or unlock any remaining ripples when the user mouses off of the element (either by
 * mouseup, touchend or mouseleave event)
 */
InkRippleCtrl.prototype.handleMouseup = function (event) {
  //If this is an explode ripple and it is not a right click create the ripple
  if (this.explode && event.which !== this.$mdConstant.KEY_CODE.RIGHT_CLICK) {
    this.mousedown = false;
    // When jQuery is loaded, we have to get the original event
    createRippleFromEvent(this, event);
  } else {
    autoCleanup(this, this.clearRipples);
  }
};

/**
 * Take an event and create the ripple from it.
 * @param event
 */
function createRippleFromEvent (self, event) {
  if (event.hasOwnProperty('originalEvent')) event = event.originalEvent;
  self.updateContainerParent();
  self.updateDuration();
  if (self.options.center) {
    self.createRipple(self.container.prop('clientWidth') / 2, self.container.prop('clientWidth') / 2);
  } else {
    // We need to calculate the relative coordinates if the target is a sublayer of the ripple element
    if (event.srcElement !== self.containerParent[ 0 ]) {
      var layerRect = self.containerParent[ 0 ].getBoundingClientRect();
      var layerX    = event.clientX - layerRect.left;
      var layerY    = event.clientY - layerRect.top;

      self.createRipple(layerX, layerY);
    } else {
      self.createRipple(event.offsetX, event.offsetY);
    }
  }
}

/**
 * Either remove or unlock any remaining ripples when the user mouses off of the element (by
 * mouseleave)
 */
InkRippleCtrl.prototype.handleMouseleave = function () {
  autoCleanup(this, this.clearRipples);
};

/**
 * Either remove or unlock any remaining ripples when the user mouses off of the element (by
 * touchmove)
 */
InkRippleCtrl.prototype.handleTouchmove = function () {
  autoCleanup(this, this.deleteRipples);
};

/**
 * Cycles through all ripples and attempts to remove them.
 */
InkRippleCtrl.prototype.deleteRipples = function () {
  for (var i = 0; i < this.ripples.length; i++) {
    this.ripples[ i ].remove();
  }
};

/**
 * Cycles through all ripples and attempts to remove them with fade.
 * Depending on logic within `fadeInComplete`, some removals will be postponed.
 */
InkRippleCtrl.prototype.clearRipples = function () {
  for (var i = 0; i < this.ripples.length; i++) {
    this.fadeInComplete(this.ripples[ i ]);
  }
};
/**
 * Check the md-ink-explode-dur attribute for modification and update the duration
 * @returns {*}
 */
InkRippleCtrl.prototype.updateDuration = function () {
  this.duration = parseInt(this.$element.attr('md-ink-explode-duration')) || DURATION;
  return this.duration;
};
/**
 * Creates the ripple container element
 * @returns {*}
 */
InkRippleCtrl.prototype.createContainer = function () {
  var container = this.getContainer();
  if (!container) {
    container = angular.element('<div class="md-ripple-container"></div>');
    this.containerParent.append(container);
  }
  return container;
};

/**
 * Look for an existing container in the containerParent
 * @returns {*}
 */
InkRippleCtrl.prototype.getContainer = function () {
  //Check the attribute for modification
  this.updateContainerParent();
  var container;
  if ( !this.containerParent ) return;
  var children = this.containerParent.children();
  angular.forEach(children, function (child) {
    if ( angular.element(child).hasClass('md-ripple-container') ) {
      container = angular.element(child);
    }
  });
  return container;
};

/**
 * Check the md-ink-explode attribute for modification and update the container element
 * @returns {*}
 */
InkRippleCtrl.prototype.updateContainerParent = function() {
  var selector = this.inkExplode();
  if (!selector && !this._lastExplodeSelector) {
    this.containerParent = this.$element;
    return this.containerParent;
  }
  if (selector !== this._lastExplodeSelector) {
    this._lastExplodeSelector = selector;
    //Remove the old container
    var oldContainer = this.getContainer();
    if (oldContainer) {
      oldContainer.remove();
    }
    if (selector && selector !== '') {
      this.containerParent = angular.isElement(selector) ? selector : this.$document[0].querySelector(selector);
      this.containerParent = angular.element(this.containerParent);
    }
    this.createContainer();
  }
  return this.containerParent;
};
InkRippleCtrl.prototype.clearTimeout = function () {
  if (this.timeout) {
    this.$timeout.cancel(this.timeout);
    this.timeout = null;
  }
};

InkRippleCtrl.prototype.isRippleAllowed = function () {
  var element = this.$element[0];
  do {
    if (!element.tagName || element.tagName === 'BODY') break;

    if (element && angular.isFunction(element.hasAttribute)) {
      if (element.hasAttribute('disabled')) return false;
      if (this.inkRipple() === 'false' || this.inkRipple() === '0' ||
          this.inkExplode() === 'false' || this.inkExplode() === '0' ) return false;
    }

  } while (element = element.parentNode);
  return true;
};

/**
 * The attribute `md-ink-ripple` may be a static or interpolated
 * color value OR a boolean indicator (used to disable ripples)
 */
InkRippleCtrl.prototype.inkRipple = function () {
  return this.$element.attr('md-ink-ripple');
};
/**
 * The attribute `md-ink-explode` may be a static or interpolated
 * color value OR a boolean indicator (used to disable ripples)
 */
InkRippleCtrl.prototype.inkExplode = function () {
  return this.$element.attr('md-ink-explode');
};

/**
 * Creates a new ripple and adds it to the container.  Also tracks ripple in `this.ripples`.
 * @param left
 * @param top
 */
InkRippleCtrl.prototype.createRipple = function (left, top) {
  if (!this.isRippleAllowed()) return;

  var ctrl   = this;
  var ripple = angular.element('<div class="md-ripple"></div>');
  var width  = this.containerParent.prop('clientWidth');
  var height = this.containerParent.prop('clientHeight');
  var x      = Math.max(Math.abs(width - left), left) * 2;
  var y      = Math.max(Math.abs(height - top), top) * 2;
  var size   = getSize(this.options.fitRipple, x, y);
  var color  = this.calculateColor();
  this.explode && ripple.addClass('md-ripple-explode');

  ripple.css({
    left:            left + 'px',
    top:             top + 'px',
    background:      'black',
    width:           size + 'px',
    height:          size + 'px',
    backgroundColor: rgbaToRGB(color),
    borderColor:     rgbaToRGB(color)
  });
  this.lastRipple = ripple;

  // we only want one timeout to be running at a time
  this.clearTimeout();
  this.timeout = this.$timeout(function () {
    ctrl.clearTimeout();
    if (!ctrl.mousedown && !ctrl.explode) ctrl.fadeInComplete(ripple);
  }, ctrl.duration * .35, false);

  if (this.options.dimBackground) this.container.css({ backgroundColor: color });
  this.container.append(ripple);
  this.ripples.push(ripple);
  ripple.addClass('md-ripple-placed');

  this.$mdUtil.nextTick(function () {

    ripple.addClass('md-ripple-scaled md-ripple-active');
    ctrl.$timeout(function () {
      ctrl.clearRipples();
    }, ctrl.duration, false);

  }, false);

  function rgbaToRGB (color) {
    return color
        ? color.replace('rgba', 'rgb').replace(/,[^\),]+\)/, ')')
        : 'rgb(0,0,0)';
  }

  function getSize (fit, x, y) {
    return fit
        ? Math.max(x, y)
        : Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
  }
};



/**
 * After fadeIn finishes, either kicks off the fade-out animation or queues the element for removal on mouseup
 * @param ripple
 */
InkRippleCtrl.prototype.fadeInComplete = function (ripple) {
  if (this.lastRipple === ripple) {
    if (!this.timeout && !this.mousedown) {
      this.removeRipple(ripple);
    }
  } else {
    this.removeRipple(ripple);
  }
};

/**
 * Kicks off the animation for removing a ripple
 * @param ripple {Element}
 */
InkRippleCtrl.prototype.removeRipple = function (ripple) {
  var ctrl  = this;
  var index = this.ripples.indexOf(ripple);
  if (index < 0) return;
  this.ripples.splice(this.ripples.indexOf(ripple), 1);
  ripple.removeClass('md-ripple-active');
  if (this.ripples.length === 0) this.container.css({ backgroundColor: '' });
  // use a 2-second timeout in order to allow for the animation to finish
  // we don't actually care how long the animation takes
  this.$timeout(function () {
    ctrl.fadeOutComplete(ripple);
  }, ctrl.duration, false);
};

/**
 * Removes the provided ripple from the DOM
 * @param ripple
 */
InkRippleCtrl.prototype.fadeOutComplete = function (ripple) {
  ripple.remove();
  if (this.lastRipple === ripple) {
    this.lastRipple = null;
  }
};

/**
 * Used to create an empty directive.  This is used to track flag-directives whose children may have
 * functionality based on them.
 *
 * Example: `md-no-ink` will potentially be used by all child directives.
 */
function attrNoDirective () {
  return { controller: angular.noop };
}
